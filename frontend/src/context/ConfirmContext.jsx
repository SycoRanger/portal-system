import { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const handle = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!state} onClose={() => handle(false)} size="sm">
        {state && (
          <div className="p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">{state.title || 'Are you sure?'}</h3>
            <p className="mt-1.5 text-sm text-ink-muted">{state.description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => handle(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => handle(true)}>{state.confirmLabel || 'Delete'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
