interface Props { value: number; size?: number; stroke?: number; label?: string; color?: string; }

export function ProgressRing({ value, size = 56, stroke = 5, label, color = 'var(--gold)' }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: `0 0 ${size}px` }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size / 4.2,
      }}>{label ?? `${Math.round(pct * 100)}%`}</span>
    </div>
  );
}
