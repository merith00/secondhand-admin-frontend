import type { Customer, Item, Sale } from '../../types';
import ItemImageShow from './ItemImageShow';

type CustomerDetailPageProps = {
  customerId: number;
  customers: Customer[];
  items: Item[];
  sales: Sale[];
  onBack: () => void;
};

export default function CustomerDetailPage({
  customerId,
  customers,
  items,
  sales,
  onBack,
}: CustomerDetailPageProps) {
  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <section className="card">
        <p>Kunde wurde nicht gefunden.</p>
        <button onClick={onBack}>Zurück</button>
      </section>
    );
  }

  const customerItems = items.filter(
    (item) => item.owner_customer_id === customerId
  );

  const soldItems = customerItems.filter((item) =>
    sales.some((sale) => sale.item_id === item.id)
  );

  const availableItems = customerItems.filter((item) =>
    !sales.some((sale) => sale.item_id === item.id)
  );

  const purchasedSales = sales.filter(
    (sale) => sale.buyer_customer_id === customerId
  );

  const purchasedItems = purchasedSales
    .map((sale) =>
      items.find((item) => item.id === sale.item_id)
    )
    .filter(Boolean);

  return (
    <div className="customer-page">


        <button className="secondary-btn back-btn" onClick={onBack}>
          ← Zurück zur Kundenliste
        </button>

        <div className="customer-grid">
          <section className="card">
            <div className="customer-info-grid">
              <div>
                <h2>{customer.first_name} {customer.last_name}</h2>
                <p><strong>Kundennummer:</strong> {customer.customer_number}</p>
                <p><strong>Telefon:</strong> {customer.phone || '-'}</p>
                <p><strong>E-Mail:</strong> {customer.email || '-'}</p>
              </div>

              <div>
                <h2>Adresse</h2>
                <p><strong>Ort:</strong> {customer.city || '-'}</p>
                <p><strong>Straße:</strong> {customer.street || '-'}</p>
                <p><strong>Hausnummer:</strong> {customer.house_number || '-'}</p>
                <p><strong>Postleitzahl:</strong> {customer.postal_code || '-'}</p>
              </div>
            </div>
          </section>

        <section className="card">
          <h2>Übersicht</h2>
          <p><strong>Abgegebene Kleidung:</strong> {availableItems.length + soldItems.length}</p>
          <p><strong>Verkauft:</strong> {soldItems.length}</p>
          <p><strong>Noch vorhanden:</strong> {availableItems.length}</p>
          <p><strong>Gekauft:</strong> {purchasedItems.length}</p>
        </section>
        </div>

      <section className="card">
        <h3>Noch vorhandene Kleidung</h3>
        <table>
          <thead>
            <tr>
              <th>Bild</th>
              <th>Titel</th>
              <th>Kategorie</th>
              <th>Größe</th>
              <th>Verfügbar seit</th>
              <th>Preis</th>

            </tr>
          </thead>
          <tbody>
            {availableItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <ItemImageShow imageUrl={item.image_url} />
                </td>
                <td>{item.title}</td>
                <td>{item.category || '-'}</td>
                <td>{item.size || '-'}</td>
                <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                <td>{item.start_price} €</td>

              </tr>
            ))}

            {soldItems.length > 0 && (

              <tr>
                <td colSpan={5}>Summe:</td>
                <td><strong>
                  {availableItems
                    .reduce((sum, item) => sum + Number(item.start_price), 0)
                    .toFixed(2)} €
                 </strong></td>
             </tr>
            )}
            {availableItems.length === 0 && (
              <tr>
                <td colSpan={6}>Keine vorhandenen Artikel.</td>
              </tr>
            )}

          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Verkaufte Kleidung</h3>

        <table>
          <thead>
            <tr>
              <th>Bild</th>
              <th>Titel</th>
              <th>Kategorie</th>
              <th>Größe</th>
              <th>Verkauf am</th>
              <th>Angedachte Preis</th>
              <th>Verkaufspreis</th>
              <th>Shopanteil</th>
              <th>Verkauferanteil</th>
            </tr>
          </thead>
          <tbody>
            {soldItems.map((item) => (
              <tr key={item.id} >
                <td>
                  <ItemImageShow imageUrl={item.image_url} />
                </td>
                <td>{item.category || '-'}</td>
                <td>{item.size || '-'}</td>
                <td>{item.sold_at ? new Date(item.sold_at).toLocaleDateString() : '-'}</td>
                <td>{item.start_price} €</td>
                <td>{item.verkaufspreis} €</td>
                <td>{item.shopAnteil} €</td>
                <td>{item.verkauferAnteil} €</td>
              </tr>
            ))}


            {soldItems.length > 0 && (
              <tr>
                <td colSpan={8}>Summe:</td>
                <td><strong>
                  {soldItems
                    .reduce((sum, item) => sum + Number(item.verkaufspreis), 0)
                    .toFixed(2)} €
                </strong>
                </td>
              </tr>
            )}

            {soldItems.length === 0 && (
              <tr>
                <td colSpan={6}>Noch keine verkauften Artikel.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Gekaufte Kleidung</h3>

        <table>
          <thead>
            <tr>
              <th>Bild</th>
              <th>Titel</th>
              <th>Kategorie</th>
              <th>Größe</th>
              <th>Gekauft von</th>
              <th>Verkaufspreis</th>
            </tr>
          </thead>

          <tbody>
            {purchasedItems.map((item) => (
              <tr key={item!.id}>
                <td>
                  <ItemImageShow imageUrl={item!.image_url} />
                </td>
                <td>{item!.title}</td>
                <td>{item!.category || '-'}</td>
                <td>{item!.size || '-'}</td>
                <td>{item!.customer_number || '-'}</td>
                <td>{item!.verkaufspreis} €</td>
              </tr>
            ))}

            {purchasedItems.length > 0 && (
              <tr>
                <td colSpan={5}>Summe:</td>
                <td><strong>
                  {purchasedItems
                    .reduce((sum, item) => sum + Number(item!.verkaufspreis), 0)
                    .toFixed(2)} €
                </strong></td>
              </tr>
            )}

            {purchasedItems.length === 0 && (
              <tr>
                <td colSpan={5}>
                  Noch keine gekauften Artikel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}