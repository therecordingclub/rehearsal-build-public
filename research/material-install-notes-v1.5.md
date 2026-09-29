# Material + installation source packet v1.5

Verified against current manufacturer pages and manuals on 2026-09-28. This packet turns the selected/candidate systems into quote-ready scopes. It does not replace the current manufacturer manual, permit documents, trade shop drawings, or project-specific structural/electrical design.

The machine-readable companion is [`material-install-sources-v1.5.json`](material-install-sources-v1.5.json).

## Release map

| Guide scope | Proposed package | Buy status | Gate before release |
|---|---|---|---|
| BAR-05 | Zephyr PRB15C01CG beverage cooler | Select + verify fit | Coordinated bar shop drawing; nominal 24 in flush depth does not fit the documented body + plug allowance |
| LGT-01–04, LGT-07 | Diode BLAZE 100 + black S1 + OMNIDRIVE | Sample + engineer runs | Field lengths, separate feeds, loads, voltage drop, driver access, control protocol and dimming mockup |
| FIN-01 | Karndean SCB89 | Sample + quote | Existing-floor construction, substrate/moisture/flatness, finished buildup, transitions and field area |
| SEAT-04 | Eco-Plush 1/4 in felt pad | Select after rug | Approved large furniture-anchored rug and written floor compatibility |
| FIN-02–03 | FR701 + GeoTRAK + WoodUpp 1029 | Sample + dealer quote | Complete assembly, return height joint, structural backing and current test documentation |
| LGT-05–06 | Nora NM4-RDC27BB + WAC HT4-BK/Silo X20 | Mock up | Ceiling cavity/structure, photometrics, exact feed/accessories, controls, TV/instrument glare |
| GTR-01–02 | String Swing CC01K/CC01 | Inventory + field fit | Each instrument's neck, weight, finish and removal arc; full-size elevation; verified backing |
| FIN-04 | Aura Matte N522 | Sample + painter quote | Solid-surface schedule, substrate/primer, large 2700K color/sheens mockup |
| MIR-01–02 | Omega samples + custom retained mirror assemblies | Samples only | Field templates; glazier/support-designer shop drawings; panel/total weights; mechanical retention |

## 1. Bar refrigerator — BAR-05

### Buy / quote

- **1 × Zephyr PRB15C01CG**, Presrv 15 in single-zone beverage cooler.
- **1 × optional matte-black handle kit**, either contemporary `PRHAN-C104` or pro `PRHAN-C004`. Pick one style after the bar-hardware sample; do not order both.
- **Optional `PRDC-C03` drink caddy** only if Greg wants it after checking usable storage.
- **Maintenance stock:** replacement carbon filter `Z0F-C004`; confirm the current manual's replacement interval.
- Millworker/electrician extras: accessible grounded receptacle, cord/plug space, finished opening, ventilation and removable service route. These are not appliance accessories.

Zephyr lists one black wood rack, two adjustable glass shelves, carbon filtration, lock and field-reversible door as appliance features. The drink caddy and decorative handle kits are listed accessories.

### Dimensions that control the bar

- Unit: **15 W × 23-3/8 D × 33-7/8 to 34-7/8 H in**.
- Opening: **15-1/8 W minimum × 34 H minimum in**.
- Rear electrical-plug space: **1 in minimum**.
- Hinge-side space beside a wall: **2-1/4 in minimum**.
- Keep the front grille open.

The 23-3/8 in appliance plus 1 in plug space needs **24-3/8 in before finish tolerance**. A nominal 24 in deep flush bar is not a verified fit. The millworker must either deepen the casework, coordinate a legitimate rear recess, or show an intentional face projection.

### Installation sequence

