import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import './CompactTables.css';

type Props = { title: string; busy: boolean; error: string; success: string; onClose: () => void; children: ReactNode };

export default function EntryDialog({ title, busy, error, success, onClose, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);
  useEffect(() => {
    if (!success || busy) return;
    dialog.current?.querySelector<HTMLInputElement>('input[name="title"], input[name="customer_number"]')?.focus();
    const file = dialog.current?.querySelector<HTMLInputElement>('input[type="file"]');
    if (file) file.value = '';
  }, [success, busy]);
  return (
    <dialog ref={dialog} className="entry-dialog" aria-label={title} onCancel={event => event.preventDefault()}>
      <div className="entry-dialog-header">
        <h2>{title}</h2>
        <button type="button" className="secondary-btn" aria-label="Popup schließen" disabled={busy} onClick={onClose}>✕</button>
      </div>
      {error && <div className="error-box" role="alert">{error}</div>}
      {success && <p role="status" className="entry-success">{success}</p>}
      <fieldset disabled={busy} className="entry-dialog-fields" aria-busy={busy}>{children}</fieldset>
      {busy && <p role="status">Wird gespeichert …</p>}
    </dialog>
  );
}
