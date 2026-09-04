export function fmtDate(d:Date, lang:string){ return d.toLocaleDateString(lang==='uk'?'uk-UA':'ru-RU',{day:'numeric',month:'long'}); }
export function fmtMilesOrKm(m:number){ return m>=1000 ? (m/1000).toFixed(1)+' км' : Math.round(m)+' м'; }
export function fmtMAD(mad:number){ return mad+' MAD'; }
