import { useMemo, useState } from 'react';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { Section } from '@/shared/ui/Section';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { token } from '@/shared/i18n/tokens';
import type { CityId, Emergency, EmergencyKind } from '@/shared/model/types';

const KIND_ICON: Record<EmergencyKind, IconName> = {
  police: 'shield', medical: 'medical-bag', fire: 'fire', rescue: 'shield-half',
  tourist: 'info', embassy: 'flag', general: 'phone', hospital: 'kit',
};
const KIND_COLOR: Record<EmergencyKind, string> = {
  police: 'var(--ink)', medical: 'var(--red)', fire: 'var(--warn)', rescue: 'var(--warn)',
  tourist: 'var(--gold-deep)', embassy: 'var(--ok)', general: 'var(--red)', hospital: 'var(--red)',
};

const COUNTRY_OF: Record<CityId, string> = {
  kyiv: 'ua', chisinau: 'md',
  marrakech: 'ma', casablanca: 'ma', fes: 'ma', rabat: 'ma',
  tangier: 'ma', agadir: 'ma', essaouira: 'ma', ouarzazate: 'ma',
};

/** Four steps, worded for the city you are actually in. */
function lostSteps(city: CityId, lang: 'uk' | 'en'): string[] {
  const uk: Record<string, string[]> = {
    ma: [
      'Зупинись. Не йди далі навмання — у медині це тільки заплутує.',
      'Знайди орієнтир: мінарет Кутубії видно майже звідусіль, або йди до найближчої брами (Bab).',
      'Вийди на широку людну вулицю й злови petit taxi. Покажи водієві адресу ріаду з екрана.',
      'Подзвони своїм. Якщо допомога потрібна зараз — туристична поліція або 190.',
    ],
    md: [
      'Зупинись і подивись назву вулиці — у Кишиневі таблички є майже скрізь.',
      'Зайди в кафе чи магазин — там допоможуть і викличуть таксі.',
      'Виклич таксі: 14444 або 14222. Покажи адресу готелю з екрана.',
      'Якщо щось серйозне — 112.',
    ],
    ua: [
      'Зупинись і зорієнтуйся за назвою вулиці або найближчою станцією метро.',
      'Метро — найнадійніший спосіб дістатись куди завгодно, і водночас укриття.',
      'Виклич таксі через застосунок — ціна буде фіксована.',
      'Якщо потрібна допомога — 112.',
    ],
  };
  const en: Record<string, string[]> = {
    ma: [
      'Stop. Do not keep walking at random — in the medina that only makes it worse.',
      'Find a landmark: the Koutoubia minaret is visible almost everywhere, or head for the nearest gate (Bab).',
      'Get to a wide, busy street and flag a petit taxi. Show the driver your riad address from this screen.',
      'Call your people. If you need help right now — tourist police, or 190.',
    ],
    md: [
      'Stop and check the street name — Chișinău has signs almost everywhere.',
      'Step into a café or shop — they will help and call you a taxi.',
      'Call a taxi: 14444 or 14222. Show the hotel address from this screen.',
      'If it is serious — 112.',
    ],
    ua: [
      'Stop and orient yourself by the street name or the nearest metro station.',
      'The metro is the most reliable way to get anywhere, and doubles as a shelter.',
      'Order a taxi through an app — the price will be fixed.',
      'If you need help — 112.',
    ],
  };
  return (lang === 'en' ? en : uk)[COUNTRY_OF[city]] ?? [];
}

