import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import { createStore } from "./server/store";
import { requireAdmin, issueAdminToken, verifyAdminPassword, adminAuthStatus } from "./server/auth";
import { rateLimit } from "./server/rateLimit";
import { clean, cleanSlug } from "./server/sanitize";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Helper to call Gemini with automatic model fallback and retry for high demand / transient 503/429 errors
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    tools?: any;
    toolConfig?: any;
  }
) {
  // Ordered list of models to try in case of temporary 503 high demand or rate limits
  const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        ...params,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const isUnavailable =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes("503") ||
        err?.message?.includes("429") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("UNAVAILABLE");

      console.warn(`[Gemini API] Model ${model} encountered error (transient: ${isUnavailable}):`, err.message || err);
      // Wait a short delay before trying the next model
      await new Promise((res) => setTimeout(res, 350));
    }
  }

  throw lastError || new Error("All candidate Gemini models were temporarily unavailable.");
}

// Persistent storage for published portfolios and contact inquiries (JSON file on disk)
const store = createStore(process.env.DATA_DIR || path.join(process.cwd(), "data"));
const publishedPortfolios = store.portfolios;
const inquiries = store.inquiries;

// Basic security headers for every response
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

const aiLimiter = rateLimit({ windowMs: 60_000, max: 20, name: "ai" });
const writeLimiter = rateLimit({ windowMs: 60_000, max: 30, name: "write" });
const seedLimiter = rateLimit({ windowMs: 60_000, max: 120, name: "sync" });
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, name: "admin-login" });

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Portfolio Maldives API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    adminAuth: adminAuthStatus(),
    portfolios: publishedPortfolios.size,
    timestamp: new Date().toISOString(),
  });
});

// API: List published portfolios
app.get("/api/portfolios", (req, res) => {
  const list = Array.from(publishedPortfolios.values());
  res.json({ portfolios: list, count: list.length });
});

// API: Get portfolio by slug
app.get("/api/portfolios/:slug", (req, res) => {
  const slug = cleanSlug(req.params.slug);
  const portfolio = publishedPortfolios.get(slug);
  if (!portfolio) {
    return res.status(404).json({ error: "Portfolio not found" });
  }
  portfolio.viewsCount = (portfolio.viewsCount || 0) + 1;
  store.savePortfolio(slug, portfolio);
  res.json({ portfolio });
});

