/*
 * Procedural, product-specific furniture for the balanced room budget.
 *
 * These are lightweight visual approximations built from published dimensions
 * and retailer photography. Geometry is authored in inches on a 1/12-scaled
 * child so the returned root remains available to the planner for posing.
 */

const INCH_TO_FOOT = 1 / 12;

export const BUDGET_FURNITURE_SPECS = Object.freeze({
  'BAR-SEATTLE': Object.freeze({
    catalogId: 'BAR-SEATTLE',
    product: 'Corrigan Studio Seattle 14" W Velvet and Iron Bar Stool',
    model: 'W004329633',
    retailerItem: 'Wayfair SKU W004329633',
    sourceUrl: 'https://www.wayfair.com/furniture/pdp/corrigan-studio-seattle-14-w-velvet-and-iron-bar-stool-w004329633.html?piid=1846677705%2C1766588926',
    overallDimsIn: Object.freeze({width: 15.4, depth: 15.4, height: 30}),
    seatDimsIn: Object.freeze({width: 13, depth: 13, height: 30}),
    materials: 'black velvet upholstery, black powder-coated iron, and gold-tone iron footrest',
    form: 'round padded backless seat, four splayed legs, circular footrest',
    representation: 'procedural approximation from retailer product photography'
  }),
  'BAR-EMERY': Object.freeze({
    catalogId: 'BAR-EMERY',
    product: 'Safavieh Emery Dipped Gold Leaf Bar Stool',
    model: 'FOX3230C',
    retailerItem: 'Target TCIN 90340564',
    sourceUrl: 'https://www.target.com/p/-/A-90340564',
    overallDimsIn: Object.freeze({width: 13.5, depth: 13.5, height: 30}),
    materials: 'black and dipped gold-leaf iron',
    form: 'round seat, four splayed legs, cross-bar footrests',
    representation: 'procedural approximation from official product photography'
  }),
  'TABLE-CH35': Object.freeze({
    catalogId: 'TABLE-CH35',
    product: 'Qualler Round Tempered Glass Coffee Table',
    model: 'CH35CT530B',
    retailerItem: 'Home Depot Internet 341788115',
    sourceUrl: 'https://www.homedepot.com/p/341788115',
    overallDimsIn: Object.freeze({width: 30.7, depth: 30.7, height: 18.5}),
    materials: 'black tempered glass and gold-finish metal',
    form: 'round top, open geometric scroll frame, lower shelf',
    representation: 'procedural approximation from official and matching-model photography'
  })
});

function physicalMaterial(THREE, options) {
  const Material = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;
  return new Material(options);
}

function addMesh(THREE, parent, geometry, material, part) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.productPart = part;
  parent.add(mesh);
  return mesh;
}

function rodBetween(THREE, parent, start, end, radius, material, part, sides = 12) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, sides, 1, false);
  const mesh = addMesh(THREE, parent, geometry, material, part);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize()
  );
  return mesh;
}

function ring(THREE, parent, majorRadius, tubeRadius, y, material, part) {
  const mesh = addMesh(
    THREE,
    parent,
    new THREE.TorusGeometry(majorRadius, tubeRadius, 8, 64),
    material,
    part
  );
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}

function curvedMember(THREE, parent, points, radius, material, part) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  return addMesh(
    THREE,
    parent,
    new THREE.TubeGeometry(curve, 32, radius, 8, false),
    material,
    part
  );
}

