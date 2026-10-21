/**
 * Reusable Accessible Form Controls for Gyankunj Studio
 */

import React, { useId, useState, useEffect } from 'react';
import { parseHex } from '../utils/colorUtils';

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="section-title">{children}</div>
);

export const FormGrid: React.FC<{ children: React.ReactNode; cols?: 1 | 2 | 3 }> = ({ children, cols = 2 }) => {
  const colClass = cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1';
  return <div className={`grid gap-3 ${colClass}`}>{children}</div>;
};

export const SelectInput: React.FC<{
  label: string;
  value: string | number;
  options: { v: string | number; l: string }[];
  onChange: (val: any) => void;
}> = ({ label, value, options, onChange }) => {
  const id = useId();
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <select
        id={id}
        className="input text-xs"
        value={String(value)}
        onChange={e => onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)}
      >
        {options.map(opt => (
          <option key={String(opt.v)} value={String(opt.v)}>
            {opt.l}
          </option>
        ))}
      </select>
    </div>
  );
};

export const RangeInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  digits?: number;
  onChange: (val: number) => void;
}> = ({ label, value, min, max, step, unit = '', digits = 0, onChange }) => {
  const id = useId();
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        <span>{label}</span>
        <output>{value.toFixed(digits)}{unit}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
};

export const ColorInput: React.FC<{
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (val: string, coalesce?: boolean) => void;
}> = ({ label, value, disabled, onChange }) => {
  const id = useId();
  const [textVal, setTextVal] = useState(value);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setTextVal(value);
    setIsError(false);
  }, [value]);

  const handleTextChange = (raw: string) => {
    setTextVal(raw);
    const parsed = parseHex(raw);
    if (parsed) {
      setIsError(false);
      onChange(parsed, true);
    } else {
      setIsError(true);
    }
  };

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          id={id}
          type="color"
          disabled={disabled}
          value={value}
          onChange={e => onChange(e.target.value.toLowerCase(), true)}
          className="input !h-9 !w-10 !min-h-0 flex-none !p-0.5 cursor-pointer disabled:opacity-40"
        />
        <input
          type="text"
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          value={textVal}
          onChange={e => handleTextChange(e.target.value)}
          onBlur={() => {
            setTextVal(parseHex(textVal) ?? value);
            setIsError(false);
          }}
          className={`input font-mono uppercase tracking-wide disabled:opacity-40 ${isError ? 'bad' : ''}`}
          aria-label={`${label} HEX color code`}
        />
      </div>
    </div>
  );
};

export const SwitchToggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}> = ({ label, checked, onChange, hint }) => (
  <label className="flex cursor-pointer select-none items-center gap-2.5 text-xs font-semibold text-ink" title={hint}>
    <span className="relative inline-flex h-5 w-9 flex-none items-center">
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span className="absolute inset-0 rounded-full bg-line transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-brand" />
      <span className="absolute left-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
    </span>
    {label}
  </label>
);

export const RadioGroup: React.FC<{
  label?: string;
  value: string | number;
  options: { v: string | number; l: string }[];
  onChange: (val: any) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    {label && <div className="field-label">{label}</div>}
    <div role="radiogroup" aria-label={label} className="flex rounded-xl border border-line bg-canvas p-0.5">
      {options.map(opt => (
        <button
          key={String(opt.v)}
          type="button"
          role="radio"
          aria-checked={opt.v === value}
          onClick={() => onChange(opt.v)}
          className="flex-1 rounded-[0.6rem] px-2 py-1.5 text-center text-[0.74rem] font-semibold text-mute transition-all aria-checked:bg-raised aria-checked:text-brand aria-checked:shadow-sm"
        >
          {opt.l}
        </button>
      ))}
    </div>
  </div>
);

export const TextInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
  const id = useId();
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        className="input text-xs"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

export const StatusCard: React.FC<{
  ok?: boolean;
  children: React.ReactNode;
}> = ({ ok = true, children }) => (
  <div
    className={`rounded-xl border border-line border-l-4 bg-raised px-3 py-2 text-xs leading-relaxed ${
      ok ? 'border-l-emerald-500 text-ink' : 'border-l-amber-500 text-amber-900 dark:text-amber-200'
    }`}
  >
    {children}
  </div>
);
