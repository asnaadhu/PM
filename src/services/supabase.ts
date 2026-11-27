import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let clientPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Loads the Supabase SDK on first use (keeps it out of the initial bundle) and
 * returns null when the project has no Supabase credentials configured.
 */
function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(supabaseUrl as string, supabaseAnonKey as string)
    );
  }
  return clientPromise;
}

export interface PositionRecord {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  is_custom: boolean;
  created_at: string;
}

export interface PositionGroup {
  category: string;
  subcategories: { subcategory: string; positions: PositionRecord[] }[];
}

export async function fetchPositions(): Promise<PositionRecord[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("positions")
    .select("id, category, subcategory, name, is_custom, created_at")
    .order("category", { ascending: true })
    .order("subcategory", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load positions from Supabase:", error.message);
    return [];
  }
  return (data as PositionRecord[]) || [];
}

export function groupPositions(rows: PositionRecord[]): PositionGroup[] {
  const map = new Map<string, Map<string, PositionRecord[]>>();
  for (const row of rows) {
    if (!map.has(row.category)) map.set(row.category, new Map());
    const subMap = map.get(row.category)!;
    if (!subMap.has(row.subcategory)) subMap.set(row.subcategory, []);
    subMap.get(row.subcategory)!.push(row);
  }
  return Array.from(map.entries()).map(([category, subMap]) => ({
    category,
    subcategories: Array.from(subMap.entries()).map(([subcategory, positions]) => ({
      subcategory,
      positions,
    })),
  }));
}

export async function addCustomPosition(
  category: string,
  subcategory: string,
  name: string
): Promise<PositionRecord | null> {
  const cleanCat = category.trim();
  const cleanSub = subcategory.trim() || "Other";
  const cleanName = name.trim();
  if (!cleanCat || !cleanName) return null;

  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("positions")
    .insert({
      category: cleanCat,
      subcategory: cleanSub,
      name: cleanName,
      is_custom: true,
    })
    .select("id, category, subcategory, name, is_custom, created_at")
    .maybeSingle();

  if (error) {
    console.error("Failed to add custom position:", error.message);
    return null;
  }
  return (data as PositionRecord) || null;
}
