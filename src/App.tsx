import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Skeletons } from "./components/ui";
import { useAuth } from "./lib/auth";
import { isConfigured, supabase } from "./lib/supabase";
import JobsPage from "./pages/JobsPage";
import SetupNeeded from "./pages/SetupNeeded";

const JobPage = lazy(() => import("./pages/JobPage"));
const TalentPage = lazy(() => import("./pages/TalentPage"));
const CvPage = lazy(() => import("./pages/CvPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const MyCvPage = lazy(() => import("./pages/MyCvPage"));
const HiringPage = lazy(() => import("./pages/HiringPage"));
const RegistryPage = lazy(() => import("./pages/RegistryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [pending, setPending] = useState(0);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  // Waiting company requests, shown on the Registry tab for admins.
  useEffect(() => {
    if (!isConfigured || !isAdmin) { setPending(0); return; }
    supabase.from("companies").select("id", { count: "exact", head: true }).eq("status", "pending")
      .then(({ count }) => setPending(count || 0));
  }, [isAdmin, location.pathname]);

  if (!isConfigured) return <SetupNeeded />;

  return (
    <>
      <Header pending={pending} />
      <main className="wrap" id="main">
        <Suspense fallback={<Skeletons n={3} />}>
          <Routes>
            <Route path="/" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobPage />} />
            <Route path="/talent" element={<TalentPage />} />
            <Route path="/cv/:slug" element={<CvPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/my-cv" element={<MyCvPage />} />
            <Route path="/hiring" element={<HiringPage />} />
            <Route path="/registry" element={<RegistryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <footer><div className="wrap">Portfolio Maldives · free CVs and job ads for every atoll, from Haa Alif to Seenu.</div></footer>
    </>
  );
}
