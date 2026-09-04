import { Link } from 'react-router-dom';
import { Logo, Wordmark } from '@/shared/ui/Logo';
import { useT } from '@/shared/i18n';
import { CitySwitcher } from './CitySwitcher';
import { WeatherChip } from './WeatherChip';

export function Header() {
  const { t } = useT();
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 'var(--z-sticky)',
      background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)',
      paddingTop: 'env(safe-area-inset-top)',
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
          <WeatherChip />
          <CitySwitcher compact />
        </div>
      </div>
    </header>
  );
}
