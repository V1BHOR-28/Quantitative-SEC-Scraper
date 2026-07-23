"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ActivityChart } from "@/components/activity-chart";
import { Activity as ActivityChartIcon, ArrowLeft, RefreshCw } from "lucide-react";
import { InsiderLeaderboard } from "@/components/insider-leaderboard";
import { KpiCards } from "@/components/kpi-cards";
import { TradeSplitChart } from "@/components/trade-split-chart";
import { TradesTable } from "@/components/trades-table";
import { Button } from "@/components/ui";
import type { InsiderTrade, TradeStats } from "@/lib/types";

const emptyStats: TradeStats = {
  totalBuys: 0,
  totalSells: 0,
  netFlow: 0,
  anomalyCount: 0,
  tradeCount: 0,
  lastUpdated: null,
};

export function DashboardClient({
  ticker,
  companyName,
}: {
  ticker: string;
  companyName?: string;
}) {
  const searchParams = useSearchParams();
  const marketParam = (searchParams.get("market") as "US" | "IN" | null) ?? undefined;

  const [trades, setTrades] = useState<InsiderTrade[]>([]);
  const [stats, setStats] = useState<TradeStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Loading dashboard...");

  const activeMarket = stats.market ?? marketParam ?? "US";
  const activeCurrency = stats.currency ?? (activeMarket === "IN" ? "INR" : "USD");

  const loadTrades = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trades/${ticker}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load dashboard");
      }

      setTrades(data.trades ?? []);
      setStats(data.stats ?? emptyStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setStatus(
      activeMarket === "IN"
        ? "Fetching SEBI Insider Trading disclosures..."
        : "Fetching SEC Form 4 filings..."
    );

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, market: activeMarket }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Scrape failed");
      }

      setStatus(
        `Loaded ${data.tradesLoaded} trades from ${data.filingsProcessed} ${
          activeMarket === "IN" ? "SEBI disclosures" : "Form 4 filings"
        }.`
      );
      await loadTrades();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scrape failed");
    } finally {
      setRefreshing(false);
    }
  }, [loadTrades, ticker, activeMarket]);

  useEffect(() => {
    void loadTrades();
  }, [loadTrades]);

  useEffect(() => {
    if (!loading && stats.tradeCount === 0 && !refreshing) {
      void refreshData();
    }
  }, [loading, stats.tradeCount, refreshing, refreshData]);

  return (
    <div className="min-h-screen bg-[#141618] text-[#F4F6F8]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-2 text-sm text-cyan-400/70 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to search
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight glow-text text-white">
                {ticker} Insider Dashboard
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 font-semibold text-gray-300">
                {activeMarket === "IN" ? "🇮🇳 NSE India" : "🇺🇸 SEC US"}
              </span>
            </div>
            {companyName && <p className="mt-1 text-gray-400">{companyName}</p>}
            <p className="mt-2 text-sm text-gray-500">
              {stats.lastUpdated
                ? `Last updated ${new Date(stats.lastUpdated).toLocaleString()}`
                : "No data synced yet"}
            </p>
          </div>

          <Button onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin text-black" : "text-black"}`} />
            {refreshing
              ? "Fetching data..."
              : activeMarket === "IN"
              ? "Sync SEBI Data"
              : "Sync SEC Data"}
          </Button>
        </div>

        {status && (
          <div className="mb-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
            {status}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="glass-card p-20 flex flex-col items-center justify-center text-center">
            <ActivityChartIcon className="h-10 w-10 text-cyan-500 animate-pulse mb-4" />
            <p className="text-cyan-400 glow-text animate-pulse">
              Initializing {activeMarket === "IN" ? "NSE SEBI" : "SEC"} Data Feed...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <KpiCards stats={stats} currency={activeCurrency} />

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <ActivityChart trades={trades} currency={activeCurrency} />
              </div>
              <TradeSplitChart trades={trades} currency={activeCurrency} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <InsiderLeaderboard trades={trades} currency={activeCurrency} />
              </div>
              <div className="lg:col-span-2">
                <TradesTable trades={trades} currency={activeCurrency} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
