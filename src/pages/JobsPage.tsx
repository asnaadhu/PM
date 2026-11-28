import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { JobCard } from "../components/cards";
import { Empty, Intro, Select, Skeletons } from "../components/ui";
import { countListedCvs, fetchMyApplications, fetchMyInvitations, fetchOpenJobs, fetchSaved } from "../lib/api";
import { useAuth } from "../lib/auth";
import { ATOLLS, JOB_TYPES, SECTORS } from "../lib/constants";
import { errorMessage, isNewSince, readLastSeen } from "../lib/format";
import type { Job } from "../lib/types";

type Sort = "newest" | "closing" | "salary";

export default function JobsPage() {
  const { user, company } = useAuth();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState("");
  const [cvCount, setCvCount] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Map<string, string>>(new Map());
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [atoll, setAtoll] = useState("");
  const [type, setType] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("newest");
  const lastSeen = useMemo(() => readLastSeen(), []);

  useEffect(() => {
    fetchOpenJobs().then(setJobs).catch((e) => setError(errorMessage(e)));
    countListedCvs().then(setCvCount).catch(() => setCvCount(null));
  }, []);

  useEffect(() => {
    if (!user) { setSaved(new Set()); setStatus(new Map()); setInvited(new Set()); return; }
    fetchSaved(user.id).then(setSaved).catch(() => {});
    fetchMyApplications(user.id).then((a) => setStatus(new Map(a.map((x) => [x.job_id, x.status])))).catch(() => {});
    fetchMyInvitations(user.id).then((i) => setInvited(new Set(i.map((x) => x.job_id)))).catch(() => {});
  }, [user]);

  const list = useMemo(() => {
    if (!jobs) return [];
    const needle = q.trim().toLowerCase();
    const pay = (j: Job) => Math.max(j.salary_min || 0, j.salary_max || 0);
    const closes = (j: Job) => (j.deadline ? new Date(j.deadline).getTime() : Infinity);
    return jobs
      .filter((j) => (!sector || j.sector === sector) && (!atoll || j.atoll === atoll) && (!type || j.type === type)
        && (!savedOnly || saved.has(j.id))
        && (!needle || [j.title, j.company?.name, j.island, j.description].join(" ").toLowerCase().includes(needle)))
      .sort((a, b) => sort === "closing" ? closes(a) - closes(b) : sort === "salary" ? pay(b) - pay(a) : b.posted_at.localeCompare(a.posted_at));
  }, [jobs, q, sector, atoll, type, savedOnly, saved, sort]);

  const hiring = jobs ? new Set(jobs.map((j) => j.company_id)).size : null;
  const clear = () => { setQ(""); setSector(""); setAtoll(""); setType(""); setSavedOnly(false); };

  let body;
  if (error) body = <Empty title="Couldn't load jobs">{error}</Empty>;
  else if (!jobs) body = <Skeletons n={4} />;
  else if (!jobs.length) body = <Empty title="No jobs posted yet" action={<Link className="btn primary" to="/hiring">Post a job</Link>}>Approved companies post openings from the Hiring tab.</Empty>;
  else if (!list.length) body = <Empty title="No jobs match these filters" action={<button className="btn" onClick={clear}>Clear filters</button>}>Try another atoll or sector, or clear the search.</Empty>;
  else body = (
    <div className="jobs">
      {list.map((j) => (
        <JobCard key={j.id} job={j} status={status.get(j.id)} saved={saved.has(j.id)} invited={invited.has(j.id)}
          mine={company?.id === j.company_id} isNew={isNewSince(j.posted_at, lastSeen)} />
      ))}
    </div>
  );

  return (
    <>
      <Intro eyebrow="Jobs board" title={<>Work across the <em>atolls</em></>}
        lede="Openings from resorts, ministries, state companies and local businesses. Apply for free with the CV you keep on Portfolio Maldives.">
        <dl className="stats">
          <div><dd>{jobs ? jobs.length : "–"}</dd><dt>Open jobs</dt></div>
          <div><dd>{hiring ?? "–"}</dd><dt>Companies hiring</dt></div>
          <div><dd>{cvCount ?? "–"}</dd><dt>CVs listed</dt></div>
        </dl>
      </Intro>
      <div className="filters" role="search">
        <label><span className="lbl">Search</span><input id="jf-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, company or island" /></label>
        <label><span className="lbl">Sector</span><Select id="jf-sector" value={sector} onChange={setSector} options={SECTORS} blank="All sectors" /></label>
        <label><span className="lbl">Atoll</span><Select id="jf-atoll" value={atoll} onChange={setAtoll} options={ATOLLS} blank="All atolls" /></label>
        <label><span className="lbl">Type</span><Select id="jf-type" value={type} onChange={setType} options={JOB_TYPES} blank="Any type" /></label>
      </div>
      {jobs && jobs.length > 0 && (
        <div className="toolbar">
          <span className="muted small">{list.length === jobs.length ? `${jobs.length} open job${jobs.length === 1 ? "" : "s"}` : `${list.length} of ${jobs.length} open jobs`}</span>
          <div className="tools">
            {user && <label className="check"><input id="jf-saved" type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} /> Saved only <span className="muted">({saved.size})</span></label>}
            <label className="small muted" htmlFor="jf-sort">Sort</label>
            <select id="jf-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="newest">Newest</option><option value="closing">Closing soon</option><option value="salary">Highest salary</option>
            </select>
          </div>
        </div>
      )}
      {body}
    </>
  );
}
