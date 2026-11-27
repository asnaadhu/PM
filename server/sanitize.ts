/**
 * Normalises untrusted text before it is stored or interpolated into an AI prompt:
 * coerces to string, strips control characters, neutralises quote/backtick fences
 * and caps the length.
 */
export function clean(value: unknown, maxLength = 500): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/`{3,}/g, "'''")
    .replace(/"/g, "'")
    .trim()
    .slice(0, maxLength);
}

/** Lower-case URL slug: letters, digits and single dashes only. */
export function cleanSlug(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
