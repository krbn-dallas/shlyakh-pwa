import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../widgets/Header';
import { TabBar } from '../widgets/TabBar';
import { SosFab } from '../widgets/SosFab';
import { OfflineBadge } from '../widgets/OfflineBadge';
import { useEffect } from 'react';
import { useStore } from './store';
import { cityByCoord } from '../shared/lib/geo';

export function AppLayout(){
  const {cityManual, setCity, onboarded} = useStore();
  const nav=useNavigate();
  useEffect(()=>{ if(!onboarded) nav('/onboarding'); },[onboarded, nav]);
  useEffect(()=>{
    if(cityManual) return;
    if(!navigator.geolocation) return;
    const id=setTimeout(()=>{
      navigator.geolocation.getCurrentPosition(pos=>{
        const c=cityByCoord(pos.coords.latitude, pos.coords.longitude);
        if(c) setCity(c,false);
      }, ()=>{}, {enableHighAccuracy:false, timeout:5000, maximumAge:600000});
    }, 800);
    return()=>clearTimeout(id);
  },[cityManual, setCity]);
  return (
    <div style={{minHeight:'100dvh', background:'var(--bg)', paddingBottom:72}}>
      <Header/>
      <OfflineBadge/>
      <main className="container" style={{paddingTop:16, paddingBottom:16}}>
        <Outlet/>
      </main>
      <SosFab/>
      <TabBar/>
    </div>
  );
}
