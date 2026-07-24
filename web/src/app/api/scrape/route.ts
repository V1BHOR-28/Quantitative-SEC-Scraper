import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/queries";
import { scrapeTicker } from "@/lib/sec/scraper";
import { isIndianTicker } from "@/lib/nse/nse-lookup";
import { getCompanyByTicker } from "@/lib/sec/cik-lookup";

export const maxDuration = 60;

export async function POST(request: Request) {
  // Authentication check
  const authHeader = request.headers.get("authorization") || request.headers.get("x-api-key");
  const secret = process.env.CRON_SECRET || process.env.SCRAPE_SECRET;

  if (secret && authHeader !== `Bearer ${secret}` && authHeader !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { ticker?: string; market?: "US" | "IN" };
    const ticker = body.ticker?.trim().toUpperCase();
    let market = body.market;

    if (!ticker) {
      return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
    }

    await ensureSchema();

    if (!market || market !== "IN") {
      const isInd = await isIndianTicker(ticker);
      const isUs = await getCompanyByTicker(ticker).catch(() => null);

      if (isInd && !isUs) {
        market = "IN";
      }
    }

    if (market === "IN") {
      return NextResponse.json({
        ticker,
        market: "IN",
        message: "Indian market disclosures are synced asynchronously via GitHub Actions scheduled pipeline.",
        trades: []
      });
    }

    const result = await scrapeTicker(ticker);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
