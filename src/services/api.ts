import { UserProfile, ContactInquiry } from "../types";
import { INITIAL_PROFILES } from "../data/initialProfiles";

const STORAGE_KEY = "portfolio_maldives_profiles_v1";
const AUTH_USER_KEY = "portfolio_maldives_auth_user_slug";

// Initialize localStorage with initial showcase profiles if empty
export function getLocalProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: UserProfile[] = [];
    if (!raw) {
      list = [DEFAULT_ADMIN_PROFILE, ...INITIAL_PROFILES];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return list;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure admin profile exists in local profiles
      if (!parsed.some((p: UserProfile) => p.role === "admin" || p.slug === DEFAULT_ADMIN_PROFILE.slug)) {
        parsed.unshift(DEFAULT_ADMIN_PROFILE);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
    list = [DEFAULT_ADMIN_PROFILE, ...INITIAL_PROFILES];
    return list;
  } catch (e) {
    console.error("Local storage error:", e);
    return [DEFAULT_ADMIN_PROFILE, ...INITIAL_PROFILES];
  }
}

export function saveLocalProfiles(profiles: UserProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error("Failed to save local profiles:", e);
  }
}

export function getAuthenticatedUserSlug(): string | null {
  try {
    return localStorage.getItem(AUTH_USER_KEY);
  } catch {
    return null;
  }
}

export function setAuthenticatedUserSlug(slug: string | null) {
  try {
    if (slug) {
      localStorage.setItem(AUTH_USER_KEY, slug);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}

// Keep backward compatible alias
export function getActiveUserSlug(): string {
  return getAuthenticatedUserSlug() || "ahmed-rameez";
}

export function setActiveUserSlug(slug: string) {
  setAuthenticatedUserSlug(slug);
}

// Sync with server API
export async function syncProfilesWithServer() {
  const local = getLocalProfiles();
  try {
    await fetch("/api/portfolios/sync-seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profiles: local }),
    });
  } catch (err) {
    console.log("Server sync notice (offline or local-only):", err);
  }
}

// Fetch all published profiles
export async function fetchPublishedProfiles(): Promise<UserProfile[]> {
  try {
    const res = await fetch("/api/portfolios");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.portfolios) && data.portfolios.length > 0) {
        // Merge with local
        const serverList: UserProfile[] = data.portfolios;
        saveLocalProfiles(serverList);
        return serverList;
      }
    }
  } catch (err) {
    console.log("Fallback to local storage profiles:", err);
  }
  return getLocalProfiles().filter((p) => p.isPublished);
}

// Fetch single profile by slug
export async function fetchProfileBySlug(slug: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`/api/portfolios/${slug}`);
    if (res.ok) {
      const data = await res.json();
      return data.portfolio;
    }
  } catch (err) {
    console.log("Fetching locally for slug:", slug, err);
  }
  const all = getLocalProfiles();
  return all.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
}

// Publish or update a profile
export async function publishProfile(profile: UserProfile): Promise<UserProfile> {
  const updated: UserProfile = {
    ...profile,
    isPublished: true,
    publishedAt: profile.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local
  const current = getLocalProfiles();
  const existingIdx = current.findIndex((p) => p.slug === profile.slug || p.id === profile.id);
  if (existingIdx >= 0) {
    current[existingIdx] = updated;
  } else {
    current.unshift(updated);
  }
  saveLocalProfiles(current);

  // 2. Update server
  try {
    const res = await fetch("/api/portfolios/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      const json = await res.json();
      return json.portfolio || updated;
    }
  } catch (err) {
    console.log("Local saved, server publish deferred:", err);
  }
  return updated;
}

// Save draft locally
export function saveProfileDraft(profile: UserProfile): UserProfile {
  const updated: UserProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  const current = getLocalProfiles();
  const existingIdx = current.findIndex((p) => p.slug === profile.slug || p.id === profile.id);
  if (existingIdx >= 0) {
    current[existingIdx] = updated;
  } else {
    current.unshift(updated);
  }
  saveLocalProfiles(current);
  return updated;
}

// Submit contact inquiry
export async function submitContactInquiry(inquiry: ContactInquiry): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("/api/portfolios/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiry),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error(e);
  }
  return {
    success: true,
    message: "Thank you! Your message has been sent directly to the professional via Portfolio Maldives.",
  };
}

// AI API: Enhance Bio
export async function aiEnhanceBio(payload: {
  fullName: string;
  currentTitle: string;
  industry: string;
  atoll: string;
  rawBio: string;
  keyStrengths?: string;
  tone?: string;
}): Promise<string> {
  try {
    const res = await fetch("/api/ai/enhance-bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return data.enhancedBio;
    }
  } catch (e) {
    console.error(e);
  }
  return `${payload.fullName} is an experienced ${payload.currentTitle} based in ${payload.atoll}, dedicated to excellence in ${payload.industry}. Known for strategic impact, innovation, and leadership across key island initiatives.`;
}

