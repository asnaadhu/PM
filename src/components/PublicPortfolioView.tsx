import React, { useState } from "react";
import { ArrowLeft, Share2, Printer, Mail, Phone, MessageSquare, Globe, Linkedin, Github, MapPin, Briefcase, GraduationCap, Award, CircleCheck as CheckCircle, ShieldCheck, Download, Copy, Check, Send, QrCode, X, ExternalLink, Sparkles, Layers, Calendar, SquareCheck as CheckSquare } from "lucide-react";
import { UserProfile } from "../types";

const AVAILABILITY_GROUPS: { title: string; options: string[] }[] = [
  {
    title: "Employment Type",
    options: [
      "Full-Time Permanent",
      "Part-Time",
      "Contract / Fixed-Term",
      "Freelance / Consulting",
      "Seasonal / Peak Season",
      "Internship / Traineeship",
      "Temporary / Short-Term Cover",
    ],
  },
  {
    title: "Work Location & Arrangement",
    options: [
      "On-Site (Resort Island / Relocation)",
      "On-Site (Greater Malé Area)",
      "On-Site (Local Inhabited Islands)",
      "Remote / Work from Home",
      "Hybrid",
      "Willing to Relocate",
      "Available for Travel / Offshore / Liveaboard",
    ],
  },
];

interface PublicPortfolioViewProps {
  profile: UserProfile;
  currentUser: UserProfile | null;
  onBackToDirectory: () => void;
  onNavigateToEditor: (slug: string) => void;
  onOpenContactModal: (profile: UserProfile) => void;
  onOpenPrintView: () => void;
  onOpenAuth: (mode?: "signup" | "signin") => void;
}

