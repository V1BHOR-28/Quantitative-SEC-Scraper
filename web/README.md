# SEC Insider Trading Dashboard

Live SEC Form 4 insider trading dashboard built with **Next.js**, **Neon Postgres**, and deployed on **Vercel**.

## Features

- Search any public company ticker
- Ingest recent SEC Form 4 filings on demand
- Store deduplicated trades in Neon Postgres
- BI-style dashboard with KPI cards, charts, leaderboard, and anomaly table

## Stack

- Next.js App Router
- Neon Postgres (`@neondatabase/serverless`)
- Recharts
- Vercel deployment

## Local development

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Set these environment variables:

- `DATABASE_URL` - Neon pooled connection string
- `SEC_USER_AGENT` - Your name and email (SEC requirement)

## Deploy to Vercel

1. Import the `web` directory as a Vercel project
2. Add `DATABASE_URL` and `SEC_USER_AGENT` in project settings
3. Deploy

## API routes

- `GET /api/companies?q=NV` - search tickers
- `GET /api/trades/[ticker]` - dashboard data
- `POST /api/scrape` - ingest SEC filings for a ticker
- `GET /api/cron/refresh` - refresh popular tickers (Vercel cron)

## Legacy Python scraper

The original script is preserved at `../sec_scraper.py`.
