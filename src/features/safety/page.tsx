import { usePageEnter } from '../../shared/lib/usePageEnter';
import { useEffect, useState } from 'react';
import { useStore } from '../../app/store';

export function SafetyPage(){
  const ref=usePageEnter() as any;
  const {city,lang}=useStore();
  const [zones,setZones]=useState<any[]>([]);
  useEffect(()=>{ fetch('/data/safety.json').then(r=>r.json()).then(setZones).catch(()=>{});},[]);
  const list=zones.filter(z=>z.city===city);
  return (
    <div ref={ref}>
      <h2>Безпека</h2>
      <div className="card" style={{marginTop:10,display:'flex',gap:12,alignItems:'center'}}>
        <span style={{width:12,height:12,borderRadius:'50%',background:'var(--warn)'}}/> обережно
        <span style={{width:12,height:12,borderRadius:'50%',background:'var(--danger)',marginLeft:12}}/> уникати
      </div>
      {list.map(z=>(
        <div key={z.id} className="card" style={{marginTop:10, borderLeft:`4px solid ${z.level==='avoid'?'var(--danger)':'var(--warn)'}`}}>
          <div style={{fontWeight:700}}>{z.title[lang]||z.title.uk}</div>
          <div className="small muted" style={{marginTop:4}}>{z.why[lang]||z.why.uk}</div>
          <ul style={{margin:'8px 0 0',paddingLeft:18,fontSize:13}}>
            {z.tips.map((t:any,i:number)=><li key={i}>{t[lang]||t.uk}</li>)}
          </ul>
        </div>
      ))}
      <div className="card" style={{marginTop:12,background:'var(--surface-2)'}}>
        <div style={{fontWeight:700}}>Типові розводи в Марракеші</div>
        <ul style={{fontSize:13,lineHeight:1.6,margin:'6px 0 0',paddingLeft:18}}>
          <li>Фейкові гіди — «покажу дорогу» → вимагають гроші</li>
          <li>«Безкоштовні» браслети/хна — потім тиск</li>
          <li>Завищення цін у суках ×3 — торгуйся від 40-50%</li>
          <li>Фото з кобрами/мавпами без домовленої ціни</li>
        </ul>
      </div>
      <div className="small muted" style={{marginTop:10}}>Дисклеймер: рекомендаційний характер. Перевіряй офіційні джерела.</div>
    </div>
  );
}
