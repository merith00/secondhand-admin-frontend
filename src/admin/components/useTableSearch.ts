import { useState } from 'react';

const normalize = (value: unknown) => String(value ?? '')
  .normalize('NFKC').toLocaleLowerCase('de').replace(/,/g, '.').trim();

export function filterTableRows<T>(rows: T[], query: string, values: (row: T) => unknown[]): T[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return rows;
  return rows.filter(row => {
    const text = values(row).map(normalize).join(' ');
    return terms.every(term => text.includes(term));
  });
}

export default function useTableSearch<T>(rows: T[], values: (row: T) => unknown[]) {
  const [query, setQuery] = useState('');
  return { query, setQuery, filteredRows: filterTableRows(rows, query, values) };
}
