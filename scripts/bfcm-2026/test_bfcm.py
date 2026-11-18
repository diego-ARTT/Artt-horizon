import copy
import unittest

from bfcm import build_plan, build_rollback, rollback_targets, summarize


def v(vid, price, cap=None):
    return {"id": f"gid://shopify/ProductVariant/{vid}", "price": price, "compareAtPrice": cap}


def snapshot():
    return {
        "taken_at": "2026-11-17T00:00:00",
        "timezone": "America/Los_Angeles",
        "products": [
            {"id": "gid://shopify/Product/1", "handle": "a-full", "title": "A", "variantsCount": 2,
             "variants": [v(11, "135.00"), v(12, "150.00")]},
            {"id": "gid://shopify/Product/2", "handle": "b-marked", "title": "B", "variantsCount": 1,
             "variants": [v(21, "101.25", "135.00")]},
            {"id": "gid://shopify/Product/3", "handle": "c-deep", "title": "C", "variantsCount": 2,
             "variants": [v(31, "113.75", "175.00"), v(32, "95.00", "95.00")]},
        ],
    }


def apply_plan(snap, plan):
    snap = copy.deepcopy(snap)
    new = {pv["id"]: pv for e in plan for pv in e["variants"]}
    for p in snap["products"]:
        for var in p["variants"]:
            if var["id"] in new:
                var["price"], var["compareAtPrice"] = new[var["id"]]["price"], new[var["id"]]["compareAtPrice"]
    return snap


class PlanTest(unittest.TestCase):
    def test_plan_counts(self):
        plan = build_plan(snapshot())
        by = {e["handle"]: e for e in plan}
        self.assertEqual(sorted(by), ["a-full", "b-marked", "c-deep"])
        a = {pv["id"][-2:]: (pv["price"], pv["compareAtPrice"]) for pv in by["a-full"]["variants"]}
        self.assertEqual(a, {"11": ("94", "135.00"), "12": ("105", "150.00")})
        self.assertEqual(by["b-marked"]["variants"][0]["old_price"], "101.25")
        self.assertEqual([pv["id"][-2:] for pv in by["c-deep"]["variants"]], ["32"])
        self.assertEqual(by["c-deep"]["variants"][0]["price"], "66")

    def test_plan_idempotent(self):
        snap = snapshot()
        self.assertEqual(build_plan(apply_plan(snap, build_plan(snap))), [])

    def test_truncated_variants_raises(self):
        snap = snapshot()
        snap["products"][2]["variantsCount"] = 3
        with self.assertRaises(ValueError):
            build_plan(snap)

    def test_summarize_mentions_counts(self):
        snap = snapshot()
        text = summarize(build_plan(snap), snap)
        self.assertIn("3 products", text)
        self.assertIn("5 variants", text)
        self.assertIn("4 to change", text)


class RollbackTest(unittest.TestCase):
    def setUp(self):
        self.backup = snapshot()
        self.plan = build_plan(self.backup)
        self.live = apply_plan(self.backup, self.plan)
        self.targets = rollback_targets([self.plan])

    def writes_by_id(self, writes):
        return {pv["id"][-2:]: (pv["price"], pv["compareAtPrice"]) for e in writes for pv in e["variants"]}

    def test_rollback_two_applies_uses_what_was_written(self):
        # first apply only got through product A (partial failure)
        plan1 = [e for e in self.plan if e["handle"] == "a-full"]
        snap2 = apply_plan(self.backup, plan1)
        # before the re-apply, someone hand-edits B (not yet on sale) and A's first variant
        snap2["products"][1]["variants"][0]["price"] = "110.00"
        snap2["products"][0]["variants"][0].update(price="120.00", compareAtPrice="135.00")
        plan2 = build_plan(snap2)
        live = apply_plan(snap2, plan2)
        writes, report = build_rollback(rollback_targets([plan1, plan2]), live)
        w = self.writes_by_id(writes)
        self.assertEqual(w["21"], ("110.00", "135.00"))  # B's value just before it went on sale, not the stale 101.25
        self.assertEqual(w["11"], ("135.00", None))  # first recorded pre-sale value wins
        self.assertEqual(w["12"], ("150.00", None))
        self.assertEqual(report, [])

    def test_rollback_reports_missing_product(self):
        self.live["products"] = [p for p in self.live["products"] if p["handle"] != "b-marked"]
        writes, report = build_rollback(self.targets, self.live)
        self.assertNotIn("21", self.writes_by_id(writes))
        self.assertTrue(any("MISSING" in line and "b-marked" in line for line in report))

    def test_rollback_restores(self):
        writes, report = build_rollback(self.targets, self.live)
        w = self.writes_by_id(writes)
        self.assertEqual(w["21"], ("101.25", "135.00"))
        self.assertEqual(w["11"], ("135.00", None))
        self.assertEqual(w["32"], ("95.00", "95.00"))
        self.assertNotIn("31", w)  # never changed
        self.assertEqual(report, [])

    def test_rollback_skips_hand_edit(self):
        self.live["products"][0]["variants"][0]["price"] = "80.00"
        writes, report = build_rollback(self.targets, self.live)
        self.assertNotIn("11", self.writes_by_id(writes))
        self.assertTrue(any("a-full" in line for line in report))
        forced, _ = build_rollback(self.targets, self.live, force=True)
        self.assertIn("11", self.writes_by_id(forced))

    def test_rollback_reports_new_product(self):
        self.live["products"].append({"id": "gid://shopify/Product/9", "handle": "z-new", "title": "Z",
                                      "variantsCount": 1, "variants": [v(91, "50.00")]})
        known = {var["id"] for p in self.backup["products"] for var in p["variants"]}
        writes, report = build_rollback(self.targets, self.live, known=known)
        self.assertNotIn("91", self.writes_by_id(writes))
        self.assertTrue(any("z-new" in line for line in report))
        self.assertFalse(any("c-deep" in line for line in report))  # never-changed variant 31 is known, not new


if __name__ == "__main__":
    unittest.main()
