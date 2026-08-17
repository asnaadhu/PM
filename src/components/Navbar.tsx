import React, { useState } from "react";
import { 
  Home,
  Compass, 
  UserPlus, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  ExternalLink,
  ChevronDown,
  LogIn,
  LogOut,
  Edit3,
  Shield,
  LayoutDashboard
} from "lucide-react";
import { UserProfile } from "../types";
import { isAdminUser } from "../services/api";

interface NavbarProps {
  currentView: "home" | "directory" | "editor" | "portfolio" | "print" | "admin";
  onNavigate: (view: "home" | "directory" | "editor" | "portfolio" | "print" | "admin", slug?: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth: (defaultMode?: "signup" | "signin") => void;
  onSignOut: () => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onSignOut,
  onOpenAiAssistant,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const isAdmin = isAdminUser(currentUser);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E7E2DA] transition-all">
      {/* Top Heritage Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#8B4513] via-[#B85D19] to-[#8B4513]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.25rem] py-1.5">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group select-none py-1"
            onClick={() => onNavigate("home")}
          >
            <div className="w-9 h-9 rounded-lg bg-[#8B4513] flex items-center justify-center text-white shadow-xs group-hover:bg-[#70350B] transition-all">
              <Globe className="w-4.5 h-4.5 text-[#FDFBF7]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-lg tracking-tight text-[#1C1917]">
                  Portfolio <span className="text-[#8B4513] font-normal italic">Maldives</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-mono font-semibold uppercase tracking-widest bg-[#F3EFEA] text-[#8B4513] border border-[#E2DDD5]">
                  <ShieldCheck className="w-2.5 h-2.5 mr-1 text-[#8B4513]" />
                  Registry
                </span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-[#78716C] hidden sm:block">
                National Directory of Specialists & Digital CVs
              </p>
              <p className="font-thaana text-[11px] text-[#8B4513] font-medium leading-tight mt-0.5" dir="rtl">
                ދިވެހިރާއްޖޭގެ ޤައުމީ ފަންނުވެރިންގެ ދަފްތަރު
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5 font-mono text-xs">
            <button
              id="nav-home-btn"
              onClick={() => onNavigate("home")}
              className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                currentView === "home"
                  ? "bg-[#1C1917] text-[#FAF9F6] shadow-xs"
                  : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2ECE4]"
              }`}
            >
              <Home className={`w-3.5 h-3.5 ${currentView === "home" ? "text-[#C27D38]" : "text-[#8B4513]"}`} />
              <span>Home</span>
            </button>

            <button
              id="nav-directory-btn"
              onClick={() => onNavigate("directory")}
              className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                currentView === "directory"
                  ? "bg-[#1C1917] text-[#FAF9F6] shadow-xs"
                  : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2ECE4]"
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${currentView === "directory" ? "text-[#C27D38]" : "text-[#8B4513]"}`} />
              <span>Explore Directory</span>
            </button>

            {/* Admin Console Link (if Admin) */}
            {isAdmin && (
              <button
                id="nav-admin-btn"
                onClick={() => onNavigate("admin")}
                className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                  currentView === "admin"
                    ? "bg-[#8B4513] text-[#FAF9F6] shadow-xs"
                    : "text-[#1C1917] bg-[#F2ECE4] hover:bg-[#E7E2DA] border border-[#DCD5CB]"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#C27D38]" />
                <span>Admin Console</span>
              </button>
            )}

