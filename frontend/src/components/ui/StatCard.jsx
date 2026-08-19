import { cn } from '../../utils/format';
import { CardSkeleton } from './Skeleton';

export default function StatCard({ icon: Icon, label, value, hint, tone = 'primary', loading }) {
  if (loading) return <CardSkeleton />;

  const toneMap = {
    primary: 'bg-primary-soft text-primary',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card transition-shadow hover:shadow-popover">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', toneMap[tone])}>
          <Icon size={17} />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</div>
      {hint && <div className="mt-1.5 text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}
