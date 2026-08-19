import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/format';

export default function Select({ label, className, children, id, required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}{required && <span className="text-danger"> *</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-ink',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" />
      </div>
    </div>
  );
}
