import { Icon } from './Icon';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="stack" style={{ alignItems: 'center', padding: 'var(--s10) 0', gap: 'var(--s3)' }} role="status">
      <Icon name="spinner" size={22} spin color="var(--gold)" />
      {label && <span className="small muted">{label}</span>}
    </div>
  );
}
