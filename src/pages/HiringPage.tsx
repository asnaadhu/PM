import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Deadline, Empty, Field, Intro, Logo, PinIcon, Select, Skeletons, SparkIcon, VerifiedMark } from "../components/ui";
import { fetchApplicants, fetchCompanyContact, fetchCompanyJobs, setApplicationStatus, type Applicant } from "../lib/api";
import { improveText } from "../lib/ai";
import { useAuth } from "../lib/auth";
import { ATOLLS, JOB_TYPES, SECTORS, STATUS_LABEL } from "../lib/constants";
import { errorMessage, fmtDate, isClosed, isNewSince, readLastSeen, safeUrl, salaryText } from "../lib/format";
import { uploadPhoto } from "../lib/images";
import { supabase } from "../lib/supabase";
import { useToast } from "../lib/toast";
import type { AppStatus, Company, Job, JobType } from "../lib/types";
import { RequireSignIn } from "./SignInPage";

interface CompanyDraft {
  name: string; sector: string; atoll: string; island: string; about: string; website: string; logo_path: string | null;
  contact_name: string; contact_email: string; contact_phone: string;
}

function CompanyForm({ company, onDone, onCancel }: { company: Company | null; onDone: () => void; onCancel?: () => void }) {
  const { user, isAdmin, refresh } = useAuth();
  const toast = useToast();
  const [d, setD] = useState<CompanyDraft>({
    name: company?.name || "", sector: company?.sector || "", atoll: company?.atoll || "", island: company?.island || "",
    about: company?.about || "", website: company?.website || "", logo_path: company?.logo_path || null,
    contact_name: "", contact_email: user?.email || "", contact_phone: "",
  });
  const [busy, setBusy] = useState(false);
  const isRequest = !isAdmin;
  const set = <K extends keyof CompanyDraft>(k: K, v: CompanyDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!company) return;
    fetchCompanyContact(company.id).then((c) => c && setD((p) => ({ ...p, contact_name: c.contact_name, contact_email: c.contact_email || "", contact_phone: c.contact_phone || "" }))).catch(() => {});
  }, [company]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!d.name.trim()) { toast("Add your company's name.", true); document.getElementById("org-name")?.focus(); return; }
    if (d.website && !safeUrl(d.website)) { toast("Website must start with https://", true); document.getElementById("org-web")?.focus(); return; }
    const hasContact = d.contact_name.trim() && (d.contact_email.trim() || d.contact_phone.trim());
    if (isRequest) {
      if (!d.contact_name.trim()) { toast("Add a contact person.", true); document.getElementById("org-cname")?.focus(); return; }
      if (!d.contact_email.trim() && !d.contact_phone.trim()) { toast("Add a work email or phone so the board team can reach you.", true); document.getElementById("org-cemail")?.focus(); return; }
      if (d.contact_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contact_email.trim())) { toast("Check the email address.", true); document.getElementById("org-cemail")?.focus(); return; }
    }
    const row = { name: d.name.trim(), sector: d.sector, atoll: d.atoll, island: d.island.trim(), about: d.about.trim(), website: d.website.trim() || null, logo_path: d.logo_path };
    setBusy(true);
    try {
      let id = company?.id;
      if (company) {
        const r = await supabase.from("companies").update(row).eq("id", company.id);
        if (r.error) throw r.error;
      } else {
        const r = await supabase.from("companies").insert({ ...row, owner_id: user.id }).select("id").single();
        if (r.error) throw r.error;
        id = r.data.id;
      }
      if (hasContact) {
        const c = await supabase.from("company_contacts").upsert({ company_id: id, contact_name: d.contact_name.trim(), contact_email: d.contact_email.trim() || null, contact_phone: d.contact_phone.trim() || null });
        if (c.error) throw c.error;
      }
      await refresh();
      toast(isRequest && (!company || company.status !== "approved") ? "Request sent. The board team will be in touch." : "Company saved");
      onDone();
    } catch (err) { toast(errorMessage(err), true); }
    setBusy(false);
  };

  return (
    <form className="card panel" onSubmit={submit} noValidate style={{ marginBottom: 24 }}>
      <div className="panel-head"><h2>{company ? (company.status === "approved" ? "Edit company" : "Edit your request") : isRequest ? "Request a company profile" : "Your company"}</h2></div>
      <div className="upload">
        <Logo name={d.name} path={d.logo_path} large />
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input id="org-logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => {
              const f = e.target.files?.[0]; e.target.value = "";
              if (!f || !user) return;
              try { toast("Uploading…"); set("logo_path", await uploadPhoto(user.id, f, "logo")); toast("Logo added. Save to keep it."); } catch (err) { toast(errorMessage(err), true); }
            }} />
            <label className="btn small" htmlFor="org-logo">{d.logo_path ? "Change logo" : "Add a logo"}</label>
            {d.logo_path && <button type="button" className="btn small ghost danger" onClick={() => set("logo_path", null)}>Remove logo</button>}
          </div>
          <span className="muted small">Square logos look best. JPG, PNG or WebP.</span>
        </div>
      </div>
      <div className="grid2">
        <Field id="org-name" label="Company name"><input id="org-name" type="text" value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Raa Atoll Council, Kanuhura Resort" required /></Field>
        <Field id="org-sector" label="Sector"><Select id="org-sector" value={d.sector} onChange={(v) => set("sector", v)} options={SECTORS} blank="Choose…" /></Field>
      </div>
      <div className="grid3">
        <Field id="org-atoll" label="Atoll"><Select id="org-atoll" value={d.atoll} onChange={(v) => set("atoll", v)} options={ATOLLS} blank="Choose…" /></Field>
        <Field id="org-island" label="Island"><input id="org-island" type="text" value={d.island} onChange={(e) => set("island", e.target.value)} /></Field>
        <Field id="org-web" label="Website" hint="https://…"><input id="org-web" type="url" value={d.website} onChange={(e) => set("website", e.target.value)} /></Field>
      </div>
      <div className="grid3">
        <Field id="org-cname" label="Contact person"><input id="org-cname" type="text" autoComplete="name" value={d.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></Field>
        <Field id="org-cemail" label="Work email"><input id="org-cemail" type="email" autoComplete="email" value={d.contact_email} onChange={(e) => set("contact_email", e.target.value)} /></Field>
        <Field id="org-cphone" label="Phone"><input id="org-cphone" type="tel" autoComplete="tel" value={d.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+960 3xx xxxx" /></Field>
      </div>
      <Field id="org-about" label="About"><textarea id="org-about" rows={3} value={d.about} onChange={(e) => set("about", e.target.value)} placeholder="What you do and what it's like to work with you." /></Field>
      <div className="savebar">
        <span className="muted small">Contact details are only shared with the board team.</span>
        <div style={{ display: "flex", gap: 8 }}>
          {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
          <button type="submit" className="btn primary" disabled={busy}>{busy ? "Saving…" : company ? "Save" : isRequest ? "Send request" : "Save company"}</button>
        </div>
      </div>
    </form>
  );
}

interface JobDraft {
  id?: string; title: string; type: JobType; sector: string; atoll: string; island: string;
  salary_min: string; salary_max: string; deadline: string; description: string; requirements: string; accommodation: boolean;
}
const toJobDraft = (c: Company, j?: Job): JobDraft => ({
  id: j?.id, title: j?.title || "", type: j?.type || "Full-time", sector: j?.sector ?? c.sector, atoll: j?.atoll ?? c.atoll, island: j?.island ?? c.island,
  salary_min: j?.salary_min != null ? String(j.salary_min) : "", salary_max: j?.salary_max != null ? String(j.salary_max) : "",
  deadline: j?.deadline || "", description: j?.description || "", requirements: j?.requirements || "", accommodation: j?.accommodation || false,
});

function JobForm({ company, draft: initial, onDone, onCancel }: { company: Company; draft: JobDraft; onDone: () => void; onCancel: () => void }) {
  const toast = useToast();
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [improving, setImproving] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const set = <K extends keyof JobDraft>(k: K, v: JobDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.title.trim()) { toast("Add a job title.", true); document.getElementById("job-title")?.focus(); return; }
    const min = d.salary_min === "" ? null : Number(d.salary_min), max = d.salary_max === "" ? null : Number(d.salary_max);
    if (min != null && max != null && max < min) { toast("Salary 'to' should be at least the 'from' amount.", true); document.getElementById("job-max")?.focus(); return; }
    const row = {
      company_id: company.id, title: d.title.trim(), type: d.type, sector: d.sector, atoll: d.atoll, island: d.island.trim(),
      salary_min: min, salary_max: max, deadline: d.deadline || null, description: d.description.trim(), requirements: d.requirements.trim(), accommodation: d.accommodation,
    };
    setBusy(true);
    const r = d.id ? await supabase.from("jobs").update(row).eq("id", d.id) : await supabase.from("jobs").insert(row);
    setBusy(false);
    if (r.error) { toast(errorMessage(r.error), true); return; }
    toast(d.id ? "Job updated" : "Job posted");
    onDone();
  };

  const improve = async () => {
    setImproving(true);
    try {
      const before = d.description;
      const text = await improveText("job", d.description, {
        company: company.name, title: d.title, type: d.type, location: [d.island, d.atoll].filter(Boolean).join(", "),
        accommodation: d.accommodation ? "yes" : "not stated",
      });
      set("description", text); setUndo(before);
    } catch { toast("Writing help isn't available right now.", true); }
    setImproving(false);
  };

  return (
    <form className="card panel" onSubmit={submit} noValidate style={{ marginBottom: 20 }}>
      <div className="panel-head"><h2>{d.id ? "Edit job" : "Post a job"}</h2></div>
      <Field id="job-title" label="Job title"><input id="job-title" type="text" value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Dive Instructor (PADI)" required autoFocus /></Field>
      <div className="grid2">
        <Field id="job-type" label="Type"><Select id="job-type" value={d.type} onChange={(v) => set("type", v as JobType)} options={JOB_TYPES} /></Field>
        <Field id="job-sector" label="Sector"><Select id="job-sector" value={d.sector} onChange={(v) => set("sector", v)} options={SECTORS} blank="Choose…" /></Field>
      </div>
      <div className="grid2">
        <Field id="job-atoll" label="Atoll"><Select id="job-atoll" value={d.atoll} onChange={(v) => set("atoll", v)} options={ATOLLS} blank="Choose…" /></Field>
        <Field id="job-island" label="Island or resort"><input id="job-island" type="text" value={d.island} onChange={(e) => set("island", e.target.value)} /></Field>
      </div>
      <div className="grid3">
        <Field id="job-min" label="Salary from" hint="MVR/month"><input id="job-min" type="number" min={0} step={500} value={d.salary_min} onChange={(e) => set("salary_min", e.target.value)} /></Field>
        <Field id="job-max" label="Salary to"><input id="job-max" type="number" min={0} step={500} value={d.salary_max} onChange={(e) => set("salary_max", e.target.value)} /></Field>
        <Field id="job-deadline" label="Closing date"><input id="job-deadline" type="date" value={d.deadline} onChange={(e) => set("deadline", e.target.value)} /></Field>
      </div>
      <label className="check"><input type="checkbox" id="job-acc" checked={d.accommodation} onChange={(e) => set("accommodation", e.target.checked)} /> Staff accommodation provided</label>
      <div className="field">
        <div className="panel-head">
          <label htmlFor="job-desc" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>Description</label>
          <div style={{ display: "flex", gap: 6 }}>
            {undo !== null && <button type="button" className="btn small ghost" onClick={() => { set("description", undo); setUndo(null); }}>Undo</button>}
            <button type="button" className="btn small ai" onClick={improve} disabled={improving}><SparkIcon /> {improving ? "Writing…" : "Improve with Claude"}</button>
          </div>
        </div>
        <textarea id="job-desc" rows={6} value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="What the job involves, the team, shifts or rotation." />
      </div>
      <Field id="job-req" label="Requirements" hint="one per line"><textarea id="job-req" rows={4} value={d.requirements} onChange={(e) => set("requirements", e.target.value)} placeholder={"PADI Instructor certification\nConversational English"} /></Field>
      <div className="savebar">
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn primary" disabled={busy}>{busy ? "Saving…" : d.id ? "Save changes" : "Post job"}</button>
      </div>
    </form>
  );
}

