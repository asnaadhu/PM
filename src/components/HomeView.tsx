import React, { useState, useRef, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  FileText,
  Users,
  Compass,
  Building2,
  ExternalLink,
  GraduationCap,
  Waves,
  Hotel,
  Code,
  Plane,
  Utensils,
  Camera,
  HeartPulse,
  Shield
} from "lucide-react";
import { UserProfile, IndustryType } from "../types";
import { MALDIVES_INDUSTRIES, MALDIVES_INDUSTRIES_DETAILED, IndustrySectorInfo } from "../data/atolls";

interface HomeViewProps {
  profiles: UserProfile[];
  onSelectProfile: (slug: string) => void;
  onNavigateToDirectory: (industry?: string, search?: string) => void;
  onPublishClick: () => void;
  onOpenContactModal: (profile: UserProfile) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profiles,
  onSelectProfile,
  onNavigateToDirectory,
  onPublishClick,
  onOpenContactModal,
}) => {
  const [homeSearchTerm, setHomeSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const carouselRef = useRef<HTMLDivElement>(null);

  // Sort profiles by updatedAt descending for the "Recently Updated" carousel
  const recentlyUpdatedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.publishedAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.publishedAt || 0).getTime();
      return timeB - timeA;
    });
  }, [profiles]);

  // Featured / Active professionals filtered by category
  const activeSpotlightProfiles = useMemo(() => {
    if (activeCategory === "ALL") {
      return profiles;
    }
    return profiles.filter((p) => p.industry === activeCategory);
  }, [profiles, activeCategory]);

  // Scroll handler for the horizontal carousel
  const handleScrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Helper to format relative time for "Recently Updated"
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Recently updated";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "Updated just now";
      if (diffInHours < 24) return `Updated ${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return "Updated yesterday";
      if (diffInDays < 30) return `Updated ${diffInDays}d ago`;
      return `Updated ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    } catch {
      return "Recently updated";
    }
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToDirectory(undefined, homeSearchTerm.trim());
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2A2A2A] font-sans selection:bg-[#8B4513] selection:text-white">
      {/* 1. HERO MARKETING SECTION */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-14 sm:pb-18 px-4 sm:px-6 lg:px-8 border-b border-[#E7E2DA]">
        <div className="max-w-6xl mx-auto">
          {/* Top Eyebrow Tagline */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-6 border-b border-[#E7E2DA] font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8B4513]">
            <div className="flex items-center space-x-3">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B4513]" />
                REPUBLIC OF MALDIVES NATIONAL TALENT DIRECTORY
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[#78716C]">
              <span className="w-6 h-[1px] bg-[#8B4513]/40 hidden sm:inline-block"></span>
              <span>{profiles.length} VERIFIED MALDIVIAN SPECIALISTS</span>
            </div>
          </div>

          {/* Main Hero Header */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 relative">
              <div className="absolute -top-10 -left-6 select-none pointer-events-none font-display font-black text-8xl sm:text-9xl text-[#F0EBE1]/70 z-0">
                MV
              </div>

              <div className="relative z-10">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-[#1C1917] leading-[1.08]">
                  Maldives' Premier<br />
                  <span className="italic font-serif font-normal text-[#8B4513]">Professional Talent</span> Registry
                </h1>

                <p className="mt-5 text-sm sm:text-base text-[#57534E] leading-relaxed max-w-xl font-normal">
                  Discover top Maldivian resort executives, marine researchers, aviation pilots, software architects, and island craftspeople. Standardized digital CVs for direct recruitment.
                </p>

                {/* Hero Search Bar */}
                <form onSubmit={handleHeroSearchSubmit} className="mt-6 max-w-xl">
                  <div className="flex items-center bg-[#FFFFFF] rounded-lg border border-[#E7E2DA] p-1.5 shadow-xs focus-within:border-[#8B4513] transition-all">
                    <Search className="w-4 h-4 ml-3 text-[#8B4513] shrink-0" />
                    <input
                      type="text"
                      value={homeSearchTerm}
                      onChange={(e) => setHomeSearchTerm(e.target.value)}
                      placeholder="Search title, industry, or skill (e.g., Executive Chef, Marine Biologist)..."
                      className="w-full px-3 py-2 text-xs sm:text-sm font-medium bg-transparent focus:outline-none text-[#1C1917] placeholder:text-[#A8A29E]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all shrink-0 active:scale-95 shadow-2xs"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Hero Quick Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    id="hero-explore-directory-btn"
                    onClick={() => onNavigateToDirectory()}
                    className="px-5 py-2.5 rounded-md bg-[#1C1917] hover:bg-[#2A2421] text-[#FAF9F6] font-mono text-xs font-bold uppercase tracking-wider shadow-2xs transition-all flex items-center space-x-2 active:scale-95"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#C27D38]" />
                    <span>Browse Full Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id="hero-publish-cv-btn"
                    onClick={onPublishClick}
                    className="px-4 py-2.5 rounded-md bg-[#F2ECE4] hover:bg-[#EAE2D6] text-[#1C1917] font-mono text-xs font-semibold uppercase tracking-wider border border-[#E0D5C7] transition-all flex items-center space-x-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#8B4513]" />
                    <span>Publish Your CV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Key Value Pillars */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-xl border border-[#E7E2DA] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA] font-mono text-[10px] uppercase tracking-wider text-[#78716C]">
                  <span className="text-[#8B4513] font-bold">NATIONAL PLATFORM</span>
                  <span>100% MALDIVIAN TALENT</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#E7E2DA] text-[#8B4513] flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold uppercase tracking-wider text-[#1C1917]">
                        Verified Full CVs
                      </h4>
                      <p className="text-[#57534E] font-sans mt-0.5 leading-relaxed">
                        Authentic credentials with verified PADI, ICAO, HACCP, and academic degrees.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#E7E2DA] text-[#8B4513] flex items-center justify-center shrink-0 mt-0.5">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold uppercase tracking-wider text-[#1C1917]">
                        Direct Recruiter Outreach
                      </h4>
                      <p className="text-[#57534E] font-sans mt-0.5 leading-relaxed">
                        Connect with candidates directly via Email & WhatsApp with zero agency intermediary fees.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#E7E2DA] text-[#8B4513] flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold uppercase tracking-wider text-[#1C1917]">
                        10 Strategic Industry Sectors
                      </h4>
                      <p className="text-[#57534E] font-sans mt-0.5 leading-relaxed">
                        Spanning Luxury Resorts, Marine Conservation, Aviation Piloting, Software Architecture, and Island Craft.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-between font-mono text-[10px] text-[#78716C]">
                  <span>ZERO COMMISSION</span>
                  <span className="text-[#8B4513] font-bold">FREE CV HOSTING</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 'RECENTLY UPDATED' HORIZONTAL CAROUSEL SECTION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E7E2DA] bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto">
          {/* Carousel Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#8B4513] mb-1">
                <Clock className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>ACTIVE CAREER UPDATES</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1C1917] tracking-tight">
                Recently Updated Profiles
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-normal">
                Maldivian specialists who recently refreshed their credentials, roles, and project portfolios.
              </p>
            </div>

            {/* Left/Right Carousel Controls */}
            <div className="flex items-center space-x-2 self-start sm:self-auto font-mono text-xs">
              <button
                id="carousel-scroll-left-btn"
                onClick={() => handleScrollCarousel("left")}
                aria-label="Scroll left"
                className="p-2 rounded-md bg-[#FFFFFF] hover:bg-[#FAF9F6] border border-[#E7E2DA] text-[#1C1917] hover:text-[#8B4513] shadow-2xs transition-all active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="carousel-scroll-right-btn"
                onClick={() => handleScrollCarousel("right")}
                aria-label="Scroll right"
                className="p-2 rounded-md bg-[#FFFFFF] hover:bg-[#FAF9F6] border border-[#E7E2DA] text-[#1C1917] hover:text-[#8B4513] shadow-2xs transition-all active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToDirectory()}
                className="ml-2 px-3 py-2 rounded-md bg-[#FAF9F6] hover:bg-[#EAE2D6] border border-[#E7E2DA] text-[#8B4513] font-bold uppercase text-[11px] tracking-wider transition-colors hidden md:inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Track Container */}
          <div
            ref={carouselRef}
            className="flex items-stretch space-x-4 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#D5CDC0]"
            style={{ scrollbarWidth: "thin" }}
          >
            {recentlyUpdatedProfiles.map((profile) => (
              <div
                key={profile.id}
                id={`carousel-item-${profile.slug}`}
                className="w-80 sm:w-84 shrink-0 snap-start bg-[#FFFFFF] rounded-xl border border-[#E7E2DA] hover:border-[#8B4513] p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Status & Timestamp */}
                  <div className="flex items-center justify-between text-[10px] font-mono mb-3 pb-2.5 border-b border-[#E7E2DA]">
                    <span className="px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider bg-[#F4EFEB] text-[#8B4513] border border-[#E2DDD5]">
                      {profile.industry.split(" ")[0]}
                    </span>
                    <span className="text-[#78716C] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-[#8B4513]" />
                      {formatTimeAgo(profile.updatedAt)}
                    </span>
                  </div>

                  {/* Profile Identity */}
                  <div className="flex items-start space-x-3.5 mb-3">
                    <div className="relative shrink-0">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="w-13 h-13 rounded-lg object-cover ring-1 ring-[#8B4513]/20 bg-stone-100"
                      />
                      {profile.verified && (
                        <div
                          className="absolute -bottom-1 -right-1 bg-[#8B4513] text-white p-0.5 rounded-full shadow-2xs"
                          title="Verified Maldivian Specialist"
                        >
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-sm text-[#1C1917] group-hover:text-[#8B4513] transition-colors truncate">
                        {profile.fullName}
                      </h3>
                      <p className="text-xs font-mono font-semibold text-[#8B4513] truncate mt-0.5">
                        {profile.title}
                      </p>
                      <div className="flex items-center text-[10px] font-mono text-[#78716C] mt-1 truncate">
                        <MapPin className="w-3 h-3 mr-0.5 text-[#8B4513] shrink-0" />
                        <span className="truncate">{profile.island}, {profile.atoll.split(" ")[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Company / Headline */}
                  <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed mb-3 font-serif italic">
                    "{profile.headline || profile.bio}"
                  </p>

                  {/* Top Skills Badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {profile.skills.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-xs bg-[#FAF9F6] text-[#57534E] border border-[#E7E2DA]"
                      >
                        {s.name}
                      </span>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="text-[9px] font-mono text-[#78716C] self-center">
                        +{profile.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-between font-mono text-xs">
                  <button
                    onClick={() => onSelectProfile(profile.slug)}
                    className="text-xs font-bold uppercase tracking-wider text-[#8B4513] hover:text-[#70350B] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View CV</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onOpenContactModal(profile)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#F2ECE4] hover:bg-[#EAE2D6] text-[#1C1917] rounded border border-[#E0D5C7] flex items-center gap-1 transition-colors"
                  >
                    <Send className="w-2.5 h-2.5 text-[#8B4513]" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 'ACTIVE MALDIVIAN PROFESSIONALS' SPOTLIGHT SECTION */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-[#E7E2DA]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#8B4513] mb-1">
                <Star className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>NATIONAL TALENT SPOTLIGHT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1C1917] tracking-tight">
                Active Maldivian Professionals
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] mt-1">
                Browse leading specialists ready for resort projects, executive leadership, and technical advisory.
              </p>
            </div>

            {/* View Full Directory Link */}
            <button
              onClick={() => onNavigateToDirectory(activeCategory === "ALL" ? undefined : activeCategory)}
              className="font-mono text-xs font-bold uppercase tracking-wider text-[#8B4513] hover:text-[#70350B] flex items-center gap-1.5 group self-start md:self-auto"
            >
              <span>Explore All {profiles.length} Specialists in Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Filter Sector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 font-mono text-xs scrollbar-none">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeCategory === "ALL"
                  ? "bg-[#1C1917] text-white shadow-2xs"
                  : "bg-[#F2ECE4] text-[#44403C] hover:bg-[#EAE2D6]"
              }`}
            >
              All Sectors ({profiles.length})
            </button>

            {MALDIVES_INDUSTRIES.slice(0, 6).map((ind) => {
              const count = profiles.filter((p) => p.industry === ind).length;
              return (
                <button
                  key={ind}
                  onClick={() => setActiveCategory(ind)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
                    activeCategory === ind
                      ? "bg-[#8B4513] text-white shadow-2xs"
                      : "bg-[#F2ECE4] text-[#44403C] hover:bg-[#EAE2D6]"
                  }`}
                >
                  {ind} {count > 0 && <span className="opacity-75 ml-0.5">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Professionals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSpotlightProfiles.slice(0, 6).map((profile) => (
              <div
                key={profile.id}
                className="bg-[#FFFFFF] rounded-xl border border-[#E7E2DA] hover:border-[#8B4513] p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={profile.avatarUrl}
                          alt={profile.fullName}
                          className="w-14 h-14 rounded-xl object-cover ring-1 ring-[#8B4513]/20 bg-stone-100"
                        />
                        {profile.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-[#8B4513] text-white p-0.5 rounded-full shadow-2xs">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold font-display text-[#1C1917] group-hover:text-[#8B4513] transition-colors leading-tight">
                          {profile.fullName}
                        </h3>
                        <p className="text-xs font-mono font-semibold text-[#8B4513] mt-0.5">
                          {profile.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono text-[#78716C] mb-2.5">
                    <span className="px-2 py-0.5 rounded-sm bg-[#FAF9F6] border border-[#E7E2DA] font-semibold text-[#8B4513]">
                      {profile.industry}
                    </span>
                    <span>• {profile.yearsOfExperience}+ Years</span>
                  </div>

                  <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed mb-3">
                    {profile.bio}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {profile.skills.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-xs bg-[#FAF9F6] text-[#44403C] border border-[#E7E2DA]"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-between font-mono text-xs">
                  <button
                    onClick={() => onSelectProfile(profile.slug)}
                    className="text-xs font-bold uppercase tracking-wider text-[#8B4513] hover:text-[#70350B] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View CV</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onOpenContactModal(profile)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#F2ECE4] hover:bg-[#EAE2D6] text-[#1C1917] rounded border border-[#E0D5C7] flex items-center gap-1 transition-colors"
                  >
                    <Send className="w-2.5 h-2.5 text-[#8B4513]" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Link to Full Directory */}
          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigateToDirectory(activeCategory === "ALL" ? undefined : activeCategory)}
              className="px-6 py-3 rounded-md bg-[#FAF9F6] hover:bg-[#F2ECE4] border border-[#E7E2DA] text-[#1C1917] font-mono text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-2xs"
            >
              <span>Search & Filter All {profiles.length} Profiles in Directory</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8B4513]" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. INDUSTRY SECTORS & PROFESSION DISCIPLINE EXPLORER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#E7E2DA] bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#8B4513] mb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>ECONOMIC & PROFESSIONAL DISCIPLINES</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1C1917] tracking-tight">
                Explore by Industry & Profession
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] mt-1">
                Direct access to specialized Maldivian talent clusters, executive roles, and technical vocations.
              </p>
            </div>

            <button
              onClick={() => onNavigateToDirectory()}
              className="font-mono text-xs font-bold uppercase tracking-wider text-[#8B4513] hover:text-[#70350B] flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MALDIVES_INDUSTRIES_DETAILED.map((sector) => {
              const matchedProfilesCount = profiles.filter((p) => p.industry === sector.name).length;
              return (
                <div
                  key={sector.id}
                  className="bg-white rounded-xl border border-[#E7E2DA] p-5 shadow-2xs hover:border-[#8B4513] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2.5 border-b border-[#E7E2DA]">
                      <h3 className="font-display font-bold text-sm text-[#1C1917] group-hover:text-[#8B4513] transition-colors">
                        {sector.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#F4EFEB] text-[#8B4513] border border-[#E2DDD5] shrink-0">
                        {matchedProfilesCount} {matchedProfilesCount === 1 ? "Profile" : "Profiles"}
                      </span>
                    </div>

                    <p className="text-xs text-[#57534E] leading-relaxed mb-3">
                      {sector.description}
                    </p>

                    <div className="mb-4">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                        Key Professions & Roles:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sector.keyProfessions.slice(0, 4).map((prof) => (
                          <button
                            key={prof}
                            onClick={() => onNavigateToDirectory(sector.name, prof)}
                            className="text-[9px] font-mono px-2 py-0.5 rounded-xs bg-[#FAF9F6] text-[#44403C] hover:bg-[#8B4513] hover:text-white border border-[#E7E2DA] transition-colors text-left"
                            title={`Search for ${prof}`}
                          >
                            {prof}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-between font-mono text-xs">
                    <button
                      onClick={() => onNavigateToDirectory(sector.name)}
                      className="text-xs font-bold uppercase tracking-wider text-[#8B4513] hover:text-[#70350B] flex items-center gap-1"
                    >
                      <span>Explore Sector</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <span className="text-[10px] text-[#A8A29E] font-normal">
                      Verified Credentials
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. MARKETING & VALUE PROPOSITION SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#E7E2DA] bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-sm bg-[#FAF9F6] border border-[#E7E2DA] text-[#8B4513] font-mono text-[10px] font-bold uppercase tracking-widest mb-2">
              <span>FOR PROFESSIONALS & RECRUITERS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1C1917] tracking-tight">
              Why Maldivian Leaders Choose Portfolio Maldives
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] mt-2">
              Empowering Maldivian talent with verified digital credentials and connecting island enterprises directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#FAF9F6] rounded-xl p-6 border border-[#E7E2DA] shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E7E2DA] text-[#8B4513] flex items-center justify-center shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold font-display text-base text-[#1C1917]">
                Standardized Full Digital CV
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Create a clean, executive CV showcasing your full career history, quantifiable milestones, PADI/ICAO licences, and university qualifications. Export directly to print or PDF.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAF9F6] rounded-xl p-6 border border-[#E7E2DA] shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E7E2DA] text-[#8B4513] flex items-center justify-center shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold font-display text-base text-[#1C1917]">
                Direct Island Employer Reach
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Recruiters from luxury island resorts, airlines, banks, and government agencies can reach out straight to your WhatsApp and Email without middleman recruiters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAF9F6] rounded-xl p-6 border border-[#E7E2DA] shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E7E2DA] text-[#8B4513] flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold font-display text-base text-[#1C1917]">
                Verified National Registry
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Receive official accreditation and verified status on your digital CV. Stand out with trusted, authenticated Maldivian professional identity.
              </p>
            </div>
          </div>

          {/* Metric Counter Bar */}
          <div className="mt-12 bg-[#1C1917] rounded-xl p-6 sm:p-8 text-[#FAF9F6] border border-[#2A2421] shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center font-mono">
              <div>
                <div className="text-2xl sm:text-3xl font-black font-display text-[#C27D38]">
                  {profiles.length}
                </div>
                <div className="text-[10px] text-[#A8A29E] uppercase tracking-wider mt-1">
                  Verified Specialists
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-display text-[#C27D38]">
                  10
                </div>
                <div className="text-[10px] text-[#A8A29E] uppercase tracking-wider mt-1">
                  Major Industry Sectors
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-display text-[#C27D38]">
                  50+
                </div>
                <div className="text-[10px] text-[#A8A29E] uppercase tracking-wider mt-1">
                  Specialized Professions
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-display text-[#C27D38]">
                  100%
                </div>
                <div className="text-[10px] text-[#A8A29E] uppercase tracking-wider mt-1">
                  Maldivian Talent
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA BANNER */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto bg-[#1C1917] rounded-xl p-8 sm:p-10 text-white border border-[#2A2421] shadow-sm relative overflow-hidden">
          <div className="relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-sm bg-[#2A2421] text-[#C27D38] font-mono text-[9px] font-bold uppercase tracking-widest mb-2 border border-[#3D3530]">
                <Star className="w-3 h-3 text-[#C27D38]" />
                <span>Join The National Registry</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                Publish Your Maldivian Digital CV
              </h3>
              <p className="text-xs sm:text-sm text-[#A8A29E] mt-1.5 max-w-md">
                Set up your personal CV link in minutes. Stand alongside the Maldives' top industry professionals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 font-mono text-xs shrink-0">
              <button
                onClick={onPublishClick}
                className="px-5 py-3 rounded-md bg-[#8B4513] hover:bg-[#73380F] text-white font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Publish My CV</span>
              </button>

              <button
                onClick={() => onNavigateToDirectory()}
                className="px-4 py-3 rounded-md bg-[#2A2421] hover:bg-[#38312D] text-[#FAF9F6] font-bold uppercase tracking-wider border border-[#3D3530] transition-colors"
              >
                <span>Directory</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
