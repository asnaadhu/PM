import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "./types";
import { INITIAL_PROFILES } from "./data/initialProfiles";
import {
  getLocalProfiles,
  saveLocalProfiles,
  getAuthenticatedUserSlug,
  setAuthenticatedUserSlug,
  syncProfilesWithServer,
  publishProfile,
  saveProfileDraft,
  DEFAULT_ADMIN_PROFILE,
  isAdminUser,
} from "./services/api";
import { Navbar } from "./components/Navbar";
import { HomeView } from "./components/HomeView";
import { DirectoryView } from "./components/DirectoryView";
import { PublicPortfolioView } from "./components/PublicPortfolioView";
import { ProfileEditor } from "./components/ProfileEditor";
import { PrintResumeView } from "./components/PrintResumeView";
import { AiAssistantModal } from "./components/AiAssistantModal";
import { ContactModal } from "./components/ContactModal";
import { AuthModal } from "./components/AuthModal";
import { AdminDashboard } from "./components/AdminDashboard";

// Reserved route names that shouldn't be matched as dynamic user slugs on the root path
const RESERVED_PATHS = new Set([
  "directory",
  "editor",
  "print",
  "resume",
  "p",
  "profile",
  "portfolio",
  "ai-advisor",
  "api",
  "signin",
  "signup",
  "login",
  "settings",
  "dashboard",
  "admin",
]);

type EditorTab =
  | "basic"
  | "bio"
  | "experience"
  | "projects"
  | "skills"
  | "certifications"
  | "education"
  | "theme";

