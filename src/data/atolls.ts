import { AtollRecord, IslandRecord } from "../types";

export interface ProfessionRole {
  id: string;
  title: string;
  industry: string;
  typicalSkills: string[];
  certifications?: string[];
}

export interface IndustrySectorInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  keyProfessions: string[];
  nationalSignificance: string;
}

export const MALDIVES_INDUSTRIES_DETAILED: IndustrySectorInfo[] = [
  {
    id: "civil_service",
    name: "Civil Service (CSC)",
    shortName: "Civil Service",
    description: "Core government ministries, departments, island/atoll councils, public schools, and government hospitals/health centers.",
    iconName: "Shield",
    keyProfessions: [
      "Ministry Policy Director",
      "Island Council President",
      "Public School Principal",
      "Government Hospital Administrator",
      "Atoll Council Coordinator",
      "Civil Service Commission Officer",
      "Public School Teacher",
      "Government Health Center Doctor"
    ],
    nationalSignificance: "The administrative backbone of the Maldives, delivering public services across all inhabited islands and atolls."
  },
  {
    id: "soes",
    name: "State-Owned Enterprises (SOEs) / Public Companies",
    shortName: "SOEs",
    description: "Government-backed commercial corporations (e.g., STO, Dhiraagu, BML, MACL, HDC, Fenaka, STELCO, MTCC, Island Aviation).",
    iconName: "Building2",
    keyProfessions: [
      "SOE Chief Executive Officer",
      "Corporate Operations Manager",
      "State Trading Organization (STO) Manager",
      "Dhiraagu Telecom Engineer",
      "Bank of Maldives (BML) Officer",
      "MACL Airport Operations Lead",
      "Fenaka Utility Engineer",
      "MTCC Construction Manager",
      "Island Aviation Pilot"
    ],
    nationalSignificance: "Government-backed corporations driving telecom, banking, utilities, aviation, and infrastructure nationwide."
  },
  {
    id: "hospitality_resort",
    name: "Hospitality & Resort Sector",
    shortName: "Hospitality",
    description: "Private island tourist resorts, luxury safari yachts/liveaboards, resort management groups, and specialized dive/water sports centers.",
    iconName: "Hotel",
    keyProfessions: [
      "Resort General Manager",
      "Director of Food & Beverage",
      "Executive Housekeeper",
      "Guest Experience Director",
      "Director of Human Resources",
      "Spa & Wellness Director",
      "Front Office Manager",
      "Dive Center Manager",
      "Liveaboard Safari Captain"
    ],
    nationalSignificance: "The economic cornerstone of the Maldives, demanding world-class hospitality leadership across 170+ luxury resort islands."
  },
  {
    id: "private_sector",
    name: "Private Sector (General Commercial)",
    shortName: "Private Sector",
    description: "Private registered companies, retail businesses, local guesthouses, private clinics, trading firms, and construction contractors.",
    iconName: "Briefcase",
    keyProfessions: [
      "Private Company Director",
      "Guesthouse Owner & Manager",
      "Retail Business Owner",
      "Private Clinic Doctor",
      "Trading Firm Manager",
      "Construction Contractor",
      "Accounting & Finance Manager",
      "Sales & Marketing Manager"
    ],
    nationalSignificance: "The commercial engine of local economies, providing goods, services, and employment across all inhabited islands."
  },
  {
    id: "statutory",
    name: "Independent / Statutory Institutions",
    shortName: "Statutory Bodies",
    description: "Constitutional and independent bodies (e.g., MMA, MIRA, Elections Commission, ACC, Judiciary, HRCM).",
    iconName: "Scale",
    keyProfessions: [
      "Maldives Monetary Authority (MMA) Officer",
      "Maldives Inland Revenue Authority (MIRA) Officer",
      "Elections Commission Officer",
      "Anti-Corruption Commission (ACC) Investigator",
      "Judiciary Court Officer",
      "Human Rights Commission (HRCM) Officer",
      "Auditor General Staff",
      "Judicial Service Commission Officer"
    ],
    nationalSignificance: "Constitutional and independent bodies safeguarding governance, integrity, and rule of law in the Maldives."
  },
  {
    id: "civil_society",
    name: "Civil Society / NGOs & International Agencies",
    shortName: "NGOs & International",
    description: "Non-profit organizations, community associations, and UN/development agencies (UNDP, WHO, UNICEF).",
    iconName: "HeartHandshake",
    keyProfessions: [
      "NGO Program Manager",
      "Community Association Coordinator",
      "UNDP Project Officer",
      "WHO Health Coordinator",
      "UNICEF Child Protection Officer",
      "Non-Profit Operations Manager",
      "International Development Consultant",
      "Community Outreach Coordinator"
    ],
    nationalSignificance: "Non-profits, community associations, and UN agencies driving social development and humanitarian programs."
  },
  {
    id: "freelance",
    name: "Freelance, Gig & Self-Employed",
    shortName: "Freelance & Self-Employed",
    description: "Independent contractors, creators, freelancers, and local business owners.",
    iconName: "User",
    keyProfessions: [
      "Freelance Graphic Designer",
      "Independent Software Developer",
      "Freelance Photographer / Videographer",
      "Self-Employed Business Owner",
      "Independent Consultant",
      "Freelance Content Creator",
      "Gig Economy Worker",
      "Independent Tradesperson"
    ],
    nationalSignificance: "A growing workforce of independent professionals, creators, and small business owners across the Maldives."
  }
];

