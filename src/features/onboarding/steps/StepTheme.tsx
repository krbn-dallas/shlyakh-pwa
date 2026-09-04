import { useStore, type Theme } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { CardChoice, StepShell } from './shared';

export function StepTheme() {
  const { t } = useT();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const opts: { v: Theme; icon: string; label: string }[] = [
    { v: 'light', icon: 'sun', label: t('onb.themeLight') },
    { v: 'dark', icon: 'moon', label: t('onb.themeDark') },
    { v: 'system', icon: 'contrast', label: t('onb.themeSystem') },
  ];

  return (
    <StepShell title={t('onb.themeTitle')} lead={t('onb.themeLead')}>
      <div className="stack">
        {opts.map((o) => (
          <CardChoice key={o.v} active={theme === o.v} onClick={() => setTheme(o.v)} icon={o.icon} title={o.label} />
        ))}
      </div>

      <div className="stack" style={{ gap: 'var(--s2)' }}>
        <span className="tiny muted">{t('onb.themePreview')}</span>
        <div className="card zellige stack" style={{ gap: 'var(--s3)' }}>
          <div className="row-between">
            <h3>{t('home.until')}</h3>
            <span className="badge badge-gold"><Icon name="calendar" size={10} /> D-12</span>
          </div>
          <div className="row" style={{ gap: 'var(--s4)' }}>
            {['12', '06', '30'].map((n, i) => (
              <div key={n} className="stack" style={{ gap: 0, alignItems: 'center' }}>
                <span className="num" style={{ fontSize: 30, fontWeight: 800 }}>{n}</span>
                <span className="tiny muted">{[t('home.days'), t('home.hoursShort'), t('home.minutes')][i]}</span>
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 'var(--s2)' }}>
            <span className="btn btn-primary" style={{ minHeight: 36, fontSize: 13, padding: '0 14px' }}>SOS</span>
            <span className="chip gold"><Icon name="pin" size={10} /> Марракеш</span>
          </div>
        </div>
      </div>
    </StepShell>
  );
}
