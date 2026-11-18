import unittest

from discounts import select_to_pause


def node(i, typename, title, ends=None):
    return {"id": f"gid://shopify/DiscountCodeNode/{i}" if "Code" in typename else f"gid://shopify/DiscountAutomaticNode/{i}",
            "discount": {"__typename": typename, "title": title, "startsAt": "2025-01-01T00:00:00Z", "endsAt": ends}}


class SelectTest(unittest.TestCase):
    def test_pauses_codes_keeps_automatic_and_alter_ego(self):
        nodes = [
            node(1, "DiscountCodeBasic", "ARTTNEW10"),
            node(2, "DiscountCodeApp", "ARTTBUNDLE10"),
            node(3, "DiscountCodeBasic", "Judge.me Referrals: Friend Discount - 2026-11-17", "2026-12-17T00:00:00Z"),
            node(4, "DiscountCodeBasic", "Alter Ego · friends test (100%)"),
            node(5, "DiscountAutomaticBxgy", "Alter Ego · second garment 30% off"),
            node(6, "DiscountAutomaticApp", "Lookfy Gallery DF (DO NOT DELETE)"),
        ]
        picked = select_to_pause(nodes)
        self.assertEqual([p["title"] for p in picked],
                         ["ARTTNEW10", "ARTTBUNDLE10", "Judge.me Referrals: Friend Discount - 2026-11-17"])
        self.assertEqual(picked[2]["endsAt"], "2026-12-17T00:00:00Z")  # kept for the Dec 1 restore
        self.assertEqual(picked[1]["type"], "DiscountCodeApp")


if __name__ == "__main__":
    unittest.main()