function CompanyDashboard({ company }: { company: Company }) {
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [apps, setApps] = useState<Applicant[]>([]);
  const [editing, setEditing] = useState<JobDraft | null>(null);
  const [editCompany, setEditCompany] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<string | null>(null);
  const lastSeen = useMemo(() => readLastSeen(), []);

  const load = useCallback(async () => {
    try {
      const js = await fetchCompanyJobs(company.id);
      setJobs(js);
      setApps(await fetchApplicants(js.map((j) => j.id)));
    } catch (e) { toast(errorMessage(e), true); }
  }, [company.id, toast]);
  useEffect(() => { load(); }, [load]);

  const toggleOpen = async (j: Job) => {
    const r = await supabase.from("jobs").update({ is_open: !j.is_open }).eq("id", j.id);
    if (r.error) toast(errorMessage(r.error), true); else { toast(j.is_open ? "Job closed" : "Job reopened"); load(); }
  };
  const del = async (j: Job) => {
    if (confirm !== j.id) { setConfirm(j.id); window.setTimeout(() => setConfirm((c) => (c === j.id ? null : c)), 4000); return; }
    const r = await supabase.from("jobs").delete().eq("id", j.id);
    if (r.error) toast(errorMessage(r.error), true); else { toast("Job deleted"); setConfirm(null); load(); }
  };
  const decide = async (a: Applicant, status: AppStatus) => {
    try { await setApplicationStatus(a.id, a.status === status ? "applied" : status); load(); }
    catch (e) { toast(errorMessage(e), true); }
  };

  return (
    <>
      <Intro eyebrow="Hiring" title={<>{company.name} {company.verified && <VerifiedMark />}</>}
        lede="Post job ads, then shortlist, make offers or decline from each job's applicant list. Find people in Talent and invite them to apply.">
        {!editCompany && !editing && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => setEditCompany(true)}>Edit company</button>
            <button className="btn primary" onClick={() => setEditing(toJobDraft(company))}>Post a job</button>
          </div>
        )}
      </Intro>
      {editCompany && <CompanyForm company={company} onDone={() => setEditCompany(false)} onCancel={() => setEditCompany(false)} />}
      {editing && <JobForm company={company} draft={editing} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); load(); }} />}
      {!jobs ? <Skeletons n={2} /> : !jobs.length ? (
        <Empty title="No jobs posted yet" action={!editing && <button className="btn primary" onClick={() => setEditing(toJobDraft(company))}>Post a job</button>}>Your first job ad appears on the Jobs board straight away.</Empty>
      ) : (
        <div className="jobs">
          {jobs.map((j) => {
            const list = apps.filter((a) => a.job_id === j.id);
            const fresh = list.filter((a) => isNewSince(a.created_at, lastSeen)).length;
            const open = expanded.has(j.id);
            const closed = isClosed(j);
            return (
              <div className="card emp-job" key={j.id}>
                <div className="emp-job-head">
                  <div style={{ minWidth: 0 }}>
                    <h3><Link to={`/jobs/${j.id}`} style={{ color: "inherit", textDecoration: "none" }}>{j.title}</Link></h3>
                    <div className="chips" style={{ marginTop: 6 }}>
                      <span className={`chip ${closed ? "" : "ok"}`}>{closed ? "Closed" : "Open"}</span>
                      <span className="chip">{j.type}</span>
                      {j.atoll && <span className="chip"><PinIcon /> {j.atoll}</span>}
                      {salaryText(j) && <span className="chip">{salaryText(j)}</span>}
                    </div>
                    <div style={{ marginTop: 6 }}><Deadline job={j} /></div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="btn small" onClick={() => { setEditing(toJobDraft(company, j)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button>
                    <button className="btn small" onClick={() => toggleOpen(j)}>{j.is_open ? "Close" : "Reopen"}</button>
                    <button className="btn small danger" onClick={() => del(j)}>{confirm === j.id ? "Click again to delete" : "Delete"}</button>
                  </div>
                </div>
                <button className={"btn" + (list.length ? "" : " ghost")} style={{ justifySelf: "start" }} aria-expanded={open}
                  onClick={() => setExpanded((s) => { const n = new Set(s); if (n.has(j.id)) n.delete(j.id); else n.add(j.id); return n; })}>
                  {list.length} applicant{list.length === 1 ? "" : "s"}{fresh ? ` · ${fresh} new` : ""}{list.length ? (open ? " · hide" : " · review") : ""}
                </button>
                {open && list.length > 0 && (
                  <div className="list-rows">
                    {list.map((a) => {
                      const st = STATUS_LABEL[a.status] || STATUS_LABEL.applied!;
                      const btn = (s: AppStatus, label: string) => <button className={"btn small" + (a.status === s ? " primary" : "")} onClick={() => decide(a, s)}>{label}</button>;
                      return (
                        <div className="app-row" key={a.id}>
                          <div style={{ minWidth: 0, display: "flex", gap: 10, alignItems: "center" }}>
                            <Avatar name={a.applicant?.full_name || "?"} path={a.applicant?.photo_path} />
                            <div style={{ minWidth: 0 }}>
                              <div className="name">{a.applicant?.full_name || "CV removed"} {a.applicant?.verified && <VerifiedMark />} <span className={`chip ${st.cls}`}>{st.label}</span>{isNewSince(a.created_at, lastSeen) && <> <span className="chip ok">New</span></>}</div>
                              <div className="muted small">{[a.applicant?.title, a.applicant?.atoll].filter(Boolean).join(" · ")} · applied {fmtDate(a.created_at)}</div>
                            </div>
                          </div>
                          <div className="app-actions">
                            {a.applicant && <Link className="btn small" to={`/cv/${a.applicant.slug}`}>View CV</Link>}
                            {btn("shortlisted", "Shortlist")}{btn("offered", "Offer")}{btn("declined", "Decline")}
                          </div>
                          {a.note && <div className="app-note">{a.note}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function HiringPage() {
  const { user, ready, company, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  if (!ready) return <Skeletons n={3} />;
  if (!user) return <RequireSignIn what="hire on Portfolio Maldives" />;
  if (company?.status === "approved") return <CompanyDashboard company={company} />;

  const intro = (
    <Intro eyebrow="For companies" title={<>Hire on <em>Portfolio Maldives</em></>}
      lede={isAdmin ? "You run this board, so your own company is approved as soon as you save it."
        : "Company profiles are set up on request. Tell us about your company and who to contact. Once the board team approves it, you can post job ads, review applicants and invite people to apply."} />
  );
  if (!company || editing) return <>{intro}<CompanyForm company={company} onDone={() => setEditing(false)} onCancel={company ? () => setEditing(false) : undefined} /></>;

  const declined = company.status === "declined";
  return (
    <>
      {intro}
      <div className="card panel">
        <div className="panel-head">
          <h2>{declined ? "Request not approved" : "Request received"}</h2>
          <span className={`chip ${declined ? "bad" : "warn"}`}>{declined ? "Not approved" : "Waiting for approval"}</span>
        </div>
        <p>{declined
          ? "The board team didn't approve this company profile. Update the details to send it again, or contact the board team directly."
          : `Thanks. The board team will review ${company.name} and contact you. Once approved, this page is where you post job ads.`}</p>
        <dl className="kv">
          <dt>Company</dt><dd>{company.name}{company.atoll ? ` · ${company.atoll}` : ""}</dd>
          <dt>Sent</dt><dd>{fmtDate(company.requested_at)}</dd>
        </dl>
        <div><button className="btn" onClick={() => setEditing(true)}>{declined ? "Update and send again" : "Edit request"}</button></div>
      </div>
    </>
  );
}
