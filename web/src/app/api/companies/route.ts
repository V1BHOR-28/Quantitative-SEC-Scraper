import { NextResponse } from "next/server";
import { searchCompanies } from "@/lib/sec/cik-lookup";
import { searchNseCompanies } from "@/lib/nse/nse-lookup";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const market = (searchParams.get("market") ?? "US").toUpperCase();

  try {
    const companies =
      market === "IN"
        ? await searchNseCompanies(query)
        : await searchCompanies(query);

    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load companies" },
      { status: 500 }
    );
  }
}
