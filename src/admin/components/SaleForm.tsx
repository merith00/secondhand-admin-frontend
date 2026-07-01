import { useEffect, useMemo, useState } from 'react';
import type { Customer, Item, SaleFormData } from '../../types';

type SaleFormProps = {
  formData: SaleFormData;
  customers: Customer[];
  items: Item[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function SaleForm({
  formData,
  customers,
  items,
  onChange,
  onSubmit,
}: SaleFormProps) {
  const [selectedSellerId, setSelectedSellerId] = useState('');

  const sellableItems = items.filter(
    (item) => item.status !== 'sold' && item.status !== 'withdrawn'
  );

  const sellersWithItems = useMemo(() => {
    const sellerIds = new Set(
      sellableItems.map((item) => item.owner_customer_id)
    );

    return customers.filter((customer) => sellerIds.has(customer.id));
  }, [customers, sellableItems]);

  const sellerItems = sellableItems.filter(
    (item) => String(item.owner_customer_id) === selectedSellerId
  );


  const changeField = (name: string, value: string) => {
    onChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleSellerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sellerId = e.target.value;

    setSelectedSellerId(sellerId);

    changeField('item_id', '');
    changeField('sale_price', '');
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e);

    const selectedItem = items.find(
      (item) => String(item.id) === e.target.value
    );

    if (selectedItem) {
      changeField('sale_price', String(selectedItem.start_price));
    }
  };

  const grossPrice = Number(formData.sale_price || 0);
  const netPrice = grossPrice / 1.19;
  const vatAmount = grossPrice - netPrice; //MwSt. 

  const sellerSharePercent = Number(formData.seller_share_percent || 40);
  const shopSharePercent = Number(formData.shop_share_percent || 60);

  const sellerAmount = (grossPrice * sellerSharePercent) / 100 - vatAmount;
  const shopAmount = (grossPrice * shopSharePercent) / 100;


  useEffect(() => {
  onChange({
    target: {
      name: 'owner_amount',
      value: Number(sellerAmount.toFixed(2)),
    },
  } as any);

  onChange({
    target: {
      name: 'shop_amount',
      value: Number(shopAmount.toFixed(2)),
    },
  } as any);
}, [sellerAmount, shopAmount]);

  return (
    <section className="card">
      <h3>Verkauf erfassen</h3>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Verkäufer</label>
          <select
            name="seller_customer_id"
            value={selectedSellerId}
            onChange={handleSellerChange}
            required
          >
            <option value="">Verkäufer auswählen</option>
            {sellersWithItems.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_number} - {customer.first_name} {customer.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Kleidungsstück</label>
          <select
            name="item_id"
            value={formData.item_id}
            onChange={handleItemChange}
            required
            disabled={!selectedSellerId}
          >
            <option value="">Kleidungsstück auswählen</option>
            {sellerItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} - {item.id}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Käufer</label>
          <select
            name="buyer_customer_id"
            value={formData.buyer_customer_id}
            onChange={onChange}
          >
            <option value="">Käufer auswählen</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_number} - {customer.first_name} {customer.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Brutto-Verkaufspreis</label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1px',
              alignItems: 'end',
            }}
          >
            <input
              name="sale_price"
              type="number"
              step="0.01"
              value={formData.sale_price}
              onChange={onChange}
              required
            />

            <div
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px 12px',
                background: '#fafafa',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Netto</div>
              <strong style={{ fontSize: '0.7rem' }}>{netPrice.toFixed(2)} €</strong>
            </div>

            <div
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px 12px',
                background: '#fafafa',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#666' }}>MwSt.</div>
              <strong style={{ fontSize: '0.7rem' }}>{vatAmount.toFixed(2)} €</strong>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Verkaufsart</label>
          <select
            name="sale_type"
            value={formData.sale_type}
            onChange={onChange}
          >
            <option value="store">Verkauf im Laden</option>
            <option value="online">Onlineverkauf</option>
          </select>
        </div>

        <div className="form-group">
          <label>Zahlungsart</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={onChange}
          >
            <option value="cash">Bar</option>
            <option value="bank_transfer">Überweisung</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notizen</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={onChange}
            rows={4}
          />
        </div>

        <div className="info-box">
          <h4
            style={{
              margin: '0 0 16px',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Erlösverteilung
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.9rem',
                  color: '#666',
                }}
              >
                Verkäufer  (%)
              </label>

              <input
                name="seller_share_percent"
                type="number"
                value={formData.seller_share_percent || '40'}
                onChange={onChange}
                min="0"
                max="100"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.9rem',
                  color: '#666',
                }}
              >
                Shop (%)
              </label>

              <input
                name="shop_share_percent"
                type="number"
                value={formData.shop_share_percent || '60'}
                onChange={onChange}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Netto-Verkaufspreis</span>
              <strong>{netPrice.toFixed(2)} €</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Verkäufer erhält</span>
              <strong style={{ color: '#16a34a' }}>
                {sellerAmount.toFixed(2)} €
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Shop erhält</span>
              <strong style={{ color: '#2563eb' }}>
                {shopAmount.toFixed(2)} €
              </strong>
            </div>
          </div>
        </div>

        <button type="submit" className="primary-btn">
          Verkauf speichern
        </button>
      </form>
    </section>
  );
}