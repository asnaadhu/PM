import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Empty, PinIcon, Skeletons, VerifiedMark } from "../components/ui";
import { CopyLink } from "../components/CopyLink";
import { fetchCompanyJobs, fetchContact, fetchInvitesSent, fetchProfileBySlug, invite } from "../lib/api";
import { useAuth } from "../lib/auth";
import { errorMessage, fmtDate, isClosed } from "../lib/format";
import { downloadCvPdf } from "../lib/pdf";
import { useToast } from "../lib/toast";
import type { Job, Profile, ProfileContact } from "../lib/types";

function InviteBox({ cv }: { cv: Profile }) {
  const { company } = useAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [pick, setPick] = useState("");
  useEffect(() => {
    if (!company || company.status !== "approved") return;
    fetchCompanyJobs(company.id).then(async (all) => {
      const open = all.filter((j) => !isClosed(j));
      setJobs(open);
      setSent(await fetchInvitesSent(cv.id, open.map((j) => j.id)));
    }).catch(() => {});
  }, [company, cv.id]);
  if (!company || company.status !== "approved" || !jobs.length) return null;
  const avail = jobs.filter((j) => !sent.has(j.id));
  const sentTitles = jobs.filter((j) => sent.has(j.id)).map((j) => j.title);
  const chosen = pick || avail[0]?.id || "";
  return (
    <div className="card panel">
      <div className="panel-head"><h2>Invite to apply</h2></div>
      {sentTitles.length > 0 && <p className="muted small">Invited to {sentTitles.join(", ")}.</p>}
      {avail.length ? (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select id="invite-job" aria-label="Job to invite them to" value={chosen} onChange={(e) => setPick(e.target.value)} style={{ width: "auto", flex: 1, minWidth: 0 }}>
              {avail.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <button className="btn primary" onClick={async () => {
              try { await invite(chosen, cv.id); setSent(new Set([...sent, chosen])); setPick(""); toast("Invitation sent"); }
              catch (e) { toast(errorMessage(e), true); }
            }}>Send invitation</button>
          </div>
          <p className="muted small">They'll see it on their My CV page and can apply in one step.</p>
        </>
      ) : <p className="muted small">You've invited them to all your open jobs.</p>}
    </div>
  );
}

export default function CvPage() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [cv, setCv] = useState<Profile | null | undefined>(undefined);
  const [contact, setContact] = useState<ProfileContact | null>(null);

  useEffect(() => {
    setCv(undefined);
    fetchProfileBySlug(slug).then(async (p) => {
      setCv(p);
      if (p) setContact(await fetchContact(p.id).catch(() => null));
    }).catch(() => setCv(null));
  }, [slug, user]);

  if (cv === undefined) return <Skeletons n={2} />;
  if (!cv) return <Empty title="This CV isn't listed" action={<Link className="btn primary" to="/talent">Browse CVs</Link>}>It may be unlisted or removed, or the link is wrong.</Empty>;

  const own = user?.id === cv.id;
  const hasContact = contact && (contact.email || contact.phone);
  const copy = async (v: string) => { try { await navigator.clipboard.writeText(v); toast("Copied"); } catch { toast("Select the text and copy it."); } };

  return (
    <>
      <Link className="back" to="/talent">← All CVs</Link>
      {own && !cv.published && <div className="notice"><div><strong>Unlisted.</strong> Only you, companies you apply to and the board team can see this CV.</div></div>}
      <div className="detail">
        <article className="card detail-main">
          <div className="person-head" style={{ alignItems: "flex-start" }}>
            <Avatar name={cv.full_name} path={cv.photo_path} large />
            <div style={{ minWidth: 0 }}>
              <h1>{cv.full_name} {cv.verified && <VerifiedMark />}</h1>
              <p style={{ fontWeight: 600, marginTop: 4 }}>{cv.title}</p>
              {cv.open_to_work && <p style={{ marginTop: 6 }}><span className="chip ok">Open to new challenges</span></p>}
              {cv.headline && <p className="muted" style={{ marginTop: 4 }}>{cv.headline}</p>}
              <div className="chips" style={{ marginTop: 10 }}>
                {cv.atoll && <span className="chip"><PinIcon /> {cv.atoll}{cv.island ? ` · ${cv.island}` : ""}</span>}
                {cv.sector && <span className="chip">{cv.sector}</span>}
                {cv.years ? <span className="chip">{cv.years} years' experience</span> : null}
              </div>
            </div>
          </div>
          {cv.summary && <section><h3>Summary</h3><p className="prose">{cv.summary}</p></section>}
          {cv.availability.length > 0 && <section><h3>Open to</h3><div className="chips">{cv.availability.map((a) => <span key={a} className="chip brand">{a}</span>)}</div></section>}
          {cv.experience.length > 0 && (
            <section><h3>Experience</h3><div className="timeline">{cv.experience.map((x, i) => (
              <div className="t-item" key={i}>
                <div className="when">{[x.from, x.to].filter(Boolean).join(" – ")}</div>
                <div className="what"><strong>{x.role}</strong><span className="muted small">{[x.org, x.place].filter(Boolean).join(" · ")}</span>
                  {x.details && <p className="prose small" style={{ marginTop: 4 }}>{x.details}</p>}</div>
              </div>))}</div></section>
          )}
          {cv.education.length > 0 && (
            <section><h3>Education</h3><div className="timeline">{cv.education.map((x, i) => (
              <div className="t-item" key={i}><div className="when">{x.year}</div><div className="what"><strong>{x.qualification}</strong><span className="muted small">{x.institution}</span></div></div>))}</div></section>
          )}
          {cv.skills.length > 0 && <section><h3>Skills</h3><div className="chips">{cv.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div></section>}
          {cv.languages.length > 0 && <section><h3>Languages</h3><dl className="kv">{cv.languages.map((l, i) => <div key={i} style={{ display: "contents" }}><dt>{l.name}</dt><dd>{l.level}</dd></div>)}</dl></section>}
          {cv.certifications.length > 0 && (
            <section><h3>Certificates</h3><div className="timeline">{cv.certifications.map((c, i) => (
              <div className="t-item" key={i}><div className="when">{c.year}</div><div className="what"><strong>{c.name}</strong><span className="muted small">{c.issuer}</span></div></div>))}</div></section>
          )}
          <p className="muted small">Updated {fmtDate(cv.updated_at)}</p>
        </article>
        <aside className="side">
          <div className="card panel">
            <div className="panel-head"><h2>Contact</h2></div>
            {hasContact ? (
              <div className="contact">
                {contact!.email && <div className="contact-line"><span className="muted small" style={{ width: 48 }}>Email</span><span className="val">{contact!.email}</span><button className="btn small ghost" onClick={() => copy(contact!.email!)}>Copy</button></div>}
                {contact!.phone && <div className="contact-line"><span className="muted small" style={{ width: 48 }}>Phone</span><span className="val">{contact!.phone}</span><button className="btn small ghost" onClick={() => copy(contact!.phone!)}>Copy</button></div>}
              </div>
            ) : <p className="muted small">{cv.full_name} keeps contact details private. Companies see them when {cv.full_name.split(/\s+/)[0]} applies to one of their jobs.</p>}
            <div className="sheet-actions">
              <button className="btn small primary" onClick={() => downloadCvPdf(cv, contact).catch(() => toast("Couldn't create the PDF. Try again.", true))}>Download PDF</button>
              <CopyLink />
              {own && <Link className="btn small" to="/my-cv">Edit my CV</Link>}
            </div>
          </div>
          {!own && <InviteBox cv={cv} />}
        </aside>
      </div>
    </>
  );
}

