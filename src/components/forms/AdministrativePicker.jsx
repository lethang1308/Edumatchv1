import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin, Search } from 'lucide-react';
import { searchAdministrativeOptions } from '@/data/administrativeUnits';
import './administrativePicker.css';

export function AdministrativePicker({
  id,
  label,
  value,
  options,
  onSelect,
  placeholder,
  disabled = false,
  emptyText = 'Không tìm thấy địa điểm phù hợp.',
}) {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const selectedValue = useRef(value || '');
  const containerRef = useRef(null);

  useEffect(() => {
    if (value !== selectedValue.current) {
      selectedValue.current = value || '';
      setQuery(value || '');
    }
  }, [value]);

  useEffect(() => {
    const closeOnOutsidePress = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress);
  }, []);

  const matches = useMemo(
    () => searchAdministrativeOptions(options, query),
    [options, query],
  );

  const selectOption = (option) => {
    selectedValue.current = option.name;
    setQuery(option.name);
    onSelect(option.name);
    setIsOpen(false);
  };

  const handleChange = (event) => {
    const nextQuery = event.target.value;
    selectedValue.current = '';
    setQuery(nextQuery);
    onSelect('');
    setIsOpen(true);
  };

  return (
    <div className={`administrative-picker ${disabled ? 'is-disabled' : ''}`} ref={containerRef}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="administrative-picker__control">
        <Search size={17} aria-hidden="true" />
        <input
          id={id}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && !disabled}
          aria-controls={`${id}-options`}
        />
        <ChevronDown size={17} aria-hidden="true" />
      </div>
      {isOpen && !disabled && (
        <div className="administrative-picker__menu" id={`${id}-options`} role="listbox">
          <p className="administrative-picker__hint">Gõ để tìm, sau đó chọn một địa điểm trong danh sách.</p>
          {matches.length ? matches.map((option) => (
            <button
              type="button"
              key={option.id}
              role="option"
              aria-selected={option.name === value}
              className={option.name === value ? 'is-selected' : ''}
              onClick={() => selectOption(option)}
            >
              <MapPin size={15} aria-hidden="true" />
              <span>{option.name}<small>{option.type}</small></span>
              {option.name === value && <Check size={16} aria-hidden="true" />}
            </button>
          )) : <p className="administrative-picker__empty">{emptyText}</p>}
        </div>
      )}
    </div>
  );
}
