import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/queries";
import { scrapeTicker } from "@/lib/sec/scraper";
import { scrapeNseSymbol } from "@/lib/nse/nse-scraper";
import { getNseCompanyBySymbol, isIndianTicker } from "@/lib/nse/nse-lookup";
import { getCompanyByTicker } from "@/lib/sec/cik-lookup";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ticker?: string; market?: "US" | "IN" };
    const ticker = body.ticker?.trim().toUpperCase();
    let market = body.market;

    if (!ticker) {
      return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
    }

    await ensureSchema();

    // Auto-detect market if not explicitly passed or if ticker is known Indian stock
    if (!market || market !== "IN") {
      const isInd = await isIndianTicker(ticker);
      const isUs = await getCompanyByTicker(ticker).catch(() => null);

      if (isInd && !isUs) {
        market = "IN";
      }
    }

    let result;
    if (market === "IN") {
      result = await scrapeNseSymbol(ticker);
    } else {
      try {
        result = await scrapeTicker(ticker);
      } catch (secErr) {
        // Fallback to NSE scraper if SEC CIK lookup fails for this ticker
        console.warn(`SEC scrape failed for ${ticker}, attempting NSE scrape fallback:`, secErr);
        result = await scrapeNseSymbol(ticker);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
