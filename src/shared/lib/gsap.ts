import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export const pageEnter=(root:HTMLElement)=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    root.style.opacity='1';
    return ()=>{};
  }
  const ctx=gsap.context(()=>{
    gsap.fromTo(root,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.48,ease:"expo.out"});
    gsap.from("[data-stagger] > *",{autoAlpha:0,y:18,stagger:.05,duration:.5,ease:"expo.out",delay:.08});
  },root);
  return()=>ctx.revert();
};

export {gsap, ScrollTrigger};
