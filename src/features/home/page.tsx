import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../app/store';
import { useTranslation } from 'react-i18next';
import { CitySwitcher } from '../../widgets/CitySwitcher';
import { usePageEnter } from '../../shared/lib/usePageEnter';

function Countdown({departure}:{departure:string}){
  const [,tick]=useState(0);
  useEffect(()=>{ const id=setInterval(()=>tick(v=>v+1),1000); return()=>clearInterval(id);},[]);
  const target=new Date(departure+'T00:00:00');
  const diff=Math.max(0, target.getTime()-Date.now());
  const d=Math.floor(diff/86400000), h=Math.floor(diff%86400000/3600000), m=Math.floor(diff%3600000/60000), s=Math.floor(diff%60000/1000);
  return <div style={{display:'flex',gap:8,justifyContent:'center'}}>
    {[['ДН',d],['ГОД',h],['ХВ',m],['СЕК',s]].map(([l,v])=>(
      <div key={l} style={{background:'var(--surface)',border:'1px solid var(--line)',borderRadius:12,padding:'10px 12px',minWidth:64,textAlign:'center'}}>
        <div style={{fontFamily:'var(--font-display)',fontSize:24,lineHeight:1,fontWeight:800}}>{String(v).padStart(2,'0')}</div>
        <div className="tiny muted">{l}</div>
      </div>
    ))}
  </div>;
}

export function HomePage(){
  const ref=usePageEnter();
  const {departure}=useStore();
  const {t}=useTranslation();
  const [itinerary,setItinerary]=useState<any[]>([]);
  useEffect(()=>{ fetch('/data/itinerary.json').then(r=>r.json()).then(setItinerary).catch(()=>{});},[]);
  // find today index
  const start=new Date(departure);
  const todayIdx=Math.max(0, Math.min(itinerary.length-1, Math.floor((Date.now()-start.getTime())/86400000)));
  const today=itinerary[todayIdx];
  return (
    <div ref={ref as any} data-stagger>
      <div className="card zellige" style={{textAlign:'center',padding:20}}>
        <div className="small muted" style={{letterSpacing:'.08em',fontWeight:700}}>{t('countdown')}</div>
        <h1 style={{margin:'6px 0 12px'}}>{departure.split('-').reverse().join('.')}</h1>
        <Countdown departure={departure}/>
        <div className="small muted" style={{marginTop:8}}>Київ → Chișinău → مراكش</div>
      </div>

      <div style={{marginTop:16}}>
        <div className="small muted" style={{marginBottom:8,fontWeight:700}}>Ти зараз у:</div>
        <CitySwitcher/>
      </div>

      {today && (
        <div className="card" style={{marginTop:16}}>
          <div className="small muted" style={{fontWeight:700}}>📌 {t('today')} — {today.title?.uk || today.title}</div>
          <h3 style={{marginTop:6}}>{today.title?.uk}</h3>
          <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:6}}>
            {today.blocks.slice(0,4).map((b:any,i:number)=><div key={i} style={{display:'flex',gap:10,alignItems:'center',fontSize:14}}><span style={{color:'var(--gold)',fontWeight:800}}>{b.t}</span><span>{b.title}</span></div>)}
          </div>
          <Link to="/itinerary" className="btn btn-ghost" style={{marginTop:12,width:'100%'}}>Відкрити маршрут →</Link>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:16}}>
        <Link to="/sos" className="btn btn-primary" style={{flexDirection:'column',padding:'14px 8px'}}>SOS</Link>
        <Link to="/checklist" className="btn btn-ghost" style={{flexDirection:'column'}}>Чек-листи</Link>
        <Link to="/map" className="btn btn-ghost" style={{flexDirection:'column'}}>Карта</Link>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:16}}>
        <div className="card">
          <div className="small muted">Валюта підказка</div>
          <div style={{fontSize:13,marginTop:6,lineHeight:1.5}}>1 € ≈ 46 ₴ / 19.5 MDL / 10.8 MAD<br/><span className="muted tiny">редагується в Налаштуваннях</span></div>
        </div>
        <div className="card">
          <div className="small muted">Порада дня</div>
          <div style={{fontSize:13,marginTop:6}}>У суках торгуйся ввічливо — це частина культури. Почни з 50% ціни.</div>
        </div>
      </div>

      <div className="card" style={{marginTop:16, display:'flex', gap:12, alignItems:'center'}}>
        <img src="/illustrations/hero-day.webp" alt="" style={{width:96,height:96,objectFit:'cover',borderRadius:12,flexShrink:0}}/>
        <div>
          <div style={{fontWeight:700}}>Сімейна подорож — 4 дні культури</div>
          <div className="small muted">Медина, сади Мажорель, Атлас та шопінг у Гелізі</div>
          <Link to="/itinerary" className="small" style={{color:'var(--red)',fontWeight:700}}>Детальний план →</Link>
        </div>
      </div>
    </div>
  );
}
