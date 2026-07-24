import type { CompanyOption } from "../types";
import { getScrapedNseCompanies, getTradesByTicker } from "../queries";

// Static fallback ticker -> name map (used ONLY as a display fallback if company_name is missing, NEVER for filtering search)
export const NSE_NAME_FALLBACKS: Record<string, string> = {
  RELIANCE: "Reliance Industries Ltd",
  TCS: "Tata Consultancy Services Ltd",
  HDFCBANK: "HDFC Bank Ltd",
  BHARTIARTL: "Bharti Airtel Ltd",
  ICICIBANK: "ICICI Bank Ltd",
  INFY: "Infosys Ltd",
  SBIN: "State Bank of India",
  LICI: "Life Insurance Corporation of India",
  ITC: "ITC Ltd",
  HINDUNILVR: "Hindustan Unilever Ltd",
  LT: "Larsen & Toubro Ltd",
  HCLTECH: "HCL Technologies Ltd",
  SUNPHARMA: "Sun Pharmaceutical Industries Ltd",
  ONGC: "Oil & Natural Gas Corporation Ltd",
  TATAMOTORS: "Tata Motors Ltd",
  NTPC: "NTPC Ltd",
  KOTAKBANK: "Kotak Mahindra Bank Ltd",
  AXISBANK: "Axis Bank Ltd",
  TITAN: "Titan Company Ltd",
  MARUTI: "Maruti Suzuki India Ltd",
  ADANIENT: "Adani Enterprises Ltd",
  ADANIPORTS: "Adani Ports & Special Economic Zone Ltd",
  BAJFINANCE: "Bajaj Finance Ltd",
  WIPRO: "Wipro Ltd",
  HAL: "Hindustan Aeronautics Ltd",
  BEL: "Bharat Electronics Ltd",
  ZOMATO: "Zomato Ltd",
  IOC: "Indian Oil Corporation Ltd",
};

/**
 * Searches real Indian companies with recorded disclosures in Neon Postgres.
 * Only companies with at least 1 scraped disclosure will be returned.
 */
export async function searchNseCompanies(query: string, limit = 20): Promise<CompanyOption[]> {
  return await getScrapedNseCompanies(query, limit);
}

/**
 * Looks up an Indian company by symbol from the database or fallback map.
 */
export async function getNseCompanyBySymbol(symbol: string): Promise<CompanyOption | null> {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return null;

  try {
    const trades = await getTradesByTicker(sym);
    if (trades && trades.length > 0) {
      const companyName = trades[0].company_name || NSE_NAME_FALLBACKS[sym] || `${sym} (NSE India)`;
      return {
        ticker: sym,
        name: companyName,
        market: "IN",
      };
    }
  } catch (err) {
    console.warn(`Failed to fetch company metadata from DB for ${sym}:`, err);
  }

  const fallbackName = NSE_NAME_FALLBACKS[sym] || `${sym} (NSE / BSE India)`;
  return {
    ticker: sym,
    name: fallbackName,
    market: "IN",
  };
}

export async function isIndianTicker(symbol: string): Promise<boolean> {
  return true;
}
