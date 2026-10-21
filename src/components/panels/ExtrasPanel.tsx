/**
 * Extras Panel - Watermark, TOC, Background Pattern, and Signatures
 */

import React from 'react';
import { EbookSettings } from '../../types/ebook';
import { SectionTitle, FormGrid, TextInput, RangeInput, SelectInput, SwitchToggle } from '../FormControls';

interface ExtrasPanelProps {
  s: EbookSettings;
  set: (path: string, val: any, coalesce?: boolean) => void;
}

export const ExtrasPanel: React.FC<ExtrasPanelProps> = ({ s, set }) => {
  const wm = s.watermark;

  return (
    <div className="space-y-4">
      {/* Table of Contents */}
      <SectionTitle>स्वचालित विषय-सूची (Table of Contents)</SectionTitle>
      <div className="space-y-3">
        <SwitchToggle
          label="कवर के बाद विषय-सूची (TOC) पेज जोड़ें"
          checked={s.toc.on}
          onChange={val => set('toc.on', val)}
          hint="सभी H1 एवं H2 शीर्षकों के आधार पर लाइव पेज नंबरों के साथ सूची बनाता है"
        />

        {s.toc.on && (
          <FormGrid cols={2}>
            <TextInput
              label="TOC शीर्षक"
              value={s.toc.title}
              onChange={val => set('toc.title', val, true)}
            />
            <SelectInput
              label="सूची की गहराई (Depth)"
              value={s.toc.depth}
              onChange={val => set('toc.depth', Number(val))}
              options={[
                { v: 1, l: 'केवल H1 (अध्याय स्तर)' },
                { v: 2, l: 'H1 + H2 (अध्याय व उप-शीर्षक)' },
              ]}
            />
          </FormGrid>
        )}
      </div>

      {/* Watermark */}
      <SectionTitle>सुरक्षा वॉटरमार्क (Watermark)</SectionTitle>
      <div className="space-y-3">
        <SwitchToggle
          label="सभी पेजों पर सुरक्षा वॉटरमार्क दिखाएँ"
          checked={wm.on}
          onChange={val => set('watermark.on', val)}
        />

        {wm.on && (
          <div className="space-y-3 rounded-2xl border border-line bg-raised p-3">
            <TextInput
              label="वॉटरमार्क टेक्स्ट"
              value={wm.text}
              onChange={val => set('watermark.text', val, true)}
            />

            <FormGrid cols={2}>
              <SelectInput
                label="वॉटरमार्क रंग"
                value={wm.color}
                onChange={val => set('watermark.color', val)}
                options={[
                  { v: 'primary', l: 'मुख्य रंग (Primary)' },
                  { v: 'accent', l: 'एक्सेंट रंग (Accent Gold)' },
                  { v: 'secondary', l: 'द्वितीयक रंग (Secondary)' },
                ]}
              />
              <RangeInput
                label="पारदर्शिता (Opacity)"
                value={wm.opacity}
                min={2}
                max={30}
                step={1}
                unit="%"
                onChange={val => set('watermark.opacity', val, true)}
              />
            </FormGrid>

            <FormGrid cols={2}>
              <RangeInput
                label="झुकाव कोण (Angle)"
                value={wm.angle}
                min={-90}
                max={90}
                step={5}
                unit="°"
                onChange={val => set('watermark.angle', val, true)}
              />
              <RangeInput
                label="अक्षर आकार (Size)"
                value={wm.size}
                min={12}
                max={60}
                step={2}
                unit=" mm"
                onChange={val => set('watermark.size', val, true)}
              />
            </FormGrid>
          </div>
        )}
      </div>

      {/* Background Pattern */}
      <SectionTitle>पेज पृष्ठभूमि पैटर्न (Background Pattern)</SectionTitle>
      <div className="space-y-3">
        <SelectInput
          label="पैटर्न प्रकार"
          value={s.layout.pattern}
          onChange={val => set('layout.pattern', val)}
          options={[
            { v: 'none', l: 'कोई पैटर्न नहीं (Plain)' },
            { v: 'dots', l: 'डॉट ग्रिड (Dot Matrix)' },
            { v: 'grid', l: 'ग्राफ ग्रिड (Graph Paper)' },
            { v: 'lines', l: 'रूलर लाइनें (Ruled Lines)' },
            { v: 'diag', l: 'डायगोनल हैच (Diagonal Hatch)' },
          ]}
        />

        {s.layout.pattern !== 'none' && (
          <RangeInput
            label="पैटर्न तीव्रता (Pattern Opacity)"
            value={s.layout.patternOpacity}
            min={2}
            max={25}
            step={1}
            unit="%"
            onChange={val => set('layout.patternOpacity', val, true)}
          />
        )}
      </div>

      {/* Author and Institution Signature */}
      <SectionTitle>प्रमाणन एवं हस्ताक्षर ब्लॉक (Faculty Stamp)</SectionTitle>
      <div className="space-y-3">
        <SwitchToggle
          label="संकाय सत्यापन मुहर (Faculty Signature Stamp) दिखाएँ"
          checked={s.brand.signatureStamp?.enabled ?? false}
          onChange={val =>
            set('brand.signatureStamp', {
              enabled: val,
              name: s.brand.signatureStamp?.name || 'संपादक मंडल',
              designation: s.brand.signatureStamp?.designation || 'सिविल सेवा प्रकोष्ठ',
            })
          }
        />

        {s.brand.signatureStamp?.enabled && (
          <FormGrid cols={2}>
            <TextInput
              label="प्राध्यापक / अधिकारी का नाम"
              value={s.brand.signatureStamp.name}
              onChange={val =>
                set('brand.signatureStamp', {
                  ...s.brand.signatureStamp,
                  name: val,
                })
              }
            />
            <TextInput
              label="पदनाम (Designation)"
              value={s.brand.signatureStamp.designation}
              onChange={val =>
                set('brand.signatureStamp', {
                  ...s.brand.signatureStamp,
                  designation: val,
                })
              }
            />
          </FormGrid>
        )}
      </div>
    </div>
  );
};
