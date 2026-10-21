/**
 * Page Layout & Margins Panel
 */

import React from 'react';
import { EbookSettings } from '../../types/ebook';
import { SectionTitle, FormGrid, RadioGroup, RangeInput, SelectInput, SwitchToggle } from '../FormControls';

interface LayoutPanelProps {
  s: EbookSettings;
  set: (path: string, val: any, coalesce?: boolean) => void;
}

export const LayoutPanel: React.FC<LayoutPanelProps> = ({ s, set }) => {
  const layout = s.layout;

  return (
    <div className="space-y-4">
      <SectionTitle>कॉलम संरचना (Columns)</SectionTitle>
      <RadioGroup
        value={layout.columns}
        onChange={val => set('layout.columns', Number(val))}
        options={[
          { v: 2, l: '2-कॉलम (सघन नोट्स · Two-Column)' },
          { v: 1, l: '1-कॉलम (पुस्तक प्रारूप · Single Column)' },
        ]}
      />

      <SectionTitle>पेज मार्जिन व गोलाई (Margins & Geometry)</SectionTitle>
      <div className="space-y-3">
        <RangeInput
          label="बाएँ / दाएँ मार्जिन (Pad X)"
          value={layout.padX}
          min={6}
          max={24}
          step={1}
          unit=" mm"
          onChange={val => set('layout.padX', val, true)}
        />

        <RangeInput
          label="ऊपर / नीचे मार्जिन (Pad Y)"
          value={layout.padY}
          min={3}
          max={18}
          step={1}
          unit=" mm"
          onChange={val => set('layout.padY', val, true)}
        />

        <RangeInput
          label="कार्ड व बॉक्स कोनों की गोलाई (Radius)"
          value={layout.radius}
          min={0}
          max={16}
          step={1}
          unit=" px"
          onChange={val => set('layout.radius', val, true)}
        />
      </div>

      <SectionTitle>पेज बॉर्डर एवं पृष्ठभूमि (Frame & Surface)</SectionTitle>
      <FormGrid cols={2}>
        <SelectInput
          label="पेज फ़्रेम बॉर्डर (Frame)"
          value={layout.frame}
          onChange={val => set('layout.frame', val)}
          options={[
            { v: 'none', l: 'कोई फ़्रेम नहीं (None)' },
            { v: 'thin', l: 'पतली रेखा (Thin border)' },
            { v: 'double', l: 'दोहरी एक्सेंट फ़्रेम (Double)' },
            { v: 'top', l: 'शीर्ष रंगीन पट्टी (Top strip)' },
            { v: 'corners', l: 'कोने की डिज़ाइन (Corner trim)' },
          ]}
        />

        <SelectInput
          label="पेज सतह शैली (Page Style)"
          value={layout.pageStyle}
          onChange={val => set('layout.pageStyle', val)}
          options={[
            { v: 'clean', l: 'स्वच्छ श्वेत (Clean)' },
            { v: 'soft', l: 'हल्का रेडियल ग्लो (Soft glow)' },
            { v: 'paper', l: 'प्राचीन पांडुलिपि (Aged paper)' },
            { v: 'modern', l: 'आधुनिक ग्रेडिएंट (Modern glow)' },
          ]}
        />
      </FormGrid>

      <SectionTitle>प्रवाह एवं डिज़ाइन गाइड</SectionTitle>
      <div className="space-y-2.5">
        <SwitchToggle
          label="प्रत्येक H1 (अध्याय) नए पेज से शुरू करें"
          checked={layout.newPageH1}
          onChange={val => set('layout.newPageH1', val)}
        />
        <SwitchToggle
          label="डिज़ाइन ग्रिड गाइड दिखाएँ (मार्जिन, बेसलाइन व कॉलम)"
          checked={layout.guides}
          onChange={val => set('layout.guides', val)}
        />
      </div>
    </div>
  );
};
