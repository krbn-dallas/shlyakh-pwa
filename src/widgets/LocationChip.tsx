import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { Flag } from '@/shared/ui/Flag';
import { useT } from '@/shared/i18n';
import { useStore, PRIMARY_CITIES } from '@/app/store';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { getPosition } from '@/shared/lib/geo';
import { cachedPlace, resolvePlace, type Place } from '@/shared/lib/place';
import { fetchWeather, weatherIcon, weatherLabel, type Weather } from '@/shared/lib/weather';

const COUNTRY_FLAG: Record<string, string> = { ua: 'ua', md: 'md', ma: 'ma' };

/**
 * One chip: where you are and what it is doing outside there.
 *
 * The location is your real position — reverse-geocoded, so it says Ouarzazate
 * when you are in Ouarzazate rather than pinning you to one of three curated
 * cities. Weather is read at that exact point for the same reason. Tapping
 * opens the detail and lets you override the content city by hand.
 */
export function LocationChip() {
  const { t, lang } = useT();
  const { data: cities } = useData('cities');
  const city = useStore((s) => s.city);
  const cityManual = useStore((s) => s.cityManual);
  const setCity = useStore((s) => s.setCity);
  const clearManual = useStore((s) => s.clearCityManual);

  const [place, setPlace] = useState<Place | null>(() => cachedPlace());
  const [weather, setWeather] = useState<Weather | null>(null);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Locate once cities are loaded, then again whenever the user asks.
  const locate = async (signal?: AbortSignal) => {
    if (!cities) return;
    setLocating(true);
    try {
      const pos = await getPosition(8000);
      const p = await resolvePlace(pos.coords.latitude, pos.coords.longitude, cities, lang, signal);
      setPlace(p);
      // Only follow the position into a city we actually carry content for,
      // and never override a manual choice.
      if (p.cityId && !cityManual) setCity(p.cityId, false);
    } catch { /* denied, offline, or no fix — the cached place still shows */ }
    setLocating(false);
  };

  useEffect(() => {
    if (!cities) return;
    const ctrl = new AbortController();
    void locate(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities]);

  // Weather follows the real position; falls back to the content city's centre.
  useEffect(() => {
    const centre = cities?.find((c) => c.id === city)?.center;
    const lat = place?.lat ?? centre?.[0];
    const lon = place?.lon ?? centre?.[1];
    if (lat === undefined || lon === undefined) return;
    const ctrl = new AbortController();
    fetchWeather(lat, lon, ctrl.signal).then(setWeather).catch(() => { /* offline */ });
    return () => ctrl.abort();
  }, [place?.lat, place?.lon, cities, city]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const contentCity = cities?.find((c) => c.id === city);
  const flagCode = place?.countryCode ?? (contentCity ? COUNTRY_FLAG[contentCity.country] : undefined);
  const label = place?.name ?? (contentCity ? tr(contentCity.name, lang) : '—');
  const primaries = (cities ?? []).filter((c) => PRIMARY_CITIES.includes(c.id));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="chip" onClick={() => setOpen((o) => !o)}
        aria-expanded={open} style={{ paddingInline: 10, gap: 7, maxWidth: 178 }}>
        <Flag code={flagCode} size={14} />
        <span className="truncate" style={{ maxWidth: 82 }}>{label}</span>
        {weather && (
          <>
            <span aria-hidden style={{ width: 1, height: 14, background: 'var(--line)' }} />
            <Icon name={weatherIcon(weather.code, weather.isDay)} size={12} color="var(--gold-deep)" />
            <span className="num" style={{ fontWeight: 800 }}>{weather.tempC}°</span>
          </>
        )}
      </button>

      {open && (
        <div className="card fade-up" style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 232,
          boxShadow: 'var(--shadow-lg)', zIndex: 'var(--z-sheet)', padding: 'var(--s3)',
        }}>
          <div className="row" style={{ gap: 'var(--s3)', alignItems: 'flex-start' }}>
            <Flag code={flagCode} size={20} />
            <span className="grow" style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 800 }}>{label}</span>
              {weather && (
                <span className="tiny muted">
                  {weatherLabel(weather.code, lang)} · {lang === 'uk' ? 'відчувається' : 'feels'} {weather.feelsC}°
                  {' · ↑'}{weather.maxC}° ↓{weather.minC}°
                </span>
              )}
            </span>
            {weather && (
              <span className="num" style={{ fontSize: 26, fontWeight: 800 }}>{weather.tempC}°</span>
            )}
          </div>

          <button className="chip" style={{ marginTop: 'var(--s3)' }}
            onClick={() => void locate()} disabled={locating}>
            <Icon name={locating ? 'spinner' : 'locate'} size={11} spin={locating} />
            {t('settings.cityAuto')}
          </button>

          <hr className="divider" style={{ margin: 'var(--s3) 0' }} />

          <span className="tiny muted" style={{ display: 'block', marginBottom: 6 }}>
            {t('settings.city')}
          </span>
          <div className="wrap">
            {primaries.map((c) => (
              <button key={c.id} className={`chip ${c.id === city ? 'active' : ''}`}
                onClick={() => { setCity(c.id, true); setOpen(false); }}>
                <Flag code={COUNTRY_FLAG[c.country]} size={12} /> {tr(c.name, lang)}
              </button>
            ))}
            {cityManual && (
              <button className="chip gold" onClick={() => { clearManual(); void locate(); }}>
                <Icon name="rotate" size={11} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
