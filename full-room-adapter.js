export const FULL_ROOM_BINDINGS = Object.freeze({
  'SEAT-01': {primary:'S-01', sources:['S-01']},
  'SEAT-02A': {primary:'S-02', sources:['S-02']},
  'SEAT-02B': {primary:'S-03', sources:['S-03']},
  'SEAT-03': {primary:'T-01', sources:['T-01','DC-1']},
  'BAR-01': {primary:'B-01', sources:['B-01','B-02','B-03','B-04']},
  'BAR-06': {primary:'S-04', sources:['S-04']},
  'KEY-01': {primary:'K-01', sources:['K-01','L-11']},
  'BENCH-01': {primary:'K-02', sources:['K-02']},
  'DESK-01': {primary:'D-01', sources:['D-01','D-02','D-03','D-04','D-07','D-09']},
  'CHAIR-01': {primary:'S-08', sources:['S-08']},
  'PMC-N': {primary:'D-05', sources:['D-05']},
  'PMC-S': {primary:'D-06', sources:['D-06']},
  'AV-PA': {primary:'D-08', sources:['D-08']},
  'KORG-01': {primary:'K-03', sources:['K-03']},
  'BENCH-02': {primary:'K-04', sources:['K-04']},
  'AMP-01': {primary:'AM-01', sources:['AM-01']},
  'AMP-02': {primary:'AM-02', sources:['AM-02']},
  'BOO-KIT': {primary:'BO-03', sources:['BO-03']},
  'BOO-DESK': {primary:'BO-05', sources:['BO-05']}
});

export const FULL_ROOM_MANAGED_IDS = Object.freeze([
  ...new Set(Object.values(FULL_ROOM_BINDINGS).flatMap((binding) => binding.sources)
    .concat(['S-05','S-06']))
]);

const INCH = 1 / 12;

export const RIGHT_WALL_TV_SPEC = Object.freeze({
  id:'TV-MAIN',
  manufacturer:'TCL',
  model:'50S551G',
  diagonalIn:50,
  widthIn:43.7,
  heightIn:25.4,
  depthIn:2.8,
  weightLb:19.6,
  vesaMm:'300 x 300',
  wallId:'W-BAY',
  centerZIn:129,
  centerYIn:67.7,
  mountGapIn:.75,
  status:'Manufacturer model envelope; retail availability and mount selection remain open.'
});

const RIGHT_WALL_SEGMENTS = Object.freeze({
  eastA:Object.freeze({a:Object.freeze([146.28,0]),b:Object.freeze([146.28,54])}),
  northReturn:Object.freeze({a:Object.freeze([146.28,54]),b:Object.freeze([186.96,78])}),
  bay:Object.freeze({a:Object.freeze([186.96,78]),b:Object.freeze([186.96,180])}),
  southReturn:Object.freeze({a:Object.freeze([186.96,180]),b:Object.freeze([146.28,201.6])})
});

// The bay can hold the 43.7 in TV and two 13 in guitars with 10.65 in
// instrument-to-screen gaps. The other eight instruments stay full scale on
// adjacent wall segments; field hanger heights and removal clearance remain a
// construction measurement hold.
const RIGHT_WALL_GUITAR_STATIONS = Object.freeze([
  Object.freeze({id:'G-01',segment:'eastA',alongIn:10.125,widthIn:13.5}),
  Object.freeze({id:'G-02',segment:'eastA',alongIn:27,widthIn:13.5}),
  Object.freeze({id:'G-03',segment:'eastA',alongIn:43.875,widthIn:13.5}),
  Object.freeze({id:'G-04',segment:'northReturn',alongIn:13.5767,widthIn:13}),
  Object.freeze({id:'G-05',segment:'northReturn',alongIn:33.6533,widthIn:13}),
  Object.freeze({id:'G-06',segment:'bay',alongIn:12,widthIn:13}),
  Object.freeze({id:'G-07',segment:'bay',alongIn:90,widthIn:13}),
  Object.freeze({id:'G-08',segment:'southReturn',alongIn:8.265,widthIn:13.5}),
  Object.freeze({id:'G-09',segment:'southReturn',alongIn:23.28,widthIn:13.5}),
  Object.freeze({id:'G-10',segment:'southReturn',alongIn:38.045,widthIn:13})
]);

