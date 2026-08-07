import type { ReactNode } from 'react';

type LayoutProps = {
  activeView: 'customers' | 'items' | 'sales' | 'orders' | 'customerDetails' | 'anpassungen' | 'historie';
  onChangeView: (view: 'customers' | 'items' | 'sales' | 'orders' | 'customerDetails' | 'anpassungen' | 'historie') => void;
  children: ReactNode;
};

export default function Layout({
  activeView,
  onChangeView,
  children,
}: LayoutProps) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Second Hand</h2>

        <button
          className={activeView === 'customers' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChangeView('customers')}
        >
          Kunden
        </button>

        <button
          className={activeView === 'items' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChangeView('items')}
        >
          Kleidungsstücke
        </button>

        <button
          className={activeView === 'sales' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChangeView('sales')}
        >
          Verkäufe
        </button>
        <button
          className={activeView === 'orders' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChangeView('orders')}
        >
          Bestellungen
        </button>
                <button
          className={activeView === 'anpassungen' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChangeView('anpassungen')}
        >
          Anpassung
        </button>
                <button
          className={activeView === 'historie' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChangeView('historie')}
        >
          Historie
        </button>
      </aside>

      <main className="main-content">


        {children}
      </main>
    </div>
  );
}

