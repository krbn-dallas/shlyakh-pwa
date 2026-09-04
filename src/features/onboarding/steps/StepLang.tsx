import { useStore } from '@/app/store';
import { translate } from '@/shared/i18n';
import { CardChoice, StepShell } from './shared';

export function StepLang() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  return (
    <StepShell title={translate(lang, 'onb.langTitle')} lead={translate(lang, 'onb.langLead')}>
      <div className="stack">
        <CardChoice active={lang === 'uk'} onClick={() => setLang('uk')} icon="language"
          title="Українська" note="Основна мова застосунку" />
        <CardChoice active={lang === 'en'} onClick={() => setLang('en')} icon="globe"
          title="English" note="Full English translation" />
      </div>
      <img src="/illustrations/hero-day.webp" alt="" width={1200} height={669}
        style={{ borderRadius: 'var(--r-card)', border: '1px solid var(--line)' }} />
    </StepShell>
  );
}
