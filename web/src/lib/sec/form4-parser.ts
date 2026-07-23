import type { ParsedTrade } from "../types";

function extractTag(text: string, tag: string): string | null {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : null;
}

function extractBlock(text: string, tag: string): string | null {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1] : null;
}

function extractValue(block: string | null): number | null {
  if (!block) return null;
  const match = block.match(/<value>([\s\S]*?)<\/value>/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1].trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseForm4Document(
  docText: string,
  filingDate: string
): ParsedTrade[] {
  const trades: ParsedTrade[] = [];
  const name = extractTag(docText, "rptOwnerName");
  if (!name) return trades;

  const officerRaw = extractTag(docText, "isOfficer");
  const executiveRole =
    officerRaw && ["1", "true"].includes(officerRaw) ? "Officer" : "Director";

  const transactionBlocks =
    docText.match(/<nonDerivativeTransaction>[\s\S]*?<\/nonDerivativeTransaction>/g) ??
    [];

  const blocks =
    transactionBlocks.length > 0
      ? transactionBlocks
      : [docText];

  for (const block of blocks) {
    const code = extractTag(block, "transactionCode") ?? "U";
    const sharesBlock = extractBlock(block, "transactionShares");
    const priceBlock = extractBlock(block, "transactionPricePerShare");

    const shares = extractValue(sharesBlock);
    if (shares === null) continue;

    const price = extractValue(priceBlock) ?? 0;
    const tradeType =
      code === "P" ? "BUY" : code === "S" ? "SELL" : "Other";

    trades.push({
      insiderName: name,
      executiveRole,
      tradeType,
      sharesTraded: Math.trunc(shares),
      pricePerShare: price,
      totalTransactionValue: shares * price,
      filingDate,
    });
  }

  return trades;
}
