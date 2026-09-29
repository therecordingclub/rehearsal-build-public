/*
 * Photo-matched furniture geometry for the generated full-room scene.
 *
 * Injection contract:
 *   1. Concatenate this source after the source scene has declared THREE,
 *      materials, helpers, and the B builder object, immediately before
 *      `const builtByKind={};`.
 *   2. Call `installPhotoFurniture();` at that point. It assigns the two
 *      builders and replaces the mutable rboxGeo binding with the indexed,
 *      smoothly shaded implementation below.
 *
 * The forms are procedural approximations of the selected retail products.
 * Published outer dimensions and identifying silhouette are represented;
 * these are not manufacturer CAD models. No room, camera, lighting, storage,
 * or planner state is changed here.
 *
 */
(function exposePhotoFurniture(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FullRoomPhotoFurniture = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function photoFurnitureFactory() {
  'use strict';

  const runtime = {THREE:null,productBuilders:null};
  const DEG = Math.PI / 180;
  const SOFA_SWEEP = 23 * DEG;

  const SPEC = Object.freeze({
    sofa: Object.freeze({
      product:'Craftmaster C9 Conversation Sofa',
      sku:'C914256',
      upholstery:'Robert Allen Revive Obsidian COM (proposed; dealer approval required)',
      nominalEnvelopeIn:[112,38],
      heightIn:37,
      armHeightIn:25,
      seatHeightIn:20,
      front:'+Z',
      representation:'procedural approximation from selected product reference',
      normalizedOutline:Object.freeze([
        [-.5,-.12],[-.46,-.32],[-.28,-.45],[0,-.5],[.28,-.45],
        [.46,-.32],[.5,-.12],[.5,.32],[.45,.5],[.32,.48],
        [.18,.36],[0,.28],[-.18,.36],[-.32,.48],[-.45,.5],[-.5,.32]
      ])
    }),
    chair: Object.freeze({
      product:'HAY About A Lounge AAL 81 Soft',
      upholstery:'Prone Leather Obsidian',
      base:'black four-star swivel',
      nominalEnvelopeIn:[30,28.75],
      heightIn:32,
      seatHeightIn:14.25,
      seatDepthIn:21.75,
      front:'+Z',
      representation:'procedural approximation from selected product reference',
      normalizedOutline:Object.freeze([
        [-.34,-.5],[0,-.5],[.34,-.5],[.48,-.31],[.5,.12],
        [.40,.38],[.20,.49],[0,.5],[-.20,.49],[-.40,.38],
        [-.5,.12],[-.48,-.31]
      ])
    }),
    alpine: Object.freeze({
      catalogId:'SEAT-ALPINE',
      product:'Jennifer Taylor Home Alpine 90 in Sofa',
      sku:'64190-3-MBB',
      upholstery:'Ebony Black Boucle',
      nominalEnvelopeIn:[90.5,36],
      heightIn:27.5,
      armHeightIn:27.5,
      seatWidthIn:70.5,
      seatDepthIn:24,
      seatHeightIn:17.5,
      footHeightIn:4,
      front:'+Z',
      representation:'procedural approximation from official product photography',
      normalizedOutline:Object.freeze([
        [-.38,-.5],[.38,-.5],[.47,-.40],[.5,-.18],[.5,.34],
        [.45,.5],[.32,.48],[0,.44],[-.32,.48],[-.45,.5],
        [-.5,.34],[-.5,-.18],[-.47,-.40]
      ])
    }),
    dyvlinge: Object.freeze({
      catalogId:'SEAT-DYVLINGE',
      product:'IKEA DYVLINGE swivel easy chair',
      sku:'805.708.31',
      upholstery:'Kelinge black corduroy',
      base:'chrome five-star swivel',
      nominalEnvelopeIn:[24.75,29.5],
      heightIn:26.75,
      seatHeightIn:16.875,
      seatDepthIn:18.5,
      front:'+Z',
      representation:'procedural approximation from official product photography',
      normalizedOutline:Object.freeze([
        [-.36,-.5],[.36,-.5],[.47,-.39],[.5,-.14],[.48,.31],
        [.37,.48],[0,.5],[-.37,.48],[-.48,.31],[-.5,-.14],[-.47,-.39]
      ])
    })
  });

  function signedPower(value, exponent) {
    return Math.sign(value) * Math.pow(Math.abs(value), exponent);
  }

  function finishGeometry(THREE, positions, uvs, indices) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    if (typeof geometry.normalizeNormals === 'function') geometry.normalizeNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  }

  // Indexed superellipsoid: shared vertices make the broad upholstery surfaces
  // genuinely smooth. The exponent controls softness without flat bevel facets.
  function cushionGeometry(THREE, width, height, depth, exponent = .48,
    longitudeSegments = 40, latitudeSegments = 20, uvMode = 'wrap') {
    const positions = [];
    const uvs = [];
    const indices = [];
    const a = width / 2;
    const b = height / 2;
    const c = depth / 2;
    for (let iy = 0; iy <= latitudeSegments; iy += 1) {
      const v = -Math.PI / 2 + Math.PI * iy / latitudeSegments;
      const cv = signedPower(Math.cos(v), exponent);
      const sv = signedPower(Math.sin(v), exponent);
      for (let ix = 0; ix <= longitudeSegments; ix += 1) {
        const u = Math.PI * 2 * ix / longitudeSegments;
        const x = a * cv * signedPower(Math.cos(u), exponent);
        const y = b * sv;
        const z = c * cv * signedPower(Math.sin(u), exponent);
        positions.push(x,y,z);
        if (uvMode === 'front') uvs.push(.5+x/width,.5+y/height);
        else if (uvMode === 'top') uvs.push(.5+x/width,.5+z/depth);
        else uvs.push(ix/longitudeSegments,.5+y/height);
      }
    }
    const row = longitudeSegments + 1;
    for (let iy = 0; iy < latitudeSegments; iy += 1) {
      for (let ix = 0; ix < longitudeSegments; ix += 1) {
        const a0 = iy * row + ix;
        const b0 = a0 + 1;
        const c0 = a0 + row;
        const d0 = c0 + 1;
        indices.push(a0, c0, b0, b0, c0, d0);
      }
    }
    const geometry = finishGeometry(THREE, positions, uvs, indices);
    const normals = geometry.attributes.normal;
    for (let ix = 0; ix <= longitudeSegments; ix += 1) {
      normals.setXYZ(ix, 0, -1, 0);
      normals.setXYZ(latitudeSegments * row + ix, 0, 1, 0);
    }
    normals.needsUpdate = true;
    return geometry;
  }

  function appendCap(positions, uvs, indices, ring, center, reverse) {
    const centerIndex = positions.length / 3;
    positions.push(center[0], center[1], center[2]);
    uvs.push(.5, .5);
    const ringStart = positions.length / 3;
    for (let index = 0; index < ring.length; index += 1) {
      const point = ring[index];
      positions.push(point[0], point[1], point[2]);
      uvs.push(.5 + Math.cos(index / (ring.length - 1) * Math.PI * 2) * .5,
        .5 + Math.sin(index / (ring.length - 1) * Math.PI * 2) * .5);
    }
    for (let index = 0; index < ring.length - 1; index += 1) {
      if (reverse) indices.push(centerIndex, ringStart + index + 1, ringStart + index);
      else indices.push(centerIndex, ringStart + index, ringStart + index + 1);
    }
  }

  // Rounded cushion swept along a shallow circular arc. It creates one
  // continuous upholstered volume rather than a chain of beveled boxes.
  function arcCushionGeometry(THREE, options) {
    const {
      radius, depth, height, y, start, end,
      centerZ = 0, alongSegments = 48,
      crossSegments = 24, exponent = .56, zSign = -1,
      uvMode = 'vertical'
    } = options;
    const positions = [];
    const uvs = [];
    const indices = [];
    const endRings = [[], []];
    for (let along = 0; along <= alongSegments; along += 1) {
      const fraction = along / alongSegments;
      const angle = start + (end - start) * fraction;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      for (let cross = 0; cross <= crossSegments; cross += 1) {
        const phase = Math.PI * 2 * cross / crossSegments;
        const radial = depth / 2 * signedPower(Math.cos(phase), exponent);
        const vertical = height / 2 * signedPower(Math.sin(phase), exponent);
        const point = [
          (radius + radial) * sin,
          y + vertical,
          centerZ + zSign * (radius + radial) * cos
        ];
        positions.push(...point);
        if (uvMode === 'top') uvs.push(fraction,.5+radial/depth);
        else uvs.push(fraction,.5+vertical/height);
        if (along === 0) endRings[0].push(point);
        if (along === alongSegments) endRings[1].push(point);
      }
    }
    const row = crossSegments + 1;
    for (let along = 0; along < alongSegments; along += 1) {
      for (let cross = 0; cross < crossSegments; cross += 1) {
        const a = along * row + cross;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    const centerAt = (angle) => [radius * Math.sin(angle), y,
      centerZ + zSign * radius * Math.cos(angle)];
    appendCap(positions, uvs, indices, endRings[0], centerAt(start), true);
    appendCap(positions, uvs, indices, endRings[1], centerAt(end), false);
    return finishGeometry(THREE, positions, uvs, indices);
  }

  // Smooth upholstered shell swept along an arbitrary U path. Height grows
  // toward the back and falls toward the arms, matching the reference chairs.
  function chairShellGeometry(THREE, points, options = {}) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', .5);
    const alongSegments = options.alongSegments || 64;
    const crossSegments = options.crossSegments || 24;
    const thickness = options.thickness || 4.5;
    const exponent = options.exponent || .58;
    const positions = [];
    const uvs = [];
    const indices = [];
    const endRings = [[], []];
    for (let along = 0; along <= alongSegments; along += 1) {
      const fraction = along / alongSegments;
      const point = curve.getPointAt(fraction);
      const tangent = curve.getTangentAt(fraction).normalize();
      const normalX = tangent.z;
      const normalZ = -tangent.x;
      const back = Math.pow(Math.sin(Math.PI * fraction), options.backExponent || .72);
      const armCenterY = options.armCenterY ?? 18.5;
      const centerY = armCenterY + back * (options.backCenterRise ?? 4.4);
      const shellHeight = (options.armHeight ?? 9) + back * (options.backHeightRise ?? 6.2);
      for (let cross = 0; cross <= crossSegments; cross += 1) {
        const phase = Math.PI * 2 * cross / crossSegments;
        const lateral = thickness / 2 * signedPower(Math.cos(phase), exponent);
        const vertical = shellHeight / 2 * signedPower(Math.sin(phase), exponent);
        const vertex = [
          point.x + normalX * lateral,
          centerY + vertical,
          point.z + normalZ * lateral
        ];
        positions.push(...vertex);
        uvs.push(fraction, cross / crossSegments);
        if (along === 0) endRings[0].push(vertex);
        if (along === alongSegments) endRings[1].push(vertex);
      }
    }
    const row = crossSegments + 1;
    for (let along = 0; along < alongSegments; along += 1) {
      for (let cross = 0; cross < crossSegments; cross += 1) {
        const a = along * row + cross;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    appendCap(positions, uvs, indices, endRings[0],
      [points[0].x, options.armCenterY ?? 18.5, points[0].z], true);
    appendCap(positions, uvs, indices, endRings[1],
      [points[points.length - 1].x, options.armCenterY ?? 18.5,
        points[points.length - 1].z], false);
    return {geometry:finishGeometry(THREE, positions, uvs, indices),curve};
  }

  function photoRboxGeo(width, height, depth, radius, THREEOverride) {
    const THREE = THREEOverride || runtime.THREE;
    if (!THREE) throw new Error('Call install() first or pass THREE as the fifth argument.');
    const smallest = Math.max(.001, Math.min(width, height, depth));
    const exponent = Math.max(.18, Math.min(.72, radius * 2 / smallest));
    return cushionGeometry(THREE, width, height, depth, exponent, 36, 20);
  }

  function install(B, context) {
    if (!B || !context?.THREE) throw new Error('installPhotoFurniture requires B and the scene helper context.');
    const {
      THREE, M, phys, rep, leatherN,
      inch, add, rod, cyl
    } = context;
    runtime.THREE = THREE;

    const fabricPath = 'assets/products/robert-allen-revive-obsidian/fabric.jpg';
    let fabricSource = context.sofaFabricMap || null;
    if (!fabricSource && typeof document !== 'undefined' && THREE.TextureLoader) {
      fabricSource = new THREE.TextureLoader().load(fabricPath);
    }
    if (fabricSource) {
      fabricSource.wrapS = fabricSource.wrapT = THREE.RepeatWrapping;
      if ('colorSpace' in fabricSource && THREE.SRGBColorSpace) {
        fabricSource.colorSpace = THREE.SRGBColorSpace;
      }
      fabricSource.needsUpdate = true;
    }
    const textile = phys({
      color:fabricSource ? 0xffffff : 0x302f32,
      roughness:.91,
      metalness:0,
      clearcoat:0,
      sheen:.12,
      sheenRoughness:.96,
      sheenColor:new THREE.Color(0x4b4a4d),
      map:fabricSource,
      envMapIntensity:.18,
      side:THREE.DoubleSide
    });
    textile.userData.productUpholstery = 'Robert Allen Revive Obsidian COM proposal';
    textile.userData.fabricSource = fabricPath;
    textile.userData.patternRepeatIn = [13.5,22.5];
    const textileFor = (horizontalIn,verticalIn) => {
      const material = textile.clone();
      if (fabricSource) {
        const map = fabricSource.clone();
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        // The downloaded swatch contains two horizontal and two vertical repeats.
        map.repeat.set(horizontalIn/27,verticalIn/45);
        map.needsUpdate = true;
        material.map = map;
      }
      material.userData = Object.assign({},textile.userData,{mappedSpanIn:[horizontalIn,verticalIn]});
      return material;
    };
    const textileSeam = phys({
      color:0x111114,roughness:1,metalness:0,clearcoat:0,side:THREE.DoubleSide
    });
    textileSeam.userData.productPart = 'piping-material';
    const pillowMaterial = phys({
      color:0x08090b,roughness:.94,metalness:0,clearcoat:0,side:THREE.DoubleSide
    });

    const leather = phys({
      color:0x08090b,
      roughness:.76,
      metalness:0,
      clearcoat:.07,
      clearcoatRoughness:.7,
      normalMap:rep(leatherN, 3),
      normalScale:new THREE.Vector2(.08, .08),
      envMapIntensity:.2,
      side:THREE.DoubleSide
    });
    const leatherSoft = leather.clone();
    leatherSoft.color.setHex(0x101115);
    leatherSoft.roughness = .82;
    const leatherSeam = leather.clone();
    leatherSeam.color.setHex(0x020203);
    leatherSeam.normalMap = null;
    leatherSeam.roughness = .96;
    leatherSeam.clearcoat = 0;

    const makeMesh = (geometry, material) => {
      const object = new THREE.Mesh(geometry, material);
      object.castShadow = true;
      object.receiveShadow = true;
      return object;
    };
    const arcMesh = (group, options, material) => {
      const object = makeMesh(arcCushionGeometry(THREE, options), material);
      group.add(object);
      return object;
    };
    const cushion = (group, width, height, depth, material, exponent = .48,
      uvMode = 'wrap') => {
      const object = makeMesh(cushionGeometry(
        THREE,width,height,depth,exponent,40,20,uvMode),material);
      group.add(object);
      return object;
    };
    const arcCurve = (radius, centerZ, y, start = -SOFA_SWEEP,
      end = SOFA_SWEEP, zSign = 1) => {
      const points = [];
      for (let index = 0; index <= 40; index += 1) {
        const angle = start + (end - start) * index / 40;
        points.push(new THREE.Vector3(radius * Math.sin(angle), y,
          centerZ + zSign * radius * Math.cos(angle)));
      }
      return new THREE.CatmullRomCurve3(points);
    };
    const pipe = (group, curve, radius, material, part, closed = false) => {
      const mesh = makeMesh(new THREE.TubeGeometry(curve,48,radius,8,closed),material);
      mesh.userData.productPart = part;
      group.add(mesh);
      return mesh;
    };

    const fitPlanEnvelope = (assembly, width, depth) => {
      assembly.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(assembly);
      const size = new THREE.Vector3();
      bounds.getSize(size);
      assembly.scale.x *= width / size.x;
      assembly.scale.z *= depth / size.z;
      assembly.updateMatrixWorld(true);
      const fitted = new THREE.Box3().setFromObject(assembly);
      const center = new THREE.Vector3();
      fitted.getCenter(center);
      assembly.position.x -= center.x;
      assembly.position.z -= center.z;
      return {scaleX:assembly.scale.x,scaleZ:assembly.scale.z};
    };

    const productMaterials = (kind) => {
      if (kind === 'alpine') return {
        upholstery:phys({
          color:0x111214,roughness:.96,metalness:0,clearcoat:0,
          sheen:.16,sheenRoughness:.98,sheenColor:new THREE.Color(0x292a2d),
          envMapIntensity:.12,side:THREE.DoubleSide
        }),
        seam:phys({color:0x060708,roughness:1,metalness:0,side:THREE.DoubleSide}),
        wood:phys({color:0x6a4528,roughness:.7,metalness:0,clearcoat:.04,
          clearcoatRoughness:.78})
      };
      return {
        upholstery:phys({
          color:0x101114,roughness:.94,metalness:0,clearcoat:0,
          sheen:.1,sheenRoughness:.98,sheenColor:new THREE.Color(0x24262a),
          envMapIntensity:.13,side:THREE.DoubleSide
        }),
        seam:phys({color:0x050607,roughness:1,metalness:0,side:THREE.DoubleSide}),
        chrome:phys({color:0xc5c8ca,roughness:.22,metalness:.92,envMapIntensity:.72}),
        rubber:phys({color:0x151617,roughness:.88,metalness:0})
      };
    };

    const ownProduct = (group,materials,spec,label) => {
      group.userData.photoFootprint = spec.normalizedOutline;
      group.userData.photoGeometry = `${label} procedural approximation`;
      group.userData.productSpec = spec;
      group.userData.productMaterials = Object.values(materials);
      return group;
    };

    const wedgeGeometry = (width,height,depth) => {
      const x = width/2;
      const z = depth/2;
      const positions = [
        -x,0,-z, x,0,-z, x,0,z, -x,0,z,
        -x*.62,height,-z*.82, x*.62,height,-z*.82,
        x*.62,height,z*.82, -x*.62,height,z*.82
      ];
      const uvs = [0,0,1,0,1,1,0,1,.2,.1,.8,.1,.8,.9,.2,.9];
      const indices = [
        0,2,1,0,3,2, 4,5,6,4,6,7,
        0,1,5,0,5,4, 1,2,6,1,6,5,
        2,3,7,2,7,6, 3,0,4,3,4,7
      ];
      return finishGeometry(THREE,positions,uvs,indices);
    };

    const buildAlpine = () => {
      const group = inch();
      const assembly = new THREE.Group();
      const materials = productMaterials('alpine');

      const shellPoints = [
        [-40.5,13.5],[-42,5],[-40,-10],[-31,-15],[0,-16],
        [31,-15],[40,-10],[42,5],[40.5,13.5]
      ].map(([x,z]) => new THREE.Vector3(x,0,z));
      const shell = chairShellGeometry(THREE,shellPoints,{
        thickness:9,armCenterY:19,backCenterRise:0,
        armHeight:17,backHeightRise:0,alongSegments:84,crossSegments:28
      });
      const shellMesh = makeMesh(shell.geometry,materials.upholstery);
      shellMesh.userData.productPart = 'continuous-u-shell';
      assembly.add(shellMesh);

      const rail = cushion(assembly,84,10,24,materials.upholstery,.34,'front');
      rail.position.set(0,9,3.4);
      rail.userData.productPart = 'upholstered-front-rail';

      const seats = [];
      for (const [index,x] of [[0,-18],[1,18]]) {
        const seat = cushion(assembly,35.25,5.5,24,materials.upholstery,.46,'top');
        seat.position.set(x,14.75,3.6);
        seat.userData.productPart = 'seat-cushion';
        seat.userData.productPartIndex = index;
        seats.push(seat);
        const welt = pipe(assembly,new THREE.CatmullRomCurve3([
          new THREE.Vector3(x-16.7,17.25,15.2),
          new THREE.Vector3(x,17.45,15.6),
          new THREE.Vector3(x+16.7,17.25,15.2)
        ]),.09,materials.seam,'seat-front-welt');
        welt.userData.productPartIndex = index;
      }

      const footGeometry = wedgeGeometry(7.5,4,27);
      for (const [index,x] of [[0,-41.25],[1,41.25]]) {
        const foot = makeMesh(footGeometry,materials.wood);
        foot.position.set(x,0,0);
        foot.userData.productPart = 'oak-wedge-foot';
        foot.userData.productPartIndex = index;
        assembly.add(foot);
      }

      const fitted = fitPlanEnvelope(assembly,SPEC.alpine.nominalEnvelopeIn[0],
        SPEC.alpine.nominalEnvelopeIn[1]);
      // Preserve the published 70.5 x 24 in two-cushion seating surface after
      // the outer shell is normalized to its conservative 90.5 x 36 envelope.
      seats.forEach((seat,index) => {
        seat.scale.x /= fitted.scaleX;
        seat.scale.z /= fitted.scaleZ;
        seat.position.x = (index ? 17.625 : -17.625) / fitted.scaleX;
        seat.position.z -= .1/fitted.scaleZ;
      });
      group.add(assembly);
      return ownProduct(group,materials,SPEC.alpine,'Jennifer Taylor Alpine 64190-3-MBB');
    };

    const buildDyvlinge = () => {
      const group = inch();
      const assembly = new THREE.Group();
      const materials = productMaterials('dyvlinge');

      for (let index = 0; index < 5; index += 1) {
        const angle = -Math.PI/2 + index*Math.PI*2/5;
        const x = Math.cos(angle)*11.5;
        const z = Math.sin(angle)*11.5;
        const leg = rod(assembly,[0,3.4,0],[x,.8,z],.29,materials.chrome,12);
        leg.userData.productPart = 'five-star-leg';
        leg.userData.productPartIndex = index;
        const pad = add(assembly,cyl(.48,.5,materials.rubber,14),x,.25,z);
        pad.userData.productPart = 'base-pad';
      }
      const hub = add(assembly,cyl(2.15,2.3,materials.chrome,24),0,2.4,0);
      hub.userData.productPart = 'swivel-hub';
      const column = add(assembly,cyl(.8,5.2,materials.chrome,18),0,5.5,0);
      column.userData.productPart = 'swivel-column';

      const support = cushion(assembly,22.5,5,20.5,materials.upholstery,.42);
      support.position.set(0,9.1,-.8);
      support.userData.productPart = 'upholstered-seat-shell';
      const seat = cushion(assembly,23.5,5.75,18.5,materials.upholstery,.48,'top');
      seat.position.set(0,14,3.2);
      seat.userData.productPart = 'tufted-seat-cushion';
      const back = cushion(assembly,23,14.5,5.2,materials.upholstery,.54,'front');
      back.position.set(0,19.5,-8.4);
      back.userData.productPart = 'tufted-back-cushion';

      for (const [index,x,z] of [[0,-5,-.5],[1,5,-.5],[2,-5,5.4],[3,5,5.4]]) {
        const button = add(assembly,cyl(.48,.16,materials.seam,16),x,16.72,z);
        button.userData.productPart = 'seat-tuft-button';
        button.userData.productPartIndex = index;
      }
      for (const [index,x,y] of [[0,-5,17.5],[1,5,17.5],[2,-5,22.2],[3,5,22.2]]) {
        const button = add(assembly,cyl(.48,.2,materials.seam,16),x,y,-5.72);
        button.rotation.x = Math.PI/2;
        button.userData.productPart = 'back-tuft-button';
        button.userData.productPartIndex = index;
      }
      for (const [index,x] of [-8,-5.33,-2.66,0,2.66,5.33,8].entries()) {
        const rib = pipe(assembly,new THREE.CatmullRomCurve3([
          new THREE.Vector3(x*.9,13.5,11.9),
          new THREE.Vector3(x,14.4,4),
          new THREE.Vector3(x*.92,15.2,-3.2)
        ]),.035,materials.seam,'corduroy-rib');
        rib.userData.productPartIndex = index;
      }

      fitPlanEnvelope(assembly,SPEC.dyvlinge.nominalEnvelopeIn[0],
        SPEC.dyvlinge.nominalEnvelopeIn[1]);
      group.add(assembly);
      return ownProduct(group,materials,SPEC.dyvlinge,'IKEA DYVLINGE 805.708.31');
    };

    runtime.productBuilders = Object.freeze({
      'SEAT-ALPINE':buildAlpine,
      'SEAT-DYVLINGE':buildDyvlinge
    });

    B.sectional = function selectedCraftmasterC9ConversationSofa() {
      const group = inch();
      const assembly = new THREE.Group();
      const body = arcMesh(assembly,{
        radius:138,depth:26,height:14,y:10,start:-SOFA_SWEEP,end:SOFA_SWEEP,
        centerZ:138,zSign:-1,alongSegments:72,crossSegments:28,exponent:.40
      },textileFor(112,14));
      body.userData.productPart = 'upholstered-front-rail';

      for (const [index,x] of [[0,-52],[1,52]]) {
        const panel = cushion(assembly,11.5,12,30,textileFor(11.5,12),.38,'front');
        panel.position.set(x,16,0);
        panel.userData.productPart = 'panel-arm';
        panel.userData.productPartIndex = index;
        const roll = cushion(assembly,11.8,6,31,textileFor(11.8,6),.52,'front');
        roll.position.set(x,22,0);
        roll.userData.productPart = 'rolled-arm-cap';
        roll.userData.productPartIndex = index;
        pipe(assembly,new THREE.CatmullRomCurve3([
          new THREE.Vector3(x,24.75,-13.7),new THREE.Vector3(x,25,-1),
          new THREE.Vector3(x,24.75,13.7)
        ]),.13,textileSeam,'arm-welt');
      }

      const seatSegments = [
        [-20*DEG,-6.9*DEG],[-6.4*DEG,6.4*DEG],[6.9*DEG,20*DEG]
      ];
      seatSegments.forEach(([start,end],index) => {
        const seat = arcMesh(assembly,{
          radius:137,depth:21,height:4.5,y:17.75,start,end,
          centerZ:132,zSign:-1,alongSegments:28,crossSegments:24,exponent:.50,
          uvMode:'top'
        },textileFor(33,21));
        seat.userData.productPart = 'seat-cushion';
        seat.userData.productPartIndex = index;
        pipe(assembly,arcCurve(126.5,132,19.65,start,end,-1),.12,
          textileSeam,'seat-welt');
      });

      const backSegments = [
        [-21*DEG,-7.2*DEG],[-6.7*DEG,6.7*DEG],[7.2*DEG,21*DEG]
      ];
      backSegments.forEach(([start,end],index) => {
        const angle = (start+end)/2;
        const back = cushion(assembly,34,18,6,textileFor(34,18),.56,'front');
        back.position.set(132*Math.sin(angle),28,118-132*Math.cos(angle));
        back.rotation.y = -angle;
        back.userData.productPart = 'back-cushion';
        back.userData.productPartIndex = index;
        pipe(assembly,arcCurve(132,118,36.85,start,end,-1),.12,
          textileSeam,'back-welt');
      });

      pipe(assembly,arcCurve(125,138,15.1,-SOFA_SWEEP,SOFA_SWEEP,-1),.12,
        textileSeam,'front-rail-welt');

      for (const [index,x,turn] of [[0,-34,-.14],[1,34,.14]]) {
        const pillow = cushion(assembly,14,13,3,pillowMaterial,.56);
        pillow.position.set(x,28,-2.5);
        pillow.rotation.y = turn;
        pillow.rotation.z = -turn*.55;
        pillow.userData.productPart = 'throw-pillow';
        pillow.userData.productPartIndex = index;
      }

      const footGeometry = new THREE.CylinderGeometry(1.3,1.8,4,4);
      for (const [index,x,z] of [[0,-48,-11],[1,48,-11],[2,-47,11],[3,47,11]]) {
        const foot = makeMesh(footGeometry,M.satin);
        foot.position.set(x,2,z);
        foot.rotation.y = Math.PI/4;
        foot.userData.productPart = 'tapered-foot';
        foot.userData.productPartIndex = index;
        assembly.add(foot);
      }
      fitPlanEnvelope(assembly, SPEC.sofa.nominalEnvelopeIn[0],
        SPEC.sofa.nominalEnvelopeIn[1]);
      group.add(assembly);
      group.userData.photoFootprint = SPEC.sofa.normalizedOutline;
      group.userData.photoGeometry = 'Craftmaster C914256 procedural approximation';
      group.userData.productSpec = SPEC.sofa;
      return group;
    };

    B.swivel = function selectedHayAAL81Soft() {
      const group = inch();
      const assembly = new THREE.Group();
      // Low powder-coated four-star base from the AAL 81 Soft reference.
      for (const [x,z] of [[-14,0],[14,0],[0,-13.25],[0,13.25]]) {
        const leg = rod(assembly,[0,4.1,0],[x,1,z],.36,M.satin,10);
        leg.userData.productPart = 'four-star-leg';
        const pad = add(assembly,cyl(.58,.55,M.rubber,14),x,.275,z);
        pad.userData.productPart = 'base-pad';
      }
      add(assembly,cyl(2.6,2,M.satin,24),0,3,0);
      add(assembly,cyl(1.1,7,M.satin,18),0,7.1,0);
      add(assembly,cyl(6.5,.75,M.satin,32),0,10.15,0);

      const shellPoints = [
        [-10.6,8.9],[-12.7,3.1],[-12.4,-5.3],[-8.2,-10.7],[0,-12.3],
        [8.2,-10.7],[12.4,-5.3],[12.7,3.1],[10.6,8.9]
      ].map(([x,z]) => new THREE.Vector3(x,0,z));
      const shell = chairShellGeometry(THREE,shellPoints,{
        thickness:1.8,armCenterY:16.8,backCenterRise:4,
        armHeight:6.4,backHeightRise:16
      });
      const shellMesh = makeMesh(shell.geometry,leather);
      shellMesh.userData.productPart = 'slim-upholstered-shell';
      assembly.add(shellMesh);

      const underSeat = cushion(assembly,24.4,2.4,20.5,leather,.52);
      underSeat.position.set(0,11.1,.15);
      underSeat.userData.productPart = 'seat-support';
      const seat = cushion(assembly,23.2,3.5,21.75,leatherSoft,.58);
      seat.position.set(0,12.5,1.1); // published seat height: 14.25 in
      seat.userData.productPart = 'seat-cushion';
      const back = cushion(assembly,20,13.5,2.8,leatherSoft,.62);
      back.position.set(0,23.2,-8.9);
      back.rotation.x = -.12;
      back.userData.productPart = 'back-cushion';

      // Tonal piping and shallow radial folds reproduce the upholstered detail.
      const topPoints = [];
      for (let index = 0; index <= 48; index += 1) {
        const fraction = index / 48;
        const point = shell.curve.getPointAt(fraction);
        const backFactor = Math.pow(Math.sin(Math.PI * fraction),.72);
        topPoints.push(new THREE.Vector3(point.x,19.85+backFactor*12.0,point.z));
      }
      pipe(assembly,new THREE.CatmullRomCurve3(topPoints),.12,leatherSeam,
        'shell-top-welt');
      const frontPipe = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10.5,14.18,11.3),new THREE.Vector3(0,14.2,11.8),
        new THREE.Vector3(10.5,14.18,11.3)
      ]);
      pipe(assembly,frontPipe,.10,leatherSeam,'seat-front-welt');
      for (const x of [-6.5,-3.25,0,3.25,6.5]) {
        const fold = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x*.32,14.2,-.5),
          new THREE.Vector3(x*.72,18,-5.2),
          new THREE.Vector3(x,24.5-Math.abs(x)*.18,-9.9+Math.abs(x)*.15)
        ]);
        pipe(assembly,fold,.055,leatherSeam,'upholstery-fold');
      }
      fitPlanEnvelope(assembly, SPEC.chair.nominalEnvelopeIn[0],
        SPEC.chair.nominalEnvelopeIn[1]);
      group.add(assembly);

      group.userData.photoFootprint = SPEC.chair.normalizedOutline;
      group.userData.photoGeometry = 'HAY AAL 81 Soft procedural approximation';
      group.userData.productSpec = SPEC.chair;
      return group;
    };

    return SPEC;
  }

  function createProductEntry(item, context = {}) {
    const catalogId = item?.catalogId || '';
    const builder = runtime.productBuilders?.[catalogId];
    if (!builder) return null;
    if (!runtime.THREE || (context.THREE && context.THREE !== runtime.THREE)) {
      throw new Error('Install FullRoomPhotoFurniture with the active THREE instance before creating products.');
    }
    const model = builder();
    // The adapter owns and rewrites the returned root scale for plan W/D.
    // Keep the builder's inch-to-foot scale on a child so that conversion is
    // not lost when the pose root receives its live planner scale.
    const group = new runtime.THREE.Group();
    group.add(model);
    group.userData.photoFootprint = model.userData.photoFootprint;
    group.userData.photoGeometry = model.userData.photoGeometry;
    group.userData.productSpec = model.userData.productSpec;
    const spec = catalogId === SPEC.alpine.catalogId ? SPEC.alpine : SPEC.dyvlinge;
    let disposed = false;
    return {
      group,
      width:spec.nominalEnvelopeIn[0]/12,
      depth:spec.nominalEnvelopeIn[1]/12,
      key:`${catalogId}:${spec.sku}`,
      dispose() {
        if (disposed) return;
        disposed = true;
        const geometries = new Set();
        group.traverse((object) => { if (object.geometry) geometries.add(object.geometry); });
        geometries.forEach((geometry) => geometry.dispose?.());
        (model.userData.productMaterials || []).forEach((material) => material.dispose?.());
      }
    };
  }

  return Object.freeze({
    install,
    createProductEntry,
    photoRboxGeo,
    cushionGeometry,
    arcCushionGeometry,
    chairShellGeometry,
    spec:SPEC
  });
});

/*
 * Direct hook for the generated scene's lexical scope. This deliberately uses
 * the host's existing bindings; keeping the call explicit prevents this file
 * from mutating anything merely by being concatenated.
 */
function installPhotoFurniture() {
  const api = globalThis.FullRoomPhotoFurniture;
  const spec = api.install(B, {
    THREE, M, phys, rep, leatherN,
    inch, add, rod, cyl, box
  });
  rboxGeo = (width, height, depth, radius) =>
    api.photoRboxGeo(width, height, depth, radius);
  return spec;
}
