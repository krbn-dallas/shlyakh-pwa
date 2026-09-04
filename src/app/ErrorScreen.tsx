import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';

/** Anything a route throws lands here instead of React Router's developer page. */
export function ErrorScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : String((error as Error)?.message ?? error);

  return (
    <div className="container stack" style={{
      gap: 'var(--s5)', minHeight: '60dvh', justifyContent: 'center', textAlign: 'center',
      alignItems: 'center', paddingTop: 'var(--s8)',
    }}>
      <Icon name="circle-exclamation" size={38} color="var(--red)" />
      <div className="stack" style={{ gap: 'var(--s2)' }}>
        <h2>{t('common.error')}</h2>
        <p className="small muted" style={{ margin: 0 }}>{t('update.body')}</p>
      </div>
      <div className="row" style={{ gap: 'var(--s2)' }}>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          <Icon name="rotate" size={13} /> {t('common.retry')}
        </button>
        <button className="btn" onClick={() => nav('/')}>
          <Icon name="home" size={13} /> {t('nav.home')}
        </button>
      </div>
      <details className="tiny faint" style={{ maxWidth: '100%' }}>
        <summary style={{ cursor: 'pointer' }}>{t('common.more')}</summary>
        <code style={{ display: 'block', marginTop: 8, wordBreak: 'break-word' }}>{detail}</code>
      </details>
    </div>
  );
}
