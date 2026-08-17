import React, { useState, useMemo } from "react";
import { Save, Globe, Sparkles, Plus, Trash2, MapPin, Briefcase, GraduationCap, Award, Layers, CircleCheck as CheckCircle, Eye, Upload, Download, Palette, User } from "lucide-react";
import { UserProfile, IndustryType, ThemeType, Experience, ProjectItem, SkillItem, Education, Certification, AtollRecord } from "../types";
import { MALDIVES_INDUSTRIES, getActiveAtollRegistry } from "../data/atolls";
import { aiEnhanceBio, aiSuggestSkills } from "../services/api";
import { PositionSelector } from "./PositionSelector";

interface ProfileEditorProps {
  initialProfile: UserProfile;
  onSave: (updatedProfile: UserProfile, publish: boolean) => void;
  onPreview: (slug: string) => void;
  onOpenAiAssistant: (fieldToUpdate?: string) => void;
  activeTab?: "basic" | "bio" | "experience" | "projects" | "skills" | "certifications" | "education" | "theme";
  onTabChange?: (tab: "basic" | "bio" | "experience" | "projects" | "skills" | "certifications" | "education" | "theme") => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  initialProfile,
  onSave,
  onPreview,
  onOpenAiAssistant,
  activeTab: externalActiveTab,
  onTabChange,
}) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [internalActiveTab, setInternalActiveTab] = useState<
    "basic" | "bio" | "experience" | "projects" | "skills" | "certifications" | "education" | "theme"
  >("basic");
  
  // Dynamic Atolls registry state
  const [activeAtolls, setActiveAtolls] = useState<AtollRecord[]>(() => getActiveAtollRegistry());

  React.useEffect(() => {
    const handleRegistryUpdate = () => {
      setActiveAtolls(getActiveAtollRegistry());
    };
    window.addEventListener("atoll-registry-updated", handleRegistryUpdate);
    return () => window.removeEventListener("atoll-registry-updated", handleRegistryUpdate);
  }, []);

  const activeTab = externalActiveTab || internalActiveTab;

  const handleTabChange = (tab: "basic" | "bio" | "experience" | "projects" | "skills" | "certifications" | "education" | "theme") => {
    setInternalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate Profile Completeness Score
  const completionScore = useMemo(() => {
    let score = 0;
    if (profile.fullName && profile.title) score += 20;
    if (profile.bio && profile.bio.length > 50) score += 20;
    if (profile.experiences.length > 0) score += 15;
    if (profile.education.length > 0) score += 10;
    if (profile.skills.length >= 3) score += 15;
    if (profile.projects.length >= 1) score += 10;
    if (profile.certifications.length >= 1) score += 10;
    return Math.min(100, score);
  }, [profile]);

  // Handle updates
  const updateField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Island selection helper based on selected Atoll
  const currentAtollIslands = useMemo(() => {
    const atollObj = activeAtolls.find((a) => a.name === profile.atoll);
    if (atollObj && atollObj.islands.length > 0) {
      return atollObj.islands.map((i) => i.name);
    }
    // Fallback to first available active atoll's islands or default
    return activeAtolls[0]?.islands.map((i) => i.name) || ["Malé", "Hulhumalé"];
  }, [profile.atoll, activeAtolls]);

  // AI Bio Assistant triggered inline
  const handleGenerateAiBio = async () => {
    setIsAiLoading(true);
    try {
      const enhanced = await aiEnhanceBio({
        fullName: profile.fullName,
        currentTitle: profile.title,
        industry: profile.industry,
        atoll: profile.atoll,
        rawBio: profile.bio,
        tone: "Executive & Prestigious",
      });
      updateField("bio", enhanced);
      showToast("Bio successfully polished with Gemini AI!");
    } catch (e) {
      showToast("Error generating bio");
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Skill Recommendations
  const handleSuggestSkills = async () => {
    setIsAiLoading(true);
    try {
      const res = await aiSuggestSkills({
        title: profile.title,
        industry: profile.industry,
      });
      if (res.skills && res.skills.length > 0) {
        const newSkills: SkillItem[] = res.skills.map((s, idx) => ({
          id: `sk_gen_${Date.now()}_${idx}`,
          name: s,
          category: "Industry Specialist",
          proficiency: "Advanced",
        }));
        const existingNames = new Set(profile.skills.map((s) => s.name.toLowerCase()));
        const toAdd = newSkills.filter((s) => !existingNames.has(s.name.toLowerCase()));
        updateField("skills", [...profile.skills, ...toAdd]);
        showToast(`Added ${toAdd.length} AI suggested skills!`);
      }
    } catch (e) {
      showToast("Error suggesting skills");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Experience handlers
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      role: "Senior Executive",
      company: "Company or Resort Name",
      location: "Kaafu Atoll, Maldives",
      startDate: "2023-01",
      isCurrent: true,
      description: "Leading core operations and strategic development initiatives.",
      achievements: ["Delivered key strategic milestones with high team satisfaction."],
      skills: ["Project Management", "Leadership"],
    };
    updateField("experiences", [newExp, ...profile.experiences]);
  };

  const removeExperience = (id: string) => {
    updateField("experiences", profile.experiences.filter((e) => e.id !== id));
  };

  const updateExperience = (id: string, updated: Partial<Experience>) => {
    updateField(
      "experiences",
      profile.experiences.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  // Project handlers
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      title: "Flagship Island Project",
      clientOrOrg: "Maldives Partner / Resort",
      year: "2024",
      description: "Brief summary of the initiative, impact, and innovations implemented.",
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
      tags: ["Maldives", "Strategy", "Innovation"],
      metrics: "Positive stakeholder impact outcome",
    };
    updateField("projects", [...profile.projects, newProj]);
  };

  const removeProject = (id: string) => {
    updateField("projects", profile.projects.filter((p) => p.id !== id));
  };

  // Certifications handlers
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert_${Date.now()}`,
      name: "Professional Certificate",
      issuer: "Certifying Body / Authority",
      issueDate: "2023-06",
    };
    updateField("certifications", [...profile.certifications, newCert]);
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${profile.slug}-portfolio-maldives.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Portfolio backup JSON downloaded!");
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.fullName && parsed.slug) {
          setProfile(parsed);
          showToast("Portfolio profile imported successfully!");
        }
      } catch (err) {
        showToast("Invalid JSON portfolio file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-[#2A2A2A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white px-5 py-3 rounded-lg shadow-xl border border-[#8B4513] text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Header Bar */}
      <div className="sticky top-18 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E7E2DA] shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-sm sm:text-base font-black text-[#1C1917] flex items-center gap-2 font-display">
              <span>Editing CV:</span>
              <span className="text-[#8B4513] font-bold truncate max-w-xs">
                {profile.fullName || "Untitled Profile"}
              </span>
            </h1>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider ${
                profile.isPublished
                  ? "bg-[#8B4513]/10 text-[#8B4513] border border-[#8B4513]/30"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {profile.isPublished ? "● Live on Directory" : "○ Draft Mode"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPreview(profile.slug)}
              className="px-3 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#F2ECE4] border border-[#E7E2DA] text-[#1C1917] text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-[#8B4513]" />
              <span>Preview</span>
            </button>

            <button
              id="editor-save-draft-btn"
              onClick={() => {
                onSave(profile, false);
                showToast("Draft saved locally!");
              }}
              className="px-3.5 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#F2ECE4] border border-[#E7E2DA] text-[#57534E] text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              id="editor-publish-btn"
              onClick={() => {
                onSave(profile, true);
                showToast("🎉 Portfolio published to Portfolio Maldives!");
              }}
              className="px-4 py-1.5 rounded-md bg-[#8B4513] hover:bg-[#73380F] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Publish Live</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Profile Completeness Score Card */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#E7E2DA] shadow-2xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#78716C]">
                  Profile Completeness
                </span>
                <span className="text-xs font-mono font-bold text-[#8B4513]">
                  {completionScore}%
                </span>
              </div>
              <div className="w-full bg-[#FAF9F6] border border-[#E7E2DA] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#8B4513] h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 text-xs font-mono font-bold text-[#57534E] bg-[#FAF9F6] hover:bg-[#F2ECE4] border border-[#E7E2DA] rounded-md flex items-center gap-1"
                title="Download JSON Backup"
              >
                <Download className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>Backup JSON</span>
              </button>

              <label className="px-3 py-1.5 text-xs font-mono font-bold text-[#57534E] bg-[#FAF9F6] hover:bg-[#F2ECE4] border border-[#E7E2DA] rounded-md flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Editor Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Tabs Sidebar — horizontal scroll on mobile, vertical sidebar on desktop */}
          <div className="lg:col-span-1 bg-[#FFFFFF] p-3 rounded-xl border border-[#E7E2DA] shadow-2xs h-fit">
            <div className="flex lg:flex-col gap-1.5 lg:gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:pb-0">
              {[
                { id: "basic", label: "1. Identity & Specialty", icon: User },
                { id: "bio", label: "2. Bio & Summary", icon: Sparkles },
                { id: "experience", label: "3. Work Experience", icon: Briefcase },
                { id: "projects", label: "4. Portfolio Projects", icon: Layers },
                { id: "skills", label: "5. Skills & Languages", icon: CheckCircle },
                { id: "certifications", label: "6. Certifications", icon: Award },
                { id: "education", label: "7. Education", icon: GraduationCap },
                { id: "theme", label: "8. Theme & Layout", icon: Palette },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-left text-xs font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 lg:shrink lg:w-full ${
                      activeTab === tab.id
                        ? "bg-[#FAF9F6] text-[#8B4513] border border-[#E7E2DA] shadow-2xs"
                        : "text-[#57534E] hover:bg-[#FAF9F6] hover:text-[#1C1917] border border-transparent"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${activeTab === tab.id ? "text-[#8B4513]" : "text-[#78716C]"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Public Link Key — desktop only */}
            <div className="hidden lg:block pt-4 mt-3 border-t border-[#E7E2DA] px-2 text-xs">
              <span className="font-mono font-bold text-[#78716C] block mb-1 text-[10px] uppercase tracking-widest">Public URL:</span>
              <p className="text-[11px] font-mono text-[#8B4513] bg-[#FAF9F6] p-2 rounded-md break-all border border-[#E7E2DA] font-semibold">
                {window.location.origin}/p/{profile.slug}
              </p>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="lg:col-span-3 bg-[#FFFFFF] p-4 sm:p-6 lg:p-8 rounded-xl border border-[#E7E2DA] shadow-2xs">
            {/* TAB 1: BASIC IDENTITY */}
            {activeTab === "basic" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-[#1C1917] font-display">
                    Basic Identity & Maldivian Location
                  </h2>
                  <p className="text-xs font-mono text-[#78716C] mt-0.5">
                    This appears at the top of your public CV card and search directory.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs sm:text-sm font-mono font-semibold text-[#1C1917] focus:bg-white focus:outline-hidden focus:border-[#8B4513]"
                      placeholder="e.g. Ahmed Rameez"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      URL Slug (Public Link Key) *
                    </label>
                    <input
                      type="text"
                      value={profile.slug}
                      onChange={(e) =>
                        updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                      }
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs sm:text-sm font-mono text-[#1C1917] focus:bg-white focus:outline-hidden focus:border-[#8B4513]"
                      placeholder="e.g. ahmed-rameez"
                    />
                  </div>
                </div>

                <PositionSelector
                  value={profile.title}
                  onChange={(val) => updateField("title", val)}
                  label="Professional Title / Role *"
                  categoryHint={profile.industry}
                  required
                />

                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={profile.headline}
                    onChange={(e) => updateField("headline", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs sm:text-sm text-[#1C1917] focus:bg-white focus:outline-hidden focus:border-[#8B4513]"
                    placeholder="e.g. Pioneering Sustainable Gastronomy across 5-Star Maldives Resorts"
                  />
                </div>

                {/* Industry and Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={profile.industry}
                      onChange={(e) => updateField("industry", e.target.value as IndustryType)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs sm:text-sm font-mono font-semibold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    >
                      {MALDIVES_INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={profile.yearsOfExperience}
                      onChange={(e) => updateField("yearsOfExperience", Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs sm:text-sm font-mono font-semibold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      min={0}
                      max={50}
                    />
                  </div>
                </div>

                {/* Maldivian Geographic Location */}
                <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E7E2DA] space-y-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#8B4513]">
                    <MapPin className="w-3.5 h-3.5 text-[#8B4513]" />
                    <span>Maldives Location Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                        Atoll / Administrative Division
                      </label>
                      <select
                        value={profile.atoll}
                        onChange={(e) => {
                          const atollName = e.target.value;
                          const atollObj = activeAtolls.find((a) => a.name === atollName);
                          updateField("atoll", atollName);
                          if (atollObj && atollObj.islands.length > 0) {
                            updateField("island", atollObj.islands[0].name);
                          }
                        }}
                        className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs sm:text-sm font-mono font-semibold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      >
                        {activeAtolls.map((a) => (
                          <option key={a.id} value={a.name}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                        Island / City
                      </label>
                      <select
                        value={profile.island}
                        onChange={(e) => updateField("island", e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs sm:text-sm font-mono font-semibold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      >
                        {currentAtollIslands.map((isle) => (
                          <option key={isle} value={isle}>
                            {isle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Avatar and Banner URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Profile Avatar URL (Photo)
                    </label>
                    <input
                      type="text"
                      value={profile.avatarUrl}
                      onChange={(e) => updateField("avatarUrl", e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Header Banner Image URL
                    </label>
                    <input
                      type="text"
                      value={profile.coverUrl || ""}
                      onChange={(e) => updateField("coverUrl", e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Contact Channels */}
                <div className="space-y-3 pt-3 border-t border-[#E7E2DA]">
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#78716C]">
                    Contact Channels
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Phone</label>
                      <input
                        type="text"
                        value={profile.phone || ""}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                        placeholder="+960 7XX-XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={profile.whatsapp || ""}
                        onChange={(e) => updateField("whatsapp", e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                        placeholder="+9607914422"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Website</label>
                      <input
                        type="text"
                        value={profile.website || ""}
                        onChange={(e) => updateField("website", e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BIO & SUMMARY */}
            {activeTab === "bio" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-[#1C1917] font-display">
                      Executive Bio & Professional Statement
                    </h2>
                    <p className="text-xs font-mono text-[#78716C] mt-0.5">
                      Write your professional story or use Gemini AI to generate an impactful summary.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateAiBio}
                    disabled={isAiLoading}
                    className="px-3.5 py-2 bg-[#8B4513]/10 hover:bg-[#8B4513]/20 text-[#8B4513] border border-[#8B4513]/30 rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-[#8B4513] ${isAiLoading ? "animate-spin" : ""}`} />
                    <span>{isAiLoading ? "Polishing with AI..." : "Enhance with Gemini"}</span>
                  </button>
                </div>

                <div>
                  <textarea
                    rows={8}
                    value={profile.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    className="w-full p-4 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs sm:text-sm font-serif text-[#1C1917] focus:bg-white focus:outline-hidden focus:border-[#8B4513] leading-relaxed"
                    placeholder="Describe your domain expertise, key achievements across resorts or corporate organizations..."
                  />
                  <div className="flex justify-between text-[11px] font-mono text-[#78716C] mt-1">
                    <span>Recommended length: 100 – 250 words</span>
                    <span>{profile.bio.length} characters</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WORK EXPERIENCE */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[#1C1917] font-display">
                      Work Experience Timeline
                    </h2>
                    <p className="text-xs font-mono text-[#78716C] mt-0.5">
                      Add your roles at Maldivian resorts, enterprises, marine stations, or startups.
                    </p>
                  </div>

                  <button
                    onClick={addExperience}
                    className="px-3 py-1.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {profile.experiences.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="p-5 rounded-md bg-[#FAF9F6] border border-[#E7E2DA] relative space-y-3.5"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-[#E7E2DA]">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C]">
                          Role #{idx + 1}
                        </span>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="text-xs font-mono text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Job Title</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono font-bold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Company / Resort</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                            placeholder="YYYY-MM"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">End Date</label>
                          <input
                            type="text"
                            disabled={exp.isCurrent}
                            value={exp.endDate || ""}
                            onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] disabled:opacity-50 focus:outline-hidden focus:border-[#8B4513]"
                            placeholder="YYYY-MM"
                          />
                          <label className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-[#57534E] font-medium">
                            <input
                              type="checkbox"
                              checked={exp.isCurrent}
                              onChange={(e) => updateExperience(exp.id, { isCurrent: e.target.checked })}
                              className="accent-[#8B4513]"
                            />
                            <span>Current Role</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs text-[#2A2A2A] focus:outline-hidden focus:border-[#8B4513]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[#1C1917] font-display">
                      Featured Projects & Showcases
                    </h2>
                    <p className="text-xs font-mono text-[#78716C] mt-0.5">
                      Showcase initiatives, resort launches, or research studies.
                    </p>
                  </div>

                  <button
                    onClick={addProject}
                    className="px-3 py-1.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {profile.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-5 rounded-md bg-[#FAF9F6] border border-[#E7E2DA] relative space-y-3.5"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-[#E7E2DA]">
                        <span className="text-xs font-display font-bold text-[#1C1917]">{proj.title}</span>
                        <button
                          onClick={() => removeProject(proj.id)}
                          className="text-xs font-mono text-rose-700 hover:text-rose-900 font-bold"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Project Title</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) =>
                              updateField(
                                "projects",
                                profile.projects.map((p) => (p.id === proj.id ? { ...p, title: e.target.value } : p))
                              )
                            }
                            className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono font-bold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Client or Partner</label>
                          <input
                            type="text"
                            value={proj.clientOrOrg || ""}
                            onChange={(e) =>
                              updateField(
                                "projects",
                                profile.projects.map((p) => (p.id === proj.id ? { ...p, clientOrOrg: e.target.value } : p))
                              )
                            }
                            className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Image URL</label>
                        <input
                          type="text"
                          value={proj.imageUrl || ""}
                          onChange={(e) =>
                            updateField(
                              "projects",
                              profile.projects.map((p) => (p.id === proj.id ? { ...p, imageUrl: e.target.value } : p))
                            )
                          }
                          className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) =>
                            updateField(
                              "projects",
                              profile.projects.map((p) => (p.id === proj.id ? { ...p, description: e.target.value } : p))
                            )
                          }
                          className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs text-[#2A2A2A] focus:outline-hidden focus:border-[#8B4513]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: SKILLS & LANGUAGES */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-[#1C1917] font-display">
                      Skills & Industry Competencies
                    </h2>
                    <p className="text-xs font-mono text-[#78716C] mt-0.5">
                      List your key technical, leadership, and Maldivian domain skills.
                    </p>
                  </div>

                  <button
                    onClick={handleSuggestSkills}
                    disabled={isAiLoading}
                    className="px-3 py-1.5 bg-[#8B4513]/10 hover:bg-[#8B4513]/20 text-[#8B4513] border border-[#8B4513]/30 rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#8B4513]" />
                    <span>AI Recommendations</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-3 p-3 bg-[#FAF9F6] rounded-md border border-[#E7E2DA]"
                    >
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateField(
                            "skills",
                            profile.skills.map((s) => (s.id === skill.id ? { ...s, name: val } : s))
                          );
                        }}
                        className="flex-1 px-3 py-1.5 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono font-bold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      />

                      <select
                        value={skill.proficiency}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          updateField(
                            "skills",
                            profile.skills.map((s) => (s.id === skill.id ? { ...s, proficiency: val } : s))
                          );
                        }}
                        className="px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono font-semibold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      >
                        <option value="Expert">Expert</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Intermediate">Intermediate</option>
                      </select>

                      <button
                        onClick={() => updateField("skills", profile.skills.filter((s) => s.id !== skill.id))}
                        className="p-1 text-[#78716C] hover:text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newSk: SkillItem = {
                        id: `sk_${Date.now()}`,
                        name: "New Competency",
                        category: "Technical",
                        proficiency: "Advanced",
                      };
                      updateField("skills", [...profile.skills, newSk]);
                    }}
                    className="w-full py-2 border-2 border-dashed border-[#E7E2DA] rounded-md text-xs font-mono font-bold text-[#57534E] hover:border-[#8B4513] hover:text-[#8B4513] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Skill</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: CERTIFICATIONS */}
            {activeTab === "certifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[#1C1917] font-display">
                      Certifications & Licences
                    </h2>
                    <p className="text-xs font-mono text-[#78716C] mt-0.5">
                      PADI, HACCP, Aviation, WSET, AWS, CPA, and Maritime credentials.
                    </p>
                  </div>

                  <button
                    onClick={addCertification}
                    className="px-3 py-1.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certification</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {profile.certifications.map((cert) => (
                    <div key={cert.id} className="p-4 bg-[#FAF9F6] rounded-md border border-[#E7E2DA] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-display font-bold text-[#1C1917]">{cert.name}</span>
                        <button
                          onClick={() =>
                            updateField(
                              "certifications",
                              profile.certifications.filter((c) => c.id !== cert.id)
                            )
                          }
                          className="text-xs font-mono text-rose-700 hover:text-rose-900 font-bold"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) =>
                            updateField(
                              "certifications",
                              profile.certifications.map((c) =>
                                c.id === cert.id ? { ...c, name: e.target.value } : c
                              )
                            )
                          }
                          placeholder="Certification Name"
                          className="px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono font-bold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) =>
                            updateField(
                              "certifications",
                              profile.certifications.map((c) =>
                                c.id === cert.id ? { ...c, issuer: e.target.value } : c
                              )
                            )
                          }
                          placeholder="Issuer (e.g. PADI, AWS)"
                          className="px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: EDUCATION */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-[#1C1917] font-display">
                    Education & Qualifications
                  </h2>
                  <p className="text-xs font-mono text-[#78716C] mt-0.5">
                    Your degrees, universities, and academic honours.
                  </p>
                </div>

                <div className="space-y-3">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="p-4 bg-[#FAF9F6] rounded-md border border-[#E7E2DA] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            updateField(
                              "education",
                              profile.education.map((item) =>
                                item.id === edu.id ? { ...item, degree: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Degree / Qualification"
                          className="px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono font-bold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            updateField(
                              "education",
                              profile.education.map((item) =>
                                item.id === edu.id ? { ...item, institution: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Institution / University"
                          className="px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: THEME & VISIBILITY */}
            {activeTab === "theme" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-[#1C1917] font-display">
                    Portfolio Visual Theme & Visibility
                  </h2>
                  <p className="text-xs font-mono text-[#78716C] mt-0.5">
                    Select a color scheme for your digital portfolio page.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[
                    { id: "saddle-heritage", name: "Saddle Heritage", bg: "bg-[#8B4513]" },
                    { id: "kanditheemu-editorial", name: "Kanditheemu Editorial", bg: "bg-[#5C2E0B]" },
                    { id: "azure-island", name: "Azure Island", bg: "bg-teal-700" },
                    { id: "executive-navy", name: "Executive Navy", bg: "bg-blue-800" },
                    { id: "modern-coral", name: "Modern Coral", bg: "bg-rose-700" },
                    { id: "emerald-atoll", name: "Emerald Atoll", bg: "bg-emerald-700" },
                    { id: "oceanic-dark", name: "Oceanic Dark", bg: "bg-[#1C1917]" },
                    { id: "minimal-slate", name: "Minimal Slate", bg: "bg-[#57534E]" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateField("theme", t.id as ThemeType)}
                      className={`p-3.5 rounded-md border text-left transition-all ${
                        profile.theme === t.id
                          ? "border-[#8B4513] ring-1 ring-[#8B4513] bg-[#FAF9F6]"
                          : "border-[#E7E2DA] hover:border-[#8B4513]/40 bg-[#FFFFFF]"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md ${t.bg} mb-2.5 shadow-2xs`} />
                      <div className="font-mono font-bold text-xs text-[#1C1917]">{t.name}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#E7E2DA] flex items-center justify-between p-4 bg-[#FAF9F6] rounded-md border border-[#E7E2DA]">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#1C1917] uppercase tracking-wider">
                      Public Directory Visibility
                    </div>
                    <div className="text-xs font-mono text-[#78716C]">
                      Show profile on the national Maldives registry.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.isPublished}
                    onChange={(e) => updateField("isPublished", e.target.checked)}
                    className="w-4 h-4 accent-[#8B4513]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
