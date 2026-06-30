import type { CustomerCredit } from '../../types';

type CustomerCreditsTableProps = {
  credits: CustomerCredit[];
  loading: boolean;
  onReload: () => void;
  onCustomerClick: (customerId: number) => void;
};

export default function CustomerCreditsTable({
  credits,
  loading,
  onReload,
  onCustomerClick,
}: CustomerCreditsTableProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h3>Guthabenübersicht pro Kunde</h3>
        <button className="secondary-btn" onClick={onReload}>
          Neu laden
        </button>
      </div>

      {loading ? (
        <p>Lade Guthaben...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Kundennr.</th>
                <th>Name</th>
                <th>Verkaufte Teile</th>
                <th>Gekaufte Teile</th>
                <th>Summe von Verkäufen</th>
                <th>Summe von Käufen</th>
                <th style={{ fontWeight: 800, color: 'black' }}>Aktuelles Guthaben</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((credit) => (
                <tr key={credit.id}>
                  <td>{credit.customer_number}</td>
                  <td>
                    <button
                      className="link-button"
                      onClick={() => onCustomerClick(credit.id)}
                    >
                      {credit.first_name} {credit.last_name}
                    </button>
                  </td>
                  <td>{Number(credit.sold_items_count)}</td>
                  <td>{Number(credit.bought_items_count)}</td>
                  <td>{Number(credit.total_credit_earned).toFixed(2)} €</td>
                  <td>{Number(credit.total_credit_spent).toFixed(2)} €</td>
                  <td
                    style={{
                      fontWeight: 800,
                      color:
                        Number(credit.credit_balance) > 0
                          ? '#16a34a'
                          : Number(credit.credit_balance) < 0
                            ? '#dc2626'
                            : '#ca8a04',
                    }}
                  >
                    {Number(credit.credit_balance).toFixed(2)} €
                  </td>                </tr>
              ))}

              {credits.length === 0 && (
                <tr>
                  <td colSpan={4}>Noch keine Guthabendaten vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}