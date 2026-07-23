"use client";

import { cn } from "@/lib/utils";

interface MarketSelectorProps {
  market: "US" | "IN";
  onChange: (market: "US" | "IN") => void;
}

export function MarketSelector({ market, onChange }: MarketSelectorProps) {
  return (
    <div className="inline-flex items-center rounded-2xl border border-white/10 bg-[#1a1d21]/80 p-1.5 backdrop-blur-md shadow-lg">
      <button
        type="button"
        onClick={() => onChange("US")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-300",
          market === "US"
            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
      >
        <span>🇺🇸</span>
        <span>US Market (SEC)</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("IN")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-300",
          market === "IN"
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
      >
        <span>🇮🇳</span>
        <span>Indian Market (NSE)</span>
      </button>
    </div>
  );
}
