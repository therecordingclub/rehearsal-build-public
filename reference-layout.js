(function attachReferenceLayout(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ReferenceLayout = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createReferenceLayout() {
  "use strict";

  // Visual arrangement inferred from assets/approved-concept.png. Coordinates are
  // planning choices inside the measured room polygon, not measurements extracted
  // from the perspective image. Rotation is clockwise; +Z is the front at 0 deg.
  const placements = Object.freeze({
    "KEY-01": Object.freeze({x: 9.5, z: 90, rotation: 270}),
    "BENCH-01": Object.freeze({x: 26, z: 90, rotation: 270}),
    "SEAT-01": Object.freeze({x: 83, z: 53, w:112, d:38, rotation: 0, catalogId:'SEAT-01', name:'Craftmaster C9 · conversation sofa'}),
    "SEAT-03": Object.freeze({x: 87, z: 104, rotation: 0}),
    "SEAT-02A": Object.freeze({x: 126, z: 103, w:30, d:28.75, rotation: 90, catalogId:'SEAT-02A', name:'HAY AAL 81 Soft · A'}),
    "SEAT-02B": Object.freeze({x: 107, z: 145, w:30, d:28.75, rotation: 150, catalogId:'SEAT-02B', name:'HAY AAL 81 Soft · B'}),
    "BAR-01": Object.freeze({x: 13, z: 160, rotation: 270}),
    "BAR-06-1": Object.freeze({x: 37, z: 142, rotation: 0}),
    "BAR-06-2": Object.freeze({x: 37, z: 160, rotation: 0}),
    "BAR-06-3": Object.freeze({x: 37, z: 178, rotation: 0}),
    "DESK-01": Object.freeze({x: 170, z: 130, rotation: 90}),
    "CHAIR-01": Object.freeze({x: 141, z: 139, rotation: 270}),
    "PMC-N": Object.freeze({x: 174, z: 86, rotation: 90}),
    "PMC-S": Object.freeze({x: 172, z: 174, rotation: 90}),
    "AV-PA": Object.freeze({x: 154, z: 72, w: 32, d: 30, rotation: 90})
  });

  function build(startingItems) {
    if (!Array.isArray(startingItems)) {
      throw new TypeError("ReferenceLayout.build needs the planner starting items.");
    }

    return startingItems.map(function placeItem(item) {
      if (!item || typeof item !== "object") {
        throw new TypeError("Every planner starting item must be an object.");
      }
      const placement = placements[item.id];
      return placement ? Object.assign({}, item, placement) : Object.assign({}, item);
    });
  }

  const affordablePlacements = Object.freeze({...placements,
    'SEAT-01':Object.freeze({x:83,z:53,w:90.5,d:36,rotation:0,catalogId:'SEAT-ALPINE',name:'Alpine · Ebony Black sofa'}),
    'SEAT-02A':Object.freeze({x:126,z:103,w:24.75,d:29.5,rotation:90,catalogId:'SEAT-DYVLINGE',name:'DYVLINGE · black swivel A'}),
    'SEAT-02B':Object.freeze({x:107,z:145,w:24.75,d:29.5,rotation:150,catalogId:'SEAT-DYVLINGE',name:'DYVLINGE · black swivel B'})
  });
  const affordable = Object.freeze({
    id:'reference-affordable-v1.4', name:'Dark lounge · TV', placements:affordablePlacements,
    build:startingItems => startingItems.map(item => ({...item,...affordablePlacements[item.id]}))
  });

  // Product substitutions for the balanced $25k plan. Pose and lock fields are
  // deliberately absent: upgrade() applies only product identity and body size
  // so a user's arranged copy stays in exactly the same place.
  const budgetReplacements = Object.freeze({
    'SEAT-01':Object.freeze({catalogId:'SEAT-ALPINE',name:'Alpine · ebony black sofa',w:90.5,d:36,profile:'alpine-sofa'}),
    'SEAT-02A':Object.freeze({catalogId:'SEAT-DYVLINGE',name:'DYVLINGE · black swivel A',w:24.75,d:29.5,profile:'dyvlinge-chair'}),
    'SEAT-02B':Object.freeze({catalogId:'SEAT-DYVLINGE',name:'DYVLINGE · black swivel B',w:24.75,d:29.5,profile:'dyvlinge-chair'}),
    'SEAT-03':Object.freeze({catalogId:'TABLE-CH35',name:'Qualler · black glass coffee table',w:30.7,d:30.7,profile:'round-table'}),
    'BAR-06-1':Object.freeze({catalogId:'BAR-SEATTLE',name:'Seattle · black velvet stool 1',w:15.4,d:15.4,profile:'stool'}),
    'BAR-06-2':Object.freeze({catalogId:'BAR-SEATTLE',name:'Seattle · black velvet stool 2',w:15.4,d:15.4,profile:'stool'}),
    'KEY-01':Object.freeze({catalogId:'KEY-CLAVINOVA',name:'Retained Yamaha Clavinova · model unverified',w:57,d:18,profile:'upright-piano'}),
    'DESK-01':Object.freeze({catalogId:'DESK-RETAINED',name:'Retained black worktable · measure on site',w:72,d:32,profile:'desk'}),
    'CHAIR-01':Object.freeze({catalogId:'CHAIR-RENBERGET',name:'RENBERGET · black desk chair',w:26.375,d:26.375,profile:'office-chair'})
  });

  function budgetUpgrade(items) {
    if (!Array.isArray(items)) {
      throw new TypeError('ReferenceLayout.budget.upgrade needs a furniture list.');
    }
    return items.filter(item=>item?.id!=='BAR-06-3').map((item) => {
      if (!item || typeof item !== 'object') {
        throw new TypeError('Every budget furniture item must be an object.');
      }
      return {...item,...budgetReplacements[item.id]};
    });
  }

  const budget = Object.freeze({
    id:'reference-budget-v1.9',
    name:'Balanced $25k plan',
    replacements:budgetReplacements,
    upgrade:budgetUpgrade,
    build:startingItems => budgetUpgrade(affordable.build(startingItems)).map(item=>
      item.id==='BAR-06-1'?{...item,x:37,z:148}:item.id==='BAR-06-2'?{...item,x:37,z:172}:item)
  });

  return Object.freeze({
    version: 2,
    name: "Original design · C9",
    source: "assets/approved-concept.png",
    confidence: "Visual relationship only; room geometry and product bodies keep their independent sources.",
    placements,
    build,
    affordable,
    budget,
    presets:Object.freeze({
      'source-v1.3':Object.freeze({id:'reference-c9-v1.3',name:'Original design · C9',build}),
      'source-v1.4':affordable,
      'budget-v1.9':budget
    })
  });
});
