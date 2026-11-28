import type { Job } from "./types";

export const initials = (name: string | null | undefined) =>
  (name || "?").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

export const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const today = () => new Date().toISOString().slice(0, 10);

export function daysLeft(deadline: string | null | undefined): number | null {
  if (!deadline) return null;
  const end = new Date(deadline + "T23:59:59");
  if (isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / 86400000);
}

export const isClosed = (job: Pick<Job, "is_open" | "deadline">) => {
  const d = daysLeft(job.deadline);
  return !job.is_open || (d !== null && d < 0);
};

export function salaryText(job: Pick<Job, "salary_min" | "salary_max">): string {
  const a = job.salary_min || 0, b = job.salary_max || 0;
  if (!a && !b) return "";
  const f = (n: number) => n.toLocaleString("en-US");
  if (a && b && a !== b) return `MVR ${f(a)}–${f(b)}`;
  return `MVR ${f(a || b)}`;
}

export function deadlineLabel(job: Pick<Job, "is_open" | "deadline">): { text: string; soon: boolean } {
  if (!job.is_open) return { text: "Closed by the employer", soon: false };
  const d = daysLeft(job.deadline);
  if (d === null) return { text: "No closing date", soon: false };
  if (d < 0) return { text: "Closed", soon: false };
  const when = new Date(job.deadline + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const left = d === 0 ? "closes today" : d === 1 ? "1 day left" : `${d} days left`;
  return { text: `Closes ${when} · ${left}`, soon: d <= 7 };
}

export const safeUrl = (u: string | null | undefined) => (u && /^https:\/\//i.test(u.trim()) ? u.trim() : "");
export const slugify = (v: string) => v.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function errorMessage(e: unknown): string {
  const err = e as { message?: string; code?: string } | null;
  if (err?.code === "42501" || /row-level security/i.test(err?.message || "")) return "You don't have permission to do that.";
  if (err?.code === "23505") return "That already exists.";
  if (err?.message && /fetch|network/i.test(err.message)) return "Can't reach the server. Check your connection and try again.";
  return err?.message ? `Something went wrong: ${err.message}` : "Something went wrong. Try again.";
}

/** Last time this device opened the site, for "New" badges. */
export function readLastSeen(): number {
  try {
    const prev = Number(localStorage.getItem("pm-last-seen")) || 0;
    if (!sessionStorage.getItem("pm-seen-this-visit")) {
      localStorage.setItem("pm-last-seen", String(Date.now()));
      sessionStorage.setItem("pm-seen-this-visit", String(prev || Date.now()));
    }
    return Number(sessionStorage.getItem("pm-seen-this-visit")) || Date.now();
  } catch {
    return Date.now();
  }
}
export const isNewSince = (iso: string, since: number) => new Date(iso).getTime() > since;
