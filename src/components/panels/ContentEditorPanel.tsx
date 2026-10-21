/**
 * Content Editor Panel with Markdown Toolbar, Hindi Typography Cleaner,
 * Multi-File (.md) Batch E-book Importer, and Template Eraser Tools
 */

import React, { useRef, useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Search,
  Sparkles,
  Clock,
  Table,
  QrCode,
  HelpCircle as QuestionIcon,
  PenTool,
  GitFork,
  FileStack,
  Eraser,
  Trash2,
} from 'lucide-react';
import { EbookSettings } from '../../types/ebook';
import { SectionTitle, FormGrid, TextInput } from '../FormControls';
import { cleanHindiTypography, calculateReadingTime, SNIPPETS } from '../../utils/hindiFormatters';
import { countWords, extractFrontmatter } from '../../utils/markdownParser';
import { downloadBlob } from '../../utils/exportUtils';
import { INITIAL_CHAPTERS } from '../../constants/sampleData';

interface ContentEditorPanelProps {
  s: EbookSettings;
  set: (path: string, val: any, coalesce?: boolean) => void;
  patch: (fn: (prev: EbookSettings) => EbookSettings) => void;
  toast: (msg: string, kind?: 'ok' | 'warn') => void;
  onOpenDiagramStudio?: () => void;
  onOpenBatchModal?: (mode: 'import' | 'new-ebook') => void;
  onQuickUploadMultipleMd?: (files: FileList, mode: 'append' | 'replace') => void;
  onEraseTemplateContent?: () => void;
}

