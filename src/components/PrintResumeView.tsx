import React from "react";
import { Printer, ArrowLeft, ShieldCheck } from "lucide-react";
import { UserProfile } from "../types";

interface PrintResumeViewProps {
  profile: UserProfile;
  onBack: () => void;
}

export const PrintResumeView: React.FC<PrintResumeViewProps> = ({ profile, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 px-4 font-sans antialiased text-[#2A2A2A]">
      {/* Top Print Toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between bg-[#FFFFFF] p-4 rounded-xl shadow-2xs border border-[#E7E2DA] print:hidden">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#FAF9F6] hover:bg-[#F2ECE4] border border-[#E7E2DA] text-[#1C1917] rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#8B4513]" />
          <span>Back to Portfolio</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-[#78716C] hidden sm:inline">
            Tip: Destination → "Save as PDF"
          </span>
          <button
            id="trigger-print-now-btn"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable A4 CV */}
      <div className="max-w-4xl mx-auto bg-[#FFFFFF] p-8 sm:p-12 shadow-sm rounded-xl border border-[#E7E2DA] print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
        {/* CV Header */}
        <header className="border-b border-[#E7E2DA] pb-5 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black font-display text-[#1C1917] tracking-tight">
                {profile.fullName}
              </h1>
              <p className="text-sm font-mono font-bold uppercase tracking-wider text-[#8B4513] mt-0.5">
                {profile.title}
              </p>
              <p className="text-xs font-mono text-[#78716C] mt-1">
                {profile.island}, {profile.atoll.split(" ")[0]} Atoll, Maldives
              </p>
            </div>

            <div className="text-xs font-mono text-[#57534E] space-y-1 text-left sm:text-right">
              <div><strong className="text-[#1C1917]">Email:</strong> {profile.email}</div>
              {profile.phone && <div><strong className="text-[#1C1917]">Phone:</strong> {profile.phone}</div>}
              {profile.website && <div><strong className="text-[#1C1917]">Web:</strong> {profile.website}</div>}
              {profile.linkedin && <div><strong className="text-[#1C1917]">LinkedIn:</strong> {profile.linkedin}</div>}
            </div>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="mb-5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-1 mb-2">
            Executive Summary
          </h2>
          <p className="text-xs text-[#44403C] leading-relaxed font-serif italic text-justify">
            "{profile.bio}"
          </p>
        </section>

        {/* Experience */}
        <section className="mb-5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-1 mb-2.5">
            Professional Experience
          </h2>
          <div className="space-y-3.5">
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-[#1C1917]">
                  <span className="font-display text-sm sm:text-base">{exp.role}</span>
                  <span className="text-[11px] font-mono font-semibold text-[#78716C]">
                    {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                  </span>
                </div>
                <div className="text-[#8B4513] font-mono text-[11px] font-semibold mb-1">
                  {exp.company} • {exp.location}
                </div>
                <p className="text-[#57534E] mb-1.5 leading-relaxed">{exp.description}</p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[#57534E]">
                    {exp.achievements.map((ach, idx) => (
                      <li key={idx}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Education & Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <section>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-1 mb-2">
              Education & Academic Credentials
            </h2>
            <div className="space-y-2.5">
              {profile.education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="font-bold text-[#1C1917] font-display">{edu.degree}</div>
                  <div className="text-[#78716C] font-mono text-[11px]">{edu.institution} ({edu.startYear} – {edu.endYear})</div>
                  <div className="text-[#57534E]">{edu.fieldOfStudy}</div>
                  {edu.honors && <div className="text-[#8B4513] font-serif italic">{edu.honors}</div>}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-1 mb-2">
              Licences & Certifications
            </h2>
            <div className="space-y-1.5">
              {profile.certifications.map((c) => (
                <div key={c.id} className="text-xs">
                  <div className="font-bold text-[#1C1917] font-display">{c.name}</div>
                  <div className="text-[#78716C] font-mono text-[10px]">
                    {c.issuer} ({c.issueDate}) {c.credentialId && `• ID: ${c.credentialId}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Skills & Languages */}
        <section className="mb-5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-1 mb-2">
            Key Competencies & Languages
          </h2>
          <div className="text-xs text-[#57534E] font-mono space-y-1">
            <div>
              <strong className="text-[#1C1917]">Core Skills: </strong>
              {profile.skills.map((s) => s.name).join(" • ")}
            </div>
            <div>
              <strong className="text-[#1C1917]">Languages: </strong>
              {profile.languages.map((l) => `${l.language} (${l.fluency})`).join(" • ")}
            </div>
            {profile.awards && profile.awards.length > 0 && (
              <div>
                <strong className="text-[#1C1917]">Awards: </strong>
                {profile.awards.map((a) => `${a.title} (${a.issuer}, ${a.year})`).join(" • ")}
              </div>
            )}
          </div>
        </section>

        {/* Footer Verification */}
        <footer className="pt-3 border-t border-[#E7E2DA] flex items-center justify-between text-[10px] font-mono text-[#78716C]">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#8B4513]" />
            <span>Verified Maldivian Professional • Portfolio Maldives</span>
          </div>
          <div>portfoliomaldives.mv/{profile.slug}</div>
        </footer>
      </div>
    </div>
  );
};
