# Rehearsal Room 2 dimension record audit v1.2

Date: 2026-09-27  
Scope: main room, east bay, ceiling, doors, vestibule, closet and booth  
Coordinate frame: northwest finished-floor corner is `(0,0)`; `+X` east and `+Z` south; dimensions below are inches unless stated otherwise.

## Decision

The current eight-point room polygon has the right principal size. Its north wall should use the printed `146.25`, its west wall should remain `259.50`, and the published room area is `298.75 sq ft`. The current polygon computes `298.86 sq ft`, only `0.11 sq ft` higher. That close agreement comes from the Magicplan record, not proof that every east-bay vertex was measured.

Use `188.00` as the separate 2024 plan's printed maximum-width control. Do not force the current bay vertices to that width without remeasuring the returns: changing only the current bay face from `186.96` to `188.00` increases the polygon to `299.74 sq ft` and does not resolve the two records into one surveyed outline.

The entry door belongs on the **south boundary at its west end**, hinged at the west jamb and opening north into the room. The west-wall placement at `z=223..259` is an agent misreading of the plan, not a direct instruction from Greg and not supported by the plan vectors.

Use the 2024 plan for the booth's nominal `123 x 95` body, closet `34 x 46`, south entry topology, and sliding-booth topology. Use the vector trace for a planner registration, with moderate confidence. Keep the current eight-point east bay as an explicitly estimated working outline until it is laser measured. Keep `102` as a low-confidence ceiling assumption only.

## Source hierarchy

| Rank | Record | What it establishes | Limits |
|---|---|---|---|
| 1 | `local-source/trc-drive-exec/Facilities/TRC Floor Plan Sketch.pdf`, page 1 | Rehearsal Room `298.75 sq ft`, north `12'-2 1/4"`, west `21'-7 1/2"` | Magicplan disclaims dimensional accuracy. It does not print bay segments, openings, booth or ceiling. Extracted text: `local-source/trc-canonical/_extracted/Facilities/TRC Floor Plan Sketch.pdf.txt:27,36,43-45,105-108`. |
| 2 | `local-source/trc-drive-exec/Facilities/1660 9th St Floor Plan.pdf`, page 1 | Rehearsal overall `21'-7" x 15'-8"`; closet `2'-10" x 3'-10"`; booth `10'-3" x 7'-11"`; visible door, slider and booth topology | Nominal leasing-plan dimensions, not a current field survey. The room's detailed bay runs are not printed. Extracted text: `local-source/trc-canonical/_extracted/Facilities/1660 9th St Floor Plan.pdf.txt:14-17,25-26,36-40`. |
| 3 | 2024 PDF native vectors and reproducible trace | Exact graphical jamb, slider and booth-envelope locations in the source drawing | Graphical measurements inherit plan scale and registration error and may describe older conditions. The trace explicitly says it is not site verified. See `local-source/image-blaster/trc-model/architecture/rehearsal-route-review/README.md:7-20,24-32` and `source-proof.json:1-35,125-191,193-339`. |
| 4 | May 2026 typed room model | Current eight-point working polygon and `102` ceiling | It repeats the two Magicplan controls and introduces unprinted bay vertices and ceiling. It is not an independent survey. See `local-source/claude-grid/public/responses/2026-05-28-trc-rehearsal-room-redesign-v2.html:136-151` and `local-source/claude-grid/public/responses/2026-05-30-trc-rehearsal-room-3d/README.md:13-15`. |
| 5 | Shared brief and derived build-guide records | Current design assumptions being audited | These are generated interpretations. The brief itself calls the tape polygon unverified at `local-source/trc-rehearsal-room-build/shared/BRIEF.md:8-18`; its later plan interpretation is at lines `61-79`. |

The original Magicplan and its spatial-model copy are byte-identical, SHA-256 `b6c333f52594bd9fa41eddc81964239cba6f6c0b8d99071a672ec8c7436b9eb6`. The source registry identifies both original facility plans at `local-source/trc-canonical/11-facilities.md:1-9,30-42` and `local-source/trc-canonical/_plan/manifests/11-facilities.tsv:9,13`.

## Dimension decisions

