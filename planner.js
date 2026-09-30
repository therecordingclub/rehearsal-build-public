(() => {
  'use strict';

  const G = window.LayoutGeometry;
  const C = window.FurnitureCatalog;
  const F = window.FurnitureProfiles;
  const $ = (id) => document.getElementById(id);
  const svg = $('plan');
  const rooms = [GUIDE.room.polygon, GUIDE.room.booth];
  const R = GUIDE.room.records;
  const query = new URLSearchParams(location.search);
  const requestedArrangement = query.get('arrangement');
  const hasExplicitArrangement = query.has('arrangement');
  const budgetPreset = window.ReferenceLayout.budget;
  const storeKey = 'trc-rehearsal-planner-v1' + (query.has('qa') ? '-qa' : '');
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const id = () => 'layout-' + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
  const round = (n) => Math.round(n * 100) / 100;
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const palette = {bar:'#e3cfac', lounge:'#a9c5b7', studio:'#b3c8df', band:'#c6c0dc', booth:'#d2c4b4', custom:'#ced5da'};
  const longNames = {'KEY-01':'Yamaha NU1X', 'BENCH-01':'Piano bench', 'SEAT-03':'Coffee table', 'SEAT-02A':'Swivel chair A', 'SEAT-02B':'Swivel chair B', 'DESK-01':'Studio desk', 'AV-PA':'PA / Fender', 'CHAIR-01':'Engineer chair', 'PMC-N':'North monitor · verify', 'PMC-S':'South monitor · verify', 'BOO-KIT':'Drum kit', 'BOO-DESK':'Booth desk'};
  const profileNames = new Set(['curved-sofa','lounge-chair','alpine-sofa','dyvlinge-chair','office-chair','upright-piano','stage-piano','bench','bar','desk','booth-desk','monitor','amp','stool','round-table','drum-kit','pa-stand','rect','ellipse']);
  function decorate(item, legacy = false) {
    const catalogId = Object.hasOwn(C.records,item.catalogId) ? item.catalogId : Object.hasOwn(C.records,item.id) ? item.id : /^BAR-06-[123]$/.test(item.id) ? 'BAR-06' : null;
    const record = C.records[catalogId];
    let {w,d,rotation} = item;
    if (legacy && record) {
      if (record.swapAxes) { [w,d] = [d,w]; rotation = G.normalizeAngle(rotation+record.rotation); }
      const original = GUIDE.layout.find((piece) => piece.id === catalogId);
      if (!record.swapAxes && original && w === original.w && d === original.d) { w=record.w; d=record.d; }
    }
    const profile = record?.profile || (profileNames.has(item.profile) ? item.profile : item.shape === 'ellipse' ? 'ellipse' : 'rect');
    return {...item,w,d,rotation,catalogId,profile,catalogVersion:C.version,outline:F.outline(profile)};
  }
  const startingItems = GUIDE.layout.flatMap((piece) => {
    const catalogId = piece.catalogId || piece.id;
    const record = C.records[catalogId];
    const common = {id:piece.id, name:record?.name || longNames[piece.id] || piece.label, x:piece.x, z:piece.z, w:record?.w || piece.w, d:record?.d || piece.d, rotation:piece.rotation ?? record?.rotation ?? 0, shape:piece.kind === 'circle' ? 'ellipse' : 'rect', zone:piece.zone, locked:false, visible:true,catalogId:record ? catalogId : null};
    return piece.kind === 'stools' ? [-18,0,18].map((offset, i) => ({...common, id:piece.id + '-' + (i+1), name:'Bar stool ' + (i+1), z:piece.z + offset, w:15, d:15, shape:'ellipse'})) : [common];
  }).map((item) => decorate(item));
  const freshLayout = (name = 'Starting arrangement') => ({id:id(), name, items:clone(startingItems), updatedAt:new Date().toISOString()});
  function blankState() {
    if (window.SharedLayoutBackup) return validatedState(window.SharedLayoutBackup);
    const first = freshLayout();
    return {kind:'trc-rehearsal-layouts', schema:1, activeId:first.id, layouts:[first], snap:1, showFit:true};
  }

  function validatedItems(items) {
    if (!Array.isArray(items) || items.length > 100) throw new Error('Each layout needs a furniture list with no more than 100 pieces.');
    const used = new Set();
    return items.map((item) => {
      if (!item || typeof item !== 'object' || !['x','z','w','d'].every((key) => typeof item[key] === 'number' && Number.isFinite(item[key])) || Math.abs(item.x) > 2000 || Math.abs(item.z) > 2000 || item.w < 2 || item.w > 300 || item.d < 2 || item.d > 300) throw new Error('Furniture dimensions must be 2–300 inches, with valid numeric positions.');
      if (item.rotation != null && (typeof item.rotation !== 'number' || !Number.isFinite(item.rotation))) throw new Error('A furniture angle is invalid.');
      const itemId = typeof item.id === 'string' && item.id.length < 100 && !used.has(item.id) ? item.id : id();
      used.add(itemId);
      return decorate({id:itemId, name:String(item.name || 'Furniture').slice(0,60), x:item.x, z:item.z, w:item.w, d:item.d, rotation:G.normalizeAngle(item.rotation || 0), shape:item.shape === 'ellipse' ? 'ellipse' : 'rect', zone:Object.hasOwn(palette, item.zone) ? item.zone : 'custom', locked:item.locked === true, visible:true,catalogId:item.catalogId,profile:item.profile},item.catalogVersion !== C.version);
    });
  }

  function validatedState(input) {
    if (!input || input.kind !== 'trc-rehearsal-layouts' || input.schema !== 1 || !Array.isArray(input.layouts) || !input.layouts.length || input.layouts.length > 30) throw new Error('Choose a room planner backup with 1–30 saved layouts.');
    const used = new Set();
    const layouts = input.layouts.map((layout) => {
      if (!layout || typeof layout !== 'object') throw new Error('A saved layout is invalid.');
      const layoutId = typeof layout.id === 'string' && layout.id.length < 100 && !used.has(layout.id) ? layout.id : id();
      used.add(layoutId);
      return {id:layoutId, name:String(layout.name || 'Imported layout').slice(0,60), items:validatedItems(layout.items), updatedAt:typeof layout.updatedAt === 'string' ? layout.updatedAt.slice(0,40) : new Date().toISOString(),
        ...(layout.sourcePresetId === budgetPreset.id ? {sourcePresetId:budgetPreset.id} : {})};
    });
    return {kind:'trc-rehearsal-layouts', schema:1, activeId:layouts.some((layout) => layout.id === input.activeId) ? input.activeId : layouts[0].id, layouts, snap:[0,1,3,6].includes(input.snap) ? input.snap : 1, showFit:input.showFit !== false};
  }

  let state = blankState();
  let storageBlocked = false;
  let recoveryMessage = '';
  let lastStoredRaw = null;
  let loadedFromStorage = false;
  let hadValidSavedState = Boolean(window.SharedLayoutBackup);
  try {
    const raw = localStorage.getItem(storeKey);
    lastStoredRaw = raw;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        state = validatedState(parsed); loadedFromStorage = true; hadValidSavedState = true;
        if (parsed.layouts.some((layout) => layout.items.some((item) => item.catalogVersion !== C.version))) {
          if (!localStorage.getItem(storeKey+'-before-shapes-v2')) localStorage.setItem(storeKey+'-before-shapes-v2',raw);
          loadedFromStorage = false;
          recoveryMessage = 'Furniture shapes and source sizes updated. Your saved layouts and center positions were kept.';
        }
      }
      catch (error) {
        // Keep the original bytes before allowing a new state to be saved.
        localStorage.setItem(storeKey + '-recovery-' + Date.now(), raw);
        recoveryMessage = 'Saved data could not be read. Its original copy was preserved; a starting layout is open.';
      }
    }
  } catch (_) { storageBlocked = true; recoveryMessage = 'Browser storage is unavailable. Export an editable backup before leaving.'; }
  const requestedPreset = window.ReferenceLayout.presets[requestedArrangement];
  // QA without an arrangement intentionally keeps its long-standing clean
  // starting-data path. Production bare URLs default to the budget once, while
  // an existing budget copy never overrides the saved selection on reload.
  const wantsBudget = requestedArrangement === 'budget-v1.9' ||
    (!hasExplicitArrangement && !query.has('qa'));
  if (wantsBudget) {
    let preset = state.layouts.find((layout) => layout.id === budgetPreset.id);
    let created = false;
    if (!preset && state.layouts.length < 30) {
      let backupReady = true;
      if (hadValidSavedState && lastStoredRaw) {
        try {
          const backupKey = storeKey + '-before-budget-v1.9';
          if (!localStorage.getItem(backupKey)) localStorage.setItem(backupKey,lastStoredRaw);
        } catch (_) {
          backupReady = false;
          storageBlocked = true;
          recoveryMessage = 'The balanced-plan copy was not added because the original saved data could not be backed up.';
        }
      }
      if (backupReady) {
        const source = state.layouts.find((layout) => layout.id === state.activeId);
        const items = hadValidSavedState
          ? budgetPreset.upgrade(clone(source.items))
          : budgetPreset.build(clone(startingItems));
        preset = {...freshLayout(budgetPreset.name),id:budgetPreset.id,sourcePresetId:budgetPreset.id,
          items:validatedItems(items)};
        if (hadValidSavedState) state.layouts.push(preset);
        else state = {...state,activeId:preset.id,layouts:[preset]};
        created = true;
      }
    }
    if (preset && (created || requestedArrangement === 'budget-v1.9')) {
      state.activeId = preset.id;
      loadedFromStorage = false;
    } else if (!preset && state.layouts.length >= 30) {
      recoveryMessage = 'Your collection has 30 layouts. Existing layouts and the current selection were kept; export a backup before adding the balanced $25k plan.';
    }
  } else if (requestedPreset) {
    const presetId = requestedPreset.id;
    let preset = state.layouts.find((layout) => layout.id === presetId);
    if (!preset && state.layouts.length < 30) {
      preset = {...freshLayout(requestedPreset.name),id:presetId,
        items:validatedItems(requestedPreset.build(clone(startingItems)))};
      state.layouts.push(preset);
    }
    if (preset) { state.activeId = preset.id; loadedFromStorage = false; }
    else recoveryMessage = 'Your collection has 30 layouts. Export a backup before adding the original-design arrangement.';
  }
  let selectedId = state.layouts.find((layout) => layout.id === state.activeId).items.find((item) => item.id === 'SEAT-01')?.id || null;
  let view = 'main';
  let camera = {x:-26, z:-24, w:245, h:312};
  let gesture = null;
  let sliderBefore = null;
  let toastTimer;
  let nameMode = 'copy';
  let displayMode = '2d';
  let finishedRenderer = null;
  let roomPhoto = null;
  let issueMap = new Map();
  let issues = [];
  const pointers = new Map();
  const histories = new Map();
  const active = () => state.layouts.find((layout) => layout.id === state.activeId);
  const selected = () => active().items.find((item) => item.id === selectedId);
  const history = () => {
    if (!histories.has(state.activeId)) histories.set(state.activeId, {undo:[], redo:[]});
    return histories.get(state.activeId);
  };

  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('show');
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4500);
  }
  function persist() {
    active().updatedAt = new Date().toISOString();
    try {
      if (storageBlocked) throw new Error('Storage unavailable');
      const storedRaw = localStorage.getItem(storeKey);
      if (storedRaw !== lastStoredRaw && storedRaw) {
        const incoming = validatedState(JSON.parse(storedRaw));
        const baseline = lastStoredRaw ? validatedState(JSON.parse(lastStoredRaw)) : {layouts:[]};
        const signature = (layout) => layout && JSON.stringify([layout.name,layout.items.map((item) => [item.id,item.name,item.x,item.z,item.w,item.d,item.rotation,item.shape,item.profile,item.catalogId,item.zone,item.locked])]);
        const localActiveId = state.activeId;
        const localHistory = histories.get(localActiveId);
        let nextActiveId = localActiveId;
        let keptActiveChanges = false;
        let madeCopy = false;
        for (const local of state.layouts) {
          const base = baseline.layouts.find((layout) => layout.id === local.id);
          if (signature(local) === signature(base)) continue;
          const index = incoming.layouts.findIndex((layout) => layout.id === local.id);
          const remote = incoming.layouts[index];
          if (!remote || (signature(remote) !== signature(base) && signature(remote) !== signature(local))) {
            if (incoming.layouts.length >= 30) throw new Error('Collection full');
            const preserved = {...clone(local),id:remote ? id() : local.id};
            if (remote) { preserved.name=local.name.slice(0,42)+' · this tab'; madeCopy=true; }
            incoming.layouts.push(preserved);
            if (local.id === localActiveId) nextActiveId = preserved.id;
          } else incoming.layouts[index] = clone(local);
          if (local.id === localActiveId) keptActiveChanges = true;
        }
        state = {...incoming,activeId:incoming.layouts.some((layout) => layout.id === nextActiveId) ? nextActiveId : incoming.activeId,snap:state.snap,showFit:state.showFit};
        histories.clear();
        if (keptActiveChanges && localHistory) histories.set(state.activeId,localHistory);
        lastStoredRaw = storedRaw;
        updateLayoutOptions();
        render();
        toast(madeCopy ? 'Another tab changed this layout. Both versions were kept; you are editing the “this tab” copy.' : 'Changes from the other tab were kept with your edits.');
      }
      const serialized = JSON.stringify(state);
      localStorage.setItem(storeKey, serialized);
      lastStoredRaw = serialized;
      $('save-status').textContent = '✓ Saved in this browser';
      $('save-status').classList.remove('save-error');
    } catch (_) {
      $('save-status').textContent = '⚠ Not saved — export an editable backup';
      $('save-status').classList.add('save-error');
    }
  }
  function record(before) {
    if (JSON.stringify(before) === JSON.stringify(active().items)) return false;
    const h = history();
    h.undo.push(before);
    if (h.undo.length > 100) h.undo.shift();
    h.redo = [];
    persist();
    return true;
  }
  function mutate(change) {
    const before = clone(active().items);
    change();
    record(before);
    render();
  }
  function undo(redo = false) {
    finishGesture();
    const h = history();
    const source = redo ? h.redo : h.undo;
    if (!source.length) return;
    (redo ? h.undo : h.redo).push(clone(active().items));
    active().items = source.pop();
    if (!selected()) selectedId = null;
    persist(); render();
    toast(redo ? 'Change restored.' : 'Change undone.');
  }

  function sector(cx, cz, radius, start, end) {
    const points = [[cx,cz]];
    for (let i = 0; i <= 24; i++) {
      const a = (start + (end - start) * i / 24) * Math.PI / 180;
      points.push([cx + radius * Math.cos(a), cz + radius * Math.sin(a)]);
    }
    return points;
  }
  const doorZones = [{name:'D3 entrance swing', polygon:sector(R.entryDoor.openingIn.x0,R.entryDoor.openingIn.z,R.entryDoor.nominalLeafWidthIn,-90,0)}, {name:'D2 closet swing (provisional)', polygon:sector(R.closet.x0,R.closet.door.workingOpeningZ1,R.closet.door.workingLeafWidthIn,180,270)}];
  function checkFit() {
    issueMap = new Map(active().items.map((item) => [item.id, []]));
    issues = [];
    const footprints = active().items.map((item) => G.footprint(item));
    const add = (ids, message) => {
      ids.forEach((itemId) => issueMap.get(itemId).push(message));
      issues.push({ids, message});
    };
    active().items.forEach((item, i) => {
      if (!G.fitsInRooms(item, rooms)) add([item.id], item.name + ': outside the room outline.');
      doorZones.forEach((door) => {
        if (G.polygonsOverlap(footprints[i], door.polygon)) add([item.id], item.name + ': overlaps ' + door.name + '.');
      });
      for (let j = i + 1; j < active().items.length; j++) {
        if (G.polygonsOverlap(footprints[i], footprints[j])) add([item.id, active().items[j].id], item.name + ' overlaps ' + active().items[j].name + '.');
      }
    });
  }
  const pts = (points) => points.map((point) => point.map(round).join(',')).join(' ');
  function roomMarkup() {
    const entry = R.entryDoor.openingIn, closet = R.closet, slider = R.sliders;
    const sx = slider.openingX0, ex = slider.openingX1, mid = (sx+ex)/2;
    return `<g stroke-linejoin="round"><polygon points="${pts(rooms[0])}" fill="#fffdfa" stroke="#526477" stroke-width="2.5"/><polygon points="${pts(rooms[1])}" fill="#fcfaf6" stroke="#526477" stroke-width="2.5"/><polygon points="${pts(rooms[0])}" fill="url(#grid)"/><polygon points="${pts(rooms[1])}" fill="url(#grid)"/>
      <rect x="${closet.x0}" y="${closet.z0}" width="${closet.widthIn}" height="${closet.depthIn}" fill="#e1e7ed" stroke="#8997a7" stroke-width="1"/>
      <text x="163.3" y="234" text-anchor="middle" font-family="Arial,sans-serif" font-size="4" fill="#61758a">HVAC</text><text x="163.3" y="240" text-anchor="middle" font-family="Arial,sans-serif" font-size="4" fill="#61758a">closet</text>
      ${doorZones.map((door) => `<polygon points="${pts(door.polygon)}" fill="url(#door-hatch)" stroke="#b88948" stroke-width=".6" stroke-dasharray="2 2"/>`).join('')}
      <path d="M${entry.x0} ${entry.z}H${entry.x1}M${closet.x0} ${closet.door.workingOpeningZ0}V${closet.door.workingOpeningZ1}M${sx} ${R.vestibule.z0}H${ex}M${sx} ${R.vestibule.z1}H${ex}" fill="none" stroke="#fffdfa" stroke-width="3"/>
      ${[R.vestibule.z0,R.vestibule.z1].map(z=>`<path d="M${sx} ${z-.9}H${mid+5}M${mid-5} ${z+.9}H${ex}" fill="none" stroke="#6d93a0" stroke-width=".9"/>`).join('')}
      <path d="M${entry.x0} ${entry.z}V${entry.z-R.entryDoor.nominalLeafWidthIn}M${closet.x0} ${closet.door.workingOpeningZ1}H${closet.x0-closet.door.workingLeafWidthIn}" fill="none" stroke="#ad8248" stroke-width="1.3"/>
      <text x="73" y="-11" text-anchor="middle" fill="#61758a" font-size="5" font-family="Arial,sans-serif" letter-spacing="1">NORTH ↑</text>
      <text x="-9" y="145" text-anchor="middle" transform="rotate(-90 -9 145)" fill="#718295" font-size="4.5" font-family="Arial,sans-serif">21′ 7½″ · facility record</text>
      <text x="73" y="-3" text-anchor="middle" fill="#718295" font-size="4" font-family="Arial,sans-serif">12′ 2¼″ main width</text>
      <text x="19" y="269" text-anchor="middle" fill="#61758a" font-size="4.3" font-family="Arial,sans-serif">D3 / SOUTH ENTRY</text>
      <text x="134" y="397" text-anchor="middle" fill="#61758a" font-size="5" font-family="Arial,sans-serif" letter-spacing=".5">DRUM BOOTH</text></g>`;
  }
  function pieceMarkup(item, exporting = false) {
    const isSelected = !exporting && item.id === selectedId;
    const hasIssue = state.showFit && issueMap.get(item.id)?.length;
    const record = C.records[item.catalogId];
    const fill = record?.color || palette[item.zone] || palette.custom;
    const stroke = isSelected ? '#295fbb' : hasIssue ? '#ab741c' : '#6c7d8b';
    const shape = item.outline ? `<polygon class="body" points="${pts(item.outline.map(([u,v]) => [u*item.w,v*item.d]))}"` : item.shape === 'ellipse' || ['stool','round-table','pa-stand'].includes(item.profile) ? `<ellipse class="body" rx="${item.w/2}" ry="${item.d/2}"` : `<rect class="body" x="${-item.w/2}" y="${-item.d/2}" width="${item.w}" height="${item.d}" rx="1.5"`;
    const label = item.name.replace(' · verify','?').replace('Yamaha ','').replace('Studio ','').replace('chair ','').replace('Bar stool ','Stool ').replace('North monitor','Monitor N').replace('South monitor','Monitor S');
    const short = label.length > 17 ? label.slice(0,16) + '…' : label;
    const fontSize = Math.min(5, Math.max(3.1, item.w / Math.max(5, short.length) * 1.4));
    const allowance = ['drum-kit','pa-stand'].includes(item.profile);
    const textFill = record && !allowance ? '#fff' : '#26384a';
    const envelope = record && record.quality !== 'published' ? `<rect x="${-item.w/2}" y="${-item.d/2}" width="${item.w}" height="${item.d}" fill="none" stroke="#8b929b" stroke-width=".4" stroke-dasharray="1.5 1.5" opacity=".65" pointer-events="none"/>` : '';
    return `<g class="piece${item.locked ? ' locked' : ''}" data-piece="${esc(item.id)}" role="button" tabindex="0" aria-label="${esc(item.name)}, ${round(item.rotation)} degrees${item.locked ? ', locked' : ''}" aria-pressed="${isSelected}" transform="translate(${item.x} ${item.z}) rotate(${item.rotation})"><title>${esc(item.name)} · ${item.w} × ${item.d} in · ${round(item.rotation)}°${item.locked ? ' · locked' : ''}</title>${envelope}${shape} fill="${allowance ? '#e9e3d755' : fill}" stroke="${stroke}" stroke-width="${isSelected ? 1.1 : .7}"${allowance ? ' stroke-dasharray="2 2"' : ''}/>${F.art(item)}<text class="piece-label" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-weight="600" style="fill:${textFill};paint-order:stroke;stroke:${allowance ? '#ffffffdd' : '#252b32d9'};stroke-width:1.1;stroke-linejoin:round" font-size="${fontSize}" transform="rotate(${-item.rotation})">${esc(short)}</text>${item.locked ? `<text x="0" y="${Math.min(item.d/2-2,9)}" text-anchor="middle" font-size="3.5" fill="${textFill}">LOCKED</text>` : ''}</g>`;
  }
  function unitsPerPixel() {
    const matrix = svg.getScreenCTM();
    return matrix ? 1 / Math.hypot(matrix.a, matrix.b) : .5;
  }
  function selectionMarkup() {
    const item = selected();
    if (!item || item.locked) return '';
    const scale = unitsPerPixel();
    const radius = 11 * scale;
    const y = -item.d/2 - 29*scale;
    return `<g transform="translate(${item.x} ${item.z}) rotate(${item.rotation})" stroke="#295fbb"><rect x="${-item.w/2-2*scale}" y="${-item.d/2-2*scale}" width="${item.w+4*scale}" height="${item.d+4*scale}" fill="none" stroke-width="${1.2*scale}" stroke-dasharray="${3*scale} ${3*scale}" pointer-events="none"/><path d="M0 ${-item.d/2}V${y}" stroke-width="${1.4*scale}" pointer-events="none"/><g class="rotate-handle" data-rotate="true" role="button" tabindex="0" aria-label="Rotate selected furniture; drag handle or use R key"><circle cx="0" cy="${y}" r="${Math.max(radius,20*scale)}" fill="transparent" stroke="none"/><circle cx="0" cy="${y}" r="${radius}" fill="#295fbb" stroke="#fff" stroke-width="${2*scale}"/><text x="0" y="${y}" fill="#fff" stroke="none" text-anchor="middle" dominant-baseline="central" font-size="${17*scale}" font-family="Arial,sans-serif">↻</text></g></g>`;
  }
  function draw() {
    const focusedPiece = document.activeElement.closest?.('[data-piece]')?.dataset.piece;
    const focusedHandle = !!document.activeElement.closest?.('[data-rotate]');
    svg.setAttribute('viewBox', `${camera.x} ${camera.z} ${camera.w} ${camera.h}`);
    const item = selected();
    const ordered = active().items.filter((piece) => piece.id !== selectedId);
    if (item) ordered.push(item);
    $('scene').innerHTML = roomMarkup() + ordered.map((piece) => pieceMarkup(piece)).join('');
    $('selection-layer').innerHTML = selectionMarkup();
    $('zoom-level').textContent = Math.round((view === 'booth' ? 174 : view === 'all' ? 444 : 312) / camera.h * 100) + '%';
    $('position-hint').textContent = item ? `${round(item.x)}, ${round(item.z)} in · ${round(item.rotation)}°` : 'Dimensions in inches';
    if (focusedPiece) svg.querySelector(`[data-piece="${CSS.escape(focusedPiece)}"]`)?.focus({preventScroll:true});
    else if (focusedHandle) svg.querySelector('[data-rotate]')?.focus({preventScroll:true});
    finishedRenderer?.update(active());
    roomPhoto?.update(active());
  }
  function updateInspector() {
    const item = selected();
    $('selected-name').textContent = item ? item.name : 'Choose a piece.';
    $('empty-selection').hidden = !!item;
    $('piece-controls').hidden = !item;
    $('piece-size-readout').hidden = !item;
    $('piece-accuracy').hidden = !item;
    if (!item) return;
    const record = C.records[item.catalogId];
    const customSize = record && (Math.abs(item.w-record.w)>.00001 || Math.abs(item.d-record.d)>.00001);
    $('piece-size-readout').textContent = `${Number(item.w.toFixed(4))} × ${Number(item.d.toFixed(4))} in`;
    $('piece-accuracy').innerHTML = record ? `<span class="accuracy-badge ${record.quality==='published'&&!customSize ? 'published' : 'estimate'}">${customSize ? 'Layout dimensions · verify size' : record.quality==='published' ? 'Published body size · confirm model' : record.quality==='proposed' ? 'Proposed size · verify on site' : record.quality==='concept' ? 'Concept size · exact model needed' : 'Size unverified · measure this piece'}</span><details><summary>Size + shape source</summary><div>${esc(record.note)}${customSize ? ' This layout uses dimensions different from the starting proposal; confirm the actual piece before ordering.' : ''}</div><a href="${esc(record.source)}" target="_blank" rel="noopener">${esc(record.sourceLabel)} ↗</a></details>` : '<span class="accuracy-badge estimate">Your dimensions · confirm on site</span>';
    $('restore-source-size').hidden = !record;
    $('restore-source-size').disabled = item.locked;
    const fields = {'angle':round(item.rotation), 'angle-slider':Math.round(item.rotation), 'pos-x':round(item.x), 'pos-z':round(item.z), 'piece-name':item.name, 'piece-width':Number(item.w.toFixed(4)), 'piece-depth':Number(item.d.toFixed(4))};
    Object.entries(fields).forEach(([field,value]) => {
      if (document.activeElement !== $(field)) $(field).value = value;
      $(field).disabled = item.locked;
    });
    document.querySelectorAll('[data-turn]').forEach((button) => button.disabled = item.locked);
    $('remove-piece').disabled = item.locked;
    $('piece-locked').checked = item.locked;
    const warnings = issueMap.get(item.id) || [];
    $('piece-fit').innerHTML = warnings.length ? `<div class="fit-warning"><strong>⚠ Check this footprint</strong><ul>${warnings.map((message) => `<li>${esc(message)}</li>`).join('')}</ul></div>` : '<div class="fit-clear">✓ No footprint overlaps found.<br>Check occupied clearance on site.</div>';
  }
  function updateList() {
    const focusedRow = document.activeElement.closest?.('#furniture-list [data-select]')?.dataset.select;
    const term = $('furniture-search').value.toLowerCase().trim();
    const matches = active().items.filter((item) => item.name.toLowerCase().includes(term));
    $('furniture-list').innerHTML = matches.length ? matches.map((item) => `<button class="furniture-row" data-select="${esc(item.id)}" aria-pressed="${item.id === selectedId}"><span style="background:${palette[item.zone]}"${issueMap.get(item.id)?.length ? ' class="issue-dot"' : ''}></span><span>${esc(item.name)}${item.locked ? ' · locked' : ''}</span><small>${round(item.rotation)}°</small></button>`).join('') : '<div class="no-results">No matching furniture.</div>';
    $('fit-summary-label').textContent = issues.length ? `⚠ ${issues.length} footprint checks to resolve` : '✓ No footprint overlaps';
    $('fit-list').innerHTML = '<div class="size-note">Approximate plan footprints only. Door arcs follow the starting model; confirm on site.</div>' + issues.map((issue) => `<button class="fit-link" data-select="${esc(issue.ids[0])}">${esc(issue.message)}</button>`).join('');
    if (focusedRow) $('furniture-list').querySelector(`[data-select="${CSS.escape(focusedRow)}"]`)?.focus({preventScroll:true});
  }
  function updateLayoutOptions() {
    $('layout-select').innerHTML = state.layouts.map((layout) => `<option value="${esc(layout.id)}">${esc(layout.name)}</option>`).join('');
    $('layout-select').value = state.activeId;
  }
  function render() {
    checkFit(); draw(); updateInspector(); updateList();
    $('undo').disabled = !history().undo.length;
    $('redo').disabled = !history().redo.length;
  }
  function fitView(nextView = view) {
    view = nextView;
    if (view === 'main') camera = {x:-26,z:-24,w:245,h:312};
    else if (view === 'booth') camera = {x:45,z:241,w:163,h:174};
    else {
      const b = G.bounds(active().items);
      const x = Math.min(-26,b?.minX ?? -26), z = Math.min(-24,b?.minZ ?? -24);
      const maxX = Math.max(204,b?.maxX ?? 204), maxZ = Math.max(400,b?.maxZ ?? 400);
      camera = {x:x-10,z:z-10,w:maxX-x+20,h:maxZ-z+20};
    }
    document.querySelectorAll('[data-view]').forEach((button) => button.setAttribute('aria-pressed',button.dataset.view === view));
    draw();
  }
  async function setDisplayMode(mode) {
    mode = mode === '2d' ? '2d' : mode === 'photo' ? 'photo' : 'render';
    displayMode = mode;
    document.body.dataset.display=mode;
    document.querySelectorAll('[data-mode]').forEach((button) => button.setAttribute('aria-pressed',button.dataset.mode===mode));
    svg.toggleAttribute('hidden',mode!=='2d');
    $('room-render').hidden=mode==='2d';
    $('photo-panel').hidden=mode!=='photo';
    document.querySelector('.render-toolbar').hidden=mode!=='render';
    document.querySelector('.photo-toolbar').hidden=mode!=='photo';
    $('show-fit').disabled=mode!=='2d';
    $('snap').disabled=mode!=='2d';
    window.history.replaceState(null,'',location.pathname+location.search+(mode==='2d'?'':'#'+mode));
    finishedRenderer?.setActive(mode==='render');
    if(mode==='render')void finishedRenderer?.refresh().catch(()=>{});
    if(mode==='photo')roomPhoto?.show();
    draw();
  }
  function world(clientX, clientY) {
    const point = new DOMPoint(clientX, clientY);
    const p = point.matrixTransform(svg.getScreenCTM().inverse());
    return {x:p.x,z:p.y};
  }
  function zoom(factor, clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const cx = clientX ?? rect.x + rect.width/2, cy = clientY ?? rect.y + rect.height/2;
    const anchor = world(cx,cy);
    const targetHeight = clamp(camera.h/factor,60,5000);
    const actual = targetHeight/camera.h;
    camera.w *= actual; camera.h = targetHeight;
    svg.setAttribute('viewBox',`${camera.x} ${camera.z} ${camera.w} ${camera.h}`);
    const after = world(cx,cy);
    camera.x += anchor.x-after.x; camera.z += anchor.z-after.z;
    draw();
  }
  function select(itemId, reveal = false) {
    finishGesture();
    selectedId = itemId;
    const item = selected();
    if (item && reveal) {
      if (item.x < camera.x || item.x > camera.x + camera.w || item.z < camera.z || item.z > camera.z + camera.h) {
        if (G.pointInPolygon([item.x,item.z], rooms[1])) fitView('booth');
        else if (G.pointInPolygon([item.x,item.z],rooms[0])) fitView('main');
        else { camera.x = item.x-camera.w/2; camera.z = item.z-camera.h/2; }
      }
    }
    render();
  }
  function editable() {
    const item = selected();
    if (!item) return false;
    if (item.locked) { toast('Unlock this piece to move or rotate it.'); return false; }
    return true;
  }
  function turn(degrees) {
    if (editable()) mutate(() => selected().rotation = round(G.normalizeAngle(selected().rotation+degrees)));
  }
  function duplicate() {
    if (!selected()) return;
    if (active().items.length >= 100) return toast('This layout already has 100 pieces.');
    mutate(() => {
      const item = {...clone(selected()), id:id(), name:(selected().name + ' copy').slice(0,60), x:clamp(selected().x+8,-2000,2000), z:clamp(selected().z+8,-2000,2000), locked:false};
      active().items.push(item); selectedId = item.id;
    });
  }
  function remove() {
    if (editable()) mutate(() => { active().items = active().items.filter((item) => item.id !== selectedId); selectedId = null; });
  }
  function finishGesture(cancel = false) {
    if (gesture?.before) {
      if (cancel) active().items = gesture.before;
      if (cancel || !record(gesture.before)) persist();
    }
    gesture = null;
    svg.classList.remove('panning');
  }
  const snap = (n) => round(clamp(state.snap ? Math.round(n/state.snap)*state.snap : n,-2000,2000));
  function pinchInfo() {
    const [a,b] = [...pointers.values()];
    return {distance:Math.hypot(a.x-b.x,a.y-b.y), x:(a.x+b.x)/2, y:(a.y+b.y)/2};
  }
  svg.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    svg.focus({preventScroll:true});
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    try { svg.setPointerCapture(event.pointerId); } catch (_) { /* Synthetic input has no native pointer capture. */ }
    if (pointers.size === 2) {
      finishGesture();
      gesture = {type:'pinch', ...pinchInfo()};
      return;
    }
    if (pointers.size > 2) return;
    const point = world(event.clientX,event.clientY);
    const rotate = event.target.closest('[data-rotate]');
    const piece = event.target.closest('[data-piece]');
    if (rotate && selected() && !selected().locked) {
      const item = selected();
      gesture = {type:'rotate', pointerId:event.pointerId, before:clone(active().items), angle:Math.atan2(point.z-item.z,point.x-item.x), rotation:item.rotation};
    } else if (piece) {
      selectedId = piece.dataset.piece;
      const item = selected();
      if (!item.locked) gesture = {type:'move', pointerId:event.pointerId, before:clone(active().items), start:point, x:item.x,z:item.z};
      else toast('This piece is locked. Uncheck “Lock in place” to edit.');
      render();
    } else {
      gesture = {type:'pan',pointerId:event.pointerId,x:event.clientX,y:event.clientY};
      svg.classList.add('panning');
    }
  });
  svg.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (!gesture) return;
    if (gesture.type === 'pinch' && pointers.size >= 2) {
      const info = pinchInfo();
      const scale = unitsPerPixel();
      camera.x -= (info.x-gesture.x)*scale; camera.z -= (info.y-gesture.y)*scale;
      if (gesture.distance > 1 && info.distance > 1) zoom(info.distance/gesture.distance,info.x,info.y);
      gesture = {type:'pinch',...info}; draw(); return;
    }
    if (gesture.pointerId !== event.pointerId) return;
    if (gesture.type === 'pan') {
      const scale = unitsPerPixel();
      camera.x -= (event.clientX-gesture.x)*scale; camera.z -= (event.clientY-gesture.y)*scale;
      gesture.x = event.clientX; gesture.y = event.clientY; draw(); return;
    }
    const item = selected();
    const point = world(event.clientX,event.clientY);
    if (gesture.type === 'move') {
      // Preserve the grabbed point rather than jumping the furniture center to the cursor.
      item.x = snap(gesture.x + point.x-gesture.start.x);
      item.z = snap(gesture.z + point.z-gesture.start.z);
    } else if (gesture.type === 'rotate') {
      let angle = gesture.rotation + (Math.atan2(point.z-item.z,point.x-item.x)-gesture.angle)*180/Math.PI;
      if (event.shiftKey) angle = Math.round(angle/15)*15;
      item.rotation = round(G.normalizeAngle(angle));
    }
    checkFit(); draw(); updateInspector();
    $('save-status').textContent = 'Editing…';
  });
  const pointerEnd = (event) => {
    pointers.delete(event.pointerId);
    if (gesture?.type === 'pinch') { if (pointers.size < 2) finishGesture(); }
    else if (gesture?.pointerId === event.pointerId) finishGesture(event.type === 'pointercancel');
    render();
  };
  svg.addEventListener('pointerup', pointerEnd);
  svg.addEventListener('pointercancel', pointerEnd);
  svg.addEventListener('lostpointercapture', (event) => { if (pointers.has(event.pointerId)) pointerEnd(event); });
  svg.addEventListener('wheel', (event) => { event.preventDefault(); zoom(Math.exp(-event.deltaY*.002),event.clientX,event.clientY); },{passive:false});
  svg.addEventListener('click', (event) => {
    // Keyboard activation has no pointer gesture.
    if (event.detail === 0 && event.target.closest('[data-piece]')) select(event.target.closest('[data-piece]').dataset.piece);
  });
  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input,textarea,select,[contenteditable="true"]') || document.querySelector('dialog[open]')) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(event.shiftKey); return; }
    if (event.key === 'Escape') { finishGesture(true); pointers.clear(); selectedId = null; render(); return; }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-piece]')) { event.preventDefault(); select(event.target.closest('[data-piece]').dataset.piece); return; }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-rotate]')) { event.preventDefault(); turn(15); return; }
    const movement = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]}[event.key];
    if (movement && selected() && event.target.closest('#plan')) {
      event.preventDefault();
      if (editable()) mutate(() => { selected().x = round(clamp(selected().x+movement[0]*(event.shiftKey ? 6 : 1),-2000,2000)); selected().z = round(clamp(selected().z+movement[1]*(event.shiftKey ? 6 : 1),-2000,2000)); });
    } else if (event.key.toLowerCase() === 'r' && !event.metaKey && !event.ctrlKey && event.target.closest('#plan')) { event.preventDefault(); turn(event.shiftKey ? -15 : 15); }
    else if ((event.key === 'Delete' || event.key === 'Backspace') && document.activeElement.closest('#plan')) { event.preventDefault(); remove(); }
  });

  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => fitView(button.dataset.view)));
  document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => setDisplayMode(button.dataset.mode)));
  document.querySelectorAll('[data-turn]').forEach((button) => button.addEventListener('click', () => turn(Number(button.dataset.turn))));
  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } }));
  document.addEventListener('click', (event) => { if (!event.target.closest('.file-menu')) document.querySelector('.file-menu').open = false; });
  $('undo').addEventListener('click', () => undo());
  $('redo').addEventListener('click', () => undo(true));
  $('zoom-in').addEventListener('click', () => zoom(1.25));
  $('zoom-out').addEventListener('click', () => zoom(.8));
  $('fit-view').addEventListener('click', () => fitView());
  $('snap').value = state.snap;
  $('snap').addEventListener('change', () => { state.snap = Number($('snap').value); persist(); });
  $('show-fit').checked = state.showFit;
  $('show-fit').addEventListener('change', () => { state.showFit = $('show-fit').checked; persist(); draw(); });
  $('furniture-search').addEventListener('input', updateList);
  for (const target of ['furniture-list','fit-list']) $(target).addEventListener('click', (event) => { const button = event.target.closest('[data-select]'); if (button) select(button.dataset.select,true); });
  $('duplicate-piece').addEventListener('click',duplicate);
  $('remove-piece').addEventListener('click',remove);
  $('piece-locked').addEventListener('change', () => { if (selected()) mutate(() => selected().locked = $('piece-locked').checked); });
  $('restore-source-size').addEventListener('click', () => {
    if (!editable()) return;
    const record=C.records[selected().catalogId];
    if (record) mutate(() => { selected().w=record.w; selected().d=record.d; });
  });

  const numericFields = {'angle':{key:'rotation',min:-36000,max:36000}, 'pos-x':{key:'x',min:-2000,max:2000}, 'pos-z':{key:'z',min:-2000,max:2000}, 'piece-width':{key:'w',min:2,max:300}, 'piece-depth':{key:'d',min:2,max:300}};
  Object.entries(numericFields).forEach(([field, config]) => {
    $(field).addEventListener('change', () => {
      if (!editable()) return;
      const value = $(field).value.trim() === '' ? NaN : Number($(field).value);
      if (!Number.isFinite(value) || value < config.min || value > config.max) {
        toast(`Enter a number from ${config.min} to ${config.max}.`);
        $(field).value = round(selected()[config.key]); return;
      }
      mutate(() => selected()[config.key] = ['w','d'].includes(config.key) ? Number(value.toFixed(4)) : round(config.key === 'rotation' ? G.normalizeAngle(value) : value));
      $(field).value = selected()[config.key];
    });
  });
  $('piece-name').addEventListener('change', () => { if (editable()) mutate(() => selected().name = $('piece-name').value.trim().slice(0,60) || 'Furniture'); });
  $('angle-slider').addEventListener('input', () => {
    if (!editable()) return;
    if (!sliderBefore) sliderBefore = clone(active().items);
    selected().rotation = Number($('angle-slider').value);
    checkFit(); draw(); updateInspector();
  });
  $('angle-slider').addEventListener('change', () => { if (sliderBefore) { record(sliderBefore); sliderBefore = null; render(); } });

  $('layout-select').addEventListener('change', () => {
    finishGesture(); state.activeId = $('layout-select').value; selectedId = null; persist(); render();
  });
  function nameDialog(mode) {
    if (mode === 'copy' && state.layouts.length >= 30) return toast('This browser holds 30 layouts. Export your backup before starting another collection.');
    nameMode = mode;
    $('name-title').textContent = mode === 'copy' ? 'Save another layout' : 'Rename this layout';
    $('layout-name').value = mode === 'copy' ? (active().name+' copy').slice(0,60) : active().name;
    $('name-dialog').showModal(); $('layout-name').select();
    document.querySelector('.file-menu').open = false;
  }
  $('save-copy').addEventListener('click', () => nameDialog('copy'));
  $('rename-layout').addEventListener('click', () => nameDialog('rename'));
  $('name-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('layout-name').value.trim();
    if (!name) return;
    if (nameMode === 'copy') {
      const source = active();
      const layout = {...clone(source), id:id(),name:name.slice(0,60)};
      if (source.id === budgetPreset.id || source.sourcePresetId === budgetPreset.id) layout.sourcePresetId = budgetPreset.id;
      state.layouts.push(layout); state.activeId = layout.id;
    } else active().name = name.slice(0,60);
    $('name-dialog').close(); persist(); updateLayoutOptions(); render();
    toast(nameMode === 'copy' ? 'Separate layout saved. Your previous version is still in the menu.' : 'Layout renamed.');
  });
  $('add-piece').addEventListener('click', () => {
    if (active().items.length >= 100) return toast('This layout already has 100 pieces.');
    $('add-dialog').showModal(); $('new-name').select();
  });
  $('add-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const w = Number($('new-width').value), d = Number($('new-depth').value), name = $('new-name').value.trim();
    if (!name || !Number.isFinite(w) || !Number.isFinite(d) || w < 2 || w > 300 || d < 2 || d > 300) return;
    const position = view === 'booth' ? {x:125,z:320} : {x:80,z:160};
    mutate(() => { const item = decorate({id:id(),name:name.slice(0,60),...position,w,d,rotation:0,shape:$('new-shape').value,zone:'custom',visible:true,locked:false}); active().items.push(item); selectedId = item.id; });
    $('add-dialog').close(); select(selectedId,true); toast('Piece added. Drag it into place.');
  });
  $('reset-layout').addEventListener('click', () => { $('reset-message').textContent = `Restore the starting furniture in “${active().name}”? Other saved layouts stay as they are. You can undo this reset.`; $('reset-dialog').showModal(); document.querySelector('.file-menu').open = false; });
  $('confirm-reset').addEventListener('click', () => { mutate(() => {
    const layout = active();
    const isBudget = layout.id === budgetPreset.id || layout.sourcePresetId === budgetPreset.id;
    layout.items = validatedItems(isBudget ? budgetPreset.build(clone(startingItems)) : clone(startingItems));
    selectedId = 'SEAT-01';
  }); $('reset-dialog').close(); fitView('main'); toast('Starting furniture restored. Undo is available.'); });
  $('image-reference-layout').addEventListener('click', () => {
    if (state.layouts.length >= 30) return toast('There are already 30 layouts. Export a backup before removing one.');
    const layout = freshLayout(window.ReferenceLayout.affordable.name);
    layout.items = validatedItems(window.ReferenceLayout.affordable.build(clone(startingItems)));
    state.layouts.push(layout); state.activeId = layout.id; selectedId = 'SEAT-01';
    persist(); updateLayoutOptions(); render(); fitView('main');
    document.querySelector('.file-menu').open = false;
    toast('Selected products added at their published sizes. Your previous layouts are still in the menu.');
  });

  const stamp = () => new Date().toISOString().replace(/[:.]/g,'-');
  const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50) || 'layout';
  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  $('export-backup').addEventListener('click', () => {
    download(new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),`rehearsal-layouts-v1-${stamp()}.json`);
    document.querySelector('.file-menu').open = false; toast('Editable backup downloaded. It contains all your layouts.');
  });
  $('import-backup').addEventListener('click', () => { $('backup-file').value = ''; $('backup-file').click(); document.querySelector('.file-menu').open = false; });
  $('backup-file').addEventListener('change', async () => {
    const file = $('backup-file').files[0];
    if (!file) return;
    try {
      if (file.size > 2*1024*1024) throw new Error('Choose a backup smaller than 2 MB.');
      const raw = await file.text();
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch (_) { throw new Error('This backup is not valid JSON. Choose an exported room-layout backup.'); }
      const imported = validatedState(parsed);
      if (state.layouts.length + imported.layouts.length > 30) throw new Error('Import would exceed 30 layouts. Your existing layouts are unchanged.');
      const added = imported.layouts.map((layout) => ({...layout,id:id(),name:(layout.name+' · imported').slice(0,60)}));
      state.layouts.push(...added); state.activeId = added[0].id; selectedId = null;
      persist(); updateLayoutOptions(); render(); fitView('all'); toast(`${added.length} layout${added.length === 1 ? '' : 's'} imported. Existing layouts were kept.`);
    } catch (error) { toast('Import stopped: ' + (error instanceof SyntaxError ? 'The file is not valid JSON.' : error.message)); }
  });
  async function capturePlan(exportLayout) {
      const b = G.bounds(exportLayout.items);
      const minX = Math.min(-26,b?.minX ?? -26), maxX = Math.max(210,b?.maxX ?? 210);
      const minZ = Math.min(-26,b?.minZ ?? -26), maxZ = Math.max(404,b?.maxZ ?? 404);
      const width = maxX-minX+24, height = maxZ-minZ+70;
      const titleSize = Math.min(9,(width-24)/(exportLayout.name.length*.62));
      const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(width*5)}" height="${Math.round(height*5)}" viewBox="${minX-12} ${minZ-42} ${width} ${height}"><rect x="${minX-12}" y="${minZ-42}" width="${width}" height="${height}" fill="#f4f7fb"/>${svg.querySelector('defs').outerHTML}<text x="${minX}" y="${minZ-21}" font-family="Arial,sans-serif" font-weight="bold" font-size="${titleSize}" fill="#172534">${esc(exportLayout.name)}</text><text x="${minX}" y="${minZ-10}" font-family="Arial,sans-serif" font-size="4.4" fill="#526474">REHEARSAL ROOM 2 · ${new Date().toISOString().slice(0,10)}</text>${roomMarkup()}${exportLayout.items.map((item) => pieceMarkup(item,true)).join('')}<text x="${minX}" y="${maxZ+13}" font-family="Arial,sans-serif" font-size="4.2" fill="#526474">Planning footprints only · room geometry + furniture sizes need field verification.</text></svg>`;
      const url = URL.createObjectURL(new Blob([source],{type:'image/svg+xml'}));
      try {
        const picture = new Image(); picture.src = url; await picture.decode();
        const canvas = document.createElement('canvas');
        const scale = Math.min(6,3000/Math.max(width,height));
        canvas.width = Math.ceil(width*scale); canvas.height = Math.ceil(height*scale);
        canvas.getContext('2d').drawImage(picture,0,0,canvas.width,canvas.height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve,'image/png'));
        if (!blob) throw new Error('Image encoding failed');
        return blob;
      } finally { URL.revokeObjectURL(url); }
  }
  $('export-picture').addEventListener('click', async () => {
    const button = $('export-picture'); button.disabled = true; button.textContent = 'Saving…';
    const exportLayout = clone(active());
    try {
      if(displayMode==='photo') {
        if($('photo-download').hidden)throw new Error('Update the room photo before downloading it.');
        $('photo-download').click();
        return;
      }
      const picture=displayMode==='render' ? await finishedRenderer.picture() : await capturePlan(exportLayout);
      download(picture,`${slug(exportLayout.name)}-${displayMode==='render'?'room-':''}v1-${stamp()}.png`);
      toast('Room picture downloaded. Your editable layout is still saved here.');
    } catch (error) { toast(error.message || 'Picture export failed. Your layout is safe; use Export editable backup.'); }
    finally { button.disabled = false; button.textContent = 'Save picture ↓'; }
  });
  window.addEventListener('beforeunload', () => { finishGesture(); if (sliderBefore) { record(sliderBefore); sliderBefore = null; } });
  new ResizeObserver(() => draw()).observe(svg);
  window.addEventListener('storage', (event) => {
    if (event.key === storeKey && event.newValue !== lastStoredRaw) $('save-status').textContent = 'Another tab saved changes; your next edit keeps both versions.';
  });
  finishedRenderer=window.RoomRender.create($('room-render'),{getLayout:()=>clone(active()),capturePlan,onStatus:toast});
  fetch('initial-photo.json').then(response=>response.ok?response.json():null).catch(()=>null).then(seedJob=>{
    roomPhoto=window.RoomPhoto.create({getLayout:()=>clone(active()),captureRoom:()=>finishedRenderer.picture({photo:true}),onStatus:toast,seedJob});
    if(displayMode==='photo')roomPhoto.show();
  });
  updateLayoutOptions(); render();
  if (!loadedFromStorage) persist();
  if (recoveryMessage) toast(recoveryMessage);
  if (['#3d','#render','#photo'].includes(location.hash)) setDisplayMode(location.hash.slice(1));
})();
