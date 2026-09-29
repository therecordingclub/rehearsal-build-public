(function sofaComparison() {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const FILTERS = new Set(["all", "under500", "deep", "dark", "sized"]);
  const CONDITIONAL_BASES = new Set(["seller-estimate", "model-match", "visual-estimate"]);
  const EVIDENCE_BASES = new Set(["listing", "seller-estimate", "model-match"]);
  const TABLE_PLAN = Object.freeze({ x: 87, z: 104, diameter: 30.7 });
  const data = window.SofaOptions;
  const dom = {
    optionCount: document.getElementById("option-count"),
    checkedAt: document.getElementById("checked-at"),
    dataVersion: document.getElementById("data-version"),
    rail: document.getElementById("option-rail"),
    filterButtons: [...document.querySelectorAll("[data-filter]")],
    visibleCount: document.getElementById("visible-count"),
    selectedName: document.getElementById("selected-name"),
    selectedStatus: document.getElementById("selected-status"),
    selectedPrice: document.getElementById("selected-price"),
    selectedSummary: document.getElementById("selected-summary"),
    selectedNotes: document.getElementById("selected-notes"),
    stageImage: document.getElementById("stage-image"),
    sourceImage: document.getElementById("source-image"),
    stageCaption: document.getElementById("stage-caption"),
    imageStamp: document.getElementById("image-stamp"),
    sourcePrice: document.getElementById("source-price"),
    sourceSize: document.getElementById("source-size"),
    sourceBasis: document.getElementById("source-basis"),
    sourceArea: document.getElementById("source-area"),
    sourceCondition: document.getElementById("source-condition"),
    sourceListed: document.getElementById("source-listed"),
    downloadImage: document.getElementById("download-image"),
    listingLink: document.getElementById("listing-link"),
    evidenceFootprint: document.getElementById("evidence-footprint"),
    evidenceTotal: document.getElementById("evidence-total"),
    evidenceCap: document.getElementById("evidence-cap"),
    evidenceStatus: document.getElementById("evidence-status"),
    priceBreakdown: document.getElementById("price-breakdown"),
    priceNote: document.getElementById("price-note"),
    sizeState: document.getElementById("size-state"),
    footprintTitle: document.getElementById("footprint-title"),
    footprintNote: document.getElementById("footprint-note"),
    sizeBreakdown: document.getElementById("size-breakdown"),
    dimensionLinks: document.getElementById("dimension-links"),
    dimensionConfidence: document.getElementById("dimension-confidence"),
    plan: document.getElementById("footprint-plan"),
    planLoading: document.getElementById("plan-loading"),
    fatalError: document.getElementById("fatal-error")
  };

  if (!data || !Array.isArray(data.options) || data.options.length === 0) {
    dom.fatalError.hidden = false;
    return;
  }

  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  const state = {
    selectedIndex: findInitialIndex(data.options),
    filter: filterFromUrl(),
    imageMode: "render",
    room: null,
    roomError: false
  };

  function finite(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function safeText(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function dimensionBasis(option) {
    const basis = safeText(option.dimensionBasis, "");
    if (["listing", "seller-estimate", "model-match", "visual-estimate", "unknown"].includes(basis)) return basis;
    if (!finite(option.w) || !finite(option.d)) return "unknown";
    return option.estimateOnly ? "visual-estimate" : "listing";
  }

  function hasDrawableFootprint(option) {
    return dimensionBasis(option) !== "unknown" && finite(option.w) && option.w > 0 && finite(option.d) && option.d > 0;
  }

  function isConditional(option) {
    return CONDITIONAL_BASES.has(dimensionBasis(option));
  }

  function hasSizeEvidence(option) {
    return EVIDENCE_BASES.has(dimensionBasis(option)) && finite(option.w) && finite(option.d);
  }

  function previewDimensions(option) {
    const preview = option.previewDimensions;
    return preview && typeof preview === "object" ? preview : null;
  }

  function dimensionsText(dimensions, includeUnknownHeight) {
    if (!dimensions || !finite(dimensions.w) || !finite(dimensions.d)) return "No actual dimensions";
    const height = finite(dimensions.h) ? ` × ${number.format(dimensions.h)} H` : includeUnknownHeight ? " × H unknown" : "";
    return `${number.format(dimensions.w)} W × ${number.format(dimensions.d)} D${height} in`;
  }

  function optionDimensionsText(option) {
    return dimensionsText({ w: option.w, d: option.d, h: option.h }, true);
  }

  function basisLabel(option) {
    const supplied = safeText(option.dimensionLabel, "");
    if (supplied) return supplied;
    return {
      "listing": "Listing dimensions",
      "seller-estimate": "Seller-estimated dimensions",
      "model-match": "Probable-model dimensions",
      "visual-estimate": "Photo-based estimate",
      "unknown": "No seller dimensions"
    }[dimensionBasis(option)];
  }

  function statusText(option) {
    const basis = dimensionBasis(option);
    if (basis === "listing") return finite(option.h) ? "✓ Listing dimensions" : "✓ Listing width + depth · height unknown";
    if (basis === "seller-estimate") return "! Seller-estimated dimensions";
    if (basis === "model-match") return "! Probable-model dimensions";
    if (basis === "visual-estimate") return "! Photo-based preview estimate";
    return "! No actual dimensions · style preview only";
  }

  function formatMoney(value) {
    return finite(value) ? money.format(value) : "Price pending";
  }

  function formatSignedMoney(value) {
    if (!finite(value)) return "Pending";
    if (Math.abs(value) < 0.005) return "$0.00";
    return `${value > 0 ? "+" : "−"}${money.format(Math.abs(value))}`;
  }

  function formatDate(value) {
    if (!value) return "Research date not recorded";
    const parsed = new Date(`${value}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return `Research checked ${value}`;
    return `Research checked ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(parsed)}`;
  }

  function capValue() {
    return finite(data.budgetCap) ? data.budgetCap : 25000;
  }

  function capStatus(value) {
    if (!finite(value)) return "Status pending";
    const difference = capValue() - value;
    return difference >= 0
      ? `✓ ${money.format(difference)} under ${money.format(capValue())} cap`
      : `! ${money.format(Math.abs(difference))} over ${money.format(capValue())} cap`;
  }

  function projectionAmount(projection) {
    if (finite(projection)) return projection;
    if (projection && finite(projection.allIn)) return projection.allIn;
    return null;
  }

  function assumptionItems(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (value && typeof value === "object") {
      return Object.entries(value).map(([key, item]) => `${key.replace(/([A-Z])/g, " $1").toLowerCase()}: ${item}`);
    }
    const text = safeText(value, "");
    return text ? text.split(/(?<=[.!?])\s+/).filter(Boolean) : [];
  }

  function setPriceNotes(value, fallback) {
    const items = assumptionItems(value);
    const notes = items.length ? items : [fallback];
    dom.priceNote.replaceChildren();
    notes.forEach((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      dom.priceNote.append(item);
    });
  }

  function slugFromHash() {
    try {
      return decodeURIComponent(window.location.hash.slice(1));
    } catch (_error) {
      return "";
    }
  }

  function filterFromUrl() {
    const value = new URLSearchParams(window.location.search).get("filter") || "all";
    return FILTERS.has(value) ? value : "all";
  }

  function findInitialIndex(options) {
    const slug = slugFromHash();
    const hashIndex = options.findIndex((option) => String(option.id) === slug);
    if (hashIndex >= 0) return hashIndex;
    const defaultIndex = options.findIndex((option) => String(option.id) === String(data.defaultOption || ""));
    return defaultIndex >= 0 ? defaultIndex : 0;
  }

  function urlForState() {
    const url = new URL(window.location.href);
    if (state.filter === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", state.filter);
    url.hash = encodeURIComponent(String(data.options[state.selectedIndex].id));
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function updateUrl(mode) {
    const method = mode === "replace" ? "replaceState" : "pushState";
    window.history[method]({ sofa: data.options[state.selectedIndex].id, filter: state.filter }, "", urlForState());
  }

  function setImage(img, source, alt) {
    img.classList.remove("image-error");
    img.alt = alt;
    img.onerror = function handleImageError() {
      img.classList.add("image-error");
    };
    if (source) img.src = source;
    else {
      img.removeAttribute("src");
      img.classList.add("image-error");
    }
  }

  function addDefinitionListRow(list, label, value, className) {
    const row = document.createElement("div");
    if (className) row.className = className;
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    row.append(dt, dd);
    list.append(row);
  }

  function setStatusClass(node, pending) {
    node.classList.toggle("status-pending", pending);
    node.classList.toggle("status-good", !pending);
  }

  function filterMatches(option, filter) {
    if (filter === "under500") return finite(option.price) && option.price < 500;
    if (filter === "deep") return safeText(option.curve, "") === "deep";
    if (filter === "dark") return safeText(option.colorGroup, "") === "dark";
    if (filter === "sized") return hasSizeEvidence(option);
    return true;
  }

  function visibleOptions() {
    const selected = data.options[state.selectedIndex];
    const matches = data.options.filter((option) => filterMatches(option, state.filter));
    const selectedMatches = matches.some((option) => option.id === selected.id);
    return {
      options: selectedMatches ? matches : [selected, ...matches],
      matchCount: matches.length,
      pinned: !selectedMatches
    };
  }

  function renderFilters() {
    dom.filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.filter === state.filter ? "true" : "false");
    });
  }

  function railMeta(option) {
    const area = safeText(option.area, "LA area").replace(/\s*·\s*Facebook Marketplace/i, "");
    const size = hasDrawableFootprint(option) ? `${number.format(option.w)} × ${number.format(option.d)}` : "NO DIMENSIONS";
    return `${area} · ${size}`;
  }

  function renderRail() {
    const selected = data.options[state.selectedIndex];
    const visible = visibleOptions();
    const fragment = document.createDocumentFragment();
    visible.options.forEach((option, visibleIndex) => {
      const dataIndex = data.options.findIndex((candidate) => candidate.id === option.id);
      const selectedCard = dataIndex === state.selectedIndex;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      if (visible.pinned && selectedCard) button.classList.add("is-pinned");
      button.dataset.optionId = String(option.id);
      button.setAttribute("aria-pressed", selectedCard ? "true" : "false");
      button.setAttribute("aria-label", `${safeText(option.name, `Sofa ${dataIndex + 1}`)}, ${formatMoney(option.price)}, ${basisLabel(option)}`);
      button.setAttribute("aria-controls", "selected-option");

      const frame = document.createElement("div");
      frame.className = "thumb-frame";
      const image = document.createElement("img");
      image.width = 368;
      image.height = 166;
      image.loading = visibleIndex < 3 ? "eager" : "lazy";
      setImage(image, option.photo, "");
      frame.append(image);

      const copy = document.createElement("div");
      copy.className = "thumb-copy";
      const line = document.createElement("div");
      line.className = "thumb-line";
      const name = document.createElement("div");
      name.className = "thumb-name";
      name.textContent = safeText(option.name, `Sofa ${dataIndex + 1}`);
      const price = document.createElement("div");
      price.className = "thumb-price";
      price.textContent = formatMoney(option.price);
      const meta = document.createElement("div");
      meta.className = "thumb-meta";
      meta.textContent = railMeta(option);
      const confidence = document.createElement("div");
      confidence.className = "thumb-confidence";
      confidence.textContent = `${dimensionBasis(option) === "listing" ? "✓" : "!"} ${basisLabel(option)}`;
      if (dimensionBasis(option) !== "listing") confidence.classList.add("pending");
      line.append(name, price);
      copy.append(line, meta, confidence);
      button.append(frame, copy);
      button.addEventListener("click", () => selectOptionById(option.id, { updateHistory: true, scrollHero: true }));
      button.addEventListener("keydown", handleRailKeydown);
      fragment.append(button);
    });
    dom.rail.replaceChildren(fragment);
    dom.rail.setAttribute("aria-label", `${visible.matchCount} matching sofa options${visible.pinned ? "; selected option pinned first" : ""}`);
    dom.visibleCount.textContent = `${visible.matchCount} match${visible.matchCount === 1 ? "" : "es"}${visible.pinned ? " · selected pinned" : ""}`;
    renderFilters();
    return selected;
  }

  function handleRailKeydown(event) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    const buttons = [...dom.rail.querySelectorAll(".option-button")];
    const current = buttons.indexOf(event.currentTarget);
    if (current < 0 || buttons.length === 0) return;
    event.preventDefault();
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
    if (event.key === "ArrowLeft") next = (current - 1 + buttons.length) % buttons.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = buttons.length - 1;
    selectOptionById(buttons[next].dataset.optionId, { updateHistory: true, focus: true });
  }

  function selectOptionById(id, options) {
    const index = data.options.findIndex((option) => String(option.id) === String(id));
    if (index < 0) return;
    state.selectedIndex = index;
    state.imageMode = "render";
    renderSelected();
    renderRail();
    const selectedButton = dom.rail.querySelector(`[data-option-id="${CSS.escape(String(id))}"]`);
    if (selectedButton && options && options.focus) selectedButton.focus({ preventScroll: true });
    if (options && options.updateHistory) updateUrl("push");
    if (options && options.scrollHero) {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      window.requestAnimationFrame(() => document.getElementById("selected-option").scrollIntoView({ behavior, block: "start" }));
    }
  }

  function setFilter(filter, options) {
    if (!FILTERS.has(filter)) return;
    state.filter = filter;
    renderRail();
    if (options && options.updateHistory) updateUrl("push");
  }

  function addSelectedNote(text) {
    if (!text) return;
    const item = document.createElement("li");
    item.textContent = text;
    dom.selectedNotes.append(item);
  }

  function renderSelected() {
    const option = data.options[state.selectedIndex];
    const basis = dimensionBasis(option);
    const known = hasDrawableFootprint(option);
    const name = safeText(option.name, `Sofa ${state.selectedIndex + 1}`);
    dom.selectedName.textContent = name;
    dom.selectedPrice.textContent = formatMoney(option.price);
    dom.selectedStatus.textContent = statusText(option);
    dom.selectedStatus.classList.toggle("pending", basis !== "listing");
    dom.selectedSummary.textContent = safeText(option.summary, "This option remains in the shortlist for shape, color, price and seller-photo evidence.");
    document.title = `${name} · LA sofa shortlist`;

    dom.selectedNotes.replaceChildren();
    const notes = Array.isArray(option.notes) ? option.notes : safeText(option.notes, "").split(/\n+/).filter(Boolean);
    notes.forEach(addSelectedNote);
    if (safeText(option.availabilityNote, "") && !notes.includes(option.availabilityNote)) addSelectedNote(option.availabilityNote);
    if (!dom.selectedNotes.children.length) {
      addSelectedNote(known ? "Tape out the outside bounds and verify the delivery route before purchase." : "Ask the seller for overall width, deepest depth and height before judging physical fit.");
    }

    dom.listingLink.href = safeText(option.sourceUrl, "#");
    dom.listingLink.hidden = !option.sourceUrl;
    setImage(dom.sourceImage, option.photo, `Actual Facebook Marketplace seller photo of ${name}`);
    dom.sourcePrice.textContent = formatMoney(option.price);
    dom.sourceSize.textContent = known ? optionDimensionsText(option) : "No actual dimensions";
    dom.sourceBasis.textContent = `${basis === "listing" ? "✓" : "!"} ${basisLabel(option)}`;
    dom.sourceArea.textContent = safeText(option.area, "LA area").replace(/\s*·\s*Facebook Marketplace/i, "");
    dom.sourceCondition.textContent = safeText(option.condition, "Not stated");
    dom.sourceListed.textContent = safeText(option.listedAge, "Age not recorded");
    setStatusClass(dom.sourceBasis, basis !== "listing");

    document.querySelectorAll("[data-image-mode]").forEach((button) => {
      const mode = button.dataset.imageMode;
      button.disabled = !(mode === "render" ? option.render : option.photo);
      button.setAttribute("aria-pressed", mode === state.imageMode ? "true" : "false");
    });
    if (!option.render && option.photo) state.imageMode = "source";
    renderStageImage(option);
    renderEvidence(option);
    renderPrice(option);
    renderSize(option);
    if (state.room) renderPlan(option);
  }

  function renderStageImage(option) {
    const basis = dimensionBasis(option);
    const name = safeText(option.name, "Selected sofa");
    const wantsRender = state.imageMode === "render" && option.render;
    const source = wantsRender ? option.render : option.photo || option.render;
    state.imageMode = wantsRender ? "render" : "source";
    const isRender = state.imageMode === "render";
    let stamp = "ACTUAL SELLER PHOTO";
    let caption = "Actual seller photo. Confirm current condition, included pieces, availability and pickup access directly with the seller.";
    let alt = `Actual Facebook Marketplace seller photo of ${name}`;
    if (isRender) {
      alt = `AI room study showing the appearance of ${name}; use the dimension evidence below for size provenance`;
      if (basis === "listing") {
        stamp = "AI ROOM STUDY · LISTING DIMENSIONS";
        caption = `Room study uses ${optionDimensionsText(option)} from the listing. The plan draws outside bounds only and does not confirm fit.`;
      } else if (basis === "seller-estimate") {
        stamp = "AI ROOM STUDY · SELLER ESTIMATE";
        caption = `Room study uses the seller's estimated ${optionDimensionsText(option)}. The dashed plan bounds are conditional and do not confirm fit.`;
      } else if (basis === "model-match") {
        stamp = "AI ROOM STUDY · PROBABLE MODEL";
        caption = `Room study uses probable-model dimensions of ${optionDimensionsText(option)}. Confirm the model match and tape out the room before purchase.`;
      } else if (basis === "visual-estimate") {
        stamp = "AI STYLE PREVIEW · PHOTO ESTIMATE";
        caption = `Room study uses a photo-based estimate of ${optionDimensionsText(option)}. The dashed plan bounds are low-confidence and do not confirm fit.`;
      } else {
        const preview = previewDimensions(option);
        stamp = "AI STYLE PREVIEW · DIMENSIONS UNKNOWN";
        caption = preview
          ? `Style preview uses an illustrative ${dimensionsText(preview, false)} assumption for visual massing. Actual dimensions are unknown; no sofa footprint or fit claim is shown.`
          : "Style preview compares shape and color only. Actual dimensions are unknown; no sofa footprint or fit claim is shown.";
      }
      const renderNote = safeText(option.renderNote, "");
      if (renderNote) caption = `${caption} ${renderNote}`;
    }
    setImage(dom.stageImage, source, alt);
    dom.imageStamp.textContent = stamp;
    dom.stageCaption.textContent = caption;
    dom.downloadImage.href = source || "#";
    if (source) dom.downloadImage.setAttribute("download", "");
    else dom.downloadImage.removeAttribute("download");
    dom.downloadImage.textContent = isRender ? "Download room study ↓" : "Download seller photo ↓";
    dom.downloadImage.hidden = !source;
    document.querySelectorAll("[data-image-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.imageMode === state.imageMode ? "true" : "false");
    });
  }

  function renderEvidence(option) {
    const known = hasDrawableFootprint(option);
    const basis = dimensionBasis(option);
    const balanced = projectionAmount(option.projectedBalanced);
    const difference = finite(balanced) ? capValue() - balanced : null;
    dom.evidenceFootprint.textContent = known
      ? `${isConditional(option) ? "!" : "✓"} ${number.format(option.w)} × ${number.format(option.d)} in${isConditional(option) ? " · est." : ""}`
      : "! WITHHELD";
    dom.evidenceTotal.textContent = formatMoney(balanced);
    dom.evidenceCap.textContent = finite(difference) ? `${difference >= 0 ? "✓" : "!"} ${formatMoney(Math.abs(difference))} ${difference >= 0 ? "under" : "over"}` : "Pending";
    dom.evidenceStatus.textContent = `${basis === "listing" ? "✓" : "!"} ${basisLabel(option)}`;
    setStatusClass(dom.evidenceFootprint, !known || isConditional(option));
    setStatusClass(dom.evidenceCap, finite(difference) && difference < 0);
    setStatusClass(dom.evidenceStatus, basis !== "listing");
  }

  function renderPrice(option) {
    dom.priceBreakdown.replaceChildren();
    const baseline = finite(data.baselineSofa) ? data.baselineSofa : null;
    const base = finite(data.budgetBase) ? data.budgetBase : null;
    const listingPrice = finite(option.price) ? option.price : null;
    const materialDifference = listingPrice !== null && baseline !== null ? listingPrice - baseline : null;
    addDefinitionListRow(dom.priceBreakdown, "Listing price", formatMoney(listingPrice));
    addDefinitionListRow(dom.priceBreakdown, "Baseline sofa", formatMoney(baseline));
    addDefinitionListRow(dom.priceBreakdown, "Material-price change", formatSignedMoney(materialDifference), "impact");
    const balancedAmount = projectionAmount(option.projectedBalanced);
    const protectedAmount = projectionAmount(option.projectedProtected);
    if (base !== null && materialDifference !== null && balancedAmount === null && protectedAmount === null) {
      addDefinitionListRow(dom.priceBreakdown, "Plan after material-only swap", formatMoney(base + materialDifference));
    }
    if (balancedAmount !== null) {
      addDefinitionListRow(dom.priceBreakdown, "Balanced plan projection", formatMoney(balancedAmount), "projection");
      addDefinitionListRow(dom.priceBreakdown, "Balanced cap status", capStatus(balancedAmount), balancedAmount > capValue() ? "cap-over" : "cap-under");
    }
    if (protectedAmount !== null) {
      addDefinitionListRow(dom.priceBreakdown, "Protected-scope projection", formatMoney(protectedAmount), "projection");
      addDefinitionListRow(dom.priceBreakdown, "Protected cap status", capStatus(protectedAmount), protectedAmount > capValue() ? "cap-over" : "cap-under");
    }
    const pickup = finite(option.pickupAllowance) ? option.pickupAllowance : null;
    const cleaning = finite(option.cleaningAllowance) ? option.cleaningAllowance : null;
    if (listingPrice !== null && (pickup !== null || cleaning !== null)) {
      const landed = listingPrice + (pickup || 0) + (cleaning || 0);
      addDefinitionListRow(dom.priceBreakdown, "Pickup allowance", pickup === null ? "Not included" : formatMoney(pickup));
      addDefinitionListRow(dom.priceBreakdown, "Cleaning allowance", cleaning === null ? "Not included" : formatMoney(cleaning));
      addDefinitionListRow(dom.priceBreakdown, "Sofa + pickup + cleaning", formatMoney(landed));
      setPriceNotes(option.budgetAssumptions || data.budgetAssumptions, "The landed planning amount uses only the allowances shown. Tax, repair, access and seller terms may still change it.");
    } else {
      setPriceNotes(option.budgetAssumptions || data.budgetAssumptions, "The plan change uses the advertised material price only. Pickup, cleaning, tax, repair and delivery remain separate unless itemized above.");
    }
  }

  function renderDimensionLinks(option) {
    dom.dimensionLinks.replaceChildren();
    const links = Array.isArray(option.sourceLinks) ? option.sourceLinks : [];
    links.forEach((source) => {
      if (!source || !safeText(source.url, "")) return;
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `${safeText(source.label, "Dimension source")} ↗`;
      item.append(link);
      dom.dimensionLinks.append(item);
    });
    dom.dimensionLinks.hidden = dom.dimensionLinks.children.length === 0;
  }

  function renderSize(option) {
    const basis = dimensionBasis(option);
    const known = hasDrawableFootprint(option);
    const dimStatus = safeText(option.dimStatus, "Dimension source detail was not recorded.");
    dom.sizeBreakdown.replaceChildren();
    dom.sizeState.classList.toggle("pending", basis !== "listing");
    dom.sizeState.textContent = statusText(option);
    renderDimensionLinks(option);
    if (!known) {
      const preview = previewDimensions(option);
      dom.footprintTitle.textContent = "No measured footprint.";
      dom.footprintNote.textContent = "Actual width, depth and height are unknown. The room image is a style preview only.";
      addDefinitionListRow(dom.sizeBreakdown, "Actual dimensions", "Not supplied", "primary-size");
      if (preview) addDefinitionListRow(dom.sizeBreakdown, "Illustrative preview assumption", `${dimensionsText(preview, false)} · not drawn`);
      addDefinitionListRow(dom.sizeBreakdown, "Dimension status", safeText(option.dimensionConfidence, basisLabel(option)));
      dom.dimensionConfidence.textContent = `${dimStatus} No sofa rectangle is drawn. The preview assumption only guides the style image and cannot support a fit or clearance judgment.`;
      return;
    }
    dom.footprintTitle.textContent = isConditional(option) ? "Conditional outside bounds." : "Outside bounds, drawn to scale.";
    dom.footprintNote.textContent = `${optionDimensionsText(option)} · ${basisLabel(option)}. The rectangle is not the sofa outline.`;
    const bodyLabel = {
      "listing": "Listing body",
      "seller-estimate": "Seller-estimated body",
      "model-match": "Probable-model body",
      "visual-estimate": "Photo-estimated body"
    }[basis];
    addDefinitionListRow(dom.sizeBreakdown, bodyLabel, optionDimensionsText(option), "primary-size");
    if (finite(option.seatH)) addDefinitionListRow(dom.sizeBreakdown, "Seat height", `${number.format(option.seatH)} in`);
    addDefinitionListRow(dom.sizeBreakdown, "Dimension provenance", basisLabel(option));
    addDefinitionListRow(dom.sizeBreakdown, "Comparison placement", "Common drawing origin only · not a confirmed layout");
    const gap = tableGap(option);
    addDefinitionListRow(dom.sizeBreakdown, "Outside rectangles to table", `${number.format(gap)} in in diagram · not occupied clearance`);
    const confidence = safeText(option.dimensionConfidence, "Dimension confidence not recorded");
    dom.dimensionConfidence.textContent = `${dimStatus} ${confidence}. The rectangle shows outside width and depth only. It does not trace the curve or confirm room fit. Tape out the bounds before purchase.`;
  }

  function tableGap(option) {
    const sofa = { minX: 83 - option.w / 2, maxX: 83 + option.w / 2, minZ: 35, maxZ: 35 + option.d };
    const radius = TABLE_PLAN.diameter / 2;
    const table = {
      minX: TABLE_PLAN.x - radius,
      maxX: TABLE_PLAN.x + radius,
      minZ: TABLE_PLAN.z - radius,
      maxZ: TABLE_PLAN.z + radius
    };
    const dx = Math.max(table.minX - sofa.maxX, sofa.minX - table.maxX, 0);
    const dz = Math.max(table.minZ - sofa.maxZ, sofa.minZ - table.maxZ, 0);
    return Math.hypot(dx, dz);
  }

  function svgElement(name, attributes) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attributes || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function addSvgText(parent, text, attributes) {
    const node = svgElement("text", attributes);
    node.textContent = text;
    parent.append(node);
    return node;
  }

  function addFixedRect(parent, item) {
    const group = svgElement("g", { transform: `rotate(${item.rotation || 0} ${item.x} ${item.z})` });
    group.append(svgElement("rect", {
      x: item.x - item.w / 2,
      y: item.z - item.d / 2,
      width: item.w,
      height: item.d,
      rx: item.kind === "circle" ? item.w / 2 : 1,
      class: "fixed-item"
    }));
    addSvgText(group, item.label, { x: item.x, y: item.z, class: "fixed-label" });
    parent.append(group);
  }

  function renderPlan(option) {
    const basis = dimensionBasis(option);
    const known = hasDrawableFootprint(option);
    dom.plan.replaceChildren();
    dom.planLoading.hidden = true;
    dom.plan.hidden = false;

    const title = svgElement("title", { id: "plan-title" });
    title.textContent = known
      ? `${safeText(option.name, "Selected sofa")} outside bounds in the rehearsal room`
      : `${safeText(option.name, "Selected sofa")} has no sofa footprint because actual dimensions are unknown`;
    const description = svgElement("desc", { id: "plan-desc" });
    description.textContent = known
      ? `${basisLabel(option)} provide ${number.format(option.w)} inches of width and ${number.format(option.d)} inches of depth. The rectangle is a planning bound, not the precise sofa outline or confirmed fit.`
      : "The room and nearby furniture appear without a sofa rectangle. Preview dimensions are illustrative and excluded from the scale plan.";
    dom.plan.append(title, description);

    const room = state.room;
    const defs = svgElement("defs");
    const pattern = svgElement("pattern", { id: "grid", width: 12, height: 12, patternUnits: "userSpaceOnUse" });
    pattern.append(svgElement("path", { d: "M 12 0 L 0 0 0 12", fill: "none", class: "room-grid" }));
    defs.append(pattern);
    dom.plan.append(defs);
    const points = room.polygonIn.map((point) => point.join(",")).join(" ");
    dom.plan.append(svgElement("polygon", { points, class: "room-fill" }));
    dom.plan.append(svgElement("polygon", { points, fill: "url(#grid)", opacity: ".68" }));

    const controls = svgElement("g", { "aria-hidden": "true" });
    controls.append(svgElement("line", { x1: 0, y1: -7, x2: room.northControlIn, y2: -7, class: "room-control" }));
    controls.append(svgElement("line", { x1: 0, y1: -10, x2: 0, y2: -4, class: "room-control" }));
    controls.append(svgElement("line", { x1: room.northControlIn, y1: -10, x2: room.northControlIn, y2: -4, class: "room-control" }));
    addSvgText(controls, `NORTH ${number.format(room.northControlIn)} in`, { x: room.northControlIn / 2, y: -9, class: "room-control-text", "text-anchor": "middle" });
    controls.append(svgElement("line", { x1: -8, y1: 0, x2: -8, y2: room.westControlIn, class: "room-control" }));
    addSvgText(controls, `WEST ${number.format(room.westControlIn)} in`, { x: -11, y: room.westControlIn / 2, class: "room-control-text", transform: `rotate(-90 -11 ${room.westControlIn / 2})`, "text-anchor": "middle" });
    addSvgText(controls, "N ↑", { x: 174, y: 14, class: "north-mark" });
    dom.plan.append(controls);

    const furniture = svgElement("g", { "aria-label": "Nearby planning furniture" });
    [
      { label: "TABLE", x: TABLE_PLAN.x, z: TABLE_PLAN.z, w: TABLE_PLAN.diameter, d: TABLE_PLAN.diameter, rotation: 0, kind: "circle" },
      { label: "CHAIR", x: 126, z: 103, w: 24.75, d: 29.5, rotation: 90 },
      { label: "CHAIR", x: 107, z: 145, w: 24.75, d: 29.5, rotation: 150 },
      { label: "PIANO", x: 9.5, z: 90, w: 59.125, d: 18.25, rotation: 270 },
      { label: "BAR", x: 13, z: 160, w: 48, d: 26, rotation: 270 },
      { label: "DESK", x: 170, z: 130, w: 72, d: 32, rotation: 90 }
    ].forEach((item) => addFixedRect(furniture, item));
    dom.plan.append(furniture);

    if (!known) {
      addSvgText(dom.plan, "NO ACTUAL SOFA DIMENSIONS", { x: 94, y: 47, class: "unknown-plan-text" });
      addSvgText(dom.plan, "FOOTPRINT WITHHELD", { x: 94, y: 55, class: "unknown-plan-text" });
      const preview = previewDimensions(option);
      if (preview) addSvgText(dom.plan, `${dimensionsText(preview, false)} PREVIEW ASSUMPTION · NOT DRAWN`, { x: 94, y: 64, class: "dimension-text" });
      return;
    }

    const x = 83 - option.w / 2;
    const z = 35;
    const centerZ = z + option.d / 2;
    const conditional = isConditional(option);
    const sofa = svgElement("g", { "aria-label": `${basisLabel(option)}: ${number.format(option.w)} by ${number.format(option.d)} inch outside bounds` });
    if (option.estimateRange && finite(option.estimateRange.maxW) && finite(option.estimateRange.maxD)) {
      sofa.append(svgElement("rect", { x: 83 - option.estimateRange.maxW / 2, y: z, width: option.estimateRange.maxW, height: option.estimateRange.maxD, rx: 3, class: "estimate-range" }));
    }
    sofa.append(svgElement("rect", { x, y: z, width: option.w, height: option.d, rx: 3, class: `sofa-footprint${conditional ? " estimated" : ""}` }));
    sofa.append(svgElement("line", { x1: 83, y1: z, x2: 83, y2: z + option.d, class: "sofa-centerline" }));
    addSvgText(sofa, conditional ? "SOFA · CONDITIONAL" : "SOFA · LISTING BOUNDS", { x: 83, y: centerZ, class: "sofa-label" });
    const widthY = z - 7;
    sofa.append(svgElement("line", { x1: x, y1: widthY, x2: x + option.w, y2: widthY, class: "dimension-line" }));
    sofa.append(svgElement("line", { x1: x, y1: widthY - 2, x2: x, y2: widthY + 2, class: "dimension-tick" }));
    sofa.append(svgElement("line", { x1: x + option.w, y1: widthY - 2, x2: x + option.w, y2: widthY + 2, class: "dimension-tick" }));
    addSvgText(sofa, `${number.format(option.w)} in W`, { x: 83, y: widthY - 2, class: "dimension-text" });
    const depthX = x + option.w + 6;
    sofa.append(svgElement("line", { x1: depthX, y1: z, x2: depthX, y2: z + option.d, class: "dimension-line" }));
    sofa.append(svgElement("line", { x1: depthX - 2, y1: z, x2: depthX + 2, y2: z, class: "dimension-tick" }));
    sofa.append(svgElement("line", { x1: depthX - 2, y1: z + option.d, x2: depthX + 2, y2: z + option.d, class: "dimension-tick" }));
    addSvgText(sofa, `${number.format(option.d)} in D`, { x: depthX + 4, y: centerZ, class: "dimension-text", transform: `rotate(90 ${depthX + 4} ${centerZ})` });
    dom.plan.append(sofa);
  }

  function loadRoom() {
    fetch("room-records.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Room record returned ${response.status}`);
        return response.json();
      })
      .then((roomData) => {
        const room = roomData && roomData.mainRoom;
        if (!room || !Array.isArray(room.polygonIn) || !finite(room.northControlIn) || !finite(room.westControlIn) || !finite(room.maximumWidthControlIn)) {
          throw new Error("Room record is missing required controls");
        }
        state.room = room;
        renderPlan(data.options[state.selectedIndex]);
      })
      .catch(() => {
        state.roomError = true;
        dom.plan.hidden = true;
        dom.planLoading.hidden = false;
        dom.planLoading.textContent = "Room record unavailable · scaled plan withheld";
      });
  }

  function syncFromLocation() {
    state.filter = filterFromUrl();
    state.selectedIndex = findInitialIndex(data.options);
    state.imageMode = "render";
    renderSelected();
    renderRail();
  }

  dom.filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter, { updateHistory: true }));
  });
  document.querySelectorAll("[data-image-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.imageMode = button.dataset.imageMode;
      renderStageImage(data.options[state.selectedIndex]);
    });
  });
  window.addEventListener("popstate", syncFromLocation);
  window.addEventListener("hashchange", () => {
    const next = findInitialIndex(data.options);
    if (next !== state.selectedIndex) syncFromLocation();
  });

  dom.optionCount.textContent = `${data.options.length} LA MARKETPLACE LISTINGS · ONE ROOM ANGLE`;
  dom.checkedAt.textContent = formatDate(data.checkedAt);
  dom.dataVersion.textContent = `Sofa comparison ${safeText(data.version, "version not recorded")} · ${formatDate(data.checkedAt).toLowerCase()}`;
  renderSelected();
  renderRail();
  loadRoom();
  updateUrl("replace");

  window.__sofaPage = {
    getState: () => ({ selectedId: data.options[state.selectedIndex].id, filter: state.filter, visibleIds: visibleOptions().options.map((option) => option.id) }),
    setFilter: (filter) => setFilter(filter, { updateHistory: true }),
    selectOption: (id) => selectOptionById(id, { updateHistory: true })
  };
})();
