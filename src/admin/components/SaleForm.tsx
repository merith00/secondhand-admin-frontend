import type { Item, SaleFormData } from '../../types';

type SaleFormProps = {
  formData: SaleFormData;
  items: Item[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function SaleForm({
  formData,
  items,
  onChange,
  onSubmit,
}: SaleFormProps) {
  const sellableItems = items.filter(
    (item) => item.status !== 'sold' && item.status !== 'withdrawn'
  );

  return (
    <section className="card">
      <h3>Verkauf erfassen</h3>

      <form className="form-grid" onSubmit={onSubmit}>
        <select
          name="item_id"
          value={formData.item_id}
          onChange={onChange}
          required
        >
          <option value="">Kleidungsstück auswählen</option>
          {sellableItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} - {item.first_name} {item.last_name}
            </option>
          ))}
        </select>

        <input
          name="sale_price"
          type="number"
          step="0.01"
          placeholder="Verkaufspreis"
          value={formData.sale_price}
          onChange={onChange}
          required
        />

        <select
          name="sale_type"
          value={formData.sale_type}
          onChange={onChange}
        >
          <option value="store">Verkauf im Laden</option>
          <option value="online">Onlineverkauf</option>
        </select>

        <select
          name="payment_method"
          value={formData.payment_method}
          onChange={onChange}
        >
          <option value="cash">Bar</option>
          <option value="bank_transfer">Überweisung</option>
        </select>

        <textarea
          name="notes"
          placeholder="Notiz"
          value={formData.notes}
          onChange={onChange}
          rows={4}
        />

        <div className="info-box">
          Eigentümer-Anteil: 50 % / Shop-Anteil: 50 %
        </div>

        <button type="submit" className="primary-btn">
          Verkauf speichern
        </button>
      </form>
    </section>
  );
}