/*
 * Retained and inventory-backed builders for the balanced $25k room.
 *
 * The dimensions below are procurement/inventory planning values, not field
 * measurements.  The builders use the source scene's inch-scaled child-root
 * convention, so the room continues to own placement and rotation.
 */

const INSTALL_KEY = Symbol.for('trc.fullRoomBudgetRetained.install');

export const BUDGET_RETAINED_SPECS = Object.freeze({
  piano: Object.freeze({
    product: 'Retained Yamaha Clavinova console piano',
    model: 'Clavinova model unresolved',
    budgetRow: 'FUR-030',
    inventoryId: 'KEYS05',
    overallDimsIn: Object.freeze({width: 57, depth: 18, height: 33.5}),
    finish: 'retained black/polished finish to verify',
    status: 'Illustrative market-standard envelope pending model, serial, field dimensions and Greg acceptance.',
    representation: 'procedural Clavinova-style console; not an NU1X claim'
  }),
  lamp: Object.freeze({
    product: 'Regency Hill Haddington Piano Banker Lamp',
    model: 'Target TCIN 80005563',
    budgetRow: 'FUR-034',
    sourceUrl: 'https://www.target.com/p/-/A-80005563',
    overallDimsIn: Object.freeze({height: 16}),
    finish: 'antique bronze and alabaster glass',
    status: 'Priced retail reference; base, cord and sightline require verification against the retained piano.',
    representation: 'procedural approximation from the priced product description'
  }),
  acousticBass: Object.freeze({
    product: 'Retained Breedlove acoustic bass',
    model: 'Exact model unresolved',
    budgetRow: 'FUR-065',
    inventoryId: 'BASS02',
    overallDimsIn: Object.freeze({width: 16, depth: 4.5, height: 47}),
    finish: 'representative natural wood; exact finish unverified',
    support: 'String Swing CC01K hanger is budgeted separately; wall backing, yoke fit and removal arc remain field holds.',
    status: 'Representative acoustic-bass silhouette from inventory category and market-standard envelope; not manufacturer CAD.',
    representation: 'procedural Breedlove-style acoustic body with sound hole'
  }),
  drums: Object.freeze({
    product: 'Retained Gretsch Catalina Maple drum setup',
    budgetRow: 'SYS-074',
    inventoryIds: Object.freeze(['DRUMS01','DRUMS02','DRUMS03','DRUMS04','DRUMS06']),
    status: 'Inventory-backed brand correction only; existing scene geometry remains illustrative.'
  })
});

function material(THREE, options) {
  const Material = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;
  return new Material(options);
}

function part(object, name) {
  if (object) object.userData.productPart = name;
  return object;
}

function addPart(add, parent, object, name, x = 0, y = 0, z = 0) {
  return part(add(parent, object, x, y, z), name);
}

function makeTextTexture(context, text, color = '#d8d2c5', background = 'rgba(0,0,0,0)') {
  const {cnv, T} = context;
  return T(cnv(256, 64, (q, w, h) => {
    q.clearRect?.(0, 0, w, h);
    q.fillStyle = background;
    q.fillRect(0, 0, w, h);
    q.fillStyle = color;
    q.font = 'bold 30px Georgia, serif';
    q.textAlign = 'center';
    q.textBaseline = 'middle';
    q.fillText(text, w / 2, h / 2 + 1);
  }));
}

