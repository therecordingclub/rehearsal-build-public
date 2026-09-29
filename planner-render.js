(function (root) {
  'use strict';
  const signature = (layout) => JSON.stringify([layout.id,layout.name,layout.items.map((p) => [p.id,p.name,p.x,p.z,p.w,p.d,p.rotation,p.profile,p.catalogId,p.visible])]);
  root.RoomRender = {create(container, options) {
    const frame = container.querySelector('iframe');
    const status = document.getElementById('render-status');
    const loading = document.getElementById('room-loading');
    let started = false, ready = false, layout = options.getLayout();
    let lastSignature = '', revision = 0, applied = '', readinessTimer;
    const captures = new Map(), waiters = new Set();
    function setStatus(message, state = 'working') {
      status.textContent = message;
      status.dataset.state = state;
    }
    function send() {
      if (!ready) return;
      frame.contentWindow.postMessage({type:'trc-layout-update',layout,revision:String(revision)},location.origin);
    }
    function update(next = options.getLayout()) {
      layout = next;
      const nextSignature = signature(next);
      if (nextSignature === lastSignature) return;
      lastSignature = nextSignature; revision += 1;
      container.dataset.current = 'false';
      setStatus(ready ? `Updating ${layout.name}…` : 'Opening full room…');
      send();
    }
    function refresh() {
      update();
      if (started) return;
      started = true;
      frame.src = 'full-room.html?embedded=1';
      readinessTimer = setTimeout(() => {
        if (!ready) {
          loading.textContent = 'The full room is still loading. Your layout is saved.';
          setStatus('Still loading the room…', 'waiting');
        }
      },20000);
    }
    window.addEventListener('message', (event) => {
      if (event.source !== frame.contentWindow || event.origin !== location.origin || !event.data || typeof event.data !== 'object') return;
      const data = event.data;
      if (data.type === 'trc-room-ready') {
        ready = true; clearTimeout(readinessTimer); send();
      } else if (data.type === 'trc-layout-applied' && data.revision === String(revision) && data.layoutId === layout.id) {
        applied = data.revision;
        loading.hidden = true;
        container.dataset.current = 'true';
        container.dataset.layout = layout.name;
        container.dataset.revision = applied;
        container.dataset.poses = JSON.stringify(data.items || []);
        setStatus(`${layout.name} · live furniture positions`, 'current');
        for (const resolve of waiters) resolve();
        waiters.clear();
      } else if (data.type === 'trc-room-error') {
        loading.hidden = false;
        loading.textContent = data.error || 'The full room could not open. Your plan is saved.';
        setStatus('Room could not open', 'error');
      } else if (data.type === 'trc-room-capture-result' && captures.has(data.requestId)) {
        const request = captures.get(data.requestId);
        captures.delete(data.requestId);
        clearTimeout(request.timer);
        if (data.error) request.reject(new Error(data.error));
        else if (typeof data.dataUrl === 'string' && data.dataUrl.startsWith('data:image/png;base64,')) fetch(data.dataUrl).then((response) => response.blob()).then(request.resolve,request.reject);
        else request.reject(new Error('The room picture could not be saved.'));
      }
    });
    async function picture(captureOptions = {}) {
      refresh();
      if (applied !== String(revision)) await new Promise((resolve,reject) => {
        const done = () => { clearTimeout(timer); resolve(); };
        const timer = setTimeout(() => { waiters.delete(done); reject(new Error('Wait for the full room to load before saving a picture.')); },20000);
        waiters.add(done);
      });
      return new Promise((resolve,reject) => {
        const requestId = crypto.randomUUID();
        const timer = setTimeout(() => { captures.delete(requestId); reject(new Error('Picture export timed out. Your layout is saved.')); },15000);
        captures.set(requestId,{resolve,reject,timer});
        frame.contentWindow.postMessage({type:'trc-room-capture',requestId,
          ...(captureOptions.photo === true ? {photo:true} : {})},location.origin);
      });
    }
    document.getElementById('room-fullscreen').addEventListener('click', () => {
      const request = container.requestFullscreen?.();
      request?.catch(() => options.onStatus('Full screen is unavailable in this browser.'));
    });
    document.getElementById('compare-image').addEventListener('click', (event) => {
      const comparison = document.getElementById('reference-comparison');
      comparison.hidden = !comparison.hidden;
      container.classList.toggle('comparing',!comparison.hidden);
      event.currentTarget.setAttribute('aria-pressed',String(!comparison.hidden));
    });
    update(layout);
    return {update,refresh,picture};
  }};
})(window);
