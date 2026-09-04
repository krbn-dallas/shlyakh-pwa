import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';
import { useStore, PRIMARY_CITIES } from '@/app/store';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';

export function CitySwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, t } = useT();
  const { data: cities } = useData('cities');
  const city = useStore((s) => s.city);
  const cityManual = useStore((s) => s.cityManual);
  const setCity = useStore((s) => s.setCity);
  const clearManual = useStore((s) => s.clearCityManual);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const primaries = (cities ?? []).filter((c) => PRIMARY_CITIES.includes(c.id));
  const current = primaries.find((c) => c.id === city) ?? primaries[0];

  if (!compact) {
    return (
      <div className="wrap">
        {primaries.map((c) => (
          <button
            key={c.id}
            className={`chip ${c.id === city ? 'active' : ''}`}
            onClick={() => setCity(c.id, true)}
          >
            <span aria-hidden>{c.flag}</span> {tr(c.name, lang)}
          </button>
        ))}
        {cityManual && (
          <button className="chip" onClick={clearManual} title={t('settings.cityAuto')}>
            <Icon name="locate" size={12} /> {t('settings.cityAuto')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="chip" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="listbox">
        <span aria-hidden>{current?.flag ?? '·'}</span>
        <span>{current ? tr(current.name, lang) : '—'}</span>
        <Icon name="chevron-down" size={10} />
      </button>
      {open && (
        <div role="listbox" className="fade-up" style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 190,
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 'var(--r-ctl)', boxShadow: 'var(--shadow-lg)',
          padding: 6, zIndex: 'var(--z-sheet)',
        }}>
          {primaries.map((c) => (
            <button
              key={c.id}
              role="option"
              aria-selected={c.id === city}
              onClick={() => { setCity(c.id, true); setOpen(false); }}
              className="row"
              style={{
                width: '100%', gap: 10, padding: '10px 12px', border: 0, borderRadius: 8,
                background: c.id === city ? 'var(--surface-2)' : 'transparent',
                fontWeight: c.id === city ? 800 : 600, fontSize: 14, cursor: 'pointer',
                minHeight: 'var(--tap)', textAlign: 'left',
              }}
            >
              <span aria-hidden>{c.flag}</span>
              <span className="grow">{tr(c.name, lang)}</span>
              {c.id === city && <Icon name="check" size={12} color="var(--ok)" />}
            </button>
          ))}
          {cityManual && (
            <>
              <hr className="divider" style={{ margin: '6px 0' }} />
              <button
                onClick={() => { clearManual(); setOpen(false); }}
                className="row tiny muted"
                style={{ width: '100%', gap: 8, padding: '10px 12px', border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
              >
                <Icon name="locate" size={12} /> {t('settings.cityAuto')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
