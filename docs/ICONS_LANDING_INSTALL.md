# ICONS — Store Deployment Runbook

The `icons-lookbook` section is mounted on the **collection** template
`templates/collection.icons.json` and renders inside the store's normal header + footer.

## Pre-launch setup (before Aug 1)

1. **Assign the ICONS template to the collection.**
   Admin → Products → Collections → **icon-coilection** → Online Store →
   Theme template: select **ICONS**. Save. The tease now renders at
   `https://arttitude.us/collections/icon-coilection`. Keep the collection
   **published** (it is empty until Aug 1; the template supplies the tease).

2. **Confirm the Klaviyo keys.** The template ships with public key `Uu4Kt7`
   and list `VTivuP` (ICONS – Launch Notify). No action unless these change.

3. **Header treatment.** In the theme editor, view the collection with the ICONS
   template and enable Horizon's **transparent / dark header** so the near-black
   hero has no light-on-dark seam. If it doesn't cooperate on a collection
   template, the standard header is acceptable.

4. **Discovery — announcement bar.** Theme editor → header/announcement group →
   add an announcement: `ICONS — COMING SOON →`, linked to
   `/collections/icon-coilection`.

5. **Discovery — homepage banner.** Theme editor → home template → add one
   banner (image or text) linking to `/collections/icon-coilection`.

6. **Launch-day email.** In Klaviyo, open the **E3 (Drop)** campaign
   (`01KXJ8JE43JBESRN7F5M0EHWKE`) and **add list `VTivuP` as an additional
   audience** alongside segment `SmhuPJ`. Klaviyo dedupes the overlap. (This is
   the change that makes the signups worth capturing.)

7. **Verify the signup path.** Submit a test email on the collection page and
   confirm the profile lands on list `VTivuP` in Klaviyo.

## Aug 1 cutover (launch day)

1. **Flip the collection to products.** Admin → Collections → icon-coilection →
   Theme template: **ICONS → Default**. The product grid goes live.
2. **Remove discovery.** Delete the announcement bar and the homepage banner in
   the theme editor.
3. **Send E3.** Confirm E3's audience includes `SmhuPJ` + `VTivuP`, then send
   or confirm the Aug 1 schedule.

## Rollback (pre-launch)

Reassign the collection to the **Default** template and remove the discovery
entries. The `collection.icons` template is inert once unassigned.
