import { Link } from 'react-router-dom';
import { useT, type TKey } from '@/shared/i18n';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';

const LINKS: { to: string; icon: IconName; title: TKey; note: TKey }[] = [
  { to: '/map', icon: 'map', title: 'map.title', note: 'more.map' },
  { to: '/poi', icon: 'pin', title: 'places.title', note: 'more.places' },
  { to: '/services', icon: 'taxi', title: 'services.title', note: 'more.services' },
  { to: '/safety', icon: 'shield-half', title: 'safety.title', note: 'more.safety' },
  { to: '/phrases', icon: 'comment', title: 'phrases.title', note: 'more.phrases' },
  { to: '/guide', icon: 'book', title: 'guide.title', note: 'more.guide' },
  { to: '/settings', icon: 'palette', title: 'settings.title', note: 'more.settings' },
];

export default function MorePage() {
  const { t } = useT();
  return (
    <div className="stack" style={{ gap: 'var(--s4)' }}>
      <PageHeader title={t('more.title')} />
      <div className="stack" data-stagger style={{ gap: 'var(--s2)' }}>
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="card row" style={{ gap: 'var(--s3)', textDecoration: 'none', minHeight: 68 }}>
            <span style={{
              flex: '0 0 42px', width: 42, height: 42, borderRadius: 'var(--r-ctl)',
              background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
            }}>
              <Icon name={l.icon} size={16} color="var(--gold-deep)" />
            </span>
            <span className="grow" style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 800 }}>{t(l.title)}</span>
              <span className="tiny muted">{t(l.note)}</span>
            </span>
            <Icon name="chevron-right" size={12} color="var(--muted)" />
          </Link>
        ))}
      </div>
    </div>
  );
}
