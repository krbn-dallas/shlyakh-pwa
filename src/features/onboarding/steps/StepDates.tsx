import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { parseDate, toISO, tripLength } from '@/shared/lib/trip';
import { StepShell } from './shared';

export function datesError(departure: string | null, ret: string | null): 'order' | 'long' | null {
  if (!departure || !ret) return null;
  const n = tripLength(departure, ret);
  if (n < 1) return 'order';
  if (n > 60) return 'long';
  return null;
}

export function StepDates() {
  const { t } = useT();
  const departure = useStore((s) => s.departure);
  const ret = useStore((s) => s.ret);
  const setDeparture = useStore((s) => s.setDeparture);
  const setReturn = useStore((s) => s.setReturn);

  const err = datesError(departure, ret);
  const days = departure && ret && !err ? tripLength(departure, ret) : null;

  // Default the return to departure + 5 (a six-day trip) the first time a date is picked.
  const onDeparture = (v: string) => {
    setDeparture(v || null);
    if (v && !ret) {
      const d = parseDate(v);
      d.setDate(d.getDate() + 5);
      setReturn(toISO(d));
    }
  };

  return (
    <StepShell title={t('onb.datesTitle')} lead={t('onb.datesLead')}>
      <div className="card stack" style={{ gap: 'var(--s4)' }}>
        <div className="field">
          <label htmlFor="dep">{t('onb.departure')}</label>
          <input id="dep" className="input" type="date" value={departure ?? ''}
            onChange={(e) => onDeparture(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ret">{t('onb.ret')}</label>
          <input id="ret" className="input" type="date" value={ret ?? ''} min={departure ?? undefined}
            onChange={(e) => setReturn(e.target.value || null)} />
        </div>

        {err && (
          <div className="row tiny" style={{ color: 'var(--danger)', gap: 8 }}>
            <Icon name="circle-exclamation" size={13} />
            {t(err === 'order' ? 'onb.datesErrOrder' : 'onb.datesErrLong')}
          </div>
        )}
        {days && (
          <div className="row" style={{ gap: 8 }}>
            <span className="badge badge-gold"><Icon name="calendar" size={10} /> {t('onb.datesDuration', { n: days })}</span>
          </div>
        )}
      </div>
    </StepShell>
  );
}
