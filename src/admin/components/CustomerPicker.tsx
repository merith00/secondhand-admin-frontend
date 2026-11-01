import { useEffect, useId, useRef, useState } from 'react';
import type { Customer } from '../../types';
import './CustomerPicker.css';

type Props = { customers: Customer[]; value: string; onChange: (id: string) => void };
const collator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });
const label = (customer: Customer) => `${customer.customer_number} ${customer.first_name} ${customer.last_name}`;

export function findCustomerSuggestions(customers: Customer[], query: string) {
  const term = query.trim().toLocaleLowerCase('de');
  if (!term) return [];
  return customers.filter(customer => customer.customer_number.toLocaleLowerCase('de').startsWith(term)
    || `${customer.first_name} ${customer.last_name}`.toLocaleLowerCase('de').includes(term))
    .sort((a, b) => collator.compare(a.customer_number, b.customer_number) || a.id - b.id);
}

export default function CustomerPicker({ customers, value, onChange }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const selected = customers.find(customer => String(customer.id) === value);
  const text = query ?? (selected ? label(selected) : '');
  const suggestions = findCustomerSuggestions(customers, query ?? '');
  const expanded = open && query !== null && Boolean(query.trim());

  useEffect(() => {
    input.current?.setCustomValidity(selected ? '' : 'Bitte eine Kundin oder einen Kunden aus den Vorschlägen auswählen.');
  }, [selected, text]);

  useEffect(() => {
    if (active >= 0) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, id]);

  function choose(customer: Customer) {
    onChange(String(customer.id));
    setQuery(null); setOpen(false); setActive(-1);
    input.current?.focus();
  }

  return (
    <div className="customer-picker" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <label htmlFor={id}>Kundin / Kunde</label>
      <input ref={input} id={id} type="text" role="combobox" autoComplete="off" required
        placeholder="Kundennummer oder Name eingeben …" value={text}
        aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-list`}
        aria-activedescendant={expanded && active >= 0 && suggestions[active] ? `${id}-option-${active}` : undefined}
        onFocus={() => setOpen(true)}
        onChange={event => { setQuery(event.target.value); onChange(''); setOpen(true); setActive(-1); }}
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); return; }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true);
            setActive(previous => suggestions.length ? (event.key === 'ArrowDown'
              ? Math.min(previous + 1, suggestions.length - 1) : Math.max(previous - 1, 0)) : -1);
          }
          if (event.key === 'Enter' && !selected) {
            event.preventDefault();
            if (expanded && active >= 0 && suggestions[active]) choose(suggestions[active]);
            else { setOpen(true); input.current?.reportValidity(); }
          }
        }} />
      {expanded && <div className="customer-picker-results">
        <ul id={`${id}-list`} role="listbox" aria-label="Passende Kunden">
          {suggestions.map((customer, index) => (
            <li key={customer.id} id={`${id}-option-${index}`} role="option" aria-selected={active === index}
              className={active === index ? 'is-active' : undefined}
              onMouseDown={event => event.preventDefault()} onClick={() => choose(customer)}>
              {label(customer)}
            </li>
          ))}
        </ul>
        {!suggestions.length && <p role="status">Keine passenden Kunden gefunden.</p>}
      </div>}
    </div>
  );
}
