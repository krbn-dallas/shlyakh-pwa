import { usePageEnter } from '../../shared/lib/usePageEnter';
import { useEffect, useState } from 'react';
import { useStore } from '../../app/store';
import { ProgressRing } from '../../shared/ui/ProgressRing';

export function ChecklistPage(){
  const ref=usePageEnter() as any;
  const [sections,setSections]=useState<any[]>([]);
  const {checklist, toggleCheck, customCheck, addCustom, resetCheck, lang}=useStore();
  const [open,setOpen]=useState<string>('docs');
  const [customText,setCustomText]=useState('');
  useEffect(()=>{ fetch('/data/checklist.json').then(r=>r.json()).then(setSections).catch(()=>{});},[]);
  const total = sections.reduce((a,s)=>a+s.items.length,0) + customCheck.length;
  const done = sections.reduce((a,s)=>a+s.items.filter((it:any)=>checklist[it.id]).length,0) + customCheck.filter(c=>checklist[c.id]).length;
  const progress = total? done/total : 0;

  return (
    <div ref={ref}>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <ProgressRing value={progress} size={56}/>
        <div>
          <h2>Чек-листи</h2>
          <div className="small muted">{done} / {total} готово {progress===1 && '— 🎉 все зібрано!'}</div>
        </div>
        <button className="btn btn-ghost" style={{marginLeft:'auto',fontSize:12}} onClick={()=>{if(confirm('Скинути?')) resetCheck();}}>Скинути</button>
      </div>

      <div style={{height:8,background:'var(--surface-2)',borderRadius:999,overflow:'hidden',marginTop:12}}>
        <div style={{width:`${progress*100}%`,height:'100%',background:'var(--gold)',transition:'width 600ms ease'}}/>
      </div>

      <div style={{marginTop:16, display:'flex',flexDirection:'column',gap:10}}>
        {sections.map(sec=> {
          const secDone = sec.items.filter((it:any)=>checklist[it.id]).length;
          const secProg = sec.items.length? secDone/sec.items.length:0;
          const isOpen=open===sec.id;
          return (
            <div key={sec.id} className="card" style={{padding:0,overflow:'hidden'}}>
              <button onClick={()=>setOpen(isOpen?'':sec.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
                <span style={{fontSize:20}}>{sec.icon}</span>
                <span style={{fontWeight:700}}>{sec.title[lang] || sec.title.uk}</span>
                <span className="small muted" style={{marginLeft:'auto'}}>{secDone}/{sec.items.length}</span>
                <div style={{width:32,height:32,flexShrink:0}}><ProgressRing value={secProg} size={28}/></div>
              </button>
              {isOpen && (
                <div style={{padding:'0 12px 12px', display:'flex',flexDirection:'column',gap:6}}>
                  {sec.items.map((it:any)=>(
                    <label key={it.id} style={{display:'flex',gap:10,alignItems:'center',padding:'10px 10px',background: checklist[it.id]? 'var(--surface-2)':'var(--surface)',border:'1px solid var(--line)',borderRadius:12,cursor:'pointer'}}>
                      <input type="checkbox" checked={!!checklist[it.id]} onChange={()=>toggleCheck(it.id)} style={{width:18,height:18,accentColor:'var(--red)'}}/>
                      <span style={{flex:1, textDecoration: checklist[it.id]?'line-through':''}}>{it.text[lang]||it.text.uk} {it.qty && <span className="small muted">— {it.qty}</span>}</span>
                      {it.critical && <span style={{width:8,height:8,borderRadius:'50%',background:'var(--red)',flexShrink:0}} title="критично"/>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {customCheck.length>0 && (
        <div className="card" style={{marginTop:12}}>
          <div style={{fontWeight:700,marginBottom:8}}>Своє</div>
          {customCheck.map(c=>(
            <label key={c.id} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0'}}>
              <input type="checkbox" checked={!!checklist[c.id]} onChange={()=>toggleCheck(c.id)}/>
              <span>{c.text}</span>
            </label>
          ))}
        </div>
      )}

      <div className="card" style={{marginTop:12,display:'flex',gap:8}}>
        <input value={customText} onChange={e=>setCustomText(e.target.value)} placeholder="Додати своє..." style={{flex:1,padding:'10px 12px',borderRadius:12,border:'1px solid var(--line)',background:'var(--surface)'}}/>
        <button className="btn btn-gold" onClick={()=>{ if(!customText.trim()) return; addCustom(customText.trim()); setCustomText('');}}> + </button>
      </div>
    </div>
  );
}
