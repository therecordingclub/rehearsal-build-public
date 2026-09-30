// Balanced package, price revision 1.8. Product dimensions and field assumptions
// remain separate: this visualization does not turn inferred site sizes into measurements.
export const BUDGET_ROOM_SPEC = Object.freeze({
  version:'1.9', package:'balanced-baseline', allIn:24813.44,
  source:'research/room-budget-v1.6.json',
  mirrors:{width:24,height:65,centers:[17.125,45.125,73.125,101.125,129.125],bottoms:[10,16,22,16,10],source:'ARCH-001'},
  rug:{width:93,depth:124.5,source:'FUR-045'},
  openings:[{x:73.125,z:70,w:48,d:32},{x:73.125,z:168,w:48,d:32}],
  openingsStatus:'Two openings are photo-documented; sizes and positions are visual estimates pending field measurements.',
  retainedDesk:{width:72,depth:32,height:30,status:'Planning envelope; retained desk must be measured.'},
  deskChair:{width:26.375,depth:26.375,height:41.5,status:'IKEA RENBERGET published footprint; height modeled within its adjustment range.'},
  omitted:['M-06','B-02','BO-11','X-AC-01','L-02','D-09','G-07','G-08','G-09','G-10','S-06']
});

// Keep legacy catalog products available when the user opens an older layout.
// The room finishes follow the budget, while each labeled product keeps its body.
export function createLegacyRoomSources({THREE,B,elements,KIND_YAW,mergeStatic}) {
  const builders={...B},byId=new Map(elements.map(el=>[el.id,{...el}])),cache={};
  const legacyCatalogs=new Set(['SEAT-01','SEAT-02A','SEAT-02B','SEAT-03','BAR-06','KEY-01','DESK-01','CHAIR-01']);
  const sourcesForItem=(item,binding)=>{
    const catalogId=item.catalogId||binding.key;
    if(!legacyCatalogs.has(catalogId))return null;
    for(const id of binding.sources){
      if(cache[id])continue;
      const el=byId.get(id),builder=el&&builders[el.kind];
      if(!builder)continue;
      const obj=builder(el);if(!obj)continue;
      mergeStatic(obj);
      if(!obj.userData.noPlace){
        obj.position.set(el.x/12,(el.y||0)/12,el.z/12);
        obj.rotation.y=((obj.userData.yaw??KIND_YAW[el.kind]??0)-(el.rot||0))*Math.PI/180;
      }
      obj.traverse(o=>{o.userData.el=el;if(o.isMesh&&!o.userData.noShadow)o.castShadow=o.receiveShadow=true;});
      cache[id]=obj;
    }
    return cache;
  };
  let disposed=false;
  return {sourcesForItem,dispose(){
    if(disposed)return;disposed=true;
    const geometries=new Set(),materials=new Set();Object.values(cache).forEach(obj=>obj.traverse(o=>{
      if(o.geometry)geometries.add(o.geometry);
      if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(material=>materials.add(material));
    }));
    geometries.forEach(geometry=>geometry.dispose());
    materials.forEach(material=>material.dispose());
  }};
}

