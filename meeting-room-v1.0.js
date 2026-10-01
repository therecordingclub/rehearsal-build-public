import {mountFullRoom} from "./full-room-scene.js?v=1.9";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const host = $("#meeting-room-scene");
const status = $("#model-status");
const modeButtons = $$('[data-meeting-mode]');

let mountedRoom = null;
let geometry = null;
let roomRecords = null;
let layout = null;
let currentMode = "lounge";
let sceneRoot = null;
let sceneView = null;
let rearRail = null;
let runtimeEvidence = null;
const captureEvidence = {};
let resolveReady;
let rejectReady;

const ready = new Promise((resolve, reject) => {
  resolveReady = resolve;
  rejectReady = reject;
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function pointInPolygon(polygon, x, z) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [xi, zi] = polygon[index];
    const [xj, zj] = polygon[previous];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function deriveLayout(savedLayouts) {
  const baseline = savedLayouts.layouts.find((entry) => entry.id === "reference-affordable-v1.4") || savedLayouts.layouts[0];
  if (!baseline || !Array.isArray(baseline.items)) throw new Error("The saved layout baseline is unavailable.");
  if (!window.ReferenceLayout?.budget?.build) throw new Error("ReferenceLayout.budget.build is unavailable.");

  const items = window.ReferenceLayout.budget.build(clone(baseline.items))
    .filter((item) => !item.id.startsWith("BAR-06-"))
    .map((item) => item.id === "BAR-01"
      ? {...item, name: "Compact locked cabinet option · field size pending", x: 11, z: 160, w: 32, d: 18, rotation: 270}
      : item);

  return {
    id: geometry.layout.id,
    name: "Meeting room · fixed central lounge",
    sourcePresetId: window.ReferenceLayout.budget.id,
    items
  };
}

function hideBuiltInControls() {
  const style = document.createElement("style");
  style.textContent = "#ui,#card,#sched,#dimsL,#help,#title,#stick{display:none!important}canvas{cursor:grab}canvas:active{cursor:grabbing}";
  host.shadowRoot.appendChild(style);
}

function setRearRailIntensity(mode) {
  if (!rearRail) return;
  const intensity = mode === "bright" ? 95 : 28;
  rearRail.userData.lights.forEach((light) => { light.intensity = intensity; });
}

function addRearRail() {
  const railRecord = geometry.lighting.rails.find((rail) => rail.id === "rear-upper-left-rail");
  const {THREE, scene} = sceneRoot;
  const toFeet = (inches) => inches / 12;
  const [startX, startZ] = railRecord.modelPlacementIn.start;
  const [endX, endZ] = railRecord.modelPlacementIn.end;
  const height = railRecord.modelPlacementIn.height;
  const deltaX = endX - startX;
  const deltaZ = endZ - startZ;
  const railLength = Math.hypot(deltaX, deltaZ);
  const railYaw = -Math.atan2(deltaZ, deltaX);
  const group = new THREE.Group();
  group.name = railRecord.id;
  group.userData.meetingGeometry = clone(railRecord);
  group.userData.lights = [];

  const railMaterial = new THREE.MeshStandardMaterial({color: 0x111214, roughness: .62, metalness: .72});
  const fixtureMaterial = new THREE.MeshStandardMaterial({color: 0x171819, roughness: .48, metalness: .68});
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(toFeet(railLength), .11, .11),
    railMaterial
  );
  rail.position.set(toFeet((startX + endX) / 2), toFeet(height), toFeet((startZ + endZ) / 2));
  rail.rotation.y = railYaw;
  rail.castShadow = true;
  group.add(rail);

  const fixtureSteps = [.2, .5, .8];
  fixtureSteps.forEach((step, index) => {
    const x = startX + deltaX * step;
    const z = startZ + deltaZ * step;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .42, 16), fixtureMaterial);
    stem.position.set(toFeet(x), toFeet(height - 2.5), toFeet(z));
    stem.castShadow = true;
    group.add(stem);

    const head = new THREE.Mesh(new THREE.CylinderGeometry(.16, .23, .42, 24), fixtureMaterial);
    head.position.set(toFeet(x), toFeet(height - 7), toFeet(z));
    head.rotation.x = index === 1 ? .08 : index === 0 ? -.14 : .14;
    head.castShadow = true;
    group.add(head);

    const target = new THREE.Object3D();
    target.position.set(toFeet(76 + index * 12), .5, toFeet(92 + index * 30));
    group.add(target);
    const light = new THREE.SpotLight(0xffc892, 28, 23, .5, .55, 1.35);
    light.position.set(toFeet(x), toFeet(height - 8), toFeet(z));
    light.target = target;
    light.castShadow = index === 1;
    group.add(light);
    group.userData.lights.push(light);
  });

  scene.add(group);
  rearRail = group;
  setRearRailIntensity("lounge");
}

