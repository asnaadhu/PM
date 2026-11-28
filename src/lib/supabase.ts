import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** False until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (see README). */
export const isConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient = isConfigured
  ? createClient(url as string, anonKey as string, { auth: { persistSession: true, autoRefreshToken: true } })
  : (null as unknown as SupabaseClient);

/** Public URL for a file in the "photos" bucket, or "" when there is none. */
export function photoUrl(path: string | null | undefined): string {
  if (!path || !isConfigured) return "";
  return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}
