import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, PRIMARY_CITIES, type Theme } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { Flag } from '@/shared/ui/Flag';
import { BrokenHeart } from '@/shared/ui/Logo';
import { fetchRates } from '@/shared/lib/rates';
import { getSpace, setSpace } from '@/shared/lib/diary';
import { syncDiary } from '@/shared/lib/sync';
import { setSoundEnabled, soundEnabled, sfx } from '@/shared/lib/sound';
import {
  isPushSubscribed, pushConfigured, pushPermission, pushSupported,
  subscribePush, unsubscribePush,
} from '@/shared/lib/push';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Section } from '@/shared/ui/Section';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { prefetchTiles } from '@/shared/lib/tiles';
import { tripLength } from '@/shared/lib/trip';
import type { CityId, Lang } from '@/shared/model/types';

function StayEditor({ city, label }: { city: CityId; label: string }) {
  const { t } = useT();
  const stay = useStore((s) => s.stays[city]);
  const setStay = useStore((s) => s.setStay);
  const [name, setName] = useState(stay?.name ?? '');
  const [address, setAddress] = useState(stay?.address ?? '');

  return (
    <div className="card-flat stack" style={{ gap: 'var(--s2)' }}>
      <span className="row small" style={{ gap: 8, fontWeight: 800 }}>
        <Icon name="bed" size={13} color="var(--gold-deep)" /> {label}
        {stay?.lat && <span className="badge badge-ok"><Icon name="pin" size={9} /></span>}
      </span>
      <input className="input" placeholder={t('onb.stayName')} value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => setStay(city, { ...stay, name, address })} />
      <input className="input" placeholder={t('onb.stayAddress')} value={address}
        onChange={(e) => setAddress(e.target.value)}
        onBlur={() => setStay(city, { ...stay, name, address })} />
    </div>
  );
}

