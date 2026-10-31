import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} tabIndex={-1} aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }} onKeyDown={event => {
    if (event.key !== 'Tab' || !ref.current) return;
    const dialog = ref.current;
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
    const first = controls[0], last = controls.at(-1);
    if (!first) { event.preventDefault(); dialog.focus(); }
    else if (event.shiftKey ? document.activeElement === first : document.activeElement === last) {
      event.preventDefault(); (event.shiftKey ? last : first)?.focus();
    }
  }} onClick={e => { if (e.target === e.currentTarget) onClose(); }} className="m-auto w-[calc(100%_-_2rem)] max-w-4xl max-h-[85vh] overflow-y-auto rounded-xl p-0 bg-transparent text-white backdrop:bg-slate-950/60">{children}</dialog>;
}
