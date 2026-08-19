import { cn } from '../../utils/format';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-surface shadow-card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('flex items-center justify-between px-5 pt-5', className)}>{children}</div>;
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
