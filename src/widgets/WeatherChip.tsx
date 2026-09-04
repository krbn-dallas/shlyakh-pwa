import { useEffect, useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';
import { useStore } from '@/app/store';
import { useData } from '@/shared/lib/data';
import { fetchWeather, weatherIcon, weatherLabel, type Weather } from '@/shared/lib/weather';

/** Sits where the theme toggle used to be — the theme now lives in Settings. */
export function WeatherChip() {
  const { t, lang } = useT();
  const city = useStore((s) => s.city);
  const { data: cities } = useData('cities');
  const [w, setW] = useState<Weather | null>(null);
  const [open, setOpen] = useState(false);

  const centre = cities?.find((c) => c.id === city)?.center;

  useEffect(() => {
    if (!centre) return;
    const ctrl = new AbortController();
    setW(null);
    fetchWeather(centre[0], centre[1], ctrl.signal)
      .then(setW)
      .catch(() => { /* offline or rate-limited — the chip just stays hidden */ });
    return () => ctrl.abort();
  }, [centre?.[0], centre?.[1]]);

  if (!w) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="chip"
        onClick={() => setOpen((o) => !o)}
        title={t('home.weather')}
        style={{ paddingInline: 10, gap: 5 }}
      >
        <Icon name={weatherIcon(w.code, w.isDay)} size={13} color="var(--gold-deep)" />
        <span className="num" style={{ fontWeight: 800 }}>{w.tempC}°</span>
      </button>

      {open && (
        <div className="card fade-up" style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 190,
          boxShadow: 'var(--shadow-lg)', zIndex: 'var(--z-sheet)', padding: 'var(--s3)',
        }}>
          <div className="row-between" style={{ marginBottom: 6 }}>
            <span className="small" style={{ fontWeight: 800 }}>{weatherLabel(w.code, lang)}</span>
            <Icon name={weatherIcon(w.code, w.isDay)} size={16} color="var(--gold-deep)" />
          </div>
          <div className="row" style={{ gap: 'var(--s4)' }}>
            <span className="num" style={{ fontSize: 26, fontWeight: 800 }}>{w.tempC}°</span>
            <span className="stack tiny muted" style={{ gap: 2 }}>
              <span>{lang === 'uk' ? 'відчувається' : 'feels like'} {w.feelsC}°</span>
              <span>↑ {w.maxC}°  ↓ {w.minC}°</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