function correctedWallPose(segment, alongIn, projectionIn = 3.4) {
  const dx = segment.b[0] - segment.a[0];
  const dz = segment.b[1] - segment.a[1];
  const lengthIn = Math.hypot(dx, dz);
  const tx = dx / lengthIn;
  const tz = dz / lengthIn;
  const nx = -tz;
  const nz = tx;
  const wallXIn = segment.a[0] + tx * alongIn;
  const wallZIn = segment.a[1] + tz * alongIn;
  return {
    xIn: wallXIn + nx * projectionIn,
    zIn: wallZIn + nz * projectionIn,
    yawRad: Math.atan2(nx, nz)
  };
}

function correctRightWallGallery() {
  const segments = {
    eastA: {a: [146.25, 0], b: [146.25, 54]},
    northReturn: {a: [146.25, 54], b: [188, 78]},
    bay: {a: [188, 78], b: [188, 180]},
    southReturn: {a: [188, 180], b: [146.25, 201.6]}
  };
  const stations = [
    ["G-01", "eastA", 27, 3.4],
    ["G-02", "northReturn", 13.5767, 3.4],
    ["G-03", "northReturn", 33.6533, 3.4],
    ["G-04", "bay", 12, 3.4],
    ["G-05", "bay", 90, 3.4],
    ["G-06", "southReturn", 23.28, 3.4]
  ];
  stations.forEach(([id, segment, along, projection]) => {
    const object = sceneRoot.ELG[id];
    if (!object) return;
    const pose = correctedWallPose(segments[segment], along, projection);
    object.position.set(pose.xIn / 12, object.position.y, pose.zIn / 12);
    object.rotation.y = pose.yawRad;
  });

  const tv = sceneRoot.scene.children.find((object) => object.userData.rightWallTV);
  if (tv) {
    const pose = correctedWallPose(segments.bay, 129 - 78, .67 + 2.8 / 2);
    tv.position.set(pose.xIn / 12, 67.7 / 12, pose.zIn / 12);
    tv.rotation.y = 0;
    tv.userData.meetingGeometry = {wallId: "W-BAY", wallXIn: 188, confidence: "low"};
  }
}

function roundedInches(value) {
  return Math.round(value * 12 * 1000) / 1000;
}

