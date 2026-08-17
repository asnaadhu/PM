export type UserRole = "admin" | "user";

export type IndustryType =
  | "Civil Service (CSC)"
  | "State-Owned Enterprises (SOEs) / Public Companies"
  | "Hospitality & Resort Sector"
  | "Private Sector (General Commercial)"
  | "Independent / Statutory Institutions"
  | "Civil Society / NGOs & International Agencies"
  | "Freelance, Gig & Self-Employed";

export type ThemeType =
  | "kanditheemu-editorial"
  | "saddle-heritage"
  | "azure-island"
  | "executive-navy"
  | "modern-coral"
  | "emerald-atoll"
  | "minimal-slate"
  | "oceanic-dark";

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startYear: string;
  endYear: string;
  fieldOfStudy: string;
  honors?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: "Technical" | "Management & Leadership" | "Industry Specialist" | "Tools & Software";
  proficiency: "Expert" | "Advanced" | "Intermediate";
}

export interface ProjectItem {
  id: string;
  title: string;
  clientOrOrg?: string;
  role?: string;
  year?: string;
  description: string;
  imageUrl?: string;
  demoUrl?: string;
  tags: string[];
  metrics?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  fluency: "Native / Mother Tongue" | "Fluent / Bilingual" | "Professional Working" | "Conversational";
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  slug: string;
  role?: UserRole;
  fullName: string;
  title: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  industry: IndustryType;
  atoll: string;
  island: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  behance?: string;
  twitter?: string;
  availableFor: string[];
  yearsOfExperience: number;
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  skills: SkillItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  awards: AwardItem[];
  theme: ThemeType;
  isPublished: boolean;
  publishedAt?: string;
  createdAt?: string;
  lastLoginAt?: string;
  updatedAt: string;
  viewsCount: number;
  verified: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  status?: "active" | "pending_review" | "suspended";
}

export interface ContactInquiry {
  id?: string;
  portfolioSlug: string;
  senderName: string;
  senderEmail: string;
  senderCompany?: string;
  subject: string;
  message: string;
  createdAt?: string;
}

export interface IslandRecord {
  id: string;
  name: string;
  isActive: boolean;
  isCustom?: boolean;
}

export interface AtollRecord {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  islands: IslandRecord[];
}
