"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui";
import type { InsiderTrade } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#10b981", "#f43f5e", "#6366f1"];

function buildSplit(trades: InsiderTrade[]) {
  let buys = 0;
  let sells = 0;
  let other = 0;

  for (const trade of trades) {
    const value = Number(trade.total_transaction_value ?? 0);
    if (trade.trade_type === "BUY") buys += value;
    else if (trade.trade_type === "SELL") sells += value;
    else other += value;
  }

  return [
    { name: "Buys", value: buys },
    { name: "Sells", value: sells },
    { name: "Other", value: other },
  ].filter((item) => item.value > 0);
}

export function TradeSplitChart({
  trades,
  currency = "USD",
}: {
  trades: InsiderTrade[];
  currency?: "USD" | "INR";
}) {
  const data = buildSplit(trades);

  return (
    <Card className="h-[380px] p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Buy vs Sell Split</h3>
      {data.length === 0 ? (
        <div className="flex h-[85%] items-center justify-center text-sm text-zinc-500">
          No trade mix available yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value), currency)]}
              contentStyle={{
                backgroundColor: "#1a1d21",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
