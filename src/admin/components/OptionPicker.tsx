import { useEffect, useId, useRef, useState } from 'react';
import './CustomerPicker.css';
import { errorMessage } from '../../utils/errors';

type Props = { label: string; name: string; value: string; options: string[]; disabled: boolean; onChange: (value: string) => void; onCreate: (value: string) => Promise<string> };

export function canAddOption(options: string[], value: string) {
  const normalized = value.trim().toLocaleLowerCase('de');
  return Boolean(normalized) && !options.some(option => option.trim().toLocaleLowerCase('de') === normalized);
}

export function matchingOptions(options: string[], query: string) {
  const term = query.trim().toLocaleLowerCase('de');
  return term ? options.filter(option => option.toLocaleLowerCase('de').includes(term)) : [];
}

export default function OptionPicker({ label, name, value, options, disabled, onChange, onCreate }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [creating, setCreating] = useState(false);
  const creatingRef = useRef(false);
  const [createError, setCreateError] = useState('');
  const canAdd = canAddOption(options, value);
  const suggestions = matchingOptions(options, value);
  const expanded = open && Boolean(value.trim());
  useEffect(() => {
    input.current?.setCustomValidity(!value || options.includes(value) ? '' : 'Bitte einen Wert aus den Vorschlägen auswählen.');
  }, [value, options]);
  useEffect(() => {
    if (active >= 0) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [id, active]);
  function choose(option: string) {
    onChange(option); setOpen(false); setActive(-1); input.current?.focus();
  }
  async function addOption() {
    if (!canAdd || disabled || creatingRef.current) return;
    creatingRef.current = true;
    setCreating(true); setCreateError('');
    try {
      const savedValue = await onCreate(value.trim());
      choose(savedValue);
    } catch (error: unknown) {
      setCreateError(errorMessage(error, `${label} konnte nicht hinzugefügt werden.`));
      setOpen(true);
    } finally {
      creatingRef.current = false; setCreating(false);
    }
  }
  return (
    <div className="customer-picker option-picker" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <label htmlFor={id}>{label}</label>
      <input ref={input} id={id} name={name} value={value} disabled={disabled} readOnly={creating} autoComplete="off"
        placeholder={disabled ? 'Wird geladen …' : `${label} eingeben …`} role="combobox"
        aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-list`}
        aria-activedescendant={expanded && active >= 0 && suggestions[active] ? `${id}-option-${active}` : undefined}
        onFocus={() => setOpen(true)}
        onChange={event => { onChange(event.target.value); setOpen(true); setActive(-1); setCreateError(''); }}
        onKeyDown={event => {
          if (creating) { event.preventDefault(); return; }
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true);
            setActive(previous => suggestions.length ? (event.key === 'ArrowDown'
              ? Math.min(previous + 1, suggestions.length - 1) : Math.max(previous - 1, 0)) : -1);
          }
          if (event.key === 'Enter' && expanded) {
            event.preventDefault();
            if (active >= 0 && suggestions[active]) choose(suggestions[active]);
            else if (suggestions.length === 1) choose(suggestions[0]);
            else input.current?.reportValidity();
          }
        }} />
      {expanded && <div className="customer-picker-results">
        <ul id={`${id}-list`} role="listbox" aria-label={`${label}: Vorschläge`}>
          {suggestions.map((option, index) => <li key={option} id={`${id}-option-${index}`}
            role="option" aria-selected={active === index} className={active === index ? 'is-active' : undefined}
            onMouseDown={event => event.preventDefault()} onClick={() => { if (!creating) choose(option); }}>{option}</li>)}
        </ul>
        {!suggestions.length && <p role="status">Keine passenden Vorschläge gefunden.</p>}
        {canAdd && <button type="button" className="option-add-button" disabled={creating}
          onMouseDown={event => event.preventDefault()} onClick={() => void addOption()}>
          {creating ? 'Wird hinzugefügt …' : `„${value.trim()}“ neu hinzufügen`}
        </button>}
        {createError && <p className="address-error" role="alert">{createError}</p>}
      </div>}
    </div>
  );
}
