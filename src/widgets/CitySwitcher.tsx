import { useStore } from '../app/store';
export function CitySwitcher(){
  const {city,setCity}=useStore();
  const cities:[string,string][]=[['kyiv','🇺🇦 Київ'],['chisinau','🇲🇩 Кишинів'],['marrakech','🇲🇦 Марракеш']];
  return (
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      {cities.map(([id,label])=>(
        <button key={id} className={`chip ${city===id?'active':''}`} onClick={()=>setCity(id as any,true)}>{label}</button>
      ))}
    </div>
  );
}
