"""BFCM 2026 sale price rule: 30% off the original price, whole dollars, never raise a price."""
from decimal import Decimal, ROUND_FLOOR

DISCOUNT = Decimal("0.70")


def sale_price(price: Decimal, compare_at: Decimal | None) -> tuple[Decimal, Decimal] | None:
    """Return (new_price, new_compare_at), or None when the variant needs no write."""
    original = compare_at if compare_at is not None and compare_at > price else price
    target = (original * DISCOUNT).quantize(Decimal("1"), rounding=ROUND_FLOOR)
    if target <= 0:
        return None
    new_price = min(price, target)
    if new_price == price and compare_at == original:
        return None
    return new_price, original
