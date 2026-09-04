import { useEffect, useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';

export function OfflineBadge() {
  const { t } = useT();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (online) return null;
  return (
    <div role="status" style={{ background: 'var(--gold-soft)', borderBottom: '1px solid var(--gold)' }}>
      <div className="container row" style={{ gap: 8, padding: '8px var(--s4)' }}>
        <Icon name="wifi" size={13} color="var(--gold-deep)" />
        <span className="tiny" style={{ color: 'var(--gold-deep)' }}>
          <b>{t('offline.badge')}</b> — {t('offline.note')}
        </span>
      </div>
    </div>
  );
}
