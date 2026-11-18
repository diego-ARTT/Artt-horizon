import copy
import unittest

from bfcm import build_plan, build_rollback, summarize


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

    def writes_by_id(self, writes):
        return {pv["id"][-2:]: (pv["price"], pv["compareAtPrice"]) for e in writes for pv in e["variants"]}

    def test_rollback_restores(self):
        writes, report = build_rollback(self.backup, self.live, self.plan)
        w = self.writes_by_id(writes)
        self.assertEqual(w["21"], ("101.25", "135.00"))
        self.assertEqual(w["11"], ("135.00", None))
        self.assertEqual(w["32"], ("95.00", "95.00"))
        self.assertNotIn("31", w)  # never changed
        self.assertEqual(report, [])

    def test_rollback_skips_hand_edit(self):
        self.live["products"][0]["variants"][0]["price"] = "80.00"
        writes, report = build_rollback(self.backup, self.live, self.plan)
        self.assertNotIn("11", self.writes_by_id(writes))
        self.assertTrue(any("a-full" in line for line in report))
        forced, _ = build_rollback(self.backup, self.live, self.plan, force=True)
        self.assertIn("11", self.writes_by_id(forced))

    def test_rollback_reports_new_product(self):
        self.live["products"].append({"id": "gid://shopify/Product/9", "handle": "z-new", "title": "Z",
                                      "variantsCount": 1, "variants": [v(91, "50.00")]})
        writes, report = build_rollback(self.backup, self.live, self.plan)
        self.assertNotIn("91", self.writes_by_id(writes))
        self.assertTrue(any("z-new" in line for line in report))


if __name__ == "__main__":
    unittest.main()
