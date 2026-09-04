import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';
import { useStore } from '@/app/store';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { cachedPlace } from '@/shared/lib/place';
import { todayMidnight } from '@/shared/lib/trip';

interface Photo { id: string; alt: string; by: string; link: string; medium: string; large: string }

/**
 * Tip of the day, illustrated with a real photograph of wherever you are —
 * fetched through our Pexels proxy, keyed on the place name, so it changes when
 * you move rather than showing the same drawing for the whole trip. Falls back
 * to text alone offline, which is still worth reading.
 */
export function TipCard() {
  const { t, lang } = useT();
  const city = useStore((s) => s.city);
  const { data: safety } = useData('safety');
  const { data: cities } = useData('cities');
  const [photo, setPhoto] = useState<Photo | null>(null);

  const place = cachedPlace();
  const cityName = cities?.find((c) => c.id === city);
  const query = place?.name || (cityName ? tr(cityName.name, lang) : 'morocco');

  // One tip per day, stable within the day, drawn from the safety advice we ship.
  const tip = useMemo(() => {
    const tips = (safety ?? []).flatMap((s) => s.tips);
    if (!tips.length) return null;
    const dayIndex = Math.floor(todayMidnight().getTime() / 86_400_000);
    return tips[dayIndex % tips.length];
  }, [safety]);

  useEffect(() => {
    if (!navigator.onLine || !query) return;
    const ctrl = new AbortController();
    fetch(`/api/photos?q=${encodeURIComponent(query)}&per=8`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { photos?: Photo[] } | null) => {
        const list = j?.photos ?? [];
        if (!list.length) return;
        // Rotate through the results by day so it is not the same shot daily.
        const dayIndex = Math.floor(todayMidnight().getTime() / 86_400_000);
        setPhoto(list[dayIndex % list.length]);
      })
      .catch(() => { /* offline or upstream down — text-only tip is fine */ });
    return () => ctrl.abort();
  }, [query]);

  if (!tip) return null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {photo && (
        <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--surface-2)' }}>
          <img
            src={photo.medium}
            srcSet={`${photo.medium} 640w, ${photo.large} 1280w`}
            sizes="(max-width: 560px) 100vw, 560px"
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgb(0 0 0/.62) 0%, rgb(0 0 0/.12) 45%, transparent 70%)',
          }} />
          <span className="row" style={{
            position: 'absolute', left: 'var(--s3)', bottom: 'var(--s2)', gap: 6,
            color: '#fff', fontSize: 12, fontWeight: 800, textShadow: '0 1px 3px rgb(0 0 0/.5)',
          }}>
            <Icon name="pin" size={11} /> {query}
          </span>
          <a
            href={photo.link}
            target="_blank"
            rel="noreferrer"
            className="tiny"
            style={{
              position: 'absolute', right: 'var(--s3)', bottom: 'var(--s2)',
              color: 'rgb(255 255 255/.7)', textDecoration: 'none',
            }}
          >
            {photo.by} / Pexels
          </a>
        </div>
      )}

      <div className="stack" style={{ gap: 6, padding: 'var(--s4)' }}>
        <span className="row tiny" style={{ gap: 8, fontWeight: 800, color: 'var(--gold-deep)' }}>
          <Icon name="tip" size={12} /> {t('home.tip')}
        </span>
        <span className="small">{tr(tip, lang)}</span>
      </div>
    </div>
  );
}