export const MALDIVES_INDUSTRIES = [
  "Civil Service (CSC)",
  "State-Owned Enterprises (SOEs) / Public Companies",
  "Hospitality & Resort Sector",
  "Private Sector (General Commercial)",
  "Independent / Statutory Institutions",
  "Civil Society / NGOs & International Agencies",
  "Freelance, Gig & Self-Employed",
] as const;

export interface AtollInfo {
  code: string;
  name: string;
  islands: string[];
}

// OFFICIAL MALDIVIAN ADMINISTRATIVE ATOLLS & ISLANDS BASELINE REGISTRY
export const INITIAL_ATOLL_DATA: { code: string; name: string; islands: string[] }[] = [
  {
    code: "HA",
    name: "Haa Alif",
    islands: [
      "Baarah",
      "Dhidhdhoo",
      "Filladhoo",
      "Hoarafushi",
      "Ihavandhoo",
      "Kelaa",
      "Maarandhoo",
      "Mulhadhoo",
      "Muraidhoo",
      "Thakandhoo",
      "Thuraakunu",
      "Uligamu",
      "Utheemu",
      "Vashafaru"
    ]
  },
  {
    code: "HDh",
    name: "Haa Dhaalu",
    islands: [
      "Finey",
      "Hanimaadhoo",
      "Hirimaradhoo",
      "Kulhudhuffushi",
      "Kumundhoo",
      "Kurinbi",
      "Makunudhoo",
      "Naivaadhoo",
      "Nellaidhoo",
      "Neykurendhoo",
      "Nolhivaramu",
      "Nolhivaranfaru",
      "Vaikaradhoo"
    ]
  },
  {
    code: "Sh",
    name: "Shaviyani",
    islands: [
      "Bileffahi",
      "Feevah",
      "Feydhoo",
      "Foakaidhoo",
      "Funadhoo",
      "Goidhoo",
      "Kanditheemu",
      "Komandoo",
      "Lhaimagu",
      "Maaungoodhoo",
      "Maroshi",
      "Milandhoo",
      "Narudhoo",
      "Noomaraa"
    ]
  },
  {
    code: "N",
    name: "Noonu",
    islands: [
      "Fohdhoo",
      "Henbandhoo",
      "Holhudhoo",
      "Kendhikulhudhoo",
      "Kudafari",
      "Landhoo",
      "Lhohi",
      "Maafaru",
      "Maalhendhoo",
      "Magoodhoo",
      "Manadhoo",
      "Miladhoo",
      "Velidhoo"
    ]
  },
  {
    code: "R",
    name: "Raa",
    islands: [
      "Alifushi",
      "Angolhitheemu",
      "Dhuvaafaru",
      "Fainu",
      "Hulhudhuffaaru",
      "Inguraidhoo",
      "Innamaadhoo",
      "Kinolhas",
      "Maakurathu",
      "Maduvvari",
      "Meedhoo",
      "Rasgetheemu",
      "Rasmaadhoo",
      "Ungoofaaru",
      "Vaadhoo"
    ]
  },
  {
    code: "B",
    name: "Baa",
    islands: [
      "Dharavandhoo",
      "Dhonfanu",
      "Eydhafushi",
      "Fehendhoo",
      "Fulhadhoo",
      "Goidhoo",
      "Hithaadhoo",
      "Kamadhoo",
      "Kendhoo",
      "Kihaadhoo",
      "Kudarikilu",
      "Maalhos",
      "Thulhaadhoo"
    ]
  },
  {
    code: "Lh",
    name: "Lhaviyani",
    islands: [
      "Hinnavaru",
      "Kurendhoo",
      "Maafilaafushi",
      "Naifaru",
      "Olhuvelifushi"
    ]
  },
  {
    code: "K",
    name: "Kaafu",
    islands: [
      "Dhiffushi",
      "Gaafaru",
      "Gulhi",
      "Guraidhoo",
      "Himmafushi",
      "Huraa",
      "Kaashidhoo",
      "Maafushi",
      "Thulusdhoo"
    ]
  },
  {
    code: "Male",
    name: "Malé City",
    islands: [
      "Malé",
      "Hulhumalé",
      "Villimalé",
      "Hulhulé"
    ]
  },
  {
    code: "AA",
    name: "Alif Alif",
    islands: [
      "Bodufolhudhoo",
      "Feridhoo",
      "Himandhoo",
      "Maalhos",
      "Mathiveri",
      "Rasdhoo",
      "Thoddoo",
      "Ukulhas"
    ]
  },
  {
    code: "ADh",
    name: "Alif Dhaalu",
    islands: [
      "Dhangethi",
      "Dhiddhoo",
      "Dhigurah",
      "Fenfushi",
      "Hangnaameedhoo",
      "Kunburudhoo",
      "Maamigili",
      "Mahibadhoo",
      "Mandhoo",
      "Omadhoo"
    ]
  },
  {
    code: "V",
    name: "Vaavu",
    islands: [
      "Felidhoo",
      "Fulidhoo",
      "Keyodhoo",
      "Rakeedhoo",
      "Thinadhoo"
    ]
  },
  {
    code: "M",
    name: "Meemu",
    islands: [
      "Dhiggaru",
      "Kolhufushi",
      "Maduvvaree",
      "Mulah",
      "Muli",
      "Naalaafushi",
      "Raimmandhoo",
      "Veyvah"
    ]
  },
  {
    code: "F",
    name: "Faafu",
    islands: [
      "Bileddhoo",
      "Dharanboodhoo",
      "Feeali",
      "Magoodhoo",
      "Nilandhoo"
    ]
  },
  {
    code: "Dh",
    name: "Dhaalu",
    islands: [
      "Bandidhoo",
      "Hulhudheli",
      "Kudahuvadhoo",
      "Maaenboodhoo",
      "Meedhoo",
      "Rinbudhoo"
    ]
  },
  {
    code: "Th",
    name: "Thaa",
    islands: [
      "Buruni",
      "Dhiyamigili",
      "Gaadhiffushi",
      "Guraidhoo",
      "Hirilandhoo",
      "Kandoodhoo",
      "Kinbidhoo",
      "Madifushi",
      "Omadhoo",
      "Thimarafushi",
      "Vandhoo",
      "Veymandoo",
      "Vilufushi"
    ]
  },
  {
    code: "L",
    name: "Laamu",
    islands: [
      "Dhanbidhoo",
      "Fonadhoo",
      "Gan",
      "Hithadhoo",
      "Isdhoo",
      "Kalaidhoo",
      "Kunahandhoo",
      "Maabaidhoo",
      "Maamendhoo",
      "Maavah",
      "Mundoo"
    ]
  },
  {
    code: "GA",
    name: "Gaafu Alif",
    islands: [
      "Dhaandhoo",
      "Dhevvadhoo",
      "Gemanafushi",
      "Kanduhulhudhoo",
      "Kolamaafushi",
      "Kondey",
      "Maamendhoo",
      "Nilandhoo",
      "Villingili"
    ]
  },
  {
    code: "GDh",
    name: "Gaafu Dhaalu",
    islands: [
      "Faresmaathodaa",
      "Fiyoaree",
      "Gadhdhoo",
      "Hoadedhdhoo",
      "Madaveli",
      "Nadellaa",
      "Rathafandhoo",
      "Thinadhoo",
      "Vaadhoo"
    ]
  },
  {
    code: "Gn",
    name: "Gnaviyani",
    islands: [
      "Fuvahmulah"
    ]
  },
  {
    code: "S",
    name: "Seenu",
    islands: [
      "Hithadhoo",
      "Feydhoo",
      "Maradhoo",
      "Maradhoo-Feydhoo",
      "Hulhudhoo",
      "Meedhoo",
      "Gan"
    ]
  }
];

