import { useStore } from '../app/store';
import { useTranslation } from 'react-i18next';

export function Header(){
  const {city, theme} = useStore();
  const {t} = useTranslation();
  const toggleTheme=()=>{
    const next = theme==='light'?'dark':'light';
    useStore.getState().setTheme(next as any);
    document.documentElement.setAttribute('data-theme', next);
  };
  const flag = city==='kyiv'?'🇺🇦':city==='chisinau'?'🇲🇩':'🇲🇦';
  return (
    <header style={{position:'sticky',top:0,zIndex:20,background:'var(--surface)',borderBottom:'1px solid var(--line)',padding:'10px 0'}}>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:'var(--red)',display:'grid',placeItems:'center',color:'var(--on-red)',fontWeight:800}}>✦</div>
          <div>
            <div style={{fontFamily:'var(--font-display)',fontWeight:800,lineHeight:1}}>ШЛЯХ</div>
            <div className="small muted" style={{lineHeight:1}}>Київ → Chișinău → مراكش</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="chip" style={{padding:'6px 10px'}}>{flag} {t(`city_${city}`)}</span>
          <button className="chip" onClick={toggleTheme} aria-label="theme">{theme==='dark'?'☀️':'🌙'}</button>
        </div>
      </div>
    </header>
  );
}
