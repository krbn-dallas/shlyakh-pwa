import { usePageEnter } from '../../shared/lib/usePageEnter';
import { useEffect, useState } from 'react';
import { useStore } from '../../app/store';

export function PoiPage(){
  const ref=usePageEnter() as any;
  const {city, lang}=useStore();
  const [pois,setPois]=useState<any[]>([]);
  const [q,setQ]=useState('');
  const [cat,setCat]=useState('all');
  useEffect(()=>{ fetch('/data/poi.json').then(r=>r.json()).then(setPois).catch(()=>{});},[]);
  const list=pois.filter(p=>p.city===city && (cat==='all'||p.cat===cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <div ref={ref}>
      <h2>Місця</h2>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Пошук..." style={{width:'100%',padding:'10px 12px',borderRadius:12,border:'1px solid var(--line)',marginTop:8}}/>
      <div style={{display:'flex',gap:8,overflowX:'auto',padding:'10px 0'}}>
        {['all','sight','food','shop','market','transport','stay','pharmacy','exchange'].map(c=>(
          <button key={c} className={`chip ${cat===c?'active':''}`} onClick={()=>setCat(c)}>{c}</button>
        ))}
      </div>
      {list.map(p=>(
        <div key={p.id} className="card" style={{marginTop:8}}>
          <div style={{fontWeight:700}}>{p.name}</div>
          <div className="small muted">{p.cat} • {p.hours||''} • {p.tags?.join(', ')}</div>
          {p.desc && <div className="small" style={{marginTop:4}}>{p.desc[lang]||p.desc.uk}</div>}
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="chip" onClick={()=>{navigator.clipboard.writeText(p.address||p.name); alert('Скопійовано!');}}>Копіювати адресу</button>
            <a className="chip" href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}`} target="_blank" rel="noreferrer">На карті</a>
          </div>
        </div>
      ))}
      {list.length===0 && <div className="muted small" style={{marginTop:12}}>Нічого не знайдено</div>}
    </div>
  );
}
