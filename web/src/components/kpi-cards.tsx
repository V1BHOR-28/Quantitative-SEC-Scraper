import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { TradeStats } from "@/lib/types";
import { ArrowDownRight, ArrowUpRight, AlertTriangle, Activity } from "lucide-react";

export function KpiCards({ stats, currency = "USD" }: { stats: TradeStats; currency?: "USD" | "INR" }) {
  const items = [
    {
      label: "Total Buys",
      value: formatCurrency(stats.totalBuys, currency),
      icon: ArrowUpRight,
      tone: "text-emerald-400",
    },
    {
      label: "Total Sells",
      value: formatCurrency(stats.totalSells, currency),
      icon: ArrowDownRight,
      tone: "text-rose-400",
    },
    {
      label: "Net Flow",
      value: formatCurrency(stats.netFlow, currency),
      icon: Activity,
      tone: stats.netFlow >= 0 ? "text-emerald-400" : "text-rose-400",
    },
    {
      label: "Anomalies Flagged",
      value: String(stats.anomalyCount),
      icon: AlertTriangle,
      tone: "text-amber-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white">{item.value}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <item.icon className={`h-5 w-5 ${item.tone}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