function collectRuntimeEvidence() {
  const expectedWalls = {
    "W-NORTH": [[0, 0], [146.25, 0]],
    "W-EAST-A": [[146.25, 0], [146.25, 54]],
    "W-BAY-IN": [[146.25, 54], [188, 78]],
    "W-BAY": [[188, 78], [188, 180]],
    "W-BAY-OUT": [[188, 180], [146.25, 201.6]],
    "W-EAST-B": [[146.25, 201.6], [146.25, 259.5]],
    "W-SOUTH-SL": [[146.25, 259.5], [75.65, 259.5]],
    "W-SOUTH": [[75.65, 259.5], [0, 259.5]],
    "W-WEST": [[0, 259.5], [0, 0]]
  };
  const {THREE, DATA, ELG} = sceneRoot;
  const dataById = new Map(DATA.elements.map((element) => [element.id, element]));
  const walls = Object.entries(expectedWalls).map(([id, endpointsIn]) => {
    const source = dataById.get(id);
    const object = ELG[id];
    const box = new THREE.Box3().setFromObject(object);
    const actualMeshBoundsIn = {
      min: [roundedInches(box.min.x), roundedInches(box.min.y), roundedInches(box.min.z)],
      max: [roundedInches(box.max.x), roundedInches(box.max.y), roundedInches(box.max.z)]
    };
    const meshContainsControls = endpointsIn.every(([x, z]) =>
      x >= actualMeshBoundsIn.min[0] - .01 && x <= actualMeshBoundsIn.max[0] + .01 &&
      z >= actualMeshBoundsIn.min[2] - .01 && z <= actualMeshBoundsIn.max[2] + .01
    );
    return {
      id,
      expectedEndpointsIn: endpointsIn,
      liveControlEndpointsIn: clone(source.p.a && [source.p.a, source.p.b]),
      controlsMatch: JSON.stringify([source.p.a, source.p.b]) === JSON.stringify(endpointsIn),
      meshContainsControls,
      actualMeshBoundsIn
    };
  });
  const shellBox = new THREE.Box3();
  walls.forEach(({id}) => shellBox.expandByObject(ELG[id]));
  const livePolygon = clone(DATA.meta.polygon_in);
  const recordsMatch = JSON.stringify(livePolygon) === JSON.stringify(roomRecords.mainRoom.polygonIn) &&
    walls.every((wall) => wall.controlsMatch && wall.meshContainsControls);
  if (!recordsMatch) throw new Error("The live wall controls do not match room-records.json.");
  const boundsFor = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    return {
      min: [roundedInches(box.min.x), roundedInches(box.min.y), roundedInches(box.min.z)],
      max: [roundedInches(box.max.x), roundedInches(box.max.y), roundedInches(box.max.z)]
    };
  };
  const layoutMeshBoundsIn = Object.fromEntries(["SEAT-01", "SEAT-02A", "SEAT-02B", "SEAT-03", "BAR-01"].map((id) => {
    const object = sceneRoot.scene.children.find((child) => child.userData.plannerItemId === id);
    return [id, object ? boundsFor(object) : null];
  }));
  const frontRail = ELG["E-03"];
  return {
    recordsMatch,
    livePolygonIn: livePolygon,
    walls,
    actualWallMeshEnvelopeIn: {
      min: [roundedInches(shellBox.min.x), roundedInches(shellBox.min.y), roundedInches(shellBox.min.z)],
      max: [roundedInches(shellBox.max.x), roundedInches(shellBox.max.y), roundedInches(shellBox.max.z)]
    },
    layoutMeshBoundsIn,
    lightingMeshBoundsIn: {
      frontSpeakerRail: frontRail ? boundsFor(frontRail) : null,
      rearUpperLeftRail: rearRail ? boundsFor(rearRail) : null
    }
  };
}

function setPerspective() {
  const camera = geometry.camera.perspective;
  sceneView({
    pos: camera.positionIn.map((value) => value / 12),
    yaw: camera.yawRad,
    pitch: camera.pitchRad
  });
}

function roomModeControl(id) {
  return host.shadowRoot?.getElementById(id);
}

function lightingControl() {
  return host.shadowRoot?.getElementById("scene");
}

function updateUrl(mode, replace = false) {
  const url = new URL(location.href);
  url.searchParams.set("mode", mode);
  history[replace ? "replaceState" : "pushState"]({mode}, "", url);
}

async function settleFrame() {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

async function applyMode(mode, options = {}) {
  const nextMode = ["lounge", "bright", "plan"].includes(mode) ? mode : "lounge";
  const wasPlan = currentMode === "plan";
  currentMode = nextMode;

  if (nextMode === "plan") {
    roomModeControl("bPlan").click();
  } else {
    if (wasPlan) {
      roomModeControl("bWalk").click();
      setPerspective();
    }
    const select = lightingControl();
    select.value = geometry.lighting.modes[nextMode].scene;
    select.dispatchEvent(new Event("change", {bubbles: true}));
    setRearRailIntensity(nextMode);
  }

  modeButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.meetingMode === nextMode)));
  if (options.updateUrl) updateUrl(nextMode, options.replaceUrl);
  await settleFrame();
  return nextMode;
}

async function setMode(mode, options = {}) {
  await ready;
  return applyMode(mode, options);
}

