import { useState } from "react";
import { useToast } from "../lib/toast";

/** Copies the current page's address. Falls back to a selectable box when the clipboard is blocked. */
export function CopyLink({ label = "Copy link" }: { label?: string }) {
  const toast = useToast();
  const [fallback, setFallback] = useState("");
  return (
    <>
      <button className="btn small" type="button" onClick={async () => {
        const url = window.location.href;
        try { await navigator.clipboard.writeText(url); toast("Link copied"); }
        catch { setFallback(url); toast("Select the link and copy it."); }
      }}>{label}</button>
      {fallback && <input className="copy-fallback" readOnly value={fallback} aria-label="Link to copy" autoFocus onFocus={(e) => e.target.select()} />}
    </>
  );
}
