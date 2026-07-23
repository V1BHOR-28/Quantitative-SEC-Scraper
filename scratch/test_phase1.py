import time
import json
import traceback
import os

print("=== PHASE 1 TEST SUITE (FULL) ===")

# -------------------------------------------------------------
# 1. TEST pnsea
# -------------------------------------------------------------
print("\n==========================================")
print("1. TEST LIB: pnsea")
print("==========================================")
try:
    from pnsea import NSE
    start_t = time.time()
    nse_pnsea = NSE()
    res1 = nse_pnsea.insider.insider_data("SBIN")
    lat1 = time.time() - start_t
    print(f"pnsea SBIN Latency: {lat1:.2f}s")
    print(f"pnsea SBIN Type: {type(res1)}")
    if hasattr(res1, "to_dict"):
        print(f"pnsea SBIN Count: {len(res1)}")
        sample1 = res1.head(3).to_dict(orient="records")
        print("Sample SBIN Records (Exact):\n", json.dumps(sample1, default=str, indent=2))

    start_t = time.time()
    res2 = nse_pnsea.insider.insider_data("INFY", from_date="01-01-2026", to_date="23-07-2026")
    lat2 = time.time() - start_t
    print(f"pnsea INFY Latency: {lat2:.2f}s")
    if hasattr(res2, "to_dict"):
        print(f"pnsea INFY Count: {len(res2)}")
        sample2 = res2.head(3).to_dict(orient="records")
        print("Sample INFY Records (Exact):\n", json.dumps(sample2, default=str, indent=2))

    # Test 10 repeated calls in a row
    print("\nTesting 10 repeated calls for pnsea...")
    rep_times = []
    rep_success = 0
    for i in range(10):
        t0 = time.time()
        try:
            r = nse_pnsea.insider.insider_data("SBIN")
            rep_times.append(time.time() - t0)
            rep_success += 1
        except Exception as e:
            print(f"Call {i+1} failed: {e}")
    avg_lat = sum(rep_times)/len(rep_times) if rep_times else 0
    print(f"pnsea Repeated Calls: {rep_success}/10 succeeded. Avg Latency: {avg_lat:.3f}s")

except Exception as e:
    print("pnsea FAILED:")
    traceback.print_exc()

# -------------------------------------------------------------
# 2. TEST NseIndiaApi (installed via git as nse)
# -------------------------------------------------------------
print("\n==========================================")
print("2. TEST LIB: NseIndiaApi (BennyThadikaran/NseIndiaApi)")
print("==========================================")
try:
    from nse import NSE as NseIndiaApi
    os.makedirs("./scratch/dl", exist_ok=True)
    api = NseIndiaApi("./scratch/dl")
    print("NseIndiaApi methods:", [m for m in dir(api) if not m.startswith("_")])
    
    target_methods = [m for m in dir(api) if any(k in m.lower() for k in ["insider", "pit", "corp", "trade", "announc"])]
    print("Target Methods found:", target_methods)
    
    for method_name in target_methods:
        try:
            fn = getattr(api, method_name)
            t0 = time.time()
            res = fn("SBIN")
            dt = time.time() - t0
            print(f"\nMethod {method_name}('SBIN') Latency: {dt:.2f}s, Type: {type(res)}")
            if hasattr(res, "to_dict"):
                print("Count:", len(res))
                print("Sample:", json.dumps(res.head(2).to_dict(orient="records"), default=str, indent=2))
            elif isinstance(res, (list, dict)):
                print("Sample:", json.dumps(res[:2] if isinstance(res, list) else res, default=str, indent=2)[:500])
        except Exception as ex:
            print(f"Method {method_name} error: {ex}")

except Exception as e:
    print("NseIndiaApi FAILED:")
    traceback.print_exc()

# -------------------------------------------------------------
# 3. TEST bsescraper
# -------------------------------------------------------------
print("\n==========================================")
print("3. TEST LIB: bsescraper")
print("==========================================")
try:
    from bsescraper import BSE
    bse = BSE()
    print("BSE methods:", [m for m in dir(bse) if not m.startswith("_")])
    
    methods = [m for m in dir(bse) if not m.startswith("_")]
    for scrip in ["500112", "500209", "500325"]: # SBIN, INFY, RELIANCE
        t0 = time.time()
        for m in methods:
            try:
                fn = getattr(bse, m)
                res = fn(scrip)
                dt = time.time() - t0
                print(f"bsescraper {m}('{scrip}') Latency: {dt:.2f}s, Type: {type(res)}")
                if hasattr(res, "to_dict"):
                    print("Sample:", json.dumps(res.head(2).to_dict(orient="records"), default=str, indent=2)[:500])
                elif isinstance(res, (list, dict)):
                    print("Sample:", json.dumps(res[:2] if isinstance(res, list) else res, default=str, indent=2)[:500])
            except Exception as ex:
                print(f"bsescraper {m}('{scrip}') error: {ex}")

except Exception as e:
    print("bsescraper FAILED:")
    traceback.print_exc()

