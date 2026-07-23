import sys
import argparse
import json
import logging

# Configure logging to stderr ONLY
logging.basicConfig(stream=sys.stderr, level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("fetch_nse_insider")

def main():
    parser = argparse.ArgumentParser(description="Fetch official live SEBI PIT insider disclosures via pnsea")
    parser.add_argument("symbol", help="NSE Stock Ticker Symbol (e.g. SBIN, INFY, RELIANCE)")
    parser.add_argument("--from-date", help="From date (DD-MM-YYYY)", default=None)
    parser.add_argument("--to-date", help="To date (DD-MM-YYYY)", default=None)

    args = parser.parse_args()
    symbol = args.symbol.strip().upper()

    try:
        from pnsea import NSE
    except ImportError as e:
        logger.error(f"Failed to import pnsea: {e}")
        out = {"records": [], "error": f"Import error: {str(e)}"}
        sys.stdout.write(json.dumps(out))
        sys.exit(0)

    logger.info(f"Fetching SEBI PIT insider trading disclosures for ticker: {symbol} (from: {args.from_date}, to: {args.to_date})")

    try:
        nse = NSE()
        kwargs = {}
        if args.from_date:
            kwargs["from_date"] = args.from_date
        if args.to_date:
            kwargs["to_date"] = args.to_date

        df = nse.insider.insider_data(symbol, **kwargs)

        if df is None or (hasattr(df, "empty") and df.empty):
            logger.info(f"No records found for symbol {symbol}")
            out = {"records": [], "error": None}
            sys.stdout.write(json.dumps(out))
            sys.exit(0)

        # Convert DataFrame or list of dicts to Python records
        if hasattr(df, "to_dict"):
            records = df.to_dict(orient="records")
        elif isinstance(df, list):
            records = df
        else:
            records = []

        # Sanitize NaN or float infinity values for standard JSON
        sanitized_records = []
        for r in records:
            clean_r = {}
            for k, v in r.items():
                if v is None or (isinstance(v, float) and (v != v or v == float('inf') or v == float('-inf'))):
                    clean_r[k] = None
                else:
                    clean_r[k] = str(v) if not isinstance(v, (int, float, bool, str)) else v
            sanitized_records.append(clean_r)

        logger.info(f"Successfully fetched {len(sanitized_records)} records for ticker {symbol}")
        # Print JSON output to STDOUT ONLY
        sys.stdout.write(json.dumps({"records": sanitized_records, "error": None}))
        sys.exit(0)

    except Exception as ex:
        logger.error(f"Error fetching data for ticker {symbol}: {ex}", exc_info=True)
        out = {"records": [], "error": str(ex)}
        sys.stdout.write(json.dumps(out))
        sys.exit(0)

if __name__ == "__main__":
    main()