function wallPose(segment, alongIn, projectionIn = 3.4) {
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
    wallXIn,wallZIn,
    xIn:wallXIn + nx * projectionIn,
    zIn:wallZIn + nz * projectionIn,
    yawRad:Math.atan2(nx,nz),
    lengthIn,nx,nz
  };
}

export function rightWallGalleryLayout(spec = RIGHT_WALL_TV_SPEC) {
  const bay = RIGHT_WALL_SEGMENTS.bay;
  const tvWall = wallPose(bay, spec.centerZIn - bay.a[1],
    spec.mountGapIn + spec.depthIn / 2);
  const guitars = RIGHT_WALL_GUITAR_STATIONS.map((station) => ({
    ...station,...wallPose(RIGHT_WALL_SEGMENTS[station.segment], station.alongIn)
  }));
  return {
    tv:{
      ...spec,
      xIn:tvWall.xIn,zIn:tvWall.zIn,yIn:spec.centerYIn,
      screenXIn:bay.a[0] - spec.mountGapIn - spec.depthIn,
      leftZIn:spec.centerZIn - spec.widthIn / 2,
      rightZIn:spec.centerZIn + spec.widthIn / 2,
      bottomYIn:spec.centerYIn - spec.heightIn / 2,
      topYIn:spec.centerYIn + spec.heightIn / 2
    },
    guitars
  };
}

export function resolveFullRoomBinding(item) {
  if (!item || typeof item !== 'object') return null;
  const catalogId = typeof item.catalogId === 'string' ? item.catalogId : '';
  if (FULL_ROOM_BINDINGS[catalogId]) return {key:catalogId,...FULL_ROOM_BINDINGS[catalogId]};
  const id = typeof item.id === 'string' ? item.id : '';
  if (FULL_ROOM_BINDINGS[id]) return {key:id,...FULL_ROOM_BINDINGS[id]};
  if (/^BAR-06(?:-|$)/.test(id)) return {key:'BAR-06',...FULL_ROOM_BINDINGS['BAR-06']};
  return null;
}

export function fullRoomPose(item) {
  const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const angle = finite(item?.rotation, 0);
  return {
    x: finite(item?.x, 0) * INCH,
    y: 0,
    z: finite(item?.z, 0) * INCH,
    width: Math.max(2, finite(item?.w, 24)) * INCH,
    depth: Math.max(2, finite(item?.d, 24)) * INCH,
    angle,
    yaw: -angle * Math.PI / 180,
    visible: item?.visible !== false
  };
}

export function isTrustedFullRoomMessage(event, hostWindow) {
  return Boolean(event && hostWindow && event.source === hostWindow.parent &&
    event.origin === hostWindow.location.origin);
}

