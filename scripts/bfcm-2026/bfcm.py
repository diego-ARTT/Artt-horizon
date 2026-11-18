"""BFCM 2026: put every active product at 30% off its original price, and put it back afterwards.

  python3 -I scripts/bfcm-2026/bfcm.py plan                       # read-only: snapshot + plan + summary
  python3 -I scripts/bfcm-2026/bfcm.py apply <plan-file>          # backup, then write sale prices
  python3 -I scripts/bfcm-2026/bfcm.py verify <plan-file>         # live prices == plan?
  python3 -I scripts/bfcm-2026/bfcm.py rollback <backup-file> [--force]

Files (snapshots, plans, backups, logs) go to ~/Development/arttitude-store-work/bfcm-2026/.
"""
import datetime
import glob
import json
import os
import statistics
import subprocess
import sys
import time
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # `python3 -I` does not add the script dir
from pricing import sale_price  # noqa: E402

STORE = "arttitudes.myshopify.com"
OUT = os.path.expanduser("~/Development/arttitude-store-work/bfcm-2026")

Q_SHOP = "query { shop { ianaTimezone } priceLists(first: 20) { nodes { name currency fixedPricesCount } } }"
Q_PRODUCTS = """query Products($after: String) {
  products(first: 50, after: $after, query: "status:active") {
    pageInfo { hasNextPage endCursor }
    nodes { id handle title variantsCount { count } variants(first: 100) { nodes { id price compareAtPrice } } }
  }
}"""
M_BULK = """mutation SetPrices($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
    productVariants { id price compareAtPrice }
    userErrors { field message }
  }
}"""


# ---------- pure ----------

def _d(s):
    return None if s is None else Decimal(s)


def _same(a, b):
    return _d(a) == _d(b)


def _vals(var):
    return var["price"], var["compareAtPrice"]


def build_plan(snapshot):
    plan = []
    for p in snapshot["products"]:
        if len(p["variants"]) != p["variantsCount"]:
            raise ValueError(f"{p['handle']}: fetched {len(p['variants'])} of {p['variantsCount']} variants")
        changes = []
        for var in p["variants"]:
            r = sale_price(_d(var["price"]), _d(var["compareAtPrice"]))
            if r is None:
                continue
            new_price, original = r
            cap = var["compareAtPrice"] if _same(var["compareAtPrice"], original) else var["price"]
            changes.append({"id": var["id"], "price": str(new_price), "compareAtPrice": cap,
                            "old_price": var["price"], "old_compareAtPrice": var["compareAtPrice"]})
        if changes:
            plan.append({"productId": p["id"], "handle": p["handle"], "variants": changes})
    return plan


def summarize(plan, snapshot):
    variants = [var for p in snapshot["products"] for var in p["variants"]]
    planned = {pv["id"]: pv for e in plan for pv in e["variants"]}
    junk = sum(1 for var in variants if var["compareAtPrice"] is not None and _d(var["compareAtPrice"]) <= _d(var["price"]))
    discounts = []
    for var in variants:
        price, cap = _vals(planned[var["id"]]) if var["id"] in planned else _vals(var)
        if cap is not None and _d(cap) > _d(price):
            discounts.append(float(1 - _d(price) / _d(cap)) * 100)
        else:
            discounts.append(0.0)
    lines = [
        f"{len(snapshot['products'])} products, {len(variants)} variants",
        f"{len(planned)} to change across {len(plan)} products; {len(variants) - len(planned)} left as is",
        f"junk compare-at (<= price) fixed: {junk}",
        f"resulting discount: min {min(discounts):.1f}%  median {statistics.median(discounts):.1f}%  max {max(discounts):.1f}%",
        f"variants below 30% off after the sale: {sum(1 for x in discounts if x < 29.99)}",
        "samples:",
    ]
    for e in plan[:10]:
        pv = e["variants"][0]
        lines.append(f"  {e['handle']}: {pv['old_price']} (was cap {pv['old_compareAtPrice']}) -> {pv['price']} (cap {pv['compareAtPrice']})")
    return "\n".join(lines)


def build_rollback(backup, live, sale_plan, force=False):
    before = {var["id"]: _vals(var) for p in backup["products"] for var in p["variants"]}
    planned = {pv["id"]: _vals(pv) for e in sale_plan for pv in e["variants"]}
    backup_products = {p["id"] for p in backup["products"]}
    writes, report = [], []
    for p in live["products"]:
        if p["id"] not in backup_products:
            report.append(f"NEW PRODUCT (untouched): {p['handle']}")
            continue
        changes = []
        for var in p["variants"]:
            vid, cur = var["id"], _vals(var)
            if vid not in before:
                report.append(f"NEW VARIANT (untouched): {p['handle']} {vid}")
                continue
            if vid not in planned:
                continue
            want = before[vid]
            if _same(cur[0], want[0]) and _same(cur[1], want[1]):
                continue  # already restored
            if not (_same(cur[0], planned[vid][0]) and _same(cur[1], planned[vid][1])):
                report.append(f"HAND EDIT {'(forced)' if force else '(skipped)'}: {p['handle']} {vid} "
                              f"live {cur} vs sale {planned[vid]} vs before {want}")
                if not force:
                    continue
            changes.append({"id": vid, "price": want[0], "compareAtPrice": want[1]})
        if changes:
            writes.append({"productId": p["id"], "handle": p["handle"], "variants": changes})
    return writes, report


# ---------- I/O ----------

