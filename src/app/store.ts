import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme='light'|'dark'|'system';
export type Lang='uk'|'ru';
export type CityId='kyiv'|'chisinau'|'marrakech';

interface State{
  theme: Theme;
  lang: Lang;
  city: CityId;
  cityManual: boolean;
  departure: string; // ISO date YYYY-MM-DD
  onboarded: boolean;
  checklist: Record<string, boolean>;
  customCheck: {id:string,text:string}[];
  setTheme:(t:Theme)=>void;
  setLang:(l:Lang)=>void;
  setCity:(c:CityId, manual?:boolean)=>void;
  setDeparture:(d:string)=>void;
  setOnboarded:(v:boolean)=>void;
  toggleCheck:(id:string)=>void;
  addCustom:(text:string)=>void;
  resetCheck:()=>void;
}

const DEPARTURE_DEFAULT='2026-09-03';

export const useStore = create<State>()(persist((set, get)=>({
  theme: (localStorage.getItem('shlyakh.theme') as Theme) || 'light',
  lang: (localStorage.getItem('shlyakh.lang') as Lang) || 'uk',
  city: (localStorage.getItem('shlyakh.city') as CityId) || 'marrakech',
  cityManual: localStorage.getItem('shlyakh.cityManual')==='1',
  departure: localStorage.getItem('shlyakh.dates') || DEPARTURE_DEFAULT,
  onboarded: localStorage.getItem('shlyakh.onboarded')==='1',
  checklist: JSON.parse(localStorage.getItem('shlyakh.checklist')||'{}'),
  customCheck: JSON.parse(localStorage.getItem('shlyakh.check.custom')||'[]'),
  setTheme:(theme)=>{ localStorage.setItem('shlyakh.theme', theme); set({theme}); document.documentElement.setAttribute('data-theme', theme==='system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light') : theme); },
  setLang:(lang)=>{ localStorage.setItem('shlyakh.lang', lang); set({lang}); },
  setCity:(city, manual=false)=>{ localStorage.setItem('shlyakh.city', city); if(manual) localStorage.setItem('shlyakh.cityManual','1'); set({city, cityManual: manual || get().cityManual}); },
  setDeparture:(d)=>{ localStorage.setItem('shlyakh.dates', d); set({departure:d}); },
  setOnboarded:(v)=>{ localStorage.setItem('shlyakh.onboarded', v?'1':'0'); set({onboarded:v}); },
  toggleCheck:(id)=>{ const cur=get().checklist; const next={...cur, [id]:!cur[id]}; localStorage.setItem('shlyakh.checklist', JSON.stringify(next)); set({checklist:next}); },
  addCustom:(text)=>{ const id='custom-'+Date.now(); const next=[...get().customCheck,{id,text}]; localStorage.setItem('shlyakh.check.custom', JSON.stringify(next)); set({customCheck:next}); },
  resetCheck:()=>{ localStorage.removeItem('shlyakh.checklist'); localStorage.removeItem('shlyakh.check.custom'); set({checklist:{}, customCheck:[]}); },
}),{
  name:'shlyakh-store',
  partialize:(s)=>({theme:s.theme, lang:s.lang, city:s.city, departure:s.departure, onboarded:s.onboarded})
}));

// init theme
const initTheme = (localStorage.getItem('shlyakh.theme') as Theme) || 'light';
const resolved = initTheme==='system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light') : initTheme;
document.documentElement.setAttribute('data-theme', resolved);
