import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isConfigured, supabase } from "./supabase";
import type { Company, Profile } from "./types";

interface AuthState {
  ready: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  profile: Profile | null;
  company: Company | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  const load = useCallback(async (s: Session | null) => {
    setSession(s);
    if (!s) { setIsAdmin(false); setProfile(null); setCompany(null); setReady(true); return; }
    const uid = s.user.id;
    const [admin, prof, comp] = await Promise.all([
      supabase.from("admins").select("user_id").eq("user_id", uid).maybeSingle(),
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("companies").select("*").eq("owner_id", uid).maybeSingle(),
    ]);
    setIsAdmin(Boolean(admin.data));
    setProfile((prof.data as Profile) || null);
    setCompany((comp.data as Company) || null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      // Defer so Supabase finishes its own work before we query.
      setTimeout(() => load(s), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [load]);

  const refresh = useCallback(async () => {
    if (!isConfigured) return;
    const { data } = await supabase.auth.getSession();
    await load(data.session);
  }, [load]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ ready, session, user: session?.user ?? null, isAdmin, profile, company, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
