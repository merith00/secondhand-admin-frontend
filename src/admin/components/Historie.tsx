import type { Item } from '../../types';

type HistorieProps = {
  items: Item[];
  loading: boolean;
};

export default function Historie({
  items,
  loading,
}: HistorieProps) {

  const DAY_IN_MS = 1000 * 60 * 60 * 24;

  function getDaysInStore(createdAt?: string) {
    if (!createdAt) return 0;

    const created = new Date(createdAt);
    const today = new Date();

    return Math.floor(
      (today.getTime() - created.getTime()) / DAY_IN_MS
    );
  }


  // Nur Kleidungsstücke, die noch im Laden sind
  const activeItems = items
    .filter((item) => item.is_in_store === 1)
    .sort((a, b) => {
      return (
        getDaysInStore(b.created_at) -
        getDaysInStore(a.created_at)
      );
    });


  if (loading) {
    return (
      <div className="history-page">
        <h2>Historie</h2>
        <p>Kleidungsstücke werden geladen...</p>
      </div>
    );
  }


  return (
    <div className="history-page">

      <div className="history-header">
        <div>
          <h2>Historie</h2>
          <p>
            Übersicht aller noch nicht verkauften Kleidungsstücke
          </p>
        </div>

        <div className="history-count">
          {activeItems.length} Kleidungsstücke
        </div>
      </div>


      <div className="history-card">

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
                <th>Tage</th>
              </tr>
            </thead>

            <tbody>

              {activeItems.map((item) => {

                const days = getDaysInStore(item.created_at);
                const isOld = days >= 90;

                return (
                  <tr
                    key={item.id}
                    className={isOld ? 'history-old-item' : ''}
                  >
                    <td>#{item.id}</td>

                    <td className="history-title">
                      {item.title}
                    </td>

                    <td>
                      {item.brand || '–'}
                    </td>

                    <td>
                      {item.category || '–'}
                    </td>

                    <td>
                      {item.size || '–'}
                    </td>

                    <td>
                      {item.first_name} {item.last_name}
                    </td>

                    <td>
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleDateString('de-DE')
                        : '–'}
                    </td>

                    <td>
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
              })}


              {activeItems.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="history-empty"
                  >
                    Keine Kleidungsstücke vorhanden.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}