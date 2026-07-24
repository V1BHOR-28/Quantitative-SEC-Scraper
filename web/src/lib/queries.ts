import { getDb } from "./db";
import type { InsiderTrade, ParsedTrade, TradeStats } from "./types";
import { ANOMALY_THRESHOLD } from "./utils";

export async function ensureSchema(): Promise<void> {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS insider_trades (
      trade_id SERIAL PRIMARY KEY,
      ticker VARCHAR(20) NOT NULL,
      company_name VARCHAR(255),
      filing_date DATE NOT NULL,
      insider_name VARCHAR(255) NOT NULL,
      executive_role VARCHAR(100),
      trade_type VARCHAR(50),
      shares_traded INT,
      price_per_share NUMERIC(10, 2),
      total_transaction_value NUMERIC(15, 2),
      market VARCHAR(5) DEFAULT 'US',
      currency VARCHAR(5) DEFAULT 'USD',
      source_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT unique_transaction UNIQUE (ticker, filing_date, insider_name, shares_traded, price_per_share)
    )
  `;
  await sql`ALTER TABLE insider_trades ALTER COLUMN ticker TYPE VARCHAR(20)`;
  await sql`ALTER TABLE insider_trades ADD COLUMN IF NOT EXISTS company_name VARCHAR(255)`;
  await sql`ALTER TABLE insider_trades ADD COLUMN IF NOT EXISTS market VARCHAR(5) DEFAULT 'US'`;
  await sql`ALTER TABLE insider_trades ADD COLUMN IF NOT EXISTS currency VARCHAR(5) DEFAULT 'USD'`;
  await sql`ALTER TABLE insider_trades ADD COLUMN IF NOT EXISTS source_url TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_insider_trades_ticker ON insider_trades (ticker)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_insider_trades_filing_date ON insider_trades (filing_date DESC)`;
}

export async function insertTrades(
  ticker: string,
  trades: ParsedTrade[],
  market: "US" | "IN" = "US",
  currency: "USD" | "INR" = "USD"
): Promise<number> {
  if (trades.length === 0) return 0;

  const sql = getDb();
  let inserted = 0;

  for (const trade of trades) {
    const tradeMarket = trade.market ?? market;
    const tradeCurrency = trade.currency ?? currency;
    const sourceUrl = trade.sourceUrl ? trade.sourceUrl.trim() : null;
    const companyName = trade.companyName ?? null;

    // Strict Guard: Reject any trade missing a valid HTTP source URL
    if (!sourceUrl || sourceUrl.toLowerCase() === "nan" || !sourceUrl.startsWith("http")) {
      console.warn(`[queries.insertTrades] Skipped untraceable trade for ${ticker} - missing valid source_url (${sourceUrl})`);
      continue;
    }

    const result = await sql`
      INSERT INTO insider_trades (
        ticker, company_name, filing_date, insider_name, executive_role,
        trade_type, shares_traded, price_per_share, total_transaction_value,
        market, currency, source_url
      )
      VALUES (
        ${ticker},
        ${companyName},
        ${trade.filingDate},
        ${trade.insiderName},
        ${trade.executiveRole},
        ${trade.tradeType},
        ${trade.sharesTraded},
        ${trade.pricePerShare},
        ${trade.totalTransactionValue},
        ${tradeMarket},
        ${tradeCurrency},
        ${sourceUrl}
      )
      ON CONFLICT ON CONSTRAINT unique_transaction DO NOTHING
      RETURNING trade_id
    `;

    if (result.length > 0) inserted += 1;
  }

  return inserted;
}

export async function getTradesByTicker(ticker: string): Promise<InsiderTrade[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      trade_id, ticker, company_name, filing_date::text, insider_name, executive_role,
      trade_type, shares_traded, price_per_share, total_transaction_value,
      market, currency, source_url, created_at::text
    FROM insider_trades
    WHERE ticker = ${ticker.toUpperCase()}
    ORDER BY filing_date DESC, trade_id DESC
  `;

  return rows as InsiderTrade[];
}

export async function getTradeStats(ticker: string): Promise<TradeStats> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      COALESCE(SUM(CASE WHEN trade_type = 'BUY' THEN total_transaction_value ELSE 0 END), 0)::float AS total_buys,
      COALESCE(SUM(CASE WHEN trade_type = 'SELL' THEN total_transaction_value ELSE 0 END), 0)::float AS total_sells,
      COUNT(*)::int AS trade_count,
      COALESCE(SUM(CASE WHEN total_transaction_value > ${ANOMALY_THRESHOLD} THEN 1 ELSE 0 END), 0)::int AS anomaly_count,
      MAX(created_at)::text AS last_updated,
      MAX(market) AS market,
      MAX(currency) AS currency
    FROM insider_trades
    WHERE ticker = ${ticker.toUpperCase()}
  `;

  const row = rows[0] as {
    total_buys: number;
    total_sells: number;
    trade_count: number;
    anomaly_count: number;
    last_updated: string | null;
    market: string | null;
    currency: string | null;
  };

  return {
    totalBuys: row?.total_buys ?? 0,
    totalSells: row?.total_sells ?? 0,
    netFlow: (row?.total_buys ?? 0) - (row?.total_sells ?? 0),
    anomalyCount: row?.anomaly_count ?? 0,
    tradeCount: row?.trade_count ?? 0,
    lastUpdated: row?.last_updated ?? null,
    market: (row?.market as "US" | "IN") ?? "US",
    currency: (row?.currency as "USD" | "INR") ?? "USD",
  };
}

export async function getScrapedNseCompanies(
  query: string,
  limit = 20
): Promise<{ ticker: string; name: string; market: "IN" }[]> {
  const sql = getDb();
  const q = query.trim();
  const pattern = `%${q}%`;

  const rows = await sql`
    SELECT
      ticker,
      COALESCE(MAX(company_name), ticker) AS name,
      MAX(filing_date) as last_filing_date,
      COUNT(*)::int as trade_count
    FROM insider_trades
    WHERE market = 'IN'
      AND (
        ${q} = '' OR
        ticker ILIKE ${pattern} OR
        company_name ILIKE ${pattern}
      )
    GROUP BY ticker
    ORDER BY MAX(filing_date) DESC, COUNT(*) DESC
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    ticker: (r.ticker as string).toUpperCase(),
    name: (r.name as string) || (r.ticker as string).toUpperCase(),
    market: "IN" as const,
  }));
}
