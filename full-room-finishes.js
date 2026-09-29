/* Finishes for the approved concept; geometry and saved furniture poses stay independent. */
function applyPhotoFinishes() {
  const plaster = cnv(768,768,(q,w,h) => {
    q.fillStyle='#2b2725'; q.fillRect(0,0,w,h);
    noise(q,w,h,8,.24,[66,59,54],210);
    noise(q,w,h,25,.18,[15,13,12],211);
    noise(q,w,h,130,.1,[91,80,71],212);
  });
  M.plaster.map=T(plaster);
  M.plaster.normalMap=NM(plaster,1.25);
  M.plaster.normalScale.set(.28,.28);
  M.plaster.roughness=.95;
  M.plaster.envMapIntensity=.25;
  M.ceiling.color.setHex(0x08090b);
  M.brass.color.setHex(0x806c49);
  M.brass.roughness=.48;
  M.brass.envMapIntensity=.6;
  M.gloss.roughness=.18;
  M.gloss.clearcoatRoughness=.14;
  M.gloss.envMapIntensity=.65;
  M.floor.roughness=.8;
  M.floor.clearcoat=.08;
  M.floor.envMapIntensity=.4;
  M.lacquer.color.setHex(0x101114);
  M.lacquer.clearcoat=.18;
  M.lacquer.roughness=.48;
  M.slat.color.setHex(0x111215);
  M.led.color.setHex(0xffd0a0);
  M.led.emissive.setHex(0xffaa60);

  // Reuse the source's photographed weave without its baked border. A denser crop matches
  // the reference rug's room-scale pattern; the physical rug still keeps one inset border.
  const rugCanvas=cnv(1024,1024,(q,w,h)=>{q.fillStyle='#171617';q.fillRect(0,0,w,h);});
  const rugMap=T(rugCanvas);
  const rugImage=new Image();
  rugImage.onload=()=>{
    const q=rugCanvas.getContext('2d'),sw=rugImage.naturalWidth,sh=rugImage.naturalHeight;
    q.fillStyle='#171617';q.fillRect(0,0,1024,1024);
    for(let row=0;row<3;row++)for(let col=0;col<2;col++){
      q.drawImage(rugImage,24,20,sw-48,sh-40,col*512,row*342,512,342);
    }
    q.fillStyle='rgba(4,4,5,.42)';q.fillRect(0,0,1024,1024);
    q.strokeStyle='rgba(99,86,75,.5)';q.lineWidth=12;q.strokeRect(18,18,988,988);
    q.strokeStyle='rgba(36,33,32,.95)';q.lineWidth=5;q.strokeRect(34,34,956,956);
    rugMap.needsUpdate=true;shadowDirty=true;
  };
  rugImage.src=TEXIMG['lounge-rug'];
  const originalRug=B.rug;
  B.rug=function(el){
    if(el.id!=='L-01')return originalRug(el);
    const g=inch(),w=el.w,d=el.d;
    const mat=std({map:rugMap,color:0xb0aaab,roughness:1,normalMap:rep(CARPET.normal,w/10,d/10),
      normalScale:new THREE.Vector2(.42,.42),envMapIntensity:.12});
    const carpet=mesh(new THREE.PlaneGeometry(w,d),mat);carpet.rotation.x=-Math.PI/2;add(g,carpet,0,.42,0);
    for(const side of[-1,1]){
      add(g,box(w+.4,.42,.8,M.felt),0,.21,side*d/2);
      add(g,box(.8,.42,d,M.felt),side*w/2,.21,0);
    }
    return g;
  };

  const productSectional=B.sectional;
  B.sectional=function(el){
    const g=productSectional(el);
    g.traverse(o=>{
      const m=o.isMesh&&o.material;
      if(!m?.userData?.productUpholstery)return;
      m.color.setHex(0xc4cad6);m.roughness=Math.max(.93,m.roughness||0);
      m.emissive.setHex(0x07090d);m.emissiveIntensity=.12;
    });
    return g;
  };

  const productSwivel=B.swivel;
  B.swivel=function(el){
    const g=productSwivel(el);
    g.traverse(o=>{
      const m=o.isMesh&&o.material;
      if(!m?.isMeshPhysicalMaterial||m.metalness>.05||Math.max(m.color.r,m.color.g,m.color.b)>.12)return;
      m.color.setHex(0x0b0d12);m.roughness=Math.max(.78,m.roughness||0);
      m.emissive.setHex(0x040508);m.emissiveIntensity=.14;
    });
    return g;
  };
  B.table=function(el){
    const g=inch(),r=el.w/2,h=el.h;
    const glass=phys({color:0x080a0c,roughness:.2,metalness:.05,
      clearcoat:.6,clearcoatRoughness:.16,envMapIntensity:.65});
    add(g,cyl(r,.5,glass,96),0,h-.25,0);
    const edge=mesh(new THREE.TorusGeometry(r-.06,.11,10,96),M.brassDark);
    edge.rotation.x=Math.PI/2;add(g,edge,0,h-.3,0);
    const base=phys({color:0x07090b,roughness:.38,clearcoat:.15,envMapIntensity:.35});
    add(g,lathe([[0,0],[r*.47,0],[r*.49,.3],[r*.49,h-1],[r*.46,h-.65],[0,h-.65]],base,64));
    return g;
  };
  const originalDecor=B.decor;
  B.decor=function(el){
    const g=originalDecor(el);
    const bronze=std({color:0x423525,roughness:.55,metalness:.75,envMapIntensity:.5});
    g.traverse(o=>{if(o.isMesh&&o.material===M.brass)o.material=bronze;});
    return g;
  };
  const originalStool=B.stool,originalBench=B.bench;
  function blackSeat(fn,el){
    const g=fn(el);
    g.traverse(o=>{
      if(o.isMesh&&o.material?.normalMap&&o.material!==M.leatherBlk){
        const m=o.material.clone();m.color.setHex(0x090a0c);m.roughness=.78;
        m.normalScale.set(.08,.08);m.envMapIntensity=.12;
        m.emissive.setHex(0x040508);m.emissiveIntensity=.14;
        if('clearcoat' in m){m.clearcoat=.04;m.clearcoatRoughness=.8;}
        o.material=m;
      }
    });
    return g;
  }
  B.stool=el=>blackSeat(originalStool,el);
  B.bench=el=>blackSeat(originalBench,el);

  // Keep the real planar room reflection dominant; the crack map supplies restrained gold veining only.
  reflUniforms.tint.value.setRGB(.53,.49,.45);
  M.archMirror.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,reflUniforms);
    sh.vertexShader='uniform mat4 texMat;\nvarying vec4 vRefl;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvRefl=texMat*modelMatrix*vec4(transformed,1.0);');
    sh.fragmentShader='uniform sampler2D reflTex;uniform vec3 tint;uniform float veinK;\nvarying vec4 vRefl;\n'+sh.fragmentShader.replace('#include <envmap_fragment>',
      'vec3 crk=diffuseColor.rgb;float vein=smoothstep(.08,.48,dot(crk,vec3(.5,.4,.1)));vec2 ruv=vRefl.xy/vRefl.w+(crk.rg-.02)*.003;vec3 rf=texture2D(reflTex,ruv).rgb;outgoingLight=rf*tint*(1.0-.18*vein)+crk*vein*veinK;');
  };
  M.archMirror.customProgramCacheKey=()=> 'archMirror-photo-v2';
  M.archMirror.needsUpdate=true;

  // The source photograph has arch-shaped backing, with no rectangular black board above each head.
  B['mirror-arch']=function(el){
    const g=inch(), w=el.w,h=el.h,r=w/2;
    const arch=(R,bottom=0)=>{
      const s=new THREE.Shape();s.moveTo(-R,bottom);s.lineTo(-R,h-r);
      s.absarc(0,h-r,R,Math.PI,0,true);s.lineTo(R,bottom);s.closePath();return s;
    };
    const mg=new THREE.ShapeGeometry(arch(r),56);
    const uv=mg.attributes.uv,p=mg.attributes.position;
    for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+el.x)/26,p.getY(i)/26);
    const mm=add(g,mesh(mg,M.archMirror),0,0,1.6);
    mm.userData.keep=true;mm.userData.noShadow=true;archMeshes.push(mm);
    add(g,ext(arch(r+.5),.45,M.felt,0,56),0,0,.35);
    const ring=arch(r+.45);ring.holes.push(new THREE.Path(arch(r).getPoints(56).reverse()));
    add(g,ext(ring,.7,M.brass,0,56),0,0,.85);
    const halo=arch(r+.7);halo.holes.push(new THREE.Path(arch(r+.5).getPoints(56).reverse()));
    const hm=add(g,ext(halo,.16,M.led,0,56),0,0,.4);hm.userData.noShadow=true;
    const light=new THREE.PointLight(0xffac64,30,7,2);light.position.set(0,h*.62,9);
    g.add(light);g.userData.glow=light;return g;
  };
}
