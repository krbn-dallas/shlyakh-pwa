/**
 * The Moroccan flag's pentagram (khatam) in the app's own palette: the star's
 * interlaced stroke on the brand red, on a gold field. Geometry is the standard
 * five-point interlaced star used on the flag, not a freehand drawing.
 */
export function Logo({ size = 28 }: { size?: number }) {
  const r = 42;                     // outer radius in the 100×100 viewBox
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (-90 + i * 72) * (Math.PI / 180);
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)] as const;
  });
  // Connect every second point — that is what makes the interlaced pentagram.
  const d = [0, 2, 4, 1, 3].map((i, n) => `${n ? 'L' : 'M'}${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flex: `0 0 ${size}px` }}>
      <circle cx="50" cy="50" r="50" fill="var(--red)" />
      <path
        d={d}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Wordmark used under ШЛЯХ — the dot is the brand's red. */
export function Wordmark() {
  return (
    <span className="tiny muted" style={{ display: 'block', letterSpacing: '.01em' }}>
      panfi<span style={{ color: 'var(--red)', fontWeight: 800 }}>.</span>love
    </span>
  );
}

/** A slowly breaking heart — used once, in the About block. */
export function BrokenHeart({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="broken heart" role="img"
      style={{ display: 'inline-block', verticalAlign: '-2px' }}>
      <title>broken heart</title>
      <defs>
        <clipPath id="bh-l"><rect x="0" y="0" width="12" height="24" /></clipPath>
        <clipPath id="bh-r"><rect x="12" y="0" width="12" height="24" /></clipPath>
      </defs>
      <g fill="var(--red)">
        <path clipPath="url(#bh-l)" d="M12 21s-8-4.9-8-10.4A4.6 4.6 0 0 1 12 7.6a4.6 4.6 0 0 1 8 3C20 16.1 12 21 12 21z">
          <animateTransform attributeName="transform" type="rotate"
            values="0 12 21; -7 12 21; 0 12 21" dur="3.2s" repeatCount="indefinite" />
        </path>
        <path clipPath="url(#bh-r)" d="M12 21s-8-4.9-8-10.4A4.6 4.6 0 0 1 12 7.6a4.6 4.6 0 0 1 8 3C20 16.1 12 21 12 21z">
          <animateTransform attributeName="transform" type="rotate"
            values="0 12 21; 7 12 21; 0 12 21" dur="3.2s" repeatCount="indefinite" />
        </path>
      </g>
      {/* the crack */}
      <path d="M12 7.6 10.6 11l2.6 1.9L11 16.4l1 4.6" fill="none"
        stroke="var(--bg)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
