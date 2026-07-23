import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/queries";
import { scrapeTicker } from "@/lib/sec/scraper";
import { scrapeNseSymbol } from "@/lib/nse/nse-scraper";
import { POPULAR_TICKERS_US, POPULAR_TICKERS_IN } from "@/lib/utils";

export const maxDuration = 300;

export async function GET() {
  try {
    await ensureSchema();

    const results = [];
    for (const ticker of POPULAR_TICKERS_US.slice(0, 3)) {
      const result = await scrapeTicker(ticker);
      results.push(result);
    }
    for (const ticker of POPULAR_TICKERS_IN.slice(0, 3)) {
      const result = await scrapeNseSymbol(ticker);
      results.push(result);
    }

    return NextResponse.json({ refreshed: results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron refresh failed" },
      { status: 500 }
    );
  }
}
