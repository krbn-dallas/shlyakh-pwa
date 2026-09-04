import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@/shared/ui/Icon';

export function SosFab() {
  const { pathname } = useLocation();
  if (pathname === '/sos') return null;
  return (
    <Link
      to="/sos"
      className="sos-pulse"
      aria-label="SOS"
      style={{
        position: 'fixed', right: 'var(--s4)',
        bottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom) + var(--s3))',
        zIndex: 'var(--z-fab)', width: 60, height: 60, borderRadius: '50%',
        background: 'var(--red)', color: 'var(--on-red)',
        display: 'grid', placeItems: 'center', textDecoration: 'none',
        boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-display)',
        fontWeight: 800, fontSize: 13, letterSpacing: '.04em',
      }}
    >
      <Icon name="shield-half" size={18} />
      <span style={{ marginTop: -2 }}>SOS</span>
    </Link>
  );
}
