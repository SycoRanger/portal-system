import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, compact }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16'}`}>
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
          <Icon size={26} className="text-primary" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-ink-muted">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-5" size="sm" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
