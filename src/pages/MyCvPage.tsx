import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Field, Intro, Select, Skeletons, SparkIcon } from "../components/ui";
import { fetchContact, fetchMyApplications, fetchMyInvitations, withdraw, type MyApplication, type MyInvitation } from "../lib/api";
import { improveText } from "../lib/ai";
import { useAuth } from "../lib/auth";
import { ATOLLS, AVAILABILITY, LANG_LEVELS, SECTORS, STATUS_LABEL } from "../lib/constants";
import { errorMessage, fmtDate, isClosed } from "../lib/format";
import { uploadPhoto } from "../lib/images";
import { supabase } from "../lib/supabase";
import { useToast } from "../lib/toast";
import type { CertificationItem, EducationItem, ExperienceItem, LanguageItem, Profile } from "../lib/types";
import { RequireSignIn } from "./SignInPage";

interface Draft {
  full_name: string; title: string; headline: string; sector: string; atoll: string; island: string;
  years: string; summary: string; availability: string[]; skills: string;
  experience: ExperienceItem[]; education: EducationItem[]; languages: LanguageItem[]; certifications: CertificationItem[];
  photo_path: string | null; published: boolean; open_to_work: boolean; show_contact: boolean;
  email: string; phone: string;
}

const blankExp = (): ExperienceItem => ({ role: "", org: "", place: "", from: "", to: "", details: "" });
const blankEdu = (): EducationItem => ({ qualification: "", institution: "", year: "" });
const blankCert = (): CertificationItem => ({ name: "", issuer: "", year: "" });

function toDraft(p: Profile | null, email: string, phone: string): Draft {
  return {
    full_name: p?.full_name || "", title: p?.title || "", headline: p?.headline || "", sector: p?.sector || "",
    atoll: p?.atoll || "", island: p?.island || "", years: p?.years != null ? String(p.years) : "",
    summary: p?.summary || "", availability: p?.availability || [], skills: (p?.skills || []).join(", "),
    experience: p?.experience || [], education: p?.education || [],
    languages: p?.languages?.length ? p.languages : [{ name: "Dhivehi", level: "Native" }, { name: "English", level: "Professional" }],
    certifications: p?.certifications || [], photo_path: p?.photo_path || null,
    published: p ? p.published : true, open_to_work: p?.open_to_work || false, show_contact: p?.show_contact || false,
    email, phone,
  };
}