function buildClavinova(el, context) {
  const {THREE, M, inch, add, box, rbox, mesh, cyl, keybed} = context;
  const spec = BUDGET_RETAINED_SPECS.piano;
  const L = Number.isFinite(Number(el?.d)) ? Number(el.d) : spec.overallDimsIn.width;
  const D = Number.isFinite(Number(el?.w)) ? Number(el.w) : spec.overallDimsIn.depth;
  const H = Number.isFinite(Number(el?.h)) ? Number(el.h) : spec.overallDimsIn.height;
  const g = inch();
  const black = material(THREE, {
    color: 0x090a0c, roughness: 0.35, metalness: 0.03,
    clearcoat: 0.55, clearcoatRoughness: 0.28
  });
  const blackMatte = material(THREE, {color: 0x0d0e10, roughness: 0.75, metalness: 0.02});
  const bronze = material(THREE, {color: 0x8e6b30, roughness: 0.42, metalness: 0.68});
  const labelTexture = makeTextTexture(context, 'YAMAHA', '#c6a55e');
  const labelMaterial = new THREE.MeshBasicMaterial({map: labelTexture, transparent: true});

  // A CLP-style console: full rear case, keyboard shelf, modesty panel and two
  // floor-standing cheeks.  The outside body stays within the inventory's
  // provisional 57 x 18 x 33.5-inch envelope.
  addPart(add, g, box(L - 1, H - 1.5, 1.2, black), 'rear-console-panel',
    0, (H - 1.5) / 2, -D / 2 + 0.6);
  addPart(add, g, box(L, 1, 6.6, black), 'console-top-cap',
    0, H - 0.5, -D / 2 + 3.3);
  addPart(add, g, rbox(L, 2.1, D, 0.35, black), 'keyboard-shelf',
    0, H - 7.35, 0);
  addPart(add, g, box(L - 3.2, 5.4, 1.15, black), 'front-fallboard',
    0, H - 10.45, D / 2 - 0.575);
  addPart(add, g, box(L - 4, 15.8, 0.85, blackMatte), 'lower-modesty-panel',
    0, 10.4, -D / 2 + 1.45);

  for (const side of [-1, 1]) {
    addPart(add, g, rbox(3, H - 8.4, 5.4, 0.25, black), 'console-side-cheek',
      side * (L / 2 - 1.5), (H - 8.4) / 2, D / 2 - 3.1);
    addPart(add, g, box(4.2, 1, 7.1, blackMatte), 'console-floor-foot',
      side * (L / 2 - 2.1), 0.5, D / 2 - 3.55);
  }

  const keys = keybed(Math.min(48.2, L - 7), 5.8, 3.25);
  part(keys, 'weighted-keybed');
  add(g, keys, 0, H - 6.15, D / 2 - 3.15);
  addPart(add, g, box(Math.min(49, L - 5), 0.7, 1.1, blackMatte), 'key-slip-rail',
    0, H - 7.25, D / 2 - 0.7);

  const musicRest = addPart(add, g, rbox(30, 5.6, 0.55, 0.18, black),
    'folded-music-rest', 0, H - 3.2, -D / 2 + 4.8);
  musicRest.rotation.x = -0.08;
  const logo = addPart(add, g,
    mesh(new THREE.PlaneGeometry(7.6, 1.9), labelMaterial),
    'yamaha-clavinova-label', 0, H - 9.35, D / 2 + 0.006);
  logo.userData.noShadow = true;

  addPart(add, g, box(10.5, 3, 1.7, black), 'pedal-box',
    0, 1.5, D / 2 - 2.1);
  for (const x of [-2.5, 0, 2.5]) {
    const pedal = addPart(add, g, box(0.9, 0.42, 3.0, bronze), 'piano-pedal',
      x, 2.15, D / 2 - 1.5);
    pedal.rotation.x = 0.07;
  }

  g.userData.productSpec = spec;
  g.userData.budgetRow = spec.budgetRow;
  g.userData.dimensionStatus = 'illustrative-pending-field-verification';
  g.userData.inventoryId = spec.inventoryId;
  g.userData.ownedResources = [black, blackMatte, bronze, labelMaterial, labelTexture];
  return g;
}

function buildHaddingtonLamp(el, context) {
  const {THREE, inch, add, box, rbox, mesh, cyl, rod} = context;
  const spec = BUDGET_RETAINED_SPECS.lamp;
  const g = inch();
  const bronze = material(THREE, {
    color: 0x78552e, roughness: 0.48, metalness: 0.62,
    clearcoat: 0.18, clearcoatRoughness: 0.48
  });
  const darkBronze = material(THREE, {color: 0x3b2a1c, roughness: 0.64, metalness: 0.55});
  const alabaster = material(THREE, {
    color: 0xf0e3ca, roughness: 0.7, metalness: 0,
    emissive: 0xffd7a0, emissiveIntensity: 0.32,
    transparent: true, opacity: 0.96
  });

  addPart(add, g, rbox(8.6, 0.8, 4.4, 0.42, darkBronze), 'weighted-antique-bronze-base',
    0, 0.4, -0.25);
  addPart(add, g, cyl(0.55, 1.1, bronze, 20, 0.72), 'base-collar', 0, 1.15, -0.25);
  addPart(add, g, cyl(0.34, 10.8, bronze, 16), 'banker-lamp-post', 0, 6.5, -0.25);
  rod(g, [0, 11.8, -0.25], [0, 13.7, 1.0], 0.3, bronze);
  addPart(add, g, cyl(0.7, 0.9, darkBronze, 18), 'shade-pivot', 0, 13.7, 1.0);

  // The elongated ivory shade is the defining Haddington/banker-lamp form.
  addPart(add, g, rbox(12.0, 2.8, 3.15, 0.65, alabaster), 'alabaster-glass-shade',
    0, 14.2, 1.75);
  for (const side of [-1, 1]) {
    const cap = addPart(add, g, cyl(1.58, 0.35, bronze, 24), 'bronze-shade-end-cap',
      side * 6.0, 14.2, 1.75);
    cap.rotation.z = Math.PI / 2;
  }
  const glow = addPart(add, g,
    mesh(new THREE.PlaneGeometry(10.8, 1.5), new THREE.MeshBasicMaterial({
      color: 0xffdfaa, transparent: true, opacity: 0.72, side: THREE.DoubleSide
    })), 'warm-shade-aperture', 0, 12.76, 1.95);
  glow.rotation.x = Math.PI / 2;
  glow.userData.noShadow = true;

  g.userData.lights = [];
  if (THREE.SpotLight) {
    const light = new THREE.SpotLight(0xffb56b, 13, 5, 0.92, 0.82, 1.5);
    light.position.set(0, 12.8, 2.0);
    light.target.position.set(0, -8, 4.5);
    g.add(light, light.target);
    g.userData.lights.push(light);
  }
  g.userData.productSpec = spec;
  g.userData.budgetRow = spec.budgetRow;
  g.userData.dimensionStatus = 'retail-reference-pending-piano-fit';
  g.userData.ownedResources = [bronze, darkBronze, alabaster];
  return g;
}

