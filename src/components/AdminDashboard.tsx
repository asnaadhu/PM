import React, { useState, useEffect, useMemo } from "react";
import { Shield, CircleCheck as CheckCircle2, Circle as XCircle, Search, ListFilter as Filter, Eye, CreditCard as Edit3, Trash2, Star, Mail, Users, Award, ChartBar as BarChart3, RefreshCw, ExternalLink, Lock, Download, TriangleAlert as AlertTriangle, FileText, UserCheck, UserX, ChevronRight, Globe, UserPlus, UserCog, TrendingUp, Calendar, MapPin, Activity, SquareCheck as CheckSquare, Clock, ArrowUpRight, ShieldAlert, ShieldCheck, Building, Layers, Sparkles, FileSpreadsheet, Briefcase } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";
import { UserProfile, ContactInquiry, IndustryType, UserRole } from "../types";
import { MALDIVES_INDUSTRIES, MALDIVES_ATOLLS } from "../data/atolls";
import {
  adminVerifyProfile,
  adminFeatureProfile,
  adminSetStatus,
  adminDeleteProfile,
  adminUpdateUserRole,
  adminCreateUser,
  fetchAdminInquiries,
  isAdminUser
} from "../services/api";

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  allProfiles: UserProfile[];
  onNavigate: (view: "directory" | "portfolio" | "editor" | "admin", slug?: string) => void;
  onRefreshProfiles: () => void;
  onOpenAuth: (mode?: "signup" | "signin") => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  allProfiles,
  onNavigate,
  onRefreshProfiles,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<"profiles" | "users" | "tracker" | "inquiries" | "settings">("profiles");
  
  // Search & Filter state for Profiles Tab
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [selectedVerification, setSelectedVerification] = useState<"all" | "verified" | "unverified">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "published" | "draft" | "suspended">("all");
  const [selectedRole, setSelectedRole] = useState<"all" | "user" | "admin">("all");

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "suspended" | "pending_review">("all");
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [roleChangeModal, setRoleChangeModal] = useState<{ profile: UserProfile; newRole: UserRole } | null>(null);

  // New Admin Provisioning Form State
  const [newAdminForm, setNewAdminForm] = useState({
    fullName: "",
    email: "",
    title: "National Directory Administrator & Verification Officer",
    industry: "Civil Service (CSC)" as IndustryType,
    atoll: "Kaafu Atoll (Malé / North & South Malé)",
    island: "Malé City",
    phone: "+960 330-0000",
    role: "admin" as UserRole,
  });

  // Registration Tracker State
  const [trackerDateRange, setTrackerDateRange] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [trackerSectorFilter, setTrackerSectorFilter] = useState<string>("all");
  const [trackerSearch, setTrackerSearch] = useState("");

  // Inquiries State
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Common UI State
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [deleteModalProfile, setDeleteModalProfile] = useState<UserProfile | null>(null);

  const isAdmin = isAdminUser(currentUser);

  useEffect(() => {
    if (activeTab === "inquiries") {
      loadInquiries();
    }
  }, [activeTab]);

  const loadInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const data = await fetchAdminInquiries();
      setInquiries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3800);
  };

  // Helper to ensure registration date exists
  const getProfileCreatedAt = (p: UserProfile): Date => {
    const raw = p.createdAt || p.publishedAt || p.updatedAt || "2026-01-01T00:00:00Z";
    return new Date(raw);
  };

  // Toggle verification badge
  const handleToggleVerification = async (profile: UserProfile) => {
    const nextState = !(profile.isVerified ?? profile.verified);
    await adminVerifyProfile(profile.slug, nextState);
    onRefreshProfiles();
    showFeedback(
      nextState
        ? `Verified: ${profile.fullName} now holds official National Registry Accreditation.`
        : `Unverified: ${profile.fullName} accreditation status revoked.`
    );
  };

  // Toggle featured status
  const handleToggleFeatured = async (profile: UserProfile) => {
    const nextState = !profile.isFeatured;
    await adminFeatureProfile(profile.slug, nextState);
    onRefreshProfiles();
    showFeedback(
      nextState
        ? `Spotlighted: ${profile.fullName} is now featured on the directory frontpage.`
        : `Unfeatured: ${profile.fullName} removed from top spotlight.`
    );
  };

  // Change status (published, draft, suspended)
  const handleChangeStatus = async (profile: UserProfile, newStatus: "active" | "suspended" | "pending_review", isPub?: boolean) => {
    await adminSetStatus(profile.slug, newStatus, isPub ?? profile.isPublished);
    onRefreshProfiles();
    showFeedback(`Updated status for ${profile.fullName} to ${newStatus}.`);
  };

  // Role promotion / demotion
  const handleConfirmRoleChange = async () => {
    if (!roleChangeModal) return;
    const { profile, newRole } = roleChangeModal;
    await adminUpdateUserRole(profile.slug, newRole);
    setRoleChangeModal(null);
    onRefreshProfiles();
    showFeedback(
      newRole === "admin"
        ? `Administrator Authority Granted: ${profile.fullName} now has full administrative privileges.`
        : `Administrator Authority Revoked: ${profile.fullName} is now a Standard User account.`
    );
  };

  // Create new Admin Account
  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminForm.fullName || !newAdminForm.email) {
      showFeedback("Please provide a valid Full Name and Email Address.");
      return;
    }

    const created = await adminCreateUser({
      ...newAdminForm,
      isPublished: true,
      verified: true,
      isVerified: true,
      status: "active",
    });

    setShowCreateAdminModal(false);
    onRefreshProfiles();
    showFeedback(`Provisioned Administrator Account for ${created.fullName} (${created.email}).`);
    setNewAdminForm({
      fullName: "",
      email: "",
      title: "National Directory Administrator & Verification Officer",
      industry: "Civil Service (CSC)",
      atoll: "Kaafu Atoll (Malé / North & South Malé)",
      island: "Malé City",
      phone: "+960 330-0000",
      role: "admin",
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteModalProfile) return;
    const name = deleteModalProfile.fullName;
    await adminDeleteProfile(deleteModalProfile.slug);
    setDeleteModalProfile(null);
    onRefreshProfiles();
    showFeedback(`Deleted profile for ${name} from registry.`);
  };

  // Export JSON backup
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allProfiles, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `portfolio_maldives_registry_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showFeedback("Downloaded complete registry JSON archive.");
  };

  // Export Registration Tracker CSV Ledger
  const handleExportRegistrationLedger = () => {
    const headers = [
      "Registered Date",
      "Full Name",
      "Slug",
      "Role",
      "Email",
      "Island",
      "Atoll",
      "Industry Sector",
      "Account Status",
      "Published Live",
      "National Accreditation",
      "Page Views"
    ];

    const rows = allProfiles.map((p) => [
      getProfileCreatedAt(p).toISOString().slice(0, 10),
      `"${p.fullName.replace(/"/g, '""')}"`,
      p.slug,
      p.role || "user",
      p.email,
      `"${p.island.replace(/"/g, '""')}"`,
      `"${p.atoll.replace(/"/g, '""')}"`,
      `"${p.industry.replace(/"/g, '""')}"`,
      p.status || "active",
      p.isPublished ? "YES" : "NO",
      (p.isVerified ?? p.verified) ? "VERIFIED" : "UNVERIFIED",
      p.viewsCount || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `portfolio_maldives_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showFeedback("Exported National Registration Audit Ledger (CSV).");
  };

  // Filter profiles for TAB 1
  const filteredProfiles = allProfiles.filter((p) => {
    if (selectedRole !== "all") {
      const pRole = p.role || "user";
      if (pRole !== selectedRole) return false;
    }
    if (selectedIndustry !== "All" && p.industry !== selectedIndustry) {
      return false;
    }
    if (selectedVerification === "verified" && !(p.isVerified ?? p.verified)) {
      return false;
    }
    if (selectedVerification === "unverified" && (p.isVerified ?? p.verified)) {
      return false;
    }
    if (selectedStatus === "published" && !p.isPublished) {
      return false;
    }
    if (selectedStatus === "draft" && p.isPublished) {
      return false;
    }
    if (selectedStatus === "suspended" && p.status !== "suspended") {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.fullName.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchEmail = p.email.toLowerCase().includes(q);
      const matchIsland = p.island.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      return matchName || matchTitle || matchEmail || matchIsland || matchSlug;
    }
    return true;
  });

  // Filter users for TAB 2 (Admin User Management)
  const filteredUsers = allProfiles.filter((p) => {
    const pRole = p.role || "user";
    if (userRoleFilter !== "all" && pRole !== userRoleFilter) {
      return false;
    }
    const pStatus = p.status || "active";
    if (userStatusFilter !== "all" && pStatus !== userStatusFilter) {
      return false;
    }
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.island.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Analytics Metrics
  const totalProfiles = allProfiles.length;
  const adminUsersCount = allProfiles.filter((p) => (p.role || "user") === "admin").length;
  const normalUsersCount = allProfiles.filter((p) => (p.role || "user") === "user").length;
  const verifiedCount = allProfiles.filter((p) => p.isVerified ?? p.verified).length;
  const publishedCount = allProfiles.filter((p) => p.isPublished).length;
  const suspendedCount = allProfiles.filter((p) => p.status === "suspended").length;
  const totalViews = allProfiles.reduce((acc, p) => acc + (p.viewsCount || 0), 0);

  // Registration Tracker Data Calculations
  const now = new Date();
  const registrationTrackerItems = useMemo(() => {
    return allProfiles
      .map((p) => {
        const date = getProfileCreatedAt(p);
        return {
          profile: p,
          date,
          formattedDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          daysAgo: Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)),
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [allProfiles]);

  const filteredTrackerRegistrations = useMemo(() => {
    return registrationTrackerItems.filter((item) => {
      if (trackerDateRange === "7d" && item.daysAgo > 7) return false;
      if (trackerDateRange === "30d" && item.daysAgo > 30) return false;
      if (trackerDateRange === "90d" && item.daysAgo > 90) return false;
      if (trackerSectorFilter !== "all" && item.profile.industry !== trackerSectorFilter) return false;
      if (trackerSearch.trim()) {
        const q = trackerSearch.toLowerCase();
        return (
          item.profile.fullName.toLowerCase().includes(q) ||
          item.profile.email.toLowerCase().includes(q) ||
          item.profile.island.toLowerCase().includes(q) ||
          item.profile.atoll.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [registrationTrackerItems, trackerDateRange, trackerSectorFilter, trackerSearch]);

  // Registrations over time chart data
  const registrationsTimelineChartData = useMemo(() => {
    const monthsMap: Record<string, { month: string; users: number; admins: number; total: number }> = {};
    
    // Seed the last 6 months for chart visualization
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthsMap[key] = { month: key, users: 0, admins: 0, total: 0 };
    }

    allProfiles.forEach((p) => {
      const d = getProfileCreatedAt(p);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!monthsMap[key]) {
        monthsMap[key] = { month: key, users: 0, admins: 0, total: 0 };
      }
      if ((p.role || "user") === "admin") {
        monthsMap[key].admins += 1;
      } else {
        monthsMap[key].users += 1;
      }
      monthsMap[key].total += 1;
    });

    return Object.values(monthsMap);
  }, [allProfiles]);

  // Industry distribution chart data
  const industryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    allProfiles.forEach((p) => {
      const ind = p.industry || "Other";
      // Shorten label for clean chart presentation
      const shortInd = ind.length > 25 ? ind.slice(0, 25) + "..." : ind;
      counts[shortInd] = (counts[shortInd] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allProfiles]);

  // Unique Industries represented
  const uniqueIndustriesCount = useMemo(() => {
    const set = new Set(allProfiles.map((p) => p.industry).filter(Boolean));
    return set.size;
  }, [allProfiles]);

  // Seniority distribution
  const seniorityChartData = useMemo(() => {
    const counts = { Executive: 0, Senior: 0, Mid: 0, Emerging: 0 };
    allProfiles.forEach((p) => {
      const t = (p.title || "").toLowerCase();
      const expCount = p.experiences?.length || 0;
      if (t.includes("director") || t.includes("head") || t.includes("chief") || t.includes("general manager") || expCount >= 4) {
        counts.Executive += 1;
      } else if (t.includes("senior") || t.includes("lead") || t.includes("manager") || t.includes("specialist") || expCount >= 2) {
        counts.Senior += 1;
      } else if (expCount >= 1) {
        counts.Mid += 1;
      } else {
        counts.Emerging += 1;
      }
    });
    return Object.entries(counts).map(([level, count]) => ({ level, count }));
  }, [allProfiles]);

  // If user is not admin, show access gate
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] bg-[#FAF9F6] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#E7E2DA] p-8 text-center shadow-lg animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 bg-[#1C1917] rounded-xl flex items-center justify-center mx-auto text-[#C27D38] mb-4 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#1C1917] font-display mb-2">
            Administrator Access Required
          </h2>
          <p className="text-xs font-mono text-[#78716C] mb-6 leading-relaxed">
            The National Registry Management Console is restricted to authorized directory administrators. Normal user accounts publish and manage individual CVs.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => onOpenAuth("signin")}
              className="w-full py-2.5 bg-[#1C1917] hover:bg-[#2E2A27] text-[#FAF9F6] rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-[#C27D38]" />
              <span>Sign In with Administrator Credentials</span>
            </button>

            {currentUser ? (
              <button
                onClick={() => onNavigate("editor", currentUser.slug)}
                className="w-full py-2.5 bg-[#F2ECE4] hover:bg-[#E7E2DA] text-[#57534E] rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>Return to My CV Editor</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("directory")}
                className="w-full py-2 bg-transparent text-[#78716C] hover:text-[#1C1917] text-xs font-mono"
              >
                Back to Public Directory
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2A2A2A] pb-24">
      {/* Toast Feedback Notification */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-[#FAF9F6] px-4 py-3 rounded-lg shadow-xl border border-[#3E3835] text-xs font-mono flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <div className="bg-[#1C1917] text-[#FAF9F6] border-b border-[#3E3835] pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#2E2A27] border border-[#443E3A] flex items-center justify-center text-[#C27D38] shadow-inner">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
                    National Registry Admin Console
                  </h1>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-sm bg-[#8B4513] text-[#FAF9F6]">
                    Republic of Maldives
                  </span>
                </div>
                <p className="text-xs font-mono text-[#A8A29E] mt-0.5">
                  Oversee verified specialists, manage administrator user roles, track registration influx, and govern directory accreditation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="admin-export-btn"
                onClick={handleExportData}
                className="px-3 py-1.5 rounded-md bg-[#2E2A27] hover:bg-[#3E3835] border border-[#443E3A] text-xs font-mono text-[#FAF9F6] flex items-center gap-1.5 transition-colors"
                title="Download JSON registry backup"
              >
                <Download className="w-3.5 h-3.5 text-[#C27D38]" />
                <span>Export JSON</span>
              </button>

              <button
                id="admin-export-csv-btn"
                onClick={handleExportRegistrationLedger}
                className="px-3 py-1.5 rounded-md bg-[#2E2A27] hover:bg-[#3E3835] border border-[#443E3A] text-xs font-mono text-[#FAF9F6] flex items-center gap-1.5 transition-colors"
                title="Download CSV Registration Ledger"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Ledger (CSV)</span>
              </button>

              <button
                id="admin-refresh-btn"
                onClick={() => {
                  onRefreshProfiles();
                  showFeedback("Registry database synchronized.");
                }}
                className="px-3 py-1.5 rounded-md bg-[#8B4513] hover:bg-[#73380F] text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Data</span>
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-[#2E2A27]">
            <div className="bg-[#262220] p-3.5 rounded-lg border border-[#3E3835]">
              <div className="text-[10px] font-mono uppercase text-[#A8A29E] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C27D38]" />
                <span>Total Registered</span>
              </div>
              <div className="text-2xl font-bold font-display text-white mt-1">
                {totalProfiles} <span className="text-xs font-mono text-[#78716C] font-normal">profiles</span>
              </div>
            </div>

            <div className="bg-[#262220] p-3.5 rounded-lg border border-[#3E3835]">
              <div className="text-[10px] font-mono uppercase text-[#A8A29E] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Authority</span>
              </div>
              <div className="text-2xl font-bold font-display text-amber-400 mt-1">
                {adminUsersCount} <span className="text-xs font-mono text-[#78716C] font-normal">admins</span>
              </div>
            </div>

            <div className="bg-[#262220] p-3.5 rounded-lg border border-[#3E3835]">
              <div className="text-[10px] font-mono uppercase text-[#A8A29E] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Specialists</span>
              </div>
              <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
                {verifiedCount} <span className="text-xs font-mono text-[#78716C] font-normal">({Math.round((verifiedCount / (totalProfiles || 1)) * 100)}%)</span>
              </div>
            </div>

            <div className="bg-[#262220] p-3.5 rounded-lg border border-[#3E3835]">
              <div className="text-[10px] font-mono uppercase text-[#A8A29E] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Published Live CVs</span>
              </div>
              <div className="text-2xl font-bold font-display text-sky-300 mt-1">
                {publishedCount}
              </div>
            </div>

            <div className="bg-[#262220] p-3.5 rounded-lg border border-[#3E3835]">
              <div className="text-[10px] font-mono uppercase text-[#A8A29E] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#C27D38]" />
                <span>Industry Sectors</span>
              </div>
              <div className="text-2xl font-bold font-display text-amber-300 mt-1">
                {uniqueIndustriesCount} <span className="text-xs font-mono text-[#78716C] font-normal">sectors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E7E2DA] space-x-1 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profiles")}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "profiles"
                ? "border-[#8B4513] text-[#8B4513] bg-[#F2ECE4]/50 rounded-t-md"
                : "border-transparent text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Specialists & CVs ({filteredProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "users"
                ? "border-[#8B4513] text-[#8B4513] bg-[#F2ECE4]/50 rounded-t-md"
                : "border-transparent text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Admin User Management ({adminUsersCount} Admins)</span>
          </button>

          <button
            onClick={() => setActiveTab("tracker")}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "tracker"
                ? "border-[#8B4513] text-[#8B4513] bg-[#F2ECE4]/50 rounded-t-md"
                : "border-transparent text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Registration Tracker ({totalProfiles})</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "inquiries"
                ? "border-[#8B4513] text-[#8B4513] bg-[#F2ECE4]/50 rounded-t-md"
                : "border-transparent text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Recruiter Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "settings"
                ? "border-[#8B4513] text-[#8B4513] bg-[#F2ECE4]/50 rounded-t-md"
                : "border-transparent text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Registry Policy & Governance</span>
          </button>
        </div>

        {/* TAB 1: Specialists & CVs Moderation */}
        {activeTab === "profiles" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white rounded-xl border border-[#E7E2DA] p-4 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search */}
                <div className="md:col-span-4 relative">
                  <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, job title, email, slug..."
                    className="w-full pl-9 pr-3.5 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#78716C] hover:text-[#1C1917]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Industry Filter */}
                <div className="md:col-span-3">
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  >
                    <option value="All">All Industry Fields</option>
                    {MALDIVES_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verification Filter */}
                <div className="md:col-span-2">
                  <select
                    value={selectedVerification}
                    onChange={(e) => setSelectedVerification(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  >
                    <option value="all">All Verification</option>
                    <option value="verified">Verified Only (Badge)</option>
                    <option value="unverified">Unverified Only</option>
                  </select>
                </div>

                {/* Role & Status Filter */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Normal Users (CV Only)</option>
                    <option value="admin">Administrator Accounts</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published / Live</option>
                    <option value="draft">Draft Mode</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profiles Table */}
            <div className="bg-white rounded-xl border border-[#E7E2DA] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F2ECE4] border-b border-[#E7E2DA] text-[10px] font-mono font-bold uppercase tracking-wider text-[#57534E]">
                      <th className="py-3 px-4">Specialist & Contact</th>
                      <th className="py-3 px-4">Role & Sector</th>
                      <th className="py-3 px-4 text-center">Accreditation</th>
                      <th className="py-3 px-4 text-center">Spotlight</th>
                      <th className="py-3 px-4">Status & Traffic</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA] text-xs font-mono">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#78716C]">
                          No specialists found matching your search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((prof) => {
                        const isProfVerified = prof.isVerified ?? prof.verified;
                        const isProfAdmin = (prof.role || "user") === "admin";

                        return (
                          <tr key={prof.id} className="hover:bg-[#FAF9F6] transition-colors">
                            {/* Specialist info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={prof.avatarUrl}
                                  alt={prof.fullName}
                                  className="w-10 h-10 rounded-full object-cover border border-[#E7E2DA] shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-[#1C1917] text-xs font-display flex items-center gap-1.5">
                                    <span>{prof.fullName}</span>
                                    {isProfVerified && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-300 text-[9px] font-mono">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[#57534E] text-[11px] truncate max-w-xs">{prof.title}</div>
                                  <div className="text-[#78716C] text-[10px] flex items-center gap-2 mt-0.5">
                                    <span>{prof.email}</span>
                                    <span>•</span>
                                    <span>{prof.island}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Role & Sector */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div>
                                  <span
                                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                                      isProfAdmin
                                        ? "bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]"
                                        : "bg-[#F2ECE4] text-[#8B4513] border-[#E7E2DA]"
                                    }`}
                                  >
                                    {isProfAdmin ? "Administrator" : "Normal User (CV)"}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#57534E] truncate max-w-[180px]">
                                  {prof.industry}
                                </div>
                              </div>
                            </td>

                            {/* Verification Toggle */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleToggleVerification(prof)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all ${
                                  isProfVerified
                                    ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300"
                                    : "bg-[#FAF9F6] hover:bg-[#F2ECE4] text-[#78716C] border-[#E7E2DA]"
                                }`}
                                title="Toggle official verification status"
                              >
                                {isProfVerified ? (
                                  <>
                                    <UserCheck className="w-3 h-3 text-emerald-700" />
                                    <span>Verified</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3 h-3 text-[#A8A29E]" />
                                    <span>Unverified</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Spotlight Feature Toggle */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleToggleFeatured(prof)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-all ${
                                  prof.isFeatured
                                    ? "bg-amber-100 text-amber-900 border-amber-300"
                                    : "bg-[#FAF9F6] hover:bg-[#F2ECE4] text-[#78716C] border-[#E7E2DA]"
                                }`}
                                title="Toggle Spotlight featured ranking"
                              >
                                <Star className={`w-3 h-3 ${prof.isFeatured ? "text-amber-600 fill-amber-600" : "text-[#A8A29E]"}`} />
                                <span>{prof.isFeatured ? "Featured" : "Standard"}</span>
                              </button>
                            </td>

                            {/* Status & Traffic */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  {prof.status === "suspended" ? (
                                    <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                      Suspended
                                    </span>
                                  ) : prof.isPublished ? (
                                    <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                      ● Live
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                      ○ Draft
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-[#78716C]">
                                  {prof.viewsCount || 0} views
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => onNavigate("portfolio", prof.slug)}
                                  className="p-1.5 rounded-md hover:bg-[#F2ECE4] text-[#57534E] hover:text-[#1C1917] transition-colors border border-transparent hover:border-[#E7E2DA]"
                                  title="View Public CV"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#8B4513]" />
                                </button>

                                <button
                                  onClick={() => onNavigate("editor", prof.slug)}
                                  className="p-1.5 rounded-md hover:bg-[#F2ECE4] text-[#57534E] hover:text-[#1C1917] transition-colors border border-transparent hover:border-[#E7E2DA]"
                                  title="Edit Profile"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#8B4513]" />
                                </button>

                                <button
                                  onClick={() => setDeleteModalProfile(prof)}
                                  className="p-1.5 rounded-md hover:bg-rose-50 text-[#78716C] hover:text-rose-700 transition-colors border border-transparent hover:border-rose-200"
                                  title="Delete Profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Top Bar for User Management */}
            <div className="bg-white rounded-xl border border-[#E7E2DA] p-5 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold font-display text-[#1C1917] flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-[#8B4513]" />
                    <span>Administrator & User Access Control</span>
                  </h3>
                  <p className="text-xs font-mono text-[#78716C] mt-0.5">
                    Assign administrative privileges, promote specialists to Registry Administrator, provision officers, and manage permissions.
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateAdminModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C1917] hover:bg-[#2E2A27] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs"
                >
                  <UserPlus className="w-4 h-4 text-[#C27D38]" />
                  <span>Provision New Admin</span>
                </button>
              </div>

              {/* Filters for User Management */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#E7E2DA]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or island..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  />
                </div>

                <div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  >
                    <option value="all">All Roles ({allProfiles.length})</option>
                    <option value="admin">Administrators Only ({adminUsersCount})</option>
                    <option value="user">Normal Specialist Users ({normalUsersCount})</option>
                  </select>
                </div>

                <div>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Accounts</option>
                    <option value="suspended">Suspended Accounts ({suspendedCount})</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-[#E7E2DA] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F2ECE4] border-b border-[#E7E2DA] text-[10px] font-mono font-bold uppercase tracking-wider text-[#57534E]">
                      <th className="py-3 px-4">Account Holder & Identity</th>
                      <th className="py-3 px-4">Assigned Authority Role</th>
                      <th className="py-3 px-4">Location / Department</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Role & Access Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA] text-xs font-mono">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#78716C]">
                          No user accounts match your search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const isUserAdmin = (user.role || "user") === "admin";
                        const isRootAdmin = user.email.toLowerCase() === "admin@portfoliomaldives.mv" || user.slug === "national-registry-admin";
                        const isSelf = currentUser?.slug === user.slug;
                        const createdAt = getProfileCreatedAt(user);

                        return (
                          <tr key={user.id} className="hover:bg-[#FAF9F6] transition-colors">
                            {/* User details */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={user.avatarUrl}
                                  alt={user.fullName}
                                  className="w-10 h-10 rounded-full object-cover border border-[#E7E2DA] shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-[#1C1917] text-xs font-display flex items-center gap-1.5">
                                    <span>{user.fullName}</span>
                                    {isSelf && (
                                      <span className="px-1.5 py-0.2 rounded-xs bg-[#8B4513] text-white text-[9px] font-mono uppercase">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[#57534E] text-[11px] truncate max-w-xs">{user.email}</div>
                                  <div className="text-[#78716C] text-[10px] mt-0.5">@{user.slug}</div>
                                </div>
                              </div>
                            </td>

                            {/* Authority Role */}
                            <td className="py-3.5 px-4">
                              {isUserAdmin ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1C1917] text-[#FAF9F6] border border-[#1C1917] text-[11px] font-bold">
                                  <Shield className="w-3.5 h-3.5 text-[#C27D38]" />
                                  <span>Directory Administrator</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F2ECE4] text-[#57534E] border border-[#E7E2DA] text-[11px] font-bold">
                                  <Users className="w-3.5 h-3.5 text-[#8B4513]" />
                                  <span>Specialist User (CV Only)</span>
                                </div>
                              )}
                            </td>

                            {/* Location & Industry */}
                            <td className="py-3.5 px-4">
                              <div className="text-[11px] font-bold text-[#1C1917]">{user.island}</div>
                              <div className="text-[10px] text-[#78716C] truncate max-w-[160px]">{user.industry}</div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <select
                                value={user.status || "active"}
                                onChange={(e) => handleChangeStatus(user, e.target.value as any)}
                                disabled={isRootAdmin}
                                className={`text-[10px] font-bold font-mono px-2 py-1 rounded-md border focus:outline-hidden ${
                                  user.status === "suspended"
                                    ? "bg-rose-50 text-rose-800 border-rose-300"
                                    : user.status === "pending_review"
                                    ? "bg-amber-50 text-amber-800 border-amber-300"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-300"
                                }`}
                              >
                                <option value="active">Active</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            </td>

                            {/* Registered Date */}
                            <td className="py-3.5 px-4 text-[#78716C] text-[11px]">
                              {createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>

                            {/* Role change / Promote / Demote */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isRootAdmin ? (
                                  <span className="text-[10px] font-mono text-[#78716C] italic px-2 py-1">
                                    Primary Root Admin
                                  </span>
                                ) : isUserAdmin ? (
                                  <button
                                    onClick={() => setRoleChangeModal({ profile: user, newRole: "user" })}
                                    className="px-2.5 py-1 rounded-md bg-[#FAF9F6] hover:bg-rose-50 border border-[#E7E2DA] hover:border-rose-300 text-rose-700 text-[10px] font-bold flex items-center gap-1 transition-colors"
                                    title="Revoke admin access and change to normal user"
                                  >
                                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                                    <span>Demote to User</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setRoleChangeModal({ profile: user, newRole: "admin" })}
                                    className="px-2.5 py-1 rounded-md bg-[#1C1917] hover:bg-[#2E2A27] text-white text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                    title="Grant Administrator privileges"
                                  >
                                    <ShieldCheck className="w-3 h-3 text-[#C27D38]" />
                                    <span>Promote to Admin</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => onNavigate("portfolio", user.slug)}
                                  className="p-1.5 rounded-md hover:bg-[#F2ECE4] text-[#57534E] hover:text-[#1C1917] transition-colors border border-transparent hover:border-[#E7E2DA]"
                                  title="View Public Profile"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#8B4513]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTRATION TRACKER */}
        {activeTab === "tracker" && (
          <div className="space-y-6">
            {/* Tracker Header Bar */}
            <div className="bg-white rounded-xl border border-[#E7E2DA] p-5 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-display text-[#1C1917] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#8B4513]" />
                  <span>National Registration Velocity & Influx Tracker</span>
                </h3>
                <p className="text-xs font-mono text-[#78716C] mt-0.5">
                  Real-time monitoring of talent onboardings, geographic atoll distribution, and CV publication conversions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportRegistrationLedger}
                  className="px-3.5 py-2 rounded-md bg-[#1C1917] hover:bg-[#2E2A27] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#C27D38]" />
                  <span>Download Ledger (CSV)</span>
                </button>
              </div>
            </div>

            {/* Registration Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#E7E2DA] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716C] text-[11px] font-mono">
                  <span>Total Onboarded</span>
                  <Users className="w-4 h-4 text-[#8B4513]" />
                </div>
                <div className="text-2xl font-bold font-display text-[#1C1917] mt-1">
                  {totalProfiles}
                </div>
                <div className="text-[10px] font-mono text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% Platform Verified Architecture</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E7E2DA] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716C] text-[11px] font-mono">
                  <span>Draft to Live Conversion</span>
                  <Globe className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-bold font-display text-sky-700 mt-1">
                  {Math.round((publishedCount / (totalProfiles || 1)) * 100)}%
                </div>
                <div className="text-[10px] font-mono text-[#78716C] mt-1">
                  {publishedCount} of {totalProfiles} profiles published
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E7E2DA] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716C] text-[11px] font-mono">
                  <span>National Accreditation Rate</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-display text-emerald-700 mt-1">
                  {Math.round((verifiedCount / (totalProfiles || 1)) * 100)}%
                </div>
                <div className="text-[10px] font-mono text-[#78716C] mt-1">
                  {verifiedCount} accredited specialists
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E7E2DA] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716C] text-[11px] font-mono">
                  <span>Active Industry Verticals</span>
                  <Briefcase className="w-4 h-4 text-[#C27D38]" />
                </div>
                <div className="text-2xl font-bold font-display text-[#8B4513] mt-1">
                  {uniqueIndustriesCount} / 10
                </div>
                <div className="text-[10px] font-mono text-[#78716C] mt-1">
                  Strategic economic sectors
                </div>
              </div>
            </div>

            {/* Registration Charts (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 1: Registration Trajectory */}
              <div className="bg-white rounded-xl border border-[#E7E2DA] p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold font-display text-[#1C1917]">Registration Velocity</h4>
                    <p className="text-[11px] font-mono text-[#78716C]">Monthly new specialist onboardings</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#F2ECE4] text-[#8B4513]">
                    Monthly
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationsTimelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B4513" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8B4513" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7E2DA" vertical={false} />
                      <XAxis dataKey="month" stroke="#78716C" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                      <YAxis stroke="#78716C" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1C1917",
                          borderColor: "#3E3835",
                          borderRadius: "8px",
                          color: "#FAF9F6",
                          fontSize: "11px",
                          fontFamily: "JetBrains Mono",
                        }}
                      />
                      <Area type="monotone" dataKey="total" name="Total Registrations" stroke="#8B4513" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRegistrations)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Sector Distribution */}
              <div className="bg-white rounded-xl border border-[#E7E2DA] p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold font-display text-[#1C1917]">Industry Sectors</h4>
                    <p className="text-[11px] font-mono text-[#78716C]">Talent across Maldivian sectors</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#F2ECE4] text-[#8B4513]">
                    Sectors
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={industryChartData.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7E2DA" vertical={false} />
                      <XAxis dataKey="name" stroke="#78716C" fontSize={10} fontFamily="JetBrains Mono" angle={-15} textAnchor="end" interval={0} />
                      <YAxis stroke="#78716C" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1C1917",
                          borderColor: "#3E3835",
                          borderRadius: "8px",
                          color: "#FAF9F6",
                          fontSize: "11px",
                          fontFamily: "JetBrains Mono",
                        }}
                      />
                      <Bar dataKey="count" name="Specialists" fill="#8B4513" radius={[4, 4, 0, 0]}>
                        {industryChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#8B4513" : index % 2 === 0 ? "#B85D19" : "#A0522D"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Career Seniority & Tier */}
              <div className="bg-white rounded-xl border border-[#E7E2DA] p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold font-display text-[#1C1917]">Seniority & Career Tier</h4>
                    <p className="text-[11px] font-mono text-[#78716C]">Leadership & specialist experience distribution</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#F2ECE4] text-[#8B4513]">
                    Seniority
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seniorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7E2DA" vertical={false} />
                      <XAxis dataKey="level" stroke="#78716C" fontSize={10} fontFamily="JetBrains Mono" interval={0} />
                      <YAxis stroke="#78716C" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1C1917",
                          borderColor: "#3E3835",
                          borderRadius: "8px",
                          color: "#FAF9F6",
                          fontSize: "11px",
                          fontFamily: "JetBrains Mono",
                        }}
                      />
                      <Bar dataKey="count" name="Specialists" fill="#C27D38" radius={[4, 4, 0, 0]}>
                        <Cell fill="#1C1917" />
                        <Cell fill="#8B4513" />
                        <Cell fill="#B85D19" />
                        <Cell fill="#D97706" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Registration Chronological Log */}
            <div className="bg-white rounded-xl border border-[#E7E2DA] shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-[#E7E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8B4513]" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1917]">
                    Chronological Registration Ledger ({filteredTrackerRegistrations.length})
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={trackerSearch}
                      onChange={(e) => setTrackerSearch(e.target.value)}
                      placeholder="Filter ledger..."
                      className="pl-7 pr-3 py-1 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-[11px] font-mono text-[#1C1917] focus:outline-hidden"
                    />
                  </div>

                  <select
                    value={trackerDateRange}
                    onChange={(e) => setTrackerDateRange(e.target.value as any)}
                    className="px-2 py-1 bg-[#FAF9F6] border border-[#E7E2DA] rounded-md text-[11px] font-mono text-[#1C1917] focus:outline-hidden"
                  >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F2ECE4] border-b border-[#E7E2DA] text-[10px] font-mono font-bold uppercase tracking-wider text-[#57534E]">
                      <th className="py-2.5 px-4">Registration Timestamp</th>
                      <th className="py-2.5 px-4">Candidate & Identity</th>
                      <th className="py-2.5 px-4">Profession & Title</th>
                      <th className="py-2.5 px-4">Industry Sector</th>
                      <th className="py-2.5 px-4">Publication State</th>
                      <th className="py-2.5 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA] text-xs font-mono">
                    {filteredTrackerRegistrations.map(({ profile, date, formattedDate }) => (
                      <tr key={profile.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="py-3 px-4 text-[#78716C]">
                          <div className="font-bold text-[#1C1917] text-[11px]">{formattedDate}</div>
                          <div className="text-[10px] text-[#A8A29E]">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <img src={profile.avatarUrl} alt={profile.fullName} className="w-8 h-8 rounded-full object-cover border border-[#E7E2DA]" />
                            <div>
                              <div className="font-bold text-xs text-[#1C1917] font-display flex items-center gap-1.5">
                                {profile.fullName}
                                {(profile.role || "user") === "admin" && (
                                  <span className="px-1 py-0.2 bg-[#1C1917] text-white text-[8px] rounded-xs font-mono">ADMIN</span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#78716C]">{profile.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-[11px] font-bold text-[#1C1917]">{profile.title}</div>
                          <div className="text-[10px] text-[#8B4513]">{profile.yearsOfExperience}+ Yrs Experience</div>
                        </td>

                        <td className="py-3 px-4 text-[11px] text-[#57534E]">
                          <span className="px-2 py-0.5 rounded-xs bg-[#FAF9F6] border border-[#E7E2DA] text-[#44403C]">
                            {profile.industry}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {profile.isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Published Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold">
                              <Clock className="w-2.5 h-2.5" /> In-Progress Draft
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onNavigate("portfolio", profile.slug)}
                            className="p-1.5 rounded-md hover:bg-[#F2ECE4] text-[#8B4513] transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Inquiries Log */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E7E2DA] p-5 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-display text-[#1C1917]">Recruiter & Employer Outreach Logs</h3>
                <p className="text-xs font-mono text-[#78716C] mt-0.5">
                  Direct communication inquiries submitted through specialist portfolio contact channels.
                </p>
              </div>
              <button
                onClick={loadInquiries}
                className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#F2ECE4] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingInquiries ? "animate-spin" : ""}`} />
                <span>Refresh Inquiries</span>
              </button>
            </div>

            {inquiries.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E7E2DA] p-12 text-center shadow-2xs">
                <Mail className="w-8 h-8 text-[#A8A29E] mx-auto mb-3" />
                <h4 className="text-sm font-bold font-display text-[#1C1917]">No Outreach Inquiries Logged Yet</h4>
                <p className="text-xs font-mono text-[#78716C] max-w-sm mx-auto mt-1">
                  When recruiters or resort directors send messages via specialist CVs, they will be archived here for institutional tracking.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id || inq.createdAt}
                    className="bg-white rounded-xl border border-[#E7E2DA] p-4 shadow-2xs hover:border-[#8B4513] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-[#1C1917] font-display">{inq.senderName}</div>
                        <div className="text-[11px] font-mono text-[#78716C]">
                          {inq.senderEmail} {inq.senderCompany ? `• ${inq.senderCompany}` : ""}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#A8A29E]">
                        {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-md bg-[#FAF9F6] border border-[#E7E2DA] text-xs font-mono space-y-1">
                      <div className="font-bold text-[#8B4513]">Subject: {inq.subject}</div>
                      <p className="text-[#44403C] text-[11px] line-clamp-3 leading-relaxed">{inq.message}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                      <span className="text-[#78716C]">
                        Recipient: <strong className="text-[#1C1917]">@{inq.portfolioSlug}</strong>
                      </span>
                      <button
                        onClick={() => onNavigate("portfolio", inq.portfolioSlug)}
                        className="text-[#8B4513] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>View Specialist</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Registry Governance */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E7E2DA] p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#8B4513] flex items-center justify-center text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1C1917] font-display">
                    National Registry Verification Protocol
                  </h3>
                  <p className="text-xs font-mono text-[#78716C]">Governance framework for Republic of Maldives directory</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-mono text-[#57534E] leading-relaxed pt-2 border-t border-[#E7E2DA]">
                <p>
                  <strong>1. Normal User Permissions:</strong> When users sign up, their account is restricted to editing, customizing, and publishing <strong>their individual CV only</strong>. Normal users cannot modify other profiles or view administrative telemetry.
                </p>
                <p>
                  <strong>2. Administrator Verification:</strong> Verification badges are awarded by the Administrator following validation of professional qualifications, resort appointments, or marine certifications.
                </p>
                <p>
                  <strong>3. Moderation Standard:</strong> Suspended profiles are immediately unindexed from the public directory while preserving user draft data.
                </p>
                <p>
                  <strong>4. Role Elevation:</strong> Administrators can safely promote trusted domain officers to manage specific sector verification programs.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E7E2DA] p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#1C1917] flex items-center justify-center text-[#C27D38]">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1C1917] font-display">
                    Registry Backup & Archive
                  </h3>
                  <p className="text-xs font-mono text-[#78716C]">Export complete talent records</p>
                </div>
              </div>

              <p className="text-xs font-mono text-[#57534E] leading-relaxed border-t border-[#E7E2DA] pt-3">
                Generate a timestamped snapshot of all published portfolios, verified credentials, experiences, and inquiry logs for compliance, government records, and audit backups.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleExportData}
                  className="w-full py-2.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON Directory Snapshot</span>
                </button>

                <button
                  onClick={handleExportRegistrationLedger}
                  className="w-full py-2.5 bg-[#1C1917] hover:bg-[#2E2A27] text-[#FAF9F6] rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Export Registration Audit CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Confirmation Modal */}
      {roleChangeModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-xl p-6 max-w-md w-full shadow-2xl border border-[#E7E2DA] text-[#2A2A2A] animate-in fade-in zoom-in-95">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border ${
              roleChangeModal.newRole === "admin"
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-rose-100 text-rose-800 border-rose-200"
            }`}>
              {roleChangeModal.newRole === "admin" ? (
                <ShieldCheck className="w-6 h-6 text-amber-700" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-700" />
              )}
            </div>

            <h3 className="text-base font-bold font-display text-center text-[#1C1917]">
              {roleChangeModal.newRole === "admin"
                ? "Promote to Administrator?"
                : "Revoke Administrator Authority?"}
            </h3>

            <p className="text-xs font-mono text-[#78716C] text-center mt-2 leading-relaxed">
              {roleChangeModal.newRole === "admin" ? (
                <>
                  Granting <strong>Administrator</strong> privileges to <strong>{roleChangeModal.profile.fullName}</strong> will allow them to verify credentials, feature profiles, moderate directory listings, and manage system users.
                </>
              ) : (
                <>
                  Revoking administrator rights for <strong>{roleChangeModal.profile.fullName}</strong> will restrict their account back to managing their own individual digital CV only.
                </>
              )}
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setRoleChangeModal(null)}
                className="flex-1 py-2 rounded-md bg-[#F2ECE4] hover:bg-[#E7E2DA] text-xs font-mono font-bold text-[#57534E] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                className={`flex-1 py-2 rounded-md text-xs font-mono font-bold text-white transition-colors shadow-2xs ${
                  roleChangeModal.newRole === "admin"
                    ? "bg-[#8B4513] hover:bg-[#70350B]"
                    : "bg-rose-700 hover:bg-rose-800"
                }`}
              >
                {roleChangeModal.newRole === "admin" ? "Confirm Promotion" : "Confirm Demotion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision New Administrator Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-xl p-6 max-w-lg w-full shadow-2xl border border-[#E7E2DA] text-[#2A2A2A] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E2DA]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#1C1917] text-[#C27D38] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-display text-[#1C1917]">
                    Provision Administrator Account
                  </h3>
                  <p className="text-[11px] font-mono text-[#78716C]">
                    Create an official administrative identity for Registry governance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateAdminModal(false)}
                className="text-[#78716C] hover:text-[#1C1917] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-3.5 mt-4 text-xs font-mono">
              <div>
                <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                  Full Name & Designation *
                </label>
                <input
                  type="text"
                  required
                  value={newAdminForm.fullName}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })}
                  placeholder="e.g. Ibrahim Shiyam"
                  className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    placeholder="officer@portfoliomaldives.mv"
                    className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={newAdminForm.phone}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                    placeholder="+960 330-0000"
                    className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                  Official Role Title
                </label>
                <input
                  type="text"
                  value={newAdminForm.title}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, title: e.target.value })}
                  placeholder="National Directory Administrator & Verification Officer"
                  className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                    Atoll Authority
                  </label>
                  <select
                    value={newAdminForm.atoll}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, atoll: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  >
                    {MALDIVES_ATOLLS.map((a) => (
                      <option key={a.code} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                    Island / Office Location
                  </label>
                  <input
                    type="text"
                    value={newAdminForm.island}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, island: e.target.value })}
                    placeholder="Malé City"
                    className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                  Sector & Industry Oversight
                </label>
                <select
                  value={newAdminForm.industry}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, industry: e.target.value as IndustryType })}
                  className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                >
                  {MALDIVES_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#E7E2DA]">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="px-4 py-2 rounded-md bg-[#F2ECE4] hover:bg-[#E7E2DA] text-[#57534E] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#1C1917] hover:bg-[#2E2A27] text-white font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C27D38]" />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalProfile && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-xl p-6 max-w-md w-full shadow-2xl border border-[#E7E2DA] text-[#2A2A2A] animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-display text-center text-[#1C1917]">
              Delete Specialist Profile?
            </h3>
            <p className="text-xs font-mono text-[#78716C] text-center mt-2 leading-relaxed">
              Are you sure you want to permanently remove <strong>{deleteModalProfile.fullName}</strong> (@{deleteModalProfile.slug}) from the registry? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setDeleteModalProfile(null)}
                className="flex-1 py-2 rounded-md bg-[#F2ECE4] hover:bg-[#E7E2DA] text-xs font-mono font-bold text-[#57534E] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-md bg-rose-700 hover:bg-rose-800 text-xs font-mono font-bold text-white transition-colors shadow-2xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