function Card({ e }: { e: Emergency }) {
  const { t, lang } = useT();
  const dial = e.tel ?? e.number;
  const body = (
    <>
      <div className="row" style={{ gap: 'var(--s3)' }}>
        <span style={{
          flex: '0 0 44px', width: 44, height: 44, borderRadius: 'var(--r-ctl)',
          background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
        }}>
          <Icon name={KIND_ICON[e.kind]} size={18} color={KIND_COLOR[e.kind]} />
        </span>
        <span className="grow" style={{ minWidth: 0 }}>
          <span className="tiny muted" style={{ display: 'block' }}>{t(`sos.kinds.${e.kind}` as const)}</span>
          <span style={{ display: 'block', fontWeight: 800, lineHeight: 1.3 }}>{tr(e.title, lang)}</span>
        </span>
        {e.number ? (
          <span className="num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)' }}>{e.number}</span>
        ) : dial ? (
          <Icon name="phone" size={18} color="var(--red)" />
        ) : null}
      </div>
      {e.address && <span className="tiny muted" style={{ display: 'block', marginTop: 8 }}>{e.address}</span>}
      {e.hours && <span className="tiny faint" style={{ display: 'block' }}>{token(e.hours, lang)}</span>}
      {e.note && <span className="small muted" style={{ display: 'block', marginTop: 8 }}>{tr(e.note, lang)}</span>}
    </>
  );

  return dial
    ? <a href={`tel:${dial}`} className="card" style={{ textDecoration: 'none', display: 'block', borderColor: 'var(--line)' }}>{body}</a>
    : <div className="card">{body}</div>;
}

export default function SosPage() {
  const { t, lang } = useT();
  const city = useStore((s) => s.city);
  const stay = useStore((s) => s.stays[city]);
  const { data: all, loading } = useData('emergency');
  const [copied, setCopied] = useState(false);

  const list = useMemo(() => {
    const country = COUNTRY_OF[city];
    return (all ?? [])
      .filter((e) => e.city === city || e.city === country || e.city === '*')
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  }, [all, city]);

  const copyStay = async () => {
    if (!stay) return;
    try { await navigator.clipboard.writeText(`${stay.name}\n${stay.address}`); } catch { /* denied */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      <div style={{
        background: 'var(--red)', color: 'var(--on-red)', borderRadius: 'var(--r-card)',
        padding: 'var(--s5)', margin: '0 0 0',
      }}>
        <div className="row" style={{ gap: 'var(--s3)' }}>
          <Icon name="shield-half" size={30} />
          <div className="grow">
            <h1 style={{ color: 'var(--on-red)', fontSize: 26 }}>{t('sos.title')}</h1>
            <p className="small" style={{ margin: '4px 0 0', opacity: .9 }}>{t('sos.lead')}</p>
          </div>
        </div>
      </div>

      {stay && (
        <div className="card stack" style={{ gap: 'var(--s3)', borderColor: 'var(--gold)' }}>
          <span className="row small" style={{ gap: 8, fontWeight: 800 }}>
            <Icon name="house" size={14} color="var(--gold-deep)" /> {t('sos.myStay')}
          </span>
          <div className="stack" style={{ gap: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>{stay.name}</span>
            <span className="small muted">{stay.address}</span>
          </div>
          <button className="btn btn-gold" onClick={() => void copyStay()}>
            <Icon name={copied ? 'check' : 'copy'} size={13} />
            {copied ? t('common.copied') : t('places.copyAddress')}
          </button>
        </div>
      )}

      {loading ? <Spinner /> : (
        <div className="stack" style={{ gap: 'var(--s3)' }}>
          {list.map((e) => <Card key={e.id} e={e} />)}
        </div>
      )}

      <Section icon="compass" title={t('sos.lost')} note={t('sos.lostSteps')}>
        <ol className="card stack" style={{ gap: 'var(--s4)', listStyle: 'none', margin: 0 }}>
          {lostSteps(city, lang).map((s, i) => (
            <li key={s} className="row" style={{ alignItems: 'flex-start', gap: 'var(--s3)' }}>
              <span style={{
                flex: '0 0 30px', width: 30, height: 30, borderRadius: '50%',
                background: 'var(--red-soft)', color: 'var(--red-strong)',
                display: 'grid', placeItems: 'center', fontWeight: 800,
                fontFamily: 'var(--font-display)', fontSize: 14,
              }}>{i + 1}</span>
              <span className="grow small" style={{ lineHeight: 1.45 }}>{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      <p className="tiny faint" style={{ margin: 0 }}>
        <Icon name="info" size={11} /> {t('sos.verifyNote')}
      </p>
    </div>
  );
}
