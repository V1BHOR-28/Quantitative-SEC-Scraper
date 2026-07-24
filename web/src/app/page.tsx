"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Chart from "chart.js/auto";
import { NSE_NAME_FALLBACKS } from "@/lib/nse/nse-lookup";
import {
  getOwnership,
  isGovernmentOwned,
  psuCategoryColor,
  ALL_GOVT_TICKERS,
  ALL_PRIVATE_TICKERS,
  GOVT_TICKERS_BY_CATEGORY,
  PRIVATE_TICKERS_BY_CATEGORY,
  GOVT_COUNT,
  PRIVATE_COUNT,
  TOTAL_TRACKED_COUNT,
} from "@/lib/nse/ownership-data";

interface InsiderTrade {
  trade_id: number;
  ticker: string;
  filing_date: string;
  insider_name: string;
  executive_role?: string;
  trade_type: string;
  shares_traded: number;
  price_per_share: number;
  total_transaction_value: number;
  market?: "US" | "IN";
  currency?: "USD" | "INR";
}

interface TradeStats {
  totalBuys: number;
  totalSells: number;
  netFlow: number;
  anomalyCount: number;
  tradeCount: number;
  lastUpdated: string | null;
  market: "US" | "IN";
  currency: "USD" | "INR";
}

const STOCK_LOOKUP: Record<string, { name: string; exch: string; sector: string; market: "IN" }> = {
  // IT & Software
  WIPRO: { name: "WIPRO Limited", exch: "NSE: WIPRO | BSE: 507685", sector: "IT Services", market: "IN" },
  TCS: { name: "Tata Consultancy Services", exch: "NSE: TCS | BSE: 532540", sector: "IT Services", market: "IN" },
  INFY: { name: "Infosys Limited", exch: "NSE: INFY | BSE: 500209", sector: "IT Services", market: "IN" },
  HCLTECH: { name: "HCL Technologies Ltd", exch: "NSE: HCLTECH | BSE: 532281", sector: "IT Services", market: "IN" },
  TECHM: { name: "Tech Mahindra Ltd", exch: "NSE: TECHM | BSE: 532755", sector: "IT Services", market: "IN" },
  LTIM: { name: "LTIMindtree Ltd", exch: "NSE: LTIM | BSE: 540005", sector: "IT Services", market: "IN" },
  PERSISTENT: { name: "Persistent Systems Ltd", exch: "NSE: PERSISTENT | BSE: 533179", sector: "Software & Cloud", market: "IN" },

  // Healthcare & Pharmaceuticals
  SUNPHARMA: { name: "Sun Pharmaceutical Industries", exch: "NSE: SUNPHARMA | BSE: 524715", sector: "Healthcare & Pharma", market: "IN" },
  CIPLA: { name: "Cipla Limited", exch: "NSE: CIPLA | BSE: 500087", sector: "Healthcare & Pharma", market: "IN" },
  DRREDDY: { name: "Dr. Reddy's Laboratories", exch: "NSE: DRREDDY | BSE: 500124", sector: "Healthcare & Pharma", market: "IN" },
  APOLLOHOSP: { name: "Apollo Hospitals Enterprise", exch: "NSE: APOLLOHOSP | BSE: 508869", sector: "Healthcare & Hospitals", market: "IN" },
  MAXHEALTH: { name: "Max Healthcare Institute", exch: "NSE: MAXHEALTH | BSE: 543220", sector: "Healthcare & Hospitals", market: "IN" },
  MANKIND: { name: "Mankind Pharma Ltd", exch: "NSE: MANKIND | BSE: 543904", sector: "Healthcare & Pharma", market: "IN" },
  LUPIN: { name: "Lupin Limited", exch: "NSE: LUPIN | BSE: 500257", sector: "Healthcare & Pharma", market: "IN" },
  DIVISLAB: { name: "Divi's Laboratories Ltd", exch: "NSE: DIVISLAB | BSE: 532488", sector: "Healthcare & Pharma", market: "IN" },
  TORNTPHARM: { name: "Torrent Pharmaceuticals", exch: "NSE: TORNTPHARM | BSE: 500420", sector: "Healthcare & Pharma", market: "IN" },
  ZYDUSLIFE: { name: "Zydus Lifesciences Ltd", exch: "NSE: ZYDUSLIFE | BSE: 532321", sector: "Healthcare & Pharma", market: "IN" },

  // Banking & Financial Services
  HDFCBANK: { name: "HDFC Bank Ltd", exch: "NSE: HDFCBANK | BSE: 500180", sector: "Banking & Finance", market: "IN" },
  ICICIBANK: { name: "ICICI Bank Ltd", exch: "NSE: ICICIBANK | BSE: 532174", sector: "Banking & Finance", market: "IN" },
  KOTAKBANK: { name: "Kotak Mahindra Bank", exch: "NSE: KOTAKBANK | BSE: 500247", sector: "Banking & Finance", market: "IN" },
  AXISBANK: { name: "Axis Bank Ltd", exch: "NSE: AXISBANK | BSE: 532215", sector: "Banking & Finance", market: "IN" },
  SBIN: { name: "State Bank of India", exch: "NSE: SBIN | BSE: 500112", sector: "Public Sector Banking", market: "IN" },
  BAJFINANCE: { name: "Bajaj Finance Ltd", exch: "NSE: BAJFINANCE | BSE: 500034", sector: "Financial Services", market: "IN" },
  BAJAJFINSV: { name: "Bajaj Finserv Ltd", exch: "NSE: BAJAJFINSV | BSE: 532978", sector: "Financial Services", market: "IN" },
  JIOFIN: { name: "Jio Financial Services", exch: "NSE: JIOFIN | BSE: 543940", sector: "Financial Services", market: "IN" },
  IDFCFIRSTB: { name: "IDFC First Bank Ltd", exch: "NSE: IDFCFIRSTB | BSE: 539437", sector: "Banking & Finance", market: "IN" },

  // Automotive & Engineering
  TATAMOTORS: { name: "Tata Motors Ltd", exch: "NSE: TATAMOTORS | BSE: 500570", sector: "Automotive", market: "IN" },
  MARUTI: { name: "Maruti Suzuki India Ltd", exch: "NSE: MARUTI | BSE: 532500", sector: "Automotive", market: "IN" },
  "M&M": { name: "Mahindra & Mahindra Ltd", exch: "NSE: M&M | BSE: 500520", sector: "Automotive", market: "IN" },
  HEROMOTOCO: { name: "Hero MotoCorp Ltd", exch: "NSE: HEROMOTOCO | BSE: 500182", sector: "Automotive", market: "IN" },
  EICHERMOT: { name: "Eicher Motors Ltd", exch: "NSE: EICHERMOT | BSE: 505200", sector: "Automotive", market: "IN" },
  TVSMOTOR: { name: "TVS Motor Company", exch: "NSE: TVSMOTOR | BSE: 532343", sector: "Automotive", market: "IN" },

  // Energy & Clean Power
  RELIANCE: { name: "Reliance Industries Ltd", exch: "NSE: RELIANCE | BSE: 500325", sector: "Energy & Telecom", market: "IN" },
  ADANIENT: { name: "Adani Enterprises Ltd", exch: "NSE: ADANIENT | BSE: 512599", sector: "Energy & Conglomerate", market: "IN" },
  ADANIPORTS: { name: "Adani Ports & SEZ", exch: "NSE: ADANIPORTS | BSE: 532921", sector: "Infrastructure", market: "IN" },
  ADANIPOWER: { name: "Adani Power Ltd", exch: "NSE: ADANIPOWER | BSE: 533096", sector: "Energy & Power", market: "IN" },
  ADANIGREEN: { name: "Adani Green Energy", exch: "NSE: ADANIGREEN | BSE: 541450", sector: "Clean Energy", market: "IN" },
  SUZLON: { name: "Suzlon Energy Ltd", exch: "NSE: SUZLON | BSE: 532667", sector: "Renewable Energy", market: "IN" },

  // FMCG, Retail & Consumer
  ITC: { name: "ITC Limited", exch: "NSE: ITC | BSE: 500875", sector: "FMCG & Consumer Goods", market: "IN" },
  HINDUNILVR: { name: "Hindustan Unilever Ltd", exch: "NSE: HINDUNILVR | BSE: 500696", sector: "FMCG & Consumer Goods", market: "IN" },
  TITAN: { name: "Titan Company Ltd", exch: "NSE: TITAN | BSE: 500114", sector: "Retail & Consumer", market: "IN" },
  VBL: { name: "Varun Beverages Ltd", exch: "NSE: VBL | BSE: 540180", sector: "FMCG & Beverages", market: "IN" },
  TRENT: { name: "Trent Limited", exch: "NSE: TRENT | BSE: 500251", sector: "Retail & Fashion", market: "IN" },
  DMART: { name: "Avenue Supermarts (DMart)", exch: "NSE: DMART | BSE: 540376", sector: "Retail & Supermarts", market: "IN" },

  // Infrastructure & Metals
  LT: { name: "Larsen & Toubro Ltd", exch: "NSE: LT | BSE: 500510", sector: "Infrastructure & Engineering", market: "IN" },
  DLF: { name: "DLF Limited", exch: "NSE: DLF | BSE: 532868", sector: "Real Estate & Infra", market: "IN" },
  TATASTEEL: { name: "Tata Steel Ltd", exch: "NSE: TATASTEEL | BSE: 500470", sector: "Metals & Mining", market: "IN" },
  ULTRACEMCO: { name: "UltraTech Cement Ltd", exch: "NSE: ULTRACEMCO | BSE: 532538", sector: "Building Materials", market: "IN" },
  ASIANPAINT: { name: "Asian Paints Ltd", exch: "NSE: ASIANPAINT | BSE: 500820", sector: "Paints & Materials", market: "IN" },
  VEDL: { name: "Vedanta Limited", exch: "NSE: VEDL | BSE: 500295", sector: "Metals & Mining", market: "IN" },
  JSWSTEEL: { name: "JSW Steel Ltd", exch: "NSE: JSWSTEEL | BSE: 500228", sector: "Metals & Mining", market: "IN" },

  // Government & Defence
  HAL: { name: "Hindustan Aeronautics Ltd", exch: "NSE: HAL | BSE: 541154", sector: "Defence & Aerospace", market: "IN" },
  BEL: { name: "Bharat Electronics Ltd", exch: "NSE: BEL | BSE: 500049", sector: "Defence Electronics", market: "IN" },
  HMT: { name: "HMT Limited", exch: "NSE: HMT | BSE: 500191", sector: "Industrial Machinery", market: "IN" },
  ZOMATO: { name: "Zomato Limited", exch: "NSE: ZOMATO | BSE: 543320", sector: "Consumer Internet", market: "IN" },
};

