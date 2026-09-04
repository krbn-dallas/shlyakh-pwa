import { Link } from 'react-router-dom';
import { usePageEnter } from '../../shared/lib/usePageEnter';

export function MorePage(){
  const ref=usePageEnter() as any;
  const links=[
    {to:'/poi', label:'Місця (каталог)', desc:'Пошук, фільтри, копіювати адресу'},
    {to:'/services', label:'Сервіси і транспорт', desc:'Таксі, аптеки, обмін'},
    {to:'/safety', label:'Безпека', desc:'Зони, розводи, правила'},
    {to:'/phrases', label:'Розмовник', desc:'12 фраз FR/AR/RO'},
    {to:'/settings', label:'Налаштування', desc:'Тема, мова, дата'},
    {to:'/map', label:'Карта і маршрути', desc:'OSM + кураторські стежки'},
  ];
  return (
    <div ref={ref}>
      <h2>Ще</h2>
      <div style={{display:'grid',gap:10,marginTop:12}}>
        {links.map(l=>(
          <Link key={l.to} to={l.to} className="card" style={{textDecoration:'none',color:'inherit',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontWeight:700}}>{l.label}</div><div className="small muted">{l.desc}</div></div>
            <span style={{color:'var(--muted)'}}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
