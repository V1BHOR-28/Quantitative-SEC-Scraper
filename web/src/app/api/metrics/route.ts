import { NextResponse } from "next/server";
import { ensureSchema, getDatabaseMetrics } from "@/lib/queries";

export async function GET() {
  try {
    await ensureSchema();
    const metrics = await getDatabaseMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { totalTrades: 0, unverifiedCount: 0 },
      { status: 500 }
    );
  }
}
