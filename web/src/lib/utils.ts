import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: "USD" | "INR" = "USD"): string {
  const isNegative = value < 0;
  const abs = Math.abs(value);
  const sign = isNegative ? "-" : "";

  if (currency === "INR") {
    // 1 Crore = 10,000,000 | 1 Lakh = 100,000
    if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)} Cr`;
    if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(2)} L`;
    if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)} K`;
    return `${sign}₹${abs.toFixed(2)}`;
  }

  // USD Default
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export const POPULAR_TICKERS_US = [
  "NVDA", "AAPL", "MSFT", "AMD", "AMZN", "GOOGL", "META", "TSLA"
];

export const POPULAR_TICKERS_IN = [
  "RELIANCE", "TCS", "INFY", "TATAMOTORS", "HDFCBANK", "ICICIBANK", "SBIN", "ITC"
];

export const POPULAR_TICKERS = POPULAR_TICKERS_US;

export const ANOMALY_THRESHOLD = 10_000_000;
