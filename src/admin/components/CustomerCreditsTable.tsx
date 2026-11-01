import './CompactTables.css';
import useTableSearch from './useTableSearch';
import TableSearch from './TableSearch';
import useTableSort from './useTableSort';
import SortableHeader from './SortableHeader';
import { useState } from 'react';
import type { CustomerCredit } from '../../types';

type CustomerCreditsTableProps = {
  credits: CustomerCredit[];
  loading: boolean;
  onCustomerClick: (customerId: number) => void;
};

export default function CustomerCreditsTable({
  credits,
  loading,
  onCustomerClick,
}: CustomerCreditsTableProps) {

  const [onlyActiveCustomers] = useState(true);

  const visibleCredits = onlyActiveCustomers
    ? credits.filter(
      (credit) =>
        Number(credit.available_items_count) > 0 ||
        Number(credit.credit_balance) !== 0
    )
    : credits;
  const { query, setQuery, filteredRows } = useTableSearch(visibleCredits, (credit) => [
    credit.customer_number,
    `${credit.first_name} ${credit.last_name}`,
    Number(credit.sold_items_count),
    Number(credit.bought_items_count),
    Number(credit.available_items_count),
    Number(credit.total_items_count),
    Number(credit.total_credit_earned).toFixed(2),
    Number(credit.total_credit_spent).toFixed(2),
    Number(credit.credit_balance).toFixed(2),
  ]);
  const { sortedRows, sort, toggleSort } = useTableSort(filteredRows, {
    customer_number: (credit) => credit.customer_number,
    name: (credit) => `${credit.first_name} ${credit.last_name}`,
    sold_items_count: (credit) => Number(credit.sold_items_count),
    bought_items_count: (credit) => Number(credit.bought_items_count),
    available_items_count: (credit) => Number(credit.available_items_count),
    total_items_count: (credit) => Number(credit.total_items_count),
    total_credit_earned: (credit) => Number(credit.total_credit_earned),
    total_credit_spent: (credit) => Number(credit.total_credit_spent),
    credit_balance: (credit) => Number(credit.credit_balance),
  }, 'customer_number');

  return (
    <section className="card compact-table-card credits-table-card">
      <div className="card-header table-header-search">
        <h3>Guthabenübersicht pro Kunde</h3>

      <TableSearch label="" query={query} onQueryChange={setQuery}
        count={filteredRows.length} total={visibleCredits.length} loading={loading} />
      </div>




      {loading ? (
        <p>Lade Guthaben...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <SortableHeader direction={sort.key === 'customer_number' ? sort.direction : undefined} onSort={() => toggleSort('customer_number')}
                  >Nr.</SortableHeader>
                <SortableHeader direction={sort.key === 'name' ? sort.direction : undefined} onSort={() => toggleSort('name')}
                  >Name</SortableHeader>
                <SortableHeader direction={sort.key === 'sold_items_count' ? sort.direction : undefined} onSort={() => toggleSort('sold_items_count')}
                  >Verkaufte Teile</SortableHeader>
                <SortableHeader direction={sort.key === 'bought_items_count' ? sort.direction : undefined} onSort={() => toggleSort('bought_items_count')}
                  >Gekaufte Teile</SortableHeader>
                <SortableHeader direction={sort.key === 'available_items_count' ? sort.direction : undefined} onSort={() => toggleSort('available_items_count')}
                  >Vorhandene Teile</SortableHeader>
                <SortableHeader direction={sort.key === 'total_items_count' ? sort.direction : undefined} onSort={() => toggleSort('total_items_count')}
                  >Insgesamt</SortableHeader>
                <SortableHeader direction={sort.key === 'total_credit_earned' ? sort.direction : undefined} onSort={() => toggleSort('total_credit_earned')}
                  >Verkäufen</SortableHeader>
                <SortableHeader direction={sort.key === 'total_credit_spent' ? sort.direction : undefined} onSort={() => toggleSort('total_credit_spent')}
                  >Käufen</SortableHeader>
                <SortableHeader direction={sort.key === 'credit_balance' ? sort.direction : undefined} onSort={() => toggleSort('credit_balance')}
                  style={{ fontWeight: 800, color: 'black' }}>Guthaben</SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((credit) => (
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
                  <td>{Number(credit.available_items_count)}</td>
                  <td>{Number(credit.total_items_count)}</td>
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

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={9}>{query.trim() ? 'Keine Treffer für diese Suche.' : 'Noch keine Guthabendaten vorhanden.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
