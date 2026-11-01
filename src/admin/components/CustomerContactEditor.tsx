import { useEffect, useId, useState } from 'react';
import type { Customer } from '../../types';
import { updateCustomer } from '../../api/adminApi';
import { errorMessage } from '../../utils/errors';

type Props = {
  customer: Customer;
  onCustomerUpdated: (customer: Customer) => void | Promise<void>;
};

const contactFields = [
  { key: 'first_name', label: 'Vorname', type: 'text', autoComplete: 'given-name', required: true },
  { key: 'last_name', label: 'Nachname', type: 'text', autoComplete: 'family-name', required: false },
  { key: 'phone', label: 'Telefonnummer', type: 'tel', autoComplete: 'tel', required: false },
  { key: 'email', label: 'E-Mail', type: 'email', autoComplete: 'email', required: false },
] as const;

function contactValues(customer: Customer) {
  return {
    first_name: customer.first_name || '', last_name: customer.last_name || '',
    phone: customer.phone || '', email: customer.email || '',
  };
}

export default function CustomerContactEditor({ customer, onCustomerUpdated }: Props) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => contactValues(customer));

  useEffect(() => {
    const guard = (event: Event) => {
      if (saving) { event.preventDefault(); return; }
      if (editing) {
        event.preventDefault();
        if (window.confirm('Bearbeitung abbrechen und nicht gespeicherte Änderungen verwerfen?')) {
          setEditing(false);
        }
      }
    };
    window.addEventListener('admin:before-back', guard);
    return () => window.removeEventListener('admin:before-back', guard);
  }, [editing, saving]);

  async function save() {
    if (saving) return;
    const updates = {
      first_name: form.first_name.trim(), last_name: form.last_name.trim(),
      phone: form.phone.trim(), email: form.email.trim(),
    };
    if (!updates.first_name) {
      setError('Bitte einen Vornamen eingeben.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const updated = await updateCustomer(customer.id, updates);
      await onCustomerUpdated(updated);
      setEditing(false);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Kundendaten konnten nicht gespeichert werden.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="address-header">
        <h2>{customer.first_name} {customer.last_name}</h2>
        {!editing && <button type="button" className="address-edit-btn" onClick={() => {
          setForm(contactValues(customer)); setError(''); setEditing(true);
        }}>Kundendaten bearbeiten</button>}
      </div>
      <p><strong>Kundennummer:</strong> {customer.customer_number}</p>
      {editing ? (
        <form className="address-edit-form" onSubmit={event => { event.preventDefault(); void save(); }}>
          {contactFields.map(field => (
            <label key={field.key} htmlFor={`${id}-${field.key}`}>
              {field.label}
              <input id={`${id}-${field.key}`} type={field.type} autoComplete={field.autoComplete}
                required={field.required} disabled={saving} value={form[field.key]}
                onChange={event => setForm(previous => ({ ...previous, [field.key]: event.target.value }))} />
            </label>
          ))}
          {error && <p className="address-error" role="alert">{error}</p>}
          <div className="address-actions">
            <button type="button" className="secondary-btn" disabled={saving} onClick={() => setEditing(false)}>Abbrechen</button>
            <button type="submit" className="primary-btn" disabled={saving} aria-busy={saving}>
              {saving ? 'Speichern…' : 'Änderungen speichern'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <p><strong>Telefon:</strong> {customer.phone || '-'}</p>
          <p><strong>E-Mail:</strong> {customer.email || '-'}</p>
        </>
      )}
    </>
  );
}