function buildEmery(THREE, model, materials) {
  const {blackIron, goldLeaf, goldSeat, footPad} = materials;

  // The torus supplies the rolled gold-leaf lip visible in the official image;
  // its 6.75-inch outer radius establishes the published 13.5-inch envelope.
  addMesh(
    THREE,
    model,
    new THREE.CylinderGeometry(6.48, 6.48, 0.82, 48),
    goldSeat,
    'round-gold-seat'
  ).position.y = 29.41;
  ring(THREE, model, 6.35, 0.4, 29.6, goldLeaf, 'rolled-seat-rim');
  addMesh(
    THREE,
    model,
    new THREE.CylinderGeometry(6.12, 6.12, 0.24, 48),
    blackIron,
    'black-seat-underside'
  ).position.y = 28.93;

  const legTop = 4.72;
  const legBottom = 5.78;
  const legCoordinates = [
    [-1, -1], [1, -1], [1, 1], [-1, 1]
  ];
  const legs = [];
  legCoordinates.forEach(([sx, sz], index) => {
    const bottom = new THREE.Vector3(sx * legBottom, 0.55, sz * legBottom);
    const sleeveTop = new THREE.Vector3(sx * 5.58, 5.6, sz * 5.58);
    const upperStart = new THREE.Vector3(sx * 5.61, 5.25, sz * 5.61);
    const top = new THREE.Vector3(sx * legTop, 28.93, sz * legTop);
    rodBetween(THREE, model, bottom, sleeveTop, 0.43, goldLeaf,
      'gold-dipped-leg-sleeve');
    rodBetween(THREE, model, upperStart, top, 0.34, blackIron,
      'splayed-black-leg');
    const pad = addMesh(
      THREE,
      model,
      new THREE.CylinderGeometry(0.48, 0.48, 0.16, 16),
      footPad,
      'floor-glide'
    );
    pad.position.set(bottom.x, 0.08, bottom.z);
    legs[index] = {bottom, top};
  });

  // Two tiers of iron cross-bars match the open braced silhouette. The lower
  // tier is the published 9.5-inch footrest height.
  [9.5, 20.4].forEach((y, tier) => {
    const radius = tier === 0 ? 0.29 : 0.24;
    for (let index = 0; index < 4; index += 1) {
      const next = (index + 1) % 4;
      const t = (y - 0.55) / (28.93 - 0.55);
      const a = new THREE.Vector3().lerpVectors(legs[index].bottom, legs[index].top, t);
      const b = new THREE.Vector3().lerpVectors(legs[next].bottom, legs[next].top, t);
      rodBetween(THREE, model, a, b, radius, blackIron,
        tier === 0 ? 'footrest-crossbar' : 'upper-crossbar');
    }
  });
}

function buildSeattle(THREE, model, materials) {
  const {blackVelvet, blackIron, goldFootrest, footPad} = materials;

  // A lathed profile gives the real stool's cushion its softly rolled top and
  // lower edge while retaining the published 13-inch seat diameter.
  const seatProfile = [
    [5.9, 26.0],
    [6.24, 26.18],
    [6.48, 26.65],
    [6.5, 28.85],
    [6.42, 29.45],
    [6.12, 29.82],
    [5.65, 30.0],
    [0, 30.0]
  ].map(([radius, y]) => new THREE.Vector2(radius, y));
  addMesh(
    THREE,
    model,
    new THREE.LatheGeometry(seatProfile, 64),
    blackVelvet,
    'black-velvet-drum-seat'
  );

  // The feet establish the documented 15.4-inch square envelope. The leg
  // centers sit slightly inboard so the visible 0.34-inch floor glides reach
  // exactly 7.7 inches from the center on each side.
  const topOffset = 4.72;
  const bottomOffset = 7.36;
  const legCoordinates = [
    [-1, -1], [1, -1], [1, 1], [-1, 1]
  ];
  legCoordinates.forEach(([sx, sz]) => {
    const bottom = new THREE.Vector3(sx * bottomOffset, 0.18, sz * bottomOffset);
    const top = new THREE.Vector3(sx * topOffset, 26.12, sz * topOffset);
    rodBetween(THREE, model, bottom, top, 0.24, blackIron,
      'splayed-black-iron-leg', 16);

    const collarBottom = new THREE.Vector3(sx * 4.78, 25.82, sz * 4.78);
    const collarTop = new THREE.Vector3(sx * 4.62, 26.62, sz * 4.62);
    rodBetween(THREE, model, collarBottom, collarTop, 0.34, blackIron,
      'under-seat-leg-collar', 16);

    const pad = addMesh(
      THREE,
      model,
      new THREE.CylinderGeometry(0.34, 0.34, 0.16, 16),
      footPad,
      'floor-glide'
    );
    pad.position.set(bottom.x, 0.08, bottom.z);
  });

  // The single ring is the stool's defining brass accent. Its placement and
  // modest satin finish follow the retailer view rather than reading as chrome.
  ring(THREE, model, 6.22, 0.24, 9.72, goldFootrest,
    'circular-gold-footrest');
}

