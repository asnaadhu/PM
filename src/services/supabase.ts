import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
