import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { photoUrl } from "../lib/supabase";
import { initials } from "../lib/format";

type Theme = "light" | "system" | "dark";

function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem("pm-theme") as Theme) || "system"; } catch { return "system"; }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", theme);
    try { localStorage.setItem("pm-theme", theme); } catch { /* ignore */ }
  }, [theme]);
  const opts: { v: Theme; label: string; icon: ReactNode }[] = [
    { v: "light", label: "Light", icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> },
    { v: "system", label: "System", icon: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></> },
    { v: "dark", label: "Dark", icon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /> },
  ];
  const move = (dir: number) => {
    const i = opts.findIndex((o) => o.v === theme);
    setTheme(opts[(i + dir + opts.length) % opts.length]!.v);
  };
  return (
    <div className="theme-switch" role="radiogroup" aria-label="Colour theme"
      onKeyDown={(e) => { if (e.key === "ArrowRight") { move(1); e.preventDefault(); } if (e.key === "ArrowLeft") { move(-1); e.preventDefault(); } }}>
      {opts.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={theme === o.v} aria-label={o.label} title={o.label}
          tabIndex={theme === o.v ? 0 : -1} onClick={() => setTheme(o.v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{o.icon}</svg>
        </button>
      ))}
    </div>
  );
}

function AccountMenu() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  if (!user) return <Link className="btn small primary" to="/sign-in">Sign in</Link>;
  const name = profile?.full_name || user.email || "Account";
  const src = photoUrl(profile?.photo_path);
  return (
    <div className="account" ref={ref}>
      <button className="account-btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)}>
        {src ? <img className="mini-avatar" src={src} alt="" /> : <span className="mini-avatar" aria-hidden="true">{initials(name)}</span>}
        <span>{name}</span>
      </button>
      {open && (
        <div className="card account-menu" role="menu">
          <div className="meta">{user.email}{isAdmin ? " · Admin" : ""}</div>
          <Link role="menuitem" to="/my-cv" onClick={() => setOpen(false)}>My CV</Link>
          {profile && <Link role="menuitem" to={`/cv/${profile.slug}`} onClick={() => setOpen(false)}>View my public CV</Link>}
          <Link role="menuitem" to="/hiring" onClick={() => setOpen(false)}>Hiring</Link>
          <button role="menuitem" onClick={async () => { setOpen(false); await signOut(); navigate("/"); }}>Sign out</button>
        </div>
      )}
    </div>
  );
}

export function Header({ pending }: { pending: number }) {
  const { isAdmin } = useAuth();
  return (
    <header className="top">
      <div className="wrap">
        <Link className="brand" to="/" aria-label="Portfolio Maldives home">
          <span className="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></svg>
          </span>
          <span>
            <span className="brand-name">Portfolio <em>Maldives</em></span><br />
            <span className="brand-sub" dir="rtl" lang="dv">ދިވެހިރާއްޖޭގެ ވަޒީފާ އަދި ފަންނުވެރިން</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Sections">
          <NavLink to="/" end>Jobs</NavLink>
          <NavLink to="/talent">Talent</NavLink>
          <NavLink to="/my-cv">My CV</NavLink>
          <NavLink to="/hiring">Hiring</NavLink>
          {isAdmin && <NavLink to="/registry">Registry{pending ? <span className="count"> {pending}</span> : null}</NavLink>}
        </nav>
        <ThemeSwitch />
        <AccountMenu />
      </div>
    </header>
  );
}
