import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Deadline, Empty, Logo, PinIcon, Skeletons, VerifiedMark } from "../components/ui";
import { apply, fetchJob, fetchMyApplications, fetchSaved, setSaved, withdraw, type MyApplication } from "../lib/api";
import { useAuth } from "../lib/auth";
import { STATUS_LABEL } from "../lib/constants";
import { errorMessage, fmtDate, isClosed, safeUrl, salaryText } from "../lib/format";
import { useToast } from "../lib/toast";
import type { Job } from "../lib/types";
import { CopyLink } from "../components/CopyLink";

export default function JobPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const { user, profile, company } = useAuth();
  const toast = useToast();
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [mine, setMine] = useState<MyApplication | null>(null);
  const [saved, setSavedState] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { fetchJob(id).then(setJob).catch(() => setJob(null)); }, [id]);
  useEffect(() => {
    if (!user) return;
    fetchMyApplications(user.id).then((a) => setMine(a.find((x) => x.job_id === id) || null)).catch(() => {});
    fetchSaved(user.id).then((s) => setSavedState(s.has(id))).catch(() => {});
  }, [user, id]);

  if (job === undefined) return <Skeletons n={2} />;
  if (!job) return <Empty title="This job isn't on the board" action={<Link className="btn primary" to="/">Browse open jobs</Link>}>It may have been removed, or the link is wrong.</Empty>;

  const closed = isClosed(job);
  const own = company?.id === job.company_id;
  const reqs = job.requirements.split("\n").map((s) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  const site = safeUrl(job.company?.website);
  const sal = salaryText(job);

  const doApply = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await apply(job.id, user.id, note.trim().slice(0, 1500));
      const a = await fetchMyApplications(user.id);
      setMine(a.find((x) => x.job_id === job.id) || null);
      toast("Application sent");
    } catch (e) { toast(errorMessage(e), true); }
    setBusy(false);
  };
  const doWithdraw = async () => {
    if (!mine) return;
    if (!confirm) { setConfirm(true); window.setTimeout(() => setConfirm(false), 4000); return; }
    try { await withdraw(mine.id); setMine(null); setConfirm(false); toast("Application withdrawn"); }
    catch (e) { toast(errorMessage(e), true); }
  };
  const toggleSave = async () => {
    try { await setSaved(job.id, !saved); setSavedState(!saved); toast(saved ? "Removed from saved jobs" : "Job saved"); }
    catch (e) { toast(errorMessage(e), true); }
  };

  let applyBlock;
  if (own) applyBlock = <><p className="muted small">This is your company's job.</p><Link className="btn" to="/hiring">Review applicants</Link></>;
  else if (mine) {
    const st = STATUS_LABEL[mine.status] || STATUS_LABEL.applied!;
    applyBlock = (
      <>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className={`chip ${st.cls}`}>{st.label}</span><span className="muted small">Applied {fmtDate(mine.created_at)}</span>
        </div>
        <button className="btn danger" onClick={doWithdraw}>{confirm ? "Click again to withdraw" : "Withdraw application"}</button>
      </>
    );
  } else if (closed) applyBlock = <p className="muted">Applications for this job have closed.</p>;
  else if (!user) applyBlock = <><p className="muted small">Sign in for free to apply with your CV.</p><Link className="btn primary" to={`/sign-in?next=${encodeURIComponent(location.pathname)}`}>Sign in to apply</Link></>;
  else if (!profile) applyBlock = <><p className="muted small">Create your CV first. Companies see it when you apply.</p><Link className="btn primary" to="/my-cv">Create my CV</Link></>;
  else applyBlock = (
    <form className="field" style={{ gap: 10 }} onSubmit={(e) => { e.preventDefault(); doApply(); }}>
      <label className="field" htmlFor="apply-note"><span>Note to the company <small>(optional)</small></span>
        <textarea id="apply-note" rows={4} maxLength={1500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why you're a good fit, notice period, when you can start." />
      </label>
      <p className="muted small">The company sees your CV ({profile.full_name} · {profile.title}) and your contact details.</p>
      <div><button className="btn primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Apply with my CV"}</button></div>
    </form>
  );

  return (
    <>
      <Link className="back" to="/">← All jobs</Link>
      {job.company?.status !== "approved" && <div className="notice"><div><strong>Not public yet.</strong> This company is waiting for approval, so only you and the board team can see this job.</div></div>}
      <div className="detail">
        <article className="card detail-main">
          <div className="job-main">
            <Logo name={job.company?.name || ""} path={job.company?.logo_path} large />
            <div style={{ minWidth: 0 }}>
              <h1>{job.title}</h1>
              <p style={{ marginTop: 6, fontWeight: 600 }}>{job.company?.name} {job.company?.verified && <VerifiedMark />}</p>
              <div className="chips" style={{ marginTop: 10 }}>
                <span className="chip">{job.type}</span>
                {job.sector && <span className="chip">{job.sector}</span>}
                {job.atoll && <span className="chip"><PinIcon /> {job.atoll}{job.island ? ` · ${job.island}` : ""}</span>}
                {job.accommodation && <span className="chip brand">Accommodation provided</span>}
                {closed && <span className="chip">Closed</span>}
              </div>
            </div>
          </div>
          <dl className="kv">
            <dt>Salary</dt><dd>{sal ? <><span className="salary">{sal}</span> per month</> : "Not stated"}</dd>
            <dt>Closing</dt><dd><Deadline job={job} /></dd>
            <dt>Posted</dt><dd>{fmtDate(job.posted_at)}</dd>
          </dl>
          {job.description && <section><h3>About the role</h3><p className="prose">{job.description}</p></section>}
          {reqs.length > 0 && <section><h3>Requirements</h3><ul style={{ margin: 0, paddingLeft: 20, color: "var(--ink-2)" }}>{reqs.map((r, i) => <li key={i}>{r}</li>)}</ul></section>}
          {(job.company?.about || site) && (
            <section><h3>About {job.company?.name}</h3>
              {job.company?.about && <p className="prose">{job.company.about}</p>}
              {site && <p><a href={site} target="_blank" rel="noopener noreferrer">{site.replace(/^https:\/\//, "")} ↗</a></p>}
            </section>
          )}
        </article>
        <aside className="side">
          <div className="card panel">
            <div className="panel-head"><h2>Apply</h2></div>
            {applyBlock}
          </div>
          <div className="card panel">
            <div className="sheet-actions">
              {user && !own && <button className={"btn small" + (saved ? " primary" : "")} aria-pressed={saved} onClick={toggleSave}>{saved ? "Saved" : "Save job"}</button>}
              <CopyLink />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