function acousticBodyShape(THREE) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(4.2, 0.2, 6.7, -1.6, 6.65, -4.3);
  // A restrained treble-side cutaway gives a real acoustic-instrument read
  // without asserting a particular unresolved Breedlove model.
  shape.bezierCurveTo(6.6, -5.6, 4.8, -5.9, 4.5, -7.1);
  shape.bezierCurveTo(4.0, -8.4, 7.95, -10.1, 8.0, -14.1);
  shape.bezierCurveTo(8.05, -18.0, 5.2, -20.0, 0, -20.0);
  shape.bezierCurveTo(-5.2, -20.0, -8.05, -18.0, -8.0, -14.1);
  shape.bezierCurveTo(-7.95, -10.1, -4.0, -8.4, -4.5, -7.1);
  shape.bezierCurveTo(-5.1, -5.7, -6.7, -5.5, -6.65, -4.0);
  shape.bezierCurveTo(-6.55, -1.5, -4.1, 0.15, 0, 0);
  shape.closePath();
  return shape;
}

function buildAcousticBass(el, context) {
  const {THREE, M, inch, add, box, rbox, mesh, cyl, rod, ext, wallNormal} = context;
  const spec = BUDGET_RETAINED_SPECS.acousticBass;
  const g = inch();
  const IN = 1 / 12;
  const off = 3.4;
  const wn = wallNormal(el.x, el.z);
  g.position.set((wn.p[0] + wn.n[0] * off) * IN, el.y * IN,
    (wn.p[1] + wn.n[1] * off) * IN);
  g.rotation.y = Math.atan2(wn.n[0], wn.n[1]);
  g.userData.noPlace = true;

  const walnut = material(THREE, {
    color: 0x6e3f20, roughness: 0.38, metalness: 0,
    clearcoat: 0.62, clearcoatRoughness: 0.2
  });
  const spruce = material(THREE, {
    color: 0xb98247, roughness: 0.42, metalness: 0,
    clearcoat: 0.55, clearcoatRoughness: 0.22
  });
  const rosewood = material(THREE, {color: 0x24120c, roughness: 0.58, metalness: 0});
  const ivory = material(THREE, {color: 0xd9d0b7, roughness: 0.52, metalness: 0});
  const chrome = material(THREE, {color: 0xb7b9bc, roughness: 0.23, metalness: 0.82});
  const hangerWood = material(THREE, {color: 0x2a1a10, roughness: 0.58, metalness: 0});

  // Recreate the existing support geometry so the acoustic-only override keeps
  // the same wall pose, yoke height and support disclosure as the other guitars.
  addPart(add, g, rbox(2.4, 5, 0.8, 0.25, hangerWood), 'string-swing-backplate',
    0, -0.6, -off + 0.4);
  part(rod(g, [0, 0, -off + 0.8], [0, 0, -0.6], 0.28, M.satin), 'hanger-arm');
  for (const side of [-1, 1]) {
    part(rod(g, [side * 1.1, 0, -0.6], [side * 1.1, 0, 1.2], 0.28, M.rubber),
      'padded-yoke');
    part(rod(g, [side * 1.1, 0, 1.2], [side * 1.1, 0.9, 1.2], 0.28, M.rubber),
      'padded-yoke-tip');
  }
  part(rod(g, [-1.1, 0, -0.6], [1.1, 0, -0.6], 0.28, M.satin), 'hanger-crossbar');

  const nutY = -0.5;
  const neckLength = 19.5;
  const bodyTop = nutY - neckLength;
  const bodyDepth = spec.overallDimsIn.depth;
  const body = acousticBodyShape(THREE);
  addPart(add, g, ext(body, bodyDepth, walnut, 0.22, 10), 'acoustic-body-back-and-sides',
    0, bodyTop, 0);
  addPart(add, g, ext(body, 0.16, spruce, 0.08, 10), 'solid-top-soundboard',
    0, bodyTop, bodyDepth / 2 + 0.02);

  const neckWidthNut = 1.6;
  const neckWidthHeel = 2.45;
  const neckShape = new THREE.Shape([
    [-neckWidthNut / 2, 0], [neckWidthNut / 2, 0],
    [neckWidthHeel / 2, -neckLength - 0.6], [-neckWidthHeel / 2, -neckLength - 0.6]
  ].map(([x, y]) => new THREE.Vector2(x, y)));
  addPart(add, g, ext(neckShape, 0.9, walnut, 0.04, 2), 'acoustic-bass-neck',
    0, nutY, 0.45);
  const fretboard = addPart(add, g,
    mesh(new THREE.PlaneGeometry((neckWidthNut + neckWidthHeel) / 2, neckLength), rosewood),
    'rosewood-fretboard', 0, nutY - neckLength / 2, bodyDepth / 2 + 0.13);
  fretboard.userData.noShadow = true;
  addPart(add, g, box(neckWidthNut, 0.2, 0.28, ivory), 'bone-nut',
    0, nutY + 0.04, bodyDepth / 2 + 0.12);

  const head = new THREE.Shape();
  head.moveTo(-neckWidthNut / 2, 0);
  head.lineTo(-1.25, 2.1);
  head.quadraticCurveTo(-1.8, 5.8, -0.85, 7.0);
  head.quadraticCurveTo(0, 7.65, 0.85, 7.0);
  head.quadraticCurveTo(1.8, 5.8, 1.25, 2.1);
  head.lineTo(neckWidthNut / 2, 0);
  head.closePath();
  addPart(add, g, ext(head, 0.62, walnut, 0.08, 8), 'breedlove-style-headstock',
    0, nutY, bodyDepth / 2 - 0.1);
  for (let index = 0; index < 4; index += 1) {
    const side = index < 2 ? -1 : 1;
    const row = index % 2;
    const peg = addPart(add, g, cyl(0.3, 0.95, chrome, 10), 'bass-tuning-machine',
      side * 1.35, nutY + 3.2 + row * 2.4, bodyDepth / 2 - 0.1);
    peg.rotation.z = Math.PI / 2;
  }

  const soundHoleY = bodyTop - 7.7;
  const rosette = addPart(add, g,
    mesh(new THREE.RingGeometry(2.15, 2.55, 48), ivory),
    'sound-hole-rosette', 0, soundHoleY, bodyDepth / 2 + 0.13);
  rosette.userData.noShadow = true;
  const soundHole = addPart(add, g,
    mesh(new THREE.CircleGeometry(2.14, 48), rosewood),
    'acoustic-sound-hole', 0, soundHoleY, bodyDepth / 2 + 0.14);
  soundHole.userData.noShadow = true;
  addPart(add, g, rbox(5.2, 1.0, 0.38, 0.16, rosewood), 'acoustic-bass-bridge',
    0, bodyTop - 15.1, bodyDepth / 2 + 0.17);
  addPart(add, g, rbox(2.1, 5.7, 0.12, 0.35, rosewood), 'acoustic-pickguard',
    3.2, bodyTop - 9.7, bodyDepth / 2 + 0.22).rotation.z = -0.18;

  const stringGeometry = new THREE.BufferGeometry();
  const stringPositions = [];
  for (let index = 0; index < 4; index += 1) {
    const xNut = -0.55 + index * (1.1 / 3);
    const xBridge = -1.45 + index * (2.9 / 3);
    stringPositions.push(xNut, nutY + 5.5, bodyDepth / 2 + 0.25,
      xBridge, bodyTop - 15.1, bodyDepth / 2 + 0.28);
  }
  stringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stringPositions, 3));
  const strings = new THREE.LineSegments(stringGeometry,
    new THREE.LineBasicMaterial({color: 0xd7d5cc, transparent: true, opacity: 0.84}));
  strings.userData.productPart = 'four-bass-strings';
  g.add(strings);

  g.userData.bottom = bodyTop - 20;
  g.userData.productSpec = spec;
  g.userData.budgetRow = spec.budgetRow;
  g.userData.inventoryId = spec.inventoryId;
  g.userData.dimensionStatus = 'market-standard-envelope-pending-exact-model-and-field-fit';
  g.userData.supportMetadata = Object.freeze({
    system: 'String Swing CC01K',
    budgetRow: 'SYS-025',
    placement: 'preserved from element x/z/y and room wall normal',
    release: 'Verify wall backing, neck/yoke fit, instrument weight and removal arc.'
  });
  g.userData.ownedResources = [walnut, spruce, rosewood, ivory, chrome, hangerWood,
    stringGeometry, strings.material];
  return g;
}

