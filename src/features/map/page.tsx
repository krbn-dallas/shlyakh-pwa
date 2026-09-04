import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { usePageEnter } from '../../shared/lib/usePageEnter';
import { useStore } from '../../app/store';
import { fetchRoute } from '../../shared/lib/osrm';
import { haversine, estimateWalk } from '../../shared/lib/haversine';

// fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const cityCenter:Record<string,[number,number]>={kyiv:[50.45,30.523], chisinau:[47.014,28.835], marrakech:[31.63,-7.99]};

export function MapPage(){
  const ref=usePageEnter() as any;
  const {city, lang}=useStore();
  const [pois,setPois]=useState<any[]>([]);
  const [routes,setRoutes]=useState<any[]>([]);
  const [filter,setFilter]=useState<string>('all');
  const [selectedRoute,setSelectedRoute]=useState<any>(null);
  const [routeGeom,setRouteGeom]=useState<any>(null);
  const [routeInfo,setRouteInfo]=useState<{distance:number,minutes:number}|null>(null);
  const [safety,setSafety]=useState<any[]>([]);

  useEffect(()=>{ fetch('/data/poi.json').then(r=>r.json()).then(setPois).catch(()=>{}); fetch('/data/routes.json').then(r=>r.json()).then(setRoutes).catch(()=>{}); fetch('/data/safety.json').then(r=>r.json()).then(setSafety).catch(()=>{}); },[]);
  const filtered = pois.filter(p=>p.city===city && (filter==='all' || p.cat===filter || (filter==='warn'&&false)));

  useEffect(()=>{
    if(!selectedRoute) { setRouteGeom(null); setRouteInfo(null); return; }
    const stops=selectedRoute.stops.map((s:any)=> pois.find(p=>p.id===s.poi)).filter(Boolean);
    if(stops.length<2) return;
    const coords: [number,number][] = stops.map((p:any)=>[p.lon,p.lat] as [number,number]);
    fetchRoute(coords, 'foot').then(res=>{
      if(res?.geometry?.coordinates){
        const latlngs = res.geometry.coordinates.map((c:any)=>[c[1],c[0]] as [number,number]);
        setRouteGeom(latlngs);
        setRouteInfo({distance:res.distance, minutes:Math.round(res.duration/60)});
      } else {
        // fallback haversine
        let dist=0;
        for(let i=1;i<stops.length;i++){ dist+= haversine(stops[i-1].lat,stops[i-1].lon, stops[i].lat,stops[i].lon); }
        const est=estimateWalk(dist);
        const latlngs = stops.map((p:any)=>[p.lat,p.lon] as [number,number]);
        setRouteGeom(latlngs);
        setRouteInfo({distance:est.distance, minutes:est.minutes});
      }
    });
  },[selectedRoute, pois]);

  const unsafe = safety.filter(s=>s.city===city);

  return (
    <div ref={ref} style={{margin:-16}}>
      <div style={{padding:'12px 16px', display:'flex',gap:8,overflowX:'auto'}}>
        {[
          ['all','Места'],['sight','Памятки'],['food','Еда'],['shop','Шопінг'],['market','Ринки'],['transport','Транспорт']
        ].map(([k,l])=>(
          <button key={k} className={`chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>

      <div style={{height:380, position:'relative'}}>
        <MapContainer key={city} center={cityCenter[city] as any} zoom={city==='marrakech'?14:15} style={{height:'100%', width:'100%'}}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map(p=>(
            <Marker key={p.id} position={[p.lat,p.lon]}>
              <Popup>
                <b>{p.name}</b><br/>{p.address||''}<br/>
                <button onClick={()=>{navigator.clipboard.writeText(p.address||p.name); alert('Скопійовано!');}} style={{marginTop:6,padding:'4px 8px',borderRadius:8,border:'1px solid #ccc'}}>Копіювати адресу</button>
              </Popup>
            </Marker>
          ))}
          {unsafe.map(z=> z.lat && <Circle key={z.id} center={[z.lat,z.lon]} radius={z.radiusM||300} pathOptions={{color:'var(--red)', fillColor:'var(--red)', fillOpacity:0.12, dashArray:'6 6'}}/>)}
          {routeGeom && <Polyline positions={routeGeom} pathOptions={{color:'#E3B341', weight:4, dashArray:'6 10', opacity:0.95}}/>}
        </MapContainer>
      </div>

      <div style={{padding:16, background:'var(--bg)'}}>
        {routeInfo && <div className="card" style={{marginBottom:12}}>Маршрут: {(routeInfo.distance/1000).toFixed(1)} км • {routeInfo.minutes} хв {routeGeom? '(OSRM)':'(оцінка)'}</div>}

        <div className="small muted" style={{fontWeight:700,marginBottom:8}}>Кураторські маршрути</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {routes.filter(r=>r.city===city).map(r=>(
            <button key={r.id} onClick={()=>setSelectedRoute(r)} className="card" style={{textAlign:'left',cursor:'pointer',borderColor: selectedRoute?.id===r.id? 'var(--gold)':'var(--line)'}}>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{fontSize:22}}>{r.emoji}</span>
                <span style={{fontWeight:700}}>{r.title[lang]||r.title.uk}</span>
                <span className="small" style={{marginLeft:'auto',background: r.kind==='short'?'var(--gold)':'var(--surface-2)',padding:'2px 8px',borderRadius:999}}>{r.kind==='short'?'короткий':'живописний'}</span>
              </div>
              <div className="small muted" style={{marginTop:4}}>{r.desc[lang]||r.desc.uk}</div>
              <div className="small muted">{r.stops.length} зупинок</div>
            </button>
          ))}
        </div>

        <div style={{marginTop:16}}>
          <div className="small muted" style={{fontWeight:700}}>Список місць</div>
          {filtered.map(p=>(
            <div key={p.id} className="card" style={{marginTop:8,display:'flex',gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700}}>{p.name}</div>
                <div className="small muted">{p.cat} • {p.address||''}</div>
              </div>
              <button className="chip" onClick={()=>{navigator.clipboard.writeText(p.address||p.name); alert('Скопійовано для таксиста!');}}>Копіювати</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
