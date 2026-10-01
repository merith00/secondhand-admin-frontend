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


  return (
    <section className="card">
      <div className="card-header">
        <h3>Kleidungsstücke</h3>
      </div>

      {loading ? (
        <p>Lade Kleidungsstücke...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Bild</th>
                <th>Titel</th>
                <th>Marke</th>
                <th>Kategorie</th>
                <th>Größe</th>
                <th>Farbe</th>
                <th>Preis</th>
                <th>Eigentümer</th>
                <th>Im Onlineshop</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="item-clickable-row" onClick={() => onItemClick(item.id)}>
                  <td>
                    <ItemImageShow imageUrl={item.image_url} />
                  </td>
                  <td><button type="button" className="link-button" onClick={(event) => { event.stopPropagation(); onItemClick(item.id); }} aria-label={`Details zu ${item.title} anzeigen`}>{item.title}</button></td>
                  <td>{item.brand || '-'}</td>
                  <td>{item.category || '-'}</td>
                  <td>{item.size || '-'}</td>
                  <td>{item.color || '-'}</td>
                  <td>{Number(item.start_price).toFixed(2)} €</td>
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

              {items.length === 0 && (
                <tr>
                  <td colSpan={10}>Noch keine Kleidungsstücke vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

