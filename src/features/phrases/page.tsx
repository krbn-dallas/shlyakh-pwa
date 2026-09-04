import { usePageEnter } from '../../shared/lib/usePageEnter';
import { useEffect, useState } from 'react';

export function PhrasesPage(){
  const ref=usePageEnter() as any;
  const [phrases,setPhrases]=useState<any[]>([]);
  const [show,setShow]=useState<number|null>(null);
  useEffect(()=>{ fetch('/data/phrases.json').then(r=>r.json()).then(setPhrases).catch(()=>{});},[]);
  return (
    <div ref={ref}>
      <h2>Розмовник</h2>
      <div className="small muted">12 фраз — натисни «показати співрозмовнику»</div>
      <div style={{display:'grid',gap:10,marginTop:12}}>
        {phrases.map((p,i)=>(
          <div key={i} className="card">
            <div style={{fontWeight:700}}>{p.uk} <span className="small muted">/ {p.ru}</span></div>
            <div style={{display:'flex',gap:8,marginTop:6,flexWrap:'wrap'}}>
              <span className="chip">FR: {p.fr}</span>
              <span className="chip">AR: {p.ar}</span>
              <span className="chip">RO: {p.ro}</span>
            </div>
            <button className="btn btn-gold" style={{marginTop:8,width:'100%'}} onClick={()=>setShow(show===i?null:i)}>{show===i?'Сховати':'Показати співрозмовнику'}</button>
            {show===i && <div style={{marginTop:10,padding:16,background:'var(--surface-2)',borderRadius:12,textAlign:'center',fontSize:28,fontWeight:800}}>{p.fr}<br/><span style={{fontFamily:'var(--font-ar)',fontSize:24}}>{p.ar}</span></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
