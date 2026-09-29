(function attachLayoutGeometry(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.LayoutGeometry = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createLayoutGeometry() {
  "use strict";

  const GEOMETRY_EPSILON = 1e-8;
  const ELLIPSE_VERTICES = 64;

  // This module evaluates plan-view footprints only. It does not establish
  // occupied clearances, door operation, installation safety, or field fit.

  function finiteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function validPoint(point) {
    return Array.isArray(point) && point.length >= 2 &&
      finiteNumber(point[0]) && finiteNumber(point[1]);
  }

  function validPolygon(polygon) {
    return Array.isArray(polygon) && polygon.length >= 3 && polygon.every(validPoint);
  }

  function signedArea(polygon) {
    let twiceArea = 0;
    for (let index = 0; index < polygon.length; index += 1) {
      const point = polygon[index];
      const next = polygon[(index + 1) % polygon.length];
      twiceArea += point[0] * next[1] - next[0] * point[1];
    }
    return twiceArea / 2;
  }

  function pointsEqual(first, second) {
    return Math.abs(first[0] - second[0]) <= GEOMETRY_EPSILON &&
      Math.abs(first[1] - second[1]) <= GEOMETRY_EPSILON;
  }

  function segmentsIntersectInclusive(firstStart, firstEnd, secondStart, secondEnd) {
    const cross = function cross(a, b, c) {
      return (b[0] - a[0]) * (c[1] - a[1]) -
        (b[1] - a[1]) * (c[0] - a[0]);
    };
    const firstSideA = cross(firstStart, firstEnd, secondStart);
    const firstSideB = cross(firstStart, firstEnd, secondEnd);
    const secondSideA = cross(secondStart, secondEnd, firstStart);
    const secondSideB = cross(secondStart, secondEnd, firstEnd);

    if (((firstSideA > GEOMETRY_EPSILON && firstSideB < -GEOMETRY_EPSILON) ||
         (firstSideA < -GEOMETRY_EPSILON && firstSideB > GEOMETRY_EPSILON)) &&
        ((secondSideA > GEOMETRY_EPSILON && secondSideB < -GEOMETRY_EPSILON) ||
         (secondSideA < -GEOMETRY_EPSILON && secondSideB > GEOMETRY_EPSILON))) return true;

    return (Math.abs(firstSideA) <= GEOMETRY_EPSILON &&
        pointOnSegment(secondStart, firstStart, firstEnd, GEOMETRY_EPSILON)) ||
      (Math.abs(firstSideB) <= GEOMETRY_EPSILON &&
        pointOnSegment(secondEnd, firstStart, firstEnd, GEOMETRY_EPSILON)) ||
      (Math.abs(secondSideA) <= GEOMETRY_EPSILON &&
        pointOnSegment(firstStart, secondStart, secondEnd, GEOMETRY_EPSILON)) ||
      (Math.abs(secondSideB) <= GEOMETRY_EPSILON &&
        pointOnSegment(firstEnd, secondStart, secondEnd, GEOMETRY_EPSILON));
  }

  function validOutline(outline) {
    if (!Array.isArray(outline) || outline.length < 3 || outline.length > 128 ||
        !outline.every(function normalized(point) {
          return validPoint(point) && point[0] >= -0.5 - GEOMETRY_EPSILON &&
            point[0] <= 0.5 + GEOMETRY_EPSILON &&
            point[1] >= -0.5 - GEOMETRY_EPSILON &&
            point[1] <= 0.5 + GEOMETRY_EPSILON;
        }) || Math.abs(signedArea(outline)) <= GEOMETRY_EPSILON) return false;

    for (let index = 0; index < outline.length; index += 1) {
      if (pointsEqual(outline[index], outline[(index + 1) % outline.length])) return false;
    }
    for (let first = 0; first < outline.length; first += 1) {
      const firstNext = (first + 1) % outline.length;
      for (let second = first + 1; second < outline.length; second += 1) {
        const secondNext = (second + 1) % outline.length;
        if (first === second || firstNext === second || secondNext === first) continue;
        if (segmentsIntersectInclusive(outline[first], outline[firstNext],
          outline[second], outline[secondNext])) return false;
      }
    }
    return true;
  }

  // Public functions accept finite coordinates and dimensions. Invalid geometry
  // produces an empty footprint, false predicate, or null bounds rather than NaN.
  function normalizeAngle(degrees) {
    if (!finiteNumber(degrees)) return 0;
    const normalized = ((degrees % 360) + 360) % 360;
    return Math.abs(normalized - 360) < GEOMETRY_EPSILON ? 0 : normalized;
  }

  function rotatedPoints(points, cx, cz, degrees) {
    if (!Array.isArray(points) || !finiteNumber(cx) || !finiteNumber(cz)) return [];
    if (!points.every(validPoint)) return [];

    const radians = normalizeAngle(degrees) * Math.PI / 180;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    // Z increases down the plan, so the standard matrix reads clockwise on screen.
    return points.map(function rotate(point) {
      const dx = point[0] - cx;
      const dz = point[1] - cz;
      return [
        cx + dx * cosine - dz * sine,
        cz + dx * sine + dz * cosine
      ];
    });
  }

  function footprint(item) {
    if (!item || !finiteNumber(item.x) || !finiteNumber(item.z) ||
        !finiteNumber(item.w) || !finiteNumber(item.d) ||
        item.w <= 0 || item.d <= 0) return [];

    const cx = item.x;
    const cz = item.z;
    const halfWidth = item.w / 2;
    const halfDepth = item.d / 2;
    const rotation = normalizeAngle(item.rotation);

    if (validOutline(item.outline)) {
      const outlined = item.outline.map(function scale(point) {
        return [cx + point[0] * item.w, cz + point[1] * item.d];
      });
      return rotatedPoints(outlined, cx, cz, rotation);
    }

    if (item.shape === "ellipse") {
      const points = [];
      for (let index = 0; index < ELLIPSE_VERTICES; index += 1) {
        const angle = index * Math.PI * 2 / ELLIPSE_VERTICES;
        points.push([
          cx + halfWidth * Math.cos(angle),
          cz + halfDepth * Math.sin(angle)
        ]);
      }
      return rotatedPoints(points, cx, cz, rotation);
    }

    const corners = [
      [cx - halfWidth, cz - halfDepth],
      [cx + halfWidth, cz - halfDepth],
      [cx + halfWidth, cz + halfDepth],
      [cx - halfWidth, cz + halfDepth]
    ];
    return rotatedPoints(corners, cx, cz, rotation);
  }

  function pointOnSegment(point, start, end, epsilon) {
    const dx = end[0] - start[0];
    const dz = end[1] - start[1];
    const px = point[0] - start[0];
    const pz = point[1] - start[1];
    const cross = dx * pz - dz * px;
    const scale = Math.max(1, Math.abs(dx), Math.abs(dz));
    if (Math.abs(cross) > epsilon * scale) return false;

    const dot = px * dx + pz * dz;
    const squaredLength = dx * dx + dz * dz;
    return dot >= -epsilon && dot <= squaredLength + epsilon;
  }

  function pointInPolygon(point, polygon) {
    if (!validPoint(point) || !validPolygon(polygon)) return false;

    let inside = false;
    for (let index = 0, previous = polygon.length - 1;
      index < polygon.length;
      previous = index, index += 1) {
      const start = polygon[previous];
      const end = polygon[index];
      if (pointOnSegment(point, start, end, GEOMETRY_EPSILON)) return true;

      const crosses = (start[1] > point[1]) !== (end[1] > point[1]);
      if (crosses) {
        const crossingX = start[0] +
          (point[1] - start[1]) * (end[0] - start[0]) / (end[1] - start[1]);
        if (point[0] < crossingX) inside = !inside;
      }
    }
    return inside;
  }

  function asPolygon(value) {
    return validPolygon(value) ? value : footprint(value);
  }

  function projection(polygon, axis) {
    let minimum = Infinity;
    let maximum = -Infinity;
    for (const point of polygon) {
      const projected = point[0] * axis[0] + point[1] * axis[1];
      minimum = Math.min(minimum, projected);
      maximum = Math.max(maximum, projected);
    }
    return [minimum, maximum];
  }

  function convexPolygonsOverlap(polygonA, polygonB, tolerance) {
    for (const polygon of [polygonA, polygonB]) {
      for (let index = 0; index < polygon.length; index += 1) {
        const start = polygon[index];
        const end = polygon[(index + 1) % polygon.length];
        const edgeX = end[0] - start[0];
        const edgeZ = end[1] - start[1];
        const length = Math.hypot(edgeX, edgeZ);
        if (length <= GEOMETRY_EPSILON) continue;
        const axis = [-edgeZ / length, edgeX / length];
        const rangeA = projection(polygonA, axis);
        const rangeB = projection(polygonB, axis);
        const penetration = Math.min(rangeA[1], rangeB[1]) -
          Math.max(rangeA[0], rangeB[0]);
        if (penetration <= tolerance) return false;
      }
    }
    return true;
  }

  function cleanedPolygon(polygon) {
    const cleaned = [];
    for (const point of polygon) {
      if (!cleaned.length || !pointsEqual(point, cleaned[cleaned.length - 1])) {
        cleaned.push(point);
      }
    }
    if (cleaned.length > 1 && pointsEqual(cleaned[0], cleaned[cleaned.length - 1])) cleaned.pop();

    let changed = true;
    while (changed && cleaned.length > 3) {
      changed = false;
      for (let index = 0; index < cleaned.length; index += 1) {
        const previous = cleaned[(index + cleaned.length - 1) % cleaned.length];
        const point = cleaned[index];
        const next = cleaned[(index + 1) % cleaned.length];
        const cross = (point[0] - previous[0]) * (next[1] - point[1]) -
          (point[1] - previous[1]) * (next[0] - point[0]);
        if (Math.abs(cross) <= GEOMETRY_EPSILON &&
            pointOnSegment(point, previous, next, GEOMETRY_EPSILON)) {
          cleaned.splice(index, 1);
          changed = true;
          break;
        }
      }
    }
    return cleaned;
  }

  function isConvexPolygon(polygon) {
    let direction = 0;
    for (let index = 0; index < polygon.length; index += 1) {
      const previous = polygon[(index + polygon.length - 1) % polygon.length];
      const point = polygon[index];
      const next = polygon[(index + 1) % polygon.length];
      const cross = (point[0] - previous[0]) * (next[1] - point[1]) -
        (point[1] - previous[1]) * (next[0] - point[0]);
      if (Math.abs(cross) <= GEOMETRY_EPSILON) continue;
      const currentDirection = Math.sign(cross);
      if (direction && currentDirection !== direction) return false;
      direction = currentDirection;
    }
    return direction !== 0;
  }

  function pointInTriangle(point, triangle) {
    const side = function side(a, b, candidate) {
      return (b[0] - a[0]) * (candidate[1] - a[1]) -
        (b[1] - a[1]) * (candidate[0] - a[0]);
    };
    const first = side(triangle[0], triangle[1], point);
    const second = side(triangle[1], triangle[2], point);
    const third = side(triangle[2], triangle[0], point);
    const hasNegative = first < -GEOMETRY_EPSILON || second < -GEOMETRY_EPSILON ||
      third < -GEOMETRY_EPSILON;
    const hasPositive = first > GEOMETRY_EPSILON || second > GEOMETRY_EPSILON ||
      third > GEOMETRY_EPSILON;
    return !(hasNegative && hasPositive);
  }

  function triangulatePolygon(polygon) {
    const cleaned = cleanedPolygon(polygon);
    if (cleaned.length < 3 || Math.abs(signedArea(cleaned)) <= GEOMETRY_EPSILON) return [];
    if (isConvexPolygon(cleaned)) return [cleaned];

    const orientation = Math.sign(signedArea(cleaned));
    const remaining = cleaned.map(function pointWithIndex(point, index) {
      return { point, index };
    });
    const triangles = [];
    let attemptsWithoutEar = 0;

    while (remaining.length > 3 && attemptsWithoutEar < remaining.length) {
      let clipped = false;
      for (let index = 0; index < remaining.length; index += 1) {
        const previous = remaining[(index + remaining.length - 1) % remaining.length];
        const current = remaining[index];
        const next = remaining[(index + 1) % remaining.length];
        const cross = (current.point[0] - previous.point[0]) *
            (next.point[1] - current.point[1]) -
          (current.point[1] - previous.point[1]) *
            (next.point[0] - current.point[0]);
        if (cross * orientation <= GEOMETRY_EPSILON) continue;

        const triangle = [previous.point, current.point, next.point];
        const containsVertex = remaining.some(function inside(candidate) {
          return candidate.index !== previous.index && candidate.index !== current.index &&
            candidate.index !== next.index && pointInTriangle(candidate.point, triangle);
        });
        if (containsVertex) continue;

        triangles.push(triangle);
        remaining.splice(index, 1);
        clipped = true;
        attemptsWithoutEar = 0;
        break;
      }
      if (!clipped) attemptsWithoutEar += 1;
    }
    if (remaining.length === 3) {
      triangles.push(remaining.map(function point(entry) { return entry.point; }));
    }
    return triangles.length === cleaned.length - 2 ? triangles : [];
  }

  // Concave simple polygons are decomposed into convex pieces. A positive-area
  // intersection exists exactly when at least one triangle pair passes SAT.
  // Penetration no greater than epsilon remains contact, not overlap.
  function polygonsOverlap(first, second, epsilon) {
    const polygonA = asPolygon(first);
    const polygonB = asPolygon(second);
    const tolerance = finiteNumber(epsilon) && epsilon >= 0 ? epsilon : 0.05;
    if (!validPolygon(polygonA) || !validPolygon(polygonB)) return false;

    const piecesA = triangulatePolygon(polygonA);
    const piecesB = triangulatePolygon(polygonB);
    if (!piecesA.length || !piecesB.length) return false;
    return piecesA.some(function overlaps(pieceA) {
      return piecesB.some(function overlapsPiece(pieceB) {
        return convexPolygonsOverlap(pieceA, pieceB, tolerance);
      });
    });
  }

  function polygonSegments(polygon) {
    return polygon.map(function segment(start, index) {
      return [start, polygon[(index + 1) % polygon.length]];
    });
  }

  function segmentIntersection(first, second) {
    const p = first[0];
    const r = [first[1][0] - p[0], first[1][1] - p[1]];
    const q = second[0];
    const s = [second[1][0] - q[0], second[1][1] - q[1]];
    const crossRS = r[0] * s[1] - r[1] * s[0];
    if (Math.abs(crossRS) <= GEOMETRY_EPSILON) return null;

    const qMinusP = [q[0] - p[0], q[1] - p[1]];
    const t = (qMinusP[0] * s[1] - qMinusP[1] * s[0]) / crossRS;
    const u = (qMinusP[0] * r[1] - qMinusP[1] * r[0]) / crossRS;
    if (t < -GEOMETRY_EPSILON || t > 1 + GEOMETRY_EPSILON ||
        u < -GEOMETRY_EPSILON || u > 1 + GEOMETRY_EPSILON) return null;
    return [p[0] + t * r[0], p[1] + t * r[1]];
  }

  function horizontalIntervals(polygon, z) {
    const intersections = [];
    for (let index = 0; index < polygon.length; index += 1) {
      const start = polygon[index];
      const end = polygon[(index + 1) % polygon.length];
      if ((start[1] < z && end[1] > z) || (end[1] < z && start[1] > z)) {
        intersections.push(start[0] +
          (z - start[1]) * (end[0] - start[0]) / (end[1] - start[1]));
      }
    }

    intersections.sort(function ascending(a, b) { return a - b; });
    const intervals = [];
    for (let index = 0; index + 1 < intersections.length; index += 2) {
      intervals.push([intersections[index], intersections[index + 1]]);
    }
    return intervals;
  }

  function mergeIntervals(intervals) {
    if (!intervals.length) return [];
    const sorted = intervals.slice().sort(function byStart(a, b) {
      return a[0] - b[0] || a[1] - b[1];
    });
    const merged = [sorted[0].slice()];
    for (let index = 1; index < sorted.length; index += 1) {
      const current = sorted[index];
      const previous = merged[merged.length - 1];
      if (current[0] <= previous[1] + GEOMETRY_EPSILON) {
        previous[1] = Math.max(previous[1], current[1]);
      } else {
        merged.push(current.slice());
      }
    }
    return merged;
  }

  function intervalCovered(target, coverage) {
    let cursor = target[0];
    for (const interval of coverage) {
      if (interval[1] < cursor - GEOMETRY_EPSILON) continue;
      if (interval[0] > cursor + GEOMETRY_EPSILON) return false;
      cursor = Math.max(cursor, interval[1]);
      if (cursor >= target[1] - GEOMETRY_EPSILON) return true;
    }
    return false;
  }

  function pointInUnion(point, polygons) {
    return polygons.some(function contains(polygon) {
      return pointInPolygon(point, polygon);
    });
  }

  // The slab decomposition checks the complete footprint against the union. Its
  // critical Z values include every vertex and boundary crossing, so coverage
  // cannot change between two consecutive sampled slabs.
  function fitsInRooms(item, polygons) {
    const itemPolygon = footprint(item);
    const rooms = Array.isArray(polygons) ? polygons.filter(validPolygon) : [];
    if (!validPolygon(itemPolygon) || !rooms.length) return false;
    if (!itemPolygon.every(function inside(point) { return pointInUnion(point, rooms); })) {
      return false;
    }

    const allPolygons = [itemPolygon].concat(rooms);
    const segments = allPolygons.flatMap(polygonSegments);
    const criticalZ = allPolygons.flatMap(function zCoordinates(polygon) {
      return polygon.map(function z(point) { return point[1]; });
    });

    for (let first = 0; first < segments.length; first += 1) {
      for (let second = first + 1; second < segments.length; second += 1) {
        const crossing = segmentIntersection(segments[first], segments[second]);
        if (crossing) criticalZ.push(crossing[1]);
      }
    }

    criticalZ.sort(function ascending(a, b) { return a - b; });
    const uniqueZ = [];
    for (const z of criticalZ) {
      if (!uniqueZ.length || Math.abs(z - uniqueZ[uniqueZ.length - 1]) > GEOMETRY_EPSILON) {
        uniqueZ.push(z);
      }
    }

    const itemMinZ = Math.min.apply(null, itemPolygon.map(function z(point) { return point[1]; }));
    const itemMaxZ = Math.max.apply(null, itemPolygon.map(function z(point) { return point[1]; }));
    for (let index = 0; index + 1 < uniqueZ.length; index += 1) {
      const lower = uniqueZ[index];
      const upper = uniqueZ[index + 1];
      if (upper <= itemMinZ + GEOMETRY_EPSILON || lower >= itemMaxZ - GEOMETRY_EPSILON ||
          upper - lower <= GEOMETRY_EPSILON) continue;

      const z = (lower + upper) / 2;
      const itemIntervals = horizontalIntervals(itemPolygon, z);
      if (!itemIntervals.length) continue;
      const roomIntervals = mergeIntervals(rooms.flatMap(function intervals(room) {
        return horizontalIntervals(room, z);
      }));
      if (!itemIntervals.every(function covered(interval) {
        return intervalCovered(interval, roomIntervals);
      })) return false;
    }
    return true;
  }

  function bounds(items) {
    if (!Array.isArray(items)) return null;
    let minimumX = Infinity;
    let minimumZ = Infinity;
    let maximumX = -Infinity;
    let maximumZ = -Infinity;

    for (const item of items) {
      if (!item || item.visible === false) continue;
      const polygon = footprint(item);
      for (const point of polygon) {
        minimumX = Math.min(minimumX, point[0]);
        minimumZ = Math.min(minimumZ, point[1]);
        maximumX = Math.max(maximumX, point[0]);
        maximumZ = Math.max(maximumZ, point[1]);
      }
    }

    if (!Number.isFinite(minimumX)) return null;
    return { minX: minimumX, minZ: minimumZ, maxX: maximumX, maxZ: maximumZ };
  }

  return Object.freeze({
    normalizeAngle,
    rotatedPoints,
    footprint,
    polygonsOverlap,
    pointInPolygon,
    fitsInRooms,
    bounds
  });
});