            {/* Normal User CV Actions (publishes/edits their own CV only) */}
            {currentUser && !isAdmin && (
              <>
                <button
                  id="nav-my-cv-btn"
                  onClick={() => onNavigate("portfolio", currentUser.slug)}
                  className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                    currentView === "portfolio"
                      ? "bg-[#1C1917] text-[#FAF9F6] shadow-xs"
                      : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2ECE4]"
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 ${currentView === "portfolio" ? "text-[#C27D38]" : "text-[#8B4513]"}`} />
                  <span>My Public CV</span>
                </button>

                <button
                  id="nav-editor-btn"
                  onClick={() => onNavigate("editor", currentUser.slug)}
                  className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                    currentView === "editor"
                      ? "bg-[#1C1917] text-[#FAF9F6] shadow-xs"
                      : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2ECE4]"
                  }`}
                >
                  <Edit3 className={`w-3.5 h-3.5 ${currentView === "editor" ? "text-[#C27D38]" : "text-[#8B4513]"}`} />
                  <span>Edit Profile</span>
                </button>
              </>
            )}

            {/* AI Advisor Button - Strictly For Logged In Users Only */}
            {currentUser && (
              <button
                id="nav-ai-btn"
                onClick={onOpenAiAssistant}
                className="px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider text-[#8B4513] bg-[#F7F2EB] hover:bg-[#EDE4D8] border border-[#E0D5C7] transition-all flex items-center space-x-1.5"
                title="Maldives Career AI Advisor"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>AI Advisor</span>
              </button>
            )}
          </nav>

          {/* Right Action / Auth & Profile Section */}
          <div className="flex flex-col items-end justify-center">
            <div className="flex items-center space-x-2.5">
              {currentUser ? (
                /* Authenticated User Menu */
                <div className="relative">
                  <button
                    id="active-profile-dropdown-btn"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full border border-[#E7E2DA] hover:border-[#8B4513] bg-white hover:bg-[#FAF9F6] transition-all text-left shadow-2xs"
                  >
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-[#8B4513]/20"
                    />
                    <div className="hidden sm:block text-left">
                      <div className="font-bold text-[#1C1917] text-xs line-clamp-1 flex items-center gap-1.5 font-display">
                        {currentUser.fullName}
                        {isAdmin ? (
                          <span className="w-2 h-2 rounded-full bg-[#8B4513] ring-2 ring-white" title="Administrator"></span>
                        ) : currentUser.isPublished ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" title="Published Live"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-600 ring-2 ring-white" title="Draft"></span>
                        )}
                      </div>
                      <div className="text-[#78716C] font-mono text-[9px] line-clamp-1 uppercase">
                        {isAdmin ? "Registry Admin" : currentUser.island}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-68 bg-[#FAF9F6] rounded-xl shadow-lg border border-[#E7E2DA] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-[#E7E2DA]">
                        <p className="text-[9px] font-mono font-bold text-[#8B4513] uppercase tracking-widest">
                          {isAdmin ? "Administrator Session" : "Signed In As (User)"}
                        </p>
                        <p className="text-xs font-bold text-[#1C1917] mt-0.5 truncate font-display">
                          {currentUser.fullName}
                        </p>
                        <p className="text-[11px] text-[#78716C] truncate">
                          {currentUser.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-sm border ${
                            isAdmin
                              ? "text-[#FAF9F6] bg-[#1C1917] border-[#1C1917]"
                              : currentUser.isPublished 
                              ? "text-emerald-800 bg-emerald-50 border-emerald-300" 
                              : "text-amber-800 bg-amber-50 border-amber-300"
                          }`}>
                            {isAdmin ? "● Admin Authority" : currentUser.isPublished ? "● Live in Registry" : "○ Draft Mode"}
                          </span>
                        </div>
                      </div>

                      <div className="px-2 py-1.5 space-y-1 font-mono text-xs">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                onNavigate("admin");
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold text-[#1C1917] hover:bg-[#F2ECE4] transition-colors"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-[#8B4513]" />
                              <span>Admin Management Console</span>
                            </button>

                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                onNavigate("directory");
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold text-[#44403C] hover:bg-[#F2ECE4] transition-colors"
                            >
                              <Compass className="w-3.5 h-3.5 text-[#8B4513]" />
                              <span>Browse Public Directory</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                onNavigate("portfolio", currentUser.slug);
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold text-[#44403C] hover:bg-[#F2ECE4] transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#8B4513]" />
                              <span>View My Public CV</span>
                            </button>

                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                onNavigate("editor", currentUser.slug);
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold text-[#44403C] hover:bg-[#F2ECE4] transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#8B4513]" />
                              <span>Edit / Update My CV</span>
                            </button>

                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                onOpenAiAssistant();
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold text-[#8B4513] hover:bg-[#F2ECE4] transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#8B4513]" />
                              <span>AI Career Advisor</span>
                            </button>
                          </>
                        )}
                      </div>

                      <div className="px-2 pt-1 border-t border-[#E7E2DA]">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onSignOut();
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-lg text-left text-xs font-bold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest / Public Visitor Actions */
                <div className="flex items-center space-x-2">
                  <button
                    id="nav-signin-btn"
                    onClick={() => onOpenAuth("signin")}
                    className="px-3.5 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#44403C] hover:text-[#1C1917] hover:bg-[#F2ECE4] rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#8B4513]" />
                    <span>Sign In</span>
                  </button>

                  <button
                    id="nav-publish-btn"
                    onClick={() => onOpenAuth("signup")}
                    className="inline-flex items-center px-4 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#8B4513] hover:bg-[#73380F] text-white shadow-xs hover:shadow transition-all active:scale-95 gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#F2ECE4]" />
                    <span>Publish Profile</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dhivehi text below top right corner */}
            <div className="hidden sm:flex items-center gap-1.5 mt-1 font-thaana text-[10.5px] text-[#78716C] leading-tight select-none" dir="rtl">
              <span className="text-[#8B4513] font-semibold">ދިވެހިރާއްޖެ</span>
              <span className="text-[#C8C2B8] text-[8px]">•</span>
              <span>ޚާއްޞަ ފަންނުވެރިންގެ ޕޯޓަލް</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
