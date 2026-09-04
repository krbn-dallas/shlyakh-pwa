export function ProgressRing({value, size=48}:{value:number,size?:number}){
  const r=18, c=2*Math.PI*r;
  const off=c*(1-value);
  return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx={22} cy={22} r={r} stroke="var(--line)" strokeWidth={4} fill="none"/>
      <circle cx={22} cy={22} r={r} stroke="var(--gold)" strokeWidth={4} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{transition:'stroke-dashoffset 600ms ease', transform:'rotate(-90deg)', transformOrigin:'50% 50%'}}/>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--ink)">{Math.round(value*100)}%</text>
    </svg>
  );
}
