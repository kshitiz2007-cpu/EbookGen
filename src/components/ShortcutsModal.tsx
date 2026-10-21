/**
 * Keyboard Shortcuts Modal
 */

import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_LIST = [
  { key: 'Ctrl / ⌘ + K', desc: 'कमांड पैलेट (Command Palette खोलें)' },
  { key: 'Ctrl / ⌘ + M', desc: 'बल्क .MD ई-बुक बिल्डर व टेम्पलेट इरेज़र खोलें' },
  { key: 'Ctrl / ⌘ + Z', desc: 'Undo (अंतिम बदलाव वापस लें)' },
  { key: 'Ctrl / ⌘ + Y / Shift+Z', desc: 'Redo (पुनः लागू करें)' },
  { key: 'Ctrl / ⌘ + P', desc: 'PDF / प्रिंट डायलॉग खोलें' },
  { key: 'D', desc: 'रेखाचित्र व फ़्लोचार्ट स्टूडियो (Diagram Studio)' },
  { key: 'F', desc: 'Focus Mode (साइडबार छुपाएँ/दिखाएँ)' },
  { key: 'Left / Right Arrow', desc: 'पिछला / अगला पेज' },
  { key: 'PageUp / PageDown', desc: 'पेज नेविगेशन' },
  { key: '?', desc: 'शॉर्टकट मेन्यू खोलें' },
  { key: 'Esc', desc: 'मोडल / फोकस मोड बंद करें' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface-solid shadow-float">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Command className="text-brand" size={18} />
            <h2 className="text-base font-bold text-ink">कीबोर्ड शॉर्टकट (Shortcuts)</h2>
          </div>
          <button type="button" onClick={onClose} className="btn !min-h-8 !px-2">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <dl className="grid gap-2.5">
            {SHORTCUT_LIST.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                <dt className="kbd">{item.key}</dt>
                <dd className="text-mute">{item.desc}</dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={onClose} className="btn btn-primary mt-5 w-full">
            समझ गया (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