export default function SettingsPage() {
  const { t, lang } = useT();
  const nav = useNavigate();
  const s = useStore();
  const { data: cities } = useData('cities');
  const [tiles, setTiles] = useState<{ pct: number; done: boolean } | null>(null);
  const [ratesBusy, setRatesBusy] = useState(false);
  const [sound, setSound] = useState(soundEnabled());
  const [space, setSpaceState] = useState(getSpace());
  const [joinCode, setJoinCode] = useState('');
  const [syncState, setSyncState] = useState<'idle' | 'busy' | 'ok' | 'fail'>('idle');
  const [copiedSpace, setCopiedSpace] = useState(false);
  const [push, setPush] = useState<'off' | 'on' | 'busy' | 'blocked'>('off');
  const [hours, setHours] = useState({ morning: 8, evening: 21 });

  useEffect(() => {
    if (!pushSupported()) return;
    if (pushPermission() === 'denied') { setPush('blocked'); return; }
    void isPushSubscribed().then((on) => setPush(on ? 'on' : 'off'));
  }, []);

  /** The server upserts by endpoint, so re-sending is how hours get saved. */
  const savePush = async (h = hours) => {
    const ok = await subscribePush({
      lang: s.lang, city: s.city, departure: s.departure, ret: s.ret,
      morningHour: h.morning, eveningHour: h.evening,
    });
    if (ok) { setPush('on'); sfx.saved(); }
    else setPush(pushPermission() === 'denied' ? 'blocked' : 'off');
  };

  const togglePush = async () => {
    if (push === 'on') { setPush('busy'); await unsubscribePush(); setPush('off'); return; }
    setPush('busy');
    await savePush();
  };

  const runSync = async () => {
    setSyncState('busy');
    try { await syncDiary(); setSyncState('ok'); sfx.saved(); }
    catch { setSyncState('fail'); }
    setTimeout(() => setSyncState('idle'), 3000);
  };
  const [ratesMsg, setRatesMsg] = useState<string | null>(null);

  const refreshRates = async () => {
    setRatesBusy(true); setRatesMsg(null);
    try {
      const live = await fetchRates();
      s.setRates({ uah: live.uah, mdl: live.mdl, mad: live.mad });
      setRatesMsg(t('settings.ratesUpdated'));
    } catch {
      setRatesMsg(t('common.error'));
    }
    setRatesBusy(false);
    setTimeout(() => setRatesMsg(null), 3000);
  };

  const primaries = (cities ?? []).filter((c) => PRIMARY_CITIES.includes(c.id));
  const cityData = (cities ?? []).find((c) => c.id === s.city);

  const download = async () => {
    if (!cityData) return;
    setTiles({ pct: 0, done: false });
    try {
      await prefetchTiles(cityData.bbox, (pct) => setTiles({ pct, done: false }));
      setTiles({ pct: 100, done: true });
    } catch {
      setTiles(null);
    }
  };

  const themes: { v: Theme; icon: string; label: string }[] = [
    { v: 'light', icon: 'sun', label: t('onb.themeLight') },
    { v: 'dark', icon: 'moon', label: t('onb.themeDark') },
    { v: 'system', icon: 'contrast', label: t('onb.themeSystem') },
  ];

  return (
    <div className="stack" style={{ gap: 'var(--s6)' }}>
      <PageHeader title={t('settings.title')} />

      <Section icon="palette" title={t('settings.appearance')}>
        <div className="stack" style={{ gap: 'var(--s3)' }}>
          <div className="stack" style={{ gap: 6 }}>
            <span className="tiny muted" style={{ fontWeight: 700 }}>{t('settings.theme')}</span>
            <div className="wrap">
              {themes.map((th) => (
                <button key={th.v} className={`chip ${s.theme === th.v ? 'active' : ''}`} onClick={() => s.setTheme(th.v)}>
                  <Icon name={th.icon} size={11} /> {th.label}
                </button>
              ))}
            </div>
          </div>
          <div className="stack" style={{ gap: 6 }}>
            <span className="tiny muted" style={{ fontWeight: 700 }}>{t('settings.lang')}</span>
            <div className="wrap">
              {(['uk', 'en'] as Lang[]).map((l) => (
                <button key={l} className={`chip ${s.lang === l ? 'active' : ''}`} onClick={() => s.setLang(l)}>
                  {l === 'uk' ? 'Українська' : 'English'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section icon="calendar" title={t('settings.trip')}>
        <div className="card stack" style={{ gap: 'var(--s3)' }}>
          <div className="field">
            <label htmlFor="s-dep">{t('onb.departure')}</label>
            <input id="s-dep" className="input" type="date" value={s.departure ?? ''}
              onChange={(e) => s.setDeparture(e.target.value || null)} />
          </div>
          <div className="field">
            <label htmlFor="s-ret">{t('onb.ret')}</label>
            <input id="s-ret" className="input" type="date" value={s.ret ?? ''} min={s.departure ?? undefined}
              onChange={(e) => s.setReturn(e.target.value || null)} />
          </div>
          {s.departure && s.ret && (
            <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>
              {t('onb.datesDuration', { n: tripLength(s.departure, s.ret) })}
            </span>
          )}
        </div>
      </Section>

      <Section icon="users" title={t('settings.party')}>
        <div className="stack" style={{ gap: 'var(--s3)' }}>
          <div className="wrap">
            <button className={`chip ${!s.party.partner ? 'active' : ''}`} onClick={() => s.setParty({ partner: false })}>
              <Icon name="user" size={11} /> {t('onb.partySolo')}
            </button>
            <button className={`chip ${s.party.partner ? 'active' : ''}`} onClick={() => s.setParty({ partner: true })}>
              <Icon name="couple" size={11} /> {t('onb.partyPartner')}
            </button>
          </div>
          {/* Own row, left-aligned: the SOS FAB owns the bottom-right corner. */}
          <div className="row" style={{ gap: 'var(--s2)' }}>
            <span className="row grow small" style={{ gap: 8, fontWeight: 700 }}>
              <Icon name="baby" size={13} color="var(--gold-deep)" /> {t('onb.partyKids')}
            </span>
            <button className="chip" onClick={() => s.setParty({ kids: Math.max(0, s.party.kids - 1) })}
              disabled={s.party.kids === 0} aria-label="-">
              <Icon name="minus" size={10} />
            </button>
            <span className="num" style={{ minWidth: 26, textAlign: 'center', fontWeight: 800 }}>{s.party.kids}</span>
            <button className="chip" onClick={() => s.setParty({ kids: Math.min(6, s.party.kids + 1) })} aria-label="+">
              <Icon name="plus" size={10} />
            </button>
          </div>
        </div>
      </Section>

      <Section icon="bed" title={t('settings.stays')}>
        <div className="stack" style={{ gap: 'var(--s2)' }}>
          <StayEditor city="chisinau" label="Chișinău" />
          <StayEditor city="marrakech" label={t('cityName.marrakech')} />
        </div>
      </Section>

      <Section icon="pin" title={t('settings.city')}>
        <div className="stack" style={{ gap: 'var(--s2)' }}>
          <div className="wrap">
            {primaries.map((c) => (
              <button key={c.id} className={`chip ${s.city === c.id ? 'active' : ''}`} onClick={() => s.setCity(c.id, true)}>
                <Flag code={c.country} size={13} /> {tr(c.name, lang)}
              </button>
            ))}
          </div>
          <button className={`chip ${!s.cityManual ? 'gold' : ''}`} style={{ alignSelf: 'flex-start' }}
            onClick={() => s.clearCityManual()} disabled={!s.cityManual}>
            <Icon name="locate" size={11} /> {s.cityManual ? t('settings.cityAuto') : t('settings.cityAuto')}
          </button>
        </div>
      </Section>

      <Section icon="money" title={t('settings.ratesTitle')} note={t('home.ratesNote')}>
        <div className="card stack" style={{ gap: 'var(--s3)' }}>
          <button className="btn btn-gold" onClick={() => void refreshRates()} disabled={ratesBusy}>
            <Icon name={ratesBusy ? 'spinner' : 'rotate'} size={13} spin={ratesBusy} />
            {ratesMsg ?? t('settings.ratesRefresh')}
          </button>
          {([['uah', 'ua', 'UAH'], ['mdl', 'md', 'MDL'], ['mad', 'ma', 'MAD']] as const).map(([k, cc, label]) => (
            <div key={k} className="row-between">
              <span className="row small" style={{ gap: 7, fontWeight: 700 }}>
                <Flag code={cc} size={13} /> {label}
              </span>
              <input className="input" type="number" step="0.1" min="0" style={{ maxWidth: 110, textAlign: 'right' }}
                value={s.rates[k]} onChange={(e) => s.setRates({ [k]: Number(e.target.value) })} />
            </div>
          ))}
        </div>
      </Section>

      <Section icon="book" title={t('diary.title')}>
        <div className="card stack" style={{ gap: 'var(--s3)' }}>
          <div className="stack" style={{ gap: 6 }}>
            <span className="tiny muted" style={{ fontWeight: 700 }}>{t('diary.space')}</span>
            <div className="row" style={{ gap: 'var(--s2)' }}>
              <code className="grow num" style={{
                background: 'var(--surface-2)', padding: '10px var(--s3)',
                borderRadius: 'var(--r-ctl)', letterSpacing: '.12em', fontWeight: 700,
              }}>{space}</code>
              <button className="btn" style={{ minWidth: 44, padding: 0 }} onClick={async () => {
                try { await navigator.clipboard.writeText(space); } catch { /* denied */ }
                setCopiedSpace(true); setTimeout(() => setCopiedSpace(false), 2000);
              }} aria-label={t('common.copy')}>
                <Icon name={copiedSpace ? 'check' : 'copy'} size={13} />
              </button>
            </div>
            <span className="tiny faint">{t('diary.spaceNote')}</span>
          </div>

          <div className="row" style={{ gap: 'var(--s2)' }}>
            <input className="input grow" placeholder={t('diary.spaceJoin')} value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)} autoCapitalize="none" spellCheck={false} />
            <button className="btn" disabled={!joinCode.trim()} onClick={() => {
              if (setSpace(joinCode)) { setSpaceState(getSpace()); setJoinCode(''); sfx.saved(); }
              else alert(t('diary.spaceBad'));
            }}>
              <Icon name="check" size={13} />
            </button>
          </div>

          <button className="btn btn-gold" onClick={() => void runSync()}
            disabled={syncState === 'busy' || !navigator.onLine}>
            <Icon name={syncState === 'busy' ? 'spinner' : syncState === 'ok' ? 'check' : 'rotate'}
              size={13} spin={syncState === 'busy'} />
            {syncState === 'ok' ? t('diary.synced')
              : syncState === 'fail' ? t('common.error') : t('diary.syncNow')}
          </button>
        </div>
      </Section>

      {pushConfigured() && pushSupported() && (
        <Section icon="bell" title={t('push.title')} note={t('push.note')}>
          <div className="card stack" style={{ gap: 'var(--s3)' }}>
            {push === 'blocked' ? (
              <span className="row small" style={{ gap: 8, color: 'var(--warn)' }}>
                <Icon name="warn" size={13} /> {t('push.blocked')}
              </span>
            ) : (
              <button className={`btn ${push === 'on' ? 'btn-gold' : ''}`}
                onClick={() => void togglePush()} disabled={push === 'busy'}>
                <Icon name={push === 'busy' ? 'spinner' : push === 'on' ? 'check' : 'bell'}
                  size={13} spin={push === 'busy'} />
                {push === 'on' ? t('push.on') : t('push.enable')}
              </button>
            )}

            {push === 'on' && (
              <div className="row-between">
                <label className="stack tiny" style={{ gap: 4 }}>
                  <span className="muted" style={{ fontWeight: 700 }}>{t('push.morning')}</span>
                  <input className="input" type="number" min={5} max={12} style={{ maxWidth: 90 }}
                    value={hours.morning}
                    onChange={(e) => setHours((h) => ({ ...h, morning: Number(e.target.value) }))}
                    onBlur={() => void savePush()} />
                </label>
                <label className="stack tiny" style={{ gap: 4 }}>
                  <span className="muted" style={{ fontWeight: 700 }}>{t('push.evening')}</span>
                  <input className="input" type="number" min={17} max={23} style={{ maxWidth: 90 }}
                    value={hours.evening}
                    onChange={(e) => setHours((h) => ({ ...h, evening: Number(e.target.value) }))}
                    onBlur={() => void savePush()} />
                </label>
              </div>
            )}
          </div>
        </Section>
      )}

      <Section icon="bell" title={t('diary.sound')}>
        <button className={`chip ${sound ? 'active' : ''}`} style={{ alignSelf: 'flex-start' }}
          onClick={() => { const next = !sound; setSound(next); setSoundEnabled(next); if (next) sfx.check(); }}>
          <Icon name={sound ? 'bell' : 'ban'} size={11} /> {sound ? t('common.yes') : t('common.no')}
        </button>
      </Section>

      <Section icon="cloud-download" title={t('settings.offline')}>
        <div className="card stack" style={{ gap: 'var(--s3)' }}>
          <span className="small muted">{t('map.offlineNote')}</span>
          <button className="btn btn-gold" onClick={() => void download()} disabled={!!tiles && !tiles.done}>
            <Icon name={tiles && !tiles.done ? 'spinner' : 'cloud-download'} size={14} spin={!!tiles && !tiles.done} />
            {tiles
              ? tiles.done ? t('map.downloaded') : t('map.downloading', { n: tiles.pct })
              : t('map.downloadTiles')}
          </button>
          {tiles && !tiles.done && (
            <div style={{ height: 6, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
              <div style={{ width: `${tiles.pct}%`, height: '100%', background: 'var(--gold)', transition: 'width .3s' }} />
            </div>
          )}
        </div>
      </Section>

      <Section icon="trash" title={t('settings.data')}>
        <div className="stack" style={{ gap: 'var(--s2)' }}>
          <button className="btn" onClick={() => { if (confirm(t('check.resetConfirm'))) s.resetCheck(); }}>
            <Icon name="rotate" size={13} /> {t('settings.resetCheck')}
          </button>
          <button className="btn" onClick={() => { s.setOnboarded(false); nav('/onboarding'); }}>
            <Icon name="arrow-rotate-right" size={13} /> {t('settings.rerunOnboarding')}
          </button>
          <button className="btn" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
            onClick={() => { if (confirm(t('settings.resetAllConfirm'))) { s.resetAll(); location.href = '/'; } }}>
            <Icon name="trash" size={13} /> {t('settings.resetAll')}
          </button>
        </div>
      </Section>

      <Section icon="info" title={t('settings.about')}>
        <div className="card-flat stack" style={{ gap: 'var(--s3)', alignItems: 'center', textAlign: 'center' }}>
          <span className="small" style={{ fontWeight: 600 }}>
            made with <BrokenHeart /> by <b>panfi<span style={{ color: 'var(--red)' }}>.</span>love</b>
          </span>
          <span className="small muted" style={{ fontStyle: 'italic' }}>don’t forget 2 breath</span>
          <hr className="divider" style={{ width: '100%', margin: 0 }} />
          <span className="tiny faint">{t('settings.attribution')}</span>
        </div>
      </Section>
    </div>
  );
}
