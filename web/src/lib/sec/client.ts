const SEC_BASE = "https://www.sec.gov";
const DATA_BASE = "https://data.sec.gov";

function getUserAgent(): string {
  return (
    process.env.SEC_USER_AGENT ??
    "SECInsiderDashboard/1.0 (contact@example.com)"
  );
}

function getHeaders(): HeadersInit {
  return {
    "User-Agent": getUserAgent(),
    Accept: "application/json,text/plain,*/*",
  };
}

export async function secFetch(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`SEC request failed (${response.status}): ${url}`);
  }

  return response;
}

export async function fetchCompanyTickers(): Promise<
  Record<string, { cik_str: number; ticker: string; title: string }>
> {
  const response = await secFetch(`${SEC_BASE}/files/company_tickers.json`);
  return response.json();
}

export async function fetchSubmissions(cik: string) {
  const response = await secFetch(`${DATA_BASE}/submissions/CIK${cik}.json`);
  return response.json();
}

export async function fetchFilingDocument(
  cik: string,
  accessionNumber: string
): Promise<string> {
  const cleanAccession = accessionNumber.replace(/-/g, "");
  const url = `${SEC_BASE}/Archives/edgar/data/${cik}/${cleanAccession}/${accessionNumber}.txt`;
  const response = await secFetch(url);
  return response.text();
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
