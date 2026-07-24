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
    source_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_transaction UNIQUE (ticker, filing_date, insider_name, shares_traded, price_per_share)
);

CREATE INDEX IF NOT EXISTS idx_insider_trades_ticker ON insider_trades (ticker);
CREATE INDEX IF NOT EXISTS idx_insider_trades_filing_date ON insider_trades (filing_date DESC);
