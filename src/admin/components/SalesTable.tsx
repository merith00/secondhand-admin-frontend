import { saleMonth, monthLabel, saleAmounts } from '../../utils/salesPeriod';
import { useState } from 'react';

import type {
  Customer,
  Sale,
} from '../../types';

import {
  exportSalesToExcel,
} from '../../utils/salesExcel';

type SalesTableProps = {
  sales: Sale[];
  customers: Customer[];
  loading: boolean;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onItemClick: (itemId: number) => void;
};

export default function SalesTable({
  sales,
  customers,
  loading,
  onItemClick,
  selectedMonth,
  onMonthChange,
}: SalesTableProps) {

  const [exporting, setExporting] =
    useState(false);

  const [exportError, setExportError] =
    useState('');


  const months = [...new Set(sales.map(sale => saleMonth(sale.sale_date)))].sort((a, b) => a === 'unknown' ? 1 : b === 'unknown' ? -1 : b.localeCompare(a));
  const activeMonth = months.includes(selectedMonth) ? selectedMonth : months[0] || '';
  const monthlySales = sales.filter(sale => saleMonth(sale.sale_date) === activeMonth).sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
  const totals = monthlySales.reduce((sum, sale) => { const amounts = saleAmounts(Number(sale.shop_amount ?? 0)); return { gross: sum.gross + amounts.gross, net: sum.net + amounts.net, vat: sum.vat + amounts.vat }; }, { gross: 0, net: 0, vat: 0 });

  async function handleExcelExport() {
    try {
      setExporting(true);
      setExportError('');

      await exportSalesToExcel({
        sales: monthlySales,
        customers,
        month: activeMonth,
      });
    } catch (error: unknown) {
      setExportError(
        error instanceof Error
          ? error.message
          : 'Excel-Datei konnte nicht erstellt werden'
      );
    } finally {
      setExporting(false);
    }
  }
  return (
    <section className="card history-sales-card">
      <div className="card-header history-sales-header">
        <div><span className="history-eyebrow">MONATSÜBERSICHT</span><h3>{activeMonth ? monthLabel(activeMonth) : 'Verkaufshistorie'}</h3><p className="history-subtitle">Alle Verkäufe und Beträge des ausgewählten Monats.</p></div>

        <div className="sales-table-actions">
          <label className="sales-month-selector">Monat<select value={activeMonth} onChange={event => onMonthChange(event.target.value)} disabled={loading || months.length === 0} aria-label="Verkaufsmonat auswählen">{months.length === 0 && <option value="">Keine Verkäufe</option>}{months.map(month => <option key={month} value={month}>{monthLabel(month)}</option>)}</select></label>
          <button
            type="button"
            className="excel-btn"
            onClick={handleExcelExport}
            disabled={
              exporting ||
              loading ||
              monthlySales.length === 0
            }
          >
            {exporting
              ? 'Excel wird erstellt...'
              : 'Excel herunterladen'}
          </button>
        </div>
      </div>

      {activeMonth && <div className="history-metrics" aria-label="Monatskennzahlen">
        <div className="history-metric"><span>Verkaufte Artikel</span><strong>{monthlySales.length}</strong><small>in diesem Monat</small></div>
        <div className="history-metric history-metric-highlight"><span>Shop-Bruttoumsatz</span><strong>{totals.gross.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong><small>Shopanteil inklusive MwSt.</small></div>
        <div className="history-metric"><span>Shop-Nettoumsatz</span><strong>{totals.net.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong><small>Shopanteil ohne MwSt.</small></div>
        <div className="history-metric"><span>Shop-Mehrwertsteuer</span><strong>{totals.vat.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong><small>19 % MwSt. im Shopanteil</small></div>
      </div>}

      {exportError && (
        <div className="error-message">
          {exportError}
        </div>
      )}

      {loading ? (
        <p>Lade Verkäufe...</p>
      ) : (
        <div className="table-wrapper">
          <table className="history-sales-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Artikel</th>
                <th>Eigentümer</th>
                <th>Brutto</th>
                <th>Netto</th>
                <th>MwSt. (19 %)</th>
                <th>Verkäuferauszahlung netto</th>
                <th>Shopanteil brutto</th>
                <th>Art</th>
                <th>Zahlung</th>
              </tr>
            </thead>
            <tbody>
              {monthlySales.map((sale) => (
                <tr key={sale.id} className="item-clickable-row" onClick={() => onItemClick(sale.item_id)}>
                  <td data-label="Datum">{new Date(sale.sale_date).toLocaleString('de-DE')}</td>
                  <td data-label="Artikel"><button type="button" className="link-button" aria-label={`Details zu ${sale.title} anzeigen`} onClick={(event) => { event.stopPropagation(); onItemClick(sale.item_id); }}>{sale.title}</button></td>
                  <td data-label="Eigentümer">
                    {sale.first_name} {sale.last_name}
                  </td>
                  <td data-label="Brutto">{saleAmounts(Number(sale.sale_price)).gross.toFixed(2)} €</td>
                  <td data-label="Netto">{saleAmounts(Number(sale.sale_price)).net.toFixed(2)} €</td>
                  <td data-label="MwSt. (19 %)">{saleAmounts(Number(sale.sale_price)).vat.toFixed(2)} €</td>
                  <td data-label="Verkäuferauszahlung netto">{Number(sale.owner_amount).toFixed(2)} €</td>
                  <td data-label="Shopanteil brutto">{Number(sale.shop_amount).toFixed(2)} €</td>
                  <td data-label="Verkaufsart">{sale.sale_type === 'store' ? 'Laden' : 'Online'}</td>
                  <td data-label="Zahlungsart">{sale.payment_method === 'cash' ? 'Bar' : sale.payment_method === 'paypal' ? 'PayPal' : 'Überweisung'}</td>
                </tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td colSpan={10}>Noch keine Verkäufe vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}