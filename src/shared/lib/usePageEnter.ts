import { useEffect, useRef } from 'react';
import { pageEnter } from './gsap';
export function usePageEnter(){
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!ref.current) return;
    const clean=pageEnter(ref.current);
    return clean;
  },[]);
  return ref;
}
