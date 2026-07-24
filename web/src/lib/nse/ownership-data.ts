// ============================================================
// OWNERSHIP CLASSIFICATION DATA
// Sources:
//   - Department of Public Enterprises (DPE), Ministry of Finance, GoI
//     https://dpe.gov.in/maharatna-navratna-miniratna
//   - BSE PSU Portal (bsepsu.com) — listed CPSE register
//   - SEBI PIT Disclosures — promoter shareholding >50% GoI = Govt
// ============================================================

export type OwnershipType = "GOVERNMENT" | "PRIVATE";

export type PsuCategory =
  | "MAHARATNA"
  | "NAVRATNA"
  | "MINIRATNA_I"
  | "MINIRATNA_II"
  | "GOVT_BANK"
  | "DEFENCE_PSU"
  | "STATE_PSU"
  | "PRIVATE";

export interface OwnershipRecord {
  type: OwnershipType;
  category: PsuCategory;
  ministry?: string;
  ratnaLabel?: string;
}

export const OWNERSHIP_MAP: Record<string, OwnershipRecord> = {
  // ─── MAHARATNA CPSEs (DPE Official — 13 companies as of 2024) ───
  ONGC:      { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Petroleum & Natural Gas",               ratnaLabel: "Maharatna CPSE" },
  IOC:       { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Petroleum & Natural Gas",               ratnaLabel: "Maharatna CPSE" },
  COALINDIA: { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Coal",                                  ratnaLabel: "Maharatna CPSE" },
  NTPC:      { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Power",                                 ratnaLabel: "Maharatna CPSE" },
  POWERGRID: { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Power",                                 ratnaLabel: "Maharatna CPSE" },
  BHEL:      { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Heavy Industries",                      ratnaLabel: "Maharatna CPSE" },
  GAIL:      { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Petroleum & Natural Gas",               ratnaLabel: "Maharatna CPSE" },
  SAIL:      { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Steel",                                 ratnaLabel: "Maharatna CPSE" },
  HAL:       { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Defence",                               ratnaLabel: "Maharatna CPSE" },
  LICI:      { type: "GOVERNMENT", category: "MAHARATNA",   ministry: "Ministry of Finance",                               ratnaLabel: "Maharatna CPSE" },
  // ─── NAVRATNA CPSEs ───
  BEL:       { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Defence",                               ratnaLabel: "Navratna CPSE" },
  BPCL:      { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Petroleum & Natural Gas",               ratnaLabel: "Navratna CPSE" },
  HPCL:      { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Petroleum & Natural Gas",               ratnaLabel: "Navratna CPSE" },
  HINDPETRO: { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Petroleum & Natural Gas",               ratnaLabel: "Navratna CPSE" },
  NMDC:      { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Steel",                                 ratnaLabel: "Navratna CPSE" },
  NHPC:      { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Power",                                 ratnaLabel: "Navratna CPSE" },
  SJVN:      { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Power",                                 ratnaLabel: "Navratna CPSE" },
  OIL:       { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Petroleum & Natural Gas",               ratnaLabel: "Navratna CPSE" },
  REC:       { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Power",                                 ratnaLabel: "Navratna CPSE" },
  RECLTD:    { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Power",                                 ratnaLabel: "Navratna CPSE" },
  PFC:       { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Power",                                 ratnaLabel: "Navratna CPSE" },
  PETRONET:  { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Petroleum & Natural Gas",               ratnaLabel: "Navratna CPSE" },
  NLCINDIA:  { type: "GOVERNMENT", category: "NAVRATNA",    ministry: "Ministry of Coal",                                  ratnaLabel: "Navratna CPSE" },
  // ─── MINIRATNA I CPSEs ───
  IRCTC:     { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Railways",                              ratnaLabel: "Miniratna I CPSE" },
  IRFC:      { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Railways",                              ratnaLabel: "Miniratna I CPSE" },
  IREDA:     { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of New & Renewable Energy",               ratnaLabel: "Miniratna I CPSE" },
  MAZAGON:   { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Defence",                               ratnaLabel: "Miniratna I CPSE" },
  GRSE:      { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Defence",                               ratnaLabel: "Miniratna I CPSE" },
  COCHINSHIP:{ type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Ports, Shipping & Waterways",          ratnaLabel: "Miniratna I CPSE" },
  BDL:       { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Defence",                               ratnaLabel: "Miniratna I CPSE" },
  RITES:     { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Railways",                              ratnaLabel: "Miniratna I CPSE" },
  IRCON:     { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Railways",                              ratnaLabel: "Miniratna I CPSE" },
  NBCC:      { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Housing & Urban Affairs",               ratnaLabel: "Miniratna I CPSE" },
  BEML:      { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Defence",                               ratnaLabel: "Miniratna I CPSE" },
  MIDHANI:   { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Defence",                               ratnaLabel: "Miniratna I CPSE" },
  HUDCO:     { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Housing & Urban Affairs",               ratnaLabel: "Miniratna I CPSE" },
  MTNL:      { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Communications",                       ratnaLabel: "Miniratna I CPSE" },
  MOIL:      { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Steel",                                 ratnaLabel: "Miniratna I CPSE" },
  KIOCL:     { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Steel",                                 ratnaLabel: "Miniratna I CPSE" },
  NFL:       { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Chemicals & Fertilizers",              ratnaLabel: "Miniratna I CPSE" },
  FACT:      { type: "GOVERNMENT", category: "MINIRATNA_I", ministry: "Ministry of Chemicals & Fertilizers",              ratnaLabel: "Miniratna I CPSE" },
  // ─── MINIRATNA II CPSEs ───
  ITI:       { type: "GOVERNMENT", category: "MINIRATNA_II", ministry: "Ministry of Communications",                      ratnaLabel: "Miniratna II CPSE" },
  HMT:       { type: "GOVERNMENT", category: "MINIRATNA_II", ministry: "Ministry of Heavy Industries",                    ratnaLabel: "Miniratna II CPSE" },
  NIACL:     { type: "GOVERNMENT", category: "MINIRATNA_II", ministry: "Ministry of Finance",                             ratnaLabel: "Miniratna II CPSE" },
  GICRE:     { type: "GOVERNMENT", category: "MINIRATNA_II", ministry: "Ministry of Finance",                             ratnaLabel: "Miniratna II CPSE" },
  RCF:       { type: "GOVERNMENT", category: "MINIRATNA_I",  ministry: "Ministry of Chemicals & Fertilizers",              ratnaLabel: "Miniratna I CPSE" },
  NATIONALUM:{ type: "GOVERNMENT", category: "NAVRATNA",     ministry: "Ministry of Mines",                               ratnaLabel: "Navratna CPSE" },
  NALCO:     { type: "GOVERNMENT", category: "NAVRATNA",     ministry: "Ministry of Mines",                               ratnaLabel: "Navratna CPSE" },
  CONCOR:    { type: "GOVERNMENT", category: "NAVRATNA",     ministry: "Ministry of Railways",                              ratnaLabel: "Navratna CPSE" },

  // ─── PUBLIC SECTOR BANKS (Govt. >50% shareholding, RBI scheduled) ───
  SBIN:      { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  PNB:       { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  BANKBARODA:{ type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  UNIONBANK: { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  CANBK:     { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  INDIANB:   { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  IOB:       { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  UCOBANK:   { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  MAHABANK:  { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  BANKINDIA: { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  CENTRALBK: { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
  PSB:       { type: "GOVERNMENT", category: "GOVT_BANK",  ministry: "Ministry of Finance — Dept. of Financial Services", ratnaLabel: "Public Sector Bank" },
};

/** Returns the ownership record for a ticker. Falls back to PRIVATE if not in map. */
export function getOwnership(ticker: string): OwnershipRecord {
  const sym = ticker.trim().toUpperCase();
  return OWNERSHIP_MAP[sym] ?? { type: "PRIVATE", category: "PRIVATE" };
}

/** Returns true if the ticker is a Government / PSU entity */
export function isGovernmentOwned(ticker: string): boolean {
  return getOwnership(ticker).type === "GOVERNMENT";
}

/** Human-readable label for a PSU category */
export function psuCategoryLabel(category: PsuCategory): string {
  switch (category) {
    case "MAHARATNA":    return "Maharatna CPSE";
    case "NAVRATNA":     return "Navratna CPSE";
    case "MINIRATNA_I":  return "Miniratna I CPSE";
    case "MINIRATNA_II": return "Miniratna II CPSE";
    case "GOVT_BANK":    return "Public Sector Bank";
    case "DEFENCE_PSU":  return "Defence PSU";
    case "STATE_PSU":    return "State PSU";
    default:             return "Private";
  }
}

/** Badge color for each PSU category */
export function psuCategoryColor(category: PsuCategory): string {
  switch (category) {
    case "MAHARATNA":    return "#f59e0b"; // amber
    case "NAVRATNA":     return "#10b981"; // emerald
    case "MINIRATNA_I":  return "#6366f1"; // indigo
    case "MINIRATNA_II": return "#8b5cf6"; // violet
    case "GOVT_BANK":    return "#0ea5e9"; // sky blue
    case "DEFENCE_PSU":  return "#ef4444"; // red
    case "STATE_PSU":    return "#f97316"; // orange
    default:             return "#6b7280"; // gray
  }
}

/** All government tickers */
export const ALL_GOVT_TICKERS = Object.keys(OWNERSHIP_MAP);

/** Tickers grouped by DPE category */
export const GOVT_TICKERS_BY_CATEGORY: Record<string, string[]> = {
  MAHARATNA: [],
  NAVRATNA: [],
  MINIRATNA_I: [],
  MINIRATNA_II: [],
  GOVT_BANK: [],
};

for (const [ticker, rec] of Object.entries(OWNERSHIP_MAP)) {
  const cat = rec.category as string;
  if (GOVT_TICKERS_BY_CATEGORY[cat]) {
    GOVT_TICKERS_BY_CATEGORY[cat].push(ticker);
  }
}

/** Organized Private Sector Groups */
export const PRIVATE_TICKERS_BY_CATEGORY: Record<string, { label: string; color: string; tickers: string[] }> = {
  TECH: {
    label: "💻 Information Technology & Tech Giants",
    color: "#6366f1",
    tickers: ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM", "LTIM", "PERSISTENT", "COFORGE", "MPHASIS", "TATAELXSI", "KPITTECH"],
  },
  FINANCE: {
    label: "🏦 Private Banking & Financial Services",
    color: "#0ea5e9",
    tickers: ["HDFCBANK", "ICICIBANK", "KOTAKBANK", "AXISBANK", "BAJFINANCE", "BAJAJFINSV", "JIOFIN", "IDFCFIRSTB", "FEDERALBNK", "INDUSINDBK", "YESBANK", "BANDHANBNK", "AUBANK"],
  },
  NEW_AGE: {
    label: "🚀 New-Age & Consumer Internet",
    color: "#ec4899",
    tickers: ["ZOMATO", "PAYTM", "POLICYBZR", "NYKAA", "DELHIVERY", "SWIGGY"],
  },
  AUTO: {
    label: "🚗 Automotive & Industrials",
    color: "#f59e0b",
    tickers: ["TATAMOTORS", "MARUTI", "M&M", "HEROMOTOCO", "EICHERMOT", "TVSMOTOR", "BAJAJ-AUTO", "MOTHERSON", "BOSCHLTD", "TIINDIA"],
  },
  ENERGY_CONGLOMERATE: {
    label: "⚡ Conglomerates & Clean Energy",
    color: "#10b981",
    tickers: ["RELIANCE", "ADANIENT", "ADANIPORTS", "ADANIPOWER", "ADANIGREEN", "SUZLON"],
  },
  FMCG_RETAIL: {
    label: "🛍️ Consumer Goods, Retail & FMCG",
    color: "#8b5cf6",
    tickers: ["ITC", "HINDUNILVR", "TITAN", "VBL", "TRENT", "DMART", "NESTLEIND", "BRITANNIA", "DABUR", "MARICO", "GODREJCP", "COLPAL"],
  },
  PHARMA: {
    label: "💊 Healthcare & Pharmaceuticals",
    color: "#14b8a6",
    tickers: ["SUNPHARMA", "CIPLA", "DRREDDY", "APOLLOHOSP", "MAXHEALTH", "MANKIND", "LUPIN", "DIVISLAB", "TORNTPHARM", "ZYDUSLIFE"],
  },
  INFRA_MATERIALS: {
    label: "🏗️ Infrastructure, Metals & Materials",
    color: "#f97316",
    tickers: ["LT", "DLF", "TATASTEEL", "ULTRACEMCO", "ASIANPAINT", "VEDL", "JSWSTEEL", "JINDALSTEL", "HINDALCO", "SHREECEM", "AMBUJACEM", "ACC", "GODREJPROP", "OBEROIRLTY", "POLYCAB", "DIXON", "SIEMENS", "ABB"],
  },
};

/** All unique private sector tickers */
export const ALL_PRIVATE_TICKERS = Array.from(
  new Set(Object.values(PRIVATE_TICKERS_BY_CATEGORY).flatMap((g) => g.tickers))
);

/** All unique tracked tickers (Govt + Private) */
export const ALL_TRACKED_TICKERS = Array.from(
  new Set([...ALL_GOVT_TICKERS, ...ALL_PRIVATE_TICKERS])
);

/** Dynamic exact counts */
export const GOVT_COUNT = ALL_GOVT_TICKERS.length;
export const PRIVATE_COUNT = ALL_PRIVATE_TICKERS.length;
export const TOTAL_TRACKED_COUNT = ALL_TRACKED_TICKERS.length;


