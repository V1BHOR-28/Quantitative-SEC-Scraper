import { DashboardClient } from "@/components/dashboard-client";
import { getCompanyByTicker } from "@/lib/sec/cik-lookup";
import { getNseCompanyBySymbol } from "@/lib/nse/nse-lookup";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const normalized = ticker.toUpperCase();

  let company = await getCompanyByTicker(normalized).catch(() => null);
  if (!company) {
    company = await getNseCompanyBySymbol(normalized).catch(() => null);
  }

  return (
    <DashboardClient
      ticker={normalized}
      companyName={company?.name}
    />
  );
}
