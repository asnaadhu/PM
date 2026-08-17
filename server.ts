import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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

// In-memory published portfolios storage (synced with client updates)
const publishedPortfolios = new Map<string, any>();

// In-memory contact inquiries
const inquiries: Array<{
  id: string;
  portfolioSlug: string;
  senderName: string;
  senderEmail: string;
  senderCompany?: string;
  subject: string;
  message: string;
  createdAt: string;
}> = [];

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Portfolio Maldives API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
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
  const { slug } = req.params;
  const portfolio = publishedPortfolios.get(slug);
  if (!portfolio) {
    return res.status(404).json({ error: "Portfolio not found" });
  }
  portfolio.viewsCount = (portfolio.viewsCount || 0) + 1;
  publishedPortfolios.set(slug, portfolio);
  res.json({ portfolio });
});

// API: Publish or update portfolio
app.post("/api/portfolios/publish", (req, res) => {
  const profileData = req.body;
  if (!profileData || !profileData.slug || !profileData.fullName) {
    return res.status(400).json({ error: "Invalid profile data. Slug and Full Name are required." });
  }

  const slug = profileData.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
  const updatedProfile = {
    ...profileData,
    slug,
    isPublished: true,
    publishedAt: profileData.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  publishedPortfolios.set(slug, updatedProfile);
  res.json({ success: true, slug, portfolio: updatedProfile });
});

// API: Sync initial profiles from client seed
app.post("/api/portfolios/sync-seed", (req, res) => {
  const { profiles } = req.body;
  if (Array.isArray(profiles)) {
    for (const p of profiles) {
      if (p.slug && !publishedPortfolios.has(p.slug)) {
        publishedPortfolios.set(p.slug, p);
      }
    }
  }
  res.json({ success: true, count: publishedPortfolios.size });
});

// API: Send contact inquiry
app.post("/api/portfolios/inquiry", (req, res) => {
  const { portfolioSlug, senderName, senderEmail, senderCompany, subject, message } = req.body;
  if (!portfolioSlug || !senderName || !senderEmail || !message) {
    return res.status(400).json({ error: "Missing required contact inquiry fields." });
  }

  const newInquiry = {
    id: "inq_" + Math.random().toString(36).substring(2, 9),
    portfolioSlug,
    senderName,
    senderEmail,
    senderCompany,
    subject: subject || "Portfolio Maldives Inquiry",
    message,
    createdAt: new Date().toISOString(),
  };

  inquiries.push(newInquiry);
  res.json({
    success: true,
    message: `Inquiry successfully delivered to the professional's Portfolio Maldives inbox.`,
    inquiryId: newInquiry.id,
  });
});

// ADMIN API: Get all inquiries
app.get("/api/admin/inquiries", (req, res) => {
  res.json({ inquiries: inquiries.slice().reverse(), count: inquiries.length });
});

// ADMIN API: Verify / Unverify specialist
app.post("/api/admin/verify", (req, res) => {
  const { slug, verified } = req.body;
  if (!slug) {
    return res.status(400).json({ error: "Slug is required." });
  }

  const profile = publishedPortfolios.get(slug);
  if (profile) {
    profile.verified = Boolean(verified);
    profile.isVerified = Boolean(verified);
    profile.updatedAt = new Date().toISOString();
    publishedPortfolios.set(slug, profile);
    return res.json({ success: true, profile });
  }

  res.status(404).json({ error: "Profile not found" });
});

// ADMIN API: Feature / Unfeature specialist
app.post("/api/admin/feature", (req, res) => {
  const { slug, isFeatured } = req.body;
  if (!slug) {
    return res.status(400).json({ error: "Slug is required." });
  }

  const profile = publishedPortfolios.get(slug);
  if (profile) {
    profile.isFeatured = Boolean(isFeatured);
    profile.updatedAt = new Date().toISOString();
    publishedPortfolios.set(slug, profile);
    return res.json({ success: true, profile });
  }

  res.status(404).json({ error: "Profile not found" });
});

// ADMIN API: Moderate / Status update
app.post("/api/admin/status", (req, res) => {
  const { slug, status, isPublished } = req.body;
  if (!slug) {
    return res.status(400).json({ error: "Slug is required." });
  }

  const profile = publishedPortfolios.get(slug);
  if (profile) {
    if (status !== undefined) profile.status = status;
    if (isPublished !== undefined) profile.isPublished = Boolean(isPublished);
    profile.updatedAt = new Date().toISOString();
    publishedPortfolios.set(slug, profile);
    return res.json({ success: true, profile });
  }

  res.status(404).json({ error: "Profile not found" });
});

// ADMIN API: Update user role (admin vs user)
app.post("/api/admin/user-role", (req, res) => {
  const { slug, role } = req.body;
  if (!slug || !role) {
    return res.status(400).json({ error: "Slug and role are required." });
  }

  const profile = publishedPortfolios.get(slug);
  if (profile) {
    profile.role = role;
    profile.updatedAt = new Date().toISOString();
    publishedPortfolios.set(slug, profile);
    return res.json({ success: true, profile });
  }

  res.status(404).json({ error: "Profile not found" });
});

// ADMIN API: Provision new user/admin
app.post("/api/admin/create-user", (req, res) => {
  const profileData = req.body;
  if (!profileData || !profileData.slug || !profileData.fullName) {
    return res.status(400).json({ error: "Slug and full name are required." });
  }

  const slug = profileData.slug.toLowerCase().trim();
  const newProfile = {
    ...profileData,
    slug,
    isPublished: profileData.isPublished ?? true,
    publishedAt: profileData.publishedAt || new Date().toISOString(),
    createdAt: profileData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  publishedPortfolios.set(slug, newProfile);
  res.json({ success: true, profile: newProfile });
});

// ADMIN API: Delete specialist profile
app.delete("/api/admin/portfolios/:slug", (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ error: "Slug is required." });
  }

  if (publishedPortfolios.has(slug)) {
    publishedPortfolios.delete(slug);
    return res.json({ success: true, message: `Profile ${slug} removed by administrator.` });
  }

  res.json({ success: true, message: "Profile already removed or not found." });
});

// API: AI Bio Enhancer
app.post("/api/ai/enhance-bio", async (req, res) => {
  const { fullName, currentTitle, industry, atoll, rawBio, keyStrengths, tone } = req.body;

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
app.post("/api/ai/enhance-bullet", async (req, res) => {
  const { role, company, rawBullet, industry } = req.body;

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
      suggestions = JSON.parse(response.text || "[]");
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
app.post("/api/ai/suggest-skills", async (req, res) => {
  const { industry, title } = req.body;

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
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio Maldives server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