function polarPoint(THREE, radius, y, angle) {
  return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
}

function buildQualler(THREE, model, materials) {
  const {blackGlass, blackShelf, goldFrame, blackFoot} = materials;

  // Published height and diameter are established by the two glass surfaces.
  addMesh(
    THREE,
    model,
    new THREE.CylinderGeometry(15.35, 15.35, 0.42, 64),
    blackGlass,
    'black-tempered-glass-top'
  ).position.y = 18.29;
  ring(THREE, model, 14.98, 0.27, 17.88, goldFrame, 'top-gold-ring');

  addMesh(
    THREE,
    model,
    new THREE.CylinderGeometry(13.98, 13.98, 0.32, 64),
    blackShelf,
    'black-lower-shelf'
  ).position.y = 2.16;
  ring(THREE, model, 14.92, 0.28, 1.38, goldFrame, 'lower-gold-ring');
  ring(THREE, model, 14.92, 0.22, 2.78, goldFrame, 'shelf-surround-ring');

  // Four structural posts and four panels of mirrored scrollwork reproduce the
  // real table's open circular frame, including its paired hourglass motifs.
  const postRadius = 14.62;
  for (let panel = 0; panel < 4; panel += 1) {
    const angle = panel * Math.PI / 2;
    const post = polarPoint(THREE, postRadius, 0, angle);
    const postMesh = addMesh(
      THREE,
      model,
      new THREE.BoxGeometry(0.48, 18.0, 0.48),
      goldFrame,
      'square-gold-frame-post'
    );
    postMesh.position.set(post.x, 9.0, post.z);

    const pad = addMesh(
      THREE,
      model,
      new THREE.CylinderGeometry(0.38, 0.38, 0.18, 12),
      blackFoot,
      'table-floor-glide'
    );
    pad.position.set(post.x, 0.09, post.z);

    const nextAngle = angle + Math.PI / 2;
    const centerAngle = angle + Math.PI / 4;
    curvedMember(THREE, model, [
      polarPoint(THREE, 14.18, 16.55, angle + 0.08),
      polarPoint(THREE, 11.65, 14.4, angle + 0.24),
      polarPoint(THREE, 10.45, 9.55, centerAngle),
      polarPoint(THREE, 11.65, 14.4, nextAngle - 0.24),
      polarPoint(THREE, 14.18, 16.55, nextAngle - 0.08)
    ], 0.24, goldFrame, 'upper-geometric-scroll');
    curvedMember(THREE, model, [
      polarPoint(THREE, 14.18, 3.25, angle + 0.08),
      polarPoint(THREE, 11.65, 5.15, angle + 0.24),
      polarPoint(THREE, 10.45, 9.55, centerAngle),
      polarPoint(THREE, 11.65, 5.15, nextAngle - 0.24),
      polarPoint(THREE, 14.18, 3.25, nextAngle - 0.08)
    ], 0.24, goldFrame, 'lower-geometric-scroll');

    // The short inset rails give each panel the squared shoulder visible around
    // the scrolls instead of reducing the frame to a generic wire basket.
    const leftMid = polarPoint(THREE, 10.45, 9.55, centerAngle - 0.16);
    const rightMid = polarPoint(THREE, 10.45, 9.55, centerAngle + 0.16);
    rodBetween(THREE, model, leftMid, rightMid, 0.22, goldFrame,
      'inset-geometric-rail', 10);
  }
}

