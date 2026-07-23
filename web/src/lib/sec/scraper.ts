import { getCompanyByTicker } from "./cik-lookup";
import { delay, fetchFilingDocument, fetchSubmissions } from "./client";
import { parseForm4Document } from "./form4-parser";
import { insertTrades } from "../queries";
import type { ParsedTrade } from "../types";

const MAX_FILINGS = 15;

export async function scrapeTicker(ticker: string): Promise<{
  ticker: string;
  tradesLoaded: number;
  filingsProcessed: number;
}> {
  const company = await getCompanyByTicker(ticker);
  if (!company || !company.cik) {
    throw new Error(`Unknown or invalid CIK for ticker: ${ticker}`);
  }

  const submissions = await fetchSubmissions(company.cik);
  const recent = submissions.filings.recent;

  const parsedTrades: ParsedTrade[] = [];
  let filingsProcessed = 0;

  for (let index = 0; index < recent.form.length; index += 1) {
    if (recent.form[index] !== "4") continue;

    const filingDate = recent.filingDate[index];
    const accessionNumber = recent.accessionNumber[index];

    const docText = await fetchFilingDocument(company.cik, accessionNumber);
    const trades = parseForm4Document(docText, filingDate);
    parsedTrades.push(...trades);

    filingsProcessed += 1;
    await delay(100);

    if (filingsProcessed >= MAX_FILINGS) break;
  }

  const tradesLoaded = await insertTrades(ticker.toUpperCase(), parsedTrades);

  return {
    ticker: ticker.toUpperCase(),
    tradesLoaded,
    filingsProcessed,
  };
}
