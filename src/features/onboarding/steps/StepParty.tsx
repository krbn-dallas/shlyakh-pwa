import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { CardChoice, StepShell } from './shared';

export function StepParty() {
  const { t } = useT();
  const party = useStore((s) => s.party);
  const setParty = useStore((s) => s.setParty);

  return (
    <StepShell title={t('onb.partyTitle')} lead={t('onb.partyLead')}>
      <div className="stack">
        <CardChoice active={!party.partner} onClick={() => setParty({ partner: false })}
          icon="user" title={t('onb.partySolo')} />
        <CardChoice active={party.partner} onClick={() => setParty({ partner: true })}
          icon="couple" title={t('onb.partyPartner')}
          note={t('check.forHim')} />
      </div>

      <div className="card row-between">
        <div className="row grow" style={{ gap: 'var(--s3)', minWidth: 0 }}>
          <span style={{
            flex: '0 0 40px', width: 40, height: 40, borderRadius: 'var(--r-ctl)',
            background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
          }}>
            <Icon name="baby" size={16} color="var(--muted)" />
          </span>
          <span className="grow" style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 800, fontSize: 15 }}>{t('onb.partyKids')}</span>
            <span className="tiny muted">{t('onb.partyKidsNote')}</span>
          </span>
        </div>
        <div className="row" style={{ gap: 'var(--s2)' }}>
          <button className="btn btn-ghost" style={{ minWidth: 40, padding: 0 }}
            onClick={() => setParty({ kids: Math.max(0, party.kids - 1) })}
            disabled={party.kids === 0} aria-label="-">
            <Icon name="minus" size={12} />
          </button>
          <span className="num" style={{ minWidth: 24, textAlign: 'center', fontWeight: 800, fontSize: 18 }}>
            {party.kids}
          </span>
          <button className="btn btn-ghost" style={{ minWidth: 40, padding: 0 }}
            onClick={() => setParty({ kids: Math.min(6, party.kids + 1) })} aria-label="+">
            <Icon name="plus" size={12} />
          </button>
        </div>
      </div>
    </StepShell>
  );
}
