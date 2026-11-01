import { useId } from 'react';
import './TableSearch.css';

type Props = {
  label: string;
  query: string;
  onQueryChange: (query: string) => void;
  count: number;
  total: number;
  loading: boolean;
};

export default function TableSearch({ label, query, onQueryChange, count, total, loading }: Props) {
  const id = useId();
  return (
    <div className="table-search">
      <label htmlFor={id}>{label}</label>
      <div className="table-search-controls">
        <input id={id} type="search" value={query}
          placeholder="Alle Spalten durchsuchen …"
          onChange={event => onQueryChange(event.target.value)} />
        {query && <button type="button" onClick={() => onQueryChange('')}>Suche zurücksetzen</button>}
      </div>
      {!loading && <span role="status">{count} von {total} Einträgen</span>}
    </div>
  );
}
