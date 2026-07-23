# 🇮🇳 Quantitative Insider Trading & SEBI PIT Anomaly Tracker (NSE & BSE)

> A high-performance, real-time Data Engineering & Business Intelligence platform that ingests, parses, deduplicates, and analyzes C-suite insider disclosures across 7,800+ listed companies on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE), classified by Ministry of Corporate Affairs (MCA) ownership structures.

[![Live Application](https://img.shields.io/badge/Live_App-Vercel-brightgreen?style=for-the-badge&logo=vercel)](https://web-steel-ten-92.vercel.app)
[![Database](https://img.shields.io/badge/Database-Neon_Postgres-blue?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Framework](https://img.shields.io/badge/Framework-Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Market](https://img.shields.io/badge/Market-NSE_%26_BSE_India-orange?style=for-the-badge)](https://www.nseindia.com)

---

## 🌟 Key Highlights & Features

### 🏛️ Ministry of Corporate Affairs (MCA) Ownership Segregation
- **7,800+ Listed Indian Equities**: Comprehensive directory coverage across both **NSE** and **BSE**.
- **MCA Government PSU vs. Private Sector Filter**:
  - **🏛️ 72 Government-Owned PSUs (~0.9%)**: Categorized into *Navratna / Miniratna*, *Public Sector Banks (PSBs)*, *Defence & Aerospace*, *Energy & Utilities*, and *Railway & Logistics* (e.g., `HAL`, `BEL`, `SBIN`, `IOC`, `NTPC`, `ONGC`, `SAIL`, `IRCTC`, `HMT`).
  - **🏢 7,728 Private Sector Companies (~99.1%)**: Grouped into major industry verticals (e.g., `RELIANCE`, `TCS`, `INFY`, `WIPRO`, `ZOMATO`, `SUNPHARMA`).
- **Interactive Quick Sector Ribbon**: Instant 1-click filtering by industry sectors (*💊 Healthcare & Pharma*, *💻 IT & Tech*, *🏦 Banking & Finance*, *🚗 Auto*, *🛍️ FMCG & Retail*, *⚡ Energy & Power*, *🏗️ Infra & Metals*).

### 📈 Real-Time SEBI PIT Insider Trading Intelligence
- **Automated Disclosures Ingestion**: Ingests insider transactions filed under **SEBI (Prohibition of Insider Trading) Regulations**.
- **C-Suite & Designated Persons Tracking**: Tracks buy/sell actions by Promoters, Managing Directors, CEOs, CFOs, and Executive Officers.
- **Capital Flow Analytics**: Calculates Net Insider Capital Flow, total Buy/Sell volume split, and flags unusual high-value trades.
- **Top Insiders Leaderboard**: Visual breakdown of top insider buyers and sellers for any selected company.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | Next.js (App Router), TypeScript, Vanilla CSS (Design Tokens, Dark Mode & Glassmorphism) |
| **Data Visualization** | Chart.js 4.x, Responsive SVG Charts |
| **Backend & APIs** | Next.js Serverless Edge Routes, SEBI PIT & Regulatory Ingestion Services |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`), Connection Pooling |
| **Hosting & CI/CD** | Vercel Production Environment |

---

## 📊 Market Breakdown (NSE & BSE Equities)

| Ownership Category | Number of Listed Companies | Percentage Share | Examples |
| :--- | :---: | :---: | :--- |
| **🏛️ Government-Owned (PSUs)** | **72** | **~0.9%** | HAL, BEL, SBIN, IOC, ONGC, NTPC, HMT, SAIL, IRCTC |
| **🏢 Private Sector** | **7,728+** | **~99.1%** | Reliance, TCS, Wipro, Infosys, Zomato, Sun Pharma, Tata Motors |
| **Total Listed Equities** | **7,800+** | **100%** | Comprehensive NSE / BSE Coverage |

---

## 🚀 Live Demo & Deployment

The application is deployed live on Vercel:

🔗 **Live Production URL**: [https://web-steel-ten-92.vercel.app](https://web-steel-ten-92.vercel.app)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ or Node.js 20+
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/V1BHOR-28/Quantitative-SEC-Scraper.git
cd Quantitative-SEC-Scraper/web
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file inside the `web/` directory:
```env
DATABASE_URL="postgresql://user:password@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Repository Structure

```
Quantitative-SEC-Scraper/
├── .gitignore
├── README.md
├── power bi output.png
└── web/
    ├── src/
    │   ├── app/
    │   │   ├── api/             # Serverless API routes (trades, companies, cron)
    │   │   ├── globals.css      # CSS Design tokens, variables & dark mode UI
    │   │   ├── layout.tsx       # Root layout
    │   │   └── page.tsx         # Main Landing & Dashboard UI
    │   ├── components/          # Reusable UI components & charts
    │   └── lib/
    │       ├── db.ts            # Neon Postgres database client
    │       └── nse/
    │           ├── nse-lookup.ts # Master NSE/BSE companies directory
    │           └── ownership-data.ts # MCA Government vs Private classification
    ├── package.json
    ├── schema.sql              # Postgres database DDL schema
    └── vercel.json
```

---

## 📜 License
This project is open-source under the MIT License.
