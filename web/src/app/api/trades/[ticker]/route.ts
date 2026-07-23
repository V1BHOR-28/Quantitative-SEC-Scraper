import { NextResponse } from "next/server";
import { ensureSchema, getTradeStats, getTradesByTicker } from "@/lib/queries";
import { isIndianTicker } from "@/lib/nse/nse-lookup";
import { scrapeNseSymbol } from "@/lib/nse/nse-scraper";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const normalized = ticker.toUpperCase();

  try {
    await ensureSchema();
    let trades = await getTradesByTicker(normalized);
    let stats = await getTradeStats(normalized);

    const isInd = await isIndianTicker(normalized);

    // If no stored trades exist in Postgres yet for this ticker, trigger initial ingestion
    if (isInd && trades.length === 0) {
      console.log(`Initial ingestion of live SEBI PIT disclosures for ${normalized}...`);
      await scrapeNseSymbol(normalized);
      trades = await getTradesByTicker(normalized);
      stats = await getTradeStats(normalized);
    } else if (!isInd && trades.length === 0) {
      console.log(`Initial ingestion of SEC Form 4 US data for ${normalized}...`);
      try {
        const { scrapeTicker } = await import("@/lib/sec/scraper");
        await scrapeTicker(normalized);
        trades = await getTradesByTicker(normalized);
        stats = await getTradeStats(normalized);
      } catch (secErr) {
        console.warn(`SEC scraping fallback for ${normalized}:`, secErr);
      }
    }

    if (stats) {
      if (isInd || stats.market === "IN") {
        stats.market = "IN";
        stats.currency = "INR";
      }
    }

    return NextResponse.json({ ticker: normalized, trades, stats });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load trades" },
      { status: 500 }
    );
  }
}
