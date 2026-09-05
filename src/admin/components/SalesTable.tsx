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
  onReload: () => void;
};

export default function SalesTable({
  sales,
  customers,
  loading,
  onReload,
}: SalesTableProps) {

  const [exporting, setExporting] =
    useState(false);

  const [exportError, setExportError] =
    useState('');


  async function handleExcelExport() {
    try {
      setExporting(true);
      setExportError('');

      await exportSalesToExcel({
        sales,
        customers,
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
    <section className="card">
      <div className="card-header">
        <h3>Verkaufshistorie</h3>

        <div className="sales-table-actions">
          <button
            type="button"
            className="excel-btn"
            onClick={handleExcelExport}
            disabled={
              exporting ||
              loading ||
              sales.length === 0
            }
          >
            {exporting
              ? 'Excel wird erstellt...'
              : 'Excel herunterladen'}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={onReload}
            disabled={loading}
          >
            Neu laden
          </button>
        </div>
      </div>

      {exportError && (
        <div className="error-message">
          {exportError}
        </div>
      )}

      {loading ? (
        <p>Lade Verkäufe...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Artikel</th>
                <th>Eigentümer</th>
                <th>Verkaufspreis</th>
                <th>Eigentümer</th>
                <th>Shop</th>
                <th>Art</th>
                <th>Zahlung</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.sale_date).toLocaleString('de-DE')}</td>
                  <td>{sale.title}</td>
                  <td>
                    {sale.first_name} {sale.last_name}
                  </td>
                  <td>{Number(sale.sale_price).toFixed(2)} €</td>
                  <td>{Number(sale.owner_amount).toFixed(2)} €</td>
                  <td>{Number(sale.shop_amount).toFixed(2)} €</td>
                  <td>{sale.sale_type === 'store' ? 'Laden' : 'Online'}</td>
                  <td>{sale.payment_method === 'cash' ? 'Bar' : sale.payment_method === 'paypal' ? 'PayPal' : 'Überweisung'}</td>
                </tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td colSpan={8}>Noch keine Verkäufe vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}