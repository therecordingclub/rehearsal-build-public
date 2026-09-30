// Published overall envelope; procedural body follows IKEA's product photography.
export const BUDGET_DESK_CHAIR_SPEC=Object.freeze({
  catalogId:'CHAIR-RENBERGET',product:'IKEA RENBERGET · Bomstad black',model:'406.110.94',
  sourceUrl:'https://www.ikea.com/us/en/p/renberget-swivel-chair-bomstad-black-40611094/',
  widthIn:26.375,depthIn:26.375,heightIn:41.5,seatHeightIn:19.5,
  publishedHeightRangeIn:[39.375,43.75],publishedSeatHeightRangeIn:[17.375,21.625],
  materials:'Black coated fabric and textile, black steel frame and polypropylene arms',
  representation:'Procedural approximation from published envelope and IKEA photography',
  budgetRow:'FUR-085'
});

export function createBudgetDeskChairEntry(item,{THREE}={}){
  if(item?.catalogId!=='CHAIR-RENBERGET')return null;
  const spec=BUDGET_DESK_CHAIR_SPEC,group=new THREE.Group(),body=new THREE.Group();
  group.name='RENBERGET-pose-root';body.scale.setScalar(1/12);group.add(body);
  const frame=new THREE.MeshStandardMaterial({color:0x090a0b,roughness:.4,metalness:.45});
  const leather=new THREE.MeshPhysicalMaterial({color:0x161717,roughness:.69,clearcoat:.13});
  const cloth=new THREE.MeshStandardMaterial({color:0x111212,roughness:.96});
  const thread=new THREE.MeshStandardMaterial({color:0x242525,roughness:1});
  const rubber=new THREE.MeshStandardMaterial({color:0x080808,roughness:.93});
  const add=(geometry,material,x,y,z,part)=>{
    const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);
    m.castShadow=m.receiveShadow=true;m.userData.productPart=part;body.add(m);return m;
  };
  const rod=(a,b,r,material,part)=>{
    const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);
    const m=add(new THREE.CylinderGeometry(r,r,d.length(),12),material,...va.clone().add(vb).multiplyScalar(.5).toArray(),part);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;
  };
  const rounded=(w,h,d,r,material,x,y,z,part)=>{
    const s=new THREE.Shape(),a=-w/2,b=-h/2;
    s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);
    s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);
    s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);
    s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
    const geo=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.12,bevelThickness:.12,bevelSegments:2,steps:1,curveSegments:12});
    geo.translate(0,0,-d/2);return add(geo,material,x,y,z,part);
  };
  const seat=rounded(18.875,16.875,2,2.1,leather,0,18.5,1,'padded-black-seat');seat.rotation.x=-Math.PI/2;
  const inset=rounded(14.8,11.7,.05,1,cloth,0,19.51,-.3,'textile-seat-center');inset.rotation.x=-Math.PI/2;
  const back=rounded(18.5,21.6,1.8,1.7,leather,0,30.55,-7.8,'high-black-back');back.rotation.x=-.075;
  const panel=rounded(17.3,14.5,.06,.8,cloth,0,27.1,-6.67,'quilted-back-panel');panel.rotation.x=-.075;
  for(let x=-6;x<=6;x+=3){
    rod([x-1.5,21.4,-6.06],[x+1.5,24.4,-6.28],.022,thread,'black-quilt-stitch');
    rod([x+1.5,24.4,-6.28],[x-1.5,27.4,-6.51],.022,thread,'black-quilt-stitch');
    rod([x-1.5,27.4,-6.51],[x+1.5,30.4,-6.74],.022,thread,'black-quilt-stitch');
    rod([x+1.5,30.4,-6.74],[x-1.5,33.4,-6.96],.022,thread,'black-quilt-stitch');
  }
  for(const side of [-1,1]){
    const x=side*11.1;
    rod([x,19,-6],[x,27,-6],.45,frame,'arm-rear');
    rod([x,27,-6],[x,27,6],.5,frame,'arm-top');
    rod([x,27,6],[x,20,6],.45,frame,'arm-front');
    rod([x,20,6],[x,19,-6],.45,frame,'arm-bottom');
  }
  add(new THREE.BoxGeometry(9,1.2,8),frame,0,16.9,0,'underseat-mechanism');
  rod([0,4,0],[0,16.9,0],.86,frame,'gas-lift');
  rod([6,16.7,0],[10.5,16.7,2],.23,frame,'height-lever');
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5,x=Math.cos(a)*11.5,z=Math.sin(a)*11.5;
    rod([0,4,0],[x,2.9,z],.58,frame,'five-star-leg');
    const wheel=add(new THREE.CylinderGeometry(1.15,1.15,1.75,16),rubber,x,1.15,z,'twin-caster');
    wheel.rotation.z=Math.PI/2;wheel.rotation.y=-a;
  }
  // Manufacturer gives a single circular footprint; keep that outer envelope.
  body.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(body),size=bounds.getSize(new THREE.Vector3());
  const sx=spec.widthIn/(size.x*12),sz=spec.depthIn/(size.z*12),sy=spec.heightIn/(size.y*12);
  body.scale.set(sx/12,sy/12,sz/12);body.position.y=-bounds.min.y*sy;
  group.userData.productSpec=spec;body.userData.productSpec=spec;
  let disposed=false;
  return {group,width:spec.widthIn/12,depth:spec.depthIn/12,key:spec.catalogId+':'+spec.model,dispose(){
    if(disposed)return;disposed=true;const gs=new Set(),ms=new Set();
    group.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>ms.add(m));});
    gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());
  }};
}
