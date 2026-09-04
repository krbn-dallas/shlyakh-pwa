import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { useT, type TKey } from '@/shared/i18n';

const TABS: { to: string; icon: IconName; label: TKey; end?: boolean }[] = [
  { to: '/', icon: 'home', label: 'nav.home', end: true },
  { to: '/itinerary', icon: 'route', label: 'nav.itinerary' },
  { to: '/poi', icon: 'pin', label: 'nav.places' },
  { to: '/checklist', icon: 'o-check', label: 'nav.checklist' },
  { to: '/more', icon: 'bars', label: 'nav.more' },
];

export function TabBar() {
  const { t } = useT();
  return (
    <nav
      aria-label={t('nav.home')}
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 'var(--z-sticky)',
        background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="container" style={{
        display: 'grid', gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
        minHeight: 'var(--tabbar-h)', padding: 0,
      }}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4, textDecoration: 'none',
              color: isActive ? 'var(--red)' : 'var(--muted)',
              fontSize: 11, fontWeight: 700, paddingTop: 6, paddingBottom: 6,
              minHeight: 'var(--tap)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon name={tab.icon} size={18} />
                <span>{t(tab.label)}</span>
                <span aria-hidden style={{
                  width: 16, height: 2, borderRadius: 2, marginTop: -2,
                  background: isActive ? 'var(--red)' : 'transparent',
                }} />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
