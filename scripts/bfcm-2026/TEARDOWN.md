# Ending the BFCM 2026 sale

**When:** Dec 1 2026, 00:00 America/Los_Angeles (end of Cyber Monday).
Run steps 1 and 2 back to back; the storefront and prices should change within the same few minutes.

## 1. Take down the banner, marquee and black sale badge

Merge the draft PR **"End BFCM 2026"** (branch `bfcm-2026-teardown`). It reverts the theme commit
`feat(bfcm): BFCM homepage banner, marquee and black sale badge` and nothing else
(`templates/index.json`, `sections/header-group.json`, `config/settings_data.json`).

If that PR is missing or conflicts (e.g. someone edited the homepage in the customizer during the sale),
create it fresh from main:

```bash
git switch -c bfcm-2026-teardown origin/main
git revert <sha of the BFCM theme commit on main>   # find it: git log --oneline origin/main -- templates/index.json
```

## 2. Put prices back

```bash
python3 -I scripts/bfcm-2026/bfcm.py rollback
```

- It restores from every `applied-*.json` in `~/Development/arttitude-store-work/bfcm-2026/` (one per apply run — the exact values each run replaced and wrote), and checks products in any status, so items drafted or archived during the sale are restored too.
- It prints a report first:
  - `HAND EDIT (skipped)` — someone changed that variant's price during the sale; it is left alone. Decide per line; re-run with `--force` to overwrite all of them with the pre-sale values.
  - `NEW VARIANT (untouched)` — created during the sale; check its price by hand.
  - `MISSING (deleted?)` — a variant we discounted no longer exists; nothing to restore.
- It ends with `restore verified n/n`. Anything else = look at the mismatch lines and re-run (re-running is safe).

## 2b. Turn discount codes back on

28 discount codes were paused on Nov 17 so they couldn't stack on sale prices (everything except the two Alter Ego codes and the automatic discounts).

```bash
python3 -I scripts/bfcm-2026/discounts.py restore
```

It reactivates every code in `discounts-paused-*.json`, puts back the original end dates (the Judge.me referral codes end Dec 11 / Dec 17), and ends with `restored 28/28`.

Note: `ART10`, `BROWSE10` and `CART10` were turned back on during the sale (Nov 17) because live Klaviyo flows (welcome, site/browse/cart/checkout abandonment) hand them out; they're in the record too, and re-activating an active code is harmless. No Klaviyo flows were paused.

## 3. Check the live store (phone width first)

- Homepage: no BFCM banner, no marquee, ICONS hero is first.
- A product that was full price before the sale: no strikethrough, no sale badge.
- A product that was already marked down before the sale: its old markdown is back (e.g. 101.25 with 135.00 struck through).