export const ContentEditorPanel: React.FC<ContentEditorPanelProps> = ({
  s,
  set,
  patch,
  toast,
  onOpenDiagramStudio,
  onOpenBatchModal,
  onQuickUploadMultipleMd,
  onEraseTemplateContent,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const singleOrMultiFileInputRef = useRef<HTMLInputElement>(null);
  const replaceBookFileInputRef = useRef<HTMLInputElement>(null);

  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);

  const activeChapter = s.chapters.find(c => c.id === s.activeChapterId) || s.chapters[0];
  const source = activeChapter ? activeChapter.source : '';

  const updateSource = (newSource: string) => {
    patch(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === prev.activeChapterId ? { ...c, source: newSource } : c
      ),
    }));
  };

  const handleClearCurrentChapter = () => {
    const cleanHeading = activeChapter?.title ? `# ${activeChapter.title}\n\n` : '# नया अध्याय\n\n';
    updateSource(cleanHeading);
    toast('वर्तमान अध्याय की सामग्री साफ़ कर दी गई।');
  };

  const insertSnippet = (snippet: string) => {
    const el = textareaRef.current;
    const start = el ? el.selectionStart : source.length;
    const end = el ? el.selectionEnd : source.length;

    const next = source.slice(0, start) + snippet + source.slice(end);
    updateSource(next);

    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(start + snippet.length, start + snippet.length);
      }
    });
  };

  const handleCleanHindi = () => {
    const cleaned = cleanHindiTypography(source);
    if (cleaned !== source) {
      updateSource(cleaned);
      toast('हिंदी टाइपोग्राफी स्वच्छ की गई (पूर्ण विराम । व स्पेसिंग ठीक किए गए)');
    } else {
      toast('टेक्स्ट पहले से ही पूर्णतः व्यवस्थित है।');
    }
  };

  const handleCleanAllChaptersHindi = () => {
    patch(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => ({
        ...c,
        source: cleanHindiTypography(c.source),
      })),
    }));
    toast(`सभी ${s.chapters.length} अध्यायों की टाइपोग्राफी व स्पेसिंग एकसमान की गई!`);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const parts = source.split(findText);
    const count = parts.length - 1;
    if (count > 0) {
      updateSource(parts.join(replaceText));
      toast(`${count} जगह शब्द बदला गया।`);
    } else {
      toast('खोजा गया शब्द नहीं मिला', 'warn');
    }
  };

  const handleSingleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const { meta } = extractFrontmatter(text);

      patch(prev => {
        const next = { ...prev };
        if (meta.title) next.title = meta.title;
        if (meta.subtitle) next.subtitle = meta.subtitle;
        if (meta.institute) next.institute = meta.institute;
        if (meta.address) next.address = meta.address;
        if (meta.subject) next.brand = { ...next.brand, subject: meta.subject };

        next.chapters = next.chapters.map(c =>
          c.id === prev.activeChapterId ? { ...c, source: text } : c
        );
        return next;
      });

      toast(`"${file.name}" फ़ाइल सक्रिय अध्याय में लोड हुई!`);
    } catch {
      toast('फ़ाइल पढ़ने में त्रुटि', 'warn');
    }
  };

  const words = countWords(source);
  const readTime = calculateReadingTime(words);

  return (
    <div className="space-y-4">
      {/* Multi-MD Batch E-book & Template Eraser Banner */}
      <div className="rounded-2xl border border-brand/30 bg-brand-soft/20 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-ink">
            📚 बड़ी ई-बुक निर्माण एवं टेम्पलेट क्लीनर (Quick Actions)
          </span>
          <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[0.65rem] font-bold text-brand">
            {s.chapters.length} अध्याय
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              onOpenBatchModal
                ? onOpenBatchModal('import')
                : replaceBookFileInputRef.current?.click()
            }
            className="btn btn-primary !min-h-8.5 text-xs font-bold"
            title="एक साथ कई .md फ़ाइलें अपलोड करके एकसमान स्टाइलिंग वाली बड़ी ई-बुक बनाएँ"
          >
            <FileStack size={14} /> Multiple .md से बड़ी ई-बुक बनाएँ
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenBatchModal
                ? onOpenBatchModal('new-ebook')
                : onEraseTemplateContent?.()
            }
            className="btn !min-h-8.5 border-amber-500/50 bg-amber-500/10 text-xs font-bold text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
            title="डिफ़ॉल्ट टेम्पलेट सामग्री मिटाएँ और बिल्कुल नयी ई-बुक शुरू करें"
          >
            <Eraser size={14} /> टेम्पलेट मिटाएँ / नयी ई-बुक
          </button>
        </div>
      </div>

      {/* Chapter Information Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-raised p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <FileText size={15} className="text-brand" />
            <span className="truncate">{activeChapter?.title}</span>
          </div>
          <div className="flex items-center gap-3 pt-1 text-[0.68rem] text-mute">
            <span>{words} शब्द</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {readTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCleanHindi}
            className="btn !min-h-7.5 !px-2 text-xs text-brand"
            title="पूर्ण विराम ।, दोहरे स्पेस व उद्धरण चिह्न स्वतः ठीक करें"
          >
            <Sparkles size={13} /> शुद्ध करें
          </button>

          <button
            type="button"
            onClick={handleClearCurrentChapter}
            className="btn !min-h-7.5 !px-2 text-xs text-warn hover:border-warn"
            title="वर्तमान अध्याय का टेक्स्ट साफ़ करें"
          >
            <Trash2 size={13} /> अध्याय साफ़ करें
          </button>
        </div>
      </div>

      {/* Quick Insert Toolbar */}
      <SectionTitle>क्विक इन्सर्ट टूलबार (Toolbar)</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.h1)}
          className="btn !min-h-7 !px-2 font-bold"
          title="H1 अध्याय शीर्षक"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.h2)}
          className="btn !min-h-7 !px-2 font-bold"
          title="H2 उप-शीर्षक"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.h3)}
          className="btn !min-h-7 !px-2 font-bold"
          title="H3 लघु बिंदु"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('\n- बिंदु एक\n- बिंदु दो\n')}
          className="btn !min-h-7 !px-2 text-xs"
          title="बुलेट सूची"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('\n1. पहला चरण\n2. दूसरा चरण\n')}
          className="btn !min-h-7 !px-2 text-xs"
          title="क्रमांकित सूची"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.table)}
          className="btn !min-h-7 !px-2 text-xs"
          title="तालिका (Table)"
        >
          <Table size={13} /> तालिका
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.fact)}
          className="btn !min-h-7 !px-2 text-xs"
          title="तथ्य बॉक्स"
        >
          तथ्य
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.note)}
          className="btn !min-h-7 !px-2 text-xs"
          title="नोट बॉक्स"
        >
          नोट
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.tip)}
          className="btn !min-h-7 !px-2 text-xs"
          title="याद रखें बॉक्स"
        >
          याद रखें
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.mcq)}
          className="btn !min-h-7 !px-2 text-xs font-bold text-brand"
          title="UPSC बहुविकल्पीय प्रश्न (MCQ Block)"
        >
          <QuestionIcon size={13} /> MCQ प्रश्न
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.qrcode)}
          className="btn !min-h-7 !px-2 text-xs text-indigo-600 dark:text-indigo-400"
          title="क्यूआर कोड (QR Code)"
        >
          <QrCode size={13} /> QR कोड
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.signature)}
          className="btn !min-h-7 !px-2 text-xs"
          title="संकाय हस्ताक्षर"
        >
          <PenTool size={13} /> हस्ताक्षर
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.mermaid)}
          className="btn !min-h-7 !px-2 text-xs font-semibold text-brand bg-brand-soft/40 hover:bg-brand-soft"
          title="फ्लोचार्ट जोड़ें (Mermaid Flowchart)"
        >
          <GitFork size={13} /> फ़्लोचार्ट
        </button>
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.svg)}
          className="btn !min-h-7 !px-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
          title="आधुनिक SVG वेक्टर आरेख जोड़ें"
        >
          <PenTool size={13} /> SVG आरेख
        </button>
        {onOpenDiagramStudio && (
          <button
            type="button"
            onClick={onOpenDiagramStudio}
            className="btn !min-h-7 !px-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-xs"
            title="डिज़ाइनर फ़्लोचार्ट व रेखाचित्र स्टूडियो खोलें"
          >
            <Sparkles size={13} /> रेखाचित्र स्टूडियो
          </button>
        )}
        <button
          type="button"
          onClick={() => insertSnippet(SNIPPETS.pagebreak)}
          className="btn !min-h-7 !px-2 text-xs font-semibold text-warn"
          title="पेज ब्रेक (===)"
        >
          === नया पेज
        </button>
      </div>

      {/* Find and Replace Toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowFindReplace(prev => !prev)}
          className="flex items-center gap-1.5 text-xs font-semibold text-mute hover:text-brand"
        >
          <Search size={14} /> खोजें और बदलें (Find & Replace)
        </button>

        {s.chapters.length > 1 && (
          <button
            type="button"
            onClick={handleCleanAllChaptersHindi}
            className="text-xs font-semibold text-brand hover:underline"
            title="सभी अध्यायों की टाइपोग्राफी एक साथ शुद्ध करें"
          >
            सभी {s.chapters.length} अध्याय एक साथ शुद्ध करें ✨
          </button>
        )}
      </div>

      {showFindReplace && (
        <div className="space-y-2 rounded-xl border border-line bg-raised p-2.5">
          <FormGrid cols={2}>
            <input
              type="text"
              placeholder="खोजें (Find)..."
              value={findText}
              onChange={e => setFindText(e.target.value)}
              className="input text-xs"
            />
            <input
              type="text"
              placeholder="इससे बदलें (Replace with)..."
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              className="input text-xs"
            />
          </FormGrid>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={!findText}
              className="btn btn-primary !min-h-7.5 !px-3 text-xs"
            >
              सभी बदलें (Replace All)
            </button>
          </div>
        </div>
      )}

      {/* Main Markdown Editor */}
      <div className="space-y-1.5">
        <textarea
          ref={textareaRef}
          spellCheck={false}
          value={source}
          onChange={e => updateSource(e.target.value)}
          className="input h-96 resize-y font-mono text-xs leading-relaxed"
          placeholder="यहाँ अपने नोट्स या पुस्तक की सामग्री लिखें..."
          aria-label="Chapter Content Editor"
        />
        <div className="flex items-center justify-between text-[0.68rem] text-mute">
          <span># H1 · ## H2 · ### H3 · - सूची · &gt; तथ्य · | सारणी | · [MCQ]</span>
          <span>{words} शब्द</span>
        </div>
      </div>

      {/* Book Metadata Fields */}
      <SectionTitle>पुस्तक व संस्थान विवरण (Metadata)</SectionTitle>
      <div className="space-y-3">
        <TextInput
          label="पुस्तक / नोट्स का शीर्षक"
          value={s.title}
          onChange={val => set('title', val, true)}
        />
        <TextInput
          label="उप-शीर्षक (Subtitle)"
          value={s.subtitle}
          onChange={val => set('subtitle', val, true)}
        />
        <FormGrid cols={2}>
          <TextInput
            label="संस्थान का नाम"
            value={s.institute}
            onChange={val => set('institute', val, true)}
          />
          <TextInput
            label="पता / संपर्क पंक्ति"
            value={s.address}
            onChange={val => set('address', val, true)}
          />
        </FormGrid>
        <FormGrid cols={2}>
          <TextInput
            label="संस्करण (Edition)"
            value={s.brand.edition}
            onChange={val => set('brand.edition', val, true)}
          />
          <TextInput
            label="लक्षित परीक्षा (Target Exam)"
            value={s.brand.examTag}
            onChange={val => set('brand.examTag', val, true)}
          />
        </FormGrid>
      </div>

      {/* File Actions */}
      <SectionTitle>फ़ाइल आयात, बल्क .MD एवं टेम्पलेट्स</SectionTitle>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => singleOrMultiFileInputRef.current?.click()}
          className="btn text-brand font-semibold"
          title="एक या एक से अधिक .md / .txt फ़ाइलें चुनें"
        >
          <Upload size={14} /> एक या अधिक .md फ़ाइलें जोड़ें (Append)
        </button>

        <button
          type="button"
          onClick={() => replaceBookFileInputRef.current?.click()}
          className="btn font-semibold"
          title="पुराने टेम्पलेट हटाकर कई .md फ़ाइलों से सीधे नयी बड़ी ई-बुक बनाएँ"
        >
          <FileStack size={14} /> कई .md से नयी ई-बुक (Replace All)
        </button>

        {onEraseTemplateContent && (
          <button
            type="button"
            onClick={onEraseTemplateContent}
            className="btn text-warn hover:border-warn"
            title="टेम्पलेट के सभी सैंपल अध्याय मिटाकर खाली ई-बुक बनाएँ"
          >
            <Eraser size={14} /> टेम्पलेट मिटाएँ (Blank E-book)
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            updateSource(INITIAL_CHAPTERS[0].source);
            toast('राजव्यवस्था अध्याय 1 लोड किया गया।');
          }}
          className="btn"
        >
          राजव्यवस्था सैंपल
        </button>

        <button
          type="button"
          onClick={() => {
            updateSource(INITIAL_CHAPTERS[2].source);
            toast('MCQ अभ्यास प्रश्न अध्याय लोड किया गया।');
          }}
          className="btn"
        >
          MCQ सैंपल
        </button>

        <button
          type="button"
          onClick={() => {
            downloadBlob(`${activeChapter?.title || 'Notes'}.md`, source);
            toast('वर्तमान अध्याय डाउनलोड हुआ।');
          }}
          className="btn"
        >
          <Download size={14} /> यह अध्याय डाउनलोड करें
        </button>

        {/* Input 1: Single or Multi-file Append */}
        <input
          ref={singleOrMultiFileInputRef}
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          multiple
          hidden
          onChange={e => {
            const files = e.target.files;
            if (files && files.length > 0) {
              if (files.length === 1 && countWords(source) === 0) {
                handleSingleFileUpload(files[0]);
              } else if (onQuickUploadMultipleMd) {
                onQuickUploadMultipleMd(files, 'append');
              } else {
                handleSingleFileUpload(files[0]);
              }
            }
            e.target.value = '';
          }}
        />

        {/* Input 2: Multi-file Replace All Chapters */}
        <input
          ref={replaceBookFileInputRef}
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          multiple
          hidden
          onChange={e => {
            const files = e.target.files;
            if (files && files.length > 0 && onQuickUploadMultipleMd) {
              onQuickUploadMultipleMd(files, 'replace');
            }
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
};
