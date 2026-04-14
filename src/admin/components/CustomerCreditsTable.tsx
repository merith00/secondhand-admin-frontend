import type { CustomerCredit } from '../../types';

type CustomerCreditsTableProps = {
  credits: CustomerCredit[];
  loading: boolean;
  onReload: () => void;
};

export default function CustomerCreditsTable({
  credits,
  loading,
  onReload,
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
                <th>Aktuelles Guthaben</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((credit) => (
                <tr key={credit.id}>
                  <td>{credit.customer_number}</td>
                  <td>
                    {credit.first_name} {credit.last_name}
                  </td>
                  <td>{Number(credit.sold_items_count)}</td>
                  <td>{Number(credit.credit_balance).toFixed(2)} €</td>
                </tr>
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