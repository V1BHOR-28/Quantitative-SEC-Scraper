# 🇮🇳 Quantitative Insider Trading & SEBI PIT Anomaly Tracker (NSE & BSE)

> Next.js web application for tracking SEBI PIT insider trading, executive capital flow, and MCA ownership structures across 7,800+ listed Indian equities on NSE and BSE.

[![Live Application](https://img.shields.io/badge/Live_App-Vercel-brightgreen?style=for-the-badge&logo=vercel)](https://web-steel-ten-92.vercel.app)

## Local Development

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Key APIs

- `GET /api/companies?q=WIPRO` - Search NSE/BSE tickers
- `GET /api/trades/[ticker]` - Live SEBI PIT insider trades & capital flow stats
- `POST /api/scrape` - Ingest latest SEBI regulatory filings
- `GET /api/cron/refresh` - Vercel cron background refresh service
