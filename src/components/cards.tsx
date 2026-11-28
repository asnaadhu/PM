import { Link } from "react-router-dom";
import { Avatar, Deadline, Logo, PinIcon, VerifiedMark } from "./ui";
import { salaryText } from "../lib/format";
import { STATUS_LABEL } from "../lib/constants";
import type { TalentRow } from "../lib/api";
import type { Job } from "../lib/types";

export function JobCard({ job, status, saved, isNew, invited, mine }: {
  job: Job; status?: string; saved?: boolean; isNew?: boolean; invited?: boolean; mine?: boolean;
}) {
  const sal = salaryText(job);
  const st = status ? STATUS_LABEL[status] : null;
  return (
    <Link className="card job" to={`/jobs/${job.id}`}>
      <div className="job-main">
        <Logo name={job.company?.name || ""} path={job.company?.logo_path} />
        <div style={{ minWidth: 0 }}>
          <h3>{job.title}</h3>
          <div className="org">{job.company?.name}{job.company?.verified && <VerifiedMark />}</div>
          <div className="meta">
            <span className="chip">{job.type}</span>
            {job.atoll && <span className="chip"><PinIcon /> {job.atoll}{job.island ? ` · ${job.island}` : ""}</span>}
            {job.accommodation && <span className="chip brand">Accommodation provided</span>}
            {st && <span className={`chip ${st.cls}`}>{st.label}</span>}
            {mine && <span className="chip brand">Your job</span>}
            {isNew && !mine && <span className="chip ok">New</span>}
            {saved && <span className="chip">Saved</span>}
            {invited && !st && <span className="chip brand">Invited</span>}
          </div>
        </div>
      </div>
      <div className="right">
        {sal && <span className="salary">{sal}<span className="muted"> /mo</span></span>}
        <Deadline job={job} />
      </div>
    </Link>
  );
}

export function PersonCard({ p }: { p: TalentRow }) {
  return (
    <Link className="card person" to={`/cv/${p.slug}`}>
      <div className="person-head">
        <Avatar name={p.full_name} path={p.photo_path} />
        <div style={{ minWidth: 0 }}>
          <h3>{p.full_name}{p.verified && <VerifiedMark />}</h3>
          <div className="title">{p.title}</div>
        </div>
      </div>
      <div className="chips">
        {p.open_to_work && <span className="chip ok">Open to work</span>}
        {p.atoll && <span className="chip"><PinIcon /> {p.atoll}</span>}
        {p.years ? <span className="chip">{p.years} yrs</span> : null}
        {p.sector && <span className="chip">{p.sector}</span>}
      </div>
      {p.availability?.length > 0 && (
        <div className="chips">{p.availability.slice(0, 3).map((a) => <span key={a} className="chip brand">{a}</span>)}</div>
      )}
    </Link>
  );
}