function pngDimensions(dataURL) {
  const bytes = Uint8Array.from(atob(dataURL.split(",")[1]), (character) => character.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  return {width: view.getUint32(16), height: view.getUint32(20), bytes: bytes.length};
}

async function capture(mode = currentMode) {
  await setMode(mode);
  if (currentMode !== "plan") {
    setPerspective();
    await settleFrame();
  }
  const dataURL = mountedRoom.captureDataURL({photo: true});
  const dimensions = pngDimensions(dataURL);
  if (dimensions.width !== geometry.capture.widthPx || dimensions.height !== geometry.capture.heightPx) {
    throw new Error(`Unexpected capture size ${dimensions.width} × ${dimensions.height}.`);
  }
  captureEvidence[currentMode] = {
    ...dimensions,
    fixedCamera: currentMode === "plan" ? "orthographic-plan" : clone(geometry.camera.perspective)
  };
  return dataURL;
}

function report() {
  if (!geometry || !roomRecords || !layout) return {ready: false};
  const camera = geometry.camera.perspective;
  const layoutItems = layout.items.map(({id, name, x, z, w, d, rotation, catalogId, visible}) => ({
    id, name, x, z, w, d, rotation, catalogId, visible
  }));
  return clone({
    ready: true,
    mode: currentMode,
    scale: {sourceUnits: roomRecords.units, threeUnits: "ft", conversion: "feet = inches / 12"},
    geometrySource: geometry.geometrySource,
    room: geometry.room,
    openings: geometry.openings,
    camera: {
      ...geometry.camera,
      perspective: {
        ...camera,
        insideMainRoom: pointInPolygon(roomRecords.mainRoom.polygonIn, camera.positionIn[0], camera.positionIn[2])
      }
    },
    layout: {id: layout.id, sourcePresetId: layout.sourcePresetId, items: layoutItems},
    lighting: geometry.lighting,
    capture: {...geometry.capture, completed: clone(captureEvidence)},
    liveModel: runtimeEvidence,
    modelBoundaries: geometry.modelBoundaries
  });
}

Object.defineProperty(window, "__meetingRoom", {
  configurable: true,
  value: Object.freeze({ready, capture, report, setMode})
});

function svgEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[character]);
}

function planFurnitureMarkup(item) {
  const key = ["SEAT-01", "SEAT-02A", "SEAT-02B", "SEAT-03", "BAR-01"].includes(item.id);
  if (item.visible === false || !pointInPolygon(geometry.room.polygonIn, item.x, item.z)) return "";
  const labels = {"SEAT-01":"SOFA", "SEAT-02A":"CHAIR", "SEAT-02B":"CHAIR", "SEAT-03":"TABLE", "BAR-01":"CABINET", "KEY-01":"PIANO", "KORG-01":"KEYBOARD", "DESK-01":"DESK"};
  const label = labels[item.id] || "";
  const shape = item.id === "SEAT-03"
    ? `<ellipse cx="${item.x}" cy="${item.z}" rx="${item.w / 2}" ry="${item.d / 2}" />`
    : `<rect x="${item.x - item.w / 2}" y="${item.z - item.d / 2}" width="${item.w}" height="${item.d}" rx="${item.id.startsWith("SEAT-02") ? 7 : 2}" transform="rotate(${item.rotation} ${item.x} ${item.z})" />`;
  return `<g class="furniture${key ? "" : " retained"}">${shape}<text x="${item.x}" y="${item.z + 2}">${svgEscape(label)}</text></g>`;
}

