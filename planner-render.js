(function (root) {
  'use strict';
  const signature = (layout) => JSON.stringify([layout.id,layout.name,layout.items.map((p) => [p.id,p.name,p.x,p.z,p.w,p.d,p.rotation,p.profile,p.catalogId,p.visible])]);
  const withTimeout = (promise, milliseconds, message) => new Promise((resolve,reject) => {
    const timer = setTimeout(() => reject(new Error(message)),milliseconds);
    Promise.resolve(promise).then((value) => {clearTimeout(timer);resolve(value);},(error) => {clearTimeout(timer);reject(error);});
  });

  root.RoomRender = {create(container, options) {
    const host = container.querySelector('#full-room');
    const status = document.getElementById('render-status');
    const loading = document.getElementById('room-loading');
    const loadingMessage = document.getElementById('room-loading-message');
    const retry = document.getElementById('room-retry');
    const loadScene = options.loadScene || ((attempt) => import(`./full-room-scene.js?v=1.8${attempt > 1 ? '&retry='+attempt : ''}`));
    let scene = null, mount = null, applying = null, captureQueue = Promise.resolve();
    let layout = options.getLayout(), lastSignature = '', revision = 0, applied = 0;
    let active = false, disposed = false, attempts = 0, readinessTimer = null;

    function setStatus(message, state = 'working') {
      status.textContent = message;
      status.dataset.state = state;
    }
    function showError(error) {
      if (disposed) return;
      loading.hidden = false;
      loadingMessage.textContent = 'The room view stopped. Try 3D again; your layout is saved.';
      retry.hidden = false;
      container.dataset.current = 'false';
      setStatus('Room could not open', 'error');
    }
    function sceneError(error) {
      const failed = scene;
      scene = null;
      applied = 0;
      failed?.dispose();
      showError(error);
    }
    function applyLatest() {
      if (!scene || disposed) return Promise.resolve();
      if (applying) return applying;
      applying = (async () => {
        while (!disposed && applied !== revision) {
          const nextRevision = revision, nextLayout = layout;
          const poses = await scene.applyLayout(nextLayout);
          if (disposed || nextRevision !== revision) continue;
          applied = nextRevision;
          loading.hidden = true;
          retry.hidden = true;
          container.dataset.current = 'true';
          container.dataset.layout = nextLayout.name;
          container.dataset.revision = String(applied);
          container.dataset.poses = JSON.stringify(poses || []);
          setStatus(`${nextLayout.name} · live furniture positions`, 'current');
        }
      })().finally(() => {applying = null;});
      return applying;
    }
    function update(next = options.getLayout()) {
      layout = next;
      const nextSignature = signature(next);
      if (nextSignature === lastSignature) return;
      lastSignature = nextSignature;
      revision += 1;
      container.dataset.current = 'false';
      setStatus(scene ? `Updating ${layout.name}…` : 'Opening full room…');
      if (scene) void applyLatest().catch(showError);
    }
    function refresh() {
      if (disposed) return Promise.reject(new Error('The room view has closed.'));
      update();
      if (scene) return applyLatest();
      if (mount) return mount;
      attempts += 1;
      retry.hidden = true;
      loading.hidden = false;
      loadingMessage.textContent = 'Opening full room…';
      setStatus('Opening full room…');
      readinessTimer = setTimeout(() => {
        if (!scene && !disposed) {
          loadingMessage.textContent = 'The full room is still loading. Your layout is saved.';
          setStatus('Still loading the room…', 'waiting');
        }
      },20000);
      mount = Promise.resolve().then(() => loadScene(attempts)).then((module) => module.mountFullRoom(host,{embedded:true,onError:sceneError})).then(async (mounted) => {
        if (disposed) {mounted.dispose();return;}
        scene = mounted;
        scene.setActive(active);
        await applyLatest();
      }).catch((error) => {
        scene?.dispose();
        scene = null;
        applied = 0;
        showError(error);
        throw error;
      }).finally(() => {
        clearTimeout(readinessTimer);
        readinessTimer = null;
        mount = null;
      });
      // Mode changes can start a view without awaiting it; errors remain visible in the view.
      void mount.catch(() => {});
      return mount;
    }
    function setActive(next) {
      active = Boolean(next);
      scene?.setActive(active);
      if (active) scene?.resize();
    }
    function picture(captureOptions = {}) {
      const task = captureQueue.catch(() => {}).then(async () => {
        await withTimeout(refresh(),45000,'Wait for the full room to load before saving a picture.');
        if (disposed || !scene) throw new Error('The room view has closed.');
        await applyLatest();
        const dataUrl = await withTimeout(scene.captureDataURL({photo:captureOptions.photo === true}),15000,'Picture export timed out. Your layout is saved.');
        if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) throw new Error('The room picture could not be saved.');
        const response = await fetch(dataUrl);
        return response.blob();
      });
      captureQueue = task;
      return task;
    }
    const comparisonButton = document.getElementById('compare-image');
    const fullscreenButton = document.getElementById('room-fullscreen');
    function compare() {
      const comparison = document.getElementById('reference-comparison');
      comparison.hidden = !comparison.hidden;
      container.classList.toggle('comparing',!comparison.hidden);
      comparisonButton.setAttribute('aria-pressed',String(!comparison.hidden));
      scene?.resize();
    }
    function fullscreen() {
      const request = container.requestFullscreen?.();
      request?.catch(() => options.onStatus('Full screen is unavailable in this browser.'));
    }
    function retryRoom() {void refresh().catch(() => {});}
    function dispose() {
      if (disposed) return;
      disposed = true;
      clearTimeout(readinessTimer);
      scene?.dispose();
      scene = null;
      retry.removeEventListener('click',retryRoom);
      comparisonButton.removeEventListener('click',compare);
      fullscreenButton.removeEventListener('click',fullscreen);
    }
    retry.addEventListener('click',retryRoom);
    comparisonButton.addEventListener('click',compare);
    fullscreenButton.addEventListener('click',fullscreen);
    update(layout);
    return {update,refresh,picture,setActive,dispose};
  }};
})(window);
