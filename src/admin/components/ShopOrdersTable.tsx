import type { AdminShopOrder } from '../../types';

type ShopOrdersTableProps = {
  orders: AdminShopOrder[];
  loading: boolean;
  onReload: () => void;
};

function getStatusLabel(status: AdminShopOrder['order_status']) {
  switch (status) {
    case 'open':
      return 'Offen';
    case 'reserved':
      return 'Reserviert';
    case 'paid':
      return 'Bezahlt';
    case 'shipped':
      return 'Versendet';
    case 'completed':
      return 'Abgeschlossen';
    case 'cancelled':
      return 'Storniert';
    default:
      return status;
  }
}

function getPaymentLabel(paymentMethod: AdminShopOrder['payment_method']) {
  switch (paymentMethod) {
    case 'bank_transfer':
      return 'Überweisung';
    default:
      return paymentMethod;
  }
}

export default function ShopOrdersTable({
  orders,
  loading,
  onReload,
}: ShopOrdersTableProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h3>Online-Bestellungen</h3>
        <button className="secondary-btn" onClick={onReload}>
          Neu laden
        </button>
      </div>

      {loading ? (
        <p>Lade Bestellungen...</p>
      ) : orders.length === 0 ? (
        <p>Noch keine Online-Bestellungen vorhanden.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <h4>{order.order_number}</h4>
                  <p>
                    {new Date(order.created_at).toLocaleString('de-DE')}
                  </p>
                </div>

                <span className={`badge ${order.order_status === 'reserved' ? 'neutral' : 'active'}`}>
                  {getStatusLabel(order.order_status)}
                </span>
              </div>

              <div className="order-grid">
                <div>
                  <h5>Kunde</h5>
                  <p>
                    {order.first_name} {order.last_name}
                  </p>
                  <p>{order.email}</p>
                  {order.phone && <p>{order.phone}</p>}
                </div>

                <div>
                  <h5>Adresse</h5>
                  <p>
                    {order.street} {order.house_number || ''}
                  </p>
                  <p>
                    {order.postal_code} {order.city}
                  </p>
                </div>

                <div>
                  <h5>Bestellung</h5>
                  <p>Zahlungsart: {getPaymentLabel(order.payment_method)}</p>
                  <p>Gesamt: {Number(order.total_amount).toFixed(2)} €</p>
                </div>
              </div>

              <div className="order-items">
                <h5>Artikel</h5>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Artikel</th>
                        <th>Preis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.item_title}</td>
                          <td>{Number(item.item_price).toFixed(2)} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {order.notes && (
                <div className="order-notes">
                  <h5>Anmerkung</h5>
                  <p>{order.notes}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}