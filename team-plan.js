(() => {
  "use strict";

  const modes = {
    lounge: {
      src: "assets/room-meeting-lounge-v1.2.webp",
      alt: "Primary dark lounge design option with the sofa, two chairs and coffee table arranged in the middle, retained instruments, clear storage access, mirror arches, and fixtures on the existing overhead rails",
      caption: "Dark lounge · primary mode. Central sofa, chairs and coffee table stay in the room. Cabinet versus closet remains undecided."
    },
    rehearsal: {
      src: "assets/room-meeting-rehearsal-v1.2.webp",
      alt: "The same room and central sofa, two chairs and coffee table in optional bright rehearsal lighting, with retained instruments, clear storage access, mirror arches, and fixtures on the existing overhead rails",
      caption: "Bright rehearsal · optional lighting-only change. Central furniture stays in place; cabinet versus closet remains undecided."
    }
  };

  const image = document.querySelector("#room-image");
  const caption = document.querySelector("#room-caption");
  const error = document.querySelector("#image-error");
  const retry = document.querySelector("#retry-image");
  const buttons = [...document.querySelectorAll("[data-lighting]")];
  const printButton = document.querySelector("#print-plan");
  const status = document.querySelector("#action-status");

  let currentMode = "lounge";

  function modeFromUrl() {
    const value = new URL(window.location.href).searchParams.get("lighting");
    return Object.hasOwn(modes, value) ? value : "lounge";
  }

  function setUrlMode(mode, replace = false) {
    const url = new URL(window.location.href);
    url.searchParams.set("lighting", mode);
    try {
      window.history[replace ? "replaceState" : "pushState"]({ lighting: mode }, "", url);
    } catch (_) {
      // Local file previews can block History API updates. The served page keeps query state.
    }
  }

  function setMode(mode, { updateUrl = false, replaceUrl = false, retryToken = "" } = {}) {
    currentMode = Object.hasOwn(modes, mode) ? mode : "lounge";
    const next = modes[currentMode];

    error.hidden = true;
    image.hidden = false;
    image.alt = next.alt;
    image.src = retryToken ? `${next.src}?retry=${encodeURIComponent(retryToken)}` : next.src;
    caption.textContent = next.caption;

    buttons.forEach((button) => {
      const active = button.dataset.lighting === currentMode;
      button.setAttribute("aria-pressed", String(active));
    });

    if (updateUrl) setUrlMode(currentMode, replaceUrl);
    document.title = `$25,000. ${currentMode === "lounge" ? "Dark lounge first" : "Bright rehearsal"}. · Team plan`;
    status.textContent = `${currentMode === "lounge" ? "Dark lounge, primary" : "Bright rehearsal, optional"} view selected.`;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.lighting, { updateUrl: true });
    });
  });

  image.addEventListener("load", () => {
    error.hidden = true;
    image.hidden = false;
    status.textContent = `${currentMode === "lounge" ? "Dark lounge, primary" : "Bright rehearsal, optional"} image loaded.`;
    const otherMode = currentMode === "lounge" ? "rehearsal" : "lounge";
    const preload = new Image();
    preload.src = modes[otherMode].src;
  });

  image.addEventListener("error", () => {
    image.hidden = true;
    error.hidden = false;
    status.textContent = "Room image could not be loaded. PNG downloads remain available below the image.";
  });

  retry.addEventListener("click", () => {
    setMode(currentMode, { retryToken: Date.now().toString() });
    status.textContent = "Retrying room image…";
  });

  window.addEventListener("popstate", () => {
    setMode(modeFromUrl());
  });

  printButton.addEventListener("click", () => {
    status.textContent = "Opening the system print dialog…";
    window.print();
  });

  window.addEventListener("afterprint", () => {
    status.textContent = "Print preview closed. Team plan ready.";
  });

  const initialMode = modeFromUrl();
  setMode(initialMode, { updateUrl: true, replaceUrl: true });
})();