| Feature | Best existing record | Current guide | Confidence | Recommended correction |
|---|---:|---:|---|---|
| Main north wall | `146.25` | `146.28` | High for plan control | Set the recorded control and north/south baseline to `146.25`. The `0.03` difference came from decimal-foot rounding. |
| Main west wall | `259.50` Magicplan; `259.00` 2024 plan | `259.50` | High | Retain `259.50`. |
| Room area | `298.75 sq ft` Magicplan | `298.86 sq ft` derived | High for published record | Publish `298.75 sq ft`; describe the modeled `298.86` as a `+0.11 sq ft` working-outline result. |
| Maximum width | `188.00` 2024 plan | `186.96` | Moderate | Store `188.00` as a printed control. Do not alter only the bay-face X coordinate; it breaks the area agreement. |
| East bay segments | No printed segment dimensions | `54.00`, `47.23`, `102.00`, `46.06`, `57.90`; returns `30.54°` and `27.97°` | Low | Retain these only as the estimated eight-point layout proxy. Add `site verification required` to every bay-dependent fit or fabrication value. |
| Ceiling | No room-specific source dimension | `102.00` | Low | Keep `102` only as a working assumption. Laser finished floor to ceiling at three points before overhead mirror, lighting, slats or rigging. |
| Entry door | 2024 vector: south boundary, west end, `37.277` graphical width before normalization | West wall, `z=223..259`, `36` leaf | Moderate for wall and graphical jambs; low for current condition and head height | Move it to the south wall. Use normalized jambs about `x=0.99..37.31` and width `36.32`; a nominal `36` leaf is reasonable. Hinge west, swing north into room. Keep head height unverified. |
| West wall | 2024 vector shows no rehearsal-room opening | Contains D-3 | Moderate | Make it uninterrupted in the record layer. Furniture fit must be rerun after removing the invented west-wall door. |
| Booth slider | 2024 vector rough opening `72.468` before normalization | About `58.28` | Moderate | Use about `70.61` after normalization. For a planner tied to `x=146.25`, shift the vector pair west to `x=75.65..146.25`; document that `0.99` shift as registration, not a measurement. Two parallel horizontal sliding-leaf pairs are visible; current leaf position and head height remain unknown. |
| Vestibule/throat depth | Vector `30.011` before normalization | `29.00` | Moderate | Use `29.04`; current `29` is adequate at planner precision. |
| Booth body | Printed `123 x 95`; traced body about `123.91 x 95.57` after normalization | About `123.4 x 95.5`; whole trace includes throat | High for printed nominal; moderate for curve | Use printed `123 x 95` as nominal booth body and vector curve for shape. Keep the vestibule separate from the booth body dimension. |
| Booth footprint including throat | Vector-normalized trace `83.17 sq ft` | Current hand trace `82.99 sq ft` | Moderate | Current area is close. Replace its simplified southwest curve with the reproducible vector trace only if the planner needs plan fidelity; do not call either a field measurement. |
| Southeast closet/chase | Printed `34 x 46` | `33.72 x 46` | High for nominal plan size | Use `34 x 46` nominal. |
| Closet door D-2 | Printed `34` door label on a separate vertical return; photo confirms a solid door and grille | `36` leaf at east `z=218..254`, hinged south | Low to moderate | Keep the closet and a door on its vertical return. Do not claim the exact `36` width, offset or swing from the plan. Field measure all three. |
| Door/opening heads | None | `80` or `84` in various models | Low | Mark unknown. The spatial model's `2.13 m` is explicitly an unmeasured visualization convention. |

## Entry-door provenance correction

Greg's complete directional instruction in the originating session was: `and put the door in the right place`. It appears at `local-source/.codex/sessions/2026/09/26/rollout-2026-09-26T17-23-47-01a0e03f-1a51-7073-8a13-8157c47b55e7.jsonl:2056`. It does not name a wall, offset, hinge or swing. The assistant then said it would match the entrance opening to the room plan at line `2062`.

The later shared addendum states that D-3 is on the west wall at `local-source/trc-rehearsal-room-build/shared/BRIEF.md:61-74`. That statement says it came from the 2024 plan, but the native vector evidence contradicts it:

- The jamb endpoints are PDF `[236.628,468.970]` and `[279.283,468.970]` on one horizontal line. The registered opening is `0.946837 m` wide on the room's south inner face. See `local-source/image-blaster/trc-model/architecture/rehearsal-route-review/README.md:7-12`.
- The source overlay calls it a southwest primary door because it is the west-end access. It lies **in the south wall**, not in the west wall. The later wording likely converted “west-side access” into “west wall.”
- The corrected spatial record places the opening in wall `rehearsal-south` and states that its height is unmeasured at `local-source/trc-spatial-model-site/site/data/model.json:2773-2800`.
- Inspect the original `local-source/trc-drive-exec/Facilities/1660 9th St Floor Plan.pdf`, page 1; room crop `local-source/trc-rehearsal-room-build/shared/floor-plan-2024-labeled-rehearsal-crop.png`; and isolated vector crop `local-source/image-blaster/trc-model/architecture/rehearsal-route-review/rehearsal-iso-vector-crop.png`.

The source-vector position in the current room frame is approximately `x=1.01..38.29`, `z=268.15`, width `37.28`. Applying the independent Magicplan controls scales X by `0.974298` and Z by `0.967743`, producing `x=0.99..37.31`, `z=259.50`, width `36.32`. This affine normalization is appropriate for a planner registration, not a shop drawing.

## Booth and vestibule coordinate map

The reproducible source trace is `local-source/image-blaster/trc-model/architecture/rehearsal-route-review/source-proof.json:125-339`. Its raw main-frame controls are `150.108 x 268.150`. Normalizing them independently to the best Magicplan controls, `146.25 x 259.50`, gives the following planner trace:

```json
[
  [76.64, 259.50],
  [147.24, 259.50],
  [147.24, 288.54],
  [185.59, 288.54],
  [185.59, 384.11],
  [107.04, 373.34],
  [97.52, 371.28],
  [89.14, 366.88],
  [82.27, 360.51],
  [77.27, 352.52],
  [74.52, 343.25],
  [74.55, 343.27],
  [61.68, 288.54],
  [76.64, 288.54]
]
```

