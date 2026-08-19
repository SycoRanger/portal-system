import { cn } from '../../utils/format';

export default function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-md', className)} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="p-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-border px-3 py-3.5 last:border-0">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={c === 0 ? 'h-4 w-1/4' : 'h-4 flex-1'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  );
}
