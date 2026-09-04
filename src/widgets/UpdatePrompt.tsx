import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';
import { useSW } from '@/app/sw';

/** Renders inside the app shell; registration itself happens in ServiceWorkerHost. */
export function UpdatePrompt() {
  const { t } = useT();
  const needRefresh = useSW((s) => s.needRefresh);
  const update = useSW((s) => s.update);
  const dismiss = useSW((s) => s.dismiss);

  if (!needRefresh) return null;
  return (
    <div className="fade-up" style={{
      position: 'fixed', left: 'var(--s3)', right: 'var(--s3)',
      bottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom) + var(--s3))',
      zIndex: 'var(--z-sheet)', background: 'var(--surface)', border: '1px solid var(--gold)',
      borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow-lg)', padding: 'var(--s3) var(--s4)',
    }}>
      <div className="row" style={{ gap: 'var(--s3)' }}>
        <Icon name="cloud-download" size={20} color="var(--gold-deep)" />
        <div className="grow" style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{t('update.title')}</div>
          <div className="tiny muted">{t('update.body')}</div>
        </div>
        <button className="btn btn-gold" style={{ minHeight: 38, padding: '0 14px' }} onClick={update}>
          {t('update.action')}
        </button>
        <button className="btn btn-ghost" style={{ minWidth: 38, padding: 0 }} onClick={dismiss} aria-label={t('common.close')}>
          <Icon name="x" size={13} />
        </button>
      </div>
    </div>
  );
}
