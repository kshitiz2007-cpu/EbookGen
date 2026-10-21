/**
 * Command Palette with Search and Keyboard Navigation
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Search, Command } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  group: string;
  hint?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, commands }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(cmd => `${cmd.label} ${cmd.group}`.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  const execute = (cmd?: CommandItem) => {
    if (cmd) {
      onClose();
      requestAnimationFrame(cmd.run);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-xs"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface-solid shadow-float">
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search size={18} className="text-mute" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => Math.max(0, i - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                execute(filtered[selectedIndex]);
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="कमांड खोजें — थीम, फ़ॉन्ट, TOC, PDF, लेआउट..."
            className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-mute"
          />
          <span className="kbd">Esc</span>
        </div>

        <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {filtered.length === 0 ? (
            <li className="p-4 text-center text-xs text-mute">कोई कमांड नहीं मिली</li>
          ) : (
            filtered.map((cmd, idx) => (
              <li key={cmd.id} role="option" aria-selected={idx === selectedIndex}>
                <button
                  type="button"
                  onMouseMove={() => setSelectedIndex(idx)}
                  onClick={() => execute(cmd)}
                  data-active={idx === selectedIndex}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs text-ink transition-colors data-[active=true]:bg-brand-soft data-[active=true]:text-brand"
                >
                  <div className="flex items-center gap-2">
                    <Command size={14} className="opacity-50" />
                    <span>{cmd.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[0.68rem] text-mute">
                    {cmd.hint && <span className="kbd">{cmd.hint}</span>}
                    <span>{cmd.group}</span>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};
