(function attachStaticRoomPhoto(root) {
  'use strict';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const signature = (layout) => JSON.stringify([layout.id,[...layout.items].sort((a,b) => a.id.localeCompare(b.id)).map((item) =>
    [item.id,item.name,item.x,item.z,item.w,item.d,item.rotation,item.profile ?? null,item.catalogId ?? null,item.visible !== false])]);

  root.RoomPhoto = {create(options) {
    const image = document.getElementById('photo-image');
    const status = document.getElementById('photo-status');
    const generate = document.getElementById('photo-generate');
    const download = document.getElementById('photo-download');
    const reference = document.getElementById('photo-reference');
    const seed = options.seedJob?.imageUrl && options.seedJob?.layout?.id ? {
      ...clone(options.seedJob),
      layoutId:String(options.seedJob.layoutId || options.seedJob.layout.id),
      layoutName:String(options.seedJob.layoutName || options.seedJob.layout.name || 'Reviewed layout')
    } : null;
    let layout = clone(options.getLayout());
    let showingReference = false;

    function matchesSeed() {
      try { return seed && layout.id === seed.layoutId && signature(seed.layout) === signature(layout); }
      catch (_) { return false; }
    }
    function setStatus(message,state) {
      status.textContent = message;
      status.dataset.state = state;
    }
    function render() {
      const current = matchesSeed();
      image.dataset.current = String(current);
      image.dataset.layoutId = seed?.layoutId || '';
      if (showingReference || !seed) {
        image.src = 'assets/approved-concept.png';
        image.alt = 'Original approved AI room reference';
        download.href = image.src;
        download.download = 'original-approved-room.png';
        download.hidden = false;
        setStatus('Original approved room reference','reference');
      } else {
        image.src = seed.imageUrl;
        image.alt = `Saved finished room image for ${seed.layoutName}`;
        download.href = seed.imageUrl;
        download.download = 'rehearsal-room-finished-image-v1.5.png';
        download.hidden = false;
        if (current) setStatus('Saved finished image · matching saved layout','current');
        else if (layout.id === seed.layoutId) setStatus('Saved finished image · layout changed in this browser','stale');
        else setStatus(`Saved finished image · ${seed.layoutName}`,'reference');
      }
      reference?.setAttribute('aria-pressed',String(showingReference));
    }
    function update(next=options.getLayout()) {
      layout = clone(next);
      showingReference = false;
      render();
    }
    function show() { update(options.getLayout()); }
    function explainStaticPhoto() {
      setStatus('Saved finished image included · new photo requests stay with Greg','reference');
      options.onStatus?.('The shared copy includes the saved finished image. New photo requests stay with Greg.');
    }

    generate.hidden = true;
    generate.disabled = true;
    generate.setAttribute('aria-hidden','true');
    if (reference) reference.addEventListener('click',() => { showingReference = !showingReference; render(); });
    render();
    return {update,show,generate:explainStaticPhoto,matchesCurrent:matchesSeed};
  }};
})(window);
