import { useStore } from '../../app/store';
import { useTranslation } from 'react-i18next';
import { usePageEnter } from '../../shared/lib/usePageEnter';

export function SettingsPage(){
  const ref=usePageEnter() as any;
  const {theme,setTheme,lang,setLang,city,setCity,departure,setDeparture,resetCheck}=useStore();
  const {i18n}=useTranslation();
  const changeLang=(l:'uk'|'ru')=>{ setLang(l); i18n.changeLanguage(l); };
  return (
    <div ref={ref}>
      <h2>Налаштування</h2>

      <div className="card" style={{marginTop:12}}>
        <div style={{fontWeight:700}}>Тема</div>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          {['light','dark','system'].map(t=>(
            <button key={t} className={`chip ${theme===t?'active':''}`} onClick={()=>{ setTheme(t as any); const resolved=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t; document.documentElement.setAttribute('data-theme', resolved);}}>{t}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div style={{fontWeight:700}}>Мова</div>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className={`chip ${lang==='uk'?'active':''}`} onClick={()=>changeLang('uk')}>Українська</button>
          <button className={`chip ${lang==='ru'?'active':''}`} onClick={()=>changeLang('ru')}>Русский</button>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div style={{fontWeight:700}}>Місто</div>
        <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
          {(['kyiv','chisinau','marrakech'] as const).map(c=>(
            <button key={c} className={`chip ${city===c?'active':''}`} onClick={()=>setCity(c,true)}>{c}</button>
          ))}
        </div>
        <div className="small muted" style={{marginTop:6}}>Автовизначення працює, якщо не обрано вручну</div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div style={{fontWeight:700}}>Дата виїзду</div>
        <input type="date" value={departure} onChange={e=>setDeparture(e.target.value)} style={{marginTop:8,padding:'10px 12px',borderRadius:12,border:'1px solid var(--line)',width:'100%'}}/>
        <div className="small muted">Весь маршрут і countdown перерахуються автоматично</div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div style={{fontWeight:700}}>Курси валют (підказка)</div>
        <div className="small muted">1 € ≈ 46 ₴ / 19.5 MDL / 10.8 MAD — редагуй за потреби в коді data</div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <button className="btn btn-ghost" onClick={()=>{ if(confirm('Скинути чек-листи?')) resetCheck();}}>Скинути чек-листи</button>
        <button className="btn btn-ghost" style={{marginLeft:8}} onClick={()=>{ localStorage.clear(); location.reload();}}>Скинути все</button>
      </div>

      <div className="small muted" style={{marginTop:12}}>
        PWA: встановлюється через меню браузера «Додати на головний екран». OSM attribution: © OpenStreetMap contributors
      </div>
    </div>
  );
}