const VALID_EDITOR_TABS: EditorTab[] = [
  "basic",
  "bio",
  "experience",
  "projects",
  "skills",
  "certifications",
  "education",
  "theme",
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profiles, setProfiles] = useState<UserProfile[]>(() => getLocalProfiles());
  const [authSlug, setAuthSlug] = useState<string | null>(() => getAuthenticatedUserSlug());

  // Modals & Auth state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signup" | "signin">("signup");
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [contactModalProfile, setContactModalProfile] = useState<UserProfile | null>(null);

  // Authenticated user
  const currentUser = useMemo(() => {
    if (!authSlug) return null;
    if (authSlug === DEFAULT_ADMIN_PROFILE.slug) {
      return profiles.find((p) => p.slug === authSlug) || DEFAULT_ADMIN_PROFILE;
    }
    return profiles.find((p) => p.slug === authSlug) || null;
  }, [authSlug, profiles]);

  // Sync with server on initial load
  useEffect(() => {
    syncProfilesWithServer();
  }, []);

  // Handle backwards-compatible URL query parameters (e.g. ?profile=..., ?view=..., ?auth=..., ?ai=...)
  useEffect(() => {
    const profileParam = searchParams.get("profile");
    const viewParam = searchParams.get("view");
    const authParam = searchParams.get("auth");
    const aiParam = searchParams.get("ai");
    const contactParam = searchParams.get("contact");

    if (profileParam) {
      navigate(`/p/${profileParam.toLowerCase()}`, { replace: true });
      return;
    }

    if (viewParam === "editor") {
      navigate("/editor", { replace: true });
      return;
    } else if (viewParam === "directory") {
      navigate("/directory", { replace: true });
      return;
    }

    if (authParam === "signin" || authParam === "signup") {
      setAuthModalMode(authParam);
      setIsAuthOpen(true);
      searchParams.delete("auth");
      setSearchParams(searchParams, { replace: true });
    }

    if (aiParam === "open" || aiParam === "true") {
      setIsAiAssistantOpen(true);
      searchParams.delete("ai");
      setSearchParams(searchParams, { replace: true });
    }

    if (contactParam) {
      const match = profiles.find((p) => p.slug === contactParam);
      if (match) {
        setContactModalProfile(match);
      }
      searchParams.delete("contact");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, profiles, navigate, setSearchParams]);

  // Open Auth helper
  const handleOpenAuth = (mode: "signup" | "signin" = "signup") => {
    setAuthModalMode(mode);
    setIsAuthOpen(true);
  };

  // Central navigation handler
  const handleNavigate = useCallback(
    (view: "home" | "directory" | "portfolio" | "editor" | "print" | "admin", slug?: string) => {
      window.scrollTo({ top: 0, behavior: "smooth" });

      if (view === "home") {
        navigate("/");
      } else if (view === "directory") {
        navigate("/directory");
      } else if (view === "admin") {
        navigate("/admin");
      } else if (view === "portfolio") {
        const targetSlug = slug || (currentUser ? currentUser.slug : profiles[0]?.slug || "ahmed-rameez");
        navigate(`/p/${targetSlug}`);
      } else if (view === "editor") {
        if (!currentUser) {
          handleOpenAuth("signup");
          return;
        }
        navigate("/editor/basic");
      } else if (view === "print") {
        const targetSlug = slug || (currentUser ? currentUser.slug : profiles[0]?.slug || "ahmed-rameez");
        navigate(`/print/${targetSlug}`);
      }
    },
    [navigate, currentUser, profiles]
  );

  // Determine current active view for Navbar highlighting based on location
  const currentView = useMemo<"home" | "directory" | "portfolio" | "editor" | "print" | "admin">(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith("/admin")) return "admin";
    if (path.startsWith("/editor")) return "editor";
    if (path.startsWith("/p/") || path.startsWith("/profile/") || path.startsWith("/portfolio/")) return "portfolio";
    if (path.startsWith("/print/") || path.startsWith("/resume/")) return "print";
    if (path.startsWith("/directory")) return "directory";
    if (path === "/" || path === "") return "home";
    return "home";
  }, [location.pathname]);

  // User Sign In
  const handleLogin = (profile: UserProfile) => {
    // If logging in as admin or profile not in state, ensure it is added to profiles
    if (!profiles.some((p) => p.slug === profile.slug)) {
      const updated = [profile, ...profiles];
      setProfiles(updated);
      saveLocalProfiles(updated);
    }
    setAuthSlug(profile.slug);
    setAuthenticatedUserSlug(profile.slug);
    setIsAuthOpen(false);
    if (isAdminUser(profile)) {
      navigate("/admin");
    } else {
      navigate("/editor/basic");
    }
  };

  // User Sign Out
  const handleSignOut = () => {
    setAuthSlug(null);
    setAuthenticatedUserSlug(null);
    navigate("/");
  };

  // Create new profile from Auth modal
  const handleCreateNewProfile = (newProfile: UserProfile) => {
    const updatedList = [newProfile, ...profiles.filter((p) => p.slug !== newProfile.slug)];
    setProfiles(updatedList);
    saveLocalProfiles(updatedList);
    setAuthSlug(newProfile.slug);
    setAuthenticatedUserSlug(newProfile.slug);
    setIsAuthOpen(false);
    navigate("/editor/basic");
  };

  // Save / Publish profile changes
  const handleSaveProfile = async (updated: UserProfile, publish: boolean) => {
    let saved: UserProfile;
    if (publish) {
      saved = await publishProfile(updated);
    } else {
      saved = saveProfileDraft(updated);
    }

    setProfiles((prev) => {
      const idx = prev.findIndex((p) => p.slug === saved.slug || p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });

    setAuthSlug(saved.slug);
    setAuthenticatedUserSlug(saved.slug);
  };

  // Apply AI Generated Bio directly to active profile
  const handleApplyBio = (bio: string) => {
    const target = currentUser || profiles[0];
    if (!target) return;
    const updated = { ...target, bio };
    handleSaveProfile(updated, target.isPublished);
  };

  // Apply AI Recommended Skills directly to active profile
  const handleApplySkills = (skillNames: string[]) => {
    const target = currentUser || profiles[0];
    if (!target) return;
    const existing = new Set(target.skills.map((s) => s.name.toLowerCase()));
    const toAdd = skillNames
      .filter((s) => !existing.has(s.toLowerCase()))
      .map((name, idx) => ({
        id: `sk_ai_${Date.now()}_${idx}`,
        name,
        category: "Industry Specialist" as const,
        proficiency: "Advanced" as const,
      }));

    const updated = { ...target, skills: [...target.skills, ...toAdd] };
    handleSaveProfile(updated, target.isPublished);
  };

  // Sub-component: Portfolio Route Resolver
  const PortfolioRoute = () => {
    const { slug } = useParams<{ slug: string }>();
    const profile = profiles.find((p) => p.slug.toLowerCase() === (slug || "").toLowerCase());

    if (!profile) {
      // If not found in memory, try initial list or fallback to directory
      const fallback = INITIAL_PROFILES.find((p) => p.slug.toLowerCase() === (slug || "").toLowerCase());
      if (fallback) {
        return (
          <PublicPortfolioView
            profile={fallback}
            currentUser={currentUser}
            onBackToDirectory={() => navigate("/directory")}
            onNavigateToEditor={(s) => {
              if (currentUser) {
                navigate("/editor/basic");
              } else {
                handleOpenAuth("signup");
              }
            }}
            onOpenContactModal={(p) => setContactModalProfile(p)}
            onOpenPrintView={() => navigate(`/print/${fallback.slug}`)}
            onOpenAuth={handleOpenAuth}
          />
        );
      }
      return <Navigate to="/directory" replace />;
    }

    return (
      <PublicPortfolioView
        profile={profile}
        currentUser={currentUser}
        onBackToDirectory={() => navigate("/directory")}
        onNavigateToEditor={(s) => {
          if (currentUser) {
            navigate("/editor/basic");
          } else {
            handleOpenAuth("signup");
          }
        }}
        onOpenContactModal={(p) => setContactModalProfile(p)}
        onOpenPrintView={() => navigate(`/print/${profile.slug}`)}
        onOpenAuth={handleOpenAuth}
      />
    );
  };

  // Sub-component: Editor Route Resolver with subpath tab support
  const EditorRoute = () => {
    const { tab } = useParams<{ tab?: string }>();
    const normalizedTab: EditorTab = VALID_EDITOR_TABS.includes(tab as EditorTab)
      ? (tab as EditorTab)
      : "basic";

    if (!currentUser) {
      // Prompt signin/signup if guest tries to enter editor
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FAF9F6]">
          <div className="max-w-md w-full bg-[#FFFFFF] p-8 rounded-xl border border-[#E7E2DA] shadow-sm text-center">
            <h2 className="text-xl font-bold font-display text-[#1C1917] mb-2">
              Sign In to Edit Your Maldivian CV
            </h2>
            <p className="text-xs text-[#78716C] mb-6 leading-relaxed">
              Create a free digital portfolio or sign in with your registered Maldivian specialist account to access the CV editor.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center font-mono text-xs">
              <button
                onClick={() => handleOpenAuth("signin")}
                className="px-4 py-2.5 bg-[#F2ECE4] hover:bg-[#E5DDD0] text-[#1C1917] font-bold rounded-md uppercase tracking-wider transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleOpenAuth("signup")}
                className="px-4 py-2.5 bg-[#8B4513] hover:bg-[#73380F] text-white font-bold rounded-md uppercase tracking-wider shadow-2xs transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <ProfileEditor
        key={currentUser.id}
        initialProfile={currentUser}
        activeTab={normalizedTab}
        onTabChange={(nextTab) => {
          navigate(`/editor/${nextTab}`, { replace: false });
        }}
        onSave={handleSaveProfile}
        onPreview={(s) => navigate(`/p/${s}`)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />
    );
  };

  // Sub-component: Print / Resume PDF View Route Resolver
  const PrintRoute = () => {
    const { slug } = useParams<{ slug: string }>();
    const targetSlug = slug || (currentUser ? currentUser.slug : profiles[0]?.slug);
    const profile = profiles.find((p) => p.slug.toLowerCase() === (targetSlug || "").toLowerCase()) || profiles[0] || INITIAL_PROFILES[0];

    return (
      <PrintResumeView
        profile={profile}
        onBack={() => navigate(`/p/${profile.slug}`)}
      />
    );
  };

  // Sub-component: Dynamic Root Slug Route Resolver (e.g. /ahmed-rameez)
  const DynamicSlugRoute = () => {
    const { slug } = useParams<{ slug: string }>();
    if (!slug || RESERVED_PATHS.has(slug.toLowerCase())) {
      return <Navigate to="/directory" replace />;
    }

    const match = profiles.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) ||
                  INITIAL_PROFILES.find((p) => p.slug.toLowerCase() === slug.toLowerCase());

    if (match) {
      return <Navigate to={`/p/${match.slug}`} replace />;
    }

    return <Navigate to="/directory" replace />;
  };

  const isPrintView = location.pathname.startsWith("/print") || location.pathname.startsWith("/resume");

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2A2A2A] flex flex-col font-sans">
      {/* Heritage Navigation Header (hidden on print / PDF export view) */}
      {!isPrintView && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        />
      )}

      {/* Routes Switcher with Elegant Open Zoom */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.96, y: 8, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col"
          >
            <Routes location={location}>
              {/* Root Home Route */}
              <Route
                path="/"
                element={
                  <HomeView
                    profiles={profiles}
                    onSelectProfile={(slug) => navigate(`/p/${slug}`)}
                    onNavigateToDirectory={(industry, search) => {
                      const params = new URLSearchParams();
                      if (industry && industry !== "ALL") params.set("industry", industry);
                      if (search) params.set("search", search);
                      const query = params.toString();
                      navigate(`/directory${query ? `?${query}` : ""}`);
                    }}
                    onPublishClick={() => {
                      if (currentUser) {
                        navigate("/editor/basic");
                      } else {
                        handleOpenAuth("signup");
                      }
                    }}
                    onOpenContactModal={(prof) => setContactModalProfile(prof)}
                  />
                }
              />
              {/* Dedicated Full Directory Route */}
              <Route
                path="/directory"
                element={
                  <DirectoryView
                    profiles={profiles}
                    initialSearch={searchParams.get("search") || ""}
                    initialIndustry={searchParams.get("industry") || "ALL"}
                    onNavigateToHome={() => navigate("/")}
                    onSelectProfile={(slug) => navigate(`/p/${slug}`)}
                    onPublishClick={() => {
                      if (currentUser) {
                        navigate("/editor/basic");
                      } else {
                        handleOpenAuth("signup");
                      }
                    }}
                    onOpenContactModal={(prof) => setContactModalProfile(prof)}
                  />
                }
              />

              {/* Admin Management Console */}
              <Route
                path="/admin"
                element={
                  <AdminDashboard
                    currentUser={currentUser}
                    allProfiles={profiles}
                    onNavigate={handleNavigate}
                    onRefreshProfiles={() => {
                      const fresh = getLocalProfiles();
                      setProfiles(fresh);
                    }}
                    onOpenAuth={(mode) => handleOpenAuth(mode || "admin")}
                  />
                }
              />
              <Route
                path="/dashboard"
                element={
                  <AdminDashboard
                    currentUser={currentUser}
                    allProfiles={profiles}
                    onNavigate={handleNavigate}
                    onRefreshProfiles={() => {
                      const fresh = getLocalProfiles();
                      setProfiles(fresh);
                    }}
                    onOpenAuth={(mode) => handleOpenAuth(mode || "admin")}
                  />
                }
              />

              {/* Portfolio & Digital CV subpaths */}
              <Route path="/p/:slug" element={<PortfolioRoute />} />
              <Route path="/profile/:slug" element={<PortfolioRoute />} />
              <Route path="/portfolio/:slug" element={<PortfolioRoute />} />

              {/* Profile Editor & Tab subpaths */}
              <Route path="/editor" element={<EditorRoute />} />
              <Route path="/editor/:tab" element={<EditorRoute />} />

              {/* Print & Resume subpaths */}
              <Route path="/print/:slug" element={<PrintRoute />} />
              <Route path="/resume/:slug" element={<PrintRoute />} />
              <Route path="/print" element={<PrintRoute />} />
              <Route path="/resume" element={<PrintRoute />} />

              {/* AI Career Advisor direct route */}
              <Route
                path="/ai-advisor"
                element={
                  <DirectoryView
                    profiles={profiles}
                    onSelectProfile={(slug) => navigate(`/p/${slug}`)}
                    onPublishClick={() => {
                      if (currentUser) {
                        navigate("/editor/basic");
                      } else {
                        handleOpenAuth("signup");
                      }
                    }}
                    onOpenContactModal={(prof) => setContactModalProfile(prof)}
                  />
                }
              />

              {/* Direct Vanity / Username subpath (e.g. /ahmed-rameez) */}
              <Route path="/:slug" element={<DynamicSlugRoute />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/directory" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global Modals */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen || location.pathname === "/ai-advisor"}
        onClose={() => {
          setIsAiAssistantOpen(false);
          if (location.pathname === "/ai-advisor") {
            navigate("/directory");
          }
        }}
        activeProfile={currentUser || profiles[0]}
        onApplyBio={handleApplyBio}
        onApplySkills={handleApplySkills}
      />

      {contactModalProfile && (
        <ContactModal
          isOpen={Boolean(contactModalProfile)}
          onClose={() => setContactModalProfile(null)}
          profile={contactModalProfile}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        allProfiles={profiles}
        defaultMode={authModalMode}
        onLogin={handleLogin}
        onCreateProfile={handleCreateNewProfile}
      />
    </div>
  );
}
