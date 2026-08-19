import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/format';

const VARIANTS = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover shadow-subtle',
  secondary: 'bg-surface border border-border text-ink hover:bg-surface-hover shadow-subtle',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface-hover',
  danger: 'bg-danger text-white hover:opacity-90 shadow-subtle',
  link: 'text-primary hover:text-primary-hover underline-offset-4 hover:underline p-0 h-auto',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9.5 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  icon: Icon,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        VARIANTS[variant],
        variant !== 'link' && SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  );
}
