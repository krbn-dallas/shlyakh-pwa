import { usePageEnter } from '../../shared/lib/usePageEnter';
import { useEffect, useState } from 'react';
import { useStore } from '../../app/store';

export function SosPage(){
  const ref=usePageEnter() as any;
  const {city, lang}=useStore();
  const [data,setData]=useState<any[]>([]);
  useEffect(()=>{ fetch('/data/emergency.json').then(r=>r.json()).then(setData).catch(()=>{});},[]);
  const list=data.filter(d=>d.city===city || d.city==='*');
  const kindIcon:Record<string,string>={police:'🛡️', medical:'✚', fire:'🔥', rescue:'🆘', tourist:'ℹ️', embassy:'🏛️'};
  return (
    <div ref={ref}>
      <div style={{background:'var(--red)',color:'var(--on-red)',borderRadius:16,padding:16,textAlign:'center'}}>
        <div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:800}}>Ти не один</div>
        <div className="small" style={{opacity:.9}}>Усі номери працюють офлайн — натисни, щоб зателефонувати</div>
      </div>

      <div style={{display:'grid',gap:10,marginTop:14}}>
        {list.map(e=>(
          <a key={e.id} href={e.tel ? `tel:${e.tel}` : undefined} style={{textDecoration:'none',color:'inherit'}} className="card">
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <div style={{width:44,height:44,borderRadius:12,background:'var(--surface-2)',display:'grid',placeItems:'center',fontSize:20}}>{kindIcon[e.kind]||'•'}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700}}>{e.title[lang]||e.title.uk}</div>
                {e.address && <div className="small muted">{e.address}</div>}
                {e.note && <div className="small muted">{e.note[lang]||e.note.uk}</div>}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'var(--font-display)',fontWeight:800,color:'var(--red)'}}>{e.number || e.tel}</div>
                <div className="tiny muted">тап щоб дзвонити</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="card" style={{marginTop:14, background:'var(--surface-2)'}}>
        <div style={{fontWeight:700}}>Якщо загубився — 4 кроки</div>
        <ol style={{margin:'8px 0 0',paddingLeft:18,fontSize:14,lineHeight:1.6}}>
          <li>Зупинись і заспокойся</li>
          <li>Знайди орієнтир — мечеть Кутубія видно здалеку</li>
          <li>Візьми petit taxi до готелю (покажи адресу)</li>
          <li>Подзвони в готель або на гарячу лінію</li>
        </ol>
      </div>
    </div>
  );
}