function replaceKickHeadBrand(context) {
  const {M, cnv, T} = context;
  if (!M?.kickhead || !cnv || !T) return null;
  const priorMap = M.kickhead.map || null;
  const canvas = cnv(256, 256, (q, w, h) => {
    q.fillStyle = '#0c0c0d';
    q.fillRect(0, 0, w, h);
    q.fillStyle = '#f2f2f2';
    q.font = 'bold 29px Georgia, serif';
    q.textAlign = 'center';
    q.textBaseline = 'middle';
    q.fillText('GRETSCH', w / 2, h * 0.42);
    q.strokeStyle = '#f2f2f2';
    q.lineWidth = 3;
    q.beginPath();
    q.arc(w / 2, h * 0.31, 18, 0, Math.PI * 2);
    q.stroke();
    q.fillStyle = '#000';
    q.beginPath();
    q.arc(w * 0.68, h * 0.7, 22, 0, Math.PI * 2);
    q.fill();
    q.strokeStyle = '#777';
    q.lineWidth = 2;
    q.stroke();
  });
  const texture = T(canvas);
  texture.center?.set?.(0.5, 0.5);
  texture.rotation = Math.PI / 2;
  texture.needsUpdate = true;
  M.kickhead.map = texture;
  M.kickhead.needsUpdate = true;
  M.kickhead.userData = Object.assign({}, M.kickhead.userData, {
    productSpec: BUDGET_RETAINED_SPECS.drums,
    inventoryBrandCorrection: 'Gretsch Catalina Maple; replaces incorrect Yamaha head graphic'
  });
  return {priorMap, texture};
}

