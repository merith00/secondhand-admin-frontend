import type { Customer } from '../../types';

type CustomerTableProps = {
  customers: Customer[];
  loading: boolean;
  onReload: () => void;
};

export default function CustomerTable({
  customers,
  loading,
  onReload,
}: CustomerTableProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h3>Kundenliste</h3>
        <button className="secondary-btn" onClick={onReload}>
          Neu laden
        </button>
      </div>

      {loading ? (
        <p>Lade Kunden...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Kundennr.</th>
                <th>Name</th>
                <th>Ort</th>
                <th>Telefon</th>
                <th>E-Mail</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.customer_number}</td>
                  <td>
                    {customer.first_name} {customer.last_name}
                  </td>
                  <td>{customer.city || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.email || '-'}</td>
                  <td>
                    <span
                      className={
                        customer.is_active ? 'badge active' : 'badge inactive'
                      }
                    >
                      {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td colSpan={6}>Noch keine Kunden vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}