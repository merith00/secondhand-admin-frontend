import { useMemo } from 'react';

import type {Customer,  Item, Sale } from '../../types';
import SalesTable from './SalesTable';


type HistorieProps = {
  customers: Customer[];
  items: Item[];
  sales: Sale[];
  loadingItems: boolean;
  loadingSales: boolean;
  salesMonth: string;
  onSalesMonthChange: (month: string) => void;
  onItemClick: (itemId: number) => void;
  activeTab: HistoryTab;
  onTabChange: (tab: HistoryTab) => void;
};


export type HistoryTab = 'available' | 'sales';


const DAY_IN_MS = 1000 * 60 * 60 * 24;


export default function Historie({
  customers,
  items,
  sales,
  loadingItems,
  loadingSales,
  salesMonth,
  onSalesMonthChange,
  onItemClick,
  activeTab,
  onTabChange,
}: HistorieProps) {



  function getDaysInStore(createdAt?: string) {
    if (!createdAt) return 0;

    const createdDate = new Date(createdAt);

    if (Number.isNaN(createdDate.getTime())) {
      return 0;
    }

    return Math.max(
      0,
      Math.floor(
        (Date.now() - createdDate.getTime()) /
          DAY_IN_MS
      )
    );
  }


  /*
   * Hier werden exakt drei Kalendermonate berechnet.
   * Beispiel: 12. Januar → ab 12. April rot.
   */
  function isOlderThanThreeMonths(createdAt?: string) {
    if (!createdAt) return false;

    const createdDate = new Date(createdAt);

    if (Number.isNaN(createdDate.getTime())) {
      return false;
    }

    const limitDate = new Date(createdDate);

    limitDate.setMonth(limitDate.getMonth() + 3);

    return new Date() >= limitDate;
  }


  const availableItems = useMemo(() => {
    return items
      .filter(
        (item) =>
          item.status !== 'sold' &&
          item.status !== 'withdrawn' &&
          item.is_in_store === 1
      )
      .sort((first, second) => {
        const firstDate = first.created_at
          ? new Date(first.created_at).getTime()
          : Date.now();

        const secondDate = second.created_at
          ? new Date(second.created_at).getTime()
          : Date.now();

        return firstDate - secondDate;
      });
  }, [items]);


  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <span className="history-eyebrow">SECOND HAND · ÜBERSICHT</span>
          <h2>Historie</h2>

          <p>
            Warenbestand und abgeschlossene Verkäufe
          </p>
        </div>
      </div>


      <div className="history-tabs">
        <button
          type="button"
          className={
            activeTab === 'available'
              ? 'history-tab active'
              : 'history-tab'
          }
          aria-pressed={activeTab === 'available'}
          onClick={() => onTabChange('available')}
        >
          Noch vorhanden

          <span className="history-tab-count">
            {availableItems.length}
          </span>
        </button>

        <button
          type="button"
          className={
            activeTab === 'sales'
              ? 'history-tab active'
              : 'history-tab'
          }
          aria-pressed={activeTab === 'sales'}
          onClick={() => onTabChange('sales')}
        >
          Verkaufshistorie

          <span className="history-tab-count">
            {sales.length}
          </span>
        </button>
      </div>


      {activeTab === 'available' && (
        <section className="history-card">
          <div className="history-metrics history-stock-metrics" aria-label="Bestandskennzahlen">
            <div className="history-metric"><span>Im Bestand</span><strong>{availableItems.length}</strong><small>Kleidungsstücke vorhanden</small></div>
            <div className="history-metric history-metric-highlight"><span>Angedachter Warenwert</span><strong>{availableItems.reduce((sum, item) => sum + Number(item.start_price || 0), 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong><small>Summe der angesetzten Preise</small></div>
            <div className="history-metric history-metric-warning"><span>Länger als drei Monate</span><strong>{availableItems.filter(item => isOlderThanThreeMonths(item.created_at)).length}</strong><small>rot im Bestand markiert</small></div>
          </div>
          <div className="history-content-header">
            <div>
              <h3>Noch vorhandene Kleidungsstücke</h3>

              <p>
                Rot markierte Artikel befinden sich seit
                mindestens drei Monaten im Bestand.
              </p>
            </div>
          </div>


          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Nr.</th>
                  <th>Kleidungsstück</th>
                  <th>Marke</th>
                  <th>Kategorie</th>
                  <th>Größe</th>
                  <th>Eigentümer</th>
                  <th>Eingang</th>
                  <th>Im Bestand</th>
                </tr>
              </thead>

              <tbody>
                {loadingItems &&
                availableItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="history-empty"
                    >
                      Kleidungsstücke werden geladen...
                    </td>
                  </tr>
                ) : (
                  availableItems.map((item) => {
                    const days = getDaysInStore(
                      item.created_at
                    );

                    const isOld =
                      isOlderThanThreeMonths(
                        item.created_at
                      );

                    return (
                      <tr
                        key={item.id}
                        onClick={() => onItemClick(item.id)}
                        className={
                          isOld
                            ? 'history-old-item item-clickable-row'
                            : 'item-clickable-row'
                        }
                      >
                        <td data-label="Artikelnummer">#{item.id}</td>

                        <td data-label="Kleidungsstück" className="history-title">
                          <button type="button" className="link-button" aria-label={`Details zu ${item.title} anzeigen`} onClick={(event) => { event.stopPropagation(); onItemClick(item.id); }}>{item.title}</button>
                        </td>

                        <td data-label="Marke">{item.brand || '–'}</td>

                        <td data-label="Kategorie">{item.category || '–'}</td>

                        <td data-label="Größe">{item.size || '–'}</td>

                        <td data-label="Eigentümer">
                          {item.first_name}{' '}
                          {item.last_name}
                        </td>

                        <td data-label="Eingang">
                          {item.created_at
                            ? new Date(
                                item.created_at
                              ).toLocaleDateString(
                                'de-DE'
                              )
                            : '–'}
                        </td>

                        <td data-label="Im Bestand">
                          <span
                            className={
                              isOld
                                ? 'history-days history-days-old'
                                : 'history-days'
                            }
                          >
                            {days} Tage
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}


                {!loadingItems &&
                  availableItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="history-empty"
                      >
                        Keine verfügbaren Kleidungsstücke
                        vorhanden.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>
      )}


      {activeTab === 'sales' && (
        <div className="history-sales">
<SalesTable
  sales={sales}
  customers={customers}
  loading={loadingSales}
  selectedMonth={salesMonth}
  onMonthChange={onSalesMonthChange}
  onItemClick={onItemClick}
/>
        </div>
      )}
    </div>
  );
}