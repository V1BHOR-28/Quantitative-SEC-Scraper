"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui";
import type { InsiderTrade } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

function buildTimeline(trades: InsiderTrade[]) {
  const map = new Map<string, { date: string; buys: number; sells: number }>();

  for (const trade of trades) {
    const current = map.get(trade.filing_date) ?? {
      date: trade.filing_date,
      buys: 0,
      sells: 0,
    };

    const value = Number(trade.total_transaction_value ?? 0);
    if (trade.trade_type === "BUY") current.buys += value;
    if (trade.trade_type === "SELL") current.sells += value;

    map.set(trade.filing_date, current);
  }

  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12);
}

export function ActivityChart({
  trades,
  currency = "USD",
}: {
  trades: InsiderTrade[];
  currency?: "USD" | "INR";
}) {
  const data = buildTimeline(trades);

  return (
    <Card className="h-[380px] p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Insider Trading Volume Over Time ({currency === "INR" ? "₹ INR" : "$ USD"})
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis
            tickFormatter={(value) => formatCurrency(Number(value), currency)}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            width={80}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            formatter={(value) => [formatCurrency(Number(value), currency)]}
            contentStyle={{
              backgroundColor: "#1a1d21",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
            }}
          />
          <Bar dataKey="buys" fill="#10b981" name="Buys" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sells" fill="#f43f5e" name="Sells" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
