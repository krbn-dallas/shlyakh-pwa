import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';
import { useStore } from '@/app/store';
import { gateMode, inAppBrowser, setBypass, type GateMode } from '@/shared/lib/platform';

interface BIPEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }>; }

const Mark = () => (
  <svg width="56" height="56" viewBox="0 0 44 44" aria-hidden="true">
    <circle cx="22" cy="22" r="21" fill="var(--gold)" />
    <path d="M22 6l4 7.4 8.3-1.2-1.2 8.3L40 22l-6.9 3.5 1.2 8.3-8.3-1.2L22 38l-4-7.4-8.3 1.2 1.2-8.3L4 22l6.9-3.5L9.7 10.2 18 11.4z" fill="var(--red)" />
  </svg>
);

function Step({ n, icon, title, note }: { n: number; icon: string; title: string; note: string }) {
  return (
    <li className="row" style={{ alignItems: 'flex-start', gap: 'var(--s3)' }}>
      <span style={{
        flex: '0 0 34px', width: 34, height: 34, borderRadius: '50%',
        background: 'var(--gold-soft)', color: 'var(--gold-deep)',
        display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 15,
        fontFamily: 'var(--font-display)',
      }}>{n}</span>
      <span className="grow">
        <span className="row" style={{ gap: 8, fontWeight: 700, lineHeight: 1.35 }}>
          <Icon name={icon} size={15} color="var(--red)" />
          <span className="grow">{title}</span>
        </span>
        <span className="tiny muted" style={{ display: 'block', marginTop: 2 }}>{note}</span>
      </span>
    </li>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [taps, setTaps] = useState(0);
  useEffect(() => {
    if (taps >= 5) { setBypass(); location.reload(); }
  }, [taps]);
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: 'var(--s6) var(--s4)',
      paddingTop: 'max(var(--s6), env(safe-area-inset-top))',
      paddingBottom: 'max(var(--s6), env(safe-area-inset-bottom))',
      background: 'var(--bg)',
    }}>
      <div className="container stack" style={{ gap: 'var(--s5)' }}>
        <button
          onClick={() => setTaps((t) => t + 1)}
          aria-label="ШЛЯХ"
          style={{ background: 'none', border: 0, padding: 0, alignSelf: 'flex-start', cursor: 'default' }}
        >
          <Mark />
        </button>
        {children}
      </div>
    </div>
  );
}

function Why() {
  const { t } = useT();
  return (
    <div className="card-flat zellige stack" style={{ gap: 'var(--s2)' }}>
      <div className="small" style={{ fontWeight: 800 }}>{t('install.whyTitle')}</div>
      {(['install.why1', 'install.why2', 'install.why3'] as const).map((k) => (
        <div key={k} className="row small muted" style={{ alignItems: 'flex-start', gap: 8 }}>
          <Icon name="check" size={13} color="var(--ok)" />
          <span className="grow">{t(k)}</span>
        </div>
      ))}
    </div>
  );
}

function IOSInstall() {
  const { t } = useT();
  return (
    <Shell>
      <div className="stack" style={{ gap: 'var(--s2)' }}>
        <h1>{t('install.iosTitle')}</h1>
        <p className="muted" style={{ margin: 0 }}>{t('install.iosLead')}</p>
      </div>
      <ol className="card stack" style={{ gap: 'var(--s4)', listStyle: 'none', margin: 0, padding: 'var(--s5) var(--s4)' }}>
        <Step n={1} icon="share" title={t('install.iosStep1')} note={t('install.iosStep1Note')} />
        <Step n={2} icon="square-plus" title={t('install.iosStep2')} note={t('install.iosStep2Note')} />
        <Step n={3} icon="check" title={t('install.iosStep3')} note={t('install.iosStep3Note')} />
      </ol>
      <Why />
    </Shell>
  );
}

function InAppBrowser({ app }: { app: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const url = location.origin + location.pathname;

  const openExternal = () => {
    const tg = (window as unknown as { Telegram?: { WebApp?: { openLink: (u: string) => void } } }).Telegram;
    if (tg?.WebApp?.openLink) tg.WebApp.openLink(url);
    else window.open(url, '_blank', 'noopener');
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* clipboard blocked in some webviews */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Shell>
      <div className="stack" style={{ gap: 'var(--s2)' }}>
        <span className="badge badge-warn" style={{ alignSelf: 'flex-start' }}>
          <Icon name="warn" size={11} /> {app}
        </span>
        <h1>{t('install.inAppTitle')}</h1>
        <p className="muted" style={{ margin: 0 }}>{t('install.inAppLead')}</p>
      </div>
      <div className="stack">
        <button className="btn btn-primary btn-lg btn-block" onClick={openExternal}>
          <Icon name="external" size={15} /> {t('install.inAppOpen')}
        </button>
        <button className="btn btn-block" onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} size={15} />
          {copied ? t('common.copied') : t('install.inAppCopy')}
        </button>
        <div className="card-flat tiny muted" style={{ padding: 'var(--s3)' }}>{t('install.inAppHint')}</div>
      </div>
      <Why />
    </Shell>
  );
}

function AndroidBanner({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const dismissed = useStore((s) => s.installDismissed);
  const dismiss = useStore((s) => s.dismissInstall);
  const [evt, setEvt] = useState<BIPEvent | null>(null);

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    window.addEventListener('beforeinstallprompt', h);
    window.addEventListener('appinstalled', onDone);
    return () => {
      window.removeEventListener('beforeinstallprompt', h);
      window.removeEventListener('appinstalled', onDone);
    };
  }, [onDone]);

  if (dismissed || !evt) return null;
  return (
    <div className="fade-up" style={{
      position: 'fixed', left: 'var(--s3)', right: 'var(--s3)',
      bottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom) + var(--s3))',
      zIndex: 'var(--z-sheet)', background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow-lg)', padding: 'var(--s3) var(--s4)',
    }}>
      <div className="row" style={{ gap: 'var(--s3)' }}>
        <Mark />
        <div className="grow" style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800 }}>{t('install.androidTitle')}</div>
          <div className="tiny muted">{t('install.androidLead')}</div>
        </div>
      </div>
      <div className="row" style={{ marginTop: 'var(--s3)' }}>
        <button className="btn btn-primary grow" onClick={() => { void evt.prompt(); }}>
          <Icon name="download" size={14} /> {t('install.androidAction')}
        </button>
        <button className="btn btn-ghost" onClick={dismiss}>{t('install.later')}</button>
      </div>
    </div>
  );
}

/** Wraps the whole app. iOS must install; Android is nudged; desktop is untouched. */
export function InstallGate({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<GateMode>(() => gateMode());

  useEffect(() => {
    const recheck = () => setMode(gateMode());
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener('change', recheck);
    window.addEventListener('visibilitychange', recheck);
    return () => {
      mq.removeEventListener('change', recheck);
      window.removeEventListener('visibilitychange', recheck);
    };
  }, []);

  if (mode === 'ios-install') return <IOSInstall />;
  if (mode === 'in-app') return <InAppBrowser app={inAppBrowser() ?? 'Вбудований браузер'} />;
  return (
    <>
      {children}
      {mode === 'android-banner' && <AndroidBanner onDone={() => setMode('ok')} />}
    </>
  );
}