function createMaterials(THREE, catalogId) {
  if (catalogId === 'BAR-SEATTLE') {
    return {
      blackVelvet: physicalMaterial(THREE, {
        color: 0x08090b, metalness: 0.0, roughness: 0.9,
        sheen: 0.65, sheenColor: 0x24262b, sheenRoughness: 0.92
      }),
      blackIron: physicalMaterial(THREE, {
        color: 0x111214, metalness: 0.62, roughness: 0.4,
        clearcoat: 0.16, clearcoatRoughness: 0.42
      }),
      goldFootrest: physicalMaterial(THREE, {
        color: 0xaa782d, metalness: 0.76, roughness: 0.32,
        clearcoat: 0.24, clearcoatRoughness: 0.3
      }),
      footPad: physicalMaterial(THREE, {
        color: 0x090909, metalness: 0.04, roughness: 0.86
      })
    };
  }
  if (catalogId === 'BAR-EMERY') {
    return {
      blackIron: physicalMaterial(THREE, {
        color: 0x080808, metalness: 0.72, roughness: 0.28,
        clearcoat: 0.32, clearcoatRoughness: 0.3
      }),
      goldLeaf: physicalMaterial(THREE, {
        color: 0xa9762d, metalness: 0.7, roughness: 0.42,
        clearcoat: 0.16, clearcoatRoughness: 0.46
      }),
      goldSeat: physicalMaterial(THREE, {
        color: 0x9b6b2b, metalness: 0.6, roughness: 0.48,
        clearcoat: 0.12, clearcoatRoughness: 0.5
      }),
      footPad: physicalMaterial(THREE, {
        color: 0x111111, metalness: 0.05, roughness: 0.8
      })
    };
  }
  return {
    blackGlass: physicalMaterial(THREE, {
      color: 0x090909, metalness: 0.06, roughness: 0.1,
      transmission: 0.08, transparent: true, opacity: 0.94,
      clearcoat: 0.85, clearcoatRoughness: 0.08,
      side: THREE.DoubleSide
    }),
    blackShelf: physicalMaterial(THREE, {
      color: 0x0b0b0c, metalness: 0.04, roughness: 0.16,
      clearcoat: 0.72, clearcoatRoughness: 0.12
    }),
    goldFrame: physicalMaterial(THREE, {
      color: 0xb38332, metalness: 0.78, roughness: 0.3,
      clearcoat: 0.25, clearcoatRoughness: 0.28
    }),
    blackFoot: physicalMaterial(THREE, {
      color: 0x121212, metalness: 0.05, roughness: 0.82
    })
  };
}

/**
 * Create a budget-plan furniture entry for the room adapter.
 * Unsupported catalog IDs intentionally return null.
 */
export function createBudgetFurnitureEntry(item, context = {}) {
  const catalogId = item?.catalogId || '';
  const spec = BUDGET_FURNITURE_SPECS[catalogId];
  if (!spec) return null;

  const {THREE} = context;
  if (!THREE?.Group || !THREE?.Mesh) {
    throw new Error('createBudgetFurnitureEntry requires the active THREE module.');
  }

  const group = new THREE.Group();
  group.name = `${catalogId}-pose-root`;
  const model = new THREE.Group();
  model.name = `${catalogId}-inch-model`;
  model.scale.setScalar(INCH_TO_FOOT);
  group.add(model);

  const materialMap = createMaterials(THREE, catalogId);
  const materials = Object.values(materialMap);
  if (catalogId === 'BAR-SEATTLE') buildSeattle(THREE, model, materialMap);
  else if (catalogId === 'BAR-EMERY') buildEmery(THREE, model, materialMap);
  else buildQualler(THREE, model, materialMap);

  group.userData.productSpec = spec;
  group.userData.productGeometry = spec.representation;
  model.userData.productSpec = spec;
  model.userData.productMaterials = materials;

  let disposed = false;
  return {
    group,
    width: spec.overallDimsIn.width * INCH_TO_FOOT,
    depth: spec.overallDimsIn.depth * INCH_TO_FOOT,
    key: `${catalogId}:${spec.model}`,
    dispose() {
      if (disposed) return;
      disposed = true;
      const geometries = new Set();
      const ownedMaterials = new Set(materials);
      group.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => ownedMaterials.add(material));
        } else if (object.material) {
          ownedMaterials.add(object.material);
        }
      });
      geometries.forEach((geometry) => geometry.dispose?.());
      ownedMaterials.forEach((material) => material.dispose?.());
    }
  };
}

export default createBudgetFurnitureEntry;
