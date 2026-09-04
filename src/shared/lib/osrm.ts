export async function fetchRoute(coords:[number,number][], profile='foot'): Promise<{distance:number,duration:number, geometry:any}|null>{
  // coords [lon,lat]
  if(coords.length<2) return null;
  const str=coords.map(c=>c.join(',')).join(';');
  const url=`https://routing.openstreetmap.de/routed-${profile}/route/v1/driving/${str}?overview=full&geometries=geojson`;
  try{
    const r=await fetch(url);
    if(!r.ok) throw new Error('osrm '+r.status);
    const j=await r.json();
    if(j.code!=='Ok' || !j.routes?.[0]) return null;
    return {distance:j.routes[0].distance, duration:j.routes[0].duration, geometry:j.routes[0].geometry};
  }catch{ return null; }
}
