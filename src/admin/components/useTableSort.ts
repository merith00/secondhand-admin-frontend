import { useState } from 'react';

export type SortValue = string | number | null | undefined;
const collator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });

export function compareValues(a: SortValue, b: SortValue): number {
  if (a == null || a === '') return b == null || b === '' ? 0 : 1;
  if (b == null || b === '') return -1;
  return typeof a === 'number' && typeof b === 'number'
    ? a - b
    : collator.compare(String(a), String(b));
}

export default function useTableSort<T extends { id: number }, K extends string>(
  rows: T[],
  columns: Record<K, (row: T) => SortValue>,
  initialKey: NoInfer<K>,
) {
  const [sort, setSort] = useState<{ key: K; direction: 'ascending' | 'descending' }>({
    key: initialKey, direction: 'ascending',
  });
  const sortedRows = [...rows].sort((a, b) => {
    const comparison = compareValues(columns[sort.key](a), columns[sort.key](b));
    return (sort.direction === 'ascending' ? comparison : -comparison) || a.id - b.id;
  });
  const toggleSort = (key: K) => setSort(previous => ({
    key,
    direction: previous.key === key && previous.direction === 'ascending'
      ? 'descending' : 'ascending',
  }));
  return { sortedRows, sort, toggleSort };
}