export function applyBudgetData(data) {
  const byId=new Map(data.elements.map(e=>[e.id,e]));
  const update=(id,fields)=>{const el=byId.get(id);if(el)Object.assign(el,fields);};
  data.meta.budget={version:BUDGET_ROOM_SPEC.version,package:BUDGET_ROOM_SPEC.package,
    allIn:BUDGET_ROOM_SPEC.allIn,source:BUDGET_ROOM_SPEC.source,
    fieldChecks:['ceiling height','ceiling openings','retained desk','both raised storage-door areas']};
  BUDGET_ROOM_SPEC.mirrors.centers.forEach((x,index)=>update(`M-0${index+1}`,{
    name:`BEAUTYPEAK YH2465G stock gold arch ${index+1} · 24 × 65 in`,
    x,y:BUDGET_ROOM_SPEC.mirrors.bottoms[index],w:24,h:65,d:1,
    material:'Clear mirror, stock gold metal frame; separate warm halo',vendor:'BEAUTYPEAK / Lowe’s',
    budgetRow:'ARCH-001',note:'Five identical stock mirrors at staggered heights. Mounting locations require field confirmation.'
  }));
  update('W-01',{name:'New black acoustic fabric on retained core and track',material:'Guilford of Maine FR701 408 Black',budgetRow:'ARCH-024'});
  data.elements.filter(e=>e.kind==='wall').forEach(e=>{e.material='Black FR701 acoustic fabric over retained core and track';});
  data.elements.filter(e=>e.kind==='slat-panel').forEach(e=>Object.assign(e,{h:94.5,material:'Seafuloy black slat panel, 94.5 in stock height; black reveal above',budgetRow:'ARCH-028'}));
  update('F-01',{name:'Existing warm-honey plank floor retained',material:'Photo-matched warm-honey wood-look resilient plank',budgetRow:'ARCH-016',note:'Retained existing floor, subject to condition inspection; plank layout is illustrative.'});
  update('B-01',{name:'48-inch DIY bar · laminate and smoked acrylic',w:26,d:48,h:42,
    material:'Black laminate carcass; Blackstone laminate countertop; smoke-film acrylic front; gold trim',budgetRow:'FUR-001',note:'Removable black infill closes the future fridge bay; no appliance in the balanced package.'});
  for(const id of ['B-03','B-04'])update(id,{y:(id==='B-03'?60:78)-.578,h:1.156,material:'Laminated birch plywood, black laminate and warm LED channel',budgetRow:'FUR-021'});
  update('K-01',{name:'Retained Yamaha Clavinova · model and dimensions pending',w:18,d:57,h:33.5,material:'Retained black console digital piano',vendor:'Owned',budgetRow:'FUR-030',note:'57 × 18 × 33.5 in planning envelope. Measure the retained instrument; exact Clavinova model is unresolved.'});
  update('L-11',{name:'Haddington 16-inch bronze and alabaster banker lamp',y:33.5,h:16,material:'Antique bronze and alabaster glass',vendor:'Regency Hill / Target',budgetRow:'FUR-034'});
  update('S-01',{name:'Alpine 64190-3-MBB ebony black sofa',w:90.5,d:36,h:27.5,x:83,z:53,material:'Ebony black boucle; natural oak feet',vendor:'Jennifer Taylor Home',catalogId:'SEAT-ALPINE',budgetRow:'FUR-036'});
  for(const id of ['S-02','S-03'])update(id,{name:'IKEA DYVLINGE Kelinge black',w:24.75,d:29.5,h:26.75,material:'Black fabric; chrome five-star swivel base',vendor:'IKEA',catalogId:'SEAT-DYVLINGE',budgetRow:'FUR-039'});
  for(const [id,z] of [['S-04',148],['S-05',172]])update(id,{name:'Corrigan Studio Seattle black velvet bar stool',x:37,z,w:15.4,d:15.4,h:30,catalogId:'BAR-SEATTLE',material:'Black velvet padded seat; black iron legs and gold ring footrest',vendor:'Corrigan Studio / Wayfair',budgetRow:'FUR-027'});
  update('T-01',{name:'Qualler CH35CT530B black-glass gold-frame table',w:30.7,d:30.7,h:18.5,material:'Black tempered glass with gold geometric metal frame',vendor:'Qualler / Home Depot',catalogId:'TABLE-CH35',budgetRow:'FUR-081'});
  update('DC-1',{name:'Brass tray, empty glassware and black flameless tapers',y:18.5,material:'Budget decor allowance; no stocked alcohol or real flames',budgetRow:'FUR-069 / FUR-070 / FUR-071 / FUR-074'});
  update('L-01',{name:'Luxe Weavers black geometric trellis rug · 93 × 124.5 in',w:93,d:124.5,x:83,z:111,budgetRow:'FUR-045',note:'Selected nominal 8 × 10 variant; retailer highlights give 93 × 124.5 in, with 1–2 in manufacturing variation.'});
  update('D-01',{name:'Retained black worktable · dimensions pending',material:'Existing black top and folding steel frame',vendor:'Owned · identify and measure',budgetRow:'FUR-082',note:BUDGET_ROOM_SPEC.retainedDesk.status});
  for(const id of ['D-05','D-06'])update(id,{name:'Retained PMC IB1-family main · model and stand pending',w:15.8,d:19.7,h:63.4,material:'Inventory cabinet envelope 15.8 × 19.7 × 39.4 in, with provisional 24 in stand',note:'Exact PMC model, cabinet and stand measurements required. No new speaker purchase.'});
  update('D-07',{name:'Gator GFW-DESKTOPRK-12U open angled rack',w:20.4,d:13.9,h:23,x:163,z:109,y:30,material:'Black steel open desktop rack frame',vendor:'Gator Frameworks',budgetRow:'FUR-051',note:'Planning equipment placement; desk load, reach and AV elevation require verification.'});
  update('S-08',{name:'IKEA RENBERGET · Bomstad black desk chair',w:26.375,d:26.375,h:41.5,catalogId:'CHAIR-RENBERGET',material:'Black coated fabric and textile, black frame and casters',vendor:'IKEA',budgetRow:'FUR-085',note:BUDGET_ROOM_SPEC.deskChair.status});
  update('A-01',{name:'RODALM black frame and approved print allowance',d:24,h:36,material:'Black picture frame; illustrative print pending Greg’s image selection',budgetRow:'FUR-075'});
  update('P-01',{name:'FEJKA 57-inch fiddle-leaf fig · NYPON gray pot',h:57,w:22,d:22,budgetRow:'FUR-067'});
  update('E-02',{name:'Six retained main downlights · service allowance',material:'Existing fittings, refreshed lamps and trim',note:'Six fixtures retained; exact coordinates require field survey.'});
  update('E-03',{name:'48-inch WAC H-track · four black heads',d:48,budgetRow:'SYS-052'});
  update('BO-01',{name:'Existing booth acoustic fabric retained',material:'Existing gray acoustic fabric; no new absorbers or ceiling cloud',budgetRow:'ARCH-037'});
  update('BO-10',{name:'Existing booth floor retained · condition unverified',note:'Existing finish retained; verify floor and rug condition before work.'});
  update('BO-03',{name:'Retained Gretsch Catalina Maple kit · setup provisional',material:'Inventory-backed Gretsch kit; hardware and full setup dimensions pending field survey',note:'72 × 66 in setup allowance; individual retained pieces require identification.'});
  // Inventory supports four wall-hung basses and one Stratocaster. The upright
  // stays in protected floor storage, and the sixth purchased hanger stays empty.
  const instruments=[
    {name:'Owned Breedlove acoustic bass · representative body',type:'acoustic-bass',color:'#9e6735',instrument:'BASS02 · exact body dimensions pending'},
    {name:'Owned Fender Jaguar bass · representative body',type:'pbass',color:'#111111',instrument:'BASS05 · exact finish and dimensions pending'},
    {name:'Owned Fender Jazz bass · representative body',type:'jbass',color:'#242424',instrument:'BASS03 · exact finish and dimensions pending'},
    {name:'Owned Ibanez bass · representative body',type:'jbass',color:'#64432d',instrument:'BASS04 · exact model, finish and dimensions pending'},
    {name:'Owned Fender Stratocaster · representative body',type:'strat',color:'#e7e1d1',instrument:'GTR04 · exact finish and dimensions pending'},
    {name:'Sixth String Swing hanger · spare, unoccupied',kind:'empty-hanger',instrument:'No instrument purchased or assigned'}
  ];
  instruments.forEach((fields,index)=>update(`G-0${index+1}`,{...fields,budgetRow:index<5?'FUR-063 / FUR-065 / SYS-025':'SYS-025'}));
  data.elements=data.elements.filter(e=>!BUDGET_ROOM_SPEC.omitted.includes(e.id));
  BUDGET_ROOM_SPEC.openings.forEach((opening,index)=>data.elements.push({
    ...opening,id:`CEIL-OPEN-${index+1}`,kind:'existing-ceiling-opening',zone:'shell',
    name:`Retained illuminated ceiling opening ${index+1} · estimated size`,y:data.meta.ceiling_in,h:8,
    material:'Existing black ceiling, light-colored reveal and illuminated opening',budgetRow:'ARCH-051',note:BUDGET_ROOM_SPEC.openingsStatus
  }));
  return data;
}

