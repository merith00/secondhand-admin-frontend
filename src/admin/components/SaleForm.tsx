import { useEffect, useMemo, useState } from 'react';

import type {
  BatchSaleData,
  BatchSaleItem,
  Customer,
  CustomerCredit,
  Item,
} from '../../types';

type SaleFormProps = {
  customers: Customer[];
  customerCredits: CustomerCredit[];
  items: Item[];
  onSubmit: (sale: BatchSaleData) => Promise<void>;
};

export default function SaleForm({
  customers,
  customerCredits,
  items,
  onSubmit,
}: SaleFormProps) {
  const [buyerCustomerId, setBuyerCustomerId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saleType, setSaleType] = useState<'store' | 'online'>('store');
  const [paymentMethod, setPaymentMethod] =
    useState<'cash' | 'bank_transfer' | 'paypal'>('cash');
  const [notes, setNotes] = useState('');
  const [sellerSharePercent, setSellerSharePercent] = useState(40);
  const [shopSharePercent, setShopSharePercent] = useState(60);
  const [cashDifferenceConfirmed, setCashDifferenceConfirmed] =
    useState(false);
  const [cartItems, setCartItems] = useState<BatchSaleItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const sellableItems = useMemo(() => {
    const selectedIds = new Set(cartItems.map((item) => item.item_id));
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const isAvailable =
        item.status !== 'sold' &&
        item.status !== 'withdrawn' &&
        item.is_in_store === 1;

      if (!isAvailable || selectedIds.has(item.id)) return false;
      if (!normalizedSearch) return true;

      const owner = customers.find(
        (customer) => customer.id === item.owner_customer_id
      );

      const searchableText = [
        item.id,
        item.title,
        item.brand,
        item.category,
        item.size,
        owner?.customer_number,
        owner?.first_name,
        owner?.last_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [items, customers, cartItems, searchTerm]);

  function getItem(itemId: number) {
    return items.find((item) => item.id === itemId);
  }

  function getOwner(item?: Item) {
    if (!item) return undefined;

    return customers.find(
      (customer) => customer.id === item.owner_customer_id
    );
  }

  function calculateAmounts(grossPrice: number) {
    const netPrice = grossPrice / 1.19;
    const vatAmount = grossPrice - netPrice;
    const ownerAmount =
      (grossPrice * sellerSharePercent) / 100 - vatAmount;
    const shopAmount = (grossPrice * shopSharePercent) / 100;

    return { netPrice, vatAmount, ownerAmount, shopAmount };
  }

  const totals = cartItems.reduce(
    (result, cartItem) => {
      const grossPrice = Number(cartItem.sale_price);
      const amounts = calculateAmounts(grossPrice);

      result.gross += grossPrice;
      result.net += amounts.netPrice;
      result.vat += amounts.vatAmount;
      result.owner += amounts.ownerAmount;
      result.shop += amounts.shopAmount;

      return result;
    },
    { gross: 0, net: 0, vat: 0, owner: 0, shop: 0 }
  );

  const selectedBuyerCredit = useMemo(() => {
    if (!buyerCustomerId) return 0;

    const creditEntry = customerCredits.find(
      (entry) => entry.id === Number(buyerCustomerId)
    );

    return Math.max(0, Number(creditEntry?.credit_balance || 0));
  }, [customerCredits, buyerCustomerId]);

  const creditUsed = Math.min(selectedBuyerCredit, totals.gross);
  const cashDifference = Math.max(0, totals.gross - selectedBuyerCredit);
  const requiresCashConfirmation =
    buyerCustomerId !== '' && cartItems.length > 0 && cashDifference > 0;

  useEffect(() => {
    setCashDifferenceConfirmed(false);
  }, [buyerCustomerId, totals.gross]);

  function handleAddItem() {
    const itemId = Number(selectedItemId);

    if (!itemId) {
      setFormError('Bitte zuerst ein Kleidungsstück auswählen');
      return;
    }

    const item = getItem(itemId);

    if (!item) {
      setFormError('Kleidungsstück wurde nicht gefunden');
      return;
    }

    if (
      item.status === 'sold' ||
      item.status === 'withdrawn' ||
      item.is_in_store !== 1
    ) {
      setFormError('Dieses Kleidungsstück ist nicht mehr verfügbar');
      return;
    }

    if (cartItems.some((cartItem) => cartItem.item_id === itemId)) {
      setFormError('Dieses Kleidungsstück befindet sich bereits im Verkauf');
      return;
    }

    setCartItems((previous) => [
      ...previous,
      { item_id: item.id, sale_price: Number(item.start_price) },
    ]);
    setSelectedItemId('');
    setSearchTerm('');
    setFormError('');
  }

  function handlePriceChange(itemId: number, value: string) {
    const price = Number(value);

    setCartItems((previous) =>
      previous.map((cartItem) =>
        cartItem.item_id === itemId
          ? { ...cartItem, sale_price: value === '' ? 0 : price }
          : cartItem
      )
    );
  }

  function handleRemoveItem(itemId: number) {
    setCartItems((previous) =>
      previous.filter((cartItem) => cartItem.item_id !== itemId)
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!buyerCustomerId) {
      setFormError('Bitte einen Käufer auswählen');
      return;
    }

    if (cartItems.length === 0) {
      setFormError('Bitte mindestens ein Kleidungsstück hinzufügen');
      return;
    }

    if (
      sellerSharePercent < 0 ||
      shopSharePercent < 0 ||
      sellerSharePercent + shopSharePercent !== 100
    ) {
      setFormError(
        'Verkäuferanteil und Shopanteil müssen zusammen 100 % ergeben'
      );
      return;
    }

    if (
      cartItems.some(
        (item) => !Number.isFinite(item.sale_price) || item.sale_price < 0
      )
    ) {
      setFormError('Mindestens ein Verkaufspreis ist ungültig');
      return;
    }

    if (requiresCashConfirmation && !cashDifferenceConfirmed) {
      setFormError(
        `Bitte bestätigen, dass der Kunde die Differenz von ${cashDifference.toFixed(2)} € bar bezahlt hat`
      );
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      await onSubmit({
        buyer_customer_id: Number(buyerCustomerId),
        sale_type: saleType,
        payment_method: paymentMethod,
        notes,
        seller_share_percent: sellerSharePercent,
        shop_share_percent: shopSharePercent,
        cash_difference_confirmed: cashDifferenceConfirmed,
        items: cartItems,
      });

      setBuyerCustomerId('');
      setSelectedItemId('');
      setSearchTerm('');
      setSaleType('store');
      setPaymentMethod('cash');
      setNotes('');
      setSellerSharePercent(40);
      setShopSharePercent(60);
      setCashDifferenceConfirmed(false);
      setCartItems([]);
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Verkauf konnte nicht gespeichert werden'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card batch-sale-card">
      <div className="batch-sale-header">
        <div>
          <h2>Verkauf erfassen</h2>
          <p>Käufer auswählen und mehrere Kleidungsstücke hinzufügen</p>
        </div>

        <span className="batch-sale-count">{cartItems.length} Artikel</span>
      </div>

      <form className="batch-sale-form" onSubmit={handleSubmit}>
        {formError && <div className="error-message">{formError}</div>}

        <div className="batch-sale-section">
          <h3>1. Käufer</h3>

          <div className="form-group">
            <label htmlFor="buyer_customer_id">Käufer auswählen</label>

            <select
              id="buyer_customer_id"
              value={buyerCustomerId}
              onChange={(event) => {
                setBuyerCustomerId(event.target.value);
                setCashDifferenceConfirmed(false);
              }}
              required
            >
              <option value="">Käufer auswählen</option>

              {customers.map((customer) => {
                const credit = customerCredits.find(
                  (entry) => entry.id === customer.id
                );

                return (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_number} – {customer.first_name}{' '}
                    {customer.last_name} – Guthaben:{' '}
                    {Number(credit?.credit_balance || 0).toFixed(2)} €
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="batch-sale-section">
          <h3>2. Kleidungsstücke</h3>

          <div className="sale-item-picker">
            <div className="form-group">
              <label htmlFor="item_search">Kleidungsstück suchen</label>
              <input
                id="item_search"
                type="search"
                placeholder="Titel, Marke, ID oder Verkäufer"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setSelectedItemId('');
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sale_item">Verfügbares Kleidungsstück</label>
              <select
                id="sale_item"
                value={selectedItemId}
                onChange={(event) => setSelectedItemId(event.target.value)}
              >
                <option value="">Kleidungsstück auswählen</option>

                {sellableItems.map((item) => {
                  const owner = getOwner(item);

                  return (
                    <option key={item.id} value={item.id}>
                      #{item.id} – {item.title}
                      {item.brand ? ` – ${item.brand}` : ''}
                      {owner
                        ? ` – ${owner.first_name} ${owner.last_name}`
                        : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="button"
              className="primary-btn sale-add-item-btn"
              onClick={handleAddItem}
              disabled={!selectedItemId}
            >
              Hinzufügen
            </button>
          </div>

          <div className="sale-cart">
            {cartItems.length === 0 ? (
              <div className="sale-cart-empty">
                Noch keine Kleidungsstücke ausgewählt.
              </div>
            ) : (
              <div className="sale-cart-table-wrapper">
                <table className="sale-cart-table">
                  <thead>
                    <tr>
                      <th>Artikel</th>
                      <th>Verkäufer</th>
                      <th>Verkaufspreis</th>
                      <th>Verkäufer erhält</th>
                      <th>Shop erhält</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {cartItems.map((cartItem) => {
                      const item = getItem(cartItem.item_id);
                      const owner = getOwner(item);
                      const amounts = calculateAmounts(
                        Number(cartItem.sale_price)
                      );

                      return (
                        <tr key={cartItem.item_id}>
                          <td>
                            <strong>{item?.title || 'Unbekannter Artikel'}</strong>
                            <small>
                              #{cartItem.item_id}
                              {item?.brand ? ` · ${item.brand}` : ''}
                              {item?.size ? ` · Größe ${item.size}` : ''}
                            </small>
                          </td>

                          <td>
                            {owner
                              ? `${owner.first_name} ${owner.last_name}`
                              : '–'}
                          </td>

                          <td>
                            <div className="sale-price-input">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={cartItem.sale_price}
                                onChange={(event) =>
                                  handlePriceChange(
                                    cartItem.item_id,
                                    event.target.value
                                  )
                                }
                                required
                              />
                              <span>€</span>
                            </div>
                          </td>

                          <td className="sale-owner-amount">
                            {amounts.ownerAmount.toFixed(2)} €
                          </td>
                          <td className="sale-shop-amount">
                            {amounts.shopAmount.toFixed(2)} €
                          </td>

                          <td>
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => handleRemoveItem(cartItem.item_id)}
                            >
                              Entfernen
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="batch-sale-section">
          <h3>3. Verkaufsdetails</h3>

          <div className="sale-details-grid">
            <div className="form-group">
              <label>Verkaufsart</label>
              <select
                value={saleType}
                onChange={(event) =>
                  setSaleType(event.target.value as 'store' | 'online')
                }
              >
                <option value="store">Verkauf im Laden</option>
                <option value="online">Onlineverkauf</option>
              </select>
            </div>

            <div className="form-group">
              <label>Zahlungsart</label>
              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value as 'cash' | 'bank_transfer' | 'paypal'
                  )
                }
              >
                <option value="cash">Bar</option>
                <option value="bank_transfer">Überweisung</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <div className="form-group">
              <label>Verkäuferanteil (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={sellerSharePercent}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setSellerSharePercent(value);
                  setShopSharePercent(100 - value);
                }}
              />
            </div>

            <div className="form-group">
              <label>Shopanteil (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={shopSharePercent}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setShopSharePercent(value);
                  setSellerSharePercent(100 - value);
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notizen</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <div className="batch-sale-section">
          <h3>Zusammenfassung</h3>

          <div className="sale-summary-row">
            <span>Artikel</span>
            <strong>{cartItems.length}</strong>
          </div>
          <div className="sale-summary-row">
            <span>Netto</span>
            <strong>{totals.net.toFixed(2)} €</strong>
          </div>
          <div className="sale-summary-row">
            <span>MwSt.</span>
            <strong>{totals.vat.toFixed(2)} €</strong>
          </div>
          <div className="sale-summary-row">
            <span>Verkäufer erhalten</span>
            <strong className="sale-owner-amount">
              {totals.owner.toFixed(2)} €
            </strong>
          </div>
          <div className="sale-summary-row">
            <span>Shop erhält</span>
            <strong className="sale-shop-amount">
              {totals.shop.toFixed(2)} €
            </strong>
          </div>
          <div className="sale-summary-row">
            <span>Verfügbares Kundenguthaben</span>
            <strong>{selectedBuyerCredit.toFixed(2)} €</strong>
          </div>
          <div className="sale-summary-row">
            <span>Verwendetes Guthaben</span>
            <strong className="sale-owner-amount">
              {creditUsed.toFixed(2)} €
            </strong>
          </div>

          {cashDifference > 0 && (
            <div className="sale-summary-row">
              <span>Bar zu bezahlen</span>
              <strong className="sale-cash-amount">
                {cashDifference.toFixed(2)} €
              </strong>
            </div>
          )}

          <div className="sale-summary-row sale-summary-total">
            <span>Gesamtsumme</span>
            <strong>{totals.gross.toFixed(2)} €</strong>
          </div>
        </div>

        {requiresCashConfirmation && (
          <label className="cash-confirmation">
            <input
              type="checkbox"
              checked={cashDifferenceConfirmed}
              onChange={(event) =>
                setCashDifferenceConfirmed(event.target.checked)
              }
            />
            <span>
              Der Kunde hat die Differenz von{' '}
              <strong>{cashDifference.toFixed(2)} €</strong> bezahlt.
            </span>
          </label>
        )}

        <button
          type="submit"
          className="primary-btn batch-sale-submit"
          disabled={
            submitting ||
            !buyerCustomerId ||
            cartItems.length === 0 ||
            (requiresCashConfirmation && !cashDifferenceConfirmed)
          }
        >
          {submitting
            ? 'Verkauf wird gespeichert...'
            : `${cartItems.length} Artikel verkaufen · ${totals.gross.toFixed(2)} €`}
        </button>
      </form>
    </section>
  );
}