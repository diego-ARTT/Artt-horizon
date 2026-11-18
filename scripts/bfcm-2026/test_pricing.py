import unittest
from decimal import Decimal as D

from pricing import sale_price


class SalePriceTest(unittest.TestCase):
    def test_full_price_item(self):
        self.assertEqual(sale_price(D("135.00"), None), (D("94"), D("135.00")))

    def test_already_marked_down(self):
        self.assertEqual(sale_price(D("101.25"), D("135.00")), (D("94"), D("135.00")))

    def test_deeper_than_30_untouched(self):
        self.assertIsNone(sale_price(D("113.75"), D("175.00")))  # target 122 > 113.75

    def test_junk_compare_at_equal(self):
        self.assertEqual(sale_price(D("95.00"), D("95.00")), (D("66"), D("95.00")))

    def test_junk_compare_at_lower(self):
        self.assertEqual(sale_price(D("95.00"), D("80.00")), (D("66"), D("95.00")))

    def test_idempotent(self):
        self.assertIsNone(sale_price(D("94"), D("135.00")))

    def test_zero_price_skipped(self):
        self.assertIsNone(sale_price(D("0.00"), None))

    def test_floor_to_zero_skipped(self):
        self.assertIsNone(sale_price(D("1.00"), None))  # floor(0.70) = 0 -> never set a $0 price

    def test_never_raises(self):
        for p in range(1, 400):
            for c in (None, p, p + 20, p * 2):
                r = sale_price(D(p), None if c is None else D(c))
                if r:
                    self.assertGreater(r[0], 0)
                    self.assertLessEqual(r[0], D(p))
                    self.assertGreaterEqual(1 - r[0] / r[1], D("0.30"))


if __name__ == "__main__":
    unittest.main()
