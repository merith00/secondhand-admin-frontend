import type { Item } from '../../types';
import ItemImageShow from './ItemImageShow';

type ItemTableProps = {
  items: Item[];
  loading: boolean;
  onReload: () => void;
  onToggleOnline: (itemId: number, isVisible: boolean) => void;
};

export default function ItemTable({
  items,
  loading,
  onReload,
  onToggleOnline,
}: ItemTableProps) {


  return (
    <section className="card">
      <div className="card-header">
        <h3>Kleidungsstücke</h3>
        <button className="secondary-btn" onClick={onReload}>
          Neu laden
        </button>
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
                <tr key={item.id}>
                  <td>
                    <ItemImageShow imageUrl={item.image_url} />
                  </td>
                  <td>{item.title}</td>
                  <td>{item.brand || '-'}</td>
                  <td>{item.category || '-'}</td>
                  <td>{item.size || '-'}</td>
                  <td>{item.color || '-'}</td>
                  <td>{Number(item.price).toFixed(2)} €</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>
                    <input
                      type="checkbox"
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
                  <td colSpan={9}>Noch keine Kleidungsstücke vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

