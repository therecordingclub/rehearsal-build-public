# TRC Rehearsal Room 2 build package, shared brief (2026-09-26)

Greg approved ONE image as the final concept: `shared/final-concept-2026-09-13.png`
(live at https://rehearsalroom.gregspero.com/final/). Everything below serves building THAT room.
The older brief (`~/trc-rehearsal-room-astra-pack/ASTRA-BRIEF.md`) and `shared/BUILDER-SPEC-DRAFT-v0.1.md`
are background; where they conflict with the final image or with Greg's decisions below, the final image wins.

## Room (measured by Greg's tape, May 2026, unverified; design so a 2% error does not invalidate anything)
Frame: origin north-west corner at finished floor, +X east, +Z south, +Y up. 1 unit = 1 ft in 3D; builder tables in inches.
Polygon (ft): [[0,0],[12.19,0],[12.19,4.5],[15.58,6.5],[15.58,15.0],[12.19,16.8],[12.19,21.625],[0,21.625]]
Walls: W-NORTH 12.19 ft (short, the MIRROR wall), W-WEST 21.625 ft (long, BAR + PIANO wall), W-SOUTH 12.19 ft,
east side = W-EAST-A 4.5 ft, bay-in return 3.936 ft at 30.54 deg, W-BAY 8.5 ft face (the DESK sits on this face),
bay-out return 3.838 ft at 152.03 deg, W-EAST-B 4.825 ft. Returns are NOT 45 deg. Ceiling 8.5 ft = 102 in, FLAT.
Area 298.86 sq ft. Windowless. Full JSON: `shared/room-polygon.json`.
Doors: D-2 bay door (solid leaf, lever handle) immediately south of the bay on W-EAST-B, must stay clear.
D-1 Live Room door and D-3 entry: wall and position UNKNOWN; place D-3 on W-SOUTH near the west end and D-1 on
W-EAST-A, both flagged UNKNOWN, 36 in leaves. A projecting pier with an HVAC grille and a dome camera sits on the
south wall centre, size UNKNOWN, assume 24 in wide x 12 in deep.
Existing: light-oak plank LVP floor (the final image shows dark floor: specify dark LVP overlay OR keep oak + rugs,
state the choice and cost), grey stretched-fabric upper walls + chair rail + charcoal wainscot (remove the rail
read), matte black ceiling with two 2x2 troffers (remove) and small downlights.

## Greg's fixed layout decisions (do not trade away)
1. North wall: five tall arched "cracked" black antique-mirror panels (gold-veined smoked mirror), warm LED
   bleeding around each arch, mirrors reflecting the real sofa. A matching cracked-mirror ceiling inset over the
   lounge with a warm LED perimeter, surface-applied under the flat 102 in ceiling.
2. West wall, north end: two backlit floating bottle shelves + a SMALL glass-and-black-stone bar counter, about
   48 in long, protruding from the wall, counter 42 in AFF, nobody stands behind it, 3 dark leather stools with
   foot rings, under-counter glass-front beverage fridge with blue LED.
3. West wall, immediately south of the bar: Yamaha NU1X hybrid upright (57.5 W x 18.1 D x 40.4 H in, ~240 lb,
   black polished) with a black leather bench. Piano is TO THE RIGHT of the bar when facing the west wall from
   inside the room (i.e., south of it).
4. Centre lounge: curved charcoal patterned sectional (~100 in wide) with its back toward the mirror wall,
   round smoked-glass cocktail table with decanter and candles, two black leather swivel armchairs facing the
   sectional, one large dark patterned rug under all of it.
5. East bay face (W-BAY): a fixed production desk (~72 W x 32 D in, black, Argosy-class, console secured),
   large display, Yamaha HS8 nearfields on the desk, PMC IB1 mains on stands beside it, rack under the desk,
   low-back engineer chair, a PA top (Turbosound) on a pole just north of the desk, a plant.
6. TEN guitars/basses on wall hangers ABOVE the production desk in two rows (5 + 5) on the bay face and the
   adjoining return. Inventory owns 1 guitar + 5 basses; the spec buys/borrows 4 to 6 more (list as a line item).
7. NO drum kit in this room (it lives in the booth). Keys rig beyond the NU1X: the Korg Grandstage X stays on a
   stand at sitting height somewhere it fits (south-east zone), always in audio.
8. Materials/palette: charcoal textured wallcovering (dark plaster or fabric), black fluted wood slat panels
   flanking the desk, black/gold "cracked" mirror, black stone, dark leather (black + one cognac note allowed),
   brushed brass trim, everything 2700K 90+ CRI on one dimmer system: continuous LED cove at the ceiling
   perimeter, 10-12 recessed 4 in downlights, track heads on the guitar wall, under-shelf and under-counter LED.
9. Plug-and-play rules stay: member laptop station, computer never sleeps, cables labelled R-01.., front Furman
   plug empty, Trinnov + sub always powered, Apollo not sharing power with the TV.

## Deliverable standards (both 3D builds)
Single self-contained `index.html` in your folder, Three.js from cdnjs (r160+ ok, pinned), no build step,
loads from file:// and from a static host. True scale, 1 unit = 1 ft. Required: walkable first-person + orbit
toggle, plan view button, every element a named mesh with a click/hover label showing name, size in inches and
material; a dimension overlay toggle (room edges, bar, desk, piano, sectional, mirror arches); a lighting toggle
(lounge vs session vs meditation scene); PBR-ish materials (roughness/metalness, emissive cove), no placeholder
grey boxes. Must render at 60 fps on an M-series Mac and load on an iPhone. Include `elements.json` beside it:
every element with id, name, x/z centre (in), w/d/h (in), rotation, mounting height, material, finish, colour,
vendor SKU if known. The scene must be built FROM elements.json (fetch it, or inline the same JSON) so the spec
and the model can never disagree.

## ADDENDUM 2026-09-26 17:05, the booth and the doors (from the 2024 labeled floor plan, `shared/floor-plan-2024-labeled-rehearsal-crop.png`)
The labeled plan (1995 base sheet, 2024 labels) gives the Rehearsal Room as 15'-8" x 21'-7", which matches Greg's polygon extents.
It corrects three assumptions. Model ALL of this; Greg wants the booth in the scene accurately.
1. **The "pier" is a closet.** A 2'-10" (E-W) x 3'-10" (N-S) HVAC chase/closet fills the south-east corner, EAST of Greg's polygon
   (x 146.28..180 in, z 213.5..259.5 in). Its west face carries the "bay door" D-2: a 36 in solid leaf with a lever handle, hinged at the
   south, swinging into the room; the rectangular HVAC supply grille sits above that door; the dome camera is on the closet's NW corner.
   D-2 must stay clear (36 in swing into the room).
2. **The entry door D-3 is on the WEST wall at the south end**: 36 in leaf, z 223..259 in, hinged at the south, swinging into the room, from
   the corridor by the "UP" stair. No door exists to the Live Room (the zigzag Studio A wall runs behind the east wall with an air gap).
3. **The iso booth is directly SOUTH of the room, behind the south wall.** Interior 10'-3" (E-W) x 7'-11" (N-S). Its west edge is about
   60 in east of the room's west wall (booth x 60..183 in, z 265.5..360.5 in, wall 6 in thick between). The booth's west and south walls
   are one continuous curve (part of the studio's curved wall): the SW corner is rounded with roughly a 60 in radius, and the west wall
   bows out slightly. Its east wall is the electrical room's west wall. **Sliding glass doors** (two panes, ~58 in total) join the room and
   the booth in the shared wall, centred at about x 115 in (opening x 86..144 in). Booth finish today: grey acoustic fabric full height,
   matte black ceiling with one 2x2 troffer and one recessed can, floor rug (Persian) over the same oak LVP. Contents today: Yamaha drum
   kit (Gretsch Catalina on this room's inventory, 72 x 66 in footprint) on the rug, a wood-topped desk with a rack under it against the
   east wall, a wall-mounted TV over a small dark acoustic panel on the east wall, an overhead mic boom, a red outlet plate low on the wall.
   In the ideal state the booth stays the drum/vocal booth: keep the kit, add 2 in fabric-wrapped absorbers and a 2700K downlight, keep the
   glass doors so the lounge sees the kit. Photos: `shared/f14.jpg` to `shared/f18.jpg` (camera reads green; that is white balance).