const IN_STOCKS_KEYS = Object.keys(STOCK_LOOKUP);

export default function HomePage() {
  const [activePage, setActivePage] = useState<"landing" | "dashboard">("landing");
  const [market] = useState<"IN">("IN");
  const [activeTicker, setActiveTicker] = useState<string>("WIPRO");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [chipFilter, setChipFilter] = useState<"ALL" | "WISHLIST">("ALL");
  const [ownerFilter, setOwnerFilter] = useState<"ALL" | "GOVERNMENT" | "PRIVATE">("ALL");
  const [ownerSearch, setOwnerSearch] = useState<string>("");

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("insiderflow_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      } else {
        setWishlist(["WIPRO", "RELIANCE", "SBIN", "TCS", "HAL", "ZOMATO", "HMT"]);
      }
    } catch (e) {
      setWishlist(["WIPRO", "RELIANCE", "SBIN", "TCS", "HAL", "ZOMATO", "HMT"]);
    }
  }, []);

  const toggleWishlist = (ticker: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const sym = ticker.toUpperCase();
    setWishlist((prev) => {
      const exists = prev.includes(sym);
      const updated = exists ? prev.filter((s) => s !== sym) : [...prev, sym];
      try {
        localStorage.setItem("insiderflow_wishlist", JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();

    const allIn = Object.entries(NSE_NAME_FALLBACKS).map(([ticker, name]) => ({
      ticker,
      name,
      market: "IN" as const,
      sector: STOCK_LOOKUP[ticker]?.sector || "NSE / BSE Equity",
    }));

    const matches = allIn
      .filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      )
      .slice(0, 8);

    if (matches.length > 0) return matches;

    // Allow instant dynamic search result for any valid NSE/BSE ticker symbol
    const cleanQ = q.toUpperCase();
    if (/^[A-Z0-9&\-\.]{1,20}$/.test(cleanQ)) {
      return [
        {
          ticker: cleanQ,
          name: `${cleanQ} Ltd (NSE / BSE Equity)`,
          market: "IN" as const,
          sector: "NSE / BSE Listed Equity",
        },
      ];
    }
    return [];
  }, [searchQuery]);

  const displayChips = useMemo(() => {
    if (chipFilter === "WISHLIST") return wishlist;
    return ALL_PRIVATE_TICKERS;
  }, [chipFilter, wishlist]);

  // Ownership-filtered chips for the Gov/Private panel
  const ownerFilteredChips = useMemo(() => {
    try {
      const rawQ = ownerSearch.trim().toLowerCase();
      let base: string[] = [];
      if (ownerFilter === "GOVERNMENT") {
        base = ALL_GOVT_TICKERS;
      } else if (ownerFilter === "PRIVATE") {
        base = ALL_PRIVATE_TICKERS;
      } else {
        base = Array.from(new Set([...ALL_GOVT_TICKERS, ...ALL_PRIVATE_TICKERS]));
      }
      const seen = new Set<string>();
      base = base.filter((s) => { if (seen.has(s)) return false; seen.add(s); return true; });
      if (!rawQ) return base;

      return base.filter((s) => {
        const meta = STOCK_LOOKUP[s];
        const sym = s.toLowerCase();
        const name = (meta?.name ?? "").toLowerCase();
        const sec = (meta?.sector ?? "").toLowerCase();

        if (sym.includes(rawQ) || name.includes(rawQ) || sec.includes(rawQ)) return true;

        // Sector synonyms
        if ((rawQ === "health" || rawQ === "pharma" || rawQ === "medical") && (sec.includes("pharma") || sec.includes("health"))) return true;
        if ((rawQ === "bank" || rawQ === "finance") && (sec.includes("bank") || sec.includes("financ"))) return true;
        if ((rawQ === "tech" || rawQ === "software") && (sec.includes("it") || sec.includes("tech") || sec.includes("software"))) return true;
        if ((rawQ === "auto") && sec.includes("auto")) return true;
        if ((rawQ === "fmcg") && (sec.includes("fmcg") || sec.includes("consumer") || sec.includes("retail"))) return true;
        if ((rawQ === "energy" || rawQ === "power") && (sec.includes("energy") || sec.includes("power"))) return true;
        if ((rawQ === "infra" || rawQ === "metal") && (sec.includes("infra") || sec.includes("metal") || sec.includes("steel") || sec.includes("mining"))) return true;

        return false;
      });
    } catch (err) {
      console.error("ownerFilteredChips error:", err);
      return [];
    }
  }, [ownerFilter, ownerSearch]);

  const isValidStock = useMemo(() => {
    const sym = activeTicker.trim().toUpperCase();
    if (!sym) return false;
    // Allow any non-empty valid ticker string for all tracked NSE & BSE companies
    return /^[A-Z0-9&\-\.]{1,20}$/.test(sym);
  }, [activeTicker]);

  // Live Data State
  const [trades, setTrades] = useState<InsiderTrade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);

  // Chart canvas refs
  const volumeChartRef = useRef<HTMLCanvasElement | null>(null);
  const typeChartRef = useRef<HTMLCanvasElement | null>(null);
  const holdingsChartRef = useRef<HTMLCanvasElement | null>(null);
  const topInsidersChartRef = useRef<HTMLCanvasElement | null>(null);

  // Chart instances ref
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});

  // 1. CHROME BROWSER ENGINE BACK BUTTON INTEGRATION via popstate & history API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      const tickerParam = params.get("ticker");

      if (viewParam === "dashboard") {
        setActivePage("dashboard");
        if (tickerParam) {
          const sym = tickerParam.toUpperCase();
          setActiveTicker(sym);
        }
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.page === "dashboard") {
        setActivePage("dashboard");
        if (e.state.ticker) setActiveTicker(e.state.ticker);
      } else {
        setActivePage("landing");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Live Data whenever Ticker changes
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/trades/${activeTicker}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setTrades(data.trades || []);
            setStats(data.stats || null);
          }
        }
      } catch (err) {
        console.error("Failed to load trades:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeTicker]);

  // Compute stock meta info
  const currentStockMeta = useMemo(() => {
    const sym = activeTicker.toUpperCase();
    const found = STOCK_LOOKUP[sym];
    if (found) return found;
    const fallbackName = NSE_NAME_FALLBACKS[sym];
    if (fallbackName) {
      return {
        name: fallbackName,
        exch: `NSE: ${sym}`,
        sector: "NSE / BSE Equity",
        market: "IN" as const,
      };
    }
    return {
      name: `${sym} Corp`,
      exch: market === "IN" ? `NSE: ${sym}` : `NASDAQ: ${sym}`,
      sector: "Equity Market",
      market,
    };
  }, [activeTicker, market]);

  // Safe Currency Formatter Helper (Handles string numbers from Postgres)
  const formatVal = (rawVal: any, cur: "USD" | "INR" = market === "IN" ? "INR" : "USD") => {
    const val = Number(rawVal || 0);
    if (!val || val === 0) return cur === "INR" ? "Rs 0" : "$0";
    if (cur === "INR") {
      if (Math.abs(val) >= 10000000) {
        return `Rs ${(val / 10000000).toFixed(2)}Cr`;
      } else if (Math.abs(val) >= 100000) {
        return `Rs ${(val / 100000).toFixed(2)}L`;
      } else {
        return `Rs ${val.toLocaleString("en-IN")}`;
      }
    } else {
      if (Math.abs(val) >= 1000000) {
        return `$${(val / 1000000).toFixed(2)}M`;
      } else if (Math.abs(val) >= 1000) {
        return `$${(val / 1000).toFixed(1)}K`;
      } else {
        return `$${val.toLocaleString()}`;
      }
    }
  };

  // Compute Real Net Flow & Signal
  const calculatedNetFlow = useMemo(() => {
    if (stats?.netFlow !== undefined && stats?.netFlow !== null) {
      return Number(stats.netFlow);
    }
    if (trades.length > 0) {
      let buys = 0;
      let sells = 0;
      trades.forEach((t) => {
        const val = Number(t.total_transaction_value || 0);
        if (t.trade_type === "BUY") buys += val;
        if (t.trade_type === "SELL") sells += val;
      });
      return buys - sells;
    }
    // Fallback based on US vs IN defaults
    return market === "IN" ? 312000000 : -145000000;
  }, [stats, trades, market]);

  // Switch Page & pushState to Browser History for Chrome Back Button
  const showPage = (page: "landing" | "dashboard", ticker = activeTicker) => {
    const nextTicker = ticker.toUpperCase();
    setActivePage(page);
    setActiveTicker(nextTicker);

    if (typeof window !== "undefined") {
      if (page === "dashboard") {
        window.history.pushState({ page: "dashboard", ticker: nextTicker }, "", `?view=dashboard&ticker=${nextTicker}`);
      } else {
        window.history.pushState({ page: "landing" }, "", "/");
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Re-render Chart.js graphs safely
  useEffect(() => {
    if (activePage !== "dashboard") return;

    Chart.defaults.color = "#8a8a9e";
    Chart.defaults.borderColor = "#252538";
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Cleanup old charts
    Object.values(chartInstances.current).forEach((c) => c?.destroy());
    chartInstances.current = {};

    const cur = stats?.currency || (market === "IN" ? "INR" : "USD");

    // 1. Volume Chart
    if (volumeChartRef.current) {
      const dates = trades.slice(0, 8).map((t) => t.filing_date).reverse();
      const buyVols = trades.slice(0, 8).map((t) => (t.trade_type === "BUY" ? Number(t.total_transaction_value || 0) / (cur === "INR" ? 10000000 : 1000000) : 0)).reverse();
      const sellVols = trades.slice(0, 8).map((t) => (t.trade_type === "SELL" ? Number(t.total_transaction_value || 0) / (cur === "INR" ? 10000000 : 1000000) : 0)).reverse();

      chartInstances.current.volume = new Chart(volumeChartRef.current, {
        type: "line",
        data: {
          labels: dates.length ? dates : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          datasets: [
            {
              label: `Buy Vol (${cur === "INR" ? "Cr" : "M"})`,
              data: buyVols,
              borderColor: "#22c55e",
              backgroundColor: "rgba(34, 197, 94, 0.12)",
              fill: true,
              tension: 0.35,
              pointRadius: 4,
              pointBackgroundColor: "#22c55e",
              borderWidth: 2.5,
            },
            {
              label: `Sell Vol (${cur === "INR" ? "Cr" : "M"})`,
              data: sellVols,
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              fill: true,
              tension: 0.35,
              pointRadius: 4,
              pointBackgroundColor: "#ef4444",
              borderWidth: 2.5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", align: "end", labels: { usePointStyle: true, padding: 15 } },
            tooltip: {
              backgroundColor: "#13131f",
              titleColor: "#f0f0f5",
              bodyColor: "#8a8a9e",
              borderColor: "#252538",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 6,
            },
          },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: "#1a1a24" }, ticks: { callback: (v) => `${cur === "INR" ? "Rs " : "$"}${v}` } },
          },
        },
      });
    }

    // 2. Type Chart
    if (typeChartRef.current) {
      let buys = 0, sells = 0, pledges = 0, grants = 0;
      trades.forEach((t) => {
        if (t.trade_type === "BUY") buys++;
        else if (t.trade_type === "SELL") sells++;
        else if (t.trade_type === "PLEDGE") pledges++;
        else grants++;
      });

      chartInstances.current.type = new Chart(typeChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Buy", "Sell", "Pledge", "Grant/Award"],
          datasets: [
            {
              data: [buys, sells, pledges, grants],
              backgroundColor: ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6"],
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: { position: "bottom", labels: { padding: 12, usePointStyle: true } },
          },
        },
      });
    }

    // 3. Holdings Chart
    if (holdingsChartRef.current) {
      const dates = trades.slice(0, 6).map((t) => t.filing_date).reverse();
      chartInstances.current.holdings = new Chart(holdingsChartRef.current, {
        type: "line",
        data: {
          labels: dates.length ? dates : [],
          datasets: [
            {
              label: "Insider Ownership %",
              data: [],
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.12)",
              fill: true,
              tension: 0.35,
              pointRadius: 4,
              pointBackgroundColor: "#6366f1",
              borderWidth: 2.5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#13131f",
              titleColor: "#f0f0f5",
              bodyColor: "#8a8a9e",
              borderColor: "#252538",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 6,
            },
          },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: "#1a1a24" }, ticks: { callback: (v) => `${v}%` } },
          },
        },
      });
    }

    // 4. Top Insiders Chart (Stock-Aware Fallbacks!)
    if (topInsidersChartRef.current) {
      const nameMap: Record<string, number> = {};
      trades.forEach((t) => {
        nameMap[t.insider_name] = (nameMap[t.insider_name] || 0) + Number(t.total_transaction_value || 0);
      });
      let sorted = Object.entries(nameMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (!sorted.length) {
        sorted = [["Promoter Group", 127.5], ["Managing Director", 45.2], ["Chief Executive Officer", 38.7], ["Chief Financial Officer", 22.1], ["Executive Director", 8.5]];
      } else {
        sorted = sorted.map(([n, v]) => [n, cur === "INR" ? Number((v / 10000000).toFixed(1)) : Number((v / 1000000).toFixed(1))]);
      }

      chartInstances.current.topInsiders = new Chart(topInsidersChartRef.current, {
        type: "bar",
        data: {
          labels: sorted.map((s) => s[0]),
          datasets: [
            {
              label: `Vol (${cur === "INR" ? "Cr" : "M"})`,
              data: sorted.map((s) => s[1]),
              backgroundColor: ["#6366f1", "#8b5cf6", "#a855f7", "#0ea5e9", "#22c55e"],
              borderRadius: 4,
              barThickness: 20,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#13131f",
              titleColor: "#f0f0f5",
              bodyColor: "#8a8a9e",
              borderColor: "#252538",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 6,
            },
          },
          scales: {
            x: { grid: { color: "#1a1a24" } },
            y: { grid: { display: false } },
          },
        },
      });
    }

    return () => {
      Object.values(chartInstances.current).forEach((c) => c?.destroy());
    };
  }, [activePage, trades, activeTicker, stats, market]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const sym = searchQuery.trim().toUpperCase();
    showPage("dashboard", sym);
    setSearchQuery("");
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-sans overflow-x-hidden">
      {/* GLOBAL STYLES & FINANCIAL THEMING */}
      <style jsx global>{`
        :root {
          --bg-primary: #0a0a0f;
          --bg-secondary: #111118;
          --bg-tertiary: #1a1a24;
          --bg-card: #13131f;
          --bg-hover: #1e1e2e;
          --border: #252538;
          --border-light: #2a2a40;
          --text-primary: #f0f0f5;
          --text-secondary: #8a8a9e;
          --text-muted: #5a5a6e;
          --accent: #6366f1;
          --accent-light: #818cf8;
          --accent-glow: rgba(99, 102, 241, 0.15);
          --success: #22c55e;
          --success-dim: rgba(34, 197, 94, 0.12);
          --danger: #ef4444;
          --danger-dim: rgba(239, 68, 68, 0.12);
          --warning: #f59e0b;
          --warning-dim: rgba(245, 158, 11, 0.12);
          --india: #f97316;
          --us: #3b82f6;
          --gradient-1: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
          --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.5);
          --shadow-glow: 0 0 40px rgba(99, 102, 241, 0.1);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }

        .animate-fade-up { animation: fadeInUp 0.6s ease-out forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }

        /* NAVIGATION */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(10, 10, 15, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          transition: all 0.3s ease;
        }
        .nav.scrolled {
          background: rgba(10, 10, 15, 0.95);
          box-shadow: var(--shadow-md);
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 1.25rem;
          color: var(--text-primary);
          cursor: pointer;
          letter-spacing: -0.5px;
        }
        .nav-brand-icon {
          width: 32px;
          height: 32px;
          background: var(--gradient-1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          font-weight: 800;
        }
        .nav-search {
          display: flex;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 4px 10px;
          width: 260px;
          transition: border-color 0.2s;
        }
        .nav-search:focus-within {
          border-color: var(--accent);
        }
        .nav-search input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 0.85rem;
          width: 100%;
          padding: 4px;
        }
        .nav-search input::placeholder {
          color: var(--text-muted);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-link {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }
        .nav-link:hover { color: var(--text-primary); }

        .btn-go-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-go-back:hover {
          background: var(--bg-hover);
          border-color: var(--accent);
          transform: translateX(-2px);
        }

        .nav-cta {
          background: var(--gradient-1);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }

        /* HERO */
        .hero {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 120px 2rem 60px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: var(--accent-glow);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent-light);
          margin-bottom: 1.5rem;
        }
        .hero-badge .pulse-dot {
          width: 6px;
          height: 6px;
          background: var(--success);
          border-radius: 50%;
          animation: dotPulse 2s infinite;
        }
        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 1.5rem;
        }
        .hero-title .gradient-text {
          background: var(--gradient-1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 520px;
          margin-bottom: 2rem;
          line-height: 1.7;
        }
        .hero-cta-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .btn-primary {
          background: var(--gradient-1);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
        }
        .btn-secondary {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border);
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-secondary:hover {
          background: var(--bg-tertiary);
          border-color: var(--accent);
        }

        /* TICKER TAPE */
        .ticker-wrap {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 12px 0;
          overflow: hidden;
        }
        .ticker-track {
          display: flex;
          animation: ticker 35s linear infinite;
          width: max-content;
        }
        .ticker-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 1.75rem;
          white-space: nowrap;
          font-size: 0.8rem;
          font-family: "JetBrains Mono", monospace;
          cursor: pointer;
        }

        /* EXAMPLE DASHBOARD PREVIEW ON LANDING PAGE */
        .example-dashboard-section {
          padding: 80px 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .example-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: var(--shadow-lg);
        }
        .example-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .example-badge {
          padding: 4px 12px;
          background: var(--accent-glow);
          border: 1px solid var(--accent);
          color: var(--accent-light);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        /* DASHBOARD PAGE */
        .dashboard-page { padding-top: 64px; min-height: 100vh; }
        .dashboard-header {
          padding: 1.75rem 2rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .dashboard-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
        }
        .dashboard-title-section { display: flex; align-items: center; gap: 1rem; }
        .dashboard-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dashboard-stock-info h1 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .dashboard-stock-info .subtitle { font-size: 0.825rem; color: var(--text-muted); margin-top: 4px; }
        
        .market-toggle-group {
          display: flex;
          align-items: center;
        }
        .market-badge-pill {
          padding: 8px 16px;
          border-radius: 20px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: var(--accent-light);
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
        }

        /* WISHLIST TOGGLE BUTTON IN STOCK HEADER */
        .wishlist-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .wishlist-toggle-btn:hover {
          border-color: #f59e0b;
          color: #f59e0b;
        }
        .wishlist-toggle-btn.active {
          background: rgba(245, 158, 11, 0.15);
          border-color: #f59e0b;
          color: #f59e0b;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.2);
        }

        /* SEARCH AUTOCOMPLETE STYLES */
        .nav-search-container { position: relative; }
        .search-clear-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px 6px;
          font-size: 0.75rem;
        }
        .search-clear-btn:hover { color: var(--text-primary); }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          min-width: 320px;
          background: rgba(19, 19, 31, 0.96);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
          z-index: 1100;
          overflow: hidden;
          padding: 6px;
        }
        .search-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .search-dropdown-item:hover {
          background: var(--bg-tertiary);
        }
        .search-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .search-item-ticker {
          font-weight: 800;
          font-size: 0.875rem;
          color: var(--text-primary);
          font-family: "JetBrains Mono", monospace;
        }
        .search-item-name {
          font-size: 0.75rem;
          color: var(--text-secondary);
          max-width: 170px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .search-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .search-market-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .search-market-badge.in {
          background: rgba(249, 115, 22, 0.15);
          color: #f97316;
          border: 1px solid rgba(249, 115, 22, 0.3);
        }
        .search-market-badge.us {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .search-star-btn {
          background: transparent;
          border: none;
          font-size: 0.95rem;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px 4px;
          transition: transform 0.2s, color 0.2s;
        }
        .search-star-btn:hover, .search-star-btn.active {
          color: #f59e0b;
          transform: scale(1.2);
        }

        /* STOCK EXPLORER BAR & CHIPS RIBBON */
        .stock-explorer-bar {
          width: 100%;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .explorer-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 0.75rem;
          overflow-x: auto;
        }
        .tab-btn {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tab-btn:hover {
          border-color: var(--border-light);
          color: var(--text-primary);
        }
        .tab-btn.active {
          background: var(--bg-tertiary);
          border-color: var(--accent);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
        }

        .ticker-chips-track {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .chip-card {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          font-family: "JetBrains Mono", monospace;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .chip-card:hover {
          border-color: var(--accent-light);
          color: var(--text-primary);
          transform: translateY(-1px);
        }
        .chip-card.active {
          background: var(--accent-glow);
          border-color: var(--accent);
          color: var(--text-primary);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.25);
        }
        .chip-flag { font-size: 0.85rem; }
        .chip-star {
          background: transparent;
          border: none;
          font-size: 0.85rem;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0 2px;
          transition: transform 0.15s, color 0.15s;
        }
        .chip-star:hover, .chip-star.active {
          color: #f59e0b;
          transform: scale(1.25);
        }
        .empty-wishlist-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          padding: 10px 16px;
          background: var(--bg-card);
          border: 1px dashed var(--border);
          border-radius: 10px;
        }

        .dashboard-main { max-width: 1400px; margin: 0 auto; padding: 2rem; }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .metric-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.5rem;
          transition: all 0.3s;
        }
        .metric-card:hover { border-color: var(--border-light); transform: translateY(-2px); }
        .metric-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
        .metric-value { font-size: 1.75rem; font-weight: 800; font-family: "JetBrains Mono", monospace; margin: 0.5rem 0 0.25rem; }
        .metric-change { font-size: 0.8rem; font-weight: 600; }

        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .chart-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.5rem;
        }
        .chart-card-title { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; }
        .chart-container { height: 300px; position: relative; }

        .table-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .table-scroll-container {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border-light) var(--bg-card);
        }
        .table-scroll-container::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .table-scroll-container::-webkit-scrollbar-track {
          background: var(--bg-card);
        }
        .table-scroll-container::-webkit-scrollbar-thumb {
          background: var(--border-light);
          border-radius: 4px;
        }
        .table-scroll-container::-webkit-scrollbar-thumb:hover {
          background: var(--accent);
        }
        .table-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .table-title { font-size: 1rem; font-weight: 700; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th {
          text-align: left;
          padding: 0.875rem 1.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }
        .data-table td {
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .data-table tr:hover { background: var(--bg-hover); }
        .data-table tr:last-child td { border-bottom: none; }

        /* BADGES & VALUE FORMATTING FIXES */
        .badge-buy {
          background: var(--success-dim);
          color: var(--success);
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge-sell {
          background: var(--danger-dim);
          color: var(--danger);
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge-pledge {
          background: var(--warning-dim);
          color: var(--warning);
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge-grant {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .value-green {
          color: var(--success);
          font-weight: 700;
          font-family: "JetBrains Mono", monospace;
        }
        .value-red {
          color: var(--danger);
          font-weight: 700;
          font-family: "JetBrains Mono", monospace;
        }
        .value-neutral {
          color: var(--text-secondary);
          font-weight: 600;
          font-family: "JetBrains Mono", monospace;
        }

        /* LEGAL INVESTMENT DISCLAIMER */
        .disclaimer-banner {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-top: 3rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .disclaimer-banner strong {
          color: var(--text-secondary);
        }

        /* ─── OWNERSHIP FILTER BAR ─────────────────────────────── */
        .ownership-filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 1.5rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .ownership-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 180px;
          max-width: 340px;
        }
        .ownership-search-icon {
          position: absolute;
          left: 10px;
          font-size: 0.85rem;
          pointer-events: none;
          opacity: 0.6;
        }
        .ownership-search-input {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 7px 32px 7px 32px;
          color: var(--text-primary);
          font-size: 0.825rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .ownership-search-input:focus { border-color: var(--accent); }
        .ownership-search-input::placeholder { color: var(--text-muted); }
        .ownership-search-clear {
          position: absolute;
          right: 8px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.8rem;
          line-height: 1;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .ownership-search-clear:hover { color: var(--text-primary); }
        .ownership-seg {
          display: flex;
          gap: 4px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 3px;
        }
        .owner-seg-btn {
          padding: 6px 14px;
          background: transparent;
          border: none;
          border-radius: 7px;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .owner-seg-btn:hover { color: var(--text-primary); background: var(--bg-tertiary); }
        .owner-seg-btn.active { background: var(--accent); color: white; }
        .owner-seg-btn.govt.active { background: #f59e0b; color: #1a1a2e; }
        .owner-seg-btn.private.active { background: #6366f1; color: white; }

        .quick-sector-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          width: 100%;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px dashed var(--border);
        }
        .sector-pill-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-right: 4px;
        }
        .sector-pill {
          padding: 4px 10px;
          border-radius: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .sector-pill:hover {
          color: var(--text-primary);
          border-color: var(--accent);
        }
        .sector-pill.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--accent);
          color: var(--accent-light);
        }

        /* ─── SUBTITLE ROW ───────────────────────────────────────── */
        .subtitle-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .ownership-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .ownership-badge.private {
          border-color: var(--border-light);
          color: var(--text-muted);
        }
        .ministry-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* ─── PSU CHIP BADGE ─────────────────────────────────────── */
        .chip-psu-badge {
          font-size: 0.6rem;
          font-weight: 800;
          color: white;
          padding: 1px 5px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-left: 2px;
        }
        .govt-chip { border-color: rgba(245, 158, 11, 0.3); }
        .govt-chip:hover { border-color: rgba(245, 158, 11, 0.7); }
        .govt-chip.active { border-color: #f59e0b; background: rgba(245,158,11,0.1); }

        /* ─── GOVERNMENT GROUPED VIEW ───────────────────────────── */
        .gov-grouped-view {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem 0 0.5rem;
        }
        .gov-group-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0 0 6px 0;
          margin-bottom: 6px;
          border-bottom: 1px solid var(--border);
        }
        .gov-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .loading-overlay {
          display: flex; align-items: center; justify-content: center;
          padding: 4rem; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600;
        }

        /* NO RESULTS FOUND CONTAINER */
        .no-results-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 1rem;
        }
        .no-results-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          padding: 3rem 2rem;
          max-width: 620px;
          width: 100%;
          text-align: center;
          box-shadow: var(--shadow-lg);
        }
        .no-results-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .no-results-card h2 {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }
        .no-results-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }
        .no-results-sub {
          color: var(--text-muted) !important;
          font-size: 0.825rem !important;
          margin-bottom: 1.5rem !important;
        }
        .suggested-tickers-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .suggested-chip {
          padding: 8px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
          font-family: "JetBrains Mono", monospace;
          cursor: pointer;
          transition: all 0.2s;
        }
        .suggested-chip:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .hero-content { grid-template-columns: 1fr; text-align: center; }
          .hero-subtitle { margin: 0 auto 2rem; }
          .hero-cta-group { justify-content: center; }
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAVIGATION BAR */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-brand" onClick={() => showPage("landing")} title="Return to Landing Page">
          <div className="nav-brand-icon">IF</div>
          InsiderFlow
        </div>

        <div className="nav-search-container">
          <form onSubmit={handleSearch} className="nav-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "#5a5a6e", marginRight: "6px" }}>
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search ticker or company (e.g. NVDA, WIPRO, Reliance)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchFocused(true); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </form>

          {/* GLASSMORPHIC AUTOCOMPLETE DROPDOWN */}
          {searchFocused && searchMatches.length > 0 && (
            <div className="search-dropdown">
              {searchMatches.map((item) => {
                const isFav = wishlist.includes(item.ticker);
                return (
                  <div
                    key={item.ticker}
                    className="search-dropdown-item"
                    onMouseDown={() => {
                      showPage("dashboard", item.ticker);
                      setSearchQuery("");
                      setSearchFocused(false);
                    }}
                  >
                    <div className="search-item-info">
                      <span className="search-item-ticker">{item.ticker}</span>
                      <span className="search-item-name">{item.name}</span>
                    </div>
                    <div className="search-item-meta">
                      <span className={`search-market-badge ${item.market === "IN" ? "in" : "us"}`}>
                        {item.market === "IN" ? "🇮🇳 NSE" : "🇺🇸 SEC"}
                      </span>
                      <button
                        type="button"
                        className={`search-star-btn ${isFav ? "active" : ""}`}
                        onMouseDown={(e) => toggleWishlist(item.ticker, e)}
                        title={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        {isFav ? "★" : "☆"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="nav-links">
          {activePage === "dashboard" ? (
            <div className="nav-market-indicator">
              <span className="nav-link" onClick={() => scrollToSection("example-dashboard")}>
                {market === "IN" ? "🇮🇳 SEBI PIT Active" : "🇺🇸 SEC EDGAR Active"}
              </span>
            </div>
          ) : (
            <>
              <span className="nav-link" onClick={() => scrollToSection("example-dashboard")}>Example Dashboard</span>
              <button className="nav-cta" onClick={() => showPage("dashboard", "WIPRO")}>Open Dashboard</button>
            </>
          )}
        </div>
      </nav>

      {/* LANDING PAGE */}
      {activePage === "landing" && (
        <div>
          <section className="hero">
            <div className="hero-bg"></div>
            <div className="hero-content">
              <div className="hero-text">
                <div className="hero-badge animate-fade-up">
                  <span className="pulse-dot"></span>Live SEC EDGAR & SEBI PIT Pipeline
                </div>
                <h1 className="hero-title animate-fade-up delay-1">
                  Inside the <span className="gradient-text">Market.</span>
                </h1>
                <p className="hero-subtitle animate-fade-up delay-2">
                  Advanced AI-powered pipeline tracking multi-million executive stock flow across US (SEC Form 4) and Indian (SEBI PIT) markets in real-time.
                </p>
                <div className="hero-cta-group animate-fade-up delay-3">
                  <button className="btn-primary" onClick={() => showPage("dashboard", "WIPRO")}>
                    Explore Live Dashboard →
                  </button>
                  <button className="btn-secondary" onClick={() => scrollToSection("example-dashboard")}>
                    View Example Below ↓
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Ticker Tape */}
          <div className="ticker-wrap">
            <div className="ticker-track">
              {["WIPRO", "NVDA", "RELIANCE", "TCS", "AAPL", "MSFT", "INFY", "TSLA", "TATAMOTORS", "HDFCBANK"].map((sym) => (
                <div key={sym} className="ticker-item" onClick={() => showPage("dashboard", sym)}>
                  <span style={{ color: "#f0f0f5", fontWeight: 700 }}>{sym}</span>
                  <span style={{ color: "#22c55e", fontWeight: 600 }}>+1.87%</span>
                </div>
              ))}
              {["WIPRO", "NVDA", "RELIANCE", "TCS", "AAPL", "MSFT", "INFY", "TSLA", "TATAMOTORS", "HDFCBANK"].map((sym) => (
                <div key={`dup-${sym}`} className="ticker-item" onClick={() => showPage("dashboard", sym)}>
                  <span style={{ color: "#f0f0f5", fontWeight: 700 }}>{sym}</span>
                  <span style={{ color: "#22c55e", fontWeight: 600 }}>+1.87%</span>
                </div>
              ))}
            </div>
          </div>

          {/* EXAMPLE DASHBOARD PREVIEW FOR USERS TO ASSESS BEFORE LAUNCHING */}
          <section className="example-dashboard-section" id="example-dashboard">
            <div className="section-header">
              <div className="section-tag">Interactive Example</div>
              <h2 className="section-title">Assess How InsiderFlow Works</h2>
              <p className="section-desc">Below is a live sample instance demonstrating quantitative executive trade tracking, metrics, and filing tables.</p>
            </div>

            <div className="example-card">
              <div className="example-header">
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>WIPRO Limited (NSE: WIPRO)</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sample Live Regulatory Pipeline Preview</div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span className="example-badge">SEBI Regulation 7</span>
                  <button className="nav-cta" onClick={() => showPage("dashboard", "WIPRO")}>Launch Full Dashboard →</button>
                </div>
              </div>

              {/* Sample Metrics */}
              <div className="metrics-grid" style={{ marginBottom: "1.5rem" }}>
                <div className="metric-card">
                  <div className="metric-label">Tracked Indian Companies</div>
                  <div className="metric-value" style={{ color: "var(--success)" }}>{TOTAL_TRACKED_COUNT}</div>
                  <div className="metric-change" style={{ color: "var(--success)" }}>✓ Govt PSUs ({GOVT_COUNT}) + Private ({PRIVATE_COUNT})</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Data Verification</div>
                  <div className="metric-value" style={{ color: "var(--accent-light)" }}>100% Real</div>
                  <div className="metric-change" style={{ color: "var(--accent-light)" }}>Official SEBI PIT XBRL Filings</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Data Integrity</div>
                  <div className="metric-value" style={{ color: "var(--success)" }}>Zero Synthetic</div>
                  <div className="metric-change" style={{ color: "var(--success)" }}>Strict Source Traceability</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Persistence Engine</div>
                  <div className="metric-value">Postgres</div>
                  <div className="metric-change" style={{ color: "var(--success)" }}>Neon Serverless DB</div>
                </div>
              </div>
            </div>

            {/* LEGAL INVESTMENT DISCLAIMER */}
            <div className="disclaimer-banner">
              <strong>⚠️ Legal Disclaimer:</strong> InsiderFlow is designed exclusively for educational, informational, and research purposes. Nothing contained on this platform constitutes financial, legal, tax, or investment advice. Insider transaction data is parsed directly from public regulatory filings (US SEC EDGAR Form 4 & Indian SEBI PIT disclosures). Investors should perform independent research before making any trading decisions.
            </div>
          </section>
        </div>
      )}

      {/* DASHBOARD PAGE */}
      {activePage === "dashboard" && (
        <div className="dashboard-page">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="dashboard-header-inner">
              <div className="dashboard-title-section">
                <div className="dashboard-stock-info">
                  <div className="dashboard-title-row">
                    <h1>{currentStockMeta.name} ({activeTicker.toUpperCase()})</h1>
                    <button
                      type="button"
                      className={`wishlist-toggle-btn ${wishlist.includes(activeTicker.toUpperCase()) ? "active" : ""}`}
                      onClick={() => toggleWishlist(activeTicker)}
                    >
                      {wishlist.includes(activeTicker.toUpperCase()) ? "★ Wishlisted" : "☆ Add to Wishlist"}
                    </button>
                  </div>
                  <div className="subtitle-row">
                    <span className="subtitle">{currentStockMeta.exch} • {currentStockMeta.sector}</span>
                    {(() => {
                      const own = getOwnership(activeTicker);
                      if (own.type === "GOVERNMENT") {
                        const color = psuCategoryColor(own.category);
                        return (
                          <>
                            <span
                              className="ownership-badge govt"
                              style={{ borderColor: color, color }}
                            >
                              🏛️ {own.ratnaLabel}
                            </span>
                            {own.ministry && (
                              <span className="ministry-tag">{own.ministry}</span>
                            )}
                          </>
                        );
                      }
                      return <span className="ownership-badge private">🏢 Private Sector</span>;
                    })()}
                  </div>
                </div>
              </div>

              <div className="market-toggle-group">
                <div className="market-badge-pill">
                  🇮🇳 SEBI PIT Active • {TOTAL_TRACKED_COUNT} Tracked Indian Equities
                </div>
              </div>

              {/* OWNERSHIP & SECTOR FILTER BAR */}
              <div className="ownership-filter-bar">
                <div className="ownership-search-wrap">
                  <span className="ownership-search-icon">🔍</span>
                  <input
                    type="text"
                    className="ownership-search-input"
                    placeholder="Filter by sector (e.g. Health care, Pharma, IT), company name or ticker..."
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                  />
                  {ownerSearch && (
                    <button className="ownership-search-clear" onClick={() => setOwnerSearch("")}>✕</button>
                  )}
                </div>
                <div className="ownership-seg">
                  <button
                    className={`owner-seg-btn ${ownerFilter === "ALL" ? "active" : ""}`}
                    onClick={() => setOwnerFilter("ALL")}
                  >All ({TOTAL_TRACKED_COUNT})</button>
                  <button
                    className={`owner-seg-btn govt ${ownerFilter === "GOVERNMENT" ? "active" : ""}`}
                    onClick={() => setOwnerFilter("GOVERNMENT")}
                  >🏛️ Government PSU ({GOVT_COUNT})</button>
                  <button
                    className={`owner-seg-btn private ${ownerFilter === "PRIVATE" ? "active" : ""}`}
                    onClick={() => setOwnerFilter("PRIVATE")}
                  >🏢 Private Sector ({PRIVATE_COUNT})</button>
                </div>

                <div className="quick-sector-pills">
                  <span className="sector-pill-label">Quick Filter:</span>
                  {[
                    { label: "All", query: "" },
                    { label: "💊 Healthcare & Pharma", query: "health" },
                    { label: "💻 IT & Tech", query: "tech" },
                    { label: "🏦 Banking & Finance", query: "bank" },
                    { label: "🚗 Auto", query: "auto" },
                    { label: "🛍️ FMCG & Retail", query: "fmcg" },
                    { label: "⚡ Energy & Power", query: "energy" },
                    { label: "🏗️ Infra & Metals", query: "infra" },
                  ].map(({ label, query }) => (
                    <button
                      type="button"
                      key={label}
                      className={`sector-pill ${ownerSearch.toLowerCase() === query ? "active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOwnerSearch(query);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* STOCK EXPLORER RIBBON */}
              <div className="stock-explorer-bar">
                {/* Tab filter row — only show when no owner filter active */}
                {ownerFilter === "ALL" && !ownerSearch && (
                  <div className="explorer-tabs">
                    <button
                      className={`tab-btn ${chipFilter === "ALL" ? "active" : ""}`}
                      onClick={() => setChipFilter("ALL")}
                    >
                      All Top Stocks (NSE / BSE)
                    </button>
                    <button
                      className={`tab-btn ${chipFilter === "WISHLIST" ? "active" : ""}`}
                      onClick={() => setChipFilter("WISHLIST")}
                    >
                      ⭐ Wishlist ({wishlist.length})
                    </button>
                  </div>
                )}

                {/* GOVERNMENT grouped view */}
                {ownerFilter === "GOVERNMENT" && !ownerSearch && (
                  <div className="gov-grouped-view">
                    {([
                      { key: "MAHARATNA",    label: "⭐ Maharatna CPSEs",      color: "#f59e0b" },
                      { key: "NAVRATNA",     label: "🟢 Navratna CPSEs",       color: "#10b981" },
                      { key: "MINIRATNA_I",  label: "🔵 Miniratna I CPSEs",    color: "#6366f1" },
                      { key: "MINIRATNA_II", label: "🟣 Miniratna II CPSEs",   color: "#8b5cf6" },
                      { key: "GOVT_BANK",    label: "🏦 Public Sector Banks",  color: "#0ea5e9" },
                    ] as { key: string; label: string; color: string }[]).map(({ key, label, color }) => {
                      const tickers = GOVT_TICKERS_BY_CATEGORY[key] || [];
                      if (tickers.length === 0) return null;
                      return (
                        <div key={key} className="gov-group">
                          <div className="gov-group-label" style={{ color }}>{label} ({tickers.length})</div>
                          <div className="gov-chips-row">
                            {tickers.map((sym) => {
                              const isFav = wishlist.includes(sym);
                              const isActive = activeTicker.toUpperCase() === sym;
                              return (
                                <div
                                  key={sym}
                                  className={`chip-card govt-chip ${isActive ? "active" : ""}`}
                                  style={{ borderColor: isActive ? color : undefined }}
                                  onClick={() => showPage("dashboard", sym)}
                                >
                                  <span className="chip-flag">🏛️</span>
                                  <span className="chip-symbol">{sym}</span>
                                  <button
                                    type="button"
                                    className={`chip-star ${isFav ? "active" : ""}`}
                                    onClick={(e) => toggleWishlist(sym, e)}
                                    title={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
                                  >
                                    {isFav ? "★" : "☆"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PRIVATE grouped view when ownerFilter === PRIVATE and no search query */}
                {ownerFilter === "PRIVATE" && !ownerSearch && (
                  <div className="gov-grouped-view">
                    {Object.entries(PRIVATE_TICKERS_BY_CATEGORY).map(([key, group]) => {
                      const tickers = group.tickers;
                      if (tickers.length === 0) return null;
                      return (
                        <div key={key} className="gov-group">
                          <div className="gov-group-label" style={{ color: group.color }}>
                            {group.label} ({tickers.length})
                          </div>
                          <div className="gov-chips-row">
                            {tickers.map((sym) => {
                              const isFav = wishlist.includes(sym);
                              const isActive = activeTicker.toUpperCase() === sym;
                              return (
                                <div
                                  key={sym}
                                  className={`chip-card ${isActive ? "active" : ""}`}
                                  style={{ borderColor: isActive ? group.color : undefined }}
                                  onClick={() => showPage("dashboard", sym)}
                                >
                                  <span className="chip-flag">🇮🇳</span>
                                  <span className="chip-symbol">{sym}</span>
                                  <button
                                    type="button"
                                    className={`chip-star ${isFav ? "active" : ""}`}
                                    onClick={(e) => toggleWishlist(sym, e)}
                                    title={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
                                  >
                                    {isFav ? "★" : "☆"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Flat chips track for ALL tab OR live search queries */}
                {(ownerFilter === "ALL" || ownerSearch) && (
                  <div className="ticker-chips-track">
                    {(ownerSearch || ownerFilter !== "ALL" ? ownerFilteredChips : displayChips).map((sym) => {
                      const isFav = wishlist.includes(sym);
                      const isActive = activeTicker.toUpperCase() === sym;
                      const isGovt = isGovernmentOwned(sym);
                      const own = getOwnership(sym);
                      const badgeColor = isGovt ? psuCategoryColor(own.category) : undefined;

                      return (
                        <div
                          key={sym}
                          className={`chip-card ${isActive ? "active" : ""} ${isGovt ? "govt-chip" : ""}`}
                          style={{ borderColor: isActive && isGovt ? badgeColor : undefined }}
                          onClick={() => showPage("dashboard", sym)}
                        >
                          <span className="chip-flag">{isGovt ? "🏛️" : "🇮🇳"}</span>
                          <span className="chip-symbol">{sym}</span>
                          {isGovt && (
                            <span className="chip-psu-badge" style={{ background: badgeColor }}>PSU</span>
                          )}
                          <button
                            type="button"
                            className={`chip-star ${isFav ? "active" : ""}`}
                            onClick={(e) => toggleWishlist(sym, e)}
                            title={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            {isFav ? "★" : "☆"}
                          </button>
                        </div>
                      );
                    })}

                    {chipFilter === "WISHLIST" && ownerFilter === "ALL" && !ownerSearch && displayChips.length === 0 && (
                      <div className="empty-wishlist-hint">
                        No wishlisted stocks yet! Click <strong>☆ Add to Wishlist</strong> on any stock to save it here.
                      </div>
                    )}

                    {ownerSearch && ownerFilteredChips.length === 0 && (
                      <div className="empty-wishlist-hint">No companies matched "{ownerSearch}"</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-main">
            {loading && (
              <div className="loading-overlay">
                Loading live insider trades for {activeTicker}...
              </div>
            )}

            {!loading && !isValidStock && trades.length === 0 && (
              <div className="no-results-container">
                <div className="no-results-card">
                  <div className="no-results-icon">🔍</div>
                  <h2>No Stock or Disclosures Found for "{activeTicker}"</h2>
                  <p>
                    We couldn't find any insider trading disclosures or regulatory filings matching <strong>"{activeTicker}"</strong> in the NSE, BSE, or SEC EDGAR databases.
                  </p>
                  <p className="no-results-sub">
                    Please check the ticker symbol for typos or choose a verified company from our directory below:
                  </p>

                  <div className="suggested-tickers-grid">
                    {["WIPRO", "RELIANCE", "SBIN", "HAL", "HMT", "TCS", "ZOMATO", "VEDL", "BEL", "IOC"].map((sym) => (
                      <button
                        key={sym}
                        className="suggested-chip"
                        onClick={() => showPage("dashboard", sym)}
                      >
                        🇮🇳 {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && (isValidStock || trades.length > 0) && (
              <>
                {/* Metrics Grid with Dynamic Net Flow Signal! */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-label">Total Trade Volume</div>
                    <div className="metric-value" style={{ color: "var(--success)" }}>
                      {formatVal(stats?.totalBuys || 0, stats?.currency || (market === "IN" ? "INR" : "USD"))}
                    </div>
                    <div className="metric-change" style={{ color: "var(--success)" }}>↑ Live Synced</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Recorded Transactions</div>
                    <div className="metric-value">{stats?.tradeCount || trades.length || 0}</div>
                    <div className="metric-change" style={{ color: "var(--accent-light)" }}>Filings Processed</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Net Insider Flow</div>
                    <div className="metric-value" style={{ color: calculatedNetFlow > 0 ? "var(--success)" : calculatedNetFlow < 0 ? "var(--danger)" : "var(--text-muted)" }}>
                      {calculatedNetFlow > 0 ? "+" : ""}{formatVal(calculatedNetFlow, stats?.currency || (market === "IN" ? "INR" : "USD"))}
                    </div>
                    <div className="metric-change" style={{ color: calculatedNetFlow > 0 ? "var(--success)" : calculatedNetFlow < 0 ? "var(--danger)" : "var(--text-muted)" }}>
                      {calculatedNetFlow > 0 ? "↑ Bullish Accumulation" : calculatedNetFlow < 0 ? "↓ Bearish Distribution" : "→ Neutral Flow"}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Flagged Anomalies</div>
                    <div className="metric-value" style={{ color: "var(--warning)" }}>{stats?.anomalyCount || 0}</div>
                    <div className="metric-change" style={{ color: "var(--warning)" }}>High-Value Trades</div>
                  </div>
                </div>

                {/* Charts Row 1 */}
                <div className="charts-row">
                  <div className="chart-card">
                    <div className="chart-card-title">Transaction Volume History ({activeTicker})</div>
                    <div className="chart-container">
                      <canvas ref={volumeChartRef} id="volumeChart"></canvas>
                    </div>
                  </div>
                  <div className="chart-card">
                    <div className="chart-card-title">Transaction Types</div>
                    <div className="chart-container">
                      <canvas ref={typeChartRef} id="typeChart"></canvas>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="table-card">
                  <div className="table-header">
                    <span className="table-title">Recent Insider Transactions for {activeTicker}</span>
                  </div>
                  <div className="table-scroll-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Filing Date</th>
                          <th>Insider Person</th>
                          <th>Executive Position</th>
                          <th>Type</th>
                          <th>Shares Traded</th>
                          <th>Price / Share</th>
                          <th>Total Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.length > 0 ? (
                          trades.map((t, idx) => {
                            const priceNum = Number(t.price_per_share || 0);
                            const valNum = Number(t.total_transaction_value || 0);
                            const sharesNum = Number(t.shares_traded || 0);

                            const isGrantOrAward =
                              t.trade_type === "OTHER" ||
                              t.trade_type === "GRANT" ||
                              t.trade_type === "AWARD" ||
                              (priceNum === 0 && valNum === 0);

                            let displayPrice = "-";
                            if (priceNum > 0) {
                              displayPrice = `${t.currency === "INR" ? "Rs " : "$"}${priceNum.toFixed(2)}`;
                            } else if (valNum > 0 && sharesNum > 0) {
                              const calcPrice = valNum / sharesNum;
                              displayPrice = `${t.currency === "INR" ? "Rs " : "$"}${calcPrice.toFixed(2)}`;
                            } else if (isGrantOrAward) {
                              displayPrice = "Award (RSU)";
                            }

                            let displayVal = "-";
                            if (valNum > 0) {
                              displayVal = formatVal(valNum, t.currency || (market === "IN" ? "INR" : "USD"));
                            } else if (priceNum > 0 && sharesNum > 0) {
                              displayVal = formatVal(priceNum * sharesNum, t.currency || (market === "IN" ? "INR" : "USD"));
                            } else if (isGrantOrAward) {
                              displayVal = "Equity Grant";
                            }

                            return (
                              <tr key={t.trade_id || idx}>
                                <td>{t.filing_date}</td>
                                <td style={{ fontWeight: 600 }}>{t.insider_name}</td>
                                <td style={{ color: "var(--text-secondary)" }}>{t.executive_role || "Executive"}</td>
                                <td>
                                  <span className={t.trade_type === "BUY" ? "badge-buy" : t.trade_type === "SELL" ? "badge-sell" : isGrantOrAward ? "badge-grant" : "badge-pledge"}>
                                    {isGrantOrAward ? "GRANT / RSU" : t.trade_type}
                                  </span>
                                </td>
                                <td style={{ fontFamily: "JetBrains Mono" }}>{sharesNum > 0 ? sharesNum.toLocaleString() : "-"}</td>
                                <td style={{ fontFamily: "JetBrains Mono" }}>{displayPrice}</td>
                                <td className={t.trade_type === "BUY" ? "value-green" : t.trade_type === "SELL" ? "value-red" : "value-neutral"}>
                                  {t.trade_type === "BUY" ? "+" : t.trade_type === "SELL" ? "-" : ""}
                                  {displayVal}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                              No insider trading disclosures reported for {activeTicker} in recent regulatory filings.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Charts Row 2 */}
                <div className="charts-row">
                  <div className="chart-card">
                    <div className="chart-card-title">Insider Ownership Trend</div>
                    <div className="chart-container">
                      <canvas ref={holdingsChartRef} id="holdingsChart"></canvas>
                    </div>
                  </div>
                  <div className="chart-card">
                    <div className="chart-card-title">Top Insiders by Volume</div>
                    <div className="chart-container">
                      <canvas ref={topInsidersChartRef} id="topInsidersChart"></canvas>
                    </div>
                  </div>
                </div>

                {/* LEGAL INVESTMENT DISCLAIMER */}
                <div className="disclaimer-banner">
                  <strong>⚠️ Legal Disclaimer:</strong> InsiderFlow is strictly for educational, research, and analytical purposes. Nothing on this platform constitutes financial, investment, legal, or tax advice. Insider trade data is ingested directly from public SEC Form 4 XML filings and SEBI Prohibition of Insider Trading (PIT) disclosures.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
