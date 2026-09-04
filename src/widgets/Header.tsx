import { Link } from 'react-router-dom';
import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';
import { useStore } from '@/app/store';
import { CitySwitcher } from './CitySwitcher';

export function Header() {
  const { t } = useT();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  // Cycles light → dark → system, so "system" is reachable from the header too.
  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const themeIcon = theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'contrast';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 'var(--z-sticky)',
      background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div className="container row-between" style={{ minHeight: 'var(--header-h)' }}>
        <Link to="/" className="row" style={{ gap: 10, textDecoration: 'none', minWidth: 0 }}>
          <svg width="26" height="26" viewBox="0 0 44 44" aria-hidden="true" style={{ flex: '0 0 26px' }}>
            <circle cx="22" cy="22" r="21" fill="var(--gold)" />
            <path d="M22 6l4 7.4 8.3-1.2-1.2 8.3L40 22l-6.9 3.5 1.2 8.3-8.3-1.2L22 38l-4-7.4-8.3 1.2 1.2-8.3L4 22l6.9-3.5L9.7 10.2 18 11.4z" fill="var(--red)" />
          </svg>
          <span style={{ minWidth: 0 }}>
            <span style={{
              display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 17, letterSpacing: '.02em', lineHeight: 1,
            }}>{t('app.name')}</span>
            <span className="tiny muted truncate" style={{ display: 'block' }}>{t('app.tagline')}</span>
          </span>
        </Link>

        <div className="row" style={{ gap: 'var(--s2)' }}>
          <CitySwitcher compact />
          <button
            className="btn btn-ghost"
            style={{ minWidth: 'var(--tap)', padding: 0 }}
            onClick={() => setTheme(nextTheme)}
            aria-label={t('settings.theme')}
            title={t('settings.theme')}
          >
            <Icon name={themeIcon} size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
