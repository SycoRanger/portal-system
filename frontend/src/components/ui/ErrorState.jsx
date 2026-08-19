import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft">
        <AlertCircle size={26} className="text-danger" />
      </div>
      <h3 className="text-sm font-semibold text-ink">Something went wrong</h3>
      <p className="mt-1 max-w-xs text-sm text-ink-muted">{message || 'Could not load this data.'}</p>
      {onRetry && <Button className="mt-5" size="sm" variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
