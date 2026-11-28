import { supabase } from "./supabase";

/** Asks the "improve-text" Edge Function (Claude) to polish a CV summary or job description. */
export async function improveText(kind: "summary" | "job", text: string, context: Record<string, string>): Promise<string> {
  const { data, error } = await supabase.functions.invoke("improve-text", { body: { kind, text, context } });
  if (error) throw error;
  const out = (data as { text?: string } | null)?.text?.trim();
  if (!out) throw new Error("No suggestion came back.");
  return out;
}
