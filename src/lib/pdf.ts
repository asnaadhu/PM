import { fmtDate, slugify } from "./format";
import type { Profile, ProfileContact } from "./types";

/** Builds an A4 PDF of a CV and starts the download. */
export async function downloadCvPdf(cv: Profile, contact: ProfileContact | null) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const M = 18, W = 210 - 2 * M, BOTTOM = 297 - M;
  const BROWN: [number, number, number] = [139, 69, 19], INK: [number, number, number] = [28, 25, 23], MUTED: [number, number, number] = [120, 113, 108];
  let y = M;
  const ensure = (h: number) => { if (y + h > BOTTOM) { doc.addPage(); y = M; } };
  const text = (str: string | null | undefined, o: { size?: number; style?: string; color?: [number, number, number]; gap?: number } = {}) => {
    if (!str) return;
    const size = o.size || 10, lh = size * 0.3528 * 1.4;
    doc.setFont("helvetica", o.style || "normal"); doc.setFontSize(size); doc.setTextColor(...(o.color || INK));
    for (const line of doc.splitTextToSize(String(str), W) as string[]) { ensure(lh); doc.text(line, M, y + lh * 0.75); y += lh; }
    y += o.gap ?? 1.5;
  };
  const section = (title: string) => {
    ensure(16); y += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BROWN);
    doc.text(title.toUpperCase(), M, y + 3, { charSpace: 0.4 });
    y += 5; doc.setDrawColor(214, 205, 193); doc.setLineWidth(0.2); doc.line(M, y, M + W, y); y += 3;
  };
  const join = (parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join("   ·   ");

  text(cv.full_name, { size: 22, style: "bold", gap: 0.5 });
  text(cv.title, { size: 12, color: BROWN, gap: 1 });
  text(cv.headline, { size: 10, color: MUTED, gap: 1 });
  if (cv.open_to_work) text("Open to new challenges", { size: 9, style: "bold", color: BROWN, gap: 1 });
  text(join([[cv.island, cv.atoll].filter(Boolean).join(", "), contact?.email, contact?.phone]), { size: 9, color: MUTED, gap: 2 });
  if (cv.summary) { section("Summary"); text(cv.summary); }
  if (cv.availability.length) { section("Open to"); text(cv.availability.join(", ")); }
  if (cv.experience.length) {
    section("Experience");
    for (const x of cv.experience) {
      text(x.role, { size: 11, style: "bold", gap: 0 });
      text(join([x.org, x.place, [x.from, x.to].filter(Boolean).join(" – ")]), { size: 9, color: MUTED, gap: x.details ? 0.8 : 3 });
      if (x.details) text(x.details, { gap: 3 });
    }
  }
  if (cv.education.length) {
    section("Education");
    for (const x of cv.education) { text(x.qualification, { size: 11, style: "bold", gap: 0 }); text(join([x.institution, x.year]), { size: 9, color: MUTED, gap: 3 }); }
  }
  if (cv.skills.length) { section("Skills"); text(cv.skills.join(", ")); }
  if (cv.languages.length) { section("Languages"); text(cv.languages.map((l) => `${l.name} (${l.level})`).join(", ")); }
  if (cv.certifications.length) { section("Certificates and licences"); for (const c of cv.certifications) text(join([c.name, c.issuer, c.year]), { gap: 1 }); }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text(`Portfolio Maldives · CV updated ${fmtDate(cv.updated_at)}`, M, 297 - 10);
    doc.text(`${p} / ${pages}`, 210 - M, 297 - 10, { align: "right" });
  }
  doc.save(`${slugify(cv.full_name) || "cv"}-cv.pdf`);
}
