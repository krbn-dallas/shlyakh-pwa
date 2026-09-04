import { usePageEnter } from '../../shared/lib/usePageEnter';
import { useEffect, useState } from 'react';
import { useStore } from '../../app/store';

export function ServicesPage(){
  const ref=usePageEnter() as any;
  const {city,lang}=useStore();
  const [taxi,setTaxi]=useState<any[]>([]);
  const [pois,setPois]=useState<any[]>([]);
  useEffect(()=>{ fetch('/data/taxi.json').then(r=>r.json()).then(setTaxi).catch(()=>{}); fetch('/data/poi.json').then(r=>r.json()).then(setPois).catch(()=>{});},[]);
  const listTaxi=taxi.filter(t=>t.city===city);
  const pharmacies=pois.filter(p=>p.city===city && p.cat==='pharmacy');
  const exchanges=pois.filter(p=>p.city===city && p.cat==='exchange');
  return (
    <div ref={ref}>
      <h2>Сервіси та транспорт</h2>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <span className="chip active">{city==='kyiv'?'Київ':city==='chisinau'?'Кишинів':'Марракеш'}</span>
      </div>

      <h3 style={{marginTop:16}}>Таксі</h3>
      <div style={{display:'grid',gap:8,marginTop:8}}>
        {listTaxi.map(t=>(
          <div key={t.id} className="card" style={{display:'flex',gap:12,alignItems:'center'}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700}}>{t.name} <span className="small muted">({t.kind==='app'?'додаток':'телефон'})</span></div>
              {t.note && <div className="small muted">{t.note[lang]||t.note.uk}</div>}
            </div>
            {t.kind==='phone' ? <a href={`tel:${t.value}`} className="btn btn-gold" style={{padding:'8px 14px'}}>{t.value}</a> : <a href={t.value} target="_blank" rel="noreferrer" className="btn btn-ghost">Відкрити</a>}
          </div>
        ))}
      </div>
      <div className="card" style={{marginTop:10,background:'var(--surface-2)',fontSize:13}}>
        {city==='marrakech' && <>petit taxi: база 7 MAD, поїздка 20–30 MAD, подача 15 MAD. Лови на вулиці, домовляйся або лічильник. inDrive/Heetch — дешевше.</>}
        {city==='chisinau' && <>Маршрутки ~6 MDL, таксі короткі 14444/14222. Яндекс Go 14700.</>}
        {city==='kyiv' && <>Метро, Uklon/Bolt/Uber. OnTaxi 2000, Opti 579.</>}
      </div>

      <h3 style={{marginTop:16}}>Аптеки</h3>
      {pharmacies.map(p=> <div key={p.id} className="card" style={{marginTop:8}}><b>{p.name}</b><div className="small muted">{p.hours||''}</div></div>)}
      {pharmacies.length===0 && <div className="small muted">Немає даних — дивись на карті</div>}

      <h3 style={{marginTop:16}}>Обмінники</h3>
      {exchanges.map(p=> <div key={p.id} className="card" style={{marginTop:8}}><b>{p.name}</b><div className="small muted">{p.hours||''}</div></div>)}
      {exchanges.length===0 && <div className="small muted">—</div>}
    </div>
  );
}