// Helper to generate full default AtollRecord array
export function createDefaultAtollRegistry(): AtollRecord[] {
  return INITIAL_ATOLL_DATA.map((atoll, idx) => ({
    id: `atoll_${atoll.code.toLowerCase()}_${idx}`,
    code: atoll.code,
    name: atoll.name,
    isActive: true,
    islands: atoll.islands.map((islandName, islandIdx) => ({
      id: `isl_${atoll.code.toLowerCase()}_${islandIdx}_${islandName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      name: islandName,
      isActive: true,
      isCustom: false,
    }))
  }));
}

const ATOLL_STORAGE_KEY = "portfolio_maldives_atoll_registry_v2";

/**
 * Retrieve current Atoll and Island Registry from localStorage or create default
 */
export function getAtollRegistry(): AtollRecord[] {
  try {
    const raw = localStorage.getItem(ATOLL_STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultAtollRegistry();
      localStorage.setItem(ATOLL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: AtollRecord[] = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = createDefaultAtollRegistry();
    localStorage.setItem(ATOLL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (err) {
    console.error("Failed to load atoll registry:", err);
    return createDefaultAtollRegistry();
  }
}

/**
 * Save updated registry to localStorage and dispatch custom event for instant reactivity
 */
export function saveAtollRegistry(records: AtollRecord[]): void {
  try {
    localStorage.setItem(ATOLL_STORAGE_KEY, JSON.stringify(records));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("atoll-registry-updated", { detail: records }));
    }
  } catch (err) {
    console.error("Failed to save atoll registry:", err);
  }
}

/**
 * Returns only active Atolls and their active Islands
 */
export function getActiveAtollRegistry(): AtollRecord[] {
  const all = getAtollRegistry();
  return all
    .filter((a) => a.isActive)
    .map((a) => ({
      ...a,
      islands: a.islands.filter((i) => i.isActive)
    }));
}

/**
 * Backward compatibility array formatted as AtollInfo[]
 */
export function getActiveAtollsList(): AtollInfo[] {
  const active = getActiveAtollRegistry();
  return active.map((a) => ({
    code: a.code,
    name: a.name,
    islands: a.islands.map((i) => i.name)
  }));
}

export const MALDIVES_ATOLLS: AtollInfo[] = INITIAL_ATOLL_DATA.map((a) => ({
  code: a.code,
  name: a.name,
  islands: a.islands
}));

/**
 * Registry Admin Actions
 */

// Toggle Atoll Active / Inactive
export function toggleAtollStatus(atollId: string, isActive?: boolean): AtollRecord[] {
  const current = getAtollRegistry();
  const updated = current.map((a) => {
    if (a.id === atollId) {
      return { ...a, isActive: isActive !== undefined ? isActive : !a.isActive };
    }
    return a;
  });
  saveAtollRegistry(updated);
  return updated;
}

// Toggle Island Active / Inactive
export function toggleIslandStatus(atollId: string, islandId: string, isActive?: boolean): AtollRecord[] {
  const current = getAtollRegistry();
  const updated = current.map((a) => {
    if (a.id === atollId) {
      return {
        ...a,
        islands: a.islands.map((i) => {
          if (i.id === islandId) {
            return { ...i, isActive: isActive !== undefined ? isActive : !i.isActive };
          }
          return i;
        })
      };
    }
    return a;
  });
  saveAtollRegistry(updated);
  return updated;
}

// Add New Atoll
export function addAtollRecord(code: string, name: string, initialIslands: string[] = []): AtollRecord[] {
  const current = getAtollRegistry();
  const newAtoll: AtollRecord = {
    id: `atoll_${code.toLowerCase()}_${Date.now()}`,
    code: code.trim().toUpperCase(),
    name: name.trim(),
    isActive: true,
    islands: initialIslands
      .filter((i) => i.trim().length > 0)
      .map((name, idx) => ({
        id: `isl_${Date.now()}_${idx}`,
        name: name.trim(),
        isActive: true,
        isCustom: true
      }))
  };
  const updated = [...current, newAtoll];
  saveAtollRegistry(updated);
  return updated;
}

// Update Atoll Name and Code
export function updateAtollRecord(atollId: string, name: string, code: string): AtollRecord[] {
  const current = getAtollRegistry();
  const updated = current.map((a) => {
    if (a.id === atollId) {
      return {
        ...a,
        name: name.trim(),
        code: code.trim().toUpperCase()
      };
    }
    return a;
  });
  saveAtollRegistry(updated);
  return updated;
}

// Delete Atoll
export function deleteAtollRecord(atollId: string): AtollRecord[] {
  const current = getAtollRegistry();
  const updated = current.filter((a) => a.id !== atollId);
  saveAtollRegistry(updated);
  return updated;
}

// Add Island to Atoll
export function addIslandRecord(atollId: string, islandName: string): AtollRecord[] {
  const current = getAtollRegistry();
  const updated = current.map((a) => {
    if (a.id === atollId) {
      const newIsland: IslandRecord = {
        id: `isl_${Date.now()}_${islandName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        name: islandName.trim(),
        isActive: true,
        isCustom: true
      };
      return {
        ...a,
        islands: [...a.islands, newIsland]
      };
    }
    return a;
  });
  saveAtollRegistry(updated);
  return updated;
}

// Update Island Name
export function updateIslandRecord(atollId: string, islandId: string, newName: string): AtollRecord[] {
  const current = getAtollRegistry();
  const updated = current.map((a) => {
    if (a.id === atollId) {
      return {
        ...a,
        islands: a.islands.map((i) => {
          if (i.id === islandId) {
            return { ...i, name: newName.trim() };
          }
          return i;
        })
      };
    }
    return a;
  });
  saveAtollRegistry(updated);
  return updated;
}

// Delete Island
export function deleteIslandRecord(atollId: string, islandId: string): AtollRecord[] {
  const current = getAtollRegistry();
  const updated = current.map((a) => {
    if (a.id === atollId) {
      return {
        ...a,
        islands: a.islands.filter((i) => i.id !== islandId)
      };
    }
    return a;
  });
  saveAtollRegistry(updated);
  return updated;
}

// Reset Entire Registry to Baseline
export function resetAtollRegistryToDefault(): AtollRecord[] {
  const initial = createDefaultAtollRegistry();
  saveAtollRegistry(initial);
  return initial;
}