export const PublicPortfolioView: React.FC<PublicPortfolioViewProps> = ({
  profile,
  currentUser,
  onBackToDirectory,
  onNavigateToEditor,
  onOpenContactModal,
  onOpenPrintView,
  onOpenAuth,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Copy direct public CV link to clipboard
  const handleCopyLink = () => {
    const url = `${window.location.origin}/p/${profile.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isOwner = currentUser?.slug === profile.slug;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 font-sans text-[#2A2A2A] selection:bg-[#8B4513] selection:text-white">
      {/* Top Action Toolbar */}
      <div className="sticky top-16 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E7E2DA] shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Back button & Directory Slug */}
          <div className="flex items-center space-x-3">
            <button
              id="back-to-directory-btn"
              onClick={onBackToDirectory}
              className="p-1.5 px-3 rounded-md bg-[#FAF9F6] hover:bg-[#F2ECE4] border border-[#E7E2DA] text-[#1C1917] transition-all flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider active:scale-95 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#8B4513]" />
              <span>Directory</span>
            </button>
            <span className="text-[#D5CDC0] hidden sm:inline">/</span>
            <div className="text-xs font-mono text-[#78716C] hidden sm:block truncate max-w-xs">
              <span className="text-[#A8A29E]">portfoliomaldives.mv/</span>
              <span className="font-bold text-[#8B4513]">{profile.slug}</span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2 flex-wrap font-mono text-xs">
            {/* Print / Save PDF */}
            <button
              id="print-cv-btn"
              onClick={onOpenPrintView}
              className="p-1.5 px-3 bg-[#FAF9F6] hover:bg-[#F2ECE4] text-[#1C1917] border border-[#E7E2DA] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#8B4513]" />
              <span className="hidden sm:inline">Print CV</span>
            </button>

            {/* Share / Copy Link */}
            <button
              id="share-portfolio-btn"
              onClick={handleCopyLink}
              className="p-1.5 px-3 bg-[#FAF9F6] hover:bg-[#F2ECE4] text-[#1C1917] border border-[#E7E2DA] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#8B4513]" />
                  <span className="text-[#8B4513]">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#8B4513]" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* QR Code */}
            <button
              onClick={() => setShowQrModal(true)}
              className="p-1.5 px-2.5 bg-[#FAF9F6] hover:bg-[#F2ECE4] text-[#1C1917] border border-[#E7E2DA] rounded-md text-xs font-bold transition-colors"
              title="View QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-[#8B4513]" />
            </button>

            {/* Contact / Hire CTA */}
            <button
              id="portfolio-contact-modal-btn"
              onClick={() => onOpenContactModal(profile)}
              className="py-1.5 px-3.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
            >
              <Send className="w-3 h-3 text-[#FAF9F6]" />
              <span>Contact / Hire</span>
            </button>

            {/* Owner Edit OR Public Register CTA */}
            {isOwner ? (
              <button
                id="edit-current-portfolio-btn"
                onClick={() => onNavigateToEditor(profile.slug)}
                className="py-1.5 px-3.5 bg-[#1C1917] hover:bg-[#2A2421] text-white rounded-md text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1 active:scale-95"
              >
                <span>Edit My CV</span>
              </button>
            ) : (
              <button
                id="public-create-own-btn"
                onClick={() => onOpenAuth("signup")}
                className="py-1.5 px-3.5 bg-[#1C1917] hover:bg-[#2A2421] text-white rounded-md text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1 active:scale-95"
              >
                <span>Publish Your CV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Full CV Document Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <article className="bg-[#FFFFFF] rounded-xl border border-[#E7E2DA] shadow-xs overflow-hidden">
          {/* Executive Header Banner */}
          <div className="relative bg-[#1C1917] text-[#FAF9F6] px-6 sm:px-10 pt-10 pb-8 border-b border-[#2A2421]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Identity & Avatar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative shrink-0">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover ring-2 ring-[#8B4513]/40 shadow-md bg-[#2A2421]"
                  />
                  {profile.verified && (
                    <div
                      className="absolute -bottom-1 -right-1 bg-[#8B4513] text-white p-1 rounded-full ring-2 ring-[#1C1917] shadow-xs"
                      title="Verified Specialist in Maldives"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display tracking-tight">
                      {profile.fullName}
                    </h1>
                    {profile.verified && (
                      <span className="inline-flex items-center text-[10px] font-mono font-bold uppercase tracking-wider text-[#C27D38] bg-[#2A2421] px-2 py-0.5 rounded-sm border border-[#3D3530]">
                        <CheckCircle className="w-3 h-3 mr-1 text-[#C27D38]" />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="text-base sm:text-lg font-bold text-[#C27D38] font-serif italic">
                    {profile.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-[#D6D3D1] pt-0.5">
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-[#C27D38]" />
                      <span>{profile.island}, {profile.atoll.split(" ")[0]} Atoll, Maldives</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-3.5 h-3.5 mr-1 text-[#C27D38]" />
                      <span>{profile.industry}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-3.5 h-3.5 mr-1 text-[#C27D38]" />
                      <span>{profile.yearsOfExperience}+ Years Experience</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Quick Contact Buttons */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs shrink-0 self-start">
                <button
                  onClick={() => onOpenContactModal(profile)}
                  className="px-3.5 py-2 rounded-md bg-[#8B4513] hover:bg-[#73380F] text-white text-[11px] font-bold uppercase tracking-wider shadow-2xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>

                {profile.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-[11px] font-bold uppercase tracking-wider shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  onClick={onOpenPrintView}
                  className="p-2 rounded-md bg-[#2A2421] hover:bg-[#38312D] border border-[#3D3530] text-[#FAF9F6] transition-colors"
                  title="Download / Print CV"
                >
                  <Download className="w-4 h-4 text-[#C27D38]" />
                </button>
              </div>
            </div>

            {/* Contact Channels Strip */}
            <div className="mt-6 pt-4 border-t border-[#2A2421] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-mono text-[#A8A29E]">
              <div className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-[#C27D38]" />
                <a href={`mailto:${profile.email}`} className="hover:underline text-[#FAF9F6]">
                  {profile.email}
                </a>
              </div>
              {profile.phone && (
                <div className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-[#C27D38]" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center">
                  <Globe className="w-3.5 h-3.5 mr-1 text-[#C27D38]" />
                  <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline text-[#FAF9F6] flex items-center gap-1">
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {profile.linkedin && (
                <div className="flex items-center">
                  <Linkedin className="w-3.5 h-3.5 mr-1 text-[#C27D38]" />
                  <a href={`https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline text-[#FAF9F6]">
                    LinkedIn
                  </a>
                </div>
              )}
              {profile.github && (
                <div className="flex items-center">
                  <Github className="w-3.5 h-3.5 mr-1 text-[#C27D38]" />
                  <a href={`https://${profile.github}`} target="_blank" rel="noreferrer" className="hover:underline text-[#FAF9F6]">
                    GitHub
                  </a>
                </div>
              )}
            </div>

            {/* Available For Badges — organized by group, only selected shown */}
            {profile.availableFor && profile.availableFor.length > 0 && (
              <div className="mt-3 space-y-2 font-mono text-[10px]">
                {AVAILABILITY_GROUPS.map((group) => {
                  const selectedInGroup = group.options.filter((opt) =>
                    profile.availableFor.includes(opt)
                  );
                  if (selectedInGroup.length === 0) return null;
                  return (
                    <div key={group.title} className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-[#C27D38] uppercase tracking-wider mr-1">
                        {group.title}:
                      </span>
                      {selectedInGroup.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-sm font-semibold uppercase bg-[#2A2421] text-[#E7E5E4] border border-[#3D3530]"
                        >
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full CV Body Content */}
          <div className="p-6 sm:p-10 space-y-10">
            {/* 1. Professional Summary */}
            <section id="cv-summary">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-2 mb-3 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#8B4513]" />
                Professional Summary & Profile
              </h2>
              <div className="text-xs sm:text-sm text-[#44403C] leading-relaxed font-serif bg-[#FAF9F6] p-5 rounded-lg border border-[#E7E2DA]">
                {profile.bio}
              </div>
            </section>

            {/* 2. Professional Work Experience */}
            <section id="cv-experience">
              <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-2 mb-4 font-mono">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#8B4513] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8B4513]" />
                  Professional & Career Experience
                </h2>
                <span className="text-[11px] text-[#78716C] font-semibold">
                  {profile.experiences.length} ROLES RECORDED
                </span>
              </div>

              <div className="space-y-5">
                {profile.experiences.map((exp, index) => (
                  <div
                    key={exp.id || index}
                    className="bg-[#FAF9F6] rounded-xl p-5 sm:p-6 border border-[#E7E2DA] shadow-2xs hover:border-[#8B4513]/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 mb-1.5">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold font-display text-[#1C1917]">
                          {exp.role}
                        </h3>
                        <div className="text-xs font-mono font-semibold text-[#8B4513]">
                          {exp.company}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono font-semibold text-[#78716C] bg-[#FFFFFF] border border-[#E7E2DA] px-2.5 py-1 rounded-sm self-start">
                        {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-[#78716C] flex items-center mb-3">
                      <MapPin className="w-3 h-3 mr-1 text-[#8B4513]" />
                      <span>{exp.location}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#44403C] mb-3 leading-relaxed">
                      {exp.description}
                    </p>

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mb-3 bg-[#FFFFFF] p-3.5 rounded-lg border border-[#E7E2DA]">
                        <h4 className="text-[10px] font-mono font-bold text-[#8B4513] uppercase tracking-wider mb-1.5">
                          Key Quantifiable Achievements & Deliverables:
                        </h4>
                        <ul className="space-y-1">
                          {exp.achievements.map((ach, idx) => (
                            <li key={idx} className="text-xs text-[#57534E] flex items-start">
                              <span className="text-[#8B4513] font-bold mr-1.5">▪</span>
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {exp.skills && exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E7E2DA]">
                        {exp.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono uppercase font-semibold bg-[#FFFFFF] border border-[#E7E2DA] text-[#44403C] px-2 py-0.5 rounded-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Education & Academic Qualifications */}
            <section id="cv-education">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-2 mb-4 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#8B4513]" />
                Education & Academic Qualifications
              </h2>

              <div className="space-y-3">
                {profile.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="bg-[#FAF9F6] p-4 sm:p-5 rounded-xl border border-[#E7E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <h3 className="font-bold font-display text-[#1C1917] text-xs sm:text-sm">
                        {edu.degree}
                      </h3>
                      <p className="text-xs font-mono font-semibold text-[#8B4513]">
                        {edu.institution} {edu.location && `• ${edu.location}`}
                      </p>
                      <p className="text-xs text-[#57534E] mt-0.5">
                        Field of Study: {edu.fieldOfStudy}
                      </p>
                      {edu.honors && (
                        <p className="text-xs font-serif italic text-[#8B4513] mt-0.5">
                          ★ Honors: {edu.honors}
                        </p>
                      )}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-[#78716C] bg-[#FFFFFF] px-2.5 py-1 rounded-sm border border-[#E7E2DA] self-start sm:self-center">
                      {edu.startYear} – {edu.endYear}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Professional Certifications & Licences */}
            {profile.certifications && profile.certifications.length > 0 && (
              <section id="cv-certifications">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-2 mb-4 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#8B4513]" />
                  Professional Certifications & Licences
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {profile.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E7E2DA] flex items-start space-x-3"
                    >
                      <div className="p-2 rounded-md bg-[#F4EFEB] text-[#8B4513] border border-[#E2DDD5] shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#1C1917] font-display text-xs sm:text-sm truncate">
                          {cert.name}
                        </h3>
                        <p className="text-xs font-mono text-[#78716C] mt-0.5">
                          {cert.issuer}
                        </p>
                        <p className="text-[10px] font-mono text-[#A8A29E] mt-0.5">
                          Issued: {cert.issueDate} {cert.credentialId && `• ID: ${cert.credentialId}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. Core Competencies & Skills */}
            <section id="cv-skills">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-2 mb-4 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#8B4513]" />
                Core Competencies & Skills
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {profile.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E7E2DA] flex items-center justify-between gap-2"
                  >
                    <span className="font-bold text-[#1C1917] text-xs truncate">
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#8B4513] bg-[#F4EFEB] px-2 py-0.5 rounded-xs border border-[#E2DDD5] shrink-0">
                      {skill.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Featured Projects & Case Studies (if present) */}
            {profile.projects && profile.projects.length > 0 && (
              <section id="cv-projects">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-2 mb-4 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8B4513]" />
                  Key Projects, Case Studies & Publications
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-[#FAF9F6] rounded-xl p-5 border border-[#E7E2DA] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold font-display text-[#1C1917] text-sm">
                            {proj.title}
                          </h3>
                          {proj.year && (
                            <span className="text-[10px] font-mono font-bold text-[#78716C] bg-[#FFFFFF] border border-[#E7E2DA] px-2 py-0.5 rounded-xs shrink-0">
                              {proj.year}
                            </span>
                          )}
                        </div>

                        {proj.clientOrOrg && (
                          <p className="text-xs font-mono font-semibold text-[#8B4513] mb-2">
                            {proj.clientOrOrg} {proj.role && `• ${proj.role}`}
                          </p>
                        )}

                        <p className="text-xs text-[#57534E] leading-relaxed mb-3">
                          {proj.description}
                        </p>

                        {proj.metrics && (
                          <div className="mb-3 bg-[#FFFFFF] border border-[#E7E2DA] p-2 rounded text-xs font-mono font-semibold text-[#8B4513]">
                            ✦ {proj.metrics}
                          </div>
                        )}
                      </div>

                      {proj.tags && proj.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-[#E7E2DA]">
                          {proj.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono uppercase bg-[#FFFFFF] text-[#78716C] border border-[#E7E2DA] px-1.5 py-0.5 rounded-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 7. Languages & Awards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Languages */}
              <section id="cv-languages">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-2 mb-3">
                  Languages Spoken
                </h2>
                <div className="space-y-2">
                  {profile.languages.map((l) => (
                    <div
                      key={l.id}
                      className="flex justify-between items-center bg-[#FAF9F6] p-3 rounded-lg border border-[#E7E2DA] text-xs font-mono"
                    >
                      <span className="font-bold text-[#1C1917]">{l.language}</span>
                      <span className="text-[#78716C] bg-[#FFFFFF] px-2 py-0.5 rounded-sm border border-[#E7E2DA]">{l.fluency}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Awards */}
              {profile.awards && profile.awards.length > 0 ? (
                <section id="cv-awards">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8B4513] border-b border-[#E7E2DA] pb-2 mb-3">
                    Honors & Recognitions
                  </h2>
                  <div className="space-y-2">
                    {profile.awards.map((aw) => (
                      <div key={aw.id} className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E7E2DA] text-xs">
                        <div className="font-bold font-display text-[#8B4513]">★ {aw.title}</div>
                        <div className="text-[#78716C] font-mono mt-0.5 text-[10px]">
                          {aw.issuer} • {aw.year}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>

          {/* Official Registry Authentication Stamp */}
          <footer className="bg-[#FAF9F6] px-6 sm:px-10 py-5 border-t border-[#E7E2DA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#78716C]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#8B4513]" />
              <span>Verified Full CV • Republic of Maldives National Registry</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>Updated: {new Date(profile.updatedAt).toLocaleDateString()}</span>
              <button
                onClick={handleCopyLink}
                className="text-[#8B4513] font-bold hover:underline"
              >
                Copy CV URL
              </button>
            </div>
          </footer>
        </article>
      </main>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl p-6 max-w-sm w-full shadow-2xl border border-[#E7E2DA] text-center relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FAF9F6] text-[#78716C] hover:text-[#1C1917]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-lg bg-[#FAF9F6] text-[#8B4513] flex items-center justify-center mx-auto mb-3 border border-[#E7E2DA]">
              <QrCode className="w-5 h-5" />
            </div>

            <h3 className="font-bold font-display text-[#1C1917] text-base">
              Scan {profile.fullName}'s CV
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5 mb-4">
              Scan with mobile camera to view this verified Maldivian CV.
            </p>

            <div className="bg-[#FAF9F6] p-4 rounded-lg border border-[#E7E2DA] inline-block mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `${window.location.origin}/p/${profile.slug}`
                )}`}
                alt="QR Code"
                className="w-36 h-36 mx-auto"
              />
            </div>

            <div>
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied!" : "Copy Direct URL"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
