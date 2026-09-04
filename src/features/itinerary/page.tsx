import { usePageEnter } from '../../shared/lib/usePageEnter';
import { useEffect, useState } from 'react';
import { useStore } from '../../app/store';
import { Link } from 'react-router-dom';

const typeIcon:Record<string,string>={move:'→',sight:'◈',food:'☕',stay:'⌂',shop:'♦',rest:'○'};

export function ItineraryPage(){
  const ref=usePageEnter() as any;
  const [days,setDays]=useState<any[]>([]);
  const [active,setActive]=useState(0);
  const {departure}=useStore();
  useEffect(()=>{ fetch('/data/itinerary.json').then(r=>r.json()).then(d=>{setDays(d); const start=new Date(departure); const idx=Math.max(0,Math.min(d.length-1,Math.floor((Date.now()-start.getTime())/86400000))); setActive(idx); });},[departure]);
  if(!days.length) return <div ref={ref}>Завантаження...</div>;
  const day=days[active];
  const date=new Date(departure); date.setDate(date.getDate()+active);
  return (
    <div>
      <h2 style={{marginBottom:12}}>Маршрут</h2>
      <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:8,scrollSnapType:'x mandatory'}}>
        {days.map((d,i)=>(
          <button key={d.id} className={`chip ${i===active?'active':''}`} style={{scrollSnapAlign:'start',whiteSpace:'nowrap'}} onClick={()=>setActive(i)}>
            D{i+1} • {date.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'})}
          </button>
        ))}
      </div>
      <div className="card" style={{marginTop:12}}>
        <div className="small muted">{date.toLocaleDateString('uk-UA',{weekday:'long', day:'numeric', month:'long'})}</div>
        <h3>{day.title?.uk || day.title}</h3>
        {day.stay && <div className="small" style={{background:'var(--surface-2)',padding:'6px 10px',borderRadius:8,marginTop:6}}>Ночівля: {day.stay}</div>}
      </div>

      <div style={{position:'relative',marginTop:16,paddingLeft:24}}>
        <div style={{position:'absolute',left:9,top:8,bottom:8,width:0,borderLeft:'2px dashed var(--gold)'}}/>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {day.blocks.map((b:any,i:number)=>(
            <div key={i} className="card" style={{position:'relative',padding:12}}>
              <div style={{position:'absolute',left:-24,top:16,width:12,height:12,borderRadius:'50%',background:'var(--red)',border:'2px solid var(--bg)'}}/>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <span style={{fontWeight:800,color:'var(--gold)',fontFamily:'var(--font-display)'}}>{b.t}</span>
                <span style={{background:'var(--surface-2)',padding:'2px 8px',borderRadius:999,fontSize:11}}>{typeIcon[b.type]||'•'} {b.type}</span>
                {b.cost && <span style={{fontSize:11,background:'var(--gold)',color:'var(--on-gold)',padding:'2px 8px',borderRadius:999}}>{b.cost}</span>}
              </div>
              <div style={{fontWeight:700,marginTop:6}}>{b.title}</div>
              {b.detail && <div className="small muted">{b.detail}</div>}
            </div>
          ))}
        </div>
      </div>
      <Link to="/map" className="btn btn-gold" style={{marginTop:16,width:'100%'}}>Показати на карті</Link>
    </div>
  );
}
