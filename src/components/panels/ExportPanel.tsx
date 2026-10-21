/**
 * Export, Packaging & Document Audit Panel
 */

import React, { useRef, useState } from 'react';
import {
  Printer,
  FileCode,
  Download,
  Upload,
  Copy,
  RotateCcw,
  FileText,
  Eraser,
  FileStack,
} from 'lucide-react';
import { EbookSettings } from '../../types/ebook';
import { SectionTitle, StatusCard } from '../FormControls';
import {
  exportCssTokens,
  exportMarkdownBook,
  exportProjectJson,
} from '../../utils/exportUtils';
import { getContrastRatio } from '../../utils/colorUtils';
import { DEFAULT_BOOK_SETTINGS } from '../../constants/sampleData';

interface ExportPanelProps {
  s: EbookSettings;
  stats: {
    pages: number;
    words: number;
    headings: number;
    tables: number;
    overflow: number;
  };
  onPrint: () => void;
  onExportHtml: () => void;
  patch: (fn: (prev: EbookSettings) => EbookSettings) => void;
  toast: (msg: string, kind?: 'ok' | 'warn') => void;
  onEraseTemplateContent?: () => void;
  onOpenBatchModal?: (mode: 'import' | 'new-ebook') => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  s,
  stats,
  onPrint,
  onExportHtml,
  patch,
  toast,
  onEraseTemplateContent,
  onOpenBatchModal,
}) => {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleCopyCss = async () => {
    const css = exportCssTokens(s);
    try {
      await navigator.clipboard.writeText(css);
      toast('CSS व Tailwind डिज़ाइन टोकन कॉपी हुए!');
    } catch {
      toast('क्लिपबोर्ड उपलब्ध नहीं है', 'warn');
    }
  };

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedSettings = parsed.settings || parsed;
      if (importedSettings && importedSettings.theme) {
        patch(() => ({
          ...DEFAULT_BOOK_SETTINGS,
          ...importedSettings,
          chapters:
            Array.isArray(importedSettings.chapters) && importedSettings.chapters.length > 0
              ? importedSettings.chapters
              : DEFAULT_BOOK_SETTINGS.chapters,
        }));
        toast('प्रोजेक्ट सफलतापूर्वक आयात हुआ!');
      }
    } catch {
      toast('अमान्य प्रोजेक्ट फ़ाइल', 'warn');
    }
  };

  // Contrast Audit
  const textRatio = getContrastRatio(s.theme.text, s.theme.paper);
  const headingRatio = getContrastRatio(s.theme.primary, s.theme.paper);
  const secRatio = getContrastRatio(s.theme.secondary, s.theme.paper);

  return (
    <div className="space-y-4">
      {/* Document Health & Insights */}
      <SectionTitle>दस्तावेज़ स्वास्थ्य व आँकड़े (Document Insights)</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-raised p-2.5">
          <div className="text-xl font-black text-brand tabular-nums">{stats.pages}</div>
          <div className="text-[0.68rem] text-mute">कुल A4 पेज (कवर सहित)</div>
        </div>

        <div className="rounded-xl border border-line bg-raised p-2.5">
          <div className="text-xl font-black text-brand tabular-nums">{stats.words}</div>
          <div className="text-[0.68rem] text-mute">कुल शब्द (Words)</div>
        </div>

        <div className="rounded-xl border border-line bg-raised p-2.5">
          <div className="text-xl font-black text-brand tabular-nums">{stats.headings}</div>
          <div className="text-[0.68rem] text-mute">कुल शीर्षक (Headings)</div>
        </div>

        <div className="rounded-xl border border-line bg-raised p-2.5">
          <div className="text-xl font-black text-brand tabular-nums">{stats.tables}</div>
          <div className="text-[0.68rem] text-mute">सारणियाँ (Tables)</div>
        </div>

        <div className="rounded-xl border border-line bg-raised p-2.5">
          <div className="text-xl font-black text-brand tabular-nums">{s.chapters.length}</div>
          <div className="text-[0.68rem] text-mute">अध्याय (Chapters)</div>
        </div>

        <div className={`rounded-xl border p-2.5 ${stats.overflow > 0 ? 'border-warn bg-amber-500/10' : 'border-line bg-raised'}`}>
          <div className={`text-xl font-black tabular-nums ${stats.overflow > 0 ? 'text-warn' : 'text-emerald-500'}`}>
            {stats.overflow}
          </div>
          <div className="text-[0.68rem] text-mute">
            {stats.overflow > 0 ? 'ओवरफ्लो कॉलम ⚠️' : 'परफेक्ट लेआउट ✓'}
          </div>
        </div>
      </div>

      {/* WCAG Contrast Audit */}
      <SectionTitle>एक्सेसिबिलिटी ऑडिट (WCAG AA)</SectionTitle>
      <div className="space-y-1.5">
        <StatusCard ok={textRatio >= 4.5}>
          <b>बॉडी टेक्स्ट कंट्रास्ट:</b> {textRatio.toFixed(1)}:1 (न्यूनतम 4.5:1) — {textRatio >= 4.5 ? 'उत्तीर्ण ✓' : 'कम कंट्रास्ट ⚠️'}
        </StatusCard>
        <StatusCard ok={headingRatio >= 3.0}>
          <b>मुख्य शीर्षक कंट्रास्ट:</b> {headingRatio.toFixed(1)}:1 (न्यूनतम 3.0:1) — {headingRatio >= 3.0 ? 'उत्तीर्ण ✓' : 'कम कंट्रास्ट ⚠️'}
        </StatusCard>
        <StatusCard ok={secRatio >= 3.0}>
          <b>द्वितीयक पाठ्य कंट्रास्ट:</b> {secRatio.toFixed(1)}:1 — {secRatio >= 3.0 ? 'उत्तीर्ण ✓' : 'सुधार की आवश्यकता'}
        </StatusCard>
      </div>

      {/* Export Options */}
      <SectionTitle>एक्सपोर्ट एवं मुद्रण (Export & Print)</SectionTitle>
      <div className="space-y-2.5">
        {/* Main PDF Print Button */}
        <button
          type="button"
          onClick={onPrint}
          className="btn btn-primary !min-h-11 w-full text-sm font-bold shadow-md"
        >
          <Printer size={18} /> A4 PDF / मुद्रण (Print to PDF)
        </button>

        {/* Standalone HTML */}
        <button
          type="button"
          onClick={onExportHtml}
          className="btn w-full text-xs font-semibold"
          title="बिना इंटरनेट के किसी भी ब्राउज़र में चलने वाली सिंगल HTML फ़ाइल"
        >
          <FileCode size={15} /> स्टैंडअलोन HTML ई-बुक डाउनलोड करें (Offline Ready)
        </button>

        {/* Markdown Download */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              exportMarkdownBook(s, false);
              toast('संपूर्ण पुस्तक Markdown में डाउनलोड हुई।');
            }}
            className="btn text-xs"
          >
            <FileText size={14} /> Full Book (.md)
          </button>
          <button
            type="button"
            onClick={() => {
              exportMarkdownBook(s, true);
              toast('सक्रिय अध्याय Markdown में डाउनलोड हुआ।');
            }}
            className="btn text-xs"
          >
            <FileText size={14} /> Active Chapter (.md)
          </button>
        </div>

        {/* CSS Tokens */}
        <button
          type="button"
          onClick={handleCopyCss}
          className="btn btn-gold w-full text-xs font-semibold"
        >
          <Copy size={14} /> CSS व Tailwind डिज़ाइन टोकन कॉपी करें
        </button>

        {/* Project JSON Backup */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => exportProjectJson(s)}
            className="btn text-xs"
          >
            <Download size={14} /> प्रोजेक्ट बैकअप JSON
          </button>
          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="btn text-xs"
          >
            <Upload size={14} /> बैकअप JSON लोड करें
          </button>
        </div>
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleImportJson(f);
            e.target.value = '';
          }}
        />

        <div className="rounded-xl border border-line bg-canvas/70 p-3 text-[0.7rem] leading-relaxed text-mute">
          <b>💡 PDF प्रिंट टिप्स:</b> प्रिंटर डायलॉग में <b>Destination: Save as PDF</b> चुनें।
          Margins: <b>None</b> तथा Options में <b>Background graphics</b> को अवश्य <b>ON</b> रखें ताकि सभी रंग व ग्रेडिएंट्स स्पष्ट आएँ।
        </div>
      </div>

      {/* New E-book / Erase Template / Factory Reset */}
      <SectionTitle>टेम्पलेट क्लीनर एवं रीसेट (New Book & Reset)</SectionTitle>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {onEraseTemplateContent && (
            <button
              type="button"
              onClick={onEraseTemplateContent}
              className="btn text-xs font-semibold text-warn hover:border-warn"
            >
              <Eraser size={13} /> टेम्पलेट मिटाएँ (Blank E-book)
            </button>
          )}
          {onOpenBatchModal && (
            <button
              type="button"
              onClick={() => onOpenBatchModal('import')}
              className="btn text-xs font-semibold text-brand"
            >
              <FileStack size={13} /> कई .md से नयी ई-बुक बनाएँ
            </button>
          )}
        </div>

        {confirmReset ? (
          <div className="flex items-center gap-2 rounded-xl border border-warn bg-amber-500/10 p-3">
            <span className="text-xs font-medium text-warn">सभी सेटिंग्स व सैंपल अध्याय डिफ़ॉल्ट करें?</span>
            <button
              type="button"
              onClick={() => {
                patch(() => DEFAULT_BOOK_SETTINGS);
                setConfirmReset(false);
                toast('डिफ़ॉल्ट सेटिंग्स बहाल (Ctrl+Z से Undo कर सकते हैं)');
              }}
              className="btn !min-h-7 !px-2.5 !border-warn !text-warn font-bold"
            >
              हाँ, रीसेट करें
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="btn !min-h-7 !px-2"
            >
              रद्द करें
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="btn text-xs text-mute hover:text-warn"
          >
            <RotateCcw size={13} /> मूल सैंपल डिफ़ॉल्ट पर रीसेट करें
          </button>
        )}
      </div>
    </div>
  );
};
