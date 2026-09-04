import { Link } from 'react-router-dom';
import { Logo, Wordmark } from '@/shared/ui/Logo';
import { useT } from '@/shared/i18n';
import { LocationChip } from './LocationChip';

export function Header() {
  const { t } = useT();
  return (
    // `fixed`, not `sticky`: on iOS a sticky element with a backdrop filter
    // visibly lags and rubber-bands behind momentum scrolling. Fixed is pinned
    // to the viewport and does not move at all.
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 'var(--z-sticky)',
      background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid color-mix(in srgb, var(--line) 70%, transparent)',
      paddingTop: 'env(safe-area-inset-top)',
      transform: 'translateZ(0)',
    }}>
      <div className="container row-between" style={{ minHeight: 'var(--header-h)', gap: 'var(--s2)' }}>
        <Link to="/" className="row" style={{ gap: 10, textDecoration: 'none', minWidth: 0 }}>
          <Logo size={28} />
          <span style={{ minWidth: 0 }}>
            <span style={{
              display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 17, letterSpacing: '.02em', lineHeight: 1,
            }}>{t('app.name')}</span>
            <Wordmark />
          </span>
        </Link>

        <div className="row" style={{ gap: 'var(--s2)', flex: '0 0 auto' }}>
          <LocationChip />
        </div>
      </div>
    </header>
  );
}
