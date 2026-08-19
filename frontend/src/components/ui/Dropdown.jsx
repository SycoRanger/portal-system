import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/format';

export default function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({
        top: r.bottom + window.scrollY + 6,
        left: align === 'right' ? r.right + window.scrollX - 176 : r.left + window.scrollX,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <div ref={btnRef} onClick={toggle}>{trigger}</div>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: 'absolute', top: pos.top, left: pos.left }}
            className="z-[95] w-44 animate-scale-in rounded-xl border border-border bg-surface p-1.5 shadow-popover"
          >
            {typeof children === 'function' ? children(() => setOpen(false)) : children}
          </div>,
          document.body
        )}
    </>
  );
}

export function DropdownItem({ icon: Icon, danger, className, children, ...props }) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
        danger ? 'text-danger hover:bg-danger-soft' : 'text-ink hover:bg-surface-hover',
        className
      )}
      {...props}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}
