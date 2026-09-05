import { Fragment, useEffect, useState } from 'react';
import type { Customer, Item, Sale } from '../../types';
import { updateCustomer, updateItem } from '../../api/adminApi';
import ItemImageShow from './ItemImageShow';
import { generateCustomerPdf } from '../../utils/customerPdf';


type CustomerDetailPageProps = {
  customerId: number;
  customers: Customer[];
  items: Item[];
  sales: Sale[];
  onBack: () => void;
  onAddItem: (customerId: number) => void;
  onCustomerUpdated: (customer: Customer) => void;
  onItemUpdated: (item: Item) => void;
};

export default function CustomerDetailPage({
  customerId,
  customers,
  items,
  sales,
  onBack,
  onAddItem,
  onCustomerUpdated,
  onItemUpdated,
}: CustomerDetailPageProps) {
  const customer = customers.find((c) => c.id === customerId);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [itemError, setItemError] = useState('');
  const [itemForm, setItemForm] = useState({
    title: '', description: '', category: '', size: '', brand: '', color: '',
    price: '', is_online_visible: false,
  });

  const [addressForm, setAddressForm] = useState({
    street: '',
    house_number: '',
    postal_code: '',
    city: '',
  });


  useEffect(() => {
    if (!customer) return;

    setAddressForm({
      street: customer.street || '',
      house_number: customer.house_number || '',
      postal_code: customer.postal_code || '',
      city: customer.city || '',
    });
  }, [customer]);


  async function handleSaveAddress() {
    if (!customer) return;

    try {
      setSavingAddress(true);
      setAddressError('');

      const updatedCustomer = await updateCustomer(
        customer.id,
        addressForm
      );

      onCustomerUpdated(updatedCustomer);

      setIsEditingAddress(false);
    } catch (err: any) {
      setAddressError(
        err.message || 'Adresse konnte nicht gespeichert werden'
      );
    } finally {
      setSavingAddress(false);
    }
  }

  function startEditingItem(item: Item) {
    setEditingItemId(item.id);
    setItemError('');
    setItemForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      size: item.size || '',
      brand: item.brand || '',
      color: item.color || '',
      price: String(item.start_price ?? ''),
      is_online_visible: Number(item.is_online_visible) === 1,
    });
  }

  async function handleSaveItem(itemId: number) {
    const price = Number(itemForm.price.replace(',', '.'));
    if (!itemForm.title.trim() || !Number.isFinite(price) || price < 0) {
      setItemError('Bitte Titel und einen gültigen Preis eingeben.');
      return;
    }

    try {
      setSavingItem(true);
      setItemError('');
      const updatedItem = await updateItem(itemId, {
        title: itemForm.title.trim(),
        description: itemForm.description.trim(),
        category: itemForm.category.trim(),
        size: itemForm.size.trim(),
        brand: itemForm.brand.trim(),
        color: itemForm.color.trim(),
        price,
        is_online_visible: itemForm.is_online_visible ? 1 : 0,
      });
      onItemUpdated(updatedItem);
      setEditingItemId(null);
    } catch (err: any) {
      setItemError(err.message || 'Kleidungsstück konnte nicht gespeichert werden.');
    } finally {
      setSavingItem(false);
    }
  }

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
      items.find(
        (item) => item.id === sale.item_id
      )
    )
    .filter(
      (item): item is Item =>
        item !== undefined
    );
  const totalCreditEarned = soldItems.reduce(
    (sum, item) => sum + Number(item.verkauferAnteil || 0),
    0
  );

  const totalCreditSpent = purchasedSales.reduce(
    (sum, sale) =>
      sum +
      Number(
        sale.buyer_credit_used ??
        sale.sale_price ??
        0
      ),
    0
  );

  const creditBalance = totalCreditEarned - totalCreditSpent;

  function handleCreatePdf(
    selectedCustomer: Customer
  ) {
    generateCustomerPdf({
      customer: selectedCustomer,
      availableItems,
      soldItems,
      purchasedItems,
      creditBalance,
    });
  }

  function isOlderThanThreeMonths(
    createdAt?: string
  ) {
    if (!createdAt) return false;

    const createdDate = new Date(createdAt);

    if (Number.isNaN(createdDate.getTime())) {
      return false;
    }

    const threeMonthsLater =
      new Date(createdDate);

    threeMonthsLater.setMonth(
      threeMonthsLater.getMonth() + 3
    );

    return new Date() >= threeMonthsLater;
  }

  return (
    <div className="customer-page">

      <div className="customer-detail-toolbar">
        <button
          type="button"
          className="secondary-btn back-btn"
          onClick={onBack}
        >
          ← Zurück zur Kundenliste
        </button>

        <div className="customer-detail-actions">
          <button
            type="button"
            className="pdf-btn"
            onClick={() => handleCreatePdf(customer)}
          >
            PDF erstellen
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={() => onAddItem(customerId)}
          >
            Kleidungsstück hinzufügen
          </button>
        </div>
      </div>

      <div className="customer-grid">
        <section className="card">
          <div className="customer-info-grid">
            <div>
              <h2>{customer.first_name} {customer.last_name}</h2>
              <p><strong>Kundennummer:</strong> {customer.customer_number}</p>
              <p><strong>Telefon:</strong> {customer.phone || '-'}</p>
              <p><strong>E-Mail:</strong> {customer.email || '-'}</p>
              <p>
                <strong>Aktuelles Guthaben:{' '}
                  <span className={creditBalance > 0 ? 'credit-positive' : creditBalance < 0 ? 'credit-negative' : 'credit-neutral'}>
                    {creditBalance.toFixed(2)} €
                  </span></strong>
              </p>
            </div>

            <div className="customer-address">

              <div className="address-header">
                <h2>Adresse</h2>

                {!isEditingAddress && (
                  <button
                    type="button"
                    className="address-edit-btn"
                    onClick={() => setIsEditingAddress(true)}
                  >
                    Bearbeiten
                  </button>
                )}
              </div>


              {!isEditingAddress ? (
                <>
                  <p>
                    <strong>Straße:</strong>{' '}
                    {customer.street || '-'}
                  </p>

                  <p>
                    <strong>Hausnummer:</strong>{' '}
                    {customer.house_number || '-'}
                  </p>

                  <p>
                    <strong>Postleitzahl:</strong>{' '}
                    {customer.postal_code || '-'}
                  </p>

                  <p>
                    <strong>Ort:</strong>{' '}
                    {customer.city || '-'}
                  </p>
                </>
              ) : (
                <div className="address-edit-form">

                  <div className="address-row">
                    <input
                      type="text"
                      placeholder="Straße"
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                    />

                    <input
                      type="text"
                      placeholder="Hausnummer"
                      value={addressForm.house_number}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          house_number: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="address-row">
                    <input
                      type="text"
                      placeholder="PLZ"
                      value={addressForm.postal_code}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          postal_code: e.target.value,
                        }))
                      }
                    />

                    <input
                      type="text"
                      placeholder="Ort"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {addressError && (
                    <div className="address-error">
                      {addressError}
                    </div>
                  )}

                  <div className="address-actions">

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        setIsEditingAddress(false);

                        setAddressForm({
                          street: customer.street || '',
                          house_number: customer.house_number || '',
                          postal_code: customer.postal_code || '',
                          city: customer.city || '',
                        });
                      }}
                    >
                      Abbrechen
                    </button>

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={handleSaveAddress}
                      disabled={savingAddress}
                    >
                      {savingAddress ? 'Speichern...' : 'Speichern'}
                    </button>

                  </div>

                </div>
              )}

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
              <th>Kommentar</th>
              <th>Kategorie</th>
              <th>Größe</th>
              <th>Verfügbar seit</th>
              <th>Angedachter Preis</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {availableItems.map((item) => {
              const isOverdue =
                isOlderThanThreeMonths(
                  item.created_at
                );

              return (
                <Fragment key={item.id}>
                  <tr
                    key={item.id}
                  className={
                    isOverdue
                      ? 'customer-item-overdue'
                      : ''
                  }
                >
                  <td>
                    <ItemImageShow imageUrl={item.image_url} />
                  </td>
                  <td>{item.title}</td>
                  <td>{item.description || '-'}</td>
                  <td>{item.category || '-'}</td>
                  <td>{item.size || '-'}</td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                  <td>{item.start_price} €</td>
                  <td>
                    <button
                      type="button"
                      className="item-edit-btn"
                      onClick={() => startEditingItem(item)}
                    >
                      Bearbeiten
                    </button>
                  </td>
                  </tr>
                  {editingItemId === item.id && (
                    <tr className="item-edit-row">
                    <td colSpan={7}>
                      <form
                        className="item-edit-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleSaveItem(item.id);
                        }}
                      >
                        <h4>Kleidungsstück bearbeiten</h4>
                        <div className="item-edit-fields">
                          <input required value={itemForm.title} placeholder="Titel" onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))} />
                          <input value={itemForm.category} placeholder="Kategorie" onChange={(e) => setItemForm((prev) => ({ ...prev, category: e.target.value }))} />
                          <input value={itemForm.size} placeholder="Größe" onChange={(e) => setItemForm((prev) => ({ ...prev, size: e.target.value }))} />
                          <input value={itemForm.brand} placeholder="Marke" onChange={(e) => setItemForm((prev) => ({ ...prev, brand: e.target.value }))} />
                          <input value={itemForm.color} placeholder="Farbe" onChange={(e) => setItemForm((prev) => ({ ...prev, color: e.target.value }))} />
                          <input required type="number" min="0" step="0.01" value={itemForm.price} placeholder="Preis" onChange={(e) => setItemForm((prev) => ({ ...prev, price: e.target.value }))} />
                        </div>
                        <textarea value={itemForm.description} placeholder="Beschreibung" rows={3} onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))} />
                        <label className="checkbox-row item-edit-visibility">
                          <input type="checkbox" checked={itemForm.is_online_visible} onChange={(e) => setItemForm((prev) => ({ ...prev, is_online_visible: e.target.checked }))} />
                          Im Onlineshop sichtbar
                        </label>
                        {itemError && <p className="item-edit-error">{itemError}</p>}
                        <div className="item-edit-actions">
                          <button type="button" className="secondary-btn" onClick={() => setEditingItemId(null)} disabled={savingItem}>Abbrechen</button>
                          <button type="submit" className="primary-btn" disabled={savingItem}>{savingItem ? 'Speichern...' : 'Änderungen speichern'}</button>
                        </div>
                      </form>
                    </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}

            {availableItems.length > 0 && (

              <tr>
                <td colSpan={6}>Summe:</td>
                <td><strong>
                  {availableItems
                    .reduce((sum, item) => sum + Number(item.start_price), 0)
                    .toFixed(2)} €
                </strong></td>
              </tr>
            )}
            {availableItems.length === 0 && (
              <tr>
                <td colSpan={7}>Keine vorhandenen Artikel.</td>
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
                <td>{item.title}</td>
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
                    .reduce((sum, item) => sum + Number(item.verkauferAnteil), 0)
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
