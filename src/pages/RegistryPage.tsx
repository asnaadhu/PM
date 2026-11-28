import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Empty, Intro, Skeletons, VerifiedMark } from "../components/ui";
import { fetchAllCompanies, fetchAllProfiles, one, type CompanyWithContact } from "../lib/api";
import { useAuth } from "../lib/auth";
import { errorMessage, fmtDate } from "../lib/format";
import { supabase } from "../lib/supabase";
import { useToast } from "../lib/toast";
import type { CompanyStatus, Profile } from "../lib/types";

export default function RegistryPage() {
  const { isAdmin, ready } = useAuth();
  const toast = useToast();
  const [companies, setCompanies] = useState<CompanyWithContact[] | null>(null);
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setCompanies(await fetchAllCompanies()); setProfiles(await fetchAllProfiles()); }
    catch (e) { toast(errorMessage(e), true); }
  }, [toast]);
  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  if (!ready) return <Skeletons n={3} />;
  if (!isAdmin) return <Empty title="Board team only" action={<Link className="btn" to="/">Back to jobs</Link>}>The registry is for Portfolio Maldives admins.</Empty>;
  if (!companies || !profiles) return <Skeletons n={3} />;

  const run = async (p: PromiseLike<{ error: unknown }>, msg: string) => {
    const { error } = await p;
    if (error) toast(errorMessage(error), true); else { toast(msg); load(); }
  };
  const armed = (key: string) => {
    if (confirm === key) { setConfirm(null); return true; }
    setConfirm(key); window.setTimeout(() => setConfirm((c) => (c === key ? null : c)), 4000); return false;
  };
  const setStatus = (id: string, status: CompanyStatus, msg: string) => run(supabase.from("companies").update({ status }).eq("id", id), msg);
  const removeCompany = (id: string) => { if (armed("c" + id)) run(supabase.from("companies").delete().eq("id", id), "Company and its jobs removed"); };
  const removeProfile = (id: string) => { if (armed("p" + id)) run(supabase.from("profiles").delete().eq("id", id), "CV removed"); };

  const requests = companies.filter((c) => c.status !== "approved");
  const approved = companies.filter((c) => c.status === "approved");
  const waiting = requests.filter((c) => c.status === "pending").length;
  const removeLabel = (key: string, label = "Remove") => (confirm === key ? "Click again to remove" : label);

  return (
    <>
      <Intro eyebrow="Registry" title={<>Verify and <em>moderate</em></>}
        lede="Approve company profiles, verify people and companies (verified ones get a badge), and remove anything that doesn't belong. Removing a company also removes its jobs.">
        <dl className="stats">
          <div><dd>{profiles.length}</dd><dt>CVs</dt></div>
          <div><dd>{approved.length}</dd><dt>Companies</dt></div>
          <div><dd>{waiting}</dd><dt>Waiting</dt></div>
        </dl>
      </Intro>

      <div className="card panel">
        <div className="panel-head"><h2>Company requests</h2><span className={`chip ${waiting ? "warn" : ""}`}>{waiting} waiting</span></div>
        {requests.length ? (
          <div className="table-wrap"><table>
            <thead><tr><th>Company</th><th>Contact</th><th>Sent</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{requests.map((c) => {
              const ct = one(c.contact);
              return (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong><div className="muted small">{[c.sector, c.atoll].filter(Boolean).join(" · ")}</div>
                    {c.about && <div className="small" style={{ maxWidth: "42ch", whiteSpace: "pre-wrap", marginTop: 4 }}>{c.about}</div>}</td>
                  <td>{ct?.contact_name}<div className="mono">{ct?.contact_email}</div><div className="mono">{ct?.contact_phone}</div></td>
                  <td>{fmtDate(c.requested_at)}</td>
                  <td>{c.status === "declined" ? <span className="chip bad">Declined</span> : <span className="chip warn">Waiting</span>}</td>
                  <td><div className="actions">
                    <button className="btn small primary" onClick={() => setStatus(c.id, "approved", "Company approved. Its job ads are now public.")}>Approve</button>
                    {c.status !== "declined" && <button className="btn small" onClick={() => setStatus(c.id, "declined", "Request declined")}>Decline</button>}
                    <button className="btn small danger" onClick={() => removeCompany(c.id)}>{removeLabel("c" + c.id)}</button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table></div>
        ) : <p className="muted">No company requests. Companies ask for a profile from the Hiring page.</p>}
      </div>

      <div className="card panel">
        <div className="panel-head"><h2>Approved companies</h2></div>
        {approved.length ? (
          <div className="table-wrap"><table>
            <thead><tr><th>Company</th><th>Sector</th><th>Jobs</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{approved.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong> {c.verified && <VerifiedMark />}</td>
                <td>{c.sector}</td><td>{c.jobs?.[0]?.count ?? 0}</td>
                <td><div className="actions">
                  <button className={"btn small" + (c.verified ? " primary" : "")} onClick={() => run(supabase.from("companies").update({ verified: !c.verified }).eq("id", c.id), c.verified ? "Verification removed" : "Marked verified")}>{c.verified ? "Verified" : "Verify"}</button>
                  <button className="btn small" onClick={() => setStatus(c.id, "pending", "Approval revoked. Its jobs are hidden.")}>Revoke approval</button>
                  <button className="btn small danger" onClick={() => removeCompany(c.id)}>{removeLabel("c" + c.id)}</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <p className="muted">No approved companies yet.</p>}
      </div>

      <div className="card panel">
        <div className="panel-head"><h2>CVs</h2></div>
        {profiles.length ? (
          <div className="table-wrap"><table>
            <thead><tr><th>Name</th><th>Title</th><th>Atoll</th><th>Listed</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{profiles.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.full_name}</strong> {p.verified && <VerifiedMark />}{p.open_to_work && <> <span className="chip ok">Open to work</span></>}</td>
                <td>{p.title}</td><td>{p.atoll}</td><td>{p.published ? "Yes" : "No"}</td>
                <td><div className="actions">
                  <Link className="btn small" to={`/cv/${p.slug}`}>View</Link>
                  <button className={"btn small" + (p.verified ? " primary" : "")} onClick={() => run(supabase.from("profiles").update({ verified: !p.verified }).eq("id", p.id), p.verified ? "Verification removed" : "Marked verified")}>{p.verified ? "Verified" : "Verify"}</button>
                  <button className="btn small danger" onClick={() => removeProfile(p.id)}>{removeLabel("p" + p.id)}</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <p className="muted">No CVs yet.</p>}
      </div>
    </>
  );
}
