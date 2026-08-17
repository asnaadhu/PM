import { UserProfile } from "../types";

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: "mv-prof-01",
    slug: "ahmed-rameez",
    role: "user",
    fullName: "Ahmed 'Rameez' Riyaz",
    title: "Executive Head Chef & Island Gastronomy Consultant",
    headline: "Pioneering Sustainable Maldivian Haute Cuisine across World-Class 5-Star Ultra-Luxury Resorts",
    bio: "Over 14 years orchestrating Michelin-grade dining experiences and sustainable seafood menus across premier Maldivian island resorts including Soneva, Cheval Blanc Randheli, and Waldorf Astoria Ithaafushi. Passionate champion of Zero-Food-Waste luxury gastronomy, local tuna sourcing directly from Maldivian artisanal pole-and-line fishermen, and mentoring the next generation of young Maldivian culinary leaders.",
    avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    industry: "Culinary & Gastronomy",
    atoll: "Kaafu Atoll (Malé / North & South Malé)",
    island: "Hulhumalé Phase 2",
    email: "chef.rameez@portfoliomaldives.mv",
    phone: "+960 791-4422",
    whatsapp: "+9607914422",
    linkedin: "linkedin.com/in/ahmed-rameez-chef",
    website: "https://rameezislandculinary.mv",
    availableFor: ["Resort Projects", "Consulting / Freelance", "Speaking / Workshops"],
    yearsOfExperience: 14,
    theme: "saddle-heritage",
    isPublished: true,
    publishedAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-08-10T14:30:00Z",
    viewsCount: 1420,
    verified: true,
    experiences: [
      {
        id: "exp-01",
        role: "Director of Culinary & Beverage Concepts",
        company: "Velaa Private Island & Maldives Luxury Collection",
        location: "Noonu Atoll, Maldives",
        startDate: "2022-03",
        isCurrent: true,
        description: "Directing overarching culinary operations across 4 signature overwater restaurants and private yacht dining experiences.",
        achievements: [
          "Curated a groundbreaking 9-course Maldivian Heritage Tasting Menu awarded 'Best Indian Ocean Gastronomy 2024'.",
          "Reduced resort food import costs by 18% through partnerships with local hydroponic farms in Baa and Raa atolls.",
          "Led a brigade of 45 international and Maldivian chefs with a 96% staff retention rate."
        ],
        skills: ["Fine Dining Management", "Sustainable Sourcing", "Menu R&D", "Cost Optimization"]
      },
      {
        id: "exp-02",
        role: "Executive Sous Chef",
        company: "Soneva Fushi Resort & Residences",
        location: "Baa Atoll (UNESCO Biosphere)",
        startDate: "2018-06",
        endDate: "2022-02",
        isCurrent: false,
        description: "Spearheaded zero-waste open-fire grill and organic garden-to-table dining venue.",
        achievements: [
          "Introduced cold-smoking techniques using coconut husks and local Dhivehi wood spices.",
          "Hosted visiting 3-Michelin-star guest chefs during annual Soneva Stars gastronomy series."
        ],
        skills: ["Organic Cuisine", "Open-Fire Grilling", "Guest Engagement"]
      }
    ],
    education: [
      {
        id: "edu-01",
        degree: "Diploma in Professional Culinary Arts & Hospitality Management",
        institution: "Le Cordon Bleu Culinary Institute",
        location: "Bangkok & Sydney",
        startYear: "2010",
        endYear: "2013",
        fieldOfStudy: "Classical French Gastronomy & Contemporary Asian Fusion",
        honors: "Grand Diplôme with Distinction"
      }
    ],
    certifications: [
      {
        id: "cert-01",
        name: "ServSafe Food Safety Manager & HACCP Lead Auditor",
        issuer: "National Restaurant Association USA",
        issueDate: "2023-04"
      },
      {
        id: "cert-02",
        name: "WSET Level 3 Award in Wines & Spirits",
        issuer: "Wine & Spirit Education Trust",
        issueDate: "2021-11"
      }
    ],
    skills: [
      { id: "sk-01", name: "High-End Island Gastronomy", category: "Industry Specialist", proficiency: "Expert" },
      { id: "sk-02", name: "Culinary Concept Development", category: "Management & Leadership", proficiency: "Expert" },
      { id: "sk-03", name: "HACCP & 5-Star Kitchen Operations", category: "Technical", proficiency: "Expert" },
      { id: "sk-04", name: "Marine Sourcing & Pole-and-Line Tuna", category: "Industry Specialist", proficiency: "Expert" },
      { id: "sk-05", name: "Sommelier Wine Pairing", category: "Technical", proficiency: "Advanced" }
    ],
    projects: [
      {
        id: "proj-01",
        title: "Maldivian Modern Heritage Feast",
        clientOrOrg: "Luxury Atoll Pop-Up Experience",
        role: "Head Creator & Curator",
        year: "2024",
        description: "Re-imagining traditional Dhivehi dishes (Garudhiya reductions, Rihaakuru glazes, and Masroshi delicacies) through modern culinary alchemy.",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        tags: ["Maldivian Cuisine", "Haute Gastronomy", "Sustainability"],
        metrics: "Featured in Condé Nast Traveler & Maldives Travel Awards 2024"
      },
      {
        id: "proj-02",
        title: "Island Hydroponics Farm-to-Table Hub",
        clientOrOrg: "Noonu Sustainability Initiative",
        role: "Consultant",
        year: "2023",
        description: "Co-developed an on-island greenhouse producing 12 varieties of microgreens and heritage island herbs without soil.",
        imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80",
        tags: ["Hydroponics", "Eco Luxury", "Local Sourcing"]
      }
    ],
    languages: [
      { id: "lang-01", language: "Dhivehi", fluency: "Native / Mother Tongue" },
      { id: "lang-02", language: "English", fluency: "Fluent / Bilingual" },
      { id: "lang-03", language: "French", fluency: "Professional Working" }
    ],
    awards: [
      { id: "aw-01", title: "Maldives Master Chef of the Year", issuer: "Maldives Culinary Guild & Hotel Asia", year: "2023" }
    ]
  },
  {
    id: "mv-prof-02",
    slug: "aishath-shifa",
    fullName: "Dr. Aishath Shifa",
    title: "Senior Marine Ecologist & Coral Restoration Specialist",
    headline: "Protecting Maldivian Reef Ecosystems & Leading UNESCO Biosphere Marine Research",
    bio: "Marine scientist with a PhD in Tropical Marine Ecology and 11 years leading coral restoration micro-fragmentation, manta ray population tracking, and marine protected area (MPA) management across Baa and South Ari atolls. Collaborating with international research institutions, luxury eco-resorts, and local island councils to future-proof Maldivian coral reefs against climate change.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    industry: "Marine Science & Diving",
    atoll: "Baa Atoll (UNESCO Biosphere Reserve)",
    island: "Dharavandhoo",
    email: "dr.shifa@oceanmaldives.org",
    phone: "+960 774-8899",
    whatsapp: "+9607748899",
    linkedin: "linkedin.com/in/aishath-shifa-marine",
    website: "https://shifareefresilience.mv",
    availableFor: ["Consulting / Freelance", "Board Advisory", "Speaking / Workshops", "Resort Projects"],
    yearsOfExperience: 11,
    theme: "kanditheemu-editorial",
    isPublished: true,
    publishedAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-08-12T16:00:00Z",
    viewsCount: 2310,
    verified: true,
    experiences: [
      {
        id: "exp-03",
        role: "Lead Marine Biologist & Research Director",
        company: "Baa Atoll UNESCO Marine Research Station",
        location: "Baa Atoll, Maldives",
        startDate: "2020-01",
        isCurrent: true,
        description: "Directing 3-dimensional coral propagation nursery and Hanifaru Bay manta ray identification monitoring.",
        achievements: [
          "Successfully outplanted over 12,000 heat-resilient coral fragments with an 84% 2-year survival rate.",
          "Published 6 peer-reviewed papers in Coral Reefs and Frontiers in Marine Science on Indian Ocean bleaching resistance.",
          "Trained 180+ resort dive guides and local island school students in reef stewardship."
        ],
        skills: ["Coral Micro-fragmentation", "Underwater Photogrammetry", "GIS Mapping", "MPA Governance"]
      }
    ],
    education: [
      {
        id: "edu-02",
        degree: "Ph.D. in Marine Biology & Coastal Ecosystems",
        institution: "James Cook University",
        location: "Townsville, Australia",
        startYear: "2015",
        endYear: "2019",
        fieldOfStudy: "Thermal Tolerance Mechanisms in Acropora Corals"
      },
      {
        id: "edu-03",
        degree: "B.Sc. (Hons) in Marine Sciences",
        institution: "The Maldives National University (MNU)",
        location: "Malé, Maldives",
        startYear: "2011",
        endYear: "2014",
        fieldOfStudy: "Oceanography & Marine Biodiversity"
      }
    ],
    certifications: [
      {
        id: "cert-03",
        name: "PADI Master Scuba Diver Trainer (MSDT) #384920",
        issuer: "PADI Worldwide",
        issueDate: "2016-08"
      },
      {
        id: "cert-04",
        name: "Scientific Diver & Hyperbaric Safety Specialist",
        issuer: "American Academy of Underwater Sciences (AAUS)",
        issueDate: "2018-05"
      }
    ],
    skills: [
      { id: "sk-06", name: "Coral Reef Micro-fragmentation", category: "Technical", proficiency: "Expert" },
      { id: "sk-07", name: "Manta & Whale Shark Bio-telemetry", category: "Technical", proficiency: "Expert" },
      { id: "sk-08", name: "Environmental Impact Assessment (EIA)", category: "Industry Specialist", proficiency: "Expert" },
      { id: "sk-09", name: "Scientific Scientific Diving (Trimix/Nitrox)", category: "Technical", proficiency: "Expert" },
      { id: "sk-10", name: "Policy & Blue Carbon Advocacy", category: "Management & Leadership", proficiency: "Advanced" }
    ],
    projects: [
      {
        id: "proj-03",
        title: "Project Coral Shield Maldives",
        clientOrOrg: "Ministry of Climate Change & Global Coral Fund",
        role: "Principal Investigator",
        year: "2023 - 2025",
        description: "Deploying 3D-printed ceramic substrate reef frames equipped with IoT water quality probes across 5 atolls.",
        imageUrl: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80",
        tags: ["Marine IoT", "Coral Restoration", "Climate Resilience"],
        metrics: "Over 45,000 sq. meters of degraded reef revitalized"
      }
    ],
    languages: [
      { id: "lang-04", language: "Dhivehi", fluency: "Native / Mother Tongue" },
      { id: "lang-05", language: "English", fluency: "Fluent / Bilingual" },
      { id: "lang-06", language: "German", fluency: "Conversational" }
    ],
    awards: [
      { id: "aw-02", title: "National Award of Recognition in Marine Conservation", issuer: "President of the Republic of Maldives", year: "2024" }
    ]
  },
  {
    id: "mv-prof-03",
    slug: "ibrahim-nabeeh",
    fullName: "Ibrahim Nabeeh",
    title: "Principal Cloud Solutions Architect & Fintech Engineering Lead",
    headline: "Architecting Resilient Digital Infrastructure, Instant Payment Gateways & Microservices in the Maldives",
    bio: "Senior software architect with 10+ years building national-scale banking integrations, resort booking engines, and cloud distributed systems. Led digital transformation initiatives enabling frictionless mobile banking and digital identity infrastructure across the Maldivian archipelago. Avid mentor in the Maldivian developer community.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    industry: "Technology & Software",
    atoll: "Kaafu Atoll (Malé / North & South Malé)",
    island: "Malé City",
    email: "nabeeh.dev@portfoliomaldives.mv",
    phone: "+960 762-3311",
    whatsapp: "+9607623311",
    linkedin: "linkedin.com/in/ibrahim-nabeeh-tech",
    github: "github.com/nabeeh-maldives",
    website: "https://nabeeh.cloud",
    availableFor: ["Full-time", "Consulting / Freelance", "Board Advisory"],
    yearsOfExperience: 10,
    theme: "oceanic-dark",
    isPublished: true,
    publishedAt: "2026-01-20T11:00:00Z",
    updatedAt: "2026-08-14T08:00:00Z",
    viewsCount: 3890,
    verified: true,
    experiences: [
      {
        id: "exp-04",
        role: "Head of Cloud & Core Banking Architecture",
        company: "Maldives Digital Finance Labs",
        location: "Malé City, Maldives",
        startDate: "2021-08",
        isCurrent: true,
        description: "Leading an engineering department of 24 software and DevOps engineers delivering high-throughput financial transactions.",
        achievements: [
          "Architected real-time settlement engine processing 400,000+ daily transactions with 99.999% uptime.",
          "Migrated legacy monolithic systems to Kubernetes microservices, cutting server latency by 65%.",
          "Engineered multi-region disaster recovery strategy across Singapore and Bahrain AWS cloud clusters."
        ],
        skills: ["Kubernetes", "AWS Cloud Architecture", "Go", "PostgreSQL", "Kafka"]
      },
      {
        id: "exp-05",
        role: "Senior Full-Stack Engineer & Team Lead",
        company: "Atoll Tech Solutions",
        location: "Hulhumalé, Maldives",
        startDate: "2017-02",
        endDate: "2021-07",
        isCurrent: false,
        description: "Engineered island resort channel managers, speed boat logistics tracking, and B2B hospitality booking engines.",
        achievements: [
          "Built high-concurrency booking API serving 30+ luxury Maldives resorts."
        ],
        skills: ["TypeScript", "Node.js", "React", "Docker", "Redis"]
      }
    ],
    education: [
      {
        id: "edu-04",
        degree: "B.Sc. in Computer Science & Distributed Systems",
        institution: "University of Nottingham",
        location: "Malaysia Campus",
        startYear: "2013",
        endYear: "2016",
        fieldOfStudy: "Cloud Computing, Distributed Algorithms & Cryptography",
        honors: "First Class Honours"
      }
    ],
    certifications: [
      {
        id: "cert-05",
        name: "AWS Certified Solutions Architect - Professional (SAP-C02)",
        issuer: "Amazon Web Services",
        issueDate: "2023-01",
        credentialId: "AWS-PSA-94812"
      },
      {
        id: "cert-06",
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation (CNCF)",
        issueDate: "2022-09"
      }
    ],
    skills: [
      { id: "sk-11", name: "Distributed Systems & Microservices", category: "Technical", proficiency: "Expert" },
      { id: "sk-12", name: "AWS Cloud & DevOps (Terraform, CI/CD)", category: "Technical", proficiency: "Expert" },
      { id: "sk-13", name: "TypeScript, Go & Python", category: "Technical", proficiency: "Expert" },
      { id: "sk-14", name: "PCI-DSS Fintech Security Compliance", category: "Technical", proficiency: "Advanced" },
      { id: "sk-15", name: "Technical Team Mentorship", category: "Management & Leadership", proficiency: "Expert" }
    ],
    projects: [
      {
        id: "proj-04",
        title: "Dhivehi OCR & Document Intelligence",
        clientOrOrg: "Open Source Maldives",
        role: "Creator & Maintainer",
        year: "2024",
        description: "Open-source deep learning model for Thaana script optical character recognition and automated document parsing.",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
        tags: ["Thaana AI", "Computer Vision", "Open Source"],
        metrics: "Over 1,200 GitHub stars and adopted by 8 local legal firms"
      }
    ],
    languages: [
      { id: "lang-07", language: "Dhivehi", fluency: "Native / Mother Tongue" },
      { id: "lang-08", language: "English", fluency: "Fluent / Bilingual" }
    ],
    awards: [
      { id: "aw-03", title: "Maldives Tech Innovator of the Year", issuer: "Maldives IT Association (MITA)", year: "2023" }
    ]
  },
  {
    id: "mv-prof-04",
    slug: "mariyam-zeen",
    fullName: "Mariyam Zeen",
    title: "Luxury Resort & Biophilic Interior Architect",
    headline: "Crafting Timeless Maldivian Architectural Identities with Sustainable Local Materials & Island Light",
    bio: "Award-winning interior architect with 9 years designing signature private island villas, underwater restaurants, and wellness sanctuaries across the Maldives and Southeast Asia. Specializing in tropical modernist architecture, passive cooling design, and weaving traditional Maldivian lacquerware (Liyelaa Jehun) patterns into ultra-luxury contemporary spaces.",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    industry: "Architecture & Engineering",
    atoll: "Kaafu Atoll (Malé / North & South Malé)",
    island: "Malé City",
    email: "zeen@studiodhivehi.design",
    phone: "+960 798-2200",
    whatsapp: "+9607982200",
    linkedin: "linkedin.com/in/mariyam-zeen-architect",
    behance: "behance.net/mariyamzeen",
    website: "https://zeenarchitects.mv",
    availableFor: ["Resort Projects", "Consulting / Freelance", "Board Advisory"],
    yearsOfExperience: 9,
    theme: "emerald-atoll",
    isPublished: true,
    publishedAt: "2026-02-10T09:00:00Z",
    updatedAt: "2026-08-15T12:00:00Z",
    viewsCount: 1850,
    verified: true,
    experiences: [
      {
        id: "exp-06",
        role: "Principal Design Director",
        company: "Studio Dhivehi Tropical Architecture",
        location: "Malé & Singapore",
        startDate: "2021-03",
        isCurrent: true,
        description: "Lead architect for luxury private villas, overwater pavilions, and eco-wellness spas in the Maldives.",
        achievements: [
          "Completed architectural master plan for a 60-key carbon-neutral ultra-luxury private island in Raa Atoll.",
          "Pioneered timber passive airflow systems reducing air conditioning power demand by 32%.",
          "Winner of Indian Ocean Resort Design of the Year 2024."
        ],
        skills: ["Biophilic Design", "Resort Master Planning", "Revit & Rhino", "Sustainable Materials"]
      }
    ],
    education: [
      {
        id: "edu-05",
        degree: "Master of Architecture (M.Arch)",
        institution: "National University of Singapore (NUS)",
        location: "Singapore",
        startYear: "2015",
        endYear: "2017",
        fieldOfStudy: "Tropical Architecture & Environmental Design"
      }
    ],
    certifications: [
      {
        id: "cert-07",
        name: "LEED Accredited Professional (LEED AP BD+C)",
        issuer: "U.S. Green Building Council",
        issueDate: "2020-04"
      },
      {
        id: "cert-08",
        name: "Registered Architect #MVA-084",
        issuer: "Ministry of National Planning & Infrastructure Maldives",
        issueDate: "2018-01"
      }
    ],
    skills: [
      { id: "sk-16", name: "Luxury Overwater Villa Architecture", category: "Technical", proficiency: "Expert" },
      { id: "sk-17", name: "Passive Cooling & Tropical Microclimates", category: "Technical", proficiency: "Expert" },
      { id: "sk-18", name: "Maldivian Heritage Craft Integration", category: "Industry Specialist", proficiency: "Expert" },
      { id: "sk-19", name: "AutoCAD, Rhino 3D, V-Ray, Enscape", category: "Tools & Software", proficiency: "Expert" }
    ],
    projects: [
      {
        id: "proj-05",
        title: "The Coral Overwater Wellness Sanctuary",
        clientOrOrg: "South Ari Luxury Lagoon Resort",
        role: "Lead Architect",
        year: "2024",
        description: "Floating timber spa pavilions inspired by traditional Maldivian Dhoni hull curves, illuminated by natural bioluminescent lighting schemes.",
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
        tags: ["Dhoni Architecture", "Resort Spa", "Biophilic"],
        metrics: "Nominated for World Architecture Festival (WAF) 2024"
      }
    ],
    languages: [
      { id: "lang-09", language: "Dhivehi", fluency: "Native / Mother Tongue" },
      { id: "lang-10", language: "English", fluency: "Fluent / Bilingual" }
    ],
    awards: [
      { id: "aw-04", title: "Indian Ocean Sustainable Architect Award", issuer: "Asia Pacific Property Awards", year: "2024" }
    ]
  },
  {
    id: "mv-prof-05",
    slug: "hassan-fayaz",
    fullName: "Captain Hassan Fayaz",
    title: "Chief Aviation Captain & Maritime Seaplane Operations Specialist",
    headline: "Over 8,500 Flight Hours Commanding DHC-6 Twin Otter Seaplanes Across the 26 Atolls of Maldives",
    bio: "Senior Twin Otter Seaplane Captain and Flight Operations Director with 16 years of pristine flight safety records across every atoll lagoon in the Maldives. Expert in maritime weather forecasting, low-altitude oceanic navigation, seaplane base infrastructure design, and airline pilot training.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1508873696983-2df5703bc225?auto=format&fit=crop&w=1200&q=80",
    industry: "Aviation & Logistics",
    atoll: "Addu City (Seenu Atoll)",
    island: "Hithadhoo",
    email: "capt.fayaz@aviationmaldives.mv",
    phone: "+960 779-1155",
    whatsapp: "+9607791155",
    linkedin: "linkedin.com/in/capt-hassan-fayaz",
    availableFor: ["Full-time", "Consulting / Freelance", "Board Advisory", "Speaking / Workshops"],
    yearsOfExperience: 16,
    theme: "executive-navy",
    isPublished: true,
    publishedAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-08-11T10:00:00Z",
    viewsCount: 2940,
    verified: true,
    experiences: [
      {
        id: "exp-07",
        role: "Senior Line Captain & Fleet Safety Inspector",
        company: "Trans Maldivian Airways (TMA)",
        location: "Velana International Airport & Atolls, Maldives",
        startDate: "2015-04",
        isCurrent: true,
        description: "Commanding twin-engine turboprop floatplanes transporting luxury resort guests, VIP delegates, and medical evacuations across the country.",
        achievements: [
          "Logged 8,500+ safe flight hours with zero incident record.",
          "Designed emergency lagoon water-landing protocols adopted across fleet of 65 aircraft.",
          "Trained and certified 35 newly rated Maldivian co-pilots."
        ],
        skills: ["DHC-6 Twin Otter Floatplane", "Lagoon Water Operations", "Crew Resource Management (CRM)", "ICAO Regulations"]
      }
    ],
    education: [
      {
        id: "edu-06",
        degree: "Airline Transport Pilot Licence (ATPL)",
        institution: "Civil Aviation Authority of New Zealand",
        location: "Christchurch, NZ",
        startYear: "2008",
        endYear: "2010",
        fieldOfStudy: "Multi-Engine Instrument Rating & Floatplane Endorsement"
      }
    ],
    certifications: [
      {
        id: "cert-09",
        name: "Maldives CAA ATPL #ATPL-M-0284",
        issuer: "Maldives Civil Aviation Authority",
        issueDate: "2010-12"
      },
      {
        id: "cert-10",
        name: "Type Rating Instructor (TRI) - DHC-6 Twin Otter",
        issuer: "Viking Air & FlightSafety International",
        issueDate: "2018-09"
      }
    ],
    skills: [
      { id: "sk-20", name: "DHC-6 Seaplane Float Operation", category: "Technical", proficiency: "Expert" },
      { id: "sk-21", name: "Tropical Monsoon Weather Navigation", category: "Industry Specialist", proficiency: "Expert" },
      { id: "sk-22", name: "Flight Safety & Emergency Response", category: "Management & Leadership", proficiency: "Expert" },
      { id: "sk-23", name: "Aviation Logistics & Fuel Supply Chain", category: "Technical", proficiency: "Advanced" }
    ],
    projects: [
      {
        id: "proj-06",
        title: "Southern Atolls Medical Seaplane Network",
        clientOrOrg: "National Disaster Management & Addu Regional Health",
        role: "Advisory Aviation Specialist",
        year: "2023",
        description: "Establishing rapid night-emergency and rough-sea medical transfer routes connecting southern islands to regional tertiary hospitals.",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
        tags: ["Medevac", "Aviation Logistics", "Island Connectivity"]
      }
    ],
    languages: [
      { id: "lang-11", language: "Dhivehi", fluency: "Native / Mother Tongue" },
      { id: "lang-12", language: "English", fluency: "Fluent / Bilingual" }
    ],
    awards: [
      { id: "aw-05", title: "Aviation Excellence & Safety Medal", issuer: "Maldives Civil Aviation Authority", year: "2023" }
    ]
  }
];