function renderPlan() {
  const polygon = geometry.room.polygonIn.map(([x, z]) => `${x},${z}`).join(" ");
  const closet = geometry.openings.closet;
  const door = geometry.openings.entryD3;
  const slider = geometry.openings.southSliders;
  const rail = geometry.lighting.rails.find((entry) => entry.id === "rear-upper-left-rail");
  const [railStartX, railStartZ] = rail.modelPlacementIn.start;
  const [railEndX, railEndZ] = rail.modelPlacementIn.end;
  const furniture = layout.items.map(planFurnitureMarkup).join("");

  $("#dimensioned-plan").innerHTML = `<svg viewBox="-46 -48 330 354" role="img" aria-labelledby="plan-svg-title plan-svg-desc">
    <title id="plan-svg-title">Dimensioned plan of TRC Rehearsal Room 2</title>
    <desc id="plan-svg-desc">Exact eight-point room polygon with central lounge furniture, compact cabinet option, south entry, south sliders, closet and two lighting rail zones.</desc>
    <defs>
      <marker id="arrow" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="#44464a"/></marker>
      <style>
        .room{fill:#d8d2c6;stroke:#242426;stroke-width:2.2}.bay{fill:none;stroke:#d0a45a;stroke-width:4;stroke-dasharray:5 4}.furniture>*:first-child{fill:#34383c;stroke:#111214;stroke-width:1.2}.furniture text{fill:#f5f2ec;font:700 6px Arial;text-anchor:middle;paint-order:stroke;stroke:#242426;stroke-width:1.2px}.fixture{stroke:#8a6424;stroke-width:3}.fixture.proposed{stroke-dasharray:5 3}.dimension{stroke:#44464a;stroke-width:1;marker-start:url(#arrow);marker-end:url(#arrow)}.extension{stroke:#8c8983;stroke-width:.7}.label{fill:#242426;font:700 7px Arial;text-anchor:middle}.small{fill:#5e6064;font:600 5.6px Arial}.confidence-high{fill:#4d7e5d}.confidence-moderate{fill:#50779a}.confidence-low{fill:#a8772d}.door{fill:none;stroke:#50779a;stroke-width:1.3}.opening{stroke:#ede9e0;stroke-width:5}.storage{fill:#b9b4aa;stroke:#44464a;stroke-width:1}.north{font:800 8px Arial;fill:#242426;letter-spacing:1px}
      </style>
    </defs>
    <polygon class="room" points="${polygon}"/>
    <text x="73.125" y="13" class="label">NORTH · MIRROR WALL</text>
    <polyline class="bay" points="146.25,54 188,78 188,180 146.25,201.6"/>
    <rect class="storage" x="${closet.x0}" y="${closet.z0}" width="${closet.widthIn}" height="${closet.depthIn}"/>
    <text class="label" x="163.25" y="234">34 × 46</text><text class="small" x="153" y="243">CLOSET</text>
    <line class="opening" x1="${door.x0}" y1="${door.z}" x2="${door.x1}" y2="${door.z}"/>
    <path class="door" d="M${door.x0 + 36} ${door.z} A36 36 0 0 0 ${door.x0} ${door.z - 36} M${door.x0} ${door.z} L${door.x0} ${door.z - 36}"/>
    <text class="small" x="0" y="270">D3 · SOUTH ENTRY</text>
    <line class="opening" x1="${slider.x0}" y1="259.5" x2="${slider.x1}" y2="259.5"/>
    <line class="door" x1="${slider.x0}" y1="257.5" x2="${slider.x1}" y2="257.5"/>
    <text class="small" x="83" y="270">70.6 IN SLIDERS</text>
    ${furniture}
    <line class="fixture proposed" x1="${railStartX}" y1="${railStartZ}" x2="${railEndX}" y2="${railEndZ}"/>
    <text class="small confidence-low" x="-6" y="96" transform="rotate(90 -6 96)">LEFT-WALL RAIL · MEASURE ON SITE</text>
    <line class="fixture" x1="170" y1="81" x2="170" y2="177"/>
    <text class="small confidence-low" x="194" y="127" transform="rotate(90 194 127)">FRONT SPEAKER RAIL · VERIFY</text>
    <line class="extension" x1="0" y1="0" x2="0" y2="-22"/><line class="extension" x1="146.25" y1="0" x2="146.25" y2="-22"/>
    <line class="dimension" x1="0" y1="-17" x2="146.25" y2="-17"/><text class="label confidence-high" x="73.125" y="-21">12′-2¼″ · PRINTED RECORD</text>
    <line class="extension" x1="0" y1="0" x2="-30" y2="0"/><line class="extension" x1="0" y1="259.5" x2="-30" y2="259.5"/>
    <line class="dimension" x1="-23" y1="0" x2="-23" y2="259.5"/><text class="label confidence-high" x="-29" y="130" transform="rotate(-90 -29 130)">21′-7½″ · PRINTED RECORD</text>
    <line class="extension" x1="0" y1="0" x2="0" y2="-39"/><line class="extension" x1="188" y1="78" x2="188" y2="-39"/>
    <line class="dimension" x1="0" y1="-32" x2="188" y2="-32"/><text class="label confidence-moderate" x="94" y="-36">15′-8″ MAX · 2024 PLAN</text>
    <g transform="translate(205 20)"><path d="M0 18V0M0 0L-4 8M0 0L4 8" stroke="#242426" fill="none" stroke-width="1.5"/><text class="label" x="0" y="27">N</text></g>
    <g transform="translate(202 70)"><circle cx="0" cy="0" r="4" class="confidence-high"/><text class="small" x="8" y="2">PRINTED CONTROL</text><circle cx="0" cy="14" r="4" class="confidence-moderate"/><text class="small" x="8" y="16">PLAN TRACE</text><circle cx="0" cy="28" r="4" class="confidence-low"/><text class="small" x="8" y="30">FIELD CHECK</text></g>
    <text class="small confidence-low" x="0" y="282">BAY ANGLES + 102 IN CEILING REMAIN PROVISIONAL</text>
    <text class="small confidence-low" x="0" y="292">RAIL POSITIONS + DOOR HEADS NEED FIELD MEASUREMENT</text>
  </svg>`;
  $("#furniture-sizes").innerHTML = [["SEAT-01", "Sofa"], ["SEAT-02A", "Both chairs · each"], ["SEAT-03", "Round table"], ["BAR-01", "Cabinet option"]].map(([id, label]) => {
    const item = layout.items.find((entry) => entry.id === id);
    const size = id === "SEAT-03" ? `${item.w} in diameter` : `${item.w} × ${item.d} in`;
    return `<li><strong>${label}</strong><span>${size}</span></li>`;
  }).join("");
}

