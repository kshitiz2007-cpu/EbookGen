/**
 * Theme & Branding Panel
 */

import React from 'react';
import { EbookSettings } from '../../types/ebook';
import { SectionTitle, FormGrid, ColorInput, SelectInput, SwitchToggle, StatusCard } from '../FormControls';
import { THEME_PRESETS, SUBJECT_THEMES } from '../../constants/presets';
import { getContrastRatio, formatContrastBadge } from '../../utils/colorUtils';

interface ThemePanelProps {
  s: EbookSettings;
  set: (path: string, val: any, coalesce?: boolean) => void;
  patch: (fn: (prev: EbookSettings) => EbookSettings) => void;
  toast: (msg: string) => void;
}

export const ThemePanel: React.FC<ThemePanelProps> = ({ s, set, patch, toast }) => {
  const theme = s.theme;

  const handleApplyPreset = (key: string) => {
    const p = THEME_PRESETS.find(item => item.key === key);
    if (!p) return;
    patch(prev => ({
      ...prev,
      theme: {
        key: p.key,
        primary: p.primary,
        accent: p.accent,
        secondary: p.secondary,
        paper: p.paper,
        text: p.text,
      },
    }));
    toast(`${p.name} थीम लागू की गई।`);
  };

  const textContrast = getContrastRatio(theme.text, theme.paper);
  const headingContrast = getContrastRatio(theme.primary, theme.paper);
  const secContrast = getContrastRatio(theme.secondary, theme.paper);

  return (
    <div className="space-y-4">
      {/* Theme Presets */}
      <SectionTitle>थीम प्रीसेट्स (Theme Presets)</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {THEME_PRESETS.map(p => (
          <button
            key={p.key}
            type="button"
            onClick={() => handleApplyPreset(p.key)}
            className={`chip-btn ${theme.key === p.key ? '!border-brand ring-2 ring-brand/30' : ''}`}
          >
            <span
              className="mb-1.5 block h-5 rounded-md ring-1 ring-black/10"
              style={{
                background: `linear-gradient(90deg, ${p.primary} 0 35%, ${p.accent} 35% 70%, ${p.secondary} 70%)`,
              }}
            />
            <div className="text-xs font-bold text-ink">
              {p.emoji} {p.name}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Theme Colors */}
      <SectionTitle>रंग चयन (Custom HEX)</SectionTitle>
      <FormGrid cols={2}>
        <ColorInput
          label="मुख्य रंग (Primary)"
          value={theme.primary}
          onChange={(val, coalesce) => set('theme.primary', val, coalesce)}
        />
        <ColorInput
          label="हाइलाइट (Accent Gold)"
          value={theme.accent}
          onChange={(val, coalesce) => set('theme.accent', val, coalesce)}
        />
        <ColorInput
          label="द्वितीयक (Secondary)"
          value={theme.secondary}
          onChange={(val, coalesce) => set('theme.secondary', val, coalesce)}
        />
        <ColorInput
          label="कागज़ / पेज (Paper BG)"
          value={theme.paper}
          onChange={(val, coalesce) => set('theme.paper', val, coalesce)}
        />
        <ColorInput
          label="मुख्य पाठ्य रंग (Text)"
          value={theme.text}
          onChange={(val, coalesce) => set('theme.text', val, coalesce)}
        />
        <div className="flex flex-col justify-end">
          <StatusCard ok={textContrast >= 4.5}>
            <div className="font-bold">Text Contrast: {textContrast.toFixed(1)}:1</div>
            <div className="text-[0.68rem] opacity-80">
              {textContrast >= 4.5 ? '✓ WCAG AA उत्तीर्ण' : '⚠️ कंट्रास्ट कम है, गहरा पाठ्य रंग चुनें'}
            </div>
          </StatusCard>
        </div>
      </FormGrid>

      {/* Cover & Brand Layout */}
      <SectionTitle>कवर पेज एवं ब्रांडिंग</SectionTitle>
      <FormGrid cols={2}>
        <SelectInput
          label="कवर डिज़ाइन शैली"
          value={s.brand.coverStyle}
          onChange={val => set('brand.coverStyle', val)}
          options={[
            { v: 'thematic', l: 'Thematic (विषय-आधारित चिह्न व रंग)' },
            { v: 'premium', l: 'Premium Gradient' },
            { v: 'split', l: 'Diagonal Split (पत्रिका शैली)' },
            { v: 'mesh', l: 'Mesh Aurora' },
            { v: 'ornate', l: 'Ornate Frame (पारंपरिक बॉर्डर)' },
            { v: 'minimal', l: 'Minimal Light (सरल अकादमिक)' },
          ]}
        />

        <SelectInput
          label="विषय थीम (Subject Theme)"
          value={s.brand.subject}
          onChange={val => set('brand.subject', val)}
          options={SUBJECT_THEMES.map(sub => ({ v: sub.key, l: sub.name }))}
        />
      </FormGrid>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <SwitchToggle
          label="कवर पेज शामिल करें"
          checked={s.brand.showCover}
          onChange={val => set('brand.showCover', val)}
        />
        <SwitchToggle
          label="पेज हेडर दिखाएँ"
          checked={s.brand.showHeader}
          onChange={val => set('brand.showHeader', val)}
        />
        <SwitchToggle
          label="पेज फ़ूटर दिखाएँ"
          checked={s.brand.showFooter}
          onChange={val => set('brand.showFooter', val)}
        />
        <SwitchToggle
          label="पेज शीर्षक पट्टी (Title bar)"
          checked={s.brand.showTitleBar}
          onChange={val => set('brand.showTitleBar', val)}
        />
        <SwitchToggle
          label="संस्थान का पता दिखाएँ"
          checked={s.brand.showAddress}
          onChange={val => set('brand.showAddress', val)}
        />
        <SwitchToggle
          label="पेज नंबर दिखाएँ"
          checked={s.brand.showPageNumber}
          onChange={val => set('brand.showPageNumber', val)}
        />
        <SwitchToggle
          label="कॉम्पैक्ट हेडर (कम ऊँचाई)"
          checked={s.brand.compactHeader}
          onChange={val => set('brand.compactHeader', val)}
        />
      </div>
    </div>
  );
};
