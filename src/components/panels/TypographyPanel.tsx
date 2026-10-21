/**
 * Typography Panel
 */

import React from 'react';
import { EbookSettings } from '../../types/ebook';
import { SectionTitle, SelectInput, RadioGroup, RangeInput, SwitchToggle } from '../FormControls';

interface TypographyPanelProps {
  s: EbookSettings;
  set: (path: string, val: any, coalesce?: boolean) => void;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = ({ s, set }) => {
  const type = s.type;

  return (
    <div className="space-y-4">
      <SectionTitle>फ़ॉन्ट परिवार (Devanagari Fonts)</SectionTitle>
      <div className="space-y-3">
        <SelectInput
          label="मुख्य देवनागरी फ़ॉन्ट"
          value={type.font}
          onChange={val => set('type.font', val)}
          options={[
            { v: 'noto', l: 'Noto Sans Devanagari — स्पष्ट व आधुनिक (Clean Sans)' },
            { v: 'serif', l: 'Noto Serif Devanagari — शास्त्रीय पुस्तक शैली (Serif)' },
            { v: 'mukta', l: 'Mukta — सघन परीक्षा नोट्स (Compact Sans)' },
            { v: 'system', l: 'System Sans — तेज़ व न्यूनतम' },
          ]}
        />

        <SelectInput
          label="शीर्षक फ़ॉन्ट संयोजन (Heading Pairing)"
          value={type.headFont}
          onChange={val => set('type.headFont', val)}
          options={[
            { v: 'same', l: 'बॉडी फ़ॉन्ट जैसा ही (Consistent)' },
            { v: 'serif', l: 'Noto Serif Devanagari (क्लासिक)' },
            { v: 'display', l: 'Display Serif (भारी व प्रभावी हेडिंग)' },
            { v: 'system', l: 'System Sans' },
          ]}
        />

        <RadioGroup
          label="पाठ्य अलाइनमेंट (Alignment)"
          value={type.align}
          onChange={val => set('type.align', val)}
          options={[
            { v: 'justify', l: 'Justified (दोनों ओर समतल)' },
            { v: 'left', l: 'Left (बाईं ओर)' },
          ]}
        />
      </div>

      <SectionTitle>मुद्रण आकार व अंतराल (Scale & Line Spacing)</SectionTitle>
      <div className="space-y-3">
        <RangeInput
          label="बॉडी टेक्स्ट आकार"
          value={type.size}
          min={7.5}
          max={12}
          step={0.1}
          digits={1}
          unit=" pt"
          onChange={val => set('type.size', val, true)}
        />

        <RangeInput
          label="लाइन अंतराल (Line Height)"
          value={type.line}
          min={1.2}
          max={1.8}
          step={0.05}
          digits={2}
          unit="×"
          onChange={val => set('type.line', val, true)}
        />

        <RangeInput
          label="शीर्षक अनुपात (Heading Scale)"
          value={type.headScale}
          min={80}
          max={130}
          step={5}
          digits={0}
          unit="%"
          onChange={val => set('type.headScale', val, true)}
        />

        <RangeInput
          label="तालिका पाठ्य आकार (Table Text)"
          value={type.tableSize}
          min={7.0}
          max={11.0}
          step={0.5}
          digits={1}
          unit=" pt"
          onChange={val => set('type.tableSize', val, true)}
        />
      </div>

      <SectionTitle>साहित्यिक शैलियाँ (Editorial Styles)</SectionTitle>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <SwitchToggle
          label="ड्रॉप कैप (Drop Cap)"
          checked={type.dropcap}
          onChange={val => set('type.dropcap', val)}
          hint="अध्याय के पहले पैराग्राफ का पहला अक्षर बड़ा और कलात्मक"
        />
        <SwitchToggle
          label="पैराग्राफ इंडेंट"
          checked={type.indent}
          onChange={val => set('type.indent', val)}
          hint="पैराग्राफ की शुरुआत में 1.5em का फासला"
        />
        <SwitchToggle
          label="हाइफ़नेशन"
          checked={type.hyphens}
          onChange={val => set('type.hyphens', val)}
          hint="कॉलम के अंत में शब्दों का स्वचालित विभाजन"
        />
      </div>
    </div>
  );
};
