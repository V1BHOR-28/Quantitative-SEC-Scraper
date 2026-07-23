const { neon } = require('@neondatabase/serverless');

async function check() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("No DATABASE_URL"); process.exit(1); }
  const sql = neon(url);

  const rows = await sql`
    SELECT trade_id, ticker, insider_name, executive_role, market, currency
    FROM insider_trades 
    WHERE ticker = 'TATAMOTORS'
    ORDER BY trade_id DESC
    LIMIT 20
  `;
  console.log("TATAMOTORS records found:", rows.length);
  for (const r of rows) {
    console.log(`  [${r.trade_id}] ${r.insider_name} | ${r.executive_role} | market=${r.market} | currency=${r.currency}`);
  }
}

check();