async function initialize() {
  try {
    const [geometryResponse, roomResponse, savedResponse] = await Promise.all([
      fetch("research/meeting-geometry-v1.0.json"),
      fetch("room-records.json"),
      fetch("exports/rehearsal-room-saved-layouts-v1.5.json")
    ]);
    if (![geometryResponse, roomResponse, savedResponse].every((response) => response.ok)) throw new Error("One or more room records could not be loaded.");
    [geometry, roomRecords] = await Promise.all([geometryResponse.json(), roomResponse.json()]);
    const savedLayouts = await savedResponse.json();
    if (JSON.stringify(geometry.room.polygonIn) !== JSON.stringify(roomRecords.mainRoom.polygonIn)) throw new Error("Meeting geometry does not match room-records.json.");
    layout = deriveLayout(savedLayouts);

    mountedRoom = await mountFullRoom(host, {
      embedded: false,
      onError: (error) => { throw error; }
    });
    hideBuiltInControls();
    sceneRoot = window.__scene;
    sceneView = window.__view;
    if (!sceneRoot || typeof sceneView !== "function") throw new Error("The deterministic camera surface is unavailable.");
    mountedRoom.applyLayout(layout);
    correctRightWallGallery();
    addRearRail();
    setPerspective();
    runtimeEvidence = collectRuntimeEvidence();
    renderPlan();

    delete window.__scene;
    delete window.__view;
    delete window.__views;
    delete window.ReferenceLayout;

    const requestedMode = new URL(location.href).searchParams.get("mode");
    await applyMode(["lounge", "bright", "plan"].includes(requestedMode) ? requestedMode : "lounge", {updateUrl: true, replaceUrl: true});
    status.classList.add("ready");
    status.textContent = "Record-backed room ready.";
    resolveReady(true);
  } catch (error) {
    status.classList.add("error");
    status.textContent = `Room model unavailable: ${error.message}`;
    rejectReady(error);
  }
}

modeButtons.forEach((button) => button.addEventListener("click", () => {
  setMode(button.dataset.meetingMode, {updateUrl: true}).catch((error) => {
    status.classList.add("error");
    status.textContent = `Room mode unavailable: ${error.message}`;
  });
}));

window.addEventListener("popstate", () => {
  const mode = new URL(location.href).searchParams.get("mode");
  setMode(["lounge", "bright", "plan"].includes(mode) ? mode : "lounge").catch(() => {});
});

initialize();