1. Select hinge side and handle. Draw the door swing against the adjacent wall/cabinet and show the appliance-removal path.
2. Millworker and electrician issue one shop drawing with the exact opening, rear plug zone, receptacle, front vent, finished floor, face projection and service access.
3. Complete floor and casework, then inspect the opening and receptacle before delivery.
4. Level the refrigerator, fit the selected handle, route the cord without pinching it and slide the unit into the approved position.
5. Confirm the grille is unobstructed; test door swing/reversal, lock, shelves, alarm, temperature, light and pull-out service.

### Do not release until

- The shop drawing resolves the 24-3/8 in minimum body-plus-plug depth.
- The current manual's electrical requirements and local code are on the electrical drawing.
- Fixed trim does not block the grille or future removal.

Primary sources: [Zephyr product page](https://zephyronline.com/product/presrv-single-zone-beverage-cooler-15-inch/), [installation/user manual](https://docs.zephyronline.com/docs/manuals/PRB15C01CG_manual.pdf), [specification](https://docs.zephyronline.com/docs/specs/Presrv_PRB15C01CG_spec.pdf).

## 2. Linear lighting — LGT-01, LGT-02, LGT-03, LGT-04, LGT-07

### Buy / quote

- `DI-24V-BLBSC1-27-016`: BLAZE 100, 24V, 2700K, 90+ CRI tape. Quote from measured segments and cut points, not only the combined guide length.
- `DI-CHB-S1-96B`: 96 in black S1 channel bundle with classic frosted lens, by straight segment plus waste/spares.
- `DI-CHB-S1-ACCB`: black S1 accessory packs by the joint/end/feed schedule. Have the distributor deduct accessories already supplied in each channel bundle.
- `DI-ODBELV-24V96W-LPS`: 24V 96W OMNIDRIVE Basics Class 2 drivers by the signed zone/load/voltage-drop schedule.
- Project-specific Diode-compatible tape-to-wire connectors or factory/soldered leads, Class 2 wire, junctions, feed wire, labels and control devices.

The selected tape is **1.46 W/ft, 113 lm/ft, 3.93 in cut points, 55 ft maximum run per feed**. The driver is **24V, 96W, no minimum load, IP20**, and is manufacturer-listed to dim to 5 percent. Those limits do not prove that every proposed tape length, wire run or dimmer combination works.

### Required drawing before purchasing

Create a row for every physical run:

`zone · guide item · measured path · channel segments · tape cut length · feed end · connected watts · driver · line-voltage circuit · low-voltage wire length/gauge · expected voltage drop · control · access panel`

The current roughly 71.76 ft room-perimeter estimate must be split into multiple feeds because BLAZE's maximum run is 55 ft. Arch heads also need a separately approved flexible or segmented detail; straight S1 channel should not be forced around the curves.

### Installation sequence

1. Field-measure every light path and finalize the run/feed/load/control schedule.
2. Bench-test the exact tape, lens/channel, driver, dimmer, representative wire length and black finish. Approve low-end behavior, flicker on camera, color, heat and diffusion.
3. Electrician roughs in circuits, required neutrals, accessible driver/junction locations and Class 2 conductors. Keep power supplies out of sealed mirror/fabric/millwork cavities.
4. Dry-fit channels, lens lengths, joints, ends and feed holes. Resolve the curved arch detail in writing before finishing adjacent surfaces.
5. Clean channels. Cut tape only at marked cut points. Make polarity-correct listed connections. Test every section before snapping the lens into place.
6. Commission each zone at high and low output; label circuits, drivers and access panels; record final lengths and loads.

### Do not release until

- A licensed electrician and the Diode distributor approve load, Class 2, conductor and voltage-drop design.
- The current **DMX versus wall dimmer** decision is resolved.
- Every driver and junction remains removable.
- The arch light method is approved for its actual bend and cut geometry.

Primary sources: [BLAZE page](https://www.diodeled.com/blaze.html), [BLAZE specification](https://www.diodeled.com/custom/download/productFile/filename/DI-BLBSC-Specification%20Sheet.pdf), [S1 channel](https://www.diodeled.com/s1-channel.html), [OMNIDRIVE specification](https://www.diodeled.com/custom/download/productFile/filename/DI-ODBELV-Specification%20Sheet.pdf), [CLICKTIGHT PRO installation guide](https://www.diodeled.com/custom/download/productFile/filename/CLICKTIGHT-PRO-Installation%20Guide.pdf/).

## 3. Main floor + rug pad — FIN-01, SEAT-04, BOO-02

### Buy / quote

- Karndean Van Gogh Rigid Core **Ebony `SCB89`**, 48 × 7 × 0.177 in, 20 mil wear layer, 23.64 sq ft/carton.
- Current estimating takeoff: **14 cartons = 330.96 sq ft** against a 328.63 sq ft allowance. Recalculate after field survey, layout waste, batch availability and spare-stock decision.
- Matching thresholds, reducers, edges or skirting only after actual finished elevations and door clearances are known.
- For the large furniture-anchored lounge rug: custom-cut **RugPadUSA Eco-Plush 1/4 in**, 100 percent heat-pressed felt. Product examples finish two inches shorter in each overall dimension.

Eco-Plush has no grip layer. It is suitable only if the large rug is held by heavy furniture and the floor manufacturer accepts it. Karndean says not to use rubber-backed mats; this all-felt option avoids that specific conflict.

### Existing-floor and substrate gate

- Identify whether the existing oak LVP is floating or adhered. Karndean requires removal of laminate, floating floors and cushion-backed flooring.
- Substrate must be solid, sound, smooth, clean and level. Karndean limits unevenness to **3/16 in over 10 ft**.
- Record concrete moisture tests as directed by Karndean; wood subfloor moisture must be **13 percent or less**.
- Fixed cabinets and permanent fixtures are installed before the floating floor. Maintain the manufacturer's expansion space around them; do not pin floating planks below bar/cabinet bases.
- Treat the booth floor/retained rug as a separately field-confirmed transition rather than assuming SCB89 continues into it.

### Installation sequence

1. Approve full-size floor and rug/pad samples under the actual 2700K lighting.
2. Survey room area, plank direction, existing floor, substrate, flatness, moisture, doors, thresholds, fixed millwork and booth transition. Issue demolition and transition details.
3. Remove incompatible floor layers; repair/clean the substrate; log flatness and moisture; acclimate/store material exactly as the current guide requires.
4. Install fixed bar/cabinet bases. Install SCB89 with the current expansion, stagger, cutting and locking instructions.
5. Fit transitions and trim without trapping the floor. Protect it through remaining work and retain labeled spare planks/carton data.
6. Install the pad only after furniture/rug placement is approved. Keep it fully concealed beneath the rug and inspect all edges.

### Do not release until

- Existing LVP construction and substrate are known.
- The installer accepts moisture/flatness and warrants the exact assembly.
- Karndean confirms any separate underlay; none is assumed.
- Rug size, furniture anchoring and pad/floor compatibility are documented.

Primary sources: [SCB89 product page](https://www.karndean.com/en-us/floors/products/ebony-scb89), [U.S. rigid-core installation guide](https://www.karndean.com/globalassets/karndean/b2c-blocks/b2c-document-listing-block/usa/installation-guides/karndean-rigid-core_plank-and-tile-installation-guide-usa.pdf), [Eco-Plush 1/4 in](https://www.rugpadusa.com/products/eco-plush-1-4).

## 4. Fabric walls + slat returns — FIN-02, FIN-03, GTR-01

### Buy / quote

- Guilford of Maine **FR701 style 2100, Black 408**, 66 in usable width. Dealer takeoff must include seam direction, matching dye lot, waste and repair stock.
- Black **FabriTRAK GeoTRAK**, profile depth chosen from 1/2, 1 or 1-3/8 in after the acoustic core/build-up is designed.
- Acoustic core, perimeter/junction profiles, outlet/HVAC details and labor as part of the dealer's complete assembly.
- **WoodUpp Akupanel item 1029**, Black Wrapped on Black Felt, 94.49 × 23.62 × 0.866 in, for the two approved slat returns.
- WoodUpp black installation screws or approved substrate-compatible equivalent. Manufacturer's direct-wall guide uses about 15 screws per panel; an expanded batten installation needs its own approved schedule.

FR701's component data and GeoTRAK/WoodUpp component data do not prove the completed wall's fire or acoustic performance. WoodUpp's “Class A” statement is an **acoustic absorption class** for the stated 45 mm batten + insulation assembly, not a fire-class claim.

### Drawing / material schedule

Show every wall elevation with:

- Retained acoustic construction versus new solid substrate.
- Track depth, core, perimeter, seams and FR701 direction.
- Doors, outlets, HVAC, trim removal, service panels and transitions to paint/slats.
- Slat panel cuts, joints, top/bottom closures and return angles.
- Independent backing for TV, instruments and other loads.

The 94.49 in WoodUpp panel is **7.51 in short** of the nominal 102 in return. Resolve with an approved base/header/joint or select a taller product. Do not stretch the published panel dimension.

### Installation sequence

1. Acoustician surveys existing absorptive work and identifies what stays, moves or is replaced.
2. FabriTRAK dealer and finish carpenter issue coordinated shop drawings and current complete-assembly test documentation.
3. Approve physical FR701, WoodUpp and edge/junction samples under room lighting. Reserve one fabric dye lot and one panel batch.
4. Rough in services and independent structural backing. Photograph backing before it is covered.
5. Install substrate/core/track, then tuck FR701 with controlled tension and clean corners. Install WoodUpp using the approved direct-wall or expanded build-up; re-secure cut slat ends to felt as WoodUpp directs.
6. Finish penetrations, transitions and removable access. Retain labeled repair fabric/panel stock.

### Do not release until

- A qualified dealer owns the complete fabric-track/core assembly.
- The acoustician approves demolition and replacement scope.
- The WoodUpp height shortfall and fire documentation are resolved.
- TV/instrument fasteners land in verified structure/backing rather than slat, felt, fabric track or acoustic core.

Primary sources: [FR701 2100-408](https://guilfordofmaine.com/swatches/2100-408), [GeoTRAK](https://www.fabritrak.com/products/geotrak), [FabriTRAK system brochure](https://www.fabritrak.com/uploads/Master-Brochure_Combined_03_27_25.pdf), [FabriTRAK fire-test index](https://www.fabritrak.com/resources/test-reports/fire-tests), [WoodUpp wall installation](https://woodupp.com/pages/installation-guide/akupanel-installation-on-wall-with-screws), [WoodUpp Akupanel](https://woodupp.com/products/akupanel).

## 5. Downlights + guitar-wall track — LGT-05, LGT-06, LGT-07, BOO-03

### Buy / quote

- **6 × Nora `NM4-RDC27BB`** main-room downlights: 4 in round deep-cone reflector, 2700K, matte black, 15W, 1027 delivered lumens, 90+ CRI, 37-degree beam.
- Optional new-construction frames only where required. Nora's current product materials refer to `NFC-R375`; an older instruction sheet refers to `NMF-3`. Obtain written confirmation of the current compatible frame before purchase.
- **1 × WAC `HT4-BK`**, 4 ft black, 120V single-circuit H Track.
- **4 × WAC `H-2020-927-BK`**, Silo X20 black 20W H-track heads, 2700K/90 CRI, adjustable 15–50 degree beam.
- Black live end/feed and end cap from the WAC H-track family. Electrician selects the exact feed connector after determining feed side and junction geometry.
- Booth lights remain a separate selection unless the reflected-ceiling plan approves the same Nora fixture there.

Nora dimensions: **3.5 in cutout, 4.5 in trim, 4.875 in height**. It is IC airtight and wet-location rated, but Nora excludes direct contact with spray foam. The listed maximum driver-to-module connection is 40 ft.

WAC rates HT4 to 1920W; four selected heads total 80W nominal. The selected heads deliver 715 lm at 15 degrees to 985 lm at 50 degrees according to WAC's table.

### Installation sequence

1. Issue a reflected-ceiling/photometric drawing showing mirror exclusion/support, downlight centers, track/feed, ceiling depth/structure/insulation, drivers/junctions, circuits and controls.
2. Mock up one Nora and one WAC head against black finishes. Test full/low dimming, camera flicker, beam, TV/mirror glare, instrument lighting and seated sightlines.
3. Licensed electrician shuts off power, scans cavities/services/structure, roughs in wiring/boxes/controls and installs any confirmed frames.
4. Cut Nora openings with the manufacturer's template, connect the prewired driver/J-box, preserve access and seat the module on its spring clips.
5. Support/install H Track. Follow WAC's grooved-side polarity instruction for the live end and each head; insert, rotate 90 degrees and confirm the locking tab seats.
6. Aim track heads only after the TV and real instruments are mounted. Commission and label zones at full and minimum output.

### Do not release until

- Ceiling cavities, structure, insulation, mirror supports and services are verified.
- Nora confirms any optional frame SKU.
- The electrician selects feed hardware and support fasteners from actual conditions.
- Final TV/instrument positions are present for aiming and glare approval.

Primary sources: [Nora product page](https://noralighting.com/product/nm4-rdc/), [Nora specification](https://noralighting.com/wp-content/uploads/2021/09/NM4-RDC_spec.pdf), [Nora installation instructions](https://noralighting.com/wp-content/uploads/2022/01/IS-NM4-RDC.pdf), [WAC H Track](https://waclighting.com/product/h-track/), [H Track instructions](https://www.waclighting.com/storage/waclighting-images/inst_sheet/HT4_IN_0.pdf), [Silo X20](https://waclighting.com/product/silo-x20/).

## 6. Instrument hangers — GTR-01, GTR-02

### Buy / quote

- **String Swing `CC01K` in Black Walnut** for each instrument that fits its Keeper yoke.
- **Original `CC01` yoke/hanger** where String Swing directs a wider classical or bass neck; assign by measurement, not instrument category alone.
- Carpenter-supplied blocking/backing, finish spacers if required, and new fasteners selected for the verified wall/support assembly.

CC01K is rated by String Swing for instruments up to **15 lb**. The manufacturer says the Keeper removal motion needs about **2 in of lift, then forward movement**. Full headstock/body/hand clearance is additional.

### Instrument schedule before purchase

For every displayed instrument record:

`owner/model · weight · overall W/H/D · neck width at yoke · headstock shape · finish · assigned CC01K/CC01 · yoke center · lift/removal envelope · adjacent TV/speaker/ceiling clearance`

The source inventory lists one guitar and five basses; the design target is ten display positions. Confirm the actual collection and any remaining instruments before releasing hangers. Do not reduce instrument envelopes to force the elevation.

### Installation sequence

1. Complete the instrument schedule and fit each neck to a sample yoke.
2. Template the actual TV, speakers, every full-size instrument, yoke centers, removal arcs and hand clearances on the wall.
3. Locate structure/services and issue backing/fastener drawings coordinated with slat/fabric thickness.
4. Install and photograph backing before finishes close.
5. Mount each block level through finish layers into verified backing with new compatible fasteners. Fit the assigned yoke.
6. Load/test one instrument at a time for pivot, retention, finish contact and removal clearance. Document each assigned location.

### Do not release until

- Weight, neck/headstock and finish are known for every instrument.
- Greg approves the full-size field-fit elevation.
- Hangers land in independent verified backing.
- No supplied drywall anchor is reused; String Swing warns against anchor reuse.

String Swing says its padding does not eat nitrocellulose, but prolonged pressure and under-cured nitro can still mark. Clean padding with water only, keep it dust-free and include contact-point inspection in maintenance.

Primary sources: [CC01K product and installation page](https://www.stringswing.com/guitar-hanger-hardwood-wall-mount-for-acoustic-and-electric-guitars/), [CC01K-style replacement yoke](https://www.stringswing.com/yoke-cradle-replacement-2-inch-bolt-length-cc01k-style/), [nitrocellulose statement](https://www.stringswing.com/nitrocellulose-statement/).

## 7. Matte-black paint — FIN-04

### Buy / quote

- **Benjamin Moore Aura Waterborne Interior Matte `N522`**, in a sampled black such as Black `2132-10`, for approved solid ceiling/wall/trim surfaces.
- Benjamin Moore primer/sealer/stain blocker selected by the painter from the actual substrate and current Aura TDS.
- Optional **Scuff-X Matte `N484`** in the approved black formula for doors/trim or other high-touch solid surfaces, only if its sheen/color mockup matches.
- Masking/protection, patching, sanding, dust control and labeled touch-up stock.

Aura's theoretical spread rate is **350–400 sq ft/gal** at 4.3 mil wet/2.1 mil dry. That is not a buy quantity. The painter must measure the solid-surface area and price the substrate-specific primer and coat schedule.

### Installation sequence

1. Finish schedule separates solid plaster/drywall, ceiling, trim/doors, acoustic fabric/core, slat panels, equipment and items that remain unpainted.
2. Make large sample boards using the intended primer and two finish coats. Review them under full and minimum 2700K light beside the floor, mirror, fabric, slat and furniture samples.
3. Complete rough-ins/patching. Protect acoustic finishes, equipment, labels, openings and mirror interfaces.
4. Clean, repair, sand and dust substrates; test adhesion; isolate stains or incompatible coatings with the manufacturer-recommended primer.
5. Apply primer/finish within TDS temperature and recoat limits, keeping batches and wet edges consistent. Inspect black work with grazing light before final coat.
6. Let coating cure before mirror adhesive/retention, finish hardware, cleaning or abrasion. Record formula, sheen, batch and touch-up stock.

Aura lists about 1 hour to touch/recoat at 77 F and 50 percent RH and says surfaces may be washed after two weeks. Actual drying varies with temperature, humidity, film and ventilation. Manufacturer application range is 50–90 F.

### Do not release until

- Primer/prep is selected from actual substrate and existing coating condition.
- A large 2700K sample establishes color and sheen.
- Paint exclusions protect acoustic fabric/core, labels, vents, electrical hardware and mirror bonding/retention surfaces.

Primary sources: [Aura Matte N522 technical data](https://media.benjaminmoore.com/WebServices/prod/assets/production/datasheets/TDS_0522/522_TDS_US.pdf), [Aura N522 product page](https://store.benjaminmoore.com/storefront/us/en/coating/interior-paints/benjamin-moore/aura-interior-paint/aura/p/N522), [Scuff-X Matte N484](https://www.benjaminmoore.com/en-us/product/scuff-x-interior-paint-matte/N484).

## 8. Decorative wall + ceiling mirrors — MIR-01, MIR-02, LGT-02, LGT-03

### Buy now

- Physical Omega **Dark Cloud Antique**, **Smoky Quartz Mirror** and **Gold Vein Overlay Mirror** samples.
- One illuminated full-size visual mockup with the shortlisted mirror, black/brass edge, backing appearance and proposed LED separation.

### Quote after field templates

- Five wall arches with glazier-selected glass/mirror build-up, thickness, safety backing or lamination, edge treatment, pattern orientation and mechanical retention. Current 24 in widths and 80/86/92/86/80 in heights are design coordinates, not cut sizes.
- One nominal 96 × 96 in overhead visual zone, split into support-designer-approved modules with documented panel/total weights, safety build-up, mechanically captured edges/intermediates and removable service access.
- Sealed/cured substrate, soft setting blocks/spacers, J-channel/frame/clips or another approved mechanical-capture system, and mirror-rated neutral-cure sealant/mastic only where the mirror fabricator confirms compatibility.

Do not name a generic adhesive or anchor as universally compatible. The selected mirror backing, substrate coating, setting materials and retention metals must be submitted together. Walker Glass recommends dry/stable storage and substrate, smooth/sealed/cured backing surfaces, late installation, controlled panel size and a combination of appropriate mechanical and compatible chemical methods where applicable.

### Required wall-arch shop drawing

- Field template for each arch and every edge/gap.
- Mirror/glass type, thickness, safety backing/lamination and pattern orientation.
- Panel weight, edge finish, soft setting blocks and mechanical bottom/side/top retention.
- Substrate seal/primer and written compatibility for every tape, mastic or sealant that contacts the mirror backing.
- LED channel, heat/separation, wiring access and removable driver/junction access.
- Installation/removal order and replacement path.

### Required overhead shop drawing

- Field survey of ceiling plane, verified support structure, deflection, services and installation route.
- Module grid, each panel weight, total weight and support frame/load path.
- Safety backing or lamination, full perimeter/intermediate mechanical capture, soft separators and protected edges.
- Attachment and local code/seismic design signed by the responsible support designer.
- Removable service access for mirror lighting and electrical equipment.

### Installation sequence

1. Approve samples and illuminated mockup.
2. Field-template arches; survey ceiling/support/services/clearances.
3. Glazier/support designer submits coordinated drawings and compatibility data.
4. Complete/inspect structure, blocking, lighting/wiring, sealed/cured substrates and dry storage before glass arrives.
5. Install setting blocks/spacers and mechanical capture; place panels without hard-point edge contact; use only approved mirror-compatible chemical products in the approved ventilated pattern.
6. Inspect retention, joints, edges, reflection, LED hot spots and service access. Retain templates, panel IDs and replacement records.

### Absolute holds

- **No adhesive-only overhead mirror.**
- **No invented anchor or support capacity.** The support designer owns it from verified structure and panel weights.
- **No generic acidic/corrosive sealant or construction adhesive** against mirror backing.
- No fabrication from illustration coordinates without field templates.
- No hidden drivers or junctions behind non-removable mirror.

Primary sources: [Omega antique mirrors](https://omegamirrorproducts.com/products/antique-mirrors/), [Walker Glass mirror-installation guidance](https://www.walkerglass.com/blog/seven-deadly-sins-of-mirror-installation/).

## Trade coordination sequence

1. **Survey and sample:** room, ceiling, walls, current floor, moisture/flatness, instruments; order finish/mirror/light mockup samples.
2. **Freeze shop drawings:** bar/appliance, reflected ceiling and lighting loads, acoustic/slat elevations, guitar/TV backing, mirror assemblies, floor transitions.
3. **Open work:** demolition, substrate repair, structural backing/support, line-voltage and Class 2 rough-in, driver/access panels.
4. **Close and finish:** fixed millwork first, then paint/acoustic/slat/mirror substrates; inspect before covering.
5. **Installed finishes:** flooring without trapping it; fabric/slat panels; mirror mechanical systems; fixtures/channels; appliance.
6. **Mounted content:** TV/instruments after verified backing; rug/pad and movable furniture last.
7. **Commission:** lighting scenes/dimming/camera checks, appliance, door/service clearances, floor transitions, mirror retention/access and instrument removal.

## Required closeout record

- Approved samples, color formulas, dye/batch/carton numbers and spare-stock locations.
- Final product/SKU and quantity schedule with substitutions marked.
- Lighting runs, loads, wire lengths, drivers, circuits, controls and access locations.
- Moisture/flatness records, floor layout and care restrictions.
- Photos of all concealed backing, supports, rough-ins and driver/junction locations.
- Signed mirror shop drawings, panel weights, safety build-up, retention and compatibility submissions.
- Instrument-to-hanger assignment and full removal-clearance test.
- Current manuals, warranties, care instructions and installer contacts.
