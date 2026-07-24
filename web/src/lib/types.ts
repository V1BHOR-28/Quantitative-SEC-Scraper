export interface InsiderTrade {
  trade_id: number;
  ticker: string;
  company_name?: string | null;
  filing_date: string;
  insider_name: string;
  executive_role: string | null;
  trade_type: string | null;
  shares_traded: number | null;
  price_per_share: number | null;
  total_transaction_value: number | null;
  market?: "US" | "IN";
  currency?: "USD" | "INR";
  source_url?: string | null;
  created_at?: string;
}

export interface TradeStats {
  totalBuys: number;
  totalSells: number;
  netFlow: number;
  anomalyCount: number;
  tradeCount: number;
  lastUpdated: string | null;
  currency?: "USD" | "INR";
  market?: "US" | "IN";
}

export interface ParsedTrade {
  insiderName: string;
  executiveRole: string;
  tradeType: string;
  sharesTraded: number;
  pricePerShare: number;
  totalTransactionValue: number;
  filingDate: string;
  companyName?: string | null;
  market?: "US" | "IN";
  currency?: "USD" | "INR";
  sourceUrl?: string | null;
}

export interface CompanyOption {
  ticker: string;
  name: string;
  cik?: string;
  market: "US" | "IN";
}
