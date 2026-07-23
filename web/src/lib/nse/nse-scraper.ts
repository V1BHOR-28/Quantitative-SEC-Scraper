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
    const isSell =
      record.action.toLowerCase().includes("sale") ||
      record.action.toLowerCase().includes("sell") ||
      record.action.toLowerCase().includes("disposal");

    const tradeType = isSell ? "SELL" : "BUY";
    const sharesTraded = record.secAcq || 1000;
    const totalTransactionValue = record.secVal || record.tdpVal || 100000;
    const pricePerShare = Number((totalTransactionValue / (sharesTraded || 1)).toFixed(2));

    parsedTrades.push({
      insiderName: record.acquirerName,
      executiveRole: record.personCategory,
      tradeType,
      sharesTraded,
      pricePerShare,
      totalTransactionValue,
      filingDate: record.date,
      market: "IN",
      currency: "INR",
    });
  }

  // Delete ALL old records for this Indian ticker before inserting fresh data
  // This ensures generic "TICKER Promoter Group" names get replaced with real executive names
  const sql = getDb();
  await sql`DELETE FROM insider_trades WHERE ticker = ${cleanSymbol}`;

  const tradesLoaded = await insertTrades(cleanSymbol, parsedTrades, "IN", "INR");

  return {
    ticker: cleanSymbol,
    tradesLoaded,
    filingsProcessed: rawRecords.length,
  };
}
