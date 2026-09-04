import { useEffect, useState } from 'react';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { geocode } from '@/shared/lib/geocode';
import type { CityId, Stay } from '@/shared/model/types';
import { StepShell } from './shared';

interface Preset extends Stay { city: CityId; }

/** Defaults taken from the trip research; both are editable. */
const PRESETS: Preset[] = [
  { city: 'chisinau', name: 'Hotel National Premium', address: 'Strada Alexandru cel Bun 115, Chișinău 2001, Moldova', lat: 47.018, lon: 28.842 },
  { city: 'marrakech', name: 'Riad Dar Anika', address: 'Derb Arjan 34, Bab Doukkala, Medina, Marrakech 40000, Morocco', lat: 31.633, lon: -7.995 },
];

const CITY_LABEL: Record<string, string> = { chisinau: 'Chișinău', marrakech: 'Марракеш' };

function StayCard({ city, preset }: { city: CityId; preset: Preset }) {
  const { t } = useT();
  const stay = useStore((s) => s.stays[city]);
  const setStay = useStore((s) => s.setStay);
  const [custom, setCustom] = useState(false);
  const [name, setName] = useState(stay?.name ?? '');
  const [address, setAddress] = useState(stay?.address ?? '');
  const [status, setStatus] = useState<'idle' | 'busy' | 'ok' | 'fail'>('idle');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const h = () => setOnline(navigator.onLine);
    window.addEventListener('online', h); window.addEventListener('offline', h);
    return () => { window.removeEventListener('online', h); window.removeEventListener('offline', h); };
  }, []);

  const usePreset = () => { setCustom(false); setStay(city, { ...preset }); };

  const saveCustom = async () => {
    if (!name && !address) return;
    // Save what we have first — a pin is a bonus, not a requirement.
    setStay(city, { name, address });
    if (!address || !online) return;
    setStatus('busy');
    try {
      const hits = await geocode(address);
      if (hits.length) { setStay(city, { name, address, lat: hits[0].lat, lon: hits[0].lon }); setStatus('ok'); }
      else setStatus('fail');
    } catch { setStatus('fail'); }
  };

  const isPreset = stay?.name === preset.name;

  return (
    <div className="card stack" style={{ gap: 'var(--s3)' }}>
      <div className="row-between">
        <h3 className="row" style={{ gap: 8 }}>
          <Icon name="bed" size={14} color="var(--gold-deep)" /> {CITY_LABEL[city] ?? city}
        </h3>
        {stay?.lat && <span className="badge badge-ok"><Icon name="pin" size={10} /> {t('onb.stayFound')}</span>}
      </div>

      <div className="row" style={{ gap: 'var(--s2)' }}>
        <button className={`chip ${isPreset && !custom ? 'active' : ''}`} onClick={usePreset}>
          {t('onb.stayPreset')}
        </button>
        <button className={`chip ${custom ? 'active' : ''}`} onClick={() => setCustom(true)}>
          {t('onb.stayCustom')}
        </button>
      </div>

      {!custom ? (
        <div className="card-flat stack" style={{ gap: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{preset.name}</span>
          <span className="tiny muted">{preset.address}</span>
        </div>
      ) : (
        <div className="stack" style={{ gap: 'var(--s3)' }}>
          <div className="field">
            <label htmlFor={`n-${city}`}>{t('onb.stayName')}</label>
            <input id={`n-${city}`} className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor={`a-${city}`}>{t('onb.stayAddress')}</label>
            <input id={`a-${city}`} className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <button className="btn btn-gold" onClick={() => void saveCustom()} disabled={status === 'busy' || (!name && !address)}>
            <Icon name={status === 'busy' ? 'spinner' : 'search'} size={13} spin={status === 'busy'} />
            {status === 'busy' ? t('onb.stayFinding') : t('onb.stayFind')}
          </button>
          {status === 'fail' && <span className="tiny muted">{t('onb.stayNotFound')}</span>}
          {!online && <span className="tiny muted"><Icon name="wifi" size={11} /> {t('onb.stayOfflineHint')}</span>}
        </div>
      )}
    </div>
  );
}

export function StepStay() {
  const { t } = useT();
  return (
    <StepShell title={t('onb.stayTitle')} lead={t('onb.stayLead')}>
      <div className="stack" style={{ gap: 'var(--s4)' }}>
        {PRESETS.map((p) => <StayCard key={p.city} city={p.city} preset={p} />)}
      </div>
    </StepShell>
  );
}
