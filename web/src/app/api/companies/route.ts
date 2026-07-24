import { NextResponse } from "next/server";
import { searchCompanies } from "@/lib/sec/cik-lookup";
import { ensureSchema, getScrapedNseCompanies } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const market = (searchParams.get("market") ?? "US").toUpperCase();

  try {
    if (market === "IN") {
      await ensureSchema();
      const companies = await getScrapedNseCompanies(query, 20);
      return NextResponse.json({ companies });
    }

    const companies = await searchCompanies(query);
    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load companies" },
      { status: 500 }
    );
  }
}