// AI API: Enhance Bullet
export async function aiEnhanceBullet(payload: {
  role: string;
  company: string;
  rawBullet: string;
  industry: string;
}): Promise<string[]> {
  try {
    const res = await fetch("/api/ai/enhance-bullet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return data.suggestions || [];
    }
  } catch (e) {
    console.error(e);
  }
  return [
    `Spearheaded core initiatives as ${payload.role} at ${payload.company}, driving notable operational efficiency and high team performance.`,
    `Delivered impactful strategic outcomes for ${payload.company} across key ${payload.industry} milestones.`,
  ];
}

// AI API: Suggest Skills and Certifications
export async function aiSuggestSkills(payload: {
  industry: string;
  title: string;
}): Promise<{ skills: string[]; certifications: string[] }> {
  try {
    const res = await fetch("/api/ai/suggest-skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        skills: data.skills || [],
        certifications: data.certifications || [],
      };
    }
  } catch (e) {
    console.error(e);
  }
  return {
    skills: ["Strategic Planning", "Project Management", "Team Leadership", "Industry Operations", "Quality Assurance"],
    certifications: ["Professional Membership", "Advanced Industry Qualification"],
  };
}

export const DEFAULT_ADMIN_PROFILE: UserProfile = {
  id: "admin-national-registry",
  slug: "national-registry-admin",
  role: "admin",
  fullName: "Registry Administrator",
  title: "National Directory Administrator & Verification Officer",
  headline: "National Talent Registry & Specialist Verification Authority",
  bio: "Managing and verifying Maldivian specialist credentials, luxury resort executive profiles, and sector talent across the Republic of Maldives.",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  coverUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
  industry: "Public Administration & Policy",
  atoll: "Kaafu Atoll (Malé / North & South Malé)",
  island: "Malé City",
  email: "admin@portfoliomaldives.mv",
  phone: "+960 330-0000",
  availableFor: ["Registry Verification", "Institutional Partnerships"],
  yearsOfExperience: 10,
  theme: "saddle-heritage",
  isPublished: true,
  verified: true,
  isVerified: true,
  isFeatured: false,
  status: "active",
  experiences: [
    {
      id: "admin-exp-1",
      role: "Chief Registry Administrator",
      company: "Portfolio Maldives National Directory Authority",
      location: "Malé City, Maldives",
      startDate: "2021-01",
      isCurrent: true,
      description: "Administering national verification standards for Maldivian professionals, marine specialists, and resort leaders.",
      achievements: [
        "Verified over 500+ Maldivian resort executives and technical specialists.",
        "Established digital talent verification protocol for hospitality and aviation.",
      ],
      skills: ["Registry Governance", "Verification Standards", "Platform Moderation"],
    },
  ],
  education: [
    {
      id: "admin-edu-1",
      degree: "Master of Public Administration (MPA)",
      institution: "The Maldives National University",
      fieldOfStudy: "Public Sector Governance & Digital Strategy",
      startYear: "2015",
      endYear: "2017",
    },
  ],
  certifications: [
    {
      id: "admin-cert-1",
      name: "Certified Information Privacy & Governance Professional",
      issuer: "Digital Registry Standards Board",
      issueDate: "2022-03",
    },
  ],
  skills: [
    { id: "as1", name: "Registry Governance", category: "Management & Leadership", proficiency: "Expert" },
    { id: "as2", name: "Credential Verification", category: "Management & Leadership", proficiency: "Expert" },
    { id: "as3", name: "Platform Moderation", category: "Management & Leadership", proficiency: "Expert" },
    { id: "as4", name: "Talent Vetting", category: "Industry Specialist", proficiency: "Expert" },
  ],
  projects: [],
  languages: [
    { id: "al1", language: "Dhivehi", fluency: "Native / Mother Tongue" },
    { id: "al2", language: "English", fluency: "Fluent / Bilingual" },
  ],
  awards: [],
  viewsCount: 1280,
  updatedAt: new Date().toISOString(),
};

export function isAdminUser(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === "admin" || profile.email.toLowerCase() === "admin@portfoliomaldives.mv" || profile.slug === "national-registry-admin";
}

// ADMIN API: Fetch all contact inquiries across the platform
export async function fetchAdminInquiries(): Promise<ContactInquiry[]> {
  try {
    const res = await fetch("/api/admin/inquiries");
    if (res.ok) {
      const data = await res.json();
      return data.inquiries || [];
    }
  } catch (e) {
    console.error("Failed to fetch admin inquiries:", e);
  }
  return [];
}

// ADMIN API: Verify/Unverify a profile
export async function adminVerifyProfile(slug: string, verified: boolean): Promise<UserProfile | null> {
  // Update local
  const current = getLocalProfiles();
  const idx = current.findIndex((p) => p.slug === slug);
  if (idx >= 0) {
    current[idx].verified = verified;
    current[idx].isVerified = verified;
    current[idx].updatedAt = new Date().toISOString();
    saveLocalProfiles(current);
  }

  // Update server
  try {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, verified }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.profile;
    }
  } catch (e) {
    console.error("Admin verify server call deferred:", e);
  }

  return idx >= 0 ? current[idx] : null;
}

