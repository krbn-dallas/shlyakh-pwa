import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../app/store';

const slides=[
  {title:'Один маршрут — три країни', text:'Київ → Кишинів → Марракеш. Один додаток для всієї подорожі.', img:'/illustrations/hero-day.webp'},
  {title:'Працює без інтернету', text:'SOS, чек-листи, маршрут дня — завжди офлайн. Карта — з кешем.', img:'/illustrations/train.webp'},
  {title:'SOS завжди під рукою', text:'Червона кнопка SOS — до номера ≤ 2 тапи. Викликай одним дотиком.', img:'/illustrations/souk.webp'},
];

export function OnboardingPage(){
  const [idx,setIdx]=useState(0);
  const nav=useNavigate();
  const {setOnboarded}=useStore();
  const next=()=>{
    if(idx<slides.length-1) setIdx(idx+1);
    else { setOnboarded(true); nav('/'); }
  };
  const s=slides[idx];
  return (
    <div style={{minHeight:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column'}}>
      <div className="container" style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',paddingTop:32}}>
        <img src={s.img} alt="" style={{width:'100%',height:260,objectFit:'cover',borderRadius:16}}/>
        <h1 style={{marginTop:24,textAlign:'center'}}>{s.title}</h1>
        <p className="muted" style={{textAlign:'center',marginTop:8}}>{s.text}</p>
        <div style={{display:'flex',gap:6,justifyContent:'center',marginTop:16}}>
          {slides.map((_,i)=><span key={i} style={{width:8,height:8,borderRadius:'50%',background: i===idx?'var(--red)':'var(--line)'}}/>)}
        </div>
      </div>
      <div className="container" style={{paddingBottom:32,display:'flex',gap:8}}>
        <button className="btn btn-ghost" style={{flex:1}} onClick={()=>{ setOnboarded(true); nav('/');}}>Пропустити</button>
        <button className="btn btn-primary" style={{flex:1}} onClick={next}>{idx===slides.length-1?'Почати':'Далі'}</button>
      </div>
    </div>
  );
}
