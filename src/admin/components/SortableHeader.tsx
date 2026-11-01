import type { CSSProperties, ReactNode } from 'react';
import './SortableHeader.css';

type Props = {
  children: ReactNode;
  direction?: 'ascending' | 'descending';
  onSort: () => void;
  style?: CSSProperties;
};

export default function SortableHeader({ children, direction, onSort, style }: Props) {
  return (
    <th scope="col" aria-sort={direction ?? 'none'} style={style}>
      <button type="button" className="table-sort-button" onClick={onSort}
        title={`${children}: ${direction === 'ascending' ? 'absteigend' : 'aufsteigend'} sortieren`}>
        {children} <span aria-hidden="true">{direction === 'ascending' ? '▲' : direction === 'descending' ? '▼' : '↕'}</span>
      </button>
    </th>
  );
}
