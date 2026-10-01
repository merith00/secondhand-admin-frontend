import type { Customer, Item, Sale, AdminShopOrder } from '../../types';
import ItemImageShow from './ItemImageShow';

type Props = {
  item: Item | undefined;
  customers: Customer[];
  sales: Sale[];
  orders: AdminShopOrder[];
  loading: boolean;
  onBack: () => void;
  onCustomerClick: (customerId: number) => void;
};
const money = (value: number | undefined) => value == null ? '–' : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value));
function date(value?: string | null) {
  if (!value) return '–';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('de-DE');
}
const statuses: Record<string, string> = { available: 'Verfügbar', sold: 'Verkauft', reserved: 'Reserviert', withdrawn: 'Zurückgenommen' };
function Field({ label, value }: { label: string; value?: string | number | null }) {
  return <div><dt>{label}</dt><dd>{value == null || value === '' ? '–' : value}</dd></div>;
}

export default function ItemDetailPage({ item, customers, sales, orders, loading, onBack, onCustomerClick }: Props) {
  const back = <button type="button" className="secondary-btn" onClick={onBack}>← Zurück</button>;
  if (!item) return <section className="card">{back}<p role="status">{loading ? 'Kleidungsstück wird geladen…' : 'Dieses Kleidungsstück ist nicht mehr in der Übersicht vorhanden.'}</p></section>;
  const owner = customers.find(customer => customer.id === item.owner_customer_id);
  const itemSales = sales.filter(sale => sale.item_id === item.id);
  const itemOrders = orders.filter(order => order.items.some(entry => entry.item_id === item.id));
  return <div className="item-detail-page">
    <div className="customer-detail-toolbar">{back}</div>
    <section className="card item-detail-heading">
      <div className="item-detail-photo"><ItemImageShow imageUrl={item.image_url} size={320} /></div>
      <div><p className="item-detail-number">Kleidungsstück #{item.id}</p><h2>{item.title}</h2><span className="badge neutral">{statuses[item.status] || item.status}</span>
        <p className="item-detail-price">{money(item.start_price)}</p>
        <h3>Beschreibung / Kommentar</h3><p className="item-detail-description">{item.description || 'Keine Beschreibung hinterlegt.'}</p>
      </div>
    </section>
    <div className="item-detail-grid">
      <section className="card"><h3>Artikeldaten</h3><dl className="item-detail-fields">
        <Field label="Artikelnummer" value={item.id} /><Field label="Kategorie" value={item.category} />
        <Field label="Marke" value={item.brand} /><Field label="Größe" value={item.size} /><Field label="Farbe" value={item.color} />
        <Field label="Angedachter Preis" value={money(item.start_price)} />
        <Field label="Im Laden vorhanden" value={Number(item.is_in_store) === 1 ? 'Ja' : 'Nein'} />
        <Field label="Im Onlineshop sichtbar" value={Number(item.is_online_visible) === 1 ? 'Ja' : 'Nein'} />
        <Field label="Angelegt am" value={date(item.created_at)} /><Field label="Zuletzt geändert" value={date(item.updated_at)} />
        <Field label="Verkauft am" value={date(item.sold_at)} />
      </dl></section>
      <section className="card"><h3>Eigentümer</h3><dl className="item-detail-fields">
        <div><dt>Name</dt><dd><button type="button" className="link-button" onClick={() => onCustomerClick(item.owner_customer_id)} aria-label="Kundenübersicht des Eigentümers öffnen">{(owner ? owner.first_name + ' ' + owner.last_name : (item.first_name + ' ' + item.last_name).trim()) || 'Kundenübersicht öffnen'}</button></dd></div>
        <Field label="Kundennummer" value={owner?.customer_number || item.customer_number} />
        <Field label="Kunden-ID" value={item.owner_customer_id} /><Field label="Telefon" value={owner?.phone} /><Field label="E-Mail" value={owner?.email} />
        <Field label="Adresse" value={owner ? [ [owner.street, owner.house_number].filter(Boolean).join(' '), [owner.postal_code, owner.city].filter(Boolean).join(' ') ].filter(Boolean).join(', ') : undefined} />
      </dl></section>
    </div>
    <section className="card"><h3>Verkaufsinformationen</h3>
      {itemSales.length === 0 ? <><p>Kein Verkauf in der geladenen Verkaufshistorie vorhanden.</p><dl className="item-detail-fields">
        <Field label="Verkaufspreis" value={money(item.verkaufspreis)} /><Field label="Verkäuferanteil" value={money(item.verkauferAnteil)} /><Field label="Shopanteil" value={money(item.shopAnteil)} />
      </dl></> : itemSales.map(sale => {
        const buyer = customers.find(customer => customer.id === sale.buyer_customer_id);
        return <article key={sale.id} className="item-detail-record"><dl className="item-detail-fields">
          <Field label="Verkaufsnummer" value={sale.id} /><Field label="Verkaufsdatum" value={date(sale.sale_date)} />
          <Field label="Verkaufspreis" value={money(sale.sale_price)} /><Field label="Verkäuferanteil" value={money(sale.owner_amount)} /><Field label="Shopanteil" value={money(sale.shop_amount)} />
          <Field label="Verkaufsart" value={sale.sale_type === 'online' ? 'Onlineverkauf' : 'Verkauf im Laden'} />
          <Field label="Zahlungsart" value={{cash: 'Bar', bank_transfer: 'Überweisung', paypal: 'PayPal'}[sale.payment_method] || sale.payment_method} />
          <Field label="Käufer" value={buyer ? buyer.first_name + ' ' + buyer.last_name + ' (Kundennr. ' + buyer.customer_number + ')' : 'Kunden-ID ' + sale.buyer_customer_id} />
          <Field label="Transaktionsnummer" value={sale.transaction_id} /><Field label="Notizen" value={sale.notes} />
        </dl></article>;
      })}
    </section>
    {itemOrders.length > 0 && <section className="card"><h3>Zugehörige Online-Bestellungen</h3>{itemOrders.map(order => <article key={order.id} className="item-detail-record"><dl className="item-detail-fields">
      <Field label="Bestellnummer" value={order.order_number} /><Field label="Bestellstatus" value={order.order_status} />
      <Field label="Bestellt von" value={order.first_name + ' ' + order.last_name} /><Field label="Bestelldatum" value={date(order.created_at)} />
      <Field label="Artikelpreis in der Bestellung" value={money(order.items.find(entry => entry.item_id === item.id)?.item_price)} />
    </dl></article>)}</section>}
  </div>;
}
