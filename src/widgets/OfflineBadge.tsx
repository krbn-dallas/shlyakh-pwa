import { useEffect,useState } from 'react';
export function OfflineBadge(){
  const [offline,setOffline]=useState(!navigator.onLine);
  useEffect(()=>{
    const on=()=>setOffline(!navigator.onLine);
    window.addEventListener('online',on); window.addEventListener('offline',on);
    return()=>{window.removeEventListener('online',on); window.removeEventListener('offline',on);}
  },[]);
  if(!offline) return null;
  return <div style={{background:'var(--gold)',color:'var(--on-gold)',textAlign:'center',padding:'6px 12px',fontSize:12,fontWeight:700}}>● офлайн-режим — карти та OSRM обмежені, SOS і чек-листи працюють</div>;
}
