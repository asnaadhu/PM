import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../lib/format";
import { useToast } from "../lib/toast";

/** Passwordless sign-in: an emailed link, or the 6-digit code from the same email. */
export default function SignInPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const next = (params.get("next") || "/my-cv").startsWith("/") ? params.get("next") || "/my-cv" : "/my-cv";
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate(next, { replace: true }); }, [user, next, navigate]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) { toast("Enter a valid email address.", true); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { emailRedirectTo: window.location.origin + next, shouldCreateUser: true },
    });
    setBusy(false);
    if (error) toast(/rate/i.test(error.message) ? "Too many emails. Wait a minute and try again." : errorMessage(error), true);
    else setSent(true);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) toast("That code didn't work. Check it, or use the link in the email.", true);
  };

  return (
    <div className="card auth-card">
      <p className="eyebrow">Free account</p>
      <h1>{sent ? "Check your email" : "Sign in or sign up"}</h1>
      {!sent ? (
        <form onSubmit={send} style={{ display: "grid", gap: 14 }}>
          <p className="muted">Enter your email and we'll send you a sign-in link. No password needed. New here? This creates your free account.</p>
          <label className="field" htmlFor="si-email"><span>Email</span>
            <input id="si-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </label>
          <button className="btn primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button>
        </form>
      ) : (
        <form onSubmit={verify} style={{ display: "grid", gap: 14 }}>
          <p>We sent a sign-in link to <strong>{email}</strong>. Open it on this device to continue.</p>
          <label className="field" htmlFor="si-code"><span>Or type the 6-digit code from the email</span>
            <input id="si-code" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={code} onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))} />
          </label>
          <button className="btn primary" type="submit" disabled={busy || code.length < 6}>{busy ? "Checking…" : "Sign in with code"}</button>
          <button className="btn ghost" type="button" onClick={() => { setSent(false); setCode(""); }}>Use a different email</button>
        </form>
      )}
    </div>
  );
}

export function RequireSignIn({ what }: { what: string }) {
  const navigate = useNavigate();
  return (
    <div className="empty">
      <h3>Sign in to {what}</h3>
      <p>It's free. We'll email you a sign-in link.</p>
      <button className="btn primary" onClick={() => navigate(`/sign-in?next=${encodeURIComponent(window.location.pathname)}`)}>Sign in</button>
    </div>
  );
}
