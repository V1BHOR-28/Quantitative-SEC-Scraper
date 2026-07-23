"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { CompanyOption } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompanySearchProps {
  onSelect: (ticker: string, market: "US" | "IN") => void;
  initialTicker?: string;
  market?: "US" | "IN";
}

export function CompanySearch({
  onSelect,
  initialTicker = "",
  market = "US",
}: CompanySearchProps) {
  const [query, setQuery] = useState(initialTicker);
  const [results, setResults] = useState<CompanyOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/companies?q=${encodeURIComponent(query)}&market=${market}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        setResults(data.companies ?? []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, market]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto z-50">
      <div className="relative group">
        <div
          className={cn(
            "absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 bg-gradient-to-r",
            market === "IN" ? "from-amber-500 to-orange-500" : "from-cyan-500 to-blue-500"
          )}
        />
        <Search
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors",
            market === "IN" ? "text-amber-400/70 group-focus-within:text-amber-400" : "text-cyan-400/70 group-focus-within:text-cyan-400"
          )}
        />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value.toUpperCase());
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={
            market === "IN"
              ? "Search Indian symbol (e.g. RELIANCE, TCS, INFY)..."
              : "Search US ticker or company name (e.g. NVDA, AAPL)..."
          }
          className={cn(
            "relative w-full rounded-2xl border border-white/10 bg-[#141618]/80 backdrop-blur-md py-4 pl-12 pr-4 text-base text-white placeholder:text-gray-500 outline-none ring-0 transition-all",
            market === "IN" ? "focus:border-amber-500/50 focus:bg-[#141618]" : "focus:border-cyan-500/50 focus:bg-[#141618]"
          )}
        />
      </div>

      {open && (
        <div
          className="absolute z-[999] mt-3 w-full max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1d21] shadow-2xl"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#333 transparent",
          }}
        >
          {loading && (
            <div className={cn("px-5 py-4 text-sm animate-pulse", market === "IN" ? "text-amber-400" : "text-cyan-400")}>
              {market === "IN" ? "Searching NSE SEBI directory..." : "Searching SEC EDGAR directory..."}
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-5 py-4 text-sm text-gray-500">No companies found.</div>
          )}
          {!loading &&
            results.map((company) => (
              <button
                key={company.ticker}
                type="button"
                onClick={() => {
                  setQuery(company.ticker);
                  setOpen(false);
                  onSelect(company.ticker, company.market ?? market);
                }}
                className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white tracking-wide">{company.ticker}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-400">
                      {company.market === "IN" ? "🇮🇳 NSE" : "🇺🇸 SEC"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{company.name}</div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
