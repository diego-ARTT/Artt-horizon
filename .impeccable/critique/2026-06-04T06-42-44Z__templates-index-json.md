---
target: the homepage
total_score: 24
p0_count: 2
p1_count: 3
timestamp: 2026-06-04T06-42-44Z
slug: templates-index-json
---

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                                                                                 |
| --------- | ------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Hero video has no play/pause state; otherwise solid (cart, drawer, buttons)                                                               |
| 2         | Match System / Real World       | 2         | Page speaks Shopify ("Tees for the summer", "Customers are saying") not ARTT (drops, editions, artists, collabs)                          |
| 3         | User Control and Freedom        | 2         | No way to pause the looping hero video; second product carousel has no title to navigate by                                               |
| 4         | Consistency and Standards       | 2         | Two product carousels back-to-back (one untitled), reviews block uses foreign visual language, Moast tiles use separate radius vocabulary |
| 5         | Error Prevention                | 3         | n/a for homepage flow; Horizon defaults handle cart/newsletter cleanly                                                                    |
| 6         | Recognition Rather Than Recall  | 3         | Header nav surfaces collections; no drop calendar or current-drop callout                                                                 |
| 7         | Flexibility and Efficiency      | 2         | Quick add on cards is good; no clear path for returning collectors to find the current drop                                               |
| 8         | Aesthetic and Minimalist Design | 2         | Page carries another brand's aesthetic in two blocks (Judge.me's white cards, Moast's 20px rounded Instagram-gradient tiles)              |
| 9         | Error Recovery                  | 3         | n/a; standard Horizon handling                                                                                                            |
| 10        | Help and Documentation          | 2         | No drops/collabs/about signposted from home unless user knows the menu                                                                    |
| **Total** |                                 | **24/40** | **Acceptable — significant improvements needed**                                                                                          |

## Anti-Patterns Verdict

The homepage has no narrative. The structure is the Generic Shopify Fashion Theme anti-reference verbatim: hero -> carousel -> carousel -> reviews -> UGC. Zero brand-specific storytelling: no drop name, no edition count, no artist surface, no founder voice, no city, no run size, no scarcity language. The hero's brand statement "Virtue Was Never the Plan." is set as a Rich Text preset and falls back to 14px Space Mono; "The summer edit" is set as H2 and dominates at ~48px DM Sans 900. Type hierarchy is inverted, brand statement is invisible, page has no semantic <h1>.

Detector scan: 3 layout-property animation warnings in sections/header.liquid (lines 591, 602, 611). Browser visualization not available (Shopify theme served by edge, not local).

## Priority Issues

**[P0] The homepage has no narrative; it's a product surface, not a brand surface.**

- Re-plan the section order around an actual story: current drop hero, one anchored carousel, named editorial section, drop calendar, press in ARTT voice. Cut the second carousel and Moast UGC.
- Command: /impeccable shape homepage

**[P0] Hero brand statement rendered at body size; page has no <h1>.**

- Swap text-block presets: eyebrow -> H6 (Space Mono meta), headline -> H1 (DM Sans 900 display). 30-second config change.
- Command: /impeccable typeset hero

**[P1] Two product carousels back-to-back, second untitled.**

- Keep one anchored to the current drop. Replace the second with an editorial section (artist feature, founder quote, lookbook). Switch canvas tone for rhythm.
- Command: /impeccable distill homepage then /impeccable shape

**[P1] Reviews block speaks another brand's voice.**

- Replace Judge.me defaults (white cards, serif quote marks, "Customers are saying") with a press section that names publications. The disabled media_quote_carousel content (Modern Luxury, Resident Magazine, Ritz Herald) is the right material.
- Command: /impeccable clarify homepage then /impeccable quieter

**[P1] Brand's primary value prop (limited drops + artist collabs) is invisible.**

- Add artist credit + edition count to product cards. Add a current-drop surface. Repurpose disabled featured_blog_posts slot.
- Command: /impeccable shape homepage

## Persona Red Flags

**Casey (Mobile)**: Hero video autoplays on cellular, no pause. Two carousels = lots of horizontal swiping. Second one untitled. Moast UGC adds more bandwidth. Reviews far down, likely never seen.

**Jordan (First-Timer)**: Hierarchy inverted in hero (eyebrow big, headline tiny). Two carousels feel redundant. No explanation of what ARTT is, who runs it, why these prices.

**Maya (Tastemaker, project-specific)**: Lands looking for current drop. No drop name, no edition count, no artist on any card. Press quotes disabled, founders not named. Leaves for Instagram.

## Minor Observations

- sections/header.liquid lines 591, 602, 611 animate height (layout thrash). Global header, not homepage body, but ships everywhere.
- Hero padding asymmetric (100px/40px) without compositional reason.
- mobile_card_size: 60cqw is cramped (1.67 cards visible). 75cqw would breathe more.
- Sample reviews on by default in Judge.me (show_sample_reviews: true) — inauthentic on brand register.
- Disabled featured_blog_posts heading "read up." is correct ARTT tone for whatever ends up in that slot.

## Questions to Consider

- What if the homepage opened with the current drop, named, with edition count and artist credit?
- What would the homepage look like if the visitor learned who Sylvain and Amrita are before seeing a second product?
- What if the second carousel weren't a carousel at all (editorial spread, lookbook, single full-bleed artwork)?
- What does the homepage look like between drops, when there is no current drop to lead with?
- Should the hero be a video at all, or a single still photograph captioned like a museum placard?
