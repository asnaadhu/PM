export default function SetupNeeded() {
  return (
    <main className="wrap">
      <div className="card setup">
        <p className="eyebrow">Setup</p>
        <h1 style={{ fontSize: 32 }}>Connect Supabase to start</h1>
        <p>This site stores CVs, companies and jobs in Supabase. Add your project's details, then restart the site.</p>
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
          <li>Create a free project at supabase.com.</li>
          <li>Run the SQL files in <code>supabase/migrations</code> in the project's SQL editor.</li>
          <li>Copy <code>.env.example</code> to <code>.env.local</code> and fill in <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> from Project Settings → API.</li>
        </ol>
        <p className="muted small">The README has the full steps, including making yourself an admin.</p>
      </div>
    </main>
  );
}
