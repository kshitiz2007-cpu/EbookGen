/**
 * Headings, Gradients, and Component Styling Panel
 */

import React from 'react';
import { EbookSettings } from '../../types/ebook';
import { SectionTitle, FormGrid, SelectInput, ColorInput, RangeInput } from '../FormControls';
import { HEADING_COMBOS, HEADING_GRADIENTS } from '../../constants/presets';

interface HeadingsPanelProps {
  s: EbookSettings;
  set: (path: string, val: any, coalesce?: boolean) => void;
  patch: (fn: (prev: EbookSettings) => EbookSettings) => void;
  toast: (msg: string) => void;
}

export const HeadingsPanel: React.FC<HeadingsPanelProps> = ({ s, set, patch, toast }) => {
  const heads = s.heads;

  const handleApplyCombo = (comboKey: string) => {
    const c = HEADING_COMBOS.find(item => item.k === comboKey);
    if (!c) return;
    const gradInfo = HEADING_GRADIENTS[c.k];

    patch(prev => ({
      ...prev,
      heads: {
        ...prev.heads,
        h1: c.h1 as any,
        h2: c.h2 as any,
        h3: c.h3 as any,
        gradPreset: c.k,
        g: gradInfo?.c ? [...gradInfo.c] : prev.heads.g,
      },
    }));
    toast(`${c.n} हेडिंग संयोजन लागू किया गया।`);
  };

  const handlePresetChange = (presetKey: string) => {
    const info = HEADING_GRADIENTS[presetKey];
    patch(prev => ({
      ...prev,
      heads: {
        ...prev.heads,
        gradPreset: presetKey,
        g: info?.c ? [...info.c] : prev.heads.g,
      },
    }));
  };

  const effectiveGradientColors = heads.gradPreset === 'theme'
    ? [s.theme.primary, s.theme.secondary, s.theme.accent]
    : heads.g;

  return (
    <div className="space-y-4">
      {/* Ready Combos */}
      <SectionTitle>शीर्षक शैली कॉम्बो (Heading Combos)</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {HEADING_COMBOS.map(c => (
          <button
            key={c.k}
            type="button"
            onClick={() => handleApplyCombo(c.k)}
            className="chip-btn"
          >
            <span
              className="mb-1.5 block h-4 rounded-md ring-1 ring-black/10"
              style={{
                background: `linear-gradient(90deg, ${(HEADING_GRADIENTS[c.k]?.c ?? ['#000', '#444', '#888']).join(',')})`,
              }}
            />
            <div className="text-xs font-bold text-ink">
              {c.e} {c.n}
            </div>
          </button>
        ))}
      </div>

      {/* Heading Gradient Studio */}
      <SectionTitle>हेडिंग ग्रेडिएंट एडिटर (Gradient Studio)</SectionTitle>
      <div className="space-y-3 rounded-2xl border border-line bg-raised p-3">
        <SelectInput
          label="ग्रेडिएंट पैलेट"
          value={heads.gradPreset}
          onChange={handlePresetChange}
          options={[
            ...Object.entries(HEADING_GRADIENTS).map(([k, v]) => ({ v: k, l: v.n })),
            { v: 'custom', l: 'कस्टम (अपनी पसंद के HEX रंग)' },
          ]}
        />

        <FormGrid cols={3}>
          <ColorInput
            label="आरंभ (Start)"
            value={heads.g[0]}
            disabled={heads.gradPreset === 'theme'}
            onChange={(val, coalesce) => {
              set('heads.g.0', val, coalesce);
              if (heads.gradPreset !== 'custom') set('heads.gradPreset', 'custom');
            }}
          />
          <ColorInput
            label="मध्य (Middle)"
            value={heads.g[1]}
            disabled={heads.gradPreset === 'theme'}
            onChange={(val, coalesce) => {
              set('heads.g.1', val, coalesce);
              if (heads.gradPreset !== 'custom') set('heads.gradPreset', 'custom');
            }}
          />
          <ColorInput
            label="अंत (End)"
            value={heads.g[2]}
            disabled={heads.gradPreset === 'theme'}
            onChange={(val, coalesce) => {
              set('heads.g.2', val, coalesce);
              if (heads.gradPreset !== 'custom') set('heads.gradPreset', 'custom');
            }}
          />
        </FormGrid>

        <RangeInput
          label="ग्रेडिएंट कोण (Angle)"
          value={heads.gAng}
          min={0}
          max={360}
          step={15}
          unit="°"
          onChange={val => set('heads.gAng', val, true)}
        />

        {/* Live Ribbon */}
        <div
          className="h-9 w-full rounded-xl shadow-sm"
          style={{
            background: `linear-gradient(${heads.gAng}deg, ${effectiveGradientColors.join(', ')})`,
          }}
        />
      </div>

      {/* Heading Styles */}
      <SectionTitle>हेडिंग शैलियाँ (Heading Styles)</SectionTitle>
      <FormGrid cols={3}>
        <SelectInput
          label="H1 — मुख्य अध्याय"
          value={heads.h1}
          onChange={val => set('heads.h1', val)}
          options={[
            { v: 'rule', l: 'स्वर्ण रेखा (Gold underline)' },
            { v: 'band', l: 'रंगीन पट्टी (Filled band)' },
            { v: 'left', l: 'बाईं ओर बार (Left bar)' },
            { v: 'center', l: 'केंद्रित (Centered)' },
            { v: 'gradient', l: '✨ ग्रेडिएंट रिबन' },
          ]}
        />

        <SelectInput
          label="H2 — उप-शीर्षक"
          value={heads.h2}
          onChange={val => set('heads.h2', val)}
          options={[
            { v: 'left', l: 'बाईं पट्टी (Accent bar)' },
            { v: 'band', l: 'सॉफ्ट कार्ड (Card)' },
            { v: 'underline', l: 'नीचे रेखा (Underline)' },
            { v: 'numbered', l: 'क्रमांक 01, 02 (Numbered)' },
            { v: 'gradient', l: '✨ ग्रेडिएंट कार्ड' },
          ]}
        />

        <SelectInput
          label="H3 — लघु शीर्षक"
          value={heads.h3}
          onChange={val => set('heads.h3', val)}
          options={[
            { v: 'accent', l: 'द्वितीयक रंग (Accent)' },
            { v: 'pill', l: 'पिल कैप्सूल (Pill)' },
            { v: 'underline', l: 'डैश अंडरलाइन (Dashed)' },
            { v: 'plain', l: 'सादा (Plain text)' },
            { v: 'gradient', l: '✨ ग्रेडिएंट टेक्स्ट' },
          ]}
        />
      </FormGrid>

      {/* Components Styling */}
      <SectionTitle>घटक एवं प्रारूप (Components)</SectionTitle>
      <FormGrid cols={3}>
        <SelectInput
          label="तालिका प्रारूप (Table)"
          value={heads.table}
          onChange={val => set('heads.table', val)}
          options={[
            { v: 'striped', l: 'धारीदार (Striped)' },
            { v: 'grid', l: 'पूर्ण ग्रिड (Grid)' },
            { v: 'minimal', l: 'न्यूनतम रेखा (Minimal)' },
            { v: 'cards', l: 'कार्ड शैली (Cards)' },
          ]}
        />

        <SelectInput
          label="तथ्य व नोट बॉक्स (Callouts)"
          value={heads.callout}
          onChange={val => set('heads.callout', val)}
          options={[
            { v: 'left', l: 'बाईं रंगीन पट्टी' },
            { v: 'filled', l: 'हल्का भरा हुआ कार्ड' },
            { v: 'border', l: 'आउटलाइन बॉर्डर' },
          ]}
        />

        <SelectInput
          label="सूची चिह्न (List Style)"
          value={heads.list}
          onChange={val => set('heads.list', val)}
          options={[
            { v: 'classic', l: 'क्लासिक बुलेट्स (•)' },
            { v: 'check', l: 'चेक-मार्क (✓)' },
            { v: 'compact', l: 'सघन (Compact)' },
          ]}
        />
      </FormGrid>
    </div>
  );
};
