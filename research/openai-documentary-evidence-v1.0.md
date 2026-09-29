# OpenAI documentary evidence brief v1.0

Status: internal source brief for a full documentary proposal. The room has not been built. This file separates evidence already in the project from material that must be filmed during survey, procurement, construction, commissioning, and opening.

Checked: 2026-09-28 against the repository at `a0a1494`, the public GitHub Pages release, the v1.6.2 budget data, and the existing v1.0 recap prospectus.

## Corrected film scope

The proposed film follows one real project all the way through: Greg starts with an approved room concept and no professional design or construction background, directs Astra through wrong models and weak product choices, turns the concept into a source-backed room plan and capped procurement system, then uses that system with trades to build, test, and open the room.

This is a prospective full documentary. It is not the existing 5:30 recap. The old recap prospectus is useful preproduction work, but it ends where the decisive evidence begins. Field measurement, fixed bids, orders, construction, inspections, commissioning, final costs, and the room opening have not happened.

The story belongs in the corrections. Greg supplies taste, room-use knowledge, the budget, and the final decisions. Astra is the primary controller and final judge for the independent planning project, integrating research and bounded GPT worker contributions. The approved September 13 concept came from an earlier parallel Claude project and must be credited as the inherited visual starting point. Astra did not originate the whole design history.

There is no OpenAI commission, sponsorship, production support, endorsement, or agreement to distribute the film. The proposal can be given to OpenAI as an invitation to support or receive the completed project, provided it states that no relationship exists yet.

## Evidence map