/**
 * Install the three retained-item builders into the active source builder map.
 * Repeated calls with the same B object are idempotent.
 */
export function installBudgetRetainedBuilders(context = {}) {
  const required = ['THREE','B','M','inch','add','box','rbox','mesh','cyl','rod','ext',
    'cnv','T','wallNormal','keybed'];
  const missing = required.filter((key) => !context[key]);
  if (missing.length) {
    throw new Error(`installBudgetRetainedBuilders requires: ${missing.join(', ')}`);
  }
  const {B} = context;
  if (B[INSTALL_KEY]) return B[INSTALL_KEY];

  const original = {
    piano: B.piano,
    pianoLamp: B['piano-lamp'],
    guitar: B.guitar
  };
  const kickHead = replaceKickHeadBrand(context);

  B.piano = (el) => buildClavinova(el, context);
  B['piano-lamp'] = (el) => buildHaddingtonLamp(el, context);
  B.guitar = (el) => el?.type === 'acoustic-bass'
    ? buildAcousticBass(el, context)
    : original.guitar.call(B, el);

  let restored = false;
  const api = Object.freeze({
    specs: BUDGET_RETAINED_SPECS,
    installedBuilders: Object.freeze(['piano','piano-lamp','guitar:acoustic-bass']),
    kickHeadBrand: kickHead ? 'GRETSCH' : null,
    restore() {
      if (restored) return;
      restored = true;
      B.piano = original.piano;
      B['piano-lamp'] = original.pianoLamp;
      B.guitar = original.guitar;
      if (kickHead) {
        context.M.kickhead.map = kickHead.priorMap;
        context.M.kickhead.needsUpdate = true;
        kickHead.texture.dispose?.();
      }
      delete B[INSTALL_KEY];
    }
  });
  Object.defineProperty(B, INSTALL_KEY, {value: api, configurable: true});
  return api;
}
