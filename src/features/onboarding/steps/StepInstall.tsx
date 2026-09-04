import { useEffect, useState } from 'react';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { isAndroid, isIOS, isStandalone } from '@/shared/lib/platform';
import { StepShell } from './shared';

interface BIPEvent extends Event { prompt: () => Promise<void>; }

export function StepInstall() {
  const { t } = useT();
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const installed = isStandalone();

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const steps = isIOS()
    ? [
        { icon: 'share', title: t('install.iosStep1'), note: t('install.iosStep1Note') },
        { icon: 'square-plus', title: t('install.iosStep2'), note: t('install.iosStep2Note') },
        { icon: 'check', title: t('install.iosStep3'), note: t('install.iosStep3Note') },
      ]
    : [];

  return (
    <StepShell title={t('onb.installTitle')} lead={installed ? t('install.why1') : t('install.iosLead')}>
      {installed ? (
        <div className="card row" style={{ gap: 'var(--s3)', borderColor: 'var(--ok)' }}>
          <Icon name="circle-check" size={22} color="var(--ok)" />
          <span className="grow" style={{ fontWeight: 700 }}>{t('common.done')}</span>
        </div>
      ) : (
        <>
          {steps.length > 0 && (
            <ol className="card stack" style={{ gap: 'var(--s4)', listStyle: 'none', margin: 0, padding: 'var(--s5) var(--s4)' }}>
              {steps.map((s, i) => (
                <li key={s.icon} className="row" style={{ alignItems: 'flex-start', gap: 'var(--s3)' }}>
                  <span style={{
                    flex: '0 0 34px', width: 34, height: 34, borderRadius: '50%',
                    background: 'var(--gold-soft)', color: 'var(--gold-deep)',
                    display: 'grid', placeItems: 'center', fontWeight: 800,
                    fontFamily: 'var(--font-display)', fontSize: 15,
                  }}>{i + 1}</span>
                  <span className="grow">
                    <span className="row" style={{ gap: 8, fontWeight: 700, lineHeight: 1.35 }}>
                      <Icon name={s.icon} size={14} color="var(--red)" />
                      <span className="grow">{s.title}</span>
                    </span>
                    <span className="tiny muted" style={{ display: 'block', marginTop: 2 }}>{s.note}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}

          {isAndroid() && evt && (
            <button className="btn btn-primary btn-lg btn-block" onClick={() => void evt.prompt()}>
              <Icon name="download" size={15} /> {t('install.androidAction')}
            </button>
          )}

          {!isIOS() && !isAndroid() && (
            <div className="card-flat stack" style={{ gap: 'var(--s2)' }}>
              <span className="small" style={{ fontWeight: 800 }}>{t('install.whyTitle')}</span>
              {(['install.why1', 'install.why2', 'install.why3'] as const).map((k) => (
                <span key={k} className="row small muted" style={{ gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="check" size={12} color="var(--ok)" /> <span className="grow">{t(k)}</span>
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </StepShell>
  );
}
