import { execFile } from "child_process";
import path from "path";
import util from "util";

const execFilePromise = util.promisify(execFile);

export interface NsePitRecord {
  symbol: string;
  acquirerName: string;
  personCategory: string;
  secType: string;
  secVal: number;
  secAcq: number;
  tdpVal: number;
  action: string;
  date: string;
  xbrl?: string | null;
}

// Map Ticker Aliases to Canonical Ticker
export const TICKER_ALIASES: Record<string, string> = {
  SBI: "SBIN",
  SBIN: "SBIN",
  TATA: "TATAMOTORS",
  TATAMOTOR: "TATAMOTORS",
  TATAMOTORS: "TATAMOTORS",
  HDFC: "HDFCBANK",
  HDFCBANK: "HDFCBANK",
  ICICI: "ICICIBANK",
  ICICIBANK: "ICICIBANK",
  KOTAK: "KOTAKBANK",
  KOTAKBANK: "KOTAKBANK",
  BHARTI: "BHARTIARTL",
  BHARTIARTL: "BHARTIARTL",
  ADANI: "ADANIENT",
  ADANIENT: "ADANIENT",
  BAJAJ: "BAJFINANCE",
  BAJFINANCE: "BAJFINANCE",
  PAYTM: "PAYTM",
  ONE97: "PAYTM",
  POLICYBZR: "POLICYBZR",
  PBFINTECH: "POLICYBZR",
  NYKAA: "NYKAA",
  LARSEN: "LT",
  LT: "LT",
  INDIANOIL: "IOC",
  IOC: "IOC",
  LIC: "LICI",
  LICI: "LICI",
};

export async function fetchNseInsiderTrades(symbol: string): Promise<NsePitRecord[]> {
  const cleanSymbol = symbol.trim().toUpperCase();
  const canonicalSymbol = TICKER_ALIASES[cleanSymbol] || cleanSymbol;

  const scriptPath = path.join(process.cwd(), "scripts", "fetch_nse_insider.py");
  
  // Use standard environment python executable
  const pythonExec = process.platform === "win32" ? "python" : "python3";

  try {
    const { stdout, stderr } = await execFilePromise(pythonExec, [scriptPath, canonicalSymbol], {
      timeout: 20000,
      env: { ...process.env },
    });

    if (stderr) {
      console.warn(`fetch_nse_insider.py stderr for ${canonicalSymbol}:`, stderr);
    }

    if (!stdout || !stdout.trim()) {
      return [];
    }

    const res = JSON.parse(stdout.trim());
    if (res.error) {
      console.warn(`fetch_nse_insider.py returned error for ${canonicalSymbol}:`, res.error);
      return [];
    }

    const rawRecords: any[] = res.records || [];

    return rawRecords.map((item) => {
      const rawName = item.acqName || item.acquirerName || item.personName || "Unattributed";
      const rawRole = item.personCategory || item.secType || "Designated Person";
      const secAcq = Number(item.secAcq || item.buyQuantity || item.sellquantity || 0);
      const secVal = Number(item.secVal || item.buyValue || item.sellValue || item.tdpVal || 0);
      const rawAction = item.tdpTransactionType || item.acqMode || "Transaction";
      const rawDate = item.date || item.intimDt || item.acqtoDt || "";
      const xbrlUrl = item.xbrl || null;

      return {
        symbol: canonicalSymbol,
        acquirerName: rawName.trim(),
        personCategory: rawRole.trim(),
        secType: item.secType || "Equity Shares",
        secVal,
        secAcq,
        tdpVal: secVal,
        action: rawAction.trim(),
        date: rawDate.trim(),
        xbrl: xbrlUrl,
      };
    });

  } catch (err) {
    console.warn(`Local Python execution unavailable for ${canonicalSymbol} (will read from Neon Postgres):`, err);
    return [];
  }
}
