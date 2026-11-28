export type JobType = "Full-time" | "Part-time" | "Contract" | "Seasonal" | "Internship" | "Freelance";
export type AppStatus = "applied" | "shortlisted" | "offered" | "declined";
export type CompanyStatus = "pending" | "approved" | "declined";

export interface ExperienceItem { role: string; org: string; place: string; from: string; to: string; details: string }
export interface EducationItem { qualification: string; institution: string; year: string }
export interface LanguageItem { name: string; level: string }
export interface CertificationItem { name: string; issuer: string; year: string }

export interface Profile {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  headline: string;
  sector: string;
  atoll: string;
  island: string;
  years: number | null;
  summary: string;
  availability: string[];
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  photo_path: string | null;
  published: boolean;
  open_to_work: boolean;
  show_contact: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileContact { user_id: string; email: string | null; phone: string | null }

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  sector: string;
  atoll: string;
  island: string;
  about: string;
  website: string | null;
  logo_path: string | null;
  status: CompanyStatus;
  verified: boolean;
  requested_at: string;
  reviewed_at: string | null;
}

export interface CompanyContact { company_id: string; contact_name: string; contact_email: string | null; contact_phone: string | null }

export interface Job {
  id: string;
  company_id: string;
  title: string;
  type: JobType;
  sector: string;
  atoll: string;
  island: string;
  salary_min: number | null;
  salary_max: number | null;
  deadline: string | null;
  description: string;
  requirements: string;
  accommodation: boolean;
  is_open: boolean;
  posted_at: string;
  company?: Pick<Company, "id" | "name" | "logo_path" | "verified" | "about" | "website" | "status">;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  note: string;
  status: AppStatus;
  created_at: string;
}
