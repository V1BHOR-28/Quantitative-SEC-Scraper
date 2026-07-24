import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/queries";
import { scrapeTicker } from "@/lib/sec/scraper";
import { POPULAR_TICKERS_US } from "@/lib/utils";

export const maxDuration = 300;

export async function GET(request: Request) {
  // Verify Vercel Cron authentication header
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureSchema();

    const results = [];
    for (const ticker of POPULAR_TICKERS_US.slice(0, 3)) {
      const result = await scrapeTicker(ticker);
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
