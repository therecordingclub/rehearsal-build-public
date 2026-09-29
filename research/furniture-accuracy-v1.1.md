# Furniture size and shape register · v1.1

Checked September 27, 2026. The editor uses one inch per model unit. Width and depth belong to the furniture; rotation places that footprint in the room. All saved center positions remain editable.

Published dimensions below establish the named product body. They do not establish which physical unit is on site. Concept dimensions are adjustable proposals, not exact product selections.

| Furniture | Editor body / allowance, inches W × D | Evidence and remaining gap |
|---|---:|---|
| Yamaha NU1X | 59.125 × 18.25 | [Yamaha manual, p44](https://data.yamaha.com/files/download/other_assets/0/1103900/nu1x_en_om_a0.pdf). Keyboard faces east. Inventory uses the broader name Clavinova, so confirm exact instrument. |
| Korg Grandstage X | 53.98 × 18.15 | [Korg specifications](https://www.korg.com/us/products/synthesizers/grandstage_x/specifications.php). Excludes music stand, support feet, pedals and occupied clearance. |
| Fender Hot Rod Deluxe IV | 23.5 × 10.4375 | [Fender product specifications](https://www.fender.com/products/hot-rod-deluxe-iv). Corrects the old rounded 10.5-inch depth. |
| Fender Rumble 500 V3 | 19 × 14 | [Fender product specifications](https://www.fender.com/products/rumble-500). Corrects inherited 23.4 × 17.4 dimensions. The named model/generation still needs an on-site check. |
| Curved sectional | 100 × 46 original proposal; 100 × 40 in Image reference | No exact SKU selected. The revised broad body has four padded seats, low arms and a shallow bow from the AI source image. Existing layouts retain their sizes; the new reference arrangement reduces the proposed depth. Both are estimates. |
| Two swivel armchairs | 30 × 30 proposals | No exact SKU selected. Model alternatives “Article Turoy / CB2 Grand” do not establish either product. Wraparound back, arms, seat and swivel base follow the approved concept. |
| Smoked-glass table | 30 diameter proposal | No exact product selected. Circle reflects the approved concept. |
| Custom bar | 48 × 26 proposal | Counter, south-end fridge bay and service space need coordinated shop drawings. Proposed depth already allows more than the old 24-inch bar. |
| Three bar stools | 15 diameter seat allowances | No exact product selected. Measure foot ring, legs and occupied space separately. |
| Piano bench / keys bench | 30 × 14 / 24 × 12 allowances | Neither model is identified. Confirm seat and projecting legs. |
| Production desk | 72 × 32 proposal | “Argosy-class” is a design description. Argosy Halo and Output Platform were alternatives, not selections. Fixed desk equipment is diagrammed as part of the desk. |
| Engineer chair | 26 × 26 allowance | Unknown model; measure arms/casters and occupied reach. |
| PMC cabinets | 15.8 × 19.7 inherited allowances | Identity and source sizes conflict. The [PMC IB1S-AIII manual](https://pmc-speakers.com/wp-content/uploads/2021/02/IB1S-AIII-manual.pdf) gives 330 × 510 mm width/depth for that variant; this does not establish the installed cabinet. Keep “model?” and measure the stand bases. |
| PA with tripod | 42 diameter setup allowance | Corrects a 14 × 14 cabinet-only floor symbol. The inventory notes a roughly 42-inch tripod base; exact stand/model unknown. |
| Drum kit and hardware | 72 × 66 setup allowance | Photos show Yamaha; inventory identifies Gretsch. The diagram shows separate shells, cymbals, stands and throne within the allowance. Neither shell selection nor hardware layout is verified. |
| Booth desk | 30 × 18 photo-derived allowance | Existing wood/steel desk; field measurement required. |

## Source hierarchy and physical shape

- [Approved room concept](../assets/approved-concept.png): visual intent for sofa curvature, leather armchairs, stools, upright, table and desk.
- `local-source/trc-rehearsal-room-build/b-fable/elements.json`: inherited proposed furniture envelopes and room coordinates.
- `scripts/build_full_room.py`: revised sofa and padded lounge-chair geometry based on the original AI image; `furniture-profiles.js` carries the matching conceptual plan silhouettes.
- `local-source/trc-rehearsal-room-astra-pack/data/gear-inventory.csv`: model identities and inherited setup allowances. The “MANUFACTURER” tag in this older file is not fresh verification; the Fender correction demonstrates why it cannot be treated as proof.
- `local-source/trc-rehearsal-room-build/shared/BRIEF.md`: retained booth kit and furniture intent. Photographs are not scale drawings.

The editor tests outlined planning shapes, including the sofa's broad padded body and shallow front recess. The sofa and lounge-chair silhouettes follow the revised full-room models and original AI image. Dashed envelopes show source allowances. Drum hardware, tripod reach and occupied circulation remain planning allowances until measured.

Existing v1.0 coordination sheets are preserved historical exports. The v1.1 editor’s corrected amp and stand dimensions do not silently rewrite those PDFs.
