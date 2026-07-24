import os
import sys
import argparse
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sync_nse_to_postgres")

# Tickers to sync by default if no arguments provided
DEFAULT_TICKERS = [
    "SBIN", "INFY", "RELIANCE", "TCS", "TATAMOTORS",
    "HDFCBANK", "ICICIBANK", "WIPRO", "ZOMATO", "SUNPHARMA",
    "HAL", "BEL", "IOC", "NTPC", "ONGC", "LT", "ITC"
]

def parse_date(date_str):
    if not date_str:
        return datetime.now().strftime("%Y-%m-%d")
    clean_str = str(date_str).strip()
    
    # Check if already YYYY-MM-DD
    if len(clean_str) >= 10 and clean_str[4] == '-' and clean_str[7] == '-':
        return clean_str[:10]
        
    formats = [
        "%d-%b-%Y %H:%M", "%d-%b-%Y", "%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(clean_str, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
            
    return clean_str[:10]

def safe_float(val):
    if not val:
        return 0.0
    s = str(val).strip().replace(',', '')
    if s == '-' or not s:
        return 0.0
    try:
        return float(s)
    except (ValueError, TypeError):
        return 0.0

def safe_int(val):
    if not val:
        return 0
    s = str(val).strip().replace(',', '')
    if s == '-' or not s:
        return 0
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return 0

def main():
    parser = argparse.ArgumentParser(description="Sync official live SEBI PIT disclosures from pnsea directly into Neon Postgres")
    parser.add_argument("tickers", nargs="*", help="Tickers to sync (default: popular Indian tickers)")
    args = parser.parse_args()

    tickers = [t.strip().upper() for t in args.tickers] if args.tickers else DEFAULT_TICKERS

    db_url = os.getenv("DATABASE_URL_UNPOOLED") or os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("DATABASE_URL environment variable is missing!")
        sys.exit(1)

    try:
        import psycopg2
        from pnsea import NSE
    except ImportError as e:
        logger.error(f"Missing required Python libraries: {e}")
        sys.exit(1)

    logger.info(f"Connecting to Neon Postgres...")
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()

    # Ensure insider_trades table, company_name & source_url columns exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS insider_trades (
            trade_id SERIAL PRIMARY KEY,
            ticker VARCHAR(20) NOT NULL,
            company_name VARCHAR(255),
            filing_date DATE NOT NULL,
            insider_name VARCHAR(255) NOT NULL,
            executive_role VARCHAR(100),
            trade_type VARCHAR(50),
            shares_traded INT,
            price_per_share NUMERIC(10, 2),
            total_transaction_value NUMERIC(15, 2),
            market VARCHAR(5) DEFAULT 'US',
            currency VARCHAR(5) DEFAULT 'USD',
            source_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT unique_transaction UNIQUE (ticker, filing_date, insider_name, shares_traded, price_per_share)
        );
        ALTER TABLE insider_trades ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
        ALTER TABLE insider_trades ADD COLUMN IF NOT EXISTS source_url TEXT;
        ALTER TABLE insider_trades ADD COLUMN IF NOT EXISTS market VARCHAR(5) DEFAULT 'US';
        ALTER TABLE insider_trades ADD COLUMN IF NOT EXISTS currency VARCHAR(5) DEFAULT 'USD';
    """)
    conn.commit()

    nse = NSE()

    total_inserted_all = 0

    for symbol in tickers:
        logger.info(f"Fetching live SEBI PIT filings for ticker: {symbol}...")
        try:
            df = nse.insider.insider_data(symbol)
            if df is None or (hasattr(df, "empty") and df.empty):
                logger.info(f"[{symbol}] No records returned by pnsea (honest empty state). Clearing DB table for {symbol}.")
                cursor.execute("DELETE FROM insider_trades WHERE ticker = %s", (symbol,))
                conn.commit()
                continue

            records = df.to_dict(orient="records") if hasattr(df, "to_dict") else list(df)
            
            # Clear old rows for this ticker to ensure fresh real data replace any stale data
            cursor.execute("DELETE FROM insider_trades WHERE ticker = %s", (symbol,))
            
            inserted_count = 0
            for r in records:
                company_name = str(r.get("company") or r.get("companyName") or symbol).strip()
                name = str(r.get("acqName") or r.get("acquirerName") or r.get("personName") or "Unattributed").strip()
                role = str(r.get("personCategory") or r.get("secType") or "Designated Person").strip()
                
                sec_acq = safe_int(r.get("secAcq") or r.get("buyQuantity") or r.get("sellquantity"))
                sec_val = safe_float(r.get("secVal") or r.get("buyValue") or r.get("sellValue") or r.get("tdpVal"))
                price_per_share = round(sec_val / sec_acq, 2) if sec_acq > 0 else 0.0
                
                action_str = str(r.get("tdpTransactionType") or r.get("acqMode") or "").lower()
                is_sell = "sale" in action_str or "sell" in action_str or "disposal" in action_str
                trade_type = "SELL" if is_sell else "BUY"
                
                raw_date = r.get("date") or r.get("intimDt") or r.get("acqtoDt")
                filing_date = parse_date(raw_date)
                source_url = r.get("xbrl") or None

                cursor.execute("""
                    INSERT INTO insider_trades (
                        ticker, company_name, filing_date, insider_name, executive_role,
                        trade_type, shares_traded, price_per_share, total_transaction_value,
                        market, currency, source_url
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT ON CONSTRAINT unique_transaction DO NOTHING
                    RETURNING trade_id
                """, (
                    symbol, company_name, filing_date, name, role,
                    trade_type, sec_acq, price_per_share, sec_val,
                    'IN', 'INR', source_url
                ))
                
                if cursor.fetchone():
                    inserted_count += 1

            conn.commit()
            total_inserted_all += inserted_count
            logger.info(f"[SUCCESS] {symbol}: Inserted {inserted_count} real records into Neon Postgres with company name '{company_name}'.")

        except Exception as ex:
            logger.error(f"Error processing {symbol}: {ex}", exc_info=True)
            conn.rollback()

    cursor.close()
    conn.close()
    logger.info(f"Sync complete. Total real records inserted across tickers: {total_inserted_all}")

if __name__ == "__main__":
    main()