export function installBudgetRoom(c) {
  const {THREE,scene,DATA,B,M,archMeshes,ceilingMeshes,cnv,T,NM,inch,add,box,rbox,mesh,
    cyl,rod,ext,planGeo,poly,CEIL,reflUniforms,seeded,noise,wallNormal,lathe,bottle,createBudgetFurnitureEntry,img}=c;
  const IN=1/12;
  const solidPaint=M.plaster.clone();solidPaint.map=null;solidPaint.normalMap=null;solidPaint.color.setHex(0x161719);solidPaint.roughness=.92;
  scene.traverse(o=>{if(o.isMesh&&o.material===M.plaster&&o.userData.el?.kind!=='wall')o.material=solidPaint;});
  for(const [kind,catalogId] of [['sectional','SEAT-ALPINE'],['swivel','SEAT-DYVLINGE'],['stool','BAR-SEATTLE'],['table','TABLE-CH35']]){
    B[kind]=el=>{
      const item={catalogId:el.catalogId||catalogId};
      const entry=createBudgetFurnitureEntry(item,{THREE})||globalThis.FullRoomPhotoFurniture.createProductEntry(item,{THREE});
      return entry.group;
    };
  }
  const fabric=cnv(512,512,(q,w,h)=>{
    q.fillStyle='#242526';q.fillRect(0,0,w,h);
    const random=seeded(407);
    for(let x=0;x<w;x+=2){q.strokeStyle=`rgba(170,174,175,${.025+random()*.06})`;q.beginPath();q.moveTo(x,0);q.lineTo(x,h);q.stroke();}
    for(let y=0;y<h;y+=3){q.strokeStyle=`rgba(3,4,5,${.08+random()*.1})`;q.beginPath();q.moveTo(0,y);q.lineTo(w,y);q.stroke();}
  });
  M.plaster.map=T(fabric);M.plaster.normalMap=NM(fabric,.25);M.plaster.normalScale.set(.11,.11);
  M.plaster.color.setHex(0xd3d3d3);M.plaster.roughness=1;M.plaster.envMapIntensity=.2;
  M.plaster.userData.budgetRow='ARCH-024';
  M.ceiling.color.setHex(0x0c0d0f);M.ceiling.roughness=.92;

  const wood=cnv(1024,1707,(q,w,h)=>{
    const random=seeded(11),pw=w/8,pl=h/2;
    q.fillStyle='#bb874a';q.fillRect(0,0,w,h);
    for(let i=0;i<8;i++){
      const offset=random()*h;
      for(let j=0;j<2;j++)for(const y of [(offset+j*pl)%h,(offset+j*pl)%h-h]){
        const tone=random();q.save();q.beginPath();q.rect(i*pw,y,pw,pl);q.clip();
        q.fillStyle=`rgb(${176+tone*30},${124+tone*27},${68+tone*24})`;q.fillRect(i*pw,y,pw,pl);
        for(let k=0;k<100;k++){
          let x=i*pw+random()*pw;q.strokeStyle=random()<.6?`rgba(86,48,20,${.04+random()*.12})`:`rgba(241,198,128,${.06+random()*.14})`;
          q.lineWidth=.4+random()*1.5;q.beginPath();q.moveTo(x,y);
          for(let t=y;t<y+pl;t+=30){x+=(random()-.5)*3;q.lineTo(x,t);}q.stroke();
        }
        q.fillStyle='rgba(74,43,17,.24)';q.fillRect(i*pw,y,pw,1.5);q.restore();
      }
      q.fillStyle='rgba(65,38,17,.25)';q.fillRect(i*pw,0,1.2,h);
    }
  });
  M.floor.map=T(wood);M.floor.color.setHex(0xffffff);M.floor.roughness=.74;M.floor.clearcoat=.06;M.floor.envMapIntensity=.3;
  M.floor.normalScale.set(.18,.18);M.floor.userData.budgetRow='ARCH-016';
  const rugMap=img('assets/products/luxe-weavers-black-trellis/retailer-top.webp');
  rugMap.repeat.set(790/1200,1150/1200);rugMap.offset.set(205/1200,25/1200);
  rugMap.wrapS=rugMap.wrapT=THREE.ClampToEdgeWrapping;
  const oldRug=B.rug;
  B.rug=el=>{
    if(el.id!=='L-01')return oldRug(el);
    const g=inch(),mat=new THREE.MeshStandardMaterial({map:rugMap,color:0xffffff,roughness:1,envMapIntensity:.12});
    const rug=add(g,mesh(new THREE.PlaneGeometry(el.w,el.d),mat),0,.4,0);rug.rotation.x=-Math.PI/2;
    g.userData.productSpec={model:'Luxe Weavers TCIN 1006022706',widthIn:el.w,depthIn:el.d,budgetRow:'FUR-045',patternSource:'assets/products/luxe-weavers-black-trellis/source.md'};return g;
  };

  // The opening sizes are visual estimates. Cut actual holes in the existing
  // ceiling mesh so the light wells stay visible from walk and orbit views.
  const ceilingShape=new THREE.Shape(poly.map(([x,z])=>new THREE.Vector2(x,z)));
  for(const o of BUDGET_ROOM_SPEC.openings){
    const x0=(o.x-o.w/2)*IN,x1=(o.x+o.w/2)*IN,z0=(o.z-o.d/2)*IN,z1=(o.z+o.d/2)*IN;
    const hole=new THREE.Path();hole.moveTo(x0,z0);hole.lineTo(x0,z1);hole.lineTo(x1,z1);hole.lineTo(x1,z0);hole.closePath();ceilingShape.holes.push(hole);
  }
  const mainCeiling=ceilingMeshes[0];mainCeiling.geometry.dispose();mainCeiling.geometry=planGeo(ceilingShape,-1);
  mainCeiling.userData.budgetSurface='retained-ceiling';
  B['existing-ceiling-opening']=el=>{
    const g=inch();g.position.set(el.x*IN,CEIL,el.z*IN);g.userData.noPlace=true;g.userData.ceil=true;
    g.userData.budgetRow=el.budgetRow;g.userData.dimensionStatus='estimated';g.userData.lights=[];
    const reveal=new THREE.MeshStandardMaterial({color:0xc4b9a3,roughness:.84});
    const luminous=new THREE.MeshStandardMaterial({color:0xffefda,emissive:0xffe5bf,emissiveIntensity:1.3,roughness:1});
    add(g,box(el.w,el.h,.6,reveal),0,el.h/2,-el.d/2);
    add(g,box(el.w,el.h,.6,reveal),0,el.h/2,el.d/2);
    add(g,box(.6,el.h,el.d,reveal),-el.w/2,el.h/2,0);
    add(g,box(.6,el.h,el.d,reveal),el.w/2,el.h/2,0);
    add(g,box(el.w,1,el.d,luminous),0,el.h,0);
    for(const side of [-1,1]){
      add(g,box(el.w+2,.6,1.2,M.satin),0,-.1,side*(el.d/2+.4));
      add(g,box(1.2,.6,el.d+2,M.satin),side*(el.w/2+.4),-.1,0);
    }
    const light=new THREE.SpotLight(0xffe6c1,85,22,1.1,.88,1.5);
    light.position.set(0,-1,0);light.target.position.set(0,-100,0);g.add(light,light.target);g.userData.lights.push(light);
    return g;
  };

  M.archMirror.map=null;
  reflUniforms.tint.value.setRGB(.84,.85,.86);
  M.archMirror.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,reflUniforms);
    shader.vertexShader='uniform mat4 texMat;\nvarying vec4 vRefl;\n'+shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvRefl=texMat*modelMatrix*vec4(transformed,1.0);');
    shader.fragmentShader='uniform sampler2D reflTex;uniform vec3 tint;\nvarying vec4 vRefl;\n'+shader.fragmentShader.replace('#include <envmap_fragment>','vec2 ruv=vRefl.xy/vRefl.w;outgoingLight=texture2D(reflTex,ruv).rgb*tint;');
  };
  M.archMirror.customProgramCacheKey=()=> 'budget-clear-mirror-v1';M.archMirror.needsUpdate=true;
  const arch=(radius,height,bottom=0)=>{
    const s=new THREE.Shape();s.moveTo(-radius,bottom);s.lineTo(-radius,height-radius);
    s.absarc(0,height-radius,radius,Math.PI,0,true);s.lineTo(radius,bottom);s.closePath();return s;
  };
  B['mirror-arch']=el=>{
    const g=inch(),r=el.w/2;
    const glass=add(g,mesh(new THREE.ShapeGeometry(arch(r-.35,el.h-.35,.35),56),M.archMirror),0,0,1.05);
    glass.userData.keep=true;glass.userData.noShadow=true;archMeshes.push(glass);
    add(g,ext(arch(r,el.h),.35,M.felt,0,56),0,0,.2);
    const frame=arch(r,el.h);frame.holes.push(new THREE.Path(arch(r-.35,el.h-.35,.35).getPoints(56).reverse()));
    add(g,ext(frame,.55,M.brass,0,56),0,0,.55);
    for(const side of [-1,1])add(g,box(.28,el.h-r,.12,M.led),side*(r+.4),(el.h-r)/2,.35).userData.noShadow=true;
    const arc=new THREE.Shape();arc.absarc(0,el.h-r,r+.54,0,Math.PI,false);arc.absarc(0,el.h-r,r+.26,Math.PI,0,true);arc.closePath();
    add(g,ext(arc,.12,M.led,0,56),0,0,.35).userData.noShadow=true;
    const glow=new THREE.PointLight(0xffc080,30,7,2);glow.position.set(0,el.h*.6,8);g.add(glow);g.userData.glow=glow;
    g.userData.productSpec={model:'BEAUTYPEAK YH2465G',widthIn:24,heightIn:65,budgetRow:'ARCH-001'};return g;
  };

  const laminate=new THREE.MeshPhysicalMaterial({color:0x101114,roughness:.26,clearcoat:.4,clearcoatRoughness:.25,envMapIntensity:.5});
  const topMap=img('assets/products/budget-blackstone/retailer-swatch.jpg');topMap.repeat.set(2,1);
  const printedTop=new THREE.MeshPhysicalMaterial({map:topMap,color:0xffffff,roughness:.2,clearcoat:.65,clearcoatRoughness:.16,envMapIntensity:.55});
  const goldPvc=new THREE.MeshPhysicalMaterial({color:0xb08d50,roughness:.48,metalness:.28,clearcoat:.25});
  B.bar=el=>{
    const g=inch(),w=el.d,d=el.w,h=el.h;
    add(g,box(w-1.4,h-3,d-2,M.lacquer),0,(h-3)/2+2,-.2);
    add(g,rbox(w,1.05,d,.14,laminate),0,h-.525,0);
    const top=add(g,mesh(new THREE.PlaneGeometry(w-.2,d-.2),printedTop),0,h+.002,0);top.rotation.x=-Math.PI/2;
    add(g,box(w-1,2,d-3,M.satin),0,1,-.8);
    const face=new THREE.MeshPhysicalMaterial({color:0x343840,transparent:true,opacity:.62,roughness:.11,clearcoat:.9,metalness:0,envMapIntensity:.65,depthWrite:false});
    add(g,box(32.4,22.5,.118,face),7.2,25.25,d/2-.35);
    add(g,box(14.4,35,.72,M.lacquer),-16.1,20.5,d/2-1);
    for(const y of [13.75,36.75])add(g,box(32.6,.4,.18,goldPvc),7.2,y,d/2-.2);
    for(const x of [-9.1,23.5])add(g,box(.4,23,.18,goldPvc),x,25.25,d/2-.2);
    add(g,box(w-.5,.18,.45,M.led),0,h-1.15,d/2-.45);
    for(const y of [6,31]){
      add(g,box(10,4,.12,M.satin),-16.1,y,d/2-.52);
      for(let i=0;i<6;i++)add(g,box(8.8,.15,.14,M.felt),-16.1,y-1.4+i*.55,d/2-.42);
    }
    g.userData.budgetRow='FUR-001 / FUR-013 / FUR-016';g.userData.fridgeIncluded=false;return g;
  };

  const oldDesk=B.desk;
  B.desk=el=>{
    const source=oldDesk(el),g=inch(),w=el.d,d=el.w,h=el.h;
    // Keep the owned console, laptop and interface; replace the millwork body,
    // brass edge and sliding keyboard tray with the photographed black table.
    for(const child of [...source.children])if(child.position.y>=h){
      if(child.position.x===-6)child.position.x=6;
      if(child.position.x===-28)child.position.x=-12;
      g.add(child);
    }
    add(g,rbox(w,1.15,d,.22,M.satin),0,h-.575,0);
    for(const side of [-1,1]){
      rod(g,[side*(w/2-4),h-1.2,-d/2+4],[side*(w/2-7),1,d/2-4],.55,M.satin);
      rod(g,[side*(w/2-4),h-1.2,d/2-4],[side*(w/2-7),1,-d/2+4],.55,M.satin);
      add(g,box(2,.6,d-5,M.satin),side*(w/2-7),.3,0);
    }
    rod(g,[-w/2+6,9,-d/2+4],[w/2-6,9,-d/2+4],.5,M.satin);
    for(const x of [-17,17]){
      add(g,box(32,.2,4,M.satin),x,h-5,-d/2+3);
      add(g,box(32,3,.2,M.satin),x,h-3.5,-d/2+1);
      const rim=mesh(new THREE.TorusGeometry(1,.12,8,32),M.satin);rim.rotation.x=Math.PI/2;add(g,rim,x,h+.02,-d/2+3);
    }
    g.userData.dimensionStatus='retained desk: measure on site';return g;
  };
  B.rack=el=>{
    const g=inch(),w=el.w,d=el.d,h=el.h;
    for(const side of [-1,1]){
      add(g,box(.8,.6,d,M.satin),side*(w/2-.4),.3,0);
      rod(g,[side*(w/2-.4),.6,d/2-1],[side*(w/2-.4),h,-d/2+2],.42,M.satin);
      rod(g,[side*(w/2-.4),.6,-d/2+1],[side*(w/2-.4),h,-d/2+2],.42,M.satin);
    }
    const equipment=add(g,box(w-1.4,h-1,6,M.satin),0,h/2,-1.8);equipment.rotation.x=-.31;
    const front=add(g,mesh(new THREE.PlaneGeometry(w-1.5,h-1),M.rackFace),0,h/2,1.35);front.rotation.x=-.31;
    g.userData.productSpec={model:'GFW-DESKTOPRK-12U',widthIn:w,depthIn:d,heightIn:h,budgetRow:'FUR-051'};return g;
  };
  const oldChair=B.chair;
  B.chair=el=>c.createBudgetDeskChairEntry?.({catalogId:el.catalogId||'CHAIR-RENBERGET'},{THREE})?.group||oldChair(el);
  const oldArt=B.art;
  B.art=el=>{const g=oldArt(el);g.traverse(o=>{if(o.isMesh&&(o.material===M.brass||o.material===M.brassDark))o.material=M.satin;});return g;};
  const oldPlant=B.plant;
  B.plant=el=>{
    const g=oldPlant(el);g.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(g);
    const height=(bounds.max.y-bounds.min.y)/IN;g.scale.y*=57/height;
    g.traverse(o=>{if(o.isInstancedMesh&&o.count>40)o.count=42;});
    const pot=g.children[0];if(pot){pot.scale.x=pot.scale.z=9.5/19.6;pot.material=new THREE.MeshStandardMaterial({color:0x757772,roughness:.92});}
    const soil=g.children[1];if(soil)soil.scale.x=soil.scale.z=9.5/19.6;
    g.userData.productSpec={model:'IKEA FEJKA 80568890 / NYPON 00395624',heightIn:57,potWidthIn:9.5};return g;
  };
  B['empty-hanger']=el=>{
    const g=inch(),p=wallNormal(el.x,el.z);g.position.set((p.p[0]+p.n[0]*3.4)*IN,el.y*IN,(p.p[1]+p.n[1]*3.4)*IN);
    g.rotation.y=Math.atan2(p.n[0],p.n[1]);g.userData.noPlace=true;
    add(g,rbox(2.4,5,.8,.2,M.walnut),0,-.6,-3);rod(g,[0,0,-2.6],[0,0,-.6],.28,M.satin);
    for(const side of [-1,1])rod(g,[side*1.1,0,-.6],[side*1.1,.7,1.2],.28,M.rubber);
    return g;
  };
  B.shelf=el=>{
    const g=inch(),L=el.d,D=el.w;
    add(g,box(L,el.h,D,M.lacquer),0,0,0);
    add(g,box(L-1,.22,.4,M.led),0,-el.h/2-.15,D/2-.6);
    for(const [x,kind] of [[-14,'wine'],[-5,'decanter'],[5,'square'],[15,'wine']])
      add(g,lathe(bottle(kind),M.bottle,24),x,el.h/2,0);
    g.userData.budgetRow='FUR-021 / FUR-074';return g;
  };
  B.decor=()=>{
    const g=inch();g.userData.lights=[];
    add(g,cyl(6,.3,M.brassDark,48),0,.15,0);
    add(g,lathe(bottle('decanter'),M.bottle,24),-2,.3,-1);
    for(const x of [1.5,4])add(g,lathe([[0,0],[1,0],[1,3],[.85,3],[.85,.2],[0,.2]],M.bottle,24),x,.3,1.2);
    for(const [x,z,h] of [[-8,2,8],[-8,-2,10]]){
      add(g,cyl(1,.35,M.brassDark,24),x,.175,z);
      add(g,cyl(.42,h,M.satin,16),x,h/2+.35,z);
      add(g,mesh(new THREE.SphereGeometry(.14,10,8),M.candle),x,h+.48,z);
    }
    return g;
  };
  return BUDGET_ROOM_SPEC;
}