The first four and last points form the throat between the main-room south boundary at `z=259.50` and the booth north face at `z=288.54`. The booth body runs from `z=288.54` to `384.11`, about `95.57` deep. The trace's body width is about `123.91`; the plan's printed nominal dimensions, `123 x 95`, control labels.

If the planner must end the slider at the `146.25` south baseline instead of retaining the affine trace's `147.24`, translate only the registered slider pair `0.99` west to `x=75.65..146.25`. Do not silently move the whole booth or describe the shifted jambs as surveyed.

## Why the 2024 east-bay trace should not replace the working polygon

The vector-derived shell has more topology than the current eight-point outline: a northeast pier notch, two steeper returns, a shorter central face and a second southeast splay. In the current frame before normalization, its relevant edge values are:

| Edge | 2024 vector trace | Current working polygon |
|---|---:|---:|
| East north straight | `23.82`, then a two-face pier notch | `54.00`, no notch |
| North return | `64.49 @ 46.29°` | `47.23 @ 30.54°` |
| Bay face | `71.38` | `102.00` |
| South return | `61.58 @ 45.00°` | `46.06 @ 27.97°` |
| East south straight | `12.40`, then a second `60.81 @ 44.27°` splay | `57.90`, no second splay |

These values are catalogued at `local-source/trc-rehearsal-room-site/3d/docs/DIMENSION-AUDIT-2026-09-11.md:64-81,102-131`. The source-derived shell also has conflicting internal areas and does not reproduce Magicplan's `298.75 sq ft`; the audit records that conflict at lines `183-200`.

The vector trace proves that the bay needs a new field survey. It does not prove a better build-ready polygon. Retain the eight-point proxy for furniture planning and label the five east-bay segments estimated. Do not release desk, slat, guitar-hanger or mirror fabrication from them.

## Ceiling record

No original room plan states the Rehearsal Room ceiling height. The `102` value first appears with the generated May 30 3D room at `local-source/claude-grid/public/responses/2026-05-30-trc-rehearsal-room-3d/README.md:13-15`; the May 28 design page describes the room but gives no ceiling dimension at lines `136-151`.

The 2024 plan text `H=8'-0" W=8'-0" ±2'-6"` at `local-source/trc-canonical/_extracted/Facilities/1660 9th St Floor Plan.pdf.txt:49-52` belongs to another opening annotation and is not the rehearsal ceiling. The spatial model's `2.74 m` is marked estimated and explicitly says the cited historical Tracking Room does not map to this current Rehearsal Room at `local-source/trc-spatial-model-site/site/data/model.json:1160-1163`.

Use `102` to keep the planner operable, with `confidence: low` and `release: field laser required`.

## Record-backed planner values

```json
{
  "frame": {"origin": "NW finished-floor corner", "x": "east", "z": "south", "units": "in"},
  "mainRoom": {
    "northControl": 146.25,
    "westControl": 259.50,
    "publishedAreaSqFt": 298.75,
    "maximumWidthControl2024": 188.00,
    "eastBayGeometryStatus": "estimated working trace; site measurement required"
  },
  "ceiling": {"workingHeight": 102.00, "status": "unverified assumption"},
  "southEntry": {
    "wall": "south",
    "jambsNormalized": [0.99, 37.31],
    "graphicalWidthNormalized": 36.32,
    "nominalLeaf": 36.00,
    "hinge": "west jamb",
    "swing": "north into room",
    "status": "2024 plan-vector registration; current condition unverified"
  },
  "westWall": {"openings": [], "status": "uninterrupted in 2024 vector record"},
  "boothSlider": {
    "graphicalWidthNormalized": 70.61,
    "registeredJambs": [76.64, 147.24],
    "plannerAlignedJambs": [75.65, 146.25],
    "leafType": "two parallel sliding pairs",
    "status": "2024 plan-vector registration; leaf position and head unverified"
  },
  "vestibuleDepth": {"normalized": 29.04, "status": "plan-vector registration"},
  "boothBody": {"nominalWidth": 123.00, "nominalDepth": 95.00, "curveStatus": "plan-vector trace; not site surveyed"},
  "closet": {"nominalWidth": 34.00, "nominalDepth": 46.00},
  "doorHeights": {"status": "unknown"}
}
```

## Remaining field measurements

1. Laser all east-bay vertices, including the northeast pier/notch and any southeast splay.
2. Confirm the entry jambs, finished clear width, hinge, swing and head against the current room.
3. Measure D-2 width, offset, hinge, swing and head; measure the closet finished faces.
4. Measure slider jambs, clear opening, leaf overlap, tracks, head and wall thickness.
5. Laser the booth body's straight faces and enough points to fit its southwest curve.
6. Laser ceiling height at north, center and south, and record soffits, coffers and fixture drops separately.

Until these six checks are recorded, the planner is appropriate for layout and product-fit comparisons. It is not a fabrication or permit survey.
