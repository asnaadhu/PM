import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PersonCard } from "../components/cards";
import { Empty, Intro, Select, Skeletons } from "../components/ui";
import { fetchTalent, type TalentRow } from "../lib/api";
import { ATOLLS, AVAILABILITY, SECTORS } from "../lib/constants";
import { errorMessage } from "../lib/format";

type Sort = "updated" | "experience" | "name";

export default function TalentPage() {
  const [rows, setRows] = useState<TalentRow[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [atoll, setAtoll] = useState("");
  const [avail, setAvail] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("updated");

  useEffect(() => { fetchTalent().then(setRows).catch((e) => setError(errorMessage(e))); }, []);

  const list = useMemo(() => {
    if (!rows) return [];
    const needle = q.trim().toLowerCase();
    return rows
      .filter((p) => (!sector || p.sector === sector) && (!atoll || p.atoll === atoll) && (!avail || p.availability.includes(avail))
        && (!openOnly || p.open_to_work)
        && (!needle || [p.full_name, p.title, p.headline, p.skills.join(" "), p.island].join(" ").toLowerCase().includes(needle)))
      .sort((a, b) => sort === "experience" ? (b.years || 0) - (a.years || 0)
        : sort === "name" ? a.full_name.localeCompare(b.full_name)
        : Number(b.open_to_work) - Number(a.open_to_work) || Number(b.verified) - Number(a.verified) || b.updated_at.localeCompare(a.updated_at));
  }, [rows, q, sector, atoll, avail, openOnly, sort]);

  const clear = () => { setQ(""); setSector(""); setAtoll(""); setAvail(""); setOpenOnly(false); };
  let body;
  if (error) body = <Empty title="Couldn't load CVs">{error}</Empty>;
  else if (!rows) body = <Skeletons n={3} />;
  else if (!rows.length) body = <Empty title="No CVs listed yet" action={<Link className="btn primary" to="/my-cv">Create my CV</Link>}>Anyone can list a CV for free. Add yours to be the first.</Empty>;
  else if (!list.length) body = <Empty title="No one matches these filters" action={<button className="btn" onClick={clear}>Clear filters</button>}>Try another atoll or sector, or clear the search.</Empty>;
  else body = <div className="people">{list.map((p) => <PersonCard key={p.id} p={p} />)}</div>;

  return (
    <>
      <Intro eyebrow="Talent directory" title={<>Maldivian <em>professionals</em></>}
        lede="Free CV listings for anyone in the Maldives. Hiring managers can browse, filter for people open to work, and invite them to apply." />
      <div className="filters" role="search">
        <label><span className="lbl">Search</span><input id="tf-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, role or skill" /></label>
        <label><span className="lbl">Sector</span><Select id="tf-sector" value={sector} onChange={setSector} options={SECTORS} blank="All sectors" /></label>
        <label><span className="lbl">Atoll</span><Select id="tf-atoll" value={atoll} onChange={setAtoll} options={ATOLLS} blank="All atolls" /></label>
        <label><span className="lbl">Open to</span><Select id="tf-avail" value={avail} onChange={setAvail} options={AVAILABILITY} blank="Anything" /></label>
      </div>
      {rows && rows.length > 0 && (
        <div className="toolbar">
          <span className="muted small">{list.length === rows.length ? `${rows.length} CV${rows.length === 1 ? "" : "s"}` : `${list.length} of ${rows.length} CVs`}</span>
          <div className="tools">
            <label className="check"><input id="tf-open" type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> Open to work only <span className="muted">({rows.filter((r) => r.open_to_work).length})</span></label>
            <label className="small muted" htmlFor="tf-sort">Sort</label>
            <select id="tf-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="updated">Open to work first</option><option value="experience">Most experience</option><option value="name">Name A–Z</option>
            </select>
          </div>
        </div>
      )}
      {body}
    </>
  );
}
