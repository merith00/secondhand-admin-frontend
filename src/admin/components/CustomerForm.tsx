import type { CustomerFormData } from '../../types';

type CustomerFormProps = {
  formData: CustomerFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function CustomerForm({
  formData,
  onChange,
  onSubmit,
}: CustomerFormProps) {
  return (
    <section className="card">
      <h3>Neuen Kunden anlegen</h3>

      <form className="form-grid" onSubmit={onSubmit}>
        <input
          name="first_name"
          placeholder="Vorname"
          value={formData.first_name}
          onChange={onChange}
          required
        />

        <input
          name="last_name"
          placeholder="Nachname"
          value={formData.last_name}
          onChange={onChange}
          required
        />

        <input
          name="city"
          placeholder="Ort"
          value={formData.city}
          onChange={onChange}
        />

        <input
          name="phone"
          placeholder="Telefon"
          value={formData.phone}
          onChange={onChange}
        />

        <input
          name="email"
          placeholder="E-Mail"
          value={formData.email}
          onChange={onChange}
        />

        <button type="submit" className="primary-btn">
          Kunde speichern
        </button>
      </form>
    </section>
  );
}