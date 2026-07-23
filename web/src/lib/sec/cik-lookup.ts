import { fetchCompanyTickers } from "./client";
import type { CompanyOption } from "../types";

let cache: Map<string, CompanyOption> | null = null;
let tickerList: CompanyOption[] | null = null;

export async function loadCompanyDirectory(): Promise<Map<string, CompanyOption>> {
  if (cache) return cache;

  const data = await fetchCompanyTickers();
  cache = new Map();

  for (const company of Object.values(data)) {
    const ticker = company.ticker.toUpperCase();
    cache.set(ticker, {
      ticker,
      name: company.title,
      cik: String(company.cik_str).padStart(10, "0"),
      market: "US",
    });
  }

  return cache;
}

export async function getCompanyByTicker(
  ticker: string
): Promise<CompanyOption | null> {
  const directory = await loadCompanyDirectory();
  return directory.get(ticker.toUpperCase()) ?? null;
}

export async function searchCompanies(query: string, limit = 12): Promise<CompanyOption[]> {
  const directory = await loadCompanyDirectory();

  if (!tickerList) {
    tickerList = Array.from(directory.values()).sort((a, b) =>
      a.ticker.localeCompare(b.ticker)
    );
  }

  const q = query.trim().toUpperCase();
  if (!q) {
    return tickerList.slice(0, limit);
  }

  return tickerList
    .filter(
      (company) =>
        company.ticker.includes(q) ||
        company.name.toUpperCase().includes(q)
    )
    .slice(0, limit);
}
