/**
 * DEPRECATED / RETIRED SUBPROCESS ROUTE
 * Live NSE scraping via Python subprocess execution is retired in serverless/Vercel paths.
 * Ingestion of Indian SEBI PIT disclosure data is exclusively owned by the asynchronous
 * GitHub Actions pipeline (`web/scripts/sync_nse_to_postgres.py`).
 */
export async function scrapeNseSymbol(symbol: string): Promise<{
  ticker: string;
  tradesLoaded: number;
  filingsProcessed: number;
}> {
  console.warn(
    `[DEPRECATED] scrapeNseSymbol called for ${symbol}. NSE scraping is exclusively owned by GitHub Actions.`
  );
  return {
    ticker: symbol.toUpperCase(),
    tradesLoaded: 0,
    filingsProcessed: 0,
  };
}
