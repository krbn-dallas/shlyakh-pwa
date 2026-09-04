import { useState } from 'react';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { load } from '@/shared/lib/data';
import { cityByCoord, getPosition } from '@/shared/lib/geo';
import { StepShell } from './shared';

export function StepGeo() {
  const { t } = useT();
  const setGeoAsked = useStore((s) => s.setGeoAsked);
  const setCity = useStore((s) => s.setCity);
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'denied'>('idle');

  const ask = async () => {
    setState('busy');
    try {
      const [pos, cities] = await Promise.all([getPosition(), load('cities')]);
      const found = cityByCoord(pos.coords.latitude, pos.coords.longitude, cities);
      if (found) setCity(found, false);
      setState('ok');
    } catch {
      setState('denied');
    }
    setGeoAsked(true);
  };

  return (
    <StepShell title={t('onb.geoTitle')} lead={t('onb.geoLead')}>
      <div className="card-flat zellige stack" style={{ gap: 'var(--s3)', alignItems: 'center', padding: 'var(--s6)' }}>
        <Icon name="locate" size={38} color="var(--gold)" />
        <div className="stack" style={{ gap: 6, width: '100%' }}>
          {[
            { icon: 'route', text: t('places.sortNear') },
            { icon: 'pin', text: t('settings.cityAuto') },
            { icon: 'lock', text: t('onb.geoLead').split('.').slice(-2)[0].trim() },
          ].map((r) => (
            <div key={r.icon} className="row small" style={{ gap: 10 }}>
              <Icon name={r.icon} size={13} color="var(--gold-deep)" />
              <span className="grow">{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {state === 'ok' && (
        <div className="row small" style={{ gap: 8, color: 'var(--ok)' }}>
          <Icon name="circle-check" size={14} /> {t('onb.geoOk')}
        </div>
      )}
      {state === 'denied' && (
        <div className="row small muted" style={{ gap: 8 }}>
          <Icon name="info" size={14} /> {t('onb.geoDenied')}
        </div>
      )}

      <div className="stack">
        <button className="btn btn-primary btn-lg btn-block" onClick={() => void ask()} disabled={state === 'busy' || state === 'ok'}>
          <Icon name={state === 'busy' ? 'spinner' : 'locate'} size={15} spin={state === 'busy'} />
          {t('onb.geoAllow')}
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => setGeoAsked(true)}>{t('onb.geoLater')}</button>
      </div>
    </StepShell>
  );
}
