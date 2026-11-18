"""Pause discount codes for the BFCM sale so they can't stack on sale prices, and turn them back on after.

  python3 -I scripts/bfcm-2026/discounts.py list      # read-only: what pause would touch
  python3 -I scripts/bfcm-2026/discounts.py pause     # record, then deactivate every code discount (except Alter Ego)
  python3 -I scripts/bfcm-2026/discounts.py restore   # Dec 1: reactivate every recorded code, with its original end date

Automatic discounts are never touched. Records go to ~/Development/arttitude-store-work/bfcm-2026/discounts-paused-*.json.
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # `python3 -I` does not add the script dir
from bfcm import OUT, _load, _save, run  # noqa: E402

KEEP_PREFIXES = ("Alter Ego",)  # Alter Ego is not on sale, so its codes can't stack

Q_ACTIVE = """query($after: String) { discountNodes(first: 100, after: $after, query: "status:active") {
  pageInfo { hasNextPage endCursor }
  nodes { id discount { __typename
    ... on DiscountCodeBasic { title startsAt endsAt }
    ... on DiscountCodeBxgy { title startsAt endsAt }
    ... on DiscountCodeFreeShipping { title startsAt endsAt }
    ... on DiscountCodeApp { title startsAt endsAt }
    ... on DiscountAutomaticBasic { title startsAt endsAt }
    ... on DiscountAutomaticBxgy { title startsAt endsAt }
    ... on DiscountAutomaticFreeShipping { title startsAt endsAt }
    ... on DiscountAutomaticApp { title startsAt endsAt }
  } } } }"""
Q_STATUS = """query($ids: [ID!]!) { nodes(ids: $ids) { ... on DiscountCodeNode { id codeDiscount { __typename
    ... on DiscountCodeBasic { title status endsAt } ... on DiscountCodeBxgy { title status endsAt }
    ... on DiscountCodeFreeShipping { title status endsAt } ... on DiscountCodeApp { title status endsAt } } } } }"""
M_DEACTIVATE = "mutation($id: ID!) { discountCodeDeactivate(id: $id) { codeDiscountNode { id } userErrors { field message } } }"
M_ACTIVATE = "mutation($id: ID!) { discountCodeActivate(id: $id) { codeDiscountNode { id } userErrors { field message } } }"
M_SET_END = """mutation($id: ID!, $endsAt: DateTime) {
  discountCodeBasicUpdate(id: $id, basicCodeDiscount: { endsAt: $endsAt }) { codeDiscountNode { id } userErrors { field message } } }"""


def select_to_pause(nodes):
    picked = []
    for n in nodes:
        d = n["discount"]
        if not d["__typename"].startswith("DiscountCode") or d["title"].startswith(KEEP_PREFIXES):
            continue
        picked.append({"id": n["id"], "type": d["__typename"], "title": d["title"],
                       "startsAt": d["startsAt"], "endsAt": d["endsAt"]})
    return picked


def fetch_active():
    nodes, after = [], None
    while True:
        page = run(Q_ACTIVE, {"after": after})["discountNodes"]
        nodes += page["nodes"]
        if not page["pageInfo"]["hasNextPage"]:
            return nodes
        after = page["pageInfo"]["endCursor"]


def statuses(ids):
    out = {}
    for i in range(0, len(ids), 50):
        for n in run(Q_STATUS, {"ids": ids[i:i + 50]})["nodes"]:
            if n:
                out[n["id"]] = n["codeDiscount"]
    return out


def _mutate(query, variables, key):
    res = run(query, variables, mutation=True)[key]
    if res["userErrors"]:
        print("ERROR", variables, res["userErrors"], flush=True)
    return not res["userErrors"]


def cmd_list():
    for p in select_to_pause(fetch_active()):
        print(f"{p['type']:20} ends={p['endsAt'] or 'never':22} {p['title']}")


def cmd_pause():
    picked = select_to_pause(fetch_active())
    if not picked:
        sys.exit("nothing active to pause")
    print("record:", _save(picked, "discounts-paused"))  # saved before any change
    ok = sum(_mutate(M_DEACTIVATE, {"id": p["id"]}, "discountCodeDeactivate") for p in picked)
    st = statuses([p["id"] for p in picked])
    still = [p["title"] for p in picked if st.get(p["id"], {}).get("status") == "ACTIVE"]
    print(f"paused {ok}/{len(picked)}; still active: {still or 'none'}")
    sys.exit(1 if still or ok != len(picked) else 0)


def cmd_restore():
    files = sorted(glob.glob(os.path.join(OUT, "discounts-paused-*.json")))
    if not files:
        sys.exit(f"no discounts-paused-*.json in {OUT}")
    recorded = {p["id"]: p for f in files for p in _load(f)}  # same code in two records: identical originals
    problems = []
    for p in recorded.values():
        if not _mutate(M_ACTIVATE, {"id": p["id"]}, "discountCodeActivate"):
            problems.append(p["title"])
            continue
        if p["endsAt"]:
            if p["type"] == "DiscountCodeBasic":
                _mutate(M_SET_END, {"id": p["id"], "endsAt": p["endsAt"]}, "discountCodeBasicUpdate")
            else:
                problems.append(f"{p['title']}: set end date {p['endsAt']} by hand")
    st = statuses(list(recorded))
    not_active = [p["title"] for p in recorded.values() if st.get(p["id"], {}).get("status") != "ACTIVE"]
    print(f"restored {len(recorded) - len(not_active)}/{len(recorded)}; not active: {not_active or 'none'}")
    if problems:
        print("check by hand:", *problems, sep="\n  ")
    sys.exit(1 if not_active or problems else 0)


if __name__ == "__main__":
    {"list": cmd_list, "pause": cmd_pause, "restore": cmd_restore}.get(
        (sys.argv[1:] or ["list"])[0], lambda: sys.exit(__doc__))()