export default function MyCvPage() {
  const { user, profile, ready, refresh } = useAuth();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const [apps, setApps] = useState<MyApplication[]>([]);
  const [invites, setInvites] = useState<MyInvitation[]>([]);

  useEffect(() => {
    if (!user || draft) return;
    fetchContact(user.id).catch(() => null).then((c) => setDraft(toDraft(profile, c?.email || user.email || "", c?.phone || "")));
  }, [user, profile, draft]);

  const loadSide = () => {
    if (!user) return;
    fetchMyApplications(user.id).then(setApps).catch(() => {});
    fetchMyInvitations(user.id).then(setInvites).catch(() => {});
  };
  useEffect(loadSide, [user]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!ready) return <Skeletons n={3} />;
  if (!user) return <RequireSignIn what="create your free CV" />;
  if (!draft) return <Skeletons n={3} />;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => { setDraft({ ...draft, [k]: v }); setDirty(true); };
  const setRow = <K extends "experience" | "education" | "languages" | "certifications">(k: K, i: number, patch: Partial<Draft[K][number]>) =>
    set(k, draft[k].map((r, j) => (j === i ? { ...r, ...patch } : r)) as Draft[K]);
  const addRow = <K extends "experience" | "education" | "languages" | "certifications">(k: K, row: Draft[K][number]) => set(k, [...draft[k], row] as Draft[K]);
  const delRow = (k: "experience" | "education" | "languages" | "certifications", i: number) => set(k, draft[k].filter((_, j) => j !== i) as never);

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!draft.full_name.trim() || !draft.title.trim()) { toast("Add your full name and job title before saving.", true); document.getElementById(draft.full_name.trim() ? "cv-title" : "cv-name")?.focus(); return; }
    const years = draft.years === "" ? null : Math.max(0, Math.min(60, Number(draft.years) || 0));
    const row = {
      id: user.id, full_name: draft.full_name.trim(), title: draft.title.trim(), headline: draft.headline.trim(),
      sector: draft.sector, atoll: draft.atoll, island: draft.island.trim(), years, summary: draft.summary.trim(),
      availability: draft.availability, skills: draft.skills.split(",").map((s) => s.trim()).filter(Boolean),
      experience: draft.experience.filter((x) => x.role || x.org), education: draft.education.filter((x) => x.qualification || x.institution),
      languages: draft.languages.filter((x) => x.name), certifications: draft.certifications.filter((x) => x.name),
      photo_path: draft.photo_path, published: draft.published, open_to_work: draft.open_to_work, show_contact: draft.show_contact,
    };
    setSaving(true);
    try {
      const p = await supabase.from("profiles").upsert(row);
      if (p.error) throw p.error;
      const c = await supabase.from("profile_contacts").upsert({ user_id: user.id, email: draft.email.trim() || null, phone: draft.phone.trim() || null });
      if (c.error) throw c.error;
      setDirty(false);
      await refresh();
      toast(row.published ? "CV saved and listed in Talent" : "CV saved");
    } catch (err) { toast(errorMessage(err), true); }
    setSaving(false);
  };

  // The open-to-work switch saves straight away once a CV exists.
  const toggleOpen = async (on: boolean) => {
    setDraft({ ...draft, open_to_work: on });
    if (!profile) { setDirty(true); return; }
    const { error } = await supabase.from("profiles").update({ open_to_work: on }).eq("id", user.id);
    if (error) { setDraft({ ...draft, open_to_work: !on }); toast(errorMessage(error), true); return; }
    await refresh();
    toast(on ? "You're marked as open to work" : "Open to work is off");
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    try { toast("Uploading…"); const path = await uploadPhoto(user.id, file, "avatar"); set("photo_path", path); toast("Photo added. Save your CV to keep it."); }
    catch (err) { toast(errorMessage(err), true); }
  };

  const improve = async () => {
    setImproving(true);
    try {
      const before = draft.summary;
      const text = await improveText("summary", draft.summary, {
        name: draft.full_name, title: draft.title, sector: draft.sector, location: [draft.island, draft.atoll].filter(Boolean).join(", "),
        years: draft.years, roles: draft.experience.map((x) => [x.role, x.org].filter(Boolean).join(" at ")).join("; "),
        skills: draft.skills, openTo: draft.availability.join(", "),
      });
      set("summary", text); setUndo(before);
    } catch { toast("Writing help isn't available right now.", true); }
    setImproving(false);
  };

  const appliedJobs = new Set(apps.map((a) => a.job_id));
  const openInvites = invites.filter((i) => i.job && !isClosed(i.job) && !appliedJobs.has(i.job_id));

  return (
    <>
      <Intro eyebrow="My CV" title={profile ? <>Keep your CV <em>current</em></> : <>Create your <em>CV</em></>}
        lede="Free for everyone. Companies see it when you apply, and anyone can find it in Talent when it's listed." />
      <div className="layout">
        <form onSubmit={save} noValidate>
          <div className="card panel open-card">
            <label className="switch-row" htmlFor="cv-open">
              <span><strong>Open to new challenges</strong><br /><span className="muted small">Adds an "Open to work" badge to your CV and lists you first for hiring managers.{profile ? " Changes save straight away." : ""}</span></span>
              <input type="checkbox" className="switch" role="switch" id="cv-open" checked={draft.open_to_work} onChange={(e) => toggleOpen(e.target.checked)} />
            </label>
          </div>

          <div className="card panel">
            <div className="panel-head"><h2>About you</h2></div>
            <div className="upload">
              <Avatar name={draft.full_name} path={draft.photo_path} large />
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input id="cv-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                  <label className="btn small" htmlFor="cv-photo">{draft.photo_path ? "Change photo" : "Add a photo"}</label>
                  {draft.photo_path && <button type="button" className="btn small ghost danger" onClick={() => set("photo_path", null)}>Remove photo</button>}
                </div>
                <span className="muted small">A clear head-and-shoulders photo. JPG, PNG or WebP.</span>
              </div>
            </div>
            <div className="grid2">
              <Field id="cv-name" label="Full name"><input id="cv-name" type="text" autoComplete="name" value={draft.full_name} onChange={(e) => set("full_name", e.target.value)} required /></Field>
              <Field id="cv-title" label="Job title"><input id="cv-title" type="text" value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Sous Chef" required /></Field>
            </div>
            <Field id="cv-headline" label="Headline" hint="one line"><input id="cv-headline" type="text" value={draft.headline} onChange={(e) => set("headline", e.target.value)} placeholder="e.g. 9 years in luxury resort kitchens across Baa and Raa" /></Field>
            <div className="grid3">
              <Field id="cv-sector" label="Sector"><Select id="cv-sector" value={draft.sector} onChange={(v) => set("sector", v)} options={SECTORS} blank="Choose…" /></Field>
              <Field id="cv-atoll" label="Atoll"><Select id="cv-atoll" value={draft.atoll} onChange={(v) => set("atoll", v)} options={ATOLLS} blank="Choose…" /></Field>
              <Field id="cv-island" label="Island"><input id="cv-island" type="text" value={draft.island} onChange={(e) => set("island", e.target.value)} placeholder="e.g. Hulhumalé" /></Field>
            </div>
            <div className="grid3">
              <Field id="cv-email" label="Email"><input id="cv-email" type="email" autoComplete="email" value={draft.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field id="cv-phone" label="Phone"><input id="cv-phone" type="tel" autoComplete="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+960 7xx xxxx" /></Field>
              <Field id="cv-years" label="Years of experience"><input id="cv-years" type="number" min={0} max={60} value={draft.years} onChange={(e) => set("years", e.target.value)} /></Field>
            </div>
          </div>

          <div className="card panel">
            <div className="panel-head">
              <h2>Summary</h2>
              <div style={{ display: "flex", gap: 6 }}>
                {undo !== null && <button type="button" className="btn small ghost" onClick={() => { set("summary", undo); setUndo(null); }}>Undo</button>}
                <button type="button" className="btn small ai" onClick={improve} disabled={improving}><SparkIcon /> {improving ? "Writing…" : "Improve with Claude"}</button>
              </div>
            </div>
            <textarea id="cv-summary" rows={5} value={draft.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Two or three sentences on what you do best and what you're looking for." aria-label="Summary" />
            <div className="field"><span>Open to</span>
              <div className="toggle-chips">
                {AVAILABILITY.map((a, i) => (
                  <label key={a}><input type="checkbox" id={`cv-av-${i}`} checked={draft.availability.includes(a)}
                    onChange={(e) => set("availability", AVAILABILITY.filter((x) => (x === a ? e.target.checked : draft.availability.includes(x))))} /> {a}</label>
                ))}
              </div>
            </div>
          </div>

          <div className="card panel">
            <div className="panel-head"><h2>Experience</h2></div>
            {draft.experience.map((x, i) => (
              <div className="row-item" key={i}>
                <div className="row-top"><strong className="small">{x.role || "New role"}</strong><button type="button" className="btn small ghost danger" onClick={() => delRow("experience", i)}>Remove</button></div>
                <div className="grid2">
                  <Field id={`cv-x${i}-role`} label="Role"><input id={`cv-x${i}-role`} type="text" value={x.role} onChange={(e) => setRow("experience", i, { role: e.target.value })} /></Field>
                  <Field id={`cv-x${i}-org`} label="Employer"><input id={`cv-x${i}-org`} type="text" value={x.org} onChange={(e) => setRow("experience", i, { org: e.target.value })} /></Field>
                </div>
                <div className="grid3">
                  <Field id={`cv-x${i}-place`} label="Location"><input id={`cv-x${i}-place`} type="text" value={x.place} onChange={(e) => setRow("experience", i, { place: e.target.value })} placeholder="e.g. Baa Atoll" /></Field>
                  <Field id={`cv-x${i}-from`} label="From"><input id={`cv-x${i}-from`} type="text" value={x.from} onChange={(e) => setRow("experience", i, { from: e.target.value })} placeholder="2019" /></Field>
                  <Field id={`cv-x${i}-to`} label="To"><input id={`cv-x${i}-to`} type="text" value={x.to} onChange={(e) => setRow("experience", i, { to: e.target.value })} placeholder="Present" /></Field>
                </div>
                <Field id={`cv-x${i}-desc`} label="What you did"><textarea id={`cv-x${i}-desc`} rows={3} value={x.details} onChange={(e) => setRow("experience", i, { details: e.target.value })} /></Field>
              </div>
            ))}
            <button type="button" className="add-row" onClick={() => addRow("experience", blankExp())}>+ Add a role</button>
          </div>

          <div className="card panel">
            <div className="panel-head"><h2>Education</h2></div>
            {draft.education.map((x, i) => (
              <div className="row-item" key={i}>
                <div className="row-top"><strong className="small">{x.qualification || "New qualification"}</strong><button type="button" className="btn small ghost danger" onClick={() => delRow("education", i)}>Remove</button></div>
                <div className="grid3">
                  <Field id={`cv-e${i}-q`} label="Qualification"><input id={`cv-e${i}-q`} type="text" value={x.qualification} onChange={(e) => setRow("education", i, { qualification: e.target.value })} placeholder="e.g. Diploma in Culinary Arts" /></Field>
                  <Field id={`cv-e${i}-inst`} label="Institution"><input id={`cv-e${i}-inst`} type="text" value={x.institution} onChange={(e) => setRow("education", i, { institution: e.target.value })} placeholder="e.g. Maldives National University" /></Field>
                  <Field id={`cv-e${i}-year`} label="Year"><input id={`cv-e${i}-year`} type="text" value={x.year} onChange={(e) => setRow("education", i, { year: e.target.value })} /></Field>
                </div>
              </div>
            ))}
            <button type="button" className="add-row" onClick={() => addRow("education", blankEdu())}>+ Add a qualification</button>
          </div>

          <div className="card panel">
            <div className="panel-head"><h2>Skills, languages and certificates</h2></div>
            <Field id="cv-skills" label="Skills" hint="separate with commas"><input id="cv-skills" type="text" value={draft.skills} onChange={(e) => set("skills", e.target.value)} placeholder="e.g. HACCP, menu costing, team leadership" /></Field>
            <div className="field"><span>Languages</span>
              <div className="list-rows">
                {draft.languages.map((l, i) => (
                  <div className="grid3" style={{ alignItems: "end" }} key={i}>
                    <input id={`cv-l${i}-name`} type="text" aria-label="Language" value={l.name} onChange={(e) => setRow("languages", i, { name: e.target.value })} />
                    <Select id={`cv-l${i}-lvl`} label="Level" value={l.level} onChange={(v) => setRow("languages", i, { level: v })} options={LANG_LEVELS} />
                    <button type="button" className="btn small ghost danger" onClick={() => delRow("languages", i)}>Remove</button>
                  </div>
                ))}
              </div>
              <button type="button" className="add-row" onClick={() => addRow("languages", { name: "", level: "Professional" })}>+ Add a language</button>
            </div>
            <div className="field"><span>Certificates and licences <small>(PADI, HACCP, STCW, ACCA…)</small></span>
              <div className="list-rows">
                {draft.certifications.map((c, i) => (
                  <div className="grid3" style={{ alignItems: "end" }} key={i}>
                    <input id={`cv-c${i}-name`} type="text" aria-label="Certificate" placeholder="Certificate" value={c.name} onChange={(e) => setRow("certifications", i, { name: e.target.value })} />
                    <input id={`cv-c${i}-issuer`} type="text" aria-label="Issued by" placeholder="Issued by" value={c.issuer} onChange={(e) => setRow("certifications", i, { issuer: e.target.value })} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <input id={`cv-c${i}-year`} type="text" aria-label="Year" placeholder="Year" value={c.year} onChange={(e) => setRow("certifications", i, { year: e.target.value })} />
                      <button type="button" className="btn small ghost danger" onClick={() => delRow("certifications", i)} aria-label="Remove certificate">×</button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="add-row" onClick={() => addRow("certifications", blankCert())}>+ Add a certificate</button>
            </div>
          </div>

          <div className="card panel">
            <label className="check"><input type="checkbox" id="cv-published" checked={draft.published} onChange={(e) => set("published", e.target.checked)} /> <span><strong>List my CV in the Talent directory.</strong><br /><span className="muted small">Unticked, your CV is still sent to companies you apply to.</span></span></label>
            <label className="check"><input type="checkbox" id="cv-contact" checked={draft.show_contact} onChange={(e) => set("show_contact", e.target.checked)} /> <span><strong>Show my email and phone on my CV.</strong><br /><span className="muted small">Unticked, only companies you apply to see them. Others can invite you to apply instead.</span></span></label>
            <div className="savebar">
              <span className="muted small">{dirty ? "Unsaved changes" : profile ? `Saved ${fmtDate(profile.updated_at)}` : "Not saved yet"}</span>
              <div style={{ display: "flex", gap: 8 }}>
                {profile && <Link className="btn" to={`/cv/${profile.slug}`}>View public CV</Link>}
                <button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save CV"}</button>
              </div>
            </div>
          </div>
        </form>

        <aside className="side">
          {openInvites.length > 0 && (
            <div className="card panel">
              <div className="panel-head"><h2>Invitations</h2><span className="chip brand">{openInvites.length}</span></div>
              <div className="list-rows">
                {openInvites.map((i) => (
                  <div className="app-row" key={i.id}>
                    <div style={{ minWidth: 0 }}><div className="name">{i.job!.title}</div><div className="muted small">{i.job!.company?.name} invited you · {fmtDate(i.created_at)}</div></div>
                    <Link className="btn small primary" to={`/jobs/${i.job_id}`}>View and apply</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="card panel">
            <div className="panel-head"><h2>My applications</h2><span className="chip">{apps.length}</span></div>
            {apps.length ? (
              <div className="list-rows">
                {apps.map((a) => {
                  const st = STATUS_LABEL[a.status] || STATUS_LABEL.applied!;
                  return (
                    <div className="app-row" key={a.id}>
                      <div style={{ minWidth: 0 }}>
                        <div className="name">{a.job ? a.job.title : "Job no longer public"}</div>
                        <div className="muted small">{a.job?.company?.name}{a.job?.company ? " · " : ""}{fmtDate(a.created_at)}</div>
                      </div>
                      <span className={`chip ${st.cls}`}>{st.label}</span>
                      <div className="app-actions" style={{ gridColumn: "1 / -1", justifyContent: "flex-start" }}>
                        {a.job ? <Link className="btn small" to={`/jobs/${a.job_id}`}>View job</Link>
                          : <button className="btn small" onClick={async () => { try { await withdraw(a.id); loadSide(); toast("Cleared"); } catch (e) { toast(errorMessage(e), true); } }}>Clear</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="muted small">Applications you send from the Jobs board show up here with the company's decision.</p>}
          </div>
        </aside>
      </div>
    </>
  );
}
