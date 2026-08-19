import { Loader2 } from 'lucide-react';

export default function PageSpinner() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
      <Loader2 size={22} className="animate-spin text-primary" />
    </div>
  );
}
