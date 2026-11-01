import './CompactTables.css';
import useTableSearch from './useTableSearch';
import TableSearch from './TableSearch';
import useTableSort from './useTableSort';
import SortableHeader from './SortableHeader';
import type { Customer } from '../../types';

type CustomerTableProps = {
  customers: Customer[];
  loading: boolean;
  onCustomerClick: (customerId: number) => void;
};

export default function CustomerTable({
  customers,
  loading,
  onCustomerClick,
}: CustomerTableProps) {
  const { query, setQuery, filteredRows } = useTableSearch(customers, (customer) => [
    customer.customer_number,
    `${customer.first_name} ${customer.last_name}`,
    customer.city,
    customer.phone,
    customer.email,
    customer.is_active ? 'Aktiv' : 'Inaktiv',
  ]);
  const { sortedRows, sort, toggleSort } = useTableSort(filteredRows, {
    customer_number: (customer) => customer.customer_number,
    name: (customer) => `${customer.first_name} ${customer.last_name}`,
    city: (customer) => customer.city,
    phone: (customer) => customer.phone,
    email: (customer) => customer.email,
    status: (customer) => customer.is_active ? 'Aktiv' : 'Inaktiv',
  }, 'customer_number');

  return (
    <section className="card compact-table-card customer-list-card">
      <div className="card-header table-header-search">
        <h3>Kundenliste</h3>
      <TableSearch label="" query={query} onQueryChange={setQuery}
        count={filteredRows.length} total={customers.length} loading={loading} />
      </div>



      {loading ? (
        <p>Lade Kunden...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <SortableHeader direction={sort.key === 'customer_number' ? sort.direction : undefined} onSort={() => toggleSort('customer_number')}
                  >Kundennr.</SortableHeader>
                <SortableHeader direction={sort.key === 'name' ? sort.direction : undefined} onSort={() => toggleSort('name')}
                  >Name</SortableHeader>
                <SortableHeader direction={sort.key === 'city' ? sort.direction : undefined} onSort={() => toggleSort('city')}
                  >Ort</SortableHeader>
                <SortableHeader direction={sort.key === 'phone' ? sort.direction : undefined} onSort={() => toggleSort('phone')}
                  >Telefon</SortableHeader>
                <SortableHeader direction={sort.key === 'email' ? sort.direction : undefined} onSort={() => toggleSort('email')}
                  >E-Mail</SortableHeader>
                <SortableHeader direction={sort.key === 'status' ? sort.direction : undefined} onSort={() => toggleSort('status')}
                  >Status</SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.customer_number || '-'}</td>
                  <td>
                    <button
                      className="link-button"
                      onClick={() => onCustomerClick(customer.id)}
                    >
                      {customer.first_name} {customer.last_name}
                    </button>
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

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6}>{query.trim() ? 'Keine Treffer für diese Suche.' : 'Noch keine Kunden vorhanden.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}