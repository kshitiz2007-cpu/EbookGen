/**
 * Header, Footer, and Page Edge Trim Styling Panel
 */

import React, { useRef } from 'react';
import { Copy, Download, Upload, Check, X } from 'lucide-react';
import { Block, EbookSettings, PageLayout } from '../../types/ebook';
import { SectionTitle, FormGrid, SelectInput, ColorInput, RangeInput, SwitchToggle, StatusCard } from '../FormControls';
import { HF_PRESETS } from '../../constants/presets';
import { MiniPreview } from '../MiniPreview';
import { getWorstContrast, getContrastRatio, makeGradient, parseHex, LIGHT_PAPER } from '../../utils/colorUtils';
import { downloadBlob } from '../../utils/exportUtils';

interface HeaderFooterPanelProps {
  s: EbookSettings;
  set: (path: string, val: any, coalesce?: boolean) => void;
  patch: (fn: (prev: EbookSettings) => EbookSettings) => void;
  toast: (msg: string, kind?: 'ok' | 'warn') => void;
  blocks: Block[];
  layout: PageLayout[] | null;
}

export const HeaderFooterPanel: React.FC<HeaderFooterPanelProps> = ({
  s,
  set,
  patch,
  toast,
  blocks,
  layout,
}) => {
  const hf = s.hf;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyPreset = (presetKey: string) => {
    const p = HF_PRESETS.find(item => item.k === presetKey);
    if (!p) return;
    const { k, e, n, ...conf } = p;
    patch(prev => ({
      ...prev,
      hf: {
        ...prev.hf,
        live: true,
        ...conf,
        f: [...p.h],
      },
    }));
    toast(`${p.n} हेडर/फ़ूटर प्रीसेट लागू किया गया।`);
  };

  const handleCopyGradientCss = async () => {
    const fAng = hf.mirror ? (hf.ang + 180) % 360 : hf.ang;
    const fCols = hf.link ? hf.h : hf.f;
    const css = `/* Header Gradient */
background: ${makeGradient(hf.ang, hf.h)};
/* Footer Gradient */
background: ${makeGradient(fAng, fCols)};
/* Hex Stops: Header (${hf.h.join(' → ')}), Footer (${fCols.join(' → ')}) */`;

    try {
      await navigator.clipboard.writeText(css);
      toast('CSS कोड क्लिपबोर्ड में कॉपी हो गया!');
    } catch {
      toast('क्लिपबोर्ड उपलब्ध नहीं है', 'warn');
    }
  };

  const handleExportPreset = () => {
    const data = JSON.stringify({ name: 'Gyankunj_Preset', hf }, null, 2);
    downloadBlob('Gyankunj_HeaderFooter_Preset.json', data, 'application/json');
    toast('प्रीसेट JSON डाउनलोड हुआ।');
  };

  const handleImportPreset = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const conf = parsed.hf || parsed.settings || parsed;
      if (conf.h && conf.f) {
        patch(prev => ({
          ...prev,
          hf: {
            ...prev.hf,
            ...conf,
            h: conf.h.map((c: string) => parseHex(c) || prev.hf.h[0]),
            f: conf.f.map((c: string) => parseHex(c) || prev.hf.f[0]),
          },
        }));
        toast('हेडर/फ़ूटर प्रीसेट सफलतापूर्वक लोड हुआ।');
      }
    } catch {
      toast('अमान्य JSON फ़ाइल', 'warn');
    }
  };

  const fCols = hf.link ? hf.h : hf.f;
  const hContrast = getWorstContrast('#ffffff', hf.h);
  const fContrast = getWorstContrast('#ffffff', fCols);

  return (
    <div className="space-y-4">
      {/* Ready Presets */}
      <SectionTitle>रेडी-टू-यूज़ हेडर प्रीसेट्स (Presets)</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {HF_PRESETS.map(p => (
          <button
            key={p.k}
            type="button"
            onClick={() => handleApplyPreset(p.k)}
            className="chip-btn"
          >
            <span
              className="mb-1.5 block h-4 rounded-md ring-1 ring-black/10"
              style={{ background: `linear-gradient(90deg, ${p.h.join(', ')})` }}
            />
            <div className="text-xs font-bold text-ink">
              {p.e} {p.n}
            </div>
          </button>
        ))}
      </div>

      {/* Header & Footer Styles */}
      <SectionTitle>डिज़ाइन शैली (Styles)</SectionTitle>
      <FormGrid cols={2}>
        <SelectInput
          label="हेडर डिज़ाइन (Header Design)"
          value={hf.hs}
          onChange={val => set('hf.hs', val)}
          options={[
            { v: 'keep', l: 'वर्तमान (साधारण अंडरलाइन)' },
            { v: 'band', l: 'पूर्ण चौड़ाई ग्रेडिएंट पट्टी (Band)' },
            { v: 'aurora', l: 'औरोरा ग्लो बैनर (Aurora Glow)' },
            { v: 'glass', l: 'फ़्रॉस्टेड ग्लास + रंगीन किनारा' },
            { v: 'under', l: 'हल्का हेडर + ग्रेडिएंट अंडरलाइन' },
            { v: 'diag', l: 'डायगोनल स्प्लिट पैनल (Split)' },
            { v: 'angle', l: 'कोणीय किनारा पट्टी (Angled)' },
            { v: 'outline', l: 'कैप्सूल आउटलाइन (Outline)' },
          ]}
        />

        <SelectInput
          label="फ़ूटर डिज़ाइन (Footer Design)"
          value={hf.fs}
          onChange={val => set('hf.fs', val)}
          options={[
            { v: 'keep', l: 'वर्तमान (साधारण)' },
            { v: 'band', l: 'पूर्ण चौड़ाई पट्टी (Band)' },
            { v: 'aurora', l: 'औरोरा ग्लो पट्टी (Aurora)' },
            { v: 'glass', l: 'फ़्रॉस्टेड ग्लास + रेखा' },
            { v: 'line', l: 'ग्रेडिएंट रेखा + डायमंड चिह्न' },
            { v: 'angle', l: 'कोणीय किनारा पट्टी (Angled)' },
            { v: 'outline', l: 'कैप्सूल आउटलाइन (Outline)' },
          ]}
        />

        <SelectInput
          label="पेज किनारा सजावट (Edge Trim)"
          value={hf.edge}
          onChange={val => set('hf.edge', val)}
          options={[
            { v: 'none', l: 'कोई नहीं (None)' },
            { v: 'top', l: 'शीर्ष ग्रेडिएंट पट्टी (Top)' },
            { v: 'bottom', l: 'निचली ग्रेडिएंट पट्टी (Bottom)' },
            { v: 'both', l: 'शीर्ष व नीचे दोनों (Both)' },
            { v: 'corners', l: 'कोनों में रंगीन कट (Corners)' },
            { v: 'frame', l: 'चारों ओर ग्रेडिएंट बॉर्डर (Frame)' },
          ]}
        />

        <SelectInput
          label="पेज नंबर बैज (Number Badge)"
          value={hf.pn}
          onChange={val => set('hf.pn', val)}
          options={[
            { v: 'keep', l: 'वर्तमान सादा (Plain)' },
            { v: 'pill', l: 'ग्रेडिएंट पिल (Pill)' },
            { v: 'badge', l: 'चौकोर बैज (Badge)' },
            { v: 'outline', l: 'आउटलाइन पिल (Outline)' },
          ]}
        />

        <SelectInput
          label="लोगो रिंग प्रभाव (Logo Ring)"
          value={hf.logo}
          onChange={val => set('hf.logo', val)}
          options={[
            { v: 'ring', l: 'सफेद कंट्रास्ट रिंग (Best contrast)' },
            { v: 'glass', l: 'सॉफ्ट ग्लास रिंग' },
            { v: 'none', l: 'कोई रिंग नहीं' },
          ]}
        />

        <SelectInput
          label="ग्रेडिएंट पर टेक्स्ट रंग"
          value={hf.tm}
          onChange={val => set('hf.tm', val)}
          options={[
            { v: 'auto', l: 'स्वचालित कंट्रास्ट (Auto AA)' },
            { v: 'light', l: 'सदैव सफेद (White)' },
            { v: 'dark', l: 'सदैव गहरा (Dark)' },
          ]}
        />
      </FormGrid>

      {/* Header Gradient HEX */}
      <SectionTitle>हेडर ग्रेडिएंट स्टॉप्स (Header HEX)</SectionTitle>
      <FormGrid cols={3}>
        <ColorInput
          label="स्टॉप 1 (Start)"
          value={hf.h[0]}
          onChange={(val, c) => set('hf.h.0', val, c)}
        />
        <ColorInput
          label="स्टॉप 2 (Middle)"
          value={hf.h[1]}
          onChange={(val, c) => set('hf.h.1', val, c)}
        />
        <ColorInput
          label="स्टॉप 3 (End)"
          value={hf.h[2]}
          onChange={(val, c) => set('hf.h.2', val, c)}
        />
      </FormGrid>

      {/* Footer Gradient HEX */}
      <SectionTitle>फ़ूटर ग्रेडिएंट स्टॉप्स (Footer HEX)</SectionTitle>
      <FormGrid cols={3}>
        <ColorInput
          label="स्टॉप 1"
          value={fCols[0]}
          disabled={hf.link}
          onChange={(val, c) => set('hf.f.0', val, c)}
        />
        <ColorInput
          label="स्टॉप 2"
          value={fCols[1]}
          disabled={hf.link}
          onChange={(val, c) => set('hf.f.1', val, c)}
        />
        <ColorInput
          label="स्टॉप 3"
          value={fCols[2]}
          disabled={hf.link}
          onChange={(val, c) => set('hf.f.2', val, c)}
        />
      </FormGrid>

      <div className="space-y-3">
        <FormGrid cols={2}>
          <ColorInput
            label="हल्के हेडर पर टेक्स्ट रंग"
            value={hf.ink}
            onChange={(val, c) => set('hf.ink', val, c)}
          />
          <RangeInput
            label="ग्रेडिएंट कोण (Angle)"
            value={hf.ang}
            min={0}
            max={360}
            step={15}
            unit="°"
            onChange={val => set('hf.ang', val, true)}
          />
        </FormGrid>

        <RangeInput
          label="छाया व ग्लो तीव्रता (Glow)"
          value={hf.glow}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={val => set('hf.glow', val, true)}
        />

        <div className="flex flex-wrap gap-4 pt-1">
          <SwitchToggle
            label="फ़ूटर में हेडर के रंगों का उपयोग करें"
            checked={hf.link}
            onChange={val => set('hf.link', val)}
          />
          <SwitchToggle
            label="फ़ूटर की दिशा उल्टी (Mirror) करें"
            checked={hf.mirror}
            onChange={val => set('hf.mirror', val)}
          />
          <SwitchToggle
            label="पेजों पर तुरंत लाइव लागू करें"
            checked={hf.live}
            onChange={val => set('hf.live', val)}
          />
        </div>
      </div>

      {/* Contrast Report */}
      <SectionTitle>कंट्रास्ट ऑडिट (WCAG AA)</SectionTitle>
      <div className="space-y-2">
        <StatusCard ok={hContrast >= 3.0}>
          <b>Header Contrast:</b> {hContrast.toFixed(1)}:1 — {hContrast >= 4.5 ? '✓ AA Passed' : hContrast >= 3.0 ? '✓ Large Text Passed' : '⚠️ कम कंट्रास्ट'}
        </StatusCard>
        <StatusCard ok={fContrast >= 3.0}>
          <b>Footer Contrast:</b> {fContrast.toFixed(1)}:1 — {fContrast >= 4.5 ? '✓ AA Passed' : fContrast >= 3.0 ? '✓ Large Text Passed' : '⚠️ कम कंट्रास्ट'}
        </StatusCard>
      </div>

      {/* Mini Live Preview */}
      <SectionTitle>लाइव हेडर/फ़ूटर पूर्वावलोकन</SectionTitle>
      <MiniPreview s={s} blocks={blocks} layout={layout} />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={() => {
            patch(prev => ({ ...prev, hfApplied: { ...prev.hf } }));
            toast('हेडर/फ़ूटर स्टाइल सभी पेजों पर लागू हो गई।');
          }}
          className="btn btn-primary"
        >
          <Check size={14} /> सभी पेजों पर लागू करें
        </button>

        <button
          type="button"
          onClick={() => {
            patch(prev => ({
              ...prev,
              hfApplied: null,
              hf: { ...prev.hf, live: false, hs: 'keep', fs: 'keep', edge: 'none', pn: 'keep' },
            }));
            toast('हेडर/फ़ूटर स्टाइल हटा दी गई।');
          }}
          className="btn"
        >
          <X size={14} /> स्टाइलिंग हटाएँ
        </button>

        <button
          type="button"
          onClick={handleCopyGradientCss}
          className="btn btn-gold"
        >
          <Copy size={14} /> CSS कोड कॉपी करें
        </button>

        <button
          type="button"
          onClick={handleExportPreset}
          className="btn"
        >
          <Download size={14} /> Export JSON
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn"
        >
          <Upload size={14} /> Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleImportPreset(f);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
};
