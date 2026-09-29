(function attachFurnitureProfiles(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FurnitureProfiles = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createFurnitureProfiles() {
  "use strict";

  // Plan-view coordinates use X horizontally and Z vertically. Positive Z is front.
  // Profiles are planning silhouettes. Selected retail products use their
  // published W/D envelope and a photo-derived perimeter, not manufacturer CAD.
  const COLORS = Object.freeze({
    charcoal: "#262624",
    charcoal2: "#393836",
    walnut: "#654832",
    walnut2: "#806047",
    brass: "#b99555",
    seam: "#ded7ca",
    metal: "#92999b",
    grille: "#171817",
    glass: "#455158",
    key: "#f4f0e8",
    blackKey: "#171716",
    drum: "#684b35",
    head: "#d8d2c5",
    cymbal: "#b99a54"
  });

  const SUPPORTED = Object.freeze([
    "curved-sofa", "lounge-chair", "alpine-sofa", "dyvlinge-chair",
    "office-chair", "upright-piano",
    "stage-piano", "bench", "bar", "desk", "booth-desk", "monitor",
    "amp", "stool", "round-table", "drum-kit", "pa-stand", "rect", "ellipse"
  ]);

  function normalizedProfile(value) {
    if (typeof value === "string") return value.toLowerCase();
    if (value && typeof value.profile === "string") return value.profile.toLowerCase();
    return "";
  }

  function normalized(points) {
    const minX = Math.min(...points.map((point) => point[0]));
    const maxX = Math.max(...points.map((point) => point[0]));
    const minZ = Math.min(...points.map((point) => point[1]));
    const maxZ = Math.max(...points.map((point) => point[1]));
    return points.map((point) => [
      (point[0] - minX) / (maxX - minX) - 0.5,
      (point[1] - minZ) / (maxZ - minZ) - 0.5
    ]);
  }

  function curvedSofaOutline() {
    // Craftmaster C914256: shallow crescent rear, rounded panel arms, bowed front.
    return [[-.5,-.12],[-.46,-.32],[-.28,-.45],[0,-.5],[.28,-.45],
      [.46,-.32],[.5,-.12],[.5,.32],[.45,.5],[.32,.48],
      [.18,.36],[0,.28],[-.18,.36],[-.32,.48],[-.45,.5],[-.5,.32]];
  }

  function loungeChairOutline() {
    // HAY AAL 81 Soft: broad molded back, tapered sides, and rounded open front.
    return [[-.34,-.5],[0,-.5],[.34,-.5],[.48,-.31],[.5,.12],
      [.40,.38],[.20,.49],[0,.5],[-.20,.49],[-.40,.38],
      [-.5,.12],[-.48,-.31]];
  }

  function alpineSofaOutline() {
    // Alpine 64190-3-MBB: gently rounded rectangular U-frame, not a crescent.
    return [[-.38,-.5],[.38,-.5],[.47,-.40],[.5,-.18],[.5,.34],
      [.45,.5],[.32,.48],[0,.44],[-.32,.48],[-.45,.5],
      [-.5,.34],[-.5,-.18],[-.47,-.40]];
  }

  function dyvlingeChairOutline() {
    // DYVLINGE 805.708.31: armless rounded seat/back over a five-star base.
    return [[-.36,-.5],[.36,-.5],[.47,-.39],[.5,-.14],[.48,.31],
      [.37,.48],[0,.5],[-.37,.48],[-.48,.31],[-.5,-.14],[-.47,-.39]];
  }

  function radialOutline(tips, innerRadius, startAngle) {
    const points = [];
    for (let index = 0; index < tips * 2; index += 1) {
      const angle = startAngle + index * Math.PI / tips;
      const radius = index % 2 === 0 ? 1 : innerRadius;
      points.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
    }
    return normalized(points);
  }

  function roundedEnvelope() {
    const points = [];
    const radius = 0.12;
    for (const corner of [
      [0.5 - radius, -0.5 + radius, -90],
      [0.5 - radius, 0.5 - radius, 0],
      [-0.5 + radius, 0.5 - radius, 90],
      [-0.5 + radius, -0.5 + radius, 180]
    ]) {
      for (let step = 0; step <= 4; step += 1) {
        const angle = (corner[2] + step * 90 / 4) * Math.PI / 180;
        points.push([corner[0] + radius * Math.cos(angle),
          corner[1] + radius * Math.sin(angle)]);
      }
    }
    return points;
  }

  function paStandOutline() {
    // Three projecting feet around a conservative 14 x 15 cabinet in a 42 in allowance.
    return [
      [-0.18, -0.18], [-0.05, -0.18], [0, -0.5], [0.05, -0.18],
      [0.18, -0.18], [0.18, 0.18], [0.5, 0.5], [0.08, 0.18],
      [-0.08, 0.18], [-0.5, 0.5], [-0.18, 0.18]
    ];
  }

  const OUTLINES = Object.freeze({
    "curved-sofa": curvedSofaOutline(),
    "lounge-chair": loungeChairOutline(),
    "alpine-sofa": alpineSofaOutline(),
    "dyvlinge-chair": dyvlingeChairOutline(),
    "office-chair": radialOutline(5, 0.85, -Math.PI / 2),
    "drum-kit": roundedEnvelope(),
    "pa-stand": paStandOutline()
  });

  function outline(profile) {
    const stored = OUTLINES[normalizedProfile(profile)];
    return stored ? stored.map((point) => point.slice()) : null;
  }

  function number(value) {
    if (Math.abs(value) < 1e-9) return "0";
    return String(Math.round(value * 1000) / 1000);
  }

  function attrs(values) {
    return Object.keys(values).filter((key) => values[key] !== undefined)
      .map((key) => ` ${key}="${String(values[key])}"`).join("");
  }

  function node(tag, values) {
    return `<${tag}${attrs(values)}/>`;
  }

  function group(children, values) {
    return `<g${attrs(values || {})}>${children.join("")}</g>`;
  }

  function pointsValue(points) {
    return points.map((point) => `${number(point[0])},${number(point[1])}`).join(" ");
  }

  function line(x1, z1, x2, z2, stroke, width, extra) {
    return node("line", Object.assign({
      x1: number(x1), y1: number(z1), x2: number(x2), y2: number(z2),
      stroke, "stroke-width": number(width), "stroke-linecap": "round"
    }, extra || {}));
  }

  function rect(x, z, width, depth, fill, stroke, strokeWidth, radius) {
    return node("rect", {
      x: number(x), y: number(z), width: number(width), height: number(depth),
      rx: radius ? number(radius) : undefined, fill: fill || "none", stroke,
      "stroke-width": strokeWidth ? number(strokeWidth) : undefined
    });
  }

  function ellipse(cx, cz, rx, rz, fill, stroke, strokeWidth, extra) {
    return node("ellipse", Object.assign({
      cx: number(cx), cy: number(cz), rx: number(rx), ry: number(rz),
      fill: fill || "none", stroke, "stroke-width": strokeWidth ? number(strokeWidth) : undefined
    }, extra || {}));
  }

  function circle(cx, cz, radius, fill, stroke, strokeWidth, extra) {
    return node("circle", Object.assign({
      cx: number(cx), cy: number(cz), r: number(radius), fill: fill || "none",
      stroke, "stroke-width": strokeWidth ? number(strokeWidth) : undefined
    }, extra || {}));
  }

  function polygon(points, fill, stroke, strokeWidth, extra) {
    return node("polygon", Object.assign({
      points: pointsValue(points), fill: fill || "none", stroke,
      "stroke-width": strokeWidth ? number(strokeWidth) : undefined,
      "stroke-linejoin": "round"
    }, extra || {}));
  }

  function polyline(points, stroke, strokeWidth, extra) {
    return node("polyline", Object.assign({
      points: pointsValue(points), fill: "none", stroke,
      "stroke-width": number(strokeWidth), "stroke-linejoin": "round",
      "stroke-linecap": "round"
    }, extra || {}));
  }

  function localPoint(point, width, depth) {
    return [point[0] * width, point[1] * depth];
  }

  function sofaArt(width, depth, strokeWidth) {
    const scale = (points) => points.map((point) => localPoint(point,width,depth));
    const pieces = [polygon(scale(curvedSofaOutline()),COLORS.charcoal,
      COLORS.seam,strokeWidth*.7)];
    for (const points of [
      [[-.47,-.15],[-.37,-.28],[-.31,.40],[-.43,.48]],
      [[.47,-.15],[.37,-.28],[.31,.40],[.43,.48]]
    ]) pieces.push(polygon(scale(points),COLORS.charcoal2,COLORS.seam,strokeWidth*.65));
    for (const points of [
      [[-.36,-.08],[-.28,-.18],[-.08,-.22],[-.09,.24],[-.27,.40],[-.35,.44]],
      [[-.075,-.22],[.075,-.22],[.10,.27],[0,.30],[-.10,.27]],
      [[.08,-.22],[.28,-.18],[.36,-.08],[.35,.44],[.27,.40],[.09,.24]]
    ]) pieces.push(polygon(scale(points),COLORS.charcoal2,COLORS.seam,strokeWidth*.7));
    for (const points of [
      [[-.38,-.20],[-.30,-.34],[-.08,-.42],[-.075,-.24],[-.28,-.18]],
      [[-.07,-.43],[.07,-.43],[.24,-.35],[.08,-.24],[-.08,-.24]],
      [[.08,-.42],[.30,-.34],[.38,-.20],[.28,-.18],[.075,-.24]]
    ]) pieces.push(polygon(scale(points),COLORS.charcoal,COLORS.seam,strokeWidth*.65));
    for (const side of [-1,1]) {
      pieces.push(polygon(scale([
        [side*.31,-.13],[side*.20,-.19],[side*.18,.03],[side*.29,.10]
      ]),COLORS.grille,COLORS.seam,strokeWidth*.45));
    }
    return group(pieces, { "data-detail": "craftmaster-c914256-three-over-three" });
  }

  function loungeArt(width, depth, strokeWidth) {
    const pieces = [];
    for (const side of [-1,1]) {
      pieces.push(line(0,0,side*width*.27,depth*.37,COLORS.metal,strokeWidth));
      pieces.push(line(0,0,side*width*.27,-depth*.37,COLORS.metal,strokeWidth));
    }
    const shell = [[-.36,-.43],[0,-.49],[.36,-.43],[.46,-.22],[.42,.20],
      [.27,.37],[0,.45],[-.27,.37],[-.42,.20],[-.46,-.22]]
      .map((point) => localPoint(point,width,depth));
    pieces.push(polygon(shell,COLORS.charcoal,COLORS.seam,strokeWidth*.75));
    pieces.push(ellipse(0,depth*.12,width*.31,depth*.29,COLORS.charcoal2,
      COLORS.seam,strokeWidth*.65));
    for (const x of [-.24,-.12,0,.12,.24]) {
      pieces.push(line(0,depth*.02,x*width,-depth*(.31-Math.abs(x)*.28),
        COLORS.grille,strokeWidth*.32));
    }
    pieces.push(circle(0,0,Math.min(width,depth)*.045,COLORS.metal,COLORS.grille,
      strokeWidth*.4));
    return group(pieces, { "data-detail": "hay-aal81-soft-four-star" });
  }

  function alpineArt(width, depth, strokeWidth) {
    const scale = (points) => points.map((point) => localPoint(point,width,depth));
    const pieces = [polygon(scale(alpineSofaOutline()),COLORS.charcoal,
      COLORS.seam,strokeWidth*.7)];
    // Continuous tight U-frame: one back band connected to both deep arms.
    pieces.push(polygon(scale([
      [-.42,-.37],[-.34,-.44],[.34,-.44],[.42,-.37],
      [.44,.38],[.35,.45],[.31,.30],[.32,-.18],
      [-.32,-.18],[-.31,.30],[-.35,.45],[-.44,.38]
    ]),COLORS.charcoal2,COLORS.seam,strokeWidth*.6));
    for (const [left,right] of [[-.31,-.01],[.01,.31]]) {
      pieces.push(polygon(scale([
        [left,-.14],[right,-.14],[right+.015,.34],[right-.02,.39],
        [left+.02,.39],[left-.015,.34]
      ]),COLORS.charcoal2,COLORS.seam,strokeWidth*.6));
    }
    for (const side of [-1,1]) {
      pieces.push(polygon(scale([
        [side*.5,-.12],[side*.45,-.06],[side*.43,.42],[side*.47,.35]
      ]),COLORS.walnut,COLORS.walnut2,strokeWidth*.45));
    }
    return group(pieces,{"data-detail":"jennifer-taylor-alpine-64190-two-seat-u-frame"});
  }

  function dyvlingeArt(width, depth, strokeWidth) {
    const pieces = [];
    for (let index = 0; index < 5; index += 1) {
      const angle = -Math.PI/2+index*Math.PI*2/5;
      pieces.push(line(0,0,Math.cos(angle)*width*.46,Math.sin(angle)*depth*.43,
        COLORS.metal,strokeWidth*.9));
    }
    const body = dyvlingeChairOutline().map((point) => localPoint(point,width,depth));
    pieces.push(polygon(body,COLORS.charcoal,COLORS.seam,strokeWidth*.7));
    pieces.push(ellipse(0,depth*.16,width*.44,depth*.29,COLORS.charcoal2,
      COLORS.seam,strokeWidth*.62));
    pieces.push(rect(-width*.41,-depth*.43,width*.82,depth*.26,COLORS.charcoal2,
      COLORS.seam,strokeWidth*.6,Math.min(width,depth)*.08));
    for (const x of [-.19,.19]) {
      for (const z of [-.32,-.22,.08,.19]) {
        pieces.push(circle(x*width,z*depth,Math.min(width,depth)*.018,
          COLORS.grille,COLORS.seam,strokeWidth*.3));
      }
    }
    for (const x of [-.25,-.125,0,.125,.25]) {
      pieces.push(line(x*width,depth*.03,x*width,depth*.34,
        COLORS.grille,strokeWidth*.22));
    }
    pieces.push(circle(0,0,Math.min(width,depth)*.045,COLORS.metal,COLORS.grille,
      strokeWidth*.35));
    return group(pieces,{"data-detail":"ikea-dyvlinge-80570831-tufted-five-star"});
  }

  function officeChairArt(width, depth, strokeWidth) {
    const pieces = [];
    for (let index = 0; index < 5; index += 1) {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / 5;
      pieces.push(line(0, 0, Math.cos(angle) * width * 0.43,
        Math.sin(angle) * depth * 0.43, COLORS.metal, strokeWidth * 1.15));
      pieces.push(circle(Math.cos(angle) * width * 0.43,
        Math.sin(angle) * depth * 0.43, Math.min(width, depth) * 0.025,
        COLORS.grille, COLORS.metal, strokeWidth * 0.45));
    }
    pieces.push(ellipse(0, depth * 0.03, width * 0.27, depth * 0.24,
      COLORS.charcoal2, COLORS.seam, strokeWidth * 0.7));
    pieces.push(rect(-width * 0.22, -depth * 0.33, width * 0.44, depth * 0.15,
      COLORS.charcoal, COLORS.seam, strokeWidth * 0.7, Math.min(width, depth) * 0.04));
    pieces.push(circle(0, 0, Math.min(width, depth) * 0.05,
      COLORS.metal, COLORS.grille, strokeWidth * 0.5));
    return group(pieces, { "data-detail": "five-spoke-office-chair" });
  }

  function keyboard(width, depth, top, keyboardDepth, includeControls) {
    const pieces = [];
    const left = -width * 0.46;
    const keyboardWidth = width * 0.92;
    const whiteWidth = keyboardWidth / 52;
    const seamWidth = Math.max(0.08, Math.min(width, depth) * 0.005);
    for (let index = 0; index < 52; index += 1) {
      pieces.push(rect(left + index * whiteWidth, top, whiteWidth, keyboardDepth,
        COLORS.key, COLORS.charcoal, seamWidth));
    }
    let whiteIndex = 0;
    for (let midi = 21; midi <= 108; midi += 1) {
      const pitchClass = midi % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(pitchClass);
      if (isBlack) {
        const keyWidth = whiteWidth * 0.62;
        pieces.push(rect(left + whiteIndex * whiteWidth - keyWidth / 2, top,
          keyWidth, keyboardDepth * 0.61, COLORS.blackKey));
      } else {
        whiteIndex += 1;
      }
    }
    if (includeControls) {
      const controlZ = top - depth * 0.09;
      for (let index = 0; index < 8; index += 1) {
        pieces.push(circle(-width * 0.32 + index * width * 0.055, controlZ,
          Math.min(width, depth) * 0.012, index < 2 ? COLORS.brass : COLORS.metal));
      }
      pieces.push(rect(width * 0.17, controlZ - depth * 0.025,
        width * 0.17, depth * 0.05, COLORS.grille, COLORS.metal, seamWidth));
    }
    return pieces;
  }

  function pianoArt(width, depth, strokeWidth, stage) {
    const top = depth * 0.12;
    const keyboardDepth = depth * 0.30;
    const pieces = keyboard(width, depth, top, keyboardDepth, stage);
    if (stage) {
      pieces.push(line(-width * 0.46, -depth * 0.31, width * 0.46, -depth * 0.31,
        COLORS.brass, strokeWidth));
      pieces.push(rect(-width * 0.42, -depth * 0.25, width * 0.12, depth * 0.07,
        COLORS.charcoal2, COLORS.metal, strokeWidth * 0.5, depth * 0.018));
    } else {
      pieces.push(rect(-width * 0.43, -depth * 0.41, width * 0.86, depth * 0.39,
        COLORS.walnut, COLORS.brass, strokeWidth * 0.8, Math.min(width, depth) * 0.025));
      pieces.push(rect(-width * 0.35, -depth * 0.35, width * 0.70, depth * 0.23,
        COLORS.charcoal2, COLORS.walnut2, strokeWidth * 0.7,
        Math.min(width, depth) * 0.015));
      pieces.push(line(-width * 0.43, depth * 0.46, width * 0.43, depth * 0.46,
        COLORS.brass, strokeWidth * 0.85));
    }
    return group(pieces, { "data-detail": stage ? "stage-piano-88-key" : "upright-piano-88-key" });
  }

  function benchArt(width, depth, strokeWidth) {
    const pieces = [rect(-width * 0.43, -depth * 0.38, width * 0.86, depth * 0.76,
      COLORS.charcoal2, COLORS.seam, strokeWidth * 0.65,
      Math.min(width, depth) * 0.08)];
    for (const x of [-0.25, 0, 0.25]) {
      for (const z of [-0.2, 0.2]) {
        pieces.push(circle(x * width, z * depth, Math.min(width, depth) * 0.025,
          COLORS.walnut, COLORS.seam, strokeWidth * 0.35));
      }
    }
    pieces.push(line(-width * 0.38, 0, width * 0.38, 0,
      COLORS.seam, strokeWidth * 0.55));
    return group(pieces, { "data-detail": "tufted-bench" });
  }

  function workSurfaceArt(width, depth, strokeWidth, profile) {
    const pieces = [rect(-width * 0.44, -depth * 0.39, width * 0.88, depth * 0.21,
      COLORS.walnut, COLORS.brass, strokeWidth * 0.7,
      Math.min(width, depth) * 0.025)];
    if (profile === "bar") {
      pieces.push(rect(-width * 0.35, -depth * 0.05, width * 0.70, depth * 0.23,
        COLORS.charcoal2, COLORS.metal, strokeWidth * 0.55));
      for (const x of [-0.24, 0, 0.24]) {
        pieces.push(circle(x * width, depth * 0.25, Math.min(width, depth) * 0.045,
          COLORS.brass, COLORS.charcoal, strokeWidth * 0.45));
      }
    } else {
      pieces.push(rect(-width * 0.34, -depth * 0.06, width * 0.68, depth * 0.22,
        COLORS.grille, COLORS.metal, strokeWidth * 0.55,
        Math.min(width, depth) * 0.018));
      const keyboardWidth = width * 0.47;
      pieces.push(rect(-keyboardWidth / 2, depth * 0.24, keyboardWidth, depth * 0.09,
        COLORS.key, COLORS.charcoal, strokeWidth * 0.45,
        Math.min(width, depth) * 0.012));
      if (profile === "booth-desk") {
        for (const x of [-0.25, -0.08, 0.09, 0.26]) {
          pieces.push(rect(x * width - width * 0.055, -depth * 0.02,
            width * 0.11, depth * 0.055, COLORS.charcoal2, COLORS.brass,
            strokeWidth * 0.35));
        }
      }
    }
    pieces.push(line(-width * 0.44, depth * 0.43, width * 0.44, depth * 0.43,
      COLORS.brass, strokeWidth * 0.9));
    return group(pieces, { "data-detail": `${profile}-worktop` });
  }

  function monitorArt(width, depth, strokeWidth) {
    const frontZ = depth * 0.43;
    return group([
      ellipse(0, -depth * 0.06, width * 0.25, depth * 0.18,
        COLORS.grille, COLORS.metal, strokeWidth * 0.65),
      circle(0, -depth * 0.24, Math.min(width, depth) * 0.055,
        COLORS.grille, COLORS.brass, strokeWidth * 0.5),
      line(-width * 0.42, frontZ, width * 0.42, frontZ,
        COLORS.seam, strokeWidth * 1.45),
      line(-width * 0.32, frontZ - depth * 0.035, width * 0.32,
        frontZ - depth * 0.035, COLORS.metal, strokeWidth * 0.6)
    ], { "data-detail": "monitor-front-positive-z" });
  }

  function ampArt(width, depth, strokeWidth) {
    const pieces = [rect(-width * 0.42, depth * 0.06, width * 0.84, depth * 0.34,
      COLORS.grille, COLORS.metal, strokeWidth * 0.65,
      Math.min(width, depth) * 0.025)];
    pieces.push(rect(-width * 0.20, -depth * 0.32, width * 0.40, depth * 0.10,
      "none", COLORS.brass, strokeWidth * 1.15,
      Math.min(width, depth) * 0.04));
    for (let index = 0; index < 7; index += 1) {
      pieces.push(circle(-width * 0.29 + index * width * 0.097, -depth * 0.10,
        Math.min(width, depth) * 0.023, index === 0 ? COLORS.brass : COLORS.metal));
    }
    pieces.push(line(-width * 0.41, depth * 0.43, width * 0.41, depth * 0.43,
      COLORS.seam, strokeWidth));
    return group(pieces, { "data-detail": "amp-controls-handle" });
  }

  function stoolArt(width, depth, strokeWidth) {
    const radius = Math.min(width, depth);
    const pieces = [ellipse(0, 0, width * 0.34, depth * 0.34,
      COLORS.charcoal2, COLORS.seam, strokeWidth * 0.7)];
    pieces.push(ellipse(0, 0, width * 0.43, depth * 0.43,
      "none", COLORS.brass, strokeWidth * 0.9));
    for (const angle of [45, 135, 225, 315]) {
      const radians = angle * Math.PI / 180;
      pieces.push(circle(Math.cos(radians) * width * 0.30,
        Math.sin(radians) * depth * 0.30, radius * 0.018, COLORS.metal));
    }
    return group(pieces, { "data-detail": "stool-seat-footring" });
  }

  function roundTableArt(width, depth, strokeWidth) {
    return group([
      ellipse(0, 0, width * 0.43, depth * 0.43, COLORS.glass, COLORS.brass,
        strokeWidth * 1.1, { "fill-opacity": "0.45" }),
      ellipse(0, 0, width * 0.31, depth * 0.31, "none", COLORS.seam,
        strokeWidth * 0.45, { "stroke-opacity": "0.65" }),
      circle(0, 0, Math.min(width, depth) * 0.07,
        COLORS.walnut, COLORS.brass, strokeWidth * 0.55)
    ], { "data-detail": "smoked-glass-table" });
  }

  function drumsArt(width, depth, strokeWidth) {
    const sx = width / 72;
    const sz = depth / 66;
    const pieces = [];
    const drum = (x, z, diameter, shellDepth) => {
      pieces.push(ellipse(x * sx, z * sz, diameter * sx / 2,
        shellDepth * sz / 2, COLORS.drum, COLORS.metal, strokeWidth * 0.7));
      pieces.push(ellipse(x * sx, z * sz, diameter * sx * 0.40,
        shellDepth * sz * 0.40, COLORS.head, COLORS.charcoal, strokeWidth * 0.45));
    };
    const cymbal = (x, z, diameter) => {
      pieces.push(ellipse(x * sx, z * sz, diameter * sx / 2, diameter * sz * 0.22,
        COLORS.cymbal, COLORS.brass, strokeWidth * 0.65));
      pieces.push(circle(x * sx, z * sz, Math.min(width, depth) * 0.012,
        COLORS.charcoal));
      pieces.push(line(x * sx, z * sz, x * sx, (z + 8) * sz,
        COLORS.metal, strokeWidth * 0.55));
    };

    // North is -Z: the kick's resonant face and cymbal line face the booth glass.
    drum(0, -6, 22, 18);
    pieces.push(line(-10 * sx, -15 * sz, 10 * sx, -15 * sz,
      COLORS.seam, strokeWidth * 1.15));
    pieces.push(line(0, -15 * sz, 0, -18 * sz, COLORS.brass, strokeWidth * 0.8));
    drum(-6, -3, 10, 7);
    drum(6, -3, 12, 8);
    drum(-11, 10, 14, 6.5);
    drum(15, 8, 16, 16);
    cymbal(-17, -10, 18);
    cymbal(10, -14, 16);
    cymbal(23, -2, 22);
    cymbal(-21, 6, 14);
    pieces.push(ellipse(-21 * sx, 6.8 * sz, 7 * sx, 14 * sz * 0.22,
      COLORS.cymbal, COLORS.brass, strokeWidth * 0.55));
    pieces.push(ellipse(0, 22 * sz, 6.5 * sx, 6.5 * sz,
      COLORS.charcoal2, COLORS.seam, strokeWidth * 0.7));
    pieces.push(line(-7 * sx, 29 * sz, 7 * sx, 29 * sz,
      COLORS.brass, strokeWidth * 0.6));
    return group(pieces, { "data-detail": "drum-kit-north-facing" });
  }

  function paStandArt(width, depth, strokeWidth) {
    const pieces = [];
    for (const angle of [-90, 30, 150]) {
      const radians = angle * Math.PI / 180;
      pieces.push(line(0, 0, Math.cos(radians) * width * 0.44,
        Math.sin(radians) * depth * 0.44, COLORS.metal, strokeWidth * 1.1));
      pieces.push(circle(Math.cos(radians) * width * 0.44,
        Math.sin(radians) * depth * 0.44, Math.min(width, depth) * 0.025,
        COLORS.grille));
    }
    pieces.push(rect(-width * 7 / 42, -depth * 7.5 / 42,
      width * 14 / 42, depth * 15 / 42, COLORS.charcoal2, COLORS.brass,
      strokeWidth * 0.65, Math.min(width, depth) * 0.025));
    pieces.push(circle(0, -depth * 0.035, Math.min(width, depth) * 0.065,
      COLORS.grille, COLORS.metal, strokeWidth * 0.5));
    pieces.push(line(-width * 0.13, depth * 0.13, width * 0.13,
      depth * 0.13, COLORS.seam, strokeWidth * 0.75));
    return group(pieces, { "data-detail": "three-leg-pa-stand" });
  }

  function genericArt(width, depth, strokeWidth, ellipseShape) {
    const pieces = [line(-width * 0.26, 0, width * 0.26, 0,
      COLORS.seam, strokeWidth * 0.65)];
    pieces.push(line(0, -depth * 0.20, 0, depth * 0.20,
      COLORS.seam, strokeWidth * 0.65));
    if (ellipseShape) {
      pieces.push(ellipse(0, 0, width * 0.30, depth * 0.30,
        "none", COLORS.brass, strokeWidth * 0.5));
    } else {
      pieces.push(rect(-width * 0.29, -depth * 0.29, width * 0.58, depth * 0.58,
        "none", COLORS.brass, strokeWidth * 0.5,
        Math.min(width, depth) * 0.025));
    }
    return group(pieces, { "data-detail": ellipseShape ? "ellipse" : "rect" });
  }

  function art(item) {
    if (!item || !Number.isFinite(item.w) || !Number.isFinite(item.d) ||
        item.w <= 0 || item.d <= 0) return "";
    const profile = normalizedProfile(item.profile || item.type || item.shape);
    if (!SUPPORTED.includes(profile)) return "";
    const width = item.w;
    const depth = item.d;
    const strokeWidth = Math.max(0.12, Math.min(width, depth) * 0.018);

    switch (profile) {
      case "curved-sofa": return sofaArt(width, depth, strokeWidth);
      case "lounge-chair": return loungeArt(width, depth, strokeWidth);
      case "alpine-sofa": return alpineArt(width, depth, strokeWidth);
      case "dyvlinge-chair": return dyvlingeArt(width, depth, strokeWidth);
      case "office-chair": return officeChairArt(width, depth, strokeWidth);
      case "upright-piano": return pianoArt(width, depth, strokeWidth, false);
      case "stage-piano": return pianoArt(width, depth, strokeWidth, true);
      case "bench": return benchArt(width, depth, strokeWidth);
      case "bar":
      case "desk":
      case "booth-desk": return workSurfaceArt(width, depth, strokeWidth, profile);
      case "monitor": return monitorArt(width, depth, strokeWidth);
      case "amp": return ampArt(width, depth, strokeWidth);
      case "stool": return stoolArt(width, depth, strokeWidth);
      case "round-table": return roundTableArt(width, depth, strokeWidth);
      case "drum-kit": return drumsArt(width, depth, strokeWidth);
      case "pa-stand": return paStandArt(width, depth, strokeWidth);
      case "ellipse": return genericArt(width, depth, strokeWidth, true);
      case "rect": return genericArt(width, depth, strokeWidth, false);
      default: return "";
    }
  }

  return Object.freeze({
    profiles: SUPPORTED.slice(),
    outline,
    art
  });
});
