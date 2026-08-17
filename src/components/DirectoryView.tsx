import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Briefcase,
  Layers,
  ArrowRight,
  Send,
  Eye,
  CheckCircle,
  Award,
  Star,
  UserCheck,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpDown,
  Home,
  ShieldCheck,
  FileText,
  Filter
} from "lucide-react";
import { UserProfile } from "../types";
import { MALDIVES_INDUSTRIES, MALDIVES_INDUSTRIES_DETAILED } from "../data/atolls";

interface DirectoryViewProps {
  profiles: UserProfile[];
  onSelectProfile: (slug: string) => void;
  onPublishClick: () => void;
  onOpenContactModal: (profile: UserProfile) => void;
  onNavigateToHome?: () => void;
  initialSearch?: string;
  initialIndustry?: string;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  profiles,
  onSelectProfile,
  onPublishClick,
  onOpenContactModal,
  onNavigateToHome,
  initialSearch = "",
  initialIndustry = "ALL",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(initialIndustry);
  const [seniorityFilter, setSeniorityFilter] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"recent" | "experience" | "name">("recent");

  // Keep state in sync if initial props change
  useEffect(() => {
    if (initialSearch) setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialIndustry) setSelectedIndustry(initialIndustry);
  }, [initialIndustry]);

  // Selected industry detailed info
  const selectedSectorDetail = useMemo(() => {
    if (selectedIndustry === "ALL") return null;
    return MALDIVES_INDUSTRIES_DETAILED.find((s) => s.name === selectedIndustry) || null;
  }, [selectedIndustry]);

  // Helper to determine seniority level of a profile
  const getProfileSeniority = (profile: UserProfile): "Executive" | "Senior" | "Mid" | "Emerging" => {
    const titleLower = profile.title.toLowerCase();
    const expCount = profile.experiences.length;

    if (
      titleLower.includes("director") ||
      titleLower.includes("head") ||
      titleLower.includes("executive") ||
      titleLower.includes("general manager") ||
      titleLower.includes("chief") ||
      titleLower.includes("principal") ||
      expCount >= 4
    ) {
      return "Executive";
    }

    if (
      titleLower.includes("senior") ||
      titleLower.includes("lead") ||
      titleLower.includes("manager") ||
      titleLower.includes("specialist") ||
      expCount >= 2
    ) {
      return "Senior";
    }

    if (expCount >= 1) {
      return "Mid";
    }

    return "Emerging";
  };

  // Filter & Sort logic
  const filteredProfiles = useMemo(() => {
    const filtered = profiles.filter((p) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.island.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.atoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.skills.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.experiences.some(
          (e) =>
            e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.company.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesIndustry =
        selectedIndustry === "ALL" || p.industry === selectedIndustry;

      const profileSeniority = getProfileSeniority(p);
      const matchesSeniority =
        seniorityFilter === "ALL" || profileSeniority === seniorityFilter;

      const matchesAvailability =
        availabilityFilter === "ALL" ||
        p.availableFor.some((a) =>
          a.toLowerCase().includes(availabilityFilter.toLowerCase())
        );

      return matchesSearch && matchesIndustry && matchesSeniority && matchesAvailability;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === "recent") {
        const timeA = new Date(a.updatedAt || a.publishedAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.publishedAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === "experience") {
        return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
      }
      if (sortBy === "name") {
        return a.fullName.localeCompare(b.fullName);
      }
      return 0;
    });
  }, [profiles, searchTerm, selectedIndustry, seniorityFilter, availabilityFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2A2A2A] font-sans selection:bg-[#8B4513] selection:text-white">
      {/* Directory Page Header & Breadcrumb */}
      <section className="bg-[#FFFFFF] border-b border-[#E7E2DA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center space-x-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[#78716C] mb-3">
            {onNavigateToHome && (
              <>
                <button
                  onClick={onNavigateToHome}
                  className="hover:text-[#8B4513] transition-colors flex items-center gap-1"
                >
                  <Home className="w-3 h-3 text-[#8B4513]" />
                  <span>Home</span>
                </button>
                <span>/</span>
              </>
            )}
            <span className="text-[#8B4513] font-bold">National Directory</span>
            <span>/</span>
            <span>All Specialists ({profiles.length})</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-[#1C1917]">
                Maldivian Specialists Directory
              </h1>
              <p className="text-xs sm:text-sm text-[#57534E] mt-1 max-w-2xl font-normal">
                Search, filter, and review verified credentials of Maldivian executives, marine scientists, aviation captains, tech architects, and gastronomy specialists.
              </p>
            </div>

            <button
              onClick={onPublishClick}
              className="px-4 py-2.5 rounded-md bg-[#8B4513] hover:bg-[#73380F] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1.5 self-start md:self-auto active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Publish Your CV</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Directory & Filter Container */}
      <main id="search-directory" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Control Bar */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 sm:p-6 border border-[#E7E2DA] shadow-xs mb-8 transition-all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* Search Input */}
            <div className="relative sm:col-span-2 lg:col-span-5">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B4513]" />
              <input
                id="search-input-field"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search job title, industry, specialty, skill (e.g. Marine Biologist, Seaplane Captain)..."
                className="w-full pl-10 pr-12 py-2.5 bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#E7E2DA] focus:border-[#8B4513] rounded-lg text-xs sm:text-sm font-medium focus:outline-none text-[#1C1917] placeholder:text-[#A8A29E] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-[#8B4513] hover:text-[#5C2E0B] bg-[#F2ECE4] px-2 py-0.5 rounded"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Field / Industry Sector Selector */}
            <div className="sm:col-span-1 lg:col-span-3">
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B4513]" />
                <select
                  id="industry-filter-select"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#E7E2DA] focus:border-[#8B4513] rounded-lg text-xs font-mono font-semibold text-[#1C1917] focus:outline-none transition-all cursor-pointer truncate"
                >
                  <option value="ALL">All Industry Fields</option>
                  {MALDIVES_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seniority / Experience Level Filter */}
            <div className="sm:col-span-1 lg:col-span-2">
              <div className="relative">
                <TrendingUp className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B4513]" />
                <select
                  id="seniority-filter-select"
                  value={seniorityFilter}
                  onChange={(e) => setSeniorityFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#E7E2DA] focus:border-[#8B4513] rounded-lg text-xs font-mono font-semibold text-[#1C1917] focus:outline-none transition-all cursor-pointer truncate"
                >
                  <option value="ALL">All Seniority</option>
                  <option value="Executive">Executive / Lead</option>
                  <option value="Senior">Senior Specialist</option>
                  <option value="Mid">Mid-Level</option>
                  <option value="Emerging">Emerging</option>
                </select>
              </div>
            </div>

            {/* Sort Order */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="relative">
                <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B4513]" />
                <select
                  id="sort-by-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "experience" | "name")}
                  className="w-full pl-9 pr-8 py-2.5 bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#E7E2DA] focus:border-[#8B4513] rounded-lg text-xs font-mono font-semibold text-[#1C1917] focus:outline-none transition-all cursor-pointer truncate"
                >
                  <option value="recent">Recently Updated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Industry Filter Pills */}
          <div className="mt-4 pt-3.5 border-t border-[#E7E2DA] flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            <span className="font-bold text-[#8B4513] uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1 text-[10px]">
              <Layers className="w-3 h-3 text-[#8B4513]" /> FIELD:
            </span>
            <button
              onClick={() => setSelectedIndustry("ALL")}
              className={`px-3 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-all ${
                selectedIndustry === "ALL"
                  ? "bg-[#1C1917] text-white shadow-2xs"
                  : "bg-[#F2ECE4] text-[#44403C] hover:bg-[#EAE2D6]"
              }`}
            >
              All ({profiles.length})
            </button>
            {MALDIVES_INDUSTRIES.map((ind) => {
              const count = profiles.filter((p) => p.industry === ind).length;
              return (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-all ${
                    selectedIndustry === ind
                      ? "bg-[#8B4513] text-white shadow-2xs"
                      : "bg-[#F2ECE4] text-[#44403C] hover:bg-[#EAE2D6]"
                  }`}
                >
                  {ind} {count > 0 && <span className="opacity-70 font-normal ml-0.5">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Sub-Profession Role Tags when an industry is selected */}
          {selectedSectorDetail && (
            <div className="mt-3 pt-3 border-t border-[#E7E2DA] flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] shrink-0">
                Key Professions in {selectedSectorDetail.shortName}:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedSectorDetail.keyProfessions.map((prof) => (
                  <button
                    key={prof}
                    onClick={() => setSearchTerm(prof)}
                    className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                      searchTerm === prof
                        ? "bg-[#8B4513] text-white border-[#8B4513]"
                        : "bg-[#FAF9F6] text-[#44403C] hover:bg-[#EAE2D6] border-[#E7E2DA]"
                    }`}
                  >
                    {prof}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Results Summary */}
        <div className="flex items-center justify-between mb-5 font-mono text-xs">
          <div className="text-[#57534E]">
            SHOWING <span className="font-bold text-[#1C1917]">{filteredProfiles.length}</span> VERIFIED SPECIALISTS
            {selectedIndustry !== "ALL" && (
              <span className="text-[#8B4513] font-bold ml-1">• {selectedIndustry.toUpperCase()}</span>
            )}
            {seniorityFilter !== "ALL" && (
              <span className="text-[#8B4513] font-bold ml-1">• {seniorityFilter.toUpperCase()}</span>
            )}
          </div>

          {(searchTerm || selectedIndustry !== "ALL" || seniorityFilter !== "ALL" || availabilityFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedIndustry("ALL");
                setSeniorityFilter("ALL");
                setAvailabilityFilter("ALL");
              }}
              className="text-xs font-bold text-[#8B4513] hover:text-[#5C2E0B] underline"
            >
              RESET FILTERS
            </button>
          )}
        </div>

        {/* Directory Profiles Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                id={`profile-card-${profile.slug}`}
                className="bg-[#FFFFFF] rounded-xl border border-[#E7E2DA] overflow-hidden shadow-2xs hover:border-[#8B4513] flex flex-col group transition-all"
              >
                {/* Header Banner & Avatar */}
                <div className="relative h-24 bg-[#2A2421] overflow-hidden">
                  {profile.coverUrl ? (
                    <img
                      src={profile.coverUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#1C1917] to-[#2A2421]" />
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider bg-[#FAF9F6] text-[#8B4513] border border-[#E7E2DA] shadow-xs">
                      {profile.industry}
                    </span>
                  </div>
                </div>

                {/* Profile Core Info */}
                <div className="p-5 pt-0 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Avatar Offset */}
                    <div className="flex justify-between items-end -mt-10 mb-3">
                      <div className="relative">
                        <img
                          src={profile.avatarUrl}
                          alt={profile.fullName}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-xs bg-stone-100"
                        />
                        {profile.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-[#8B4513] text-white p-1 rounded-full shadow-xs" title="Verified Maldivian Specialist">
                            <CheckCircle className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Availability Tag */}
                      <span className="text-[10px] font-mono text-[#78716C] bg-[#FAF9F6] px-2 py-1 rounded border border-[#E7E2DA]">
                        {profile.availableFor[0] || "Available for Consulting"}
                      </span>
                    </div>

                    {/* Name & Title */}
                    <h3 className="text-lg font-bold font-display text-[#1C1917] group-hover:text-[#8B4513] transition-colors leading-tight">
                      {profile.fullName}
                    </h3>
                    <p className="text-xs font-mono font-semibold text-[#8B4513] mt-0.5">
                      {profile.title}
                    </p>

                    {/* Location & Experience */}
                    <div className="flex items-center text-xs font-mono text-[#78716C] mt-2 space-x-2">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 shrink-0 text-[#8B4513] mr-1" />
                        <span className="truncate">{profile.island}, {profile.atoll.split(" ")[0]}</span>
                      </div>
                      <span>•</span>
                      <span>{profile.yearsOfExperience}+ Yrs</span>
                    </div>

                    {/* Short Bio Excerpt */}
                    <p className="text-xs text-[#57534E] mt-3 line-clamp-2 leading-relaxed font-serif italic">
                      "{profile.bio}"
                    </p>

                    {/* Skills Chips */}
                    <div className="mt-3.5 flex flex-wrap gap-1">
                      {profile.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF9F6] text-[#44403C] border border-[#E7E2DA]"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {profile.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono text-[#78716C]">
                          +{profile.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="mt-5 pt-3 border-t border-[#E7E2DA] flex items-center justify-between">
                    <button
                      onClick={() => onSelectProfile(profile.slug)}
                      className="text-xs font-mono font-bold uppercase tracking-wider text-[#8B4513] hover:text-[#70350B] flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>View CV</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>

                    <button
                      onClick={() => onOpenContactModal(profile)}
                      className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-[#F2ECE4] hover:bg-[#EAE2D6] text-[#1C1917] rounded border border-[#E0D5C7] flex items-center space-x-1 transition-colors"
                    >
                      <Send className="w-2.5 h-2.5 text-[#8B4513]" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFFFF] rounded-xl p-12 text-center border border-[#E7E2DA] max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-lg bg-[#FAF9F6] text-[#8B4513] border border-[#E7E2DA] flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1C1917] font-display">No Maldivian profiles match your filter</h3>
            <p className="text-xs text-[#78716C] mt-1 mb-5">
              Try clearing your search terms or selecting "All Industry Fields".
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedIndustry("ALL");
                setSeniorityFilter("ALL");
                setAvailabilityFilter("ALL");
              }}
              className="px-4 py-2 bg-[#8B4513] hover:bg-[#73380F] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-md"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
