import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { StepLang } from './steps/StepLang';
import { StepTheme } from './steps/StepTheme';
import { StepDates, datesError } from './steps/StepDates';
import { StepParty } from './steps/StepParty';
import { StepStay } from './steps/StepStay';
import { StepGeo } from './steps/StepGeo';
import { StepInstall } from './steps/StepInstall';

const STEPS = [StepLang, StepTheme, StepDates, StepParty, StepStay, StepGeo, StepInstall];

export default function OnboardingPage() {
  const { t } = useT();
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const departure = useStore((s) => s.departure);
  const ret = useStore((s) => s.ret);
  const setOnboarded = useStore((s) => s.setOnboarded);

  const Step = STEPS[i];
  const last = i === STEPS.length - 1;
  // The dates step is the only hard gate — everything downstream is computed from it.
  const blocked = i === 2 && (!departure || !ret || datesError(departure, ret) !== null);

  const finish = () => { setOnboarded(true); nav('/', { replace: true }); };
  const next = () => (last ? finish() : setI((n) => n + 1));

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      paddingTop: 'max(var(--s5), env(safe-area-inset-top))',
      background: 'var(--bg)',
    }}>
      <div className="container row-between" style={{ marginBottom: 'var(--s5)' }}>
        <div className="row" style={{ gap: 6 }} aria-label={`${i + 1} ${t('onb.of')} ${STEPS.length}`}>
          {STEPS.map((_, n) => (
            <span key={n} style={{
              width: n === i ? 22 : 7, height: 7, borderRadius: 4,
              background: n <= i ? 'var(--red)' : 'var(--line)',
              transition: 'width .3s, background .3s',
            }} />
          ))}
        </div>
        <span className="tiny muted num">{i + 1} {t('onb.of')} {STEPS.length}</span>
      </div>

      <div className="container grow" style={{ paddingBottom: 'var(--s8)' }}>
        <Step key={i} />
      </div>

      <div style={{
        position: 'sticky', bottom: 0,
        background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--line)',
        paddingTop: 'var(--s3)',
        paddingBottom: 'calc(var(--s3) + env(safe-area-inset-bottom))',
      }}>
        <div className="container row" style={{ gap: 'var(--s2)' }}>
          {i > 0 && (
            <button className="btn btn-ghost" onClick={() => setI((n) => n - 1)} aria-label={t('common.back')}>
              <Icon name="chevron-left" size={13} />
            </button>
          )}
          <button className="btn btn-primary btn-lg grow" onClick={next} disabled={blocked}>
            {last ? t('onb.finish') : t('common.next')}
            <Icon name={last ? 'check' : 'arrow-right'} size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
