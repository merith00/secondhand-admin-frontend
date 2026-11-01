import './CompactTables.css';
import useTableSearch from './useTableSearch';
import TableSearch from './TableSearch';
import useTableSort from './useTableSort';
import SortableHeader from './SortableHeader';
import type { Item } from '../../types';
import ItemImageShow from './ItemImageShow';

type ItemTableProps = {
  items: Item[];
  loading: boolean;
  onItemClick: (itemId: number) => void;
  onToggleOnline: (itemId: number, isVisible: boolean) => void;
};

export default function ItemTable({
  items,
  loading,
  onToggleOnline,
  onItemClick,
}: ItemTableProps) {


  const { query, setQuery, filteredRows } = useTableSearch(items, (item) => [
    `#${item.id}`,
    item.image_url ? 'mit Bild' : 'ohne Bild',
    item.title,
    item.brand,
    item.category,
    item.size,
    item.color,
    Number(item.start_price).toFixed(2),
    item.customer_number,
    `${item.first_name} ${item.last_name}`,
    item.is_online_visible === 1 ? 'online' : 'offline',
    item.status,
  ]);
  const { sortedRows, sort, toggleSort } = useTableSort(filteredRows, {
    id: (item) => item.id,
    image: (item) => item.image_url ? 1 : 0,
    title: (item) => item.title,
    brand: (item) => item.brand,
    category: (item) => item.category,
    size: (item) => item.size,
    color: (item) => item.color,
    price: (item) => Number(item.start_price),
    customer_number: (item) => item.customer_number,
    owner: (item) => `${item.first_name} ${item.last_name}`,
    online: (item) => Number(item.is_online_visible),
    status: (item) => item.status,
  }, 'customer_number');

  return (
    <section className="card compact-table-card item-list-card">
      <div className="card-header table-header-search">
        <h3>Kleidungsstücke</h3>
        <TableSearch label="" query={query} onQueryChange={setQuery}
        count={filteredRows.length} total={items.length} loading={loading} />
      </div>

      {loading ? (
        <p>Lade Kleidungsstücke...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <SortableHeader
                  direction={sort.key === 'id' ? sort.direction : undefined}
                  onSort={() => toggleSort('id')}
                >ID</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'image' ? sort.direction : undefined}
                  onSort={() => toggleSort('image')}
                >Bild</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'title' ? sort.direction : undefined}
                  onSort={() => toggleSort('title')}
                >Titel</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'brand' ? sort.direction : undefined}
                  onSort={() => toggleSort('brand')}
                >Marke</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'category' ? sort.direction : undefined}
                  onSort={() => toggleSort('category')}
                >Kategorie</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'size' ? sort.direction : undefined}
                  onSort={() => toggleSort('size')}
                >Größe</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'color' ? sort.direction : undefined}
                  onSort={() => toggleSort('color')}
                >Farbe</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'price' ? sort.direction : undefined}
                  onSort={() => toggleSort('price')}
                >Preis</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'customer_number' ? sort.direction : undefined}
                  onSort={() => toggleSort('customer_number')}
                >Kundennr.</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'owner' ? sort.direction : undefined}
                  onSort={() => toggleSort('owner')}
                >Eigentümer</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'online' ? sort.direction : undefined}
                  onSort={() => toggleSort('online')}
                >Im Onlineshop</SortableHeader>
                <SortableHeader
                  direction={sort.key === 'status' ? sort.direction : undefined}
                  onSort={() => toggleSort('status')}
                >Status</SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((item) => (
                <tr key={item.id} className="item-clickable-row" onClick={() => onItemClick(item.id)}>
                  <td>#{item.id}</td>
                  <td>
                    <ItemImageShow imageUrl={item.image_url} size={40} />
                  </td>
                  <td><button type="button" className="link-button" onClick={(event) => { event.stopPropagation(); onItemClick(item.id); }} aria-label={`Details zu ${item.title} anzeigen`}>{item.title}</button></td>
                  <td>{item.brand || '-'}</td>
                  <td>{item.category || '-'}</td>
                  <td>{item.size || '-'}</td>
                  <td>{item.color || '-'}</td>
                  <td>{Number(item.start_price).toFixed(2)} €</td>
                  <td>{item.customer_number || '-'}</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${item.title} im Onlineshop anzeigen`}
                      onClick={(event) => event.stopPropagation()}
                      checked={item.is_online_visible === 1}
                      onChange={(e) => onToggleOnline(item.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <span className="badge neutral">{item.status}</span>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={12}>{query.trim() ? 'Keine Treffer für diese Suche.' : 'Noch keine Kleidungsstücke vorhanden.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