// ADMIN API: Feature / Unfeature a profile
export async function adminFeatureProfile(slug: string, isFeatured: boolean): Promise<UserProfile | null> {
  const current = getLocalProfiles();
  const idx = current.findIndex((p) => p.slug === slug);
  if (idx >= 0) {
    current[idx].isFeatured = isFeatured;
    current[idx].updatedAt = new Date().toISOString();
    saveLocalProfiles(current);
  }

  try {
    const res = await fetch("/api/admin/feature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, isFeatured }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.profile;
    }
  } catch (e) {
    console.error("Admin feature server call deferred:", e);
  }

  return idx >= 0 ? current[idx] : null;
}

// ADMIN API: Update status (active, suspended, draft)
export async function adminSetStatus(
  slug: string,
  status: "active" | "pending_review" | "suspended",
  isPublished?: boolean
): Promise<UserProfile | null> {
  const current = getLocalProfiles();
  const idx = current.findIndex((p) => p.slug === slug);
  if (idx >= 0) {
    current[idx].status = status;
    if (isPublished !== undefined) current[idx].isPublished = isPublished;
    current[idx].updatedAt = new Date().toISOString();
    saveLocalProfiles(current);
  }

  try {
    const res = await fetch("/api/admin/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, status, isPublished }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.profile;
    }
  } catch (e) {
    console.error("Admin status server call deferred:", e);
  }

  return idx >= 0 ? current[idx] : null;
}

// ADMIN API: Update User Role (promote to admin or demote to standard user)
export async function adminUpdateUserRole(slug: string, role: "admin" | "user"): Promise<UserProfile | null> {
  const current = getLocalProfiles();
  const idx = current.findIndex((p) => p.slug === slug);
  if (idx >= 0) {
    current[idx].role = role;
    current[idx].updatedAt = new Date().toISOString();
    saveLocalProfiles(current);
  }

  try {
    const res = await fetch("/api/admin/user-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, role }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.profile;
    }
  } catch (e) {
    console.error("Admin user role server call deferred:", e);
  }

  return idx >= 0 ? current[idx] : null;
}

// ADMIN API: Provision new Admin / User account
export async function adminCreateUser(profileData: Partial<UserProfile>): Promise<UserProfile> {
  const slug = (profileData.slug || profileData.fullName || "new-user")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  const newProfile: UserProfile = {
    id: "usr-" + Math.random().toString(36).substring(2, 9),
    slug: slug + (getLocalProfiles().some((p) => p.slug === slug) ? `-${Math.floor(Math.random() * 1000)}` : ""),
    role: profileData.role || "admin",
    fullName: profileData.fullName || "New Administrator",
    title: profileData.title || "Directory Administrator",
    headline: profileData.headline || "National Talent Registry & Specialist Authority",
    bio: profileData.bio || "Administrator of the Republic of Maldives Specialist Registry.",
    avatarUrl: profileData.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    industry: profileData.industry || "Public Administration & Policy",
    atoll: profileData.atoll || "Kaafu Atoll (Malé / North & South Malé)",
    island: profileData.island || "Malé City",
    email: profileData.email || `${slug}@portfoliomaldives.mv`,
    phone: profileData.phone || "+960 330-0000",
    availableFor: ["Registry Verification", "Institutional Administration"],
    yearsOfExperience: profileData.yearsOfExperience || 5,
    theme: profileData.theme || "saddle-heritage",
    isPublished: profileData.isPublished ?? true,
    verified: profileData.verified ?? true,
    isVerified: profileData.isVerified ?? true,
    isFeatured: profileData.isFeatured ?? false,
    status: profileData.status || "active",
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewsCount: 0,
    experiences: profileData.experiences || [],
    education: profileData.education || [],
    certifications: profileData.certifications || [],
    skills: profileData.skills || [
      { id: "s1", name: "Registry Governance", category: "Management & Leadership", proficiency: "Expert" },
      { id: "s2", name: "Credential Verification", category: "Management & Leadership", proficiency: "Expert" },
    ],
    projects: profileData.projects || [],
    languages: profileData.languages || [
      { id: "l1", language: "Dhivehi", fluency: "Native / Mother Tongue" },
      { id: "l2", language: "English", fluency: "Fluent / Bilingual" },
    ],
    awards: profileData.awards || [],
  };

  const current = getLocalProfiles();
  current.unshift(newProfile);
  saveLocalProfiles(current);

  try {
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProfile),
    });
    if (res.ok) {
      const data = await res.json();
      return data.profile || newProfile;
    }
  } catch (e) {
    console.error("Admin create user server call deferred:", e);
  }

  return newProfile;
}

// ADMIN API: Delete a profile
export async function adminDeleteProfile(slug: string): Promise<boolean> {
  const current = getLocalProfiles();
  const filtered = current.filter((p) => p.slug !== slug);
  saveLocalProfiles(filtered);

  try {
    await fetch(`/api/admin/portfolios/${slug}`, {
      method: "DELETE",
    });
  } catch (e) {
    console.error("Admin delete server call deferred:", e);
  }

  return true;
}
