import { NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { useT, type TKey } from '@/shared/i18n';
import { useStore } from '@/app/store';
import { tripPhase } from '@/shared/lib/tripPhase';

interface Tab { to: string; icon: IconName; label: TKey; end?: boolean }

const HOME: Tab = { to: '/', icon: 'home', label: 'nav.home', end: true };
const ROUTE: Tab = { to: '/itinerary', icon: 'route', label: 'nav.itinerary' };
const CHECK: Tab = { to: '/checklist', icon: 'o-check', label: 'nav.checklist' };
const DIARY: Tab = { to: '/diary', icon: 'book', label: 'diary.tab' };
const MORE: Tab = { to: '/more', icon: 'bars', label: 'nav.more' };

export function TabBar() {
  const { t } = useT();
  const { pathname } = useLocation();
  const departure = useStore((s) => s.departure);
  const ret = useStore((s) => s.ret);

  // Before departure the checklist earns its slot; once the trip starts the
  // diary takes over and the checklist moves under "More".
  const phase = tripPhase(departure, ret);
  const fourth = phase === 'before' ? CHECK : DIARY;
  const tabs: Tab[] = [HOME, ROUTE, fourth, MORE];

  const sosActive = pathname === '/sos';

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
        display: 'grid', gridTemplateColumns: '1fr 1fr 76px 1fr 1fr',
        minHeight: 'var(--tabbar-h)', padding: 0, alignItems: 'center',
      }}>
        {tabs.slice(0, 2).map((tab) => <TabLink key={tab.to} tab={tab} />)}

        {/* SOS lives in the middle so it is never more than one tap away. */}
        <NavLink
          to="/sos"
          aria-label="SOS"
          style={{
            justifySelf: 'center', width: 62, height: 62, borderRadius: '50%',
            background: 'var(--red)', color: 'var(--on-red)',
            display: 'grid', placeItems: 'center', textDecoration: 'none',
            marginTop: -26,
            border: '4px solid var(--surface)',
            boxShadow: sosActive ? '0 0 0 3px var(--gold)' : 'var(--shadow-lg)',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
            letterSpacing: '.05em',
          }}
          className={sosActive ? undefined : 'sos-pulse'}
        >
          <Icon name="shield-half" size={17} />
          <span style={{ marginTop: -2 }}>SOS</span>
        </NavLink>

        {tabs.slice(2).map((tab) => <TabLink key={tab.to} tab={tab} />)}
      </div>
    </nav>
  );
}

function TabLink({ tab }: { tab: Tab }) {
  const { t } = useT();
  return (
    <NavLink
      to={tab.to}
      end={tab.end}
      style={({ isActive }) => ({
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 3, textDecoration: 'none',
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
            width: 16, height: 2, borderRadius: 2, marginTop: -1,
            background: isActive ? 'var(--red)' : 'transparent',
          }} />
        </>
      )}
    </NavLink>
  );
}
