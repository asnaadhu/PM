import fs from "fs";
import path from "path";

export interface StoredInquiry {
  id: string;
  portfolioSlug: string;
  senderName: string;
  senderEmail: string;
  senderCompany?: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface StoreFile {
  version: 1;
  portfolios: Record<string, any>;
  inquiries: StoredInquiry[];
}

const MAX_INQUIRIES = 5000;

/**
 * JSON-file backed store. Data lives in memory for fast reads and is flushed to
 * disk (atomically, debounced) after every change, so it survives restarts.
 */
export function createStore(dataDir: string) {
  const file = path.join(dataDir, "store.json");
  const portfolios = new Map<string, any>();
  const inquiries: StoredInquiry[] = [];

  try {
    if (fs.existsSync(file)) {
      const parsed: StoreFile = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const [slug, profile] of Object.entries(parsed.portfolios || {})) {
        portfolios.set(slug, profile);
      }
      inquiries.push(...(parsed.inquiries || []));
      console.log(`[store] Loaded ${portfolios.size} portfolios and ${inquiries.length} inquiries from ${file}`);
    }
  } catch (err) {
    console.error(`[store] Could not read ${file}; starting empty.`, err);
  }

  let timer: NodeJS.Timeout | null = null;

  function flush() {
    timer = null;
    const data: StoreFile = {
      version: 1,
      portfolios: Object.fromEntries(portfolios),
      inquiries,
    };
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      const tmp = `${file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data));
      fs.renameSync(tmp, file);
    } catch (err) {
      console.error("[store] Failed to persist data:", err);
    }
  }

  function scheduleFlush() {
    if (!timer) timer = setTimeout(flush, 250);
  }

  const flushNow = () => {
    if (timer) {
      clearTimeout(timer);
      flush();
    }
  };
  process.once("SIGINT", () => {
    flushNow();
    process.exit(0);
  });
  process.once("SIGTERM", () => {
    flushNow();
    process.exit(0);
  });

  return {
    portfolios: portfolios as ReadonlyMap<string, any>,
    inquiries: inquiries as readonly StoredInquiry[],
    savePortfolio(slug: string, profile: any) {
      portfolios.set(slug, profile);
      scheduleFlush();
    },
    deletePortfolio(slug: string): boolean {
      const existed = portfolios.delete(slug);
      if (existed) scheduleFlush();
      return existed;
    },
    addInquiry(inquiry: StoredInquiry) {
      inquiries.push(inquiry);
      if (inquiries.length > MAX_INQUIRIES) inquiries.splice(0, inquiries.length - MAX_INQUIRIES);
      scheduleFlush();
    },
    flushNow,
  };
}
