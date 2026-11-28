import { supabase } from "./supabase";
import { today } from "./format";
import type { AppStatus, Application, Company, CompanyContact, Job, Profile, ProfileContact } from "./types";

const JOB_COMPANY = "company:companies!inner(id,name,logo_path,verified,about,website,status)";

// Supabase can't infer nested select shapes without generated types, so results are cast at each call.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function check(res: { data: unknown; error: unknown }): any {
  if (res.error) throw res.error;
  return res.data;
}

/** Open jobs from approved companies, newest first. */
export async function fetchOpenJobs(): Promise<Job[]> {
  return check(
    await supabase.from("jobs").select(`*, ${JOB_COMPANY}`)
      .eq("company.status", "approved").eq("is_open", true)
      .or(`deadline.is.null,deadline.gte.${today()}`)
      .order("posted_at", { ascending: false }).limit(500),
  ) as Job[];
}

export async function fetchJob(id: string): Promise<Job | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const res = await supabase.from("jobs").select("*, company:companies(id,name,logo_path,verified,about,website,status)").eq("id", id).maybeSingle();
  return check(res) as Job | null;
}

export async function countListedCvs(): Promise<number> {
  const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("published", true);
  if (error) throw error;
  return count || 0;
}

export type TalentRow = Pick<Profile, "id" | "slug" | "full_name" | "title" | "headline" | "sector" | "atoll" | "island" | "years" | "availability" | "skills" | "photo_path" | "open_to_work" | "verified" | "updated_at">;
export async function fetchTalent(): Promise<TalentRow[]> {
  return check(
    await supabase.from("profiles")
      .select("id,slug,full_name,title,headline,sector,atoll,island,years,availability,skills,photo_path,open_to_work,verified,updated_at")
      .eq("published", true).order("updated_at", { ascending: false }).limit(1000),
  ) as TalentRow[];
}

export async function fetchProfileBySlug(slug: string): Promise<Profile | null> {
  if (!/^[a-z0-9-]{4,40}$/.test(slug)) return null;
  return check(await supabase.from("profiles").select("*").eq("slug", slug).maybeSingle()) as Profile | null;
}

/** Contact details, or null when the database doesn't let this viewer see them. */
export async function fetchContact(userId: string): Promise<ProfileContact | null> {
  return check(await supabase.from("profile_contacts").select("*").eq("user_id", userId).maybeSingle()) as ProfileContact | null;
}

export type MyApplication = Application & { job: (Pick<Job, "id" | "title" | "is_open" | "deadline"> & { company: { name: string } | null }) | null };
export async function fetchMyApplications(uid: string): Promise<MyApplication[]> {
  return check(
    await supabase.from("applications").select("*, job:jobs(id,title,is_open,deadline,company:companies(name))")
      .eq("applicant_id", uid).order("created_at", { ascending: false }),
  ) as MyApplication[];
}

export type MyInvitation = { id: string; job_id: string; created_at: string; job: (Pick<Job, "id" | "title" | "is_open" | "deadline"> & { company: { name: string } | null }) | null };
export async function fetchMyInvitations(uid: string): Promise<MyInvitation[]> {
  return check(
    await supabase.from("invitations").select("id,job_id,created_at, job:jobs(id,title,is_open,deadline,company:companies(name))")
      .eq("profile_id", uid).order("created_at", { ascending: false }),
  ) as MyInvitation[];
}

export async function fetchSaved(uid: string): Promise<Set<string>> {
  const rows = check(await supabase.from("saved_jobs").select("job_id").eq("user_id", uid)) as { job_id: string }[];
  return new Set(rows.map((r) => r.job_id));
}

export async function setSaved(jobId: string, saved: boolean) {
  if (saved) check(await supabase.from("saved_jobs").insert({ job_id: jobId }));
  else check(await supabase.from("saved_jobs").delete().eq("job_id", jobId));
}

export async function apply(jobId: string, uid: string, note: string) {
  check(await supabase.from("applications").insert({ job_id: jobId, applicant_id: uid, note }));
}

export async function withdraw(applicationId: string) {
  check(await supabase.from("applications").delete().eq("id", applicationId));
}

// ----- Company side -----
export async function fetchCompanyJobs(companyId: string): Promise<Job[]> {
  return check(await supabase.from("jobs").select("*").eq("company_id", companyId).order("posted_at", { ascending: false })) as Job[];
}

export type Applicant = Application & { applicant: Pick<Profile, "id" | "slug" | "full_name" | "title" | "atoll" | "verified" | "photo_path"> | null };
export async function fetchApplicants(jobIds: string[]): Promise<Applicant[]> {
  if (!jobIds.length) return [];
  return check(
    await supabase.from("applications").select("*, applicant:profiles(id,slug,full_name,title,atoll,verified,photo_path)")
      .in("job_id", jobIds).order("created_at", { ascending: false }),
  ) as Applicant[];
}

export async function setApplicationStatus(id: string, status: AppStatus) {
  check(await supabase.from("applications").update({ status }).eq("id", id));
}

export async function fetchCompanyContact(companyId: string): Promise<CompanyContact | null> {
  return check(await supabase.from("company_contacts").select("*").eq("company_id", companyId).maybeSingle()) as CompanyContact | null;
}

export async function invite(jobId: string, profileId: string) {
  check(await supabase.from("invitations").insert({ job_id: jobId, profile_id: profileId }));
}

export async function fetchInvitesSent(profileId: string, jobIds: string[]): Promise<Set<string>> {
  if (!jobIds.length) return new Set();
  const rows = check(await supabase.from("invitations").select("job_id").eq("profile_id", profileId).in("job_id", jobIds)) as { job_id: string }[];
  return new Set(rows.map((r) => r.job_id));
}

// ----- Admin -----
export type CompanyWithContact = Company & { contact: CompanyContact | CompanyContact[] | null; jobs: { count: number }[] };
export async function fetchAllCompanies(): Promise<CompanyWithContact[]> {
  return check(
    await supabase.from("companies").select("*, contact:company_contacts(*), jobs(count)").order("requested_at", { ascending: false }),
  ) as CompanyWithContact[];
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  return check(await supabase.from("profiles").select("*").order("updated_at", { ascending: false }).limit(1000)) as Profile[];
}

export const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);
