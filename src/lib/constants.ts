export const SECTORS = [
  "Hospitality & Resorts", "Civil Service", "State-Owned Enterprises", "Private Sector",
  "Health", "Education", "Fisheries & Marine", "Construction & Engineering",
  "NGOs & International Agencies", "Freelance & Self-Employed",
];

export const ATOLLS = [
  "Malé City", "Kaafu", "Haa Alif", "Haa Dhaalu", "Shaviyani", "Noonu", "Raa", "Baa", "Lhaviyani",
  "Alif Alif", "Alif Dhaalu", "Vaavu", "Meemu", "Faafu", "Dhaalu", "Thaa", "Laamu",
  "Gaafu Alif", "Gaafu Dhaalu", "Gnaviyani", "Seenu",
];

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Seasonal", "Internship", "Freelance"] as const;

export const AVAILABILITY = [
  "Full-time", "Part-time", "Contract", "Freelance", "Seasonal",
  "Remote", "Resort island posting", "Willing to relocate",
];

export const LANG_LEVELS = ["Native", "Fluent", "Professional", "Conversational"];

export const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  applied: { label: "Applied", cls: "" },
  shortlisted: { label: "Shortlisted", cls: "warn" },
  offered: { label: "Offer made", cls: "ok" },
  declined: { label: "Not selected", cls: "bad" },
};