| Phase | What happened | Astra's evidenced contribution | Greg's correction or decision | Artifact | What is verified now | What the film still needs to shoot |
|---|---|---|---|---|---|---|
| 1. Inherited direction | An approved warm, dark room concept already existed before this independent repo. | Astra froze the source image and reviewed the earlier 69-record schedule without editing the source project. | Greg approved the earlier direction and made it the visual target. | [Approved concept](../assets/approved-concept.png), [source refresh](../evidence/source-refresh.md), commit `761686c` | The source image exists; the independent repo records its provenance. | Greg explaining what he approved, why it worked, and which parts were aesthetic targets rather than dimensions. |
| 2. First construction-planning pass | The independent repo was established on September 26 and released a v1.0 guide with drawings, survey gates, shopping data, and printable packets. | Astra converted the inherited concept and records into a versioned planning artifact and defined release holds instead of treating the render as construction truth. | Greg asked for a complete, usable build plan. | Commits `d78ad64`, `761686c`; [public guide](https://therecordingclub.github.io/rehearsal-build-public/); [survey register](../evidence/pdf/build-guide-survey-register.png) | The commits, source files, and v1.0 exports exist. | Screen capture of the repo and guide; Greg describing what still felt wrong or incomplete after v1.0. |
| 3. Wrong-looking model | The first editable 3D pass exposed orientation, furniture-scale, and silhouette problems. | Astra built the editable planner, 3D scene, saved layouts, persistence, export, and QA needed to make corrections inspectable. | “make the furniture accurately sized and shaped!!” and “this new room looks like shit” | Commit `d6c2f4a`; [early 3D evidence](../evidence/planner-3d-export-v1.1.png); [planner review](../evidence/planner-review-v1.1.md) | An early 3D export and automated planner checks survive. The second quote is transcript evidence supplied for this brief, not frozen in this repo. | Original prompt and response on screen; Greg narrating why a technically functional model still failed his visual judgment. |
| 4. Preserve beauty while moving real objects | The editable layout had to drive a full-room image without discarding Greg's rearrangement. | Astra connected saved positions to the detailed room scene and a separate generated visualization, with source-preservation checks. | “when i've re-arranged the firnutire, the new rendering should be the same beautiful full rendering you had made originally, just with the new positions” | Commits `9bf7ca3`, `96f6bbe`; [layout-derived image](../evidence/room-photo-from-layout-v1.2.png); [preservation evidence](../evidence/layout-preservation-v1.3.json) | The repo preserves editable layouts, actual 3D captures, separate generated images, and identity/position checks. It does not prove pixel-identical reconstruction. | A clean screen recording: move one object, save, update 3D, generate the image, and compare the four evidence states. |
| 5. Reconcile the room itself | Conflicting plans and prior notes put an entry door on the wrong wall and left east-bay geometry and ceiling height uncertain. | Astra traced the 2024 plan vector, normalized it to Magicplan controls, moved the entry to the south wall, retained an estimated eight-point bay for planning, and labeled the `102 in` ceiling as unverified. | “also get the room dimensions right from our records” | [room-dimensions audit](room-dimensions-records-v1.2.md), [room records](../room-records.json), commit `96f6bbe`; [public room](https://therecordingclub.github.io/rehearsal-build-public/room-v1.5.html) | Record-backed controls include `146.25 in` north, `259.50 in` west, `188.00 in` maximum width, and `298.75 sq ft` published area. The east bay, door current condition, booth details, and ceiling still need a site survey. | Laser survey with source plan in frame; every discrepancy logged; both raised storage-door areas measured separately. |
| 6. Replace generic furniture with sourced products | The concept's curves and proportions could not be represented by generic blocks or arbitrary retail substitutes. | Astra researched manufacturer dimensions, reconstructed product-shaped planning geometry, stored source images and tearsheets, and tested fit in the room model. | “no but i need you to find available ones and place those in the image with the proper dimensions” and “that couch sucks. Find one that actually fits the original design!!!” | [sofa source match](sofa-source-match-v1.3.md), [furniture accuracy](furniture-accuracy-v1.1.md), [C9 source folder](../assets/products/craftmaster-c9-conversation-sofa/), commit `96f6bbe` | The C9 planning body is `112 x 38 x 37 in`; the repo preserves manufacturer evidence and fit tests. Upholstery acceptance, availability, price, lead time, delivery route, and occupied clearance remain open. | Product sample and showroom footage; delivery-route mockup; Greg accepting or rejecting the real material and occupied fit. |
| 7. Account for every visible element | Greg expanded the job from a room image to every wall, mirror, desk, lighting element, furniture item, service, and hold point. | Astra assembled the v1.5 installation system: 37 scopes, 158 component or service lines, 227 ordered steps, and 112 acceptance checks, plus a 72-page printable guide and material-kits export. | “i mean EVERYTHING - all the walls mirrors desk every last detail of the room needs to be found and priced out” | [installation guide](https://therecordingclub.github.io/rehearsal-build-public/index.html#install), [installation QA](../evidence/qa-v1.5-installation.json), commit `f8f4250` | Automated QA verifies all 37 kits render in order with 158 components and 227 steps; the guide data contains 112 acceptance checks. These are planning records, not proof of installation. | Trades reviewing their packets, requesting changes, releasing shop drawings, and signing checks in the room. |
| 8. Force the design under the cap | The planning target became an all-in room cap with materials, paid labor, tax, freight, contingency, and a film placeholder. | Astra built a sourced procurement ledger, pricing classifications, alternatives, release gates, three mutually exclusive allocations, editable overrides, and CSV/JSON exports. | “your budget is $25k all in” | [public budget](https://therecordingclub.github.io/rehearsal-build-public/budget-v1.6.html), [v1.6.2 options](budget-options-v1.6.md), [HTTP receipt](../evidence/public-budget-v1.6.2-http.json), commits `6c6e2c5`, `a0a1494` | Price revision 1.6.2 calculates $24,948.52 balanced, $24,953.78 ceiling-first, and $23,257.16 functional studio plus reserve. Retail prices are source checks; labor and custom work remain allowances until fixed bids. | Quote comparisons, value-engineering decisions, purchase approvals, receipts, change orders, and final paid-cost reconciliation. |
| 9. Stop before pretending the plan is build-ready | A completeness audit identified signed field data, engineering, shop drawings, circuits, finish decisions, AV documentation, and both raised storage-door platforms as builder-stopping gaps. | Astra kept unresolved conditions visible, wrote measurement and trade-release gates, and staged a request for the site survey. | Greg required the dimensions to come from records and the real room rather than invented geometry. | [completeness audit](build-completeness-audit-v1.5.md), [measurement request](../measurement-request-v1.0.html), [staging receipt](../outgoing/jacob-measurement-request-v1.0-receipt.json), commit `79ec3cc` | The request is staged with status `pending Greg Send`. No reply or measurement result is recorded. Both raised storage areas, one on each side of the speaker wall, remain unmeasured. | Greg sends the request; Jacob or surveyor measures both areas; trades mark up the guide; revised issued set is dated and signed. |
| 10. Build and open | Survey, fixed bids, purchasing, construction, commissioning, cost closeout, and opening are the documentary's second half. | Astra can update the model, budget, scopes, and acceptance records as field facts replace assumptions, then judge whether evidence supports each release. | Greg retains purchase, design, trade, and opening decisions. | No completed-build artifact exists. The [current room photo](https://therecordingclub.github.io/rehearsal-build-public/assets/current-room.jpeg) is the before state. | Nothing in the repo proves that construction started, an item was ordered, a scope was installed, a test passed on site, or the room opened. | The full physical story: survey, bids, samples, orders, demolition, concealed work, installations, corrections, testing, punch list, first use, reveal, final cost, and matched before/after. |

## The conflict-and-resolution spine

### Beauty versus control

The inherited concept was visually convincing, but a beautiful image could not be rearranged, measured, purchased, or handed to a builder. The first editable model solved control and lost the look. Greg's blunt rejection forced the system to carry both: editable, dimensioned positions in 2D and 3D, plus a separate full-room visualization generated from the selected arrangement. The film should show all four states with permanent labels: real room, inherited concept, actual 3D model, and generated visualization.

### Records versus confident geometry

The room had competing plans, notes, and generated dimensions. One shared note put the entry door on the west wall; the source vector put it on the south wall. Astra corrected the planning record but did not turn the correction into a field measurement. The same audit kept the east bay and ceiling on hold. This is a strong scene because the resolution is a better claim boundary, followed by a real survey, rather than a more confident render.

### Taste versus purchasability

Generic furniture blocks were the wrong shape. Some available couches fit a dimension but missed the approved design. The C9 research connected Greg's visual rejection to a specific manufacturer configuration and room envelope. The resolution is still provisional until a dealer confirms fabric, price, lead time, delivery, and the room passes a taped occupied-layout test.

### Completeness versus false readiness

“Every last detail” produced a much more complete guide and budget, then exposed what software could not certify: substrates, backing, circuits, attachment loads, field templates, fixed bids, and existing-condition measurements. The planning artifact becomes credible when it stops work at those boundaries. The documentary must follow each major stop through release, installation, and inspection.

### Cap versus original visual ambition

The $25,000 limit forced visible changes: stock wall mirrors instead of custom glass, retained honey floor and black ceiling, targeted slats, simpler bar construction, and mutually exclusive budget options. The balanced plan is $51.48 under the cap before field bids replace allowances. The film should record which choices survive contact with quotes and which are cut, revised, or funded by offsets.

## Exact Greg prompt excerpts and publication provenance

Keep spelling, capitalization, and punctuation unchanged when these appear on screen.

| Exact excerpt | Repository status | Publication requirement |
|---|---|---|
| “make the furniture accurately sized and shaped!!” | Frozen in [recap prospectus v1.0](recap-prospectus-v1.0.md). | Cite the original transcript or show its dated screen capture in the final evidence ledger. |
| “this new room looks like shit” | Supplied as an exact prompt excerpt for this evidence brief; not found in the repo. | Preserve the original transcript locator and capture before scripting it as verified on-screen text. |
| “when i've re-arranged the firnutire, the new rendering should be the same beautiful full rendering you had made originally, just with the new positions” | Supplied as an exact prompt excerpt for this evidence brief; not found in the repo. | Preserve the original transcript locator and capture. Keep `firnutire` unchanged. |
| “also get the room dimensions right from our records” | Supplied as an exact prompt excerpt for this evidence brief; not found in the repo. | Pair the transcript capture with the room-record audit and subsequent field survey. |
| “no but i need you to find available ones and place those in the image with the proper dimensions” | Supplied as an exact prompt excerpt for this evidence brief; not found in the repo. | Pair the transcript capture with manufacturer pages, local source folders, and the resulting model. |
| “that couch sucks. Find one that actually fits the original design!!!” | Supplied as an exact prompt excerpt for this evidence brief; not found in the repo. | Pair the transcript capture with rejected candidates, the C9 tearsheet, and Greg's eventual physical-sample decision. |
| “i mean EVERYTHING - all the walls mirrors desk every last detail of the room needs to be found and priced out” | Frozen in [recap prospectus v1.0](recap-prospectus-v1.0.md). | Pair it with the installation system and budget ledger. |
| “your budget is $25k all in” | Supplied as an exact prompt excerpt for this evidence brief; not found in the repo. | Pair the transcript capture with price revision 1.6.2 and the final paid-cost closeout. |

The repo corroborates the work those prompts produced. It does not independently establish the six transcript-only quotations. The final production should maintain a quote ledger containing the original conversation identifier, turn or line locator, date, speaker, exact text, screen capture, and edit used.

## Budget facts the proposal can use

Price revision 1.6.2, checked September 28, 2026:

| Option | All-in planning total | Headroom under $25,000 | What the number means |
|---|---:|---:|---|
| Balanced, recommended | $24,948.52 | $51.48 | Materials, paid labor allowance, permits or services, $1,000 film allowance, 10% material-tax reserve, 3% freight reserve, and 10% contingency. |
| Ceiling-first | $24,953.78 | $46.22 | Restores the affordable lit ceiling inset and defers other items, including bar stools. |
| Functional studio plus reserve | $23,257.16 | $1,742.84 | Keeps more reserve by deferring decorative and millwork scope. |

The $1,000 film line belongs to the old short-recap scope. It does not credibly fund a full documentary that follows survey through opening. The OpenAI proposal should preserve the room's $25,000 all-in constraint and budget documentary production separately. It must not turn the legacy $1,000 line into a claim that the full film is funded.

## Claims supported now

- Greg directed an AI-assisted room-planning project while bringing deep music, studio-operation, and room-use experience but no claimed professional design or construction background.
- An earlier parallel Claude project produced the approved visual concept; Astra inherited it for the independent planning work.
- Astra served as primary controller and final judge for the independent repo while bounded GPT workers handled isolated contributions.
- The project went through documented corrections to furniture geometry, layout-to-render integration, room records, product selection, installation scope, and budget architecture.
- The public release contains an editable room presentation, a source-backed guide, a v1.5 installation system, and a v1.6.2 procurement budget.
- The planning system keeps material uncertainties and field-release gates visible rather than labeling the render build-ready.
- The current v1.6.2 options calculate under the $25,000 cap using sourced retail checks and stated allowances.

## Claims not supported yet

- OpenAI commissioned, sponsored, supported, approved, or agreed to distribute the project or film.
- Astra or OpenAI originated the earlier approved concept or performed every contribution without Claude or bounded GPT help.
- The room dimensions are fully field verified or the guide is a permit, fabrication, engineering, or trade-issued construction set.
- Either raised storage-door area beside the speaker wall has been measured, designed, priced, or released.
- Retail availability, quoted labor, custom fabrication, tax, freight, or allowances equal final paid costs.
- Products were ordered, work started, the room was built, acceptance checks passed on site, savings were realized, or the room opened.
- The generated room image is a photograph, an exact prediction, or proof that the modeled layout will work when occupied.
- The complete documentary can be made for the old $1,000 recap allowance.

## Missing evidence and capture gates

Before physical work:

- Lock and log one reproducible before-camera position, lens, height, tilt, time of day, and lighting state.
- Capture all walls, ceiling, booth, utilities, door swings, delivery route, and both raised storage-door areas on the two sides of the speaker wall.
- Preserve the eight quoted prompts with original transcript locators and screen captures.
- Export immutable copies of the concept, early model, current model, current visualization, guide, budget, and source ledger.

During field verification and bidding:

- Film M-01 through M-16 with the measurement, datum, location, and plan mark visible together.
- Measure each raised storage area separately: width, depth, height above the main floor, edge or nosing, slopes or steps, door threshold, wall-corner offsets, and door clearance.
- Record every plan-to-field discrepancy and the model, drawing, quantity, or budget line it changes.
- Capture trade markups, fixed bids, sample decisions, engineering or shop-drawing releases, and rejected options.

During procurement and construction:

- Preserve dated approvals, purchase orders, receipts, delivery checks, substitutions, change orders, and returned items.
- Film concealed backing, wiring, drivers, supports, cable paths, ventilation, and service access before closure.
- Record each field correction as a chain: condition found, Greg's decision, Astra update, trade release, installed result, inspection evidence.
- Keep milestone footage for protection, removals, rough-in, walls, mirrors, millwork, lighting, AV, furniture, and styling.

At commissioning and opening:

- Record door, slider, chair, instrument-removal, appliance, ventilation, lighting, AV cold-start, cable, and service-access tests.
- Close the punch list and retain signed or dated acceptance evidence.
- Recreate the before angle, then capture concept, model, visualization, and installed-room comparisons without hiding divergences.
- Close final costs against price revision 1.6.2 with invoices and change reasons.
- Film first use of the room and Greg's unscripted reaction before scripting retrospective claims.

## Public evidence routes

- [Build guide and source-backed project hub](https://therecordingclub.github.io/rehearsal-build-public/)
- [Installation system](https://therecordingclub.github.io/rehearsal-build-public/index.html#install)
- [Room, actual 3D, generated visualization, and record notes](https://therecordingclub.github.io/rehearsal-build-public/room-v1.5.html)
- [v1.6.2 procurement budget and three allocations](https://therecordingclub.github.io/rehearsal-build-public/budget-v1.6.html)
- [Existing room before construction](https://therecordingclub.github.io/rehearsal-build-public/assets/current-room.jpeg)
- [Inherited approved concept](https://therecordingclub.github.io/rehearsal-build-public/assets/approved-concept.png)
- [Corrected actual 3D capture](https://therecordingclub.github.io/rehearsal-build-public/assets/room-3d-v1.4.png)
- [Generated visualization from the planned room](https://therecordingclub.github.io/rehearsal-build-public/assets/room-photo-v1.4.png)
- [Old 5:30 recap prospectus, useful as preproduction only](https://therecordingclub.github.io/rehearsal-build-public/recap-prospectus-v1.0.html)

All nine public routes returned HTTP 200 during this evidence check. The public pages prove publication of the planning artifacts. They do not prove field verification or construction.
