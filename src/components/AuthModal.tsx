import React, { useState, useEffect } from "react";
import { X, UserPlus, LogIn, Globe, ShieldCheck, Shield, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, IndustryType, AtollRecord } from "../types";
import { MALDIVES_INDUSTRIES, getActiveAtollRegistry } from "../data/atolls";
import { DEFAULT_ADMIN_PROFILE } from "../services/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProfiles: UserProfile[];
  defaultMode?: "signup" | "signin";
  onLogin: (profile: UserProfile) => void;
  onCreateProfile: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  allProfiles,
  defaultMode = "signup",
  onLogin,
  onCreateProfile,
}) => {
  const [authMode, setAuthMode] = useState<"signup" | "signin">(defaultMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState<IndustryType>("Hospitality & Luxury Resorts");
  const [activeAtolls, setActiveAtolls] = useState<AtollRecord[]>(() => getActiveAtollRegistry());
  const [atoll, setAtoll] = useState(() => {
    const list = getActiveAtollRegistry();
    return list.find((a) => a.code === "Male" || a.name.includes("Malé"))?.name || list[0]?.name || "Malé City";
  });
  const [island, setIsland] = useState(() => {
    const list = getActiveAtollRegistry();
    const defaultAtoll = list.find((a) => a.code === "Male" || a.name.includes("Malé")) || list[0];
    return defaultAtoll?.islands[0]?.name || "Malé";
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(defaultMode);
      setErrorMessage(null);
      setActiveAtolls(getActiveAtollRegistry());
    }
  }, [isOpen, defaultMode]);

  const currentAtollIslands = () => {
    const atollObj = activeAtolls.find((a) => a.name === atoll);
    return atollObj ? atollObj.islands.map((i) => i.name) : ["Malé", "Hulhumalé"];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMode === "signup") {
      // Normal User Sign Up (publishes their CV only)
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name");
        return;
      }
      if (!title.trim()) {
        setErrorMessage("Please enter your professional title");
        return;
      }
      if (!email.trim()) {
        setErrorMessage("Please enter your email address");
        return;
      }

      const slug = fullName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(Math.random() * 1000);
      const newProf: UserProfile = {
        id: `user_${Date.now()}`,
        slug: slug,
        role: "user", // Normal user role: publishes CV only
        fullName: fullName.trim(),
        title: title.trim(),
        headline: `Professional in ${industry} based in ${island}, Maldives`,
        industry: industry,
        yearsOfExperience: 3,
        bio: `${fullName.trim()} is a dedicated professional in ${industry} based in ${island}, Maldives. Focused on delivering exceptional standards and island excellence.`,
        atoll: atoll,
        island: island,
        email: email.trim(),
        phone: "+960 7XX-XXXX",
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
        coverUrl: `https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80`,
        isPublished: true,
        verified: false,
        isVerified: false,
        isFeatured: false,
        status: "active",
        availableFor: ["Full-time", "Resort Projects", "Consulting"],
        theme: "azure-island",
        skills: [
          { id: "s1", name: "Strategic Management", category: "Management & Leadership", proficiency: "Expert" },
          { id: "s2", name: "Maldives Operations", category: "Industry Specialist", proficiency: "Advanced" },
          { id: "s3", name: "Project Delivery", category: "Management & Leadership", proficiency: "Advanced" },
        ],
        experiences: [
          {
            id: "e1",
            role: title.trim(),
            company: "Leading Maldivian Organization",
            location: `${island}, Maldives`,
            startDate: "2023-01",
            isCurrent: true,
            description: "Leading core operational and professional projects.",
            achievements: ["Successfully executed island development initiatives."],
            skills: ["Leadership", "Execution"],
          },
        ],
        education: [
          {
            id: "ed1",
            degree: "Bachelor's Degree",
            institution: "The Maldives National University",
            fieldOfStudy: industry,
            startYear: "2019",
            endYear: "2022",
          },
        ],
        certifications: [],
        projects: [],
        languages: [
          { id: "l1", language: "Dhivehi", fluency: "Native / Mother Tongue" },
          { id: "l2", language: "English", fluency: "Professional Working" },
        ],
        awards: [],
        viewsCount: 1,
        updatedAt: new Date().toISOString(),
      };
      onCreateProfile(newProf);
      onClose();
    } else {
      // Unified Sign In mode (Handles both Specialists and Admins seamlessly)
      const entered = email.trim().toLowerCase();
      
      // 1. Check if entering as administrator (via admin email or admin username)
      const isAdminLogin = 
        entered === "admin@portfoliomaldives.mv" || 
        entered === "asnaadhu@gmail.com" || 
        entered === "admin" ||
        entered === "national-registry-admin";

      if (isAdminLogin) {
        const adminMatch = allProfiles.find((p) => p.role === "admin" || p.slug === "national-registry-admin") || DEFAULT_ADMIN_PROFILE;
        onLogin(adminMatch);
        onClose();
        return;
      }

      // 2. Check in allProfiles for matching email or name or slug
      const matched = allProfiles.find(
        (p) => 
          p.email.toLowerCase() === entered || 
          p.fullName.toLowerCase() === entered ||
          p.slug.toLowerCase() === entered
      );

      if (matched) {
        onLogin(matched);
        onClose();
      } else {
        // If not found, provide clear error message
        setErrorMessage("No account found with this email address. Please sign up to create your CV or select an account below.");
      }
    }
  };

  const handleQuickLoginAs = (profile: UserProfile) => {
    onLogin(profile);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#1C1917]/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            key="auth-modal-dialog"
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FAF9F6] rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E7E2DA] relative max-h-[90vh] overflow-y-auto text-[#2A2A2A]"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-md hover:bg-[#F2ECE4] text-[#78716C] hover:text-[#1C1917] transition-colors border border-transparent hover:border-[#E7E2DA]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Icon */}
            <div className="flex items-center space-x-3 mb-5 border-b border-[#E7E2DA] pb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-2xs bg-[#8B4513]">
                <Globe className="w-5 h-5 text-[#FAF9F6]" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#1C1917] font-display">
                  PORTFOLIO <span className="text-[#8B4513]">MALDIVES</span>
                </h3>
                <p className="text-[11px] font-mono text-[#78716C]">
                  National Specialist Directory & CV Portal
                </p>
                <p className="font-thaana text-[11px] text-[#8B4513] font-medium mt-0.5" dir="rtl">
                  ދިވެހިރާއްޖޭގެ ޤައުމީ ފަންނުވެރިންގެ ދަފްތަރު
                </p>
              </div>
            </div>

            {/* Two Tab Toggle (Create CV & Sign In) */}
            <div className="flex rounded-lg bg-[#F2ECE4] p-1 mb-5 text-[11px] font-mono font-bold text-[#57534E] border border-[#E7E2DA]">
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-md transition-colors ${
                  authMode === "signup" ? "bg-[#FAF9F6] text-[#8B4513] shadow-2xs border border-[#E7E2DA]" : "hover:text-[#1C1917]"
                }`}
              >
                Create CV
              </button>
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-md transition-colors ${
                  authMode === "signin" ? "bg-[#FAF9F6] text-[#8B4513] shadow-2xs border border-[#E7E2DA]" : "hover:text-[#1C1917]"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Informational banner based on mode */}
            {authMode === "signup" && (
              <div className="mb-4 p-2.5 rounded-md bg-[#F2ECE4] border border-[#E7E2DA] flex items-start gap-2 text-[11px] font-mono text-[#57534E]">
                <CheckCircle2 className="w-4 h-4 text-[#8B4513] shrink-0 mt-0.5" />
                <span>
                  <strong>New Specialist Account:</strong> Create and publish your digital CV to the National Registry of the Maldives.
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === "signup" ? (
                <>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ibrahim Sharaf"
                      className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Professional Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Executive Chef / Marine Biologist"
                      className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Industry Sector</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value as IndustryType)}
                      className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    >
                      {MALDIVES_INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Atoll</label>
                      <select
                        value={atoll}
                        onChange={(e) => {
                          const newAtoll = e.target.value;
                          setAtoll(newAtoll);
                          const atollObj = MALDIVES_ATOLLS.find((a) => a.name === newAtoll);
                          if (atollObj && atollObj.islands.length > 0) {
                            setIsland(atollObj.islands[0]);
                          }
                        }}
                        className="w-full px-2.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      >
                        {MALDIVES_ATOLLS.map((a) => (
                          <option key={a.code} value={a.name}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Island / City</label>
                      <select
                        value={island}
                        onChange={(e) => setIsland(e.target.value)}
                        className="w-full px-2.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                      >
                        {currentAtollIslands().map((isl) => (
                          <option key={isl} value={isl}>
                            {isl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.mv"
                      className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">Create Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    />
                  </div>
                </>
              ) : (
                /* Unified Sign In Mode for both normal specialists and administrators */
                <>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.mv or admin@portfoliomaldives.mv"
                      className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    />
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  id="auth-submit-btn"
                  type="submit"
                  className="w-full py-2.5 text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-1.5 bg-[#8B4513] hover:bg-[#73380F]"
                >
                  {authMode === "signup" ? (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account & Publish My CV</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Sign-In list (Specialists & Administrator in one unified clean list) */}
            {authMode === "signin" && (
              <div className="mt-6 pt-5 border-t border-[#E7E2DA]">
                <p className="text-[10px] font-mono font-bold text-[#78716C] uppercase tracking-widest mb-2.5">
                  Quick Sign-In (Demo Profiles):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {/* Admin Account */}
                  <button
                    type="button"
                    onClick={() => handleQuickLoginAs(DEFAULT_ADMIN_PROFILE)}
                    className="flex items-center space-x-2 p-2 rounded-md border border-[#DCD5CB] bg-[#F2ECE4] hover:border-[#1C1917] hover:bg-[#E7E2DA] text-left transition-colors sm:col-span-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1C1917] text-[#C27D38] flex items-center justify-center shrink-0">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-bold text-[#1C1917] flex items-center gap-1">
                        <span>Registry Administrator</span>
                        <span className="text-[9px] px-1 py-0.2 bg-[#1C1917] text-[#FAF9F6] rounded-xs font-normal">ADMIN</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#78716C] truncate">admin@portfoliomaldives.mv</div>
                    </div>
                  </button>

                  {/* Specialist Profiles */}
                  {allProfiles
                    .filter((p) => p.role !== "admin" && p.slug !== "national-registry-admin")
                    .slice(0, 4)
                    .map((prof) => (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => handleQuickLoginAs(prof)}
                        className="flex items-center space-x-2 p-2 rounded-md border border-[#E7E2DA] bg-[#FFFFFF] hover:border-[#8B4513] hover:bg-[#F2ECE4] text-left transition-colors"
                      >
                        <img
                          src={prof.avatarUrl}
                          alt={prof.fullName}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-mono font-bold text-[#1C1917] truncate">{prof.fullName}</div>
                          <div className="text-[10px] font-mono text-[#78716C] truncate">{prof.island}</div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-[11px] font-mono text-[#78716C] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B4513]" />
                Portfolio Maldives National Specialist Directory
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
