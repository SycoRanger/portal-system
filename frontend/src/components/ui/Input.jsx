import { cn } from '../../utils/format';

export default function Input({ label, error, className, id, required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}{required && <span className="text-danger"> *</span>}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'h-10 rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'transition-colors',
          error && 'border-danger focus:ring-danger/30 focus:border-danger',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
