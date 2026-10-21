/**
 * Studio Panel - Templates, Palette Generator, Saved Design Library & Quick E-book Reset
 */

import React, { useState } from 'react';
import { Sparkles, Dices, BookmarkPlus, Trash2, Check, FileStack, Eraser } from 'lucide-react';
import { EbookSettings } from '../../types/ebook';
import { SectionTitle, ColorInput } from '../FormControls';
import { LAYOUT_TEMPLATES, HF_PRESETS, HEADING_COMBOS, SUBJECT_THEMES } from '../../constants/presets';
import { generateHarmonicPalette } from '../../utils/colorUtils';

interface StudioPanelProps {
  s: EbookSettings;
  patch: (fn: (prev: EbookSettings) => EbookSettings) => void;
  toast: (msg: string, kind?: 'ok' | 'warn') => void;
  onOpenBatchModal?: (mode: 'import' | 'new-ebook') => void;
  onEraseTemplateContent?: () => void;
}

export const StudioPanel: React.FC<StudioPanelProps> = ({
  s,
  patch,
  toast,
  onOpenBatchModal,
  onEraseTemplateContent,
}) => {
  const [baseColor, setBaseColor] = useState(s.theme.primary);
  const [harmony, setHarmony] = useState<'analogous' | 'complementary' | 'triad' | 'split' | 'mono'>('analogous');
  const [saveName, setSaveName] = useState('');

  const applyTemplate = (patchData: Partial<EbookSettings>, name: string) => {
    patch(prev => ({
      ...prev,
      ...patchData,
      type: { ...prev.type, ...(patchData.type || {}) },
      layout: { ...prev.layout, ...(patchData.layout || {}) },
      heads: { ...prev.heads, ...(patchData.heads || {}) },
      toc: { ...prev.toc, ...(patchData.toc || {}) },
    }));
    toast(`${name} टेम्पलेट लागू किया गया।`);
  };

  const generateAndApplyPalette = (scheme = harmony) => {
    const pal = generateHarmonicPalette(baseColor, scheme);
    patch(prev => ({
      ...prev,
      theme: {
        key: 'custom',
        ...pal,
      },
    }));
    toast(`हार्मोनिक ${scheme} पैलेट तैयार किया गया।`);
  };

  const handleSurpriseMe = () => {
    const randomAngle = Math.floor(Math.random() * 360);
    const schemes: ('analogous' | 'complementary' | 'triad' | 'split')[] = ['analogous', 'complementary', 'triad', 'split'];
    const chosenScheme = schemes[Math.floor(Math.random() * schemes.length)];
    const pal = generateHarmonicPalette(`hsl(${randomAngle}, 70%, 25%)`, chosenScheme);

    const randomHf = HF_PRESETS[Math.floor(Math.random() * HF_PRESETS.length)];
    const randomCombo = HEADING_COMBOS[Math.floor(Math.random() * HEADING_COMBOS.length)];
    const randomSubj = SUBJECT_THEMES[Math.floor(Math.random() * SUBJECT_THEMES.length)];
    const randomTpl = LAYOUT_TEMPLATES[Math.floor(Math.random() * LAYOUT_TEMPLATES.length)];

    patch(prev => {
      let next = { ...prev, ...randomTpl.patch };
      const { k, e, n, ...hfConfig } = randomHf;
      next = {
        ...next,
        theme: { key: 'custom', ...pal },
        brand: { ...next.brand, subject: randomSubj.key },
        heads: {
          ...next.heads,
          h1: randomCombo.h1 as any,
          h2: randomCombo.h2 as any,
          h3: randomCombo.h3 as any,
          gradPreset: 'theme',
        },
        hf: {
          ...next.hf,
          live: true,
          ...hfConfig,
          f: [...randomHf.h],
        },
      };
      return next;
    });

    setBaseColor(pal.primary);
    toast('🎲 नया रैंडम डिज़ाइन लागू! (नापसंद होने पर Ctrl+Z से Undo करें)');
  };

  const handleSaveToLibrary = () => {
    const name = saveName.trim() || `डिज़ाइन #${s.library.length + 1}`;
    const newItem = {
      id: Math.random().toString(36).slice(2, 9),
      name,
      at: Date.now(),
      data: {
        theme: s.theme,
        type: s.type,
        layout: s.layout,
        heads: s.heads,
        brand: s.brand,
        watermark: s.watermark,
        toc: s.toc,
        hf: s.hf,
      },
    };
    patch(prev => ({
      ...prev,
      library: [newItem, ...prev.library].slice(0, 30),
    }));
    setSaveName('');
    toast(`"${name}" को आपकी लाइब्रेरी में सुरक्षित किया गया।`);
  };

  const handleApplyLibraryItem = (item: typeof s.library[0]) => {
    patch(prev => ({
      ...prev,
      ...item.data,
    }));
    toast(`"${item.name}" लागू किया गया।`);
  };

  const handleDeleteLibraryItem = (id: string) => {
    patch(prev => ({
      ...prev,
      library: prev.library.filter(item => item.id !== id),
    }));
    toast('डिज़ाइन हटा दिया गया।');
  };

  return (
    <div className="space-y-4">
      {/* New E-book & Multi-File .MD Builder Quick Launch */}
      {(onOpenBatchModal || onEraseTemplateContent) && (
        <div className="space-y-2 rounded-2xl border border-brand/30 bg-brand-soft/20 p-3">
          <div className="text-xs font-bold text-ink">
            🚀 नयी ई-बुक व बल्क Markdown (.md) स्टूडियो
          </div>
          <p className="text-[0.7rem] leading-relaxed text-mute">
            सैंपल टेम्पलेट टेक्स्ट को हटाकर नयी ई-बुक शुरू करें या एक साथ कई <code>.md</code> फ़ाइलें जोड़कर एकसमान स्टाइलिंग वाली बड़ी ई-बुक बनाएँ।
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {onOpenBatchModal && (
              <button
                type="button"
                onClick={() => onOpenBatchModal('import')}
                className="btn btn-primary !min-h-8.5 text-xs font-bold"
              >
                <FileStack size={14} /> Multiple .MD जोड़ें
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                onOpenBatchModal ? onOpenBatchModal('new-ebook') : onEraseTemplateContent?.()
              }
              className="btn !min-h-8.5 border-amber-500/50 bg-amber-500/10 text-xs font-bold text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
            >
              <Eraser size={14} /> टेम्पलेट मिटाएँ / नयी बुक
            </button>
          </div>
        </div>
      )}

      {/* Layout Templates */}
      <SectionTitle>लेआउट टेम्पलेट (Presets)</SectionTitle>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {LAYOUT_TEMPLATES.map(tpl => (
          <button
            key={tpl.k}
            type="button"
            onClick={() => applyTemplate(tpl.patch, tpl.n)}
            className="chip-btn text-left"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <span>{tpl.e}</span>
              <span>{tpl.n}</span>
            </div>
            <div className="mt-1 text-[0.7rem] font-normal leading-tight text-mute">{tpl.d}</div>
          </button>
        ))}
      </div>

      {/* Palette Generator */}
      <SectionTitle>स्मार्ट कलर पैलेट जेनरेटर</SectionTitle>
      <div className="space-y-3 rounded-2xl border border-line bg-raised p-3">
        <ColorInput
          label="आधार रंग (Base Color)"
          value={baseColor}
          onChange={val => {
            setBaseColor(val);
          }}
        />

        <div>
          <div className="field-label">कलर हार्मोनी स्कीम</div>
          <div className="flex flex-wrap gap-1.5">
            {(['analogous', 'complementary', 'triad', 'split', 'mono'] as const).map(sch => (
              <button
                key={sch}
                type="button"
                onClick={() => {
                  setHarmony(sch);
                  generateAndApplyPalette(sch);
                }}
                className={`btn !min-h-7.5 !px-2.5 text-xs ${harmony === sch ? '!border-brand !text-brand bg-brand-soft' : ''}`}
              >
                {sch === 'analogous' ? 'Analogous' : sch === 'complementary' ? 'Complement' : sch === 'triad' ? 'Triad' : sch === 'split' ? 'Split' : 'Monochrome'}
              </button>
            ))}
          </div>
        </div>

        {/* Color Strip */}
        <div className="flex h-7 overflow-hidden rounded-xl ring-1 ring-line">
          {[s.theme.primary, s.theme.accent, s.theme.secondary, s.theme.paper, s.theme.text].map((color, i) => (
            <div key={i} className="flex-1" style={{ background: color }} title={color} />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => generateAndApplyPalette()}
            className="btn btn-primary flex-1"
          >
            <Sparkles size={14} /> रंग लागू करें
          </button>
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="btn btn-gold flex-1"
          >
            <Dices size={14} /> Surprise Me (रैंडम)
          </button>
        </div>
      </div>

      {/* Saved Design Library */}
      <SectionTitle>मेरी डिज़ाइन लाइब्रेरी (Saved Library)</SectionTitle>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="इस डिज़ाइन का नाम लिखें..."
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveToLibrary()}
            className="input text-xs"
          />
          <button
            type="button"
            onClick={handleSaveToLibrary}
            className="btn btn-primary flex-none"
          >
            <BookmarkPlus size={15} /> सुरक्षित करें
          </button>
        </div>

        <div className="space-y-2">
          {s.library.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-3 text-center text-xs text-mute">
              अभी कोई सहेजा गया डिज़ाइन नहीं है। अपना मनपसंद संयोजन ऊपर सुरक्षित करें।
            </div>
          ) : (
            s.library.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-raised p-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-7 w-10 flex-none rounded-md ring-1 ring-black/10"
                    style={{
                      background: `linear-gradient(90deg, ${item.data.theme?.primary || '#000'} 0 35%, ${item.data.theme?.accent || '#c39a48'} 35% 70%, ${item.data.theme?.secondary || '#8e1934'} 70%)`,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-ink">{item.name}</div>
                    <div className="text-[0.65rem] text-mute">
                      {new Date(item.at).toLocaleDateString('hi-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-none">
                  <button
                    type="button"
                    onClick={() => handleApplyLibraryItem(item)}
                    className="btn !min-h-7.5 !px-2.5 text-xs text-brand"
                  >
                    <Check size={13} /> लागू करें
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLibraryItem(item.id)}
                    className="btn !min-h-7.5 !px-2 text-mute hover:text-warn"
                    title="हटाएँ"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