export function attachFullRoom(context) {
  const {
    THREE, scene, DATA, ELG, builtByKind, renderer, activeCam,
    renderRefl, refreshEnv, prepareFrame, invalidateReflections, createProductEntry,
    window: hostWindow
  } = context;
  if (!THREE || !scene || !DATA || !ELG || !renderer || !hostWindow) {
    throw new Error('The full-room adapter needs the initialized room scene.');
  }

  const runtime = new Map();
  const registered = new Set();
  const dataById = new Map(DATA.elements.map((element) => [element.id, element]));
  let initialized = false;
  let refreshTimer = null;
  let disposed = false;
  let currentLayoutId = null;
  let fixedGallery = null;
  const transport = context.transport || 'message';
  const messageTransport = transport === 'message';
  const evidenceRoot = context.evidenceRoot || hostWindow.document;
  const evidenceDocument = context.evidenceDocument || hostWindow.document;
  const evidenceHost = context.evidenceHost || hostWindow.document.documentElement;
  const exposeGlobal = context.exposeGlobal !== false;
  const ownsErrorBridge = messageTransport && !hostWindow.__trcRoomErrorBridgeInstalled;

  const scheduleTimeout = context.scheduleTimeout || hostWindow.setTimeout.bind(hostWindow);
  const cancelTimeout = context.cancelTimeout || hostWindow.clearTimeout.bind(hostWindow);
  const post = (target, origin, message) => {
    if (target && typeof target.postMessage === 'function') target.postMessage(message, origin);
  };

  function evidenceNode(id) {
    let node = evidenceRoot.getElementById?.(id) || evidenceRoot.querySelector?.(`#${id}`);
    if (!node) {
      node = evidenceDocument.createElement('script');
      node.id = id;
      node.type = 'application/json';
      const target = typeof evidenceRoot.appendChild === 'function' ? evidenceRoot : evidenceRoot.body;
      if (!target || typeof target.appendChild !== 'function') {
        throw new Error('The full-room evidence root cannot accept nodes.');
      }
      target.appendChild(node);
    }
    return node;
  }

  function installRightWallGallery() {
    const layout = rightWallGalleryLayout();
    if (!layout.guitars.every((placement) => ELG[placement.id])) return null;

    const originals = layout.guitars.map((placement) => {
      const root = ELG[placement.id];
      const original = {
        root,
        x:root.position.x,y:root.position.y,z:root.position.z,
        rx:root.rotation.x,ry:root.rotation.y,rz:root.rotation.z,order:root.rotation.order
      };
      root.position.set(placement.xIn * INCH, root.position.y, placement.zIn * INCH);
      root.rotation.set(root.rotation.x, placement.yawRad, root.rotation.z, root.rotation.order);
      return original;
    });

    const tv = layout.tv;
    const group = new THREE.Group();
    group.name = 'planner-fixed-main-tv';
    group.position.set(tv.xIn * INCH, tv.yIn * INCH, tv.zIn * INCH);
    group.userData.rightWallTV = {
      id:tv.id,manufacturer:tv.manufacturer,model:tv.model,
      widthIn:tv.widthIn,heightIn:tv.heightIn,depthIn:tv.depthIn
    };
    const frameMaterial = new THREE.MeshStandardMaterial({
      color:0x111316,roughness:.42,metalness:.32
    });
    const screenMaterial = new THREE.MeshStandardMaterial({
      color:0x06090e,roughness:.16,metalness:.18,emissive:0x02050a,emissiveIntensity:.18
    });
    const mountMaterial = new THREE.MeshStandardMaterial({
      color:0x17191c,roughness:.62,metalness:.5
    });
    const addBox = (widthX, heightY, depthZ, material, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(widthX, heightY, depthZ), material);
      mesh.position.set(x,y,z);
      mesh.castShadow = mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };
    addBox(tv.depthIn * INCH,tv.heightIn * INCH,tv.widthIn * INCH,frameMaterial);
    addBox(.06 * INCH,(tv.heightIn - .7) * INCH,(tv.widthIn - .7) * INCH,
      screenMaterial,-(tv.depthIn / 2 + .035) * INCH,0,0).userData.noShadow = true;
    addBox(tv.mountGapIn * INCH,10 * INCH,18 * INCH,mountMaterial,
      (tv.depthIn / 2 + tv.mountGapIn / 2) * INCH,0,0);
    scene.add(group);

    const evidence = evidenceNode('trc-room-tv-data');
    evidence.textContent = JSON.stringify(layout);
    evidenceHost.dataset.roomTvModel = tv.model;

    return {
      group,
      dispose() {
        scene.remove(group);
        originals.forEach((original) => {
          original.root.position.set(original.x,original.y,original.z);
          original.root.rotation.set(original.rx,original.ry,original.rz,original.order);
        });
        const geometries = new Set();
        const materials = new Set();
        group.traverse((object) => {
          if (object.geometry) geometries.add(object.geometry);
          if (Array.isArray(object.material)) object.material.forEach((material) => materials.add(material));
          else if (object.material) materials.add(object.material);
        });
        geometries.forEach((geometry) => geometry.dispose?.());
        materials.forEach((material) => material.dispose?.());
      }
    };
  }

  function registerClone(clone, sourceId) {
    const kind = dataById.get(sourceId)?.kind;
    if (!kind || !builtByKind) return;
    const list = builtByKind[kind] || (builtByKind[kind] = []);
    list.push(clone);
    registered.add(clone);
    clone.userData.fullRoomKind = kind;
  }

  function unregisterClone(clone) {
    const kind = clone.userData.fullRoomKind;
    const list = kind && builtByKind?.[kind];
    if (list) {
      const index = list.indexOf(clone);
      if (index >= 0) list.splice(index, 1);
    }
    registered.delete(clone);
  }

  function rebindClonedObjectData(source, clone) {
    const sourceNodes = [];
    const cloneNodes = [];
    source.traverse((object) => sourceNodes.push(object));
    clone.traverse((object) => cloneNodes.push(object));
    const objectMap = new Map(sourceNodes.map((object, index) => [object, cloneNodes[index]]));
    sourceNodes.forEach((sourceNode, index) => {
      const cloneNode = cloneNodes[index];
      for (const [key, value] of Object.entries(sourceNode.userData || {})) {
        if (objectMap.has(value)) cloneNode.userData[key] = objectMap.get(value);
        else if (Array.isArray(value) && value.length && value.every((entry) => objectMap.has(entry))) {
          cloneNode.userData[key] = value.map((entry) => objectMap.get(entry));
        }
      }
    });
    return objectMap;
  }

  function rebindClonedLightTargets(source, clone, objectMap, wrapper, anchor, c, s) {
    const sourceNodes = [];
    const cloneNodes = [];
    source.traverse((object) => sourceNodes.push(object));
    clone.traverse((object) => cloneNodes.push(object));
    sourceNodes.forEach((sourceLight, index) => {
      if (!sourceLight.isSpotLight || !sourceLight.target) return;
      const cloneLight = cloneNodes[index];
      const nestedTarget = objectMap.get(sourceLight.target);
      if (nestedTarget) {
        cloneLight.target = nestedTarget;
        return;
      }
      const target = cloneLight.target || sourceLight.target.clone();
      const world = sourceLight.target.getWorldPosition(new THREE.Vector3());
      const dx = world.x - anchor.x;
      const dz = world.z - anchor.z;
      target.position.set(c * dx - s * dz, world.y - anchor.y, s * dx + c * dz);
      cloneLight.target = target;
      wrapper.add(target);
    });
  }

  function removeEntry(entry) {
    scene.remove(entry.group);
    for (const clone of entry.clones) unregisterClone(clone);
    entry.dispose?.();
    entry.group.traverse((object) => {
      if (!object.userData.fullRoomOwned) return;
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
      else object.material?.dispose?.();
    });
  }

  function cloneMapped(binding) {
    const primarySource = ELG[binding.primary];
    if (!primarySource) return null;
    const wrapper = new THREE.Group();
    wrapper.name = `planner-${binding.key}`;
    const clones = [];
    const anchorX = primarySource.position.x;
    const anchorY = primarySource.position.y;
    const anchorZ = primarySource.position.z;
    const anchorYaw = primarySource.rotation.y;
    const anchor = {x:anchorX,y:anchorY,z:anchorZ};
    const c = Math.cos(anchorYaw);
    const s = Math.sin(anchorYaw);
    let body = null;

    for (const sourceId of binding.sources) {
      const source = ELG[sourceId];
      if (!source) continue;
      const clone = source.clone(true);
      const objectMap = rebindClonedObjectData(source, clone);
      // Planner ownership hides the source roots before cloning. The runtime
      // clone must be visible even though it inherits that hidden flag.
      clone.visible = true;
      const dx = source.position.x - anchorX;
      const dz = source.position.z - anchorZ;
      clone.position.set(c * dx - s * dz, source.position.y - anchorY, s * dx + c * dz);
      clone.rotation.set(source.rotation.x, source.rotation.y - anchorYaw,
        source.rotation.z, source.rotation.order);
      clone.userData.fullRoomSource = sourceId;
      wrapper.add(clone);
      rebindClonedLightTargets(source, clone, objectMap, wrapper, anchor, c, s);
      clones.push(clone);
      registerClone(clone, sourceId);
      if (sourceId === binding.primary) body = clone;
    }
    if (!body) return null;

    wrapper.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(body);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    // Detailed source meshes are not all modeled around their declared center.
    // Shift the whole bundle together so the visible body's bounding center is
    // exactly the planner item center before width/depth scaling and rotation.
    for (const child of wrapper.children) {
      child.position.x -= center.x;
      child.position.z -= center.z;
    }
    return {
      group:wrapper,
      clones,
      width:Math.max(size.x, .01),
      depth:Math.max(size.z, .01),
      bindingKey:binding.key,
      sourceCenter:{x:center.x,z:center.z}
    };
  }

  function customEntry(item) {
    const group = new THREE.Group();
    const height = Math.max(8, Math.min(36, Number(item?.h) || 18)) * INCH;
    const ellipse = item?.shape === 'ellipse';
    const geometry = ellipse
      ? new THREE.CylinderGeometry(.5, .5, height, 36)
      : new THREE.BoxGeometry(1, height, 1);
    const material = new THREE.MeshStandardMaterial({
      color:0x34383d, roughness:.72, metalness:.08
    });
    const body = new THREE.Mesh(geometry, material);
    body.position.y = height / 2;
    body.castShadow = body.receiveShadow = true;
    body.userData.fullRoomOwned = true;
    group.add(body);
    group.name = `planner-custom-${String(item?.id || '')}`;
    return {group,clones:[],width:1,depth:1,bindingKey:`custom:${ellipse?'ellipse':'rect'}`,
      sourceCenter:{x:0,z:0}};
  }

  function entryInputKey(item, binding) {
    const base = binding?.key || `custom:${item?.shape === 'ellipse' ? 'ellipse' : 'rect'}`;
    if (typeof createProductEntry !== 'function') return base;
    // Product factories opt in by returning a model. These fields describe the
    // model choice while deliberately excluding pose and dimensions, so pointer
    // moves reuse the same mesh but a catalog/variant change rebuilds it.
    return JSON.stringify([
      base, item?.catalogId || '', item?.productId || '', item?.sku || '',
      item?.variant || item?.productVariant || '', item?.model || '',
      item?.profile || '', item?.shape || ''
    ]);
  }

  function productEntry(item) {
    if (typeof createProductEntry !== 'function') return null;
    const result = createProductEntry(item, {THREE});
    if (!result) return null;
    if (!result.group || !Number.isFinite(result.width) || !Number.isFinite(result.depth) ||
        result.width <= 0 || result.depth <= 0) {
      throw new Error('A full-room product factory must return a group and positive width/depth.');
    }
    result.group.name ||= `planner-product-${String(item?.id || '')}`;
    return {
      group:result.group,
      clones:Array.isArray(result.clones) ? result.clones : [],
      width:result.width,
      depth:result.depth,
      bindingKey:`product:${String(result.key || item?.catalogId || item?.id || 'custom')}`,
      sourceCenter:{x:0,z:0},
      dispose:typeof result.dispose === 'function' ? result.dispose : null
    };
  }

  function createEntry(item, binding, inputKey) {
    const entry = productEntry(item) || (binding ? cloneMapped(binding) : null) || customEntry(item);
    entry.productInputKey = inputKey;
    scene.add(entry.group);
    return entry;
  }

  function setEntryPose(entry, item) {
    const pose = fullRoomPose(item);
    entry.group.position.set(pose.x, pose.y, pose.z);
    entry.group.rotation.set(0, pose.yaw, 0);
    entry.group.scale.set(pose.width / entry.width, 1, pose.depth / entry.depth);
    entry.group.visible = pose.visible;
    entry.group.userData.plannerItemId = item.id;
    return pose;
  }

  function initializePlannerOwnership() {
    if (initialized) return;
    initialized = true;
    for (const sourceId of FULL_ROOM_MANAGED_IDS) {
      if (ELG[sourceId]) ELG[sourceId].visible = false;
      const element = dataById.get(sourceId);
      // The original walk collision code closes over DATA elements. Moving only
      // planner-owned records away disables stale furniture ghosts while its
      // room-wall clearance logic remains active.
      if (element) { element.x = 1e6; element.z = 1e6; }
    }
  }

  function invalidateScene() {
    if (renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
    if (typeof refreshEnv !== 'function') return;
    if (refreshTimer != null) cancelTimeout(refreshTimer);
    refreshTimer = scheduleTimeout(() => {
      refreshTimer = null;
      if (!disposed) refreshEnv();
    }, 180);
  }

  function writePoseEvidence(layout, applied) {
    const node = evidenceNode('trc-room-pose-data');
    node.textContent = JSON.stringify({layoutId:currentLayoutId,name:layout?.name || '',items:applied});
    evidenceHost.dataset.roomLayoutId = currentLayoutId || '';
    evidenceHost.dataset.roomItemCount = String(applied.length);
  }

  function applyLayout(layout) {
    if (disposed) return [];
    initializePlannerOwnership();
    const items = Array.isArray(layout?.items) ? layout.items : [];
    const retained = new Set();
    const applied = [];
    items.forEach((item, index) => {
      const id = typeof item?.id === 'string' && item.id ? item.id : `item-${index}`;
      const binding = resolveFullRoomBinding(item);
      const inputKey = entryInputKey(item, binding);
      let entry = runtime.get(id);
      if (entry && entry.productInputKey !== inputKey) {
        removeEntry(entry);
        runtime.delete(id);
        entry = null;
      }
      if (!entry) {
        entry = createEntry({...item,id}, binding, inputKey);
        runtime.set(id, entry);
      }
      retained.add(id);
      const pose = setEntryPose(entry, {...item,id});
      applied.push({id,x:pose.x,y:pose.y,z:pose.z,angle:pose.angle,visible:pose.visible});
    });
    for (const [id, entry] of runtime) {
      if (retained.has(id)) continue;
      removeEntry(entry);
      runtime.delete(id);
    }
    currentLayoutId = layout?.id == null ? null : String(layout.id);
    writePoseEvidence(layout, applied);
    if (typeof invalidateReflections === 'function') invalidateReflections();
    invalidateScene();
    return applied;
  }

  function renderCurrentFrame() {
    if (typeof renderRefl === 'function') renderRefl();
    renderer.render(scene, activeCam());
  }

  function capturePhotoFrame() {
    const camera = activeCam();
    const previousPixelRatio = renderer.getPixelRatio();
    const previousSize = renderer.getSize(new THREE.Vector2());
    const hasAspect = Number.isFinite(camera?.aspect);
    const previousAspect = hasAspect ? camera.aspect : null;
    let result;
    let failure = null;
    try {
      renderer.setPixelRatio(1);
      renderer.setSize(1536, 1024, false);
      if (hasAspect) {
        camera.aspect = 1536 / 1024;
        camera.updateProjectionMatrix();
      }
      if (typeof prepareFrame === 'function') prepareFrame();
      else renderCurrentFrame();
      result = renderer.domElement.toDataURL('image/png');
    } catch (error) {
      failure = error;
    } finally {
      let restoreFailure = null;
      const restore = (operation) => {
        try { operation(); }
        catch (error) { if (!restoreFailure) restoreFailure = error; }
      };
      restore(() => renderer.setPixelRatio(previousPixelRatio));
      restore(() => renderer.setSize(previousSize.x, previousSize.y, false));
      if (hasAspect) {
        restore(() => {
          camera.aspect = previousAspect;
          camera.updateProjectionMatrix();
        });
      }
      restore(renderCurrentFrame);
      if (!failure) failure = restoreFailure;
    }
    if (failure) throw failure;
    return result;
  }

  function captureDataURL({photo = false} = {}) {
    if (disposed) throw new Error('The full-room scene has been disposed.');
    if (photo === true) return capturePhotoFrame();
    if (typeof prepareFrame === 'function') prepareFrame();
    else renderCurrentFrame();
    return renderer.domElement.toDataURL('image/png');
  }

  function capture(requestId, target, origin, photo = false) {
    try {
      const dataURL = captureDataURL({photo});
      post(target, origin, {type:'trc-room-capture-result',requestId,dataUrl:dataURL,layoutId:currentLayoutId});
    } catch (error) {
      post(target, origin, {type:'trc-room-capture-result',requestId,
        error:error?.message || 'The room image could not be captured.',layoutId:currentLayoutId});
    }
  }

  function onMessage(event) {
    if (!isTrustedFullRoomMessage(event, hostWindow) || !event.data || typeof event.data !== 'object') return;
    if (event.data.type === 'trc-layout-update') {
      const applied = applyLayout(event.data.layout);
      post(event.source, event.origin, {
        type:'trc-layout-applied',
        revision:event.data.revision == null ? '' : String(event.data.revision),
        layoutId:currentLayoutId,
        items:applied
      });
    } else if (event.data.type === 'trc-room-capture') {
      capture(event.data.requestId, event.source, event.origin, event.data.photo === true);
    }
  }

  function notifyReady() {
    try {
      if (typeof prepareFrame === 'function') prepareFrame();
      evidenceHost.dataset.roomReady = 'true';
      if (messageTransport) {
        post(hostWindow.parent, hostWindow.location.origin, {
          type:'trc-room-ready', api:1, mappedCatalogItems:Object.keys(FULL_ROOM_BINDINGS).length
        });
      }
    } catch (error) {
      if (messageTransport) reportError({error});
      else {
        evidenceHost.dataset.roomReady = 'error';
        throw error;
      }
    }
  }

  function reportError(event) {
    const error = event?.error?.message || event?.reason?.message || event?.message ||
      String(event?.reason || 'The full room encountered an error.');
    evidenceHost.dataset.roomReady = 'error';
    if (typeof context.onError === 'function') context.onError(event?.error || event?.reason || new Error(error));
    if (messageTransport) post(hostWindow.parent, hostWindow.location.origin, {type:'trc-room-error',error});
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (messageTransport) hostWindow.removeEventListener('message', onMessage);
    if (ownsErrorBridge) {
      hostWindow.removeEventListener('error', reportError);
      hostWindow.removeEventListener('unhandledrejection', reportError);
    }
    if (refreshTimer != null) cancelTimeout(refreshTimer);
    for (const entry of runtime.values()) removeEntry(entry);
    runtime.clear();
    registered.clear();
    fixedGallery?.dispose();
    fixedGallery = null;
    if (exposeGlobal && hostWindow.__fullRoomAdapter?.dispose === dispose) {
      delete hostWindow.__fullRoomAdapter;
    }
  }

  fixedGallery = installRightWallGallery();
  if (messageTransport) hostWindow.addEventListener('message', onMessage);
  if (ownsErrorBridge) {
    hostWindow.addEventListener('error', reportError);
    hostWindow.addEventListener('unhandledrejection', reportError);
  }
  if (context.embedded === true || new URLSearchParams(hostWindow.location.search || '').get('embedded') === '1') {
    const help = evidenceRoot.getElementById?.('help') || evidenceRoot.querySelector?.('#help');
    if (help) help.textContent = 'Walk: WASD or arrows, drag to look, Q/E to turn, R/F height. Orbit: drag and use the wheel. Choose Move furniture to edit the layout.';
  }
  if (transport === 'none' || transport === 'direct' || hostWindow.document.readyState === 'complete') notifyReady();
  else hostWindow.addEventListener('load', notifyReady, {once:true});
  const api = {applyLayout,capture,captureDataURL,dispose};
  if (exposeGlobal) hostWindow.__fullRoomAdapter = api;
  return api;
}
