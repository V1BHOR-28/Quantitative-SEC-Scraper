# 📈 SEC Form 4 Quantitative Anomaly Tracker

> An automated Data Engineering ETL pipeline that scrapes live US government API endpoints to track executive insider trading, secured in a Serverless Neon Postgres database, and modeled into a Wall Street-grade dashboard.

## 🚀 Overview
Tracking the buying and selling habits of C-suite executives provides invaluable macroeconomic sentiment analysis. This project is a complete end-to-end data pipeline built on Next.js. It automatically ingests raw SEC Form 4 regulatory filings, cleans dirty XML schemas, enforces data integrity, and highlights multi-million-dollar transactions using a sleek, premium business intelligence dashboard.

## 🛠 Tech Stack
* **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
* **Database:** Neon (Serverless PostgreSQL) `@neondatabase/serverless`
* **Deployment:** Vercel
* **Data Source:** SEC EDGAR Live JSON APIs

## 🏗 Architecture Flow
1. **Extraction:** The Next.js API politely queries the SEC EDGAR `submissions` endpoint.
2. **Transformation:** The API parses the XML filings to identify "Officers" vs. "Directors", and classify trade codes as "BUY" or "SELL".
3. **Loading:** Data is Upserted into a Neon Postgres database via serverless functions.
4. **Analytics:** The sleek Next.js UI connects directly to the database via API routes to display aggregated capital flow and flag any anomalous trade exceeding $10,000,000.

## 🚀 Getting Started

### 1. Database Setup (Neon)
1. Create a free serverless Postgres database on [Neon](https://neon.tech).
2. Get your connection string (it looks like `postgres://username:password@ep-cool-sun-1234.us-east-2.aws.neon.tech/dbname?sslmode=require`).
3. Copy `.env.example` to `.env.local` and add your connection string:
   ```bash
   DATABASE_URL="your-neon-connection-string"
   ```
4. Run the schema creation query found in `schema.sql` against your Neon database to set up the `insider_trades` table.

### 2. Local Development
```bash
cd web
npm install
npm run dev
```
Navigate to `http://localhost:3000` to view the dashboard.

### 3. Vercel Deployment
Deploying this project is a breeze with Vercel:
1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. In the Vercel project settings, add the `DATABASE_URL` environment variable with your Neon connection string.
4. Deploy!
