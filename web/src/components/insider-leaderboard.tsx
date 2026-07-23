import { Card } from "@/components/ui";
import type { InsiderTrade } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

function buildLeaderboard(trades: InsiderTrade[]) {
  const map = new Map<string, number>();

  for (const trade of trades) {
    const value = Number(trade.total_transaction_value ?? 0);
    map.set(trade.insider_name, (map.get(trade.insider_name) ?? 0) + value);
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export function InsiderLeaderboard({
  trades,
  currency = "USD",
}: {
  trades: InsiderTrade[];
  currency?: "USD" | "INR";
}) {
  const leaders = buildLeaderboard(trades);

  return (
    <Card>
      <h3 className="mb-4 text-sm font-medium text-zinc-500">Top Insiders by Value</h3>
      <div className="space-y-3">
        {leaders.length === 0 && (
          <p className="text-sm text-zinc-500">No insider activity yet.</p>
        )}
        {leaders.map((leader, index) => (
          <div key={leader.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-800">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{leader.name}</span>
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              {formatCurrency(leader.value, currency)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