def run(query, variables=None, mutation=False):
    cmd = ["shopify", "store", "execute", "--store", STORE, "--json", "--no-input", "--query", query,
           "--variables", json.dumps(variables or {})]
    if mutation:
        cmd.append("--allow-mutations")
    last = ""
    for attempt in range(4):
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode == 0:
            res = json.loads(r.stdout)
            return res.get("data", res)
        last = (r.stderr.strip() or r.stdout.strip())[-400:]
        print(f"retry {attempt + 1}: {last[-160:]}", flush=True)
        time.sleep(10 * (attempt + 1))
    raise RuntimeError(last)


def fetch():
    shop = run(Q_SHOP)
    for pl in shop["priceLists"]["nodes"]:
        if pl["fixedPricesCount"]:
            print(f"WARNING: price list '{pl['name']}' has {pl['fixedPricesCount']} fixed prices — those won't follow the sale")
    products, after = [], None
    while True:
        page = run(Q_PRODUCTS, {"after": after})["products"]
        for n in page["nodes"]:
            products.append({"id": n["id"], "handle": n["handle"], "title": n["title"],
                             "variantsCount": n["variantsCount"]["count"], "variants": n["variants"]["nodes"]})
        if not page["pageInfo"]["hasNextPage"]:
            break
        after = page["pageInfo"]["endCursor"]
    return {"taken_at": datetime.datetime.now().isoformat(timespec="seconds"),
            "timezone": shop["shop"]["ianaTimezone"], "products": products}


def write(entries):
    log, errors = [], 0
    for i, e in enumerate(entries, 1):
        variants = [{"id": pv["id"], "price": pv["price"], "compareAtPrice": pv["compareAtPrice"]} for pv in e["variants"]]
        res = run(M_BULK, {"productId": e["productId"], "variants": variants}, mutation=True)["productVariantsBulkUpdate"]
        if res["userErrors"]:
            errors += 1
            print("ERROR", e["handle"], res["userErrors"], flush=True)
        log.append({"handle": e["handle"], "variants": len(variants), "errors": res["userErrors"]})
        if i % 20 == 0:
            print(f"{i}/{len(entries)}", flush=True)
            _save(log, "write-log-partial.json", stamp=False)
        time.sleep(0.3)
    _save(log, "write-log")
    print(f"done: {len(entries)} products, {errors} errors")
    return errors


def _stamp():
    return datetime.datetime.now().strftime("%Y%m%d-%H%M%S")


def _save(obj, name, stamp=True):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{name}-{_stamp()}.json" if stamp else name)
    with open(path, "w") as f:
        json.dump(obj, f, indent=1)
    return path


def _load(path):
    with open(path) as f:
        return json.load(f)


def _mismatches(expected, live):
    cur = {var["id"]: _vals(var) for p in live["products"] for var in p["variants"]}
    bad = []
    for vid, (price, cap) in expected.items():
        got = cur.get(vid)
        if got is None or not (_same(got[0], price) and _same(got[1], cap)):
            bad.append(f"{vid}: want {(price, cap)} got {got}")
    return bad


def cmd_plan():
    snap = fetch()
    print("snapshot:", _save(snap, "snapshot"))
    plan = build_plan(snap)
    print("plan:", _save(plan, "plan"))
    print(f"timezone: {snap['timezone']}")
    print(summarize(plan, snap))


def cmd_apply(plan_file):
    approved = {pv["id"]: _vals(pv) for e in _load(plan_file) for pv in e["variants"]}
    snap = fetch()
    first = not glob.glob(os.path.join(OUT, "backup-BEFORE-SALE-*.json"))
    print("backup:", _save(snap, "backup-BEFORE-SALE" if first else "backup"))
    plan = build_plan(snap)
    drift = [pv["id"] for e in plan for pv in e["variants"]
             if pv["id"] not in approved or not (_same(pv["price"], approved[pv["id"]][0]) and _same(pv["compareAtPrice"], approved[pv["id"]][1]))]
    if drift:
        sys.exit(f"refusing: {len(drift)} variants differ from the approved plan (prices changed since?) e.g. {drift[:5]} — re-run plan")
    print(f"writing {sum(len(e['variants']) for e in plan)} variants across {len(plan)} products")
    sys.exit(1 if write(plan) else 0)


def cmd_verify(plan_file):
    expected = {pv["id"]: _vals(pv) for e in _load(plan_file) for pv in e["variants"]}
    bad = _mismatches(expected, fetch())
    print(f"OK {len(expected)}/{len(expected)}" if not bad else f"MISMATCH {len(bad)}/{len(expected)}\n" + "\n".join(bad[:30]))
    sys.exit(1 if bad else 0)


def cmd_rollback(backup_file, force):
    backup = _load(backup_file)
    writes, report = build_rollback(backup, fetch(), build_plan(backup), force=force)
    print("\n".join(report) or "no hand edits or new products")
    print(f"restoring {sum(len(e['variants']) for e in writes)} variants across {len(writes)} products")
    errors = write(writes)
    expected = {pv["id"]: _vals(pv) for e in writes for pv in e["variants"]}
    bad = _mismatches(expected, fetch())
    print(f"restore verified {len(expected)}/{len(expected)}" if not bad else f"RESTORE MISMATCH {len(bad)}\n" + "\n".join(bad[:30]))
    sys.exit(1 if errors or bad else 0)


if __name__ == "__main__":
    args = sys.argv[1:] or ["plan"]
    if args[0] == "plan":
        cmd_plan()
    elif args[0] == "apply":
        cmd_apply(args[1])
    elif args[0] == "verify":
        cmd_verify(args[1])
    elif args[0] == "rollback":
        cmd_rollback(args[1], "--force" in args)
    else:
        sys.exit(__doc__)
