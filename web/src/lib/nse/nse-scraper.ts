import { fetchNseInsiderTrades } from "./nse-client";
import { getNseCompanyBySymbol } from "./nse-lookup";
import { getDb } from "../db";
import { insertTrades } from "../queries";
import type { ParsedTrade } from "../types";

export async function scrapeNseSymbol(symbol: string): Promise<{
  ticker: string;
  tradesLoaded: number;
  filingsProcessed: number;
}> {
  const cleanSymbol = symbol.trim().toUpperCase();
  await getNseCompanyBySymbol(cleanSymbol);

  const rawRecords = await fetchNseInsiderTrades(cleanSymbol);
  const parsedTrades: ParsedTrade[] = [];

  for (const record of rawRecords) {
    const actStr = record.action.toLowerCase();
    const isSell = actStr.includes("sale") || actStr.includes("sell") || actStr.includes("disposal");

    const tradeType = isSell ? "SELL" : "BUY";
    const sharesTraded = record.secAcq || 0;
    const totalTransactionValue = record.secVal || record.tdpVal || 0;
    const pricePerShare = sharesTraded > 0 ? Number((totalTransactionValue / sharesTraded).toFixed(2)) : 0;

    // Format filing date cleanly to YYYY-MM-DD
    let formattedDate = record.date;
    try {
      if (dateStrNeedsFormat(record.date)) {
        const d = new Date(record.date);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split("T")[0];
        }
      }
    } catch {
      formattedDate = record.date;
    }

    parsedTrades.push({
      insiderName: record.acquirerName || "Unattributed",
      executiveRole: record.personCategory || "Designated Person",
      tradeType,
      sharesTraded,
      pricePerShare,
      totalTransactionValue,
      filingDate: formattedDate,
      market: "IN",
      currency: "INR",
      sourceUrl: record.xbrl || null,
    });
  }

  // Clear existing rows for this Indian ticker before inserting fresh real records
  const sql = getDb();
  await sql`DELETE FROM insider_trades WHERE ticker = ${cleanSymbol}`;

  // Insert ONLY what the live call returned. If rawRecords is empty, zero rows are inserted!
  const tradesLoaded = await insertTrades(cleanSymbol, parsedTrades, "IN", "INR");

  return {
    ticker: cleanSymbol,
    tradesLoaded,
    filingsProcessed: rawRecords.length,
  };
}

function dateStrNeedsFormat(str: string): boolean {
  if (!str) return false;
  return str.includes("-") && (str.length > 10 || /[a-zA-Z]/.test(str));
}
