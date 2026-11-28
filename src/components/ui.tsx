import { useState, type ReactNode } from "react";
import { photoUrl } from "../lib/supabase";
import { deadlineLabel, initials } from "../lib/format";
import type { Job } from "../lib/types";

export function Avatar({ name, path, large }: { name: string; path?: string | null; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const cls = "avatar" + (large ? " lg" : "");
  const src = photoUrl(path);
  if (src && !failed) return <img className={cls} src={src} alt="" onError={() => setFailed(true)} />;
  return <div className={cls} aria-hidden="true">{initials(name)}</div>;
}

export function Logo({ name, path, large }: { name: string; path?: string | null; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const cls = "logo" + (large ? " lg" : "");
  const src = photoUrl(path);
  if (src && !failed) return <img className={cls} src={src} alt="" onError={() => setFailed(true)} />;
  return <span className={cls} aria-hidden="true">{initials(name)}</span>;
}

export function VerifiedMark() {
  return (
    <svg className="verified" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Verified">
      <path d="M12 2l2.4 2.1 3.2-.4.9 3.1 2.9 1.5-1 3 1 3-2.9 1.5-.9 3.1-3.2-.4L12 22l-2.4-2.1-3.2.4-.9-3.1-2.9-1.5 1-3-1-3 2.9-1.5.9-3.1 3.2.4z" />
      <path d="M8.5 12.5l2.3 2.3 4.7-5" fill="none" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
    </svg>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Skeletons({ n = 3 }: { n?: number }) {
  return <div className="jobs" aria-busy="true">{Array.from({ length: n }, (_, i) => <div key={i} className="skeleton" />)}</div>;
}

export function Deadline({ job }: { job: Pick<Job, "is_open" | "deadline"> }) {
  const d = deadlineLabel(job);
  return <span className={"deadline" + (d.soon ? " soon" : "")}>{d.text}</span>;
}

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}{hint && <small> ({hint})</small>}</span>
      {children}
    </label>
  );
}

export function Intro({ eyebrow, title, lede, children }: { eyebrow: string; title: ReactNode; lede?: ReactNode; children?: ReactNode }) {
  return (
    <section className="intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {children}
    </section>
  );
}

export function Select({ id, value, onChange, options, blank, label }: {
  id: string; value: string; onChange: (v: string) => void; options: readonly string[]; blank?: string; label?: string;
}) {
  return (
    <select id={id} value={value} aria-label={label} onChange={(e) => onChange(e.target.value)}>
      {blank !== undefined && <option value="">{blank}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
