import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function TabBar(){
  const {t}=useTranslation();
  const items=[
    {to:'/', label:t('nav_home'), icon:'⌂'},
    {to:'/itinerary', label:'Маршрут', icon:'◈'},
    {to:'/checklist', label:t('nav_check'), icon:'✓'},
    {to:'/more', label:t('nav_more'), icon:'⋯'},
  ];
  return (
    <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--surface)',borderTop:'1px solid var(--line)',display:'flex',justifyContent:'space-around',padding:'6px 0 calc(6px + env(safe-area-inset-bottom))',zIndex:20}}>
      {items.map(it=>(
        <NavLink key={it.to} to={it.to} style={({isActive})=>({textDecoration:'none',color:isActive?'var(--red)':'var(--muted)',display:'flex',flexDirection:'column',alignItems:'center',gap:2,minWidth:64,padding:'4px 8px',fontSize:11,fontWeight:700})}>
          <span style={{fontSize:18,lineHeight:1}}>{it.icon}</span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
