from pnsea import NSE
import json

nse = NSE()
df = nse.insider.insider_data("SBIN")
print("Total rows returned for SBIN by pnsea:", len(df))
print("Columns:", list(df.columns))

# Filter for acqName == "Ravi Shankar" or intimDt containing "05-Sep-2024" or date containing "05-Sep-2024"
ravi_rows = df[df['acqName'].str.contains('Ravi Shankar', case=False, na=False)]
print("\n--- Ravi Shankar Rows ---")
print("Count:", len(ravi_rows))
print(ravi_rows[['acqName', 'intimDt', 'date', 'secAcq', 'secVal', 'acqfromDt', 'acqtoDt', 'xbrl']].to_string())

# Check for identical xbrl URLs or intimations across multiple rows
print("\n--- Rows grouped by xbrl URL ---")
if 'xbrl' in df.columns:
    counts_by_xbrl = df['xbrl'].value_counts()
    print("Top xbrl URLs by row count:")
    print(counts_by_xbrl.head(10))