// API: Publish or update portfolio
app.post("/api/portfolios/publish", writeLimiter, (req, res) => {
  const profileData = req.body;
  if (!profileData || typeof profileData.slug !== "string" || !profileData.fullName) {
    return res.status(400).json({ error: "Invalid profile data. Slug and Full Name are required." });
  }

  const slug = cleanSlug(profileData.slug);
  if (!slug) {
    return res.status(400).json({ error: "Invalid slug." });
  }
  const existing = publishedPortfolios.get(slug);

  const updatedProfile = {
    ...profileData,
    slug,
    // Moderation fields are controlled by administrators only and cannot be set by a publish request.
    role: existing?.role ?? "user",
    verified: existing?.verified ?? false,
    isVerified: existing?.isVerified ?? false,
    isFeatured: existing?.isFeatured ?? false,
    status: existing?.status ?? "active",
    viewsCount: existing?.viewsCount ?? profileData.viewsCount ?? 0,
    isPublished: true,
    publishedAt: existing?.publishedAt || profileData.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.savePortfolio(slug, updatedProfile);
  res.json({ success: true, slug, portfolio: updatedProfile });
});

// API: Sync initial profiles from client seed (only adds slugs the server has never seen)
app.post("/api/portfolios/sync-seed", seedLimiter, (req, res) => {
  const { profiles } = req.body || {};
  if (Array.isArray(profiles)) {
    for (const p of profiles.slice(0, 200)) {
      const slug = typeof p?.slug === "string" ? cleanSlug(p.slug) : "";
      if (slug && !publishedPortfolios.has(slug) && p.role !== "admin") {
        store.savePortfolio(slug, { ...p, slug });
      }
    }
  }
  res.json({ success: true, count: publishedPortfolios.size });
});

// API: Send contact inquiry
app.post("/api/portfolios/inquiry", writeLimiter, (req, res) => {
  const { portfolioSlug, senderName, senderEmail, senderCompany, subject, message } = req.body || {};
  if (!portfolioSlug || !senderName || !senderEmail || !message) {
    return res.status(400).json({ error: "Missing required contact inquiry fields." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(senderEmail))) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const newInquiry = {
    id: "inq_" + Math.random().toString(36).substring(2, 9),
    portfolioSlug: cleanSlug(portfolioSlug),
    senderName: clean(senderName, 120),
    senderEmail: clean(senderEmail, 200),
    senderCompany: senderCompany ? clean(senderCompany, 160) : undefined,
    subject: clean(subject, 200) || "Portfolio Maldives Inquiry",
    message: clean(message, 5000),
    createdAt: new Date().toISOString(),
  };

  store.addInquiry(newInquiry);
  res.json({
    success: true,
    message: `Inquiry successfully delivered to the professional's Portfolio Maldives inbox.`,
    inquiryId: newInquiry.id,
  });
});

// ADMIN API: Sign in with the administrator password and receive a signed session token
app.post("/api/admin/login", loginLimiter, (req, res) => {
  const { password } = req.body || {};
  const result = verifyAdminPassword(typeof password === "string" ? password : "");
  if ("error" in result) {
    return res.status(result.status).json({ error: result.error });
  }
  res.json({ success: true, ...issueAdminToken() });
});

// Every other /api/admin route requires a valid admin token
app.use("/api/admin", requireAdmin);

// ADMIN API: Get all inquiries
app.get("/api/admin/inquiries", (req, res) => {
  res.json({ inquiries: inquiries.slice().reverse(), count: inquiries.length });
});

function updateProfile(req: Request, res: Response, mutate: (profile: any) => void) {
  const slug = cleanSlug(req.body?.slug);
  if (!slug) {
    return res.status(400).json({ error: "Slug is required." });
  }
  const profile = publishedPortfolios.get(slug);
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  mutate(profile);
  profile.updatedAt = new Date().toISOString();
  store.savePortfolio(slug, profile);
  return res.json({ success: true, profile });
}

// ADMIN API: Verify / Unverify specialist
app.post("/api/admin/verify", (req, res) => {
  updateProfile(req, res, (profile) => {
    profile.verified = Boolean(req.body.verified);
    profile.isVerified = Boolean(req.body.verified);
  });
});

// ADMIN API: Feature / Unfeature specialist
app.post("/api/admin/feature", (req, res) => {
  updateProfile(req, res, (profile) => {
    profile.isFeatured = Boolean(req.body.isFeatured);
  });
});

// ADMIN API: Moderate / Status update
app.post("/api/admin/status", (req, res) => {
  const { status, isPublished } = req.body || {};
  if (status !== undefined && !["active", "pending_review", "suspended"].includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }
  updateProfile(req, res, (profile) => {
    if (status !== undefined) profile.status = status;
    if (isPublished !== undefined) profile.isPublished = Boolean(isPublished);
  });
});

// ADMIN API: Update user role (admin vs user)
app.post("/api/admin/user-role", (req, res) => {
  const { role } = req.body || {};
  if (role !== "admin" && role !== "user") {
    return res.status(400).json({ error: "Role must be 'admin' or 'user'." });
  }
  updateProfile(req, res, (profile) => {
    profile.role = role;
  });
});

// ADMIN API: Provision new user/admin
app.post("/api/admin/create-user", (req, res) => {
  const profileData = req.body;
  if (!profileData || typeof profileData.slug !== "string" || !profileData.fullName) {
    return res.status(400).json({ error: "Slug and full name are required." });
  }

  const slug = cleanSlug(profileData.slug);
  if (!slug) {
    return res.status(400).json({ error: "Invalid slug." });
  }
  const newProfile = {
    ...profileData,
    slug,
    isPublished: profileData.isPublished ?? true,
    publishedAt: profileData.publishedAt || new Date().toISOString(),
    createdAt: profileData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.savePortfolio(slug, newProfile);
  res.json({ success: true, profile: newProfile });
});

// ADMIN API: Delete specialist profile
app.delete("/api/admin/portfolios/:slug", (req, res) => {
  const slug = cleanSlug(req.params.slug);
  if (!slug) {
    return res.status(400).json({ error: "Slug is required." });
  }

  if (store.deletePortfolio(slug)) {
    return res.json({ success: true, message: `Profile ${slug} removed by administrator.` });
  }

  res.json({ success: true, message: "Profile already removed or not found." });
});

// API: AI Bio Enhancer
app.post("/api/ai/enhance-bio", aiLimiter, async (req, res) => {
  const body = req.body || {};
  const fullName = clean(body.fullName, 120);
  const currentTitle = clean(body.currentTitle, 160);
  const industry = clean(body.industry, 160);
  const atoll = clean(body.atoll, 120);
  const rawBio = clean(body.rawBio, 3000);
  const keyStrengths = clean(body.keyStrengths, 1000);
  const tone = clean(body.tone, 80);

  const fallbackBio = `${fullName || "The professional"} is an accomplished ${currentTitle || "specialist"} based in ${atoll || "the Maldives"}, bringing deep domain expertise across ${industry || "key sectors"}. Known for strategic precision, high-impact contributions, and consistent leadership throughout island operations and enterprise projects.${rawBio ? "\n\n" + rawBio : ""}`;

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ enhancedBio: fallbackBio, isFallback: true });
  }

  try {
    const prompt = `You are an elite career strategist and executive copywriter specializing in high-end CVs and portfolios for the Maldivian market (encompassing Luxury Resorts & Hospitality, Marine Conservation & Diving, Modern Tech & Startups, Creative Design, Aviation/Maritime, and Public Sector).

Write a compelling, professional, first-person or third-person summary/bio (approx 120-180 words) for the following Maldivian professional:
- Full Name: ${fullName}
- Professional Title: ${currentTitle}
- Industry: ${industry}
- Location: ${atoll || "Maldives"}
- Key Strengths / Highlights: ${keyStrengths || "Not specified"}
- Desired Tone: ${tone || "Executive & Sophisticated"}
- Existing Raw Draft: "${rawBio || ""}"

Requirements:
- Make it sound distinguished, articulate, and impactful.
- Reflect relevant prestige and Maldivian context where fitting (e.g. island operations, high-end guest experience, marine stewardship, fintech innovation).
- Provide ONLY the polished bio text without conversational preamble or markdown code fences.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
    });

    const enhancedBio = response.text?.trim() || fallbackBio;
    res.json({ enhancedBio, isFallback: false });
  } catch (error: any) {
    console.error("Gemini Bio Enhancement Fallback Triggered:", error?.message || error);
    // Graceful fallback so user request succeeds even during upstream platform spikes
    res.json({
      enhancedBio: fallbackBio,
      isFallback: true,
      notice: "Generated using Maldivian career template while AI service is experiencing high traffic.",
    });
  }
});

// API: AI Bullet Point Enhancer
app.post("/api/ai/enhance-bullet", aiLimiter, async (req, res) => {
  const body = req.body || {};
  const role = clean(body.role, 160);
  const company = clean(body.company, 160);
  const rawBullet = clean(body.rawBullet, 1000);
  const industry = clean(body.industry, 160);

  const fallbackBullets = [
    `Spearheaded core operations as ${role || "Specialist"} at ${company || "Maldivian Organization"}, achieving measurable efficiency and elevated performance across ${industry || "key projects"}.`,
    `Delivered strategic milestones and collaborated with cross-functional teams at ${company || "the company"} to optimize service delivery.`,
  ];

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ suggestions: fallbackBullets, isFallback: true });
  }

  try {
    const prompt = `You are a resume optimizer. Rewrite this job bullet point into 2 strong, high-impact bullet statements with active action verbs and measurable results:
Role: ${role}
Company/Resort/Org: ${company}
Industry: ${industry}
Draft Bullet: "${rawBullet}"

Return a JSON array of strings containing 2 polished alternatives.
Example format:
["Spearheaded luxury guest culinary operations across 3 resort villas, improving review ratings by 24%.", "Orchestrated sustainable kitchen sourcing program collaborating with local Maldivian fisheries."]`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let suggestions: string[] = [];
    try {
      const parsed = JSON.parse(response.text || "[]");
      suggestions = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 4) : [];
      if (suggestions.length === 0) suggestions = fallbackBullets;
    } catch {
      suggestions = [response.text?.trim() || rawBullet];
    }

    res.json({ suggestions, isFallback: false });
  } catch (error: any) {
    console.error("Gemini Bullet Enhancement Fallback Triggered:", error?.message || error);
    res.json({ suggestions: fallbackBullets, isFallback: true });
  }
});

// API: AI Skill and Certification Advisor
app.post("/api/ai/suggest-skills", aiLimiter, async (req, res) => {
  const body = req.body || {};
  const industry = clean(body.industry, 160);
  const title = clean(body.title, 160);

  const fallbackData = {
    skills: ["Strategic Planning", "Project Management", "Team Leadership", "Cross-functional Collaboration", "Industry Operations", "Quality Assurance"],
    certifications: ["Professional Membership", "Advanced Industry Qualification"],
    isFallback: true,
  };

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallbackData);
  }

  try {
    const prompt = `Provide a curated list of top technical and industry skills and relevant professional certifications/licenses for a "${title}" in the "${industry}" sector in the Maldives.
Return JSON with this structure:
{
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
  "certifications": ["Cert 1", "Cert 2", "Cert 3"]
}`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      skills: Array.isArray(parsed.skills) ? parsed.skills : fallbackData.skills,
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : fallbackData.certifications,
      isFallback: false,
    });
  } catch (error: any) {
    console.error("Gemini Suggest Skills Fallback Triggered:", error?.message || error);
    res.json(fallbackData);
  }
});

// Setup Vite or static serving
async function startServer() {
  app.use("/api", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Hashed build assets can be cached forever; everything else briefly.
    app.use("/assets", express.static(path.join(distPath, "assets"), { immutable: true, maxAge: "1y" }));
    app.use(express.static(distPath, { index: false, maxAge: "1h" }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio Maldives server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
