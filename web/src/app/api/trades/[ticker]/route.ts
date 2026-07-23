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

    // If Indian ticker has legacy dirty records (generic names, anonymous govt names, pre-2025 dates, or stale ₹1500 prices), auto-clean and re-scrape
    const hasLegacyDirtyData =
      isInd &&
      trades.some(
        (t) =>
          !t.insider_name ||
          t.insider_name.toLowerCase().includes("promoter") ||
          t.insider_name.toLowerCase().includes("relative") ||
          t.insider_name.toLowerCase().includes("group") ||
          t.insider_name.includes("Suresh Ramachandran") ||
          t.insider_name.includes("Karthik Natarajan") ||
          t.insider_name.includes("Vikram Malhotra") ||
          t.insider_name.toLowerCase() === "president of india" ||
          t.insider_name.toLowerCase().includes("government of india (ministry") ||
          (Number(t.price_per_share) > 1490 && Number(t.price_per_share) < 1510) ||
          !t.filing_date ||
          t.filing_date < "2025-01-01"
      );

    if (isInd && (trades.length === 0 || hasLegacyDirtyData)) {
      console.log(`Auto-cleaning and re-scraping fresh Indian data for ${normalized}...`);
      await scrapeNseSymbol(normalized);
      trades = await getTradesByTicker(normalized);
      stats = await getTradeStats(normalized);
    } else if (!isInd && trades.length === 0) {
      console.log(`Auto-scraping fresh SEC Form 4 US data for ${normalized}...`);
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
