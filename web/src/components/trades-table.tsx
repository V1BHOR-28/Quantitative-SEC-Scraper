import { Card } from "@/components/ui";
import type { InsiderTrade } from "@/lib/types";
import { ANOMALY_THRESHOLD, formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function TradesTable({
  trades,
  currency = "USD",
}: {
  trades: InsiderTrade[];
  currency?: "USD" | "INR";
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-500">Recent Insider Trades</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Insider</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Shares</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                  No trades loaded yet. Click refresh to ingest filings.
                </td>
              </tr>
            )}
            {trades.map((trade) => {
              const total = Number(trade.total_transaction_value ?? 0);
              const isAnomaly = total >= ANOMALY_THRESHOLD;

              return (
                <tr
                  key={trade.trade_id}
                  className={cn(
                    "border-t border-zinc-100 dark:border-zinc-800",
                    isAnomaly && "bg-amber-50 dark:bg-amber-950/20"
                  )}
                >
                  <td className="px-5 py-3">{trade.filing_date}</td>
                  <td className="px-5 py-3 font-medium">{trade.insider_name}</td>
                  <td className="px-5 py-3">{trade.executive_role}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        trade.trade_type === "BUY" &&
                          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                        trade.trade_type === "SELL" &&
                          "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
                        trade.trade_type === "Other" &&
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      )}
                    >
                      {trade.trade_type}
                    </span>
                  </td>
                  <td className="px-5 py-3">{formatNumber(Number(trade.shares_traded ?? 0))}</td>
                  <td className="px-5 py-3">{formatCurrency(Number(trade.price_per_share ?? 0), currency)}</td>
                  <td className="px-5 py-3 font-medium">
                    {formatCurrency(total, currency)}
                    {isAnomaly && (
                      <span className="ml-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                        ANOMALY
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
