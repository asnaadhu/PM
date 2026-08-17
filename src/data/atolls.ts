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
    id: "hospitality",
    name: "Hospitality & Luxury Resorts",
    shortName: "Hospitality",
    description: "Executive resort leadership, guest experience architecture, luxury F&B management, and island destination operations.",
    iconName: "Hotel",
    keyProfessions: [
      "Resort General Manager",
      "Director of Food & Beverage",
      "Executive Housekeeper",
      "Guest Experience Director",
      "Director of Human Resources",
      "Spa & Wellness Director",
      "Front Office Manager",
      "Revenue & Reservations Manager"
    ],
    nationalSignificance: "The economic cornerstone of the Maldives, demanding world-class hospitality leadership across 170+ luxury resort islands."
  },
  {
    id: "marine_science",
    name: "Marine Science & Diving",
    shortName: "Marine Science",
    description: "Coral reef restoration, oceanographic research, megafauna conservation, and master diving instruction.",
    iconName: "Waves",
    keyProfessions: [
      "Lead Marine Biologist",
      "PADI Course Director / Master Instructor",
      "Coral Reef Restoration Specialist",
      "Oceanographic Researcher",
      "Marine Protected Area Manager",
      "Manta & Whale Shark Project Lead",
      "Dive Center Operations Manager"
    ],
    nationalSignificance: "Critical for safeguarding fragile atoll ecosystems, UNESCO biosphere reserves, and world-renowned underwater heritage."
  },
  {
    id: "technology",
    name: "Technology & Software",
    shortName: "Tech & FinTech",
    description: "Cloud systems engineering, FinTech payment solutions, full-stack development, and digital public infrastructure.",
    iconName: "Code",
    keyProfessions: [
      "Full Stack Software Engineer",
      "Cloud Infrastructure Architect",
      "FinTech Product Manager",
      "Cybersecurity Specialist",
      "AI & Data Engineer",
      "DevOps / SRE Lead",
      "Mobile Applications Developer"
    ],
    nationalSignificance: "Driving nationwide digital transformation, national payment gateways, island government portals, and modern tech enterprises."
  },
  {
    id: "aviation",
    name: "Aviation & Logistics",
    shortName: "Aviation",
    description: "Seaplane captaincy, international air traffic operations, aircraft maintenance engineering, and inter-atoll logistics.",
    iconName: "Plane",
    keyProfessions: [
      "Seaplane Captain (DHC-6 Twin Otter)",
      "Commercial First Officer",
      "Aviation Maintenance Engineer (B1/B2)",
      "Flight Operations Dispatcher",
      "Air Traffic Control Officer",
      "Airport Terminal Operations Lead",
      "Maritime & Island Cargo Logistics Lead"
    ],
    nationalSignificance: "Operating the world's largest seaplane fleet and connecting isolated coral atolls with rapid airborne mobility."
  },
  {
    id: "culinary",
    name: "Culinary & Gastronomy",
    shortName: "Culinary Arts",
    description: "Fine dining curation, traditional Maldivian seafood mastery, pastry artistry, and executive kitchen management.",
    iconName: "Utensils",
    keyProfessions: [
      "Executive Chef",
      "Head Pastry Chef & Chocolatier",
      "Maldivian Traditional Gastronomy Specialist",
      "Executive Sous Chef",
      "Certified Head Sommelier",
      "HACCP Food Safety & Hygiene Auditor"
    ],
    nationalSignificance: "Elevating culinary craftsmanship in international luxury private island restaurants and preserving native gastronomic heritage."
  },
  {
    id: "creative",
    name: "Creative Arts & Media",
    shortName: "Creative & Media",
    description: "Ocean & resort commercial cinematography, brand identity, architectural photography, and digital design.",
    iconName: "Camera",
    keyProfessions: [
      "Commercial Drone & Ocean Cinematographer",
      "Brand Identity & Creative Director",
      "Architectural & Resort Photographer",
      "UI/UX & Product Designer",
      "Digital Media & Communications Strategist"
    ],
    nationalSignificance: "Showcasing the visual narrative of the Maldives to global tourism and luxury lifestyle audiences."
  },
  {
    id: "finance",
    name: "Finance & Banking",
    shortName: "Finance & Banking",
    description: "Islamic banking advisory, corporate resort financing, audit compliance, and investment portfolio analysis.",
    iconName: "TrendingUp",
    keyProfessions: [
      "Islamic Finance Advisory Specialist",
      "Chief Financial Officer (CFO)",
      "Corporate Credit Risk Analyst",
      "Certified Chartered Accountant (ACCA/CIMA)",
      "Internal Audit & Regulatory Compliance Lead"
    ],
    nationalSignificance: "Powering resort capital investments, sovereign bond issuances, Islamic banking solutions, and monetary systems."
  },
  {
    id: "engineering",
    name: "Architecture & Engineering",
    shortName: "Architecture & Eng.",
    description: "Overwater villa architecture, coastal barrier engineering, solar microgrid systems, and marine structures.",
    iconName: "Building2",
    keyProfessions: [
      "Overwater Resort Architect",
      "Coastal & Marine Civil Engineer",
      "Renewable Solar Microgrid Specialist",
      "Structural & Environmental Engineer",
      "Project Construction Director"
    ],
    nationalSignificance: "Designing climate-resilient island infrastructures and bespoke overwater architectural masterpieces."
  },
  {
    id: "healthcare",
    name: "Healthcare & Wellness",
    shortName: "Healthcare & Wellness",
    description: "Hyperbaric decompression medicine, island emergency clinical practice, holistic wellness, and health management.",
    iconName: "HeartPulse",
    keyProfessions: [
      "Hyperbaric & Diving Medicine Specialist",
      "Island Emergency Clinical Doctor",
      "Physiotherapist & Sports Rehabilitation Lead",
      "Ayurvedic & Holistic Wellness Director",
      "Public Health Epidemiologist"
    ],
    nationalSignificance: "Providing vital healthcare services across remote island communities and specialized dive medical safety."
  },
  {
    id: "public_admin",
    name: "Public Administration & Policy",
    shortName: "Public Policy",
    description: "Sovereign diplomacy, environmental policy reform, registry governance, and sustainable island development.",
    iconName: "Shield",
    keyProfessions: [
      "Sustainable Development Policy Advisor",
      "Public Relations & Diplomatic Attaché",
      "National Directory Administrator & Verification Officer",
      "Environmental Impact Assessment (EIA) Lead",
      "Local Government & Council Governance Specialist"
    ],
    nationalSignificance: "Shaping national policy frameworks, environmental protection laws, and international climate advocacy."
  }
];

export const MALDIVES_INDUSTRIES = [
  "Hospitality & Luxury Resorts",
  "Marine Science & Diving",
  "Technology & Software",
  "Creative Arts & Media",
  "Finance & Banking",
  "Aviation & Logistics",
  "Architecture & Engineering",
  "Healthcare & Wellness",
  "Culinary & Gastronomy",
  "Public Administration & Policy",
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
