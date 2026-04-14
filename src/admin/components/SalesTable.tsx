import type { Sale } from '../../types';

type SalesTableProps = {
  sales: Sale[];
  loading: boolean;
  onReload: () => void;
};

export default function SalesTable({
  sales,
  loading,
  onReload,
}: SalesTableProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h3>Verkaufshistorie</h3>
        <button className="secondary-btn" onClick={onReload}>
          Neu laden
        </button>
      </div>

      {loading ? (
        <p>Lade Verkäufe...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Artikel</th>
                <th>Eigentümer</th>
                <th>Verkaufspreis</th>
                <th>Eigentümer</th>
                <th>Shop</th>
                <th>Art</th>
                <th>Zahlung</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.sale_date).toLocaleString('de-DE')}</td>
                  <td>{sale.title}</td>
                  <td>
                    {sale.first_name} {sale.last_name}
                  </td>
                  <td>{Number(sale.sale_price).toFixed(2)} €</td>
                  <td>{Number(sale.owner_amount).toFixed(2)} €</td>
                  <td>{Number(sale.shop_amount).toFixed(2)} €</td>
                  <td>{sale.sale_type === 'store' ? 'Laden' : 'Online'}</td>
                  <td>{sale.payment_method === 'cash' ? 'Bar' : 'Überweisung'}</td>
                </tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td colSpan={8}>Noch keine Verkäufe vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}