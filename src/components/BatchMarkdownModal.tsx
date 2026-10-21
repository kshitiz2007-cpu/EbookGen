/**
 * Multi-File Markdown (.md) Large E-book Builder & New Blank E-book Studio Modal
 * Supports:
 * 1. Uploading / dragging-and-dropping multiple .md/.txt files in one go, sorting/reordering them,
 *    normalizing headings/callouts/spacing for consistent styling & continuous/paginated flow.
 * 2. Erasing all sample/template content to start a brand-new blank or structured ebook altogether.
 */

import React, { useRef, useState } from 'react';
import {
  FileStack,
  FilePlus2,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Sparkles,
  Eraser,
  Check,
  X,
  BookPlus,
  Plus,
} from 'lucide-react';
import { EbookSettings } from '../types/ebook';
import {
  BatchMarkdownImportOptions,
  EraseTemplateOptions,
  MarkdownFileInput,
  deriveTitleFromFilename,
  sortMarkdownFilesNaturally,
} from '../utils/ebookBuilder';
import { countWords, extractFrontmatter } from '../utils/markdownParser';
import { SUBJECT_THEMES } from '../constants/presets';

interface BatchMarkdownModalProps {
  open: boolean;
  initialMode?: 'import' | 'new-ebook';
  onClose: () => void;
  s: EbookSettings;
  onBatchImport: (files: MarkdownFileInput[], options: BatchMarkdownImportOptions) => void;
  onEraseAndCreateNew: (options: EraseTemplateOptions) => void;
}

interface QueuedMdFile extends MarkdownFileInput {
  id: string;
  words: number;
  h1Count: number;
  detectedTitle: string;
}

export const BatchMarkdownModal: React.FC<BatchMarkdownModalProps> = ({
  open,
  initialMode = 'import',
  onClose,
  s,
  onBatchImport,
  onEraseAndCreateNew,
}) => {
  const [activeMode, setActiveMode] = useState<'import' | 'new-ebook'>(initialMode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    if (open) {
      setActiveMode(initialMode);
    }
  }, [open, initialMode]);

  // --- Tab 1: Multi-File .MD Import State ---
  const [queuedFiles, setQueuedFiles] = useState<QueuedMdFile[]>([]);
  const [importMode, setImportMode] = useState<'replace' | 'append' | 'merge-single'>('replace');
  const [flowMode, setFlowMode] = useState<'continuous' | 'page-per-chapter'>(
    s.layout.newPageH1 ? 'page-per-chapter' : 'continuous'
  );
  const [ensureTopH1, setEnsureTopH1] = useState(true);
  const [cleanTypography, setCleanTypography] = useState(true);
  const [splitByH1, setSplitByH1] = useState(false);
  const [autoNumberChapters, setAutoNumberChapters] = useState(false);
  const [enableToc, setEnableToc] = useState(true);
  const [customBookTitle, setCustomBookTitle] = useState('');
  const [customBookSubtitle, setCustomBookSubtitle] = useState('');

  // --- Tab 2: Erase Template & Create New E-book State ---
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newInstitute, setNewInstitute] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newExamTag, setNewExamTag] = useState('');
  const [newSubject, setNewSubject] = useState(s.brand.subject || 'polity');
  const [keepStyling, setKeepStyling] = useState(true);
  const [clearBrandMetadata, setClearBrandMetadata] = useState(false);
  const [starterChapters, setStarterChapters] = useState<string[]>(['अध्याय 1 : प्रस्तावना']);
  const [newChInput, setNewChInput] = useState('');

  if (!open) return null;

  const inspectFile = (name: string, content: string, idx: number): QueuedMdFile => {
    const { meta, body } = extractFrontmatter(content);
    const h1Matches = body.match(/^#\s+.+$/gm) || [];
    const firstH1 = h1Matches[0]?.replace(/^#\s+/, '').trim();
    const detectedTitle = meta.title || meta.chapter || firstH1 || deriveTitleFromFilename(name);
    return {
      id: `qf-${Date.now().toString(36)}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      content,
      words: countWords(content),
      h1Count: h1Matches.length,
      detectedTitle,
    };
  };

  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList).filter(
      f => /\.(md|markdown|txt)$/i.test(f.name) || f.type.startsWith('text/')
    );
    if (arr.length === 0) return;

    const loaded: QueuedMdFile[] = [];
    for (let i = 0; i < arr.length; i++) {
      try {
        const text = await arr[i].text();
        loaded.push(inspectFile(arr[i].name, text, i));
      } catch {}
    }

    setQueuedFiles(prev => {
      const combined = [...prev, ...loaded];
      return prev.length === 0 ? sortMarkdownFilesNaturally(combined) : combined;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const moveFile = (index: number, dir: 'up' | 'down') => {
    setQueuedFiles(prev => {
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const removeFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
  };

  const sortFiles = () => {
    setQueuedFiles(prev => sortMarkdownFilesNaturally(prev));
  };

  const handleRunBatchImport = () => {
    if (queuedFiles.length === 0) return;
    onBatchImport(queuedFiles, {
      mode: importMode,
      flowMode,
      ensureTopH1,
      cleanTypography,
      splitByH1,
      autoNumberChapters,
      enableToc,
      bookTitle: customBookTitle.trim() || undefined,
      bookSubtitle: customBookSubtitle.trim() || undefined,
    });
    setQueuedFiles([]);
    onClose();
  };

  const handleAddStarterChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChInput.trim()) return;
    setStarterChapters(prev => [...prev, newChInput.trim()]);
    setNewChInput('');
  };

  const handleRemoveStarterChapter = (idx: number) => {
    if (starterChapters.length <= 1) return;
    setStarterChapters(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRunEraseAndCreateNew = (instantBlank = false) => {
    if (instantBlank) {
      onEraseAndCreateNew({
        keepStyling: true,
        clearBrandMetadata: false,
        title: 'नयी ई-बुक (शीर्षक यहाँ लिखें)',
        subtitle: 'अध्ययन सामग्री एवं नोट्स',
        initialChapters: [
          {
            title: 'अध्याय 1 : परिचय',
            source: '# अध्याय 1 : परिचय\n\nयहाँ से अपनी नयी ई-बुक लिखना शुरू करें...\n',
          },
        ],
      });
      onClose();
      return;
    }

    onEraseAndCreateNew({
      keepStyling,
      clearBrandMetadata,
      title: newTitle.trim() || 'नयी ई-बुक',
      subtitle: newSubtitle.trim() || (clearBrandMetadata ? '' : 'संपूर्ण अध्ययन सामग्री'),
      institute: newInstitute.trim() ? newInstitute.trim() : clearBrandMetadata ? '' : undefined,
      authorName: newAuthor.trim() ? newAuthor.trim() : clearBrandMetadata ? '' : undefined,
      examTag: newExamTag.trim() ? newExamTag.trim() : clearBrandMetadata ? '' : undefined,
      subject: newSubject,
      initialChapters: starterChapters.map(chTitle => ({
        title: chTitle,
        source: `# ${chTitle}\n\n`,
      })),
    });
    onClose();
  };

  const totalQueuedWords = queuedFiles.reduce((acc, f) => acc + f.words, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-surface-solid shadow-float">
        {/* Modal Header & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FileStack className="text-brand" size={20} />
            <h2 className="text-base font-bold text-ink">
              बल्क .MD ई-बुक बिल्डर व नयी ई-बुक स्टूडियो
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-line bg-canvas p-0.5">
              <button
                type="button"
                onClick={() => setActiveMode('import')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  activeMode === 'import'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-mute hover:text-ink'
                }`}
              >
                <Upload size={13} />
                <span>Multiple .MD जोड़ें</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('new-ebook')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  activeMode === 'new-ebook'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-mute hover:text-ink'
                }`}
              >
                <Eraser size={13} />
                <span>टेम्पलेट मिटाएँ / नयी ई-बुक</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn !min-h-8 !px-2"
              title="बंद करें"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {activeMode === 'import' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-brand/25 bg-brand-soft/25 p-3 text-xs leading-relaxed text-ink">
                <b>📚 एक बार में बड़ी ई-बुक बनाएँ (Multi-File .MD Batch Builder):</b> एक साथ कई{' '}
                <code>.md</code> या <code>.txt</code> फ़ाइलें चुनें। यह टूल सभी फ़ाइलों के शीर्षकों (H1–H3),
                कॉलआउट बॉक्स, सूचियों और पेज प्रवाह को एकसमान स्टाइलिंग में ढालकर पूरी ई-बुक व स्वचालित
                विषय-सूची (TOC) तैयार कर देता है।
              </div>

              {/* Drag & Drop Multi-File Zone */}
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
                  isDragging
                    ? 'border-brand bg-brand-soft/40 scale-[0.99]'
                    : 'border-line bg-raised hover:border-brand/60 hover:bg-brand-soft/15'
                }`}
              >
                <Upload className="mb-2 text-brand" size={28} />
                <div className="text-sm font-bold text-ink">
                  यहाँ एक या अधिक .md / .txt फ़ाइलें ड्रैग करें या क्लिक करके चुनें
                </div>
                <div className="mt-1 text-xs text-mute">
                  एक साथ 2, 10 या 50+ Markdown फ़ाइलें चुनने के लिए Ctrl / Shift दबाकर सेलेक्ट करें
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt,text/markdown,text/plain"
                  multiple
                  hidden
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesSelected(e.target.files);
                    }
                    e.target.value = '';
                  }}
                />
              </div>

              {/* Queued Files List */}
              {queuedFiles.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-line bg-raised p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold text-ink">
                      चयनित फ़ाइलें ({queuedFiles.length} फ़ाइलें · कुल {totalQueuedWords} शब्द)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={sortFiles}
                        className="btn !min-h-7 !px-2 text-[0.7rem]"
                        title="फ़ाइल नाम के अनुसार क्रमबद्ध करें (1, 2, 10...)"
                      >
                        <ArrowUpDown size={12} /> क्रमबद्ध करें (Sort A-Z)
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn !min-h-7 !px-2 text-[0.7rem] text-brand"
                      >
                        <FilePlus2 size={12} /> और फ़ाइलें जोड़ें
                      </button>
                      <button
                        type="button"
                        onClick={() => setQueuedFiles([])}
                        className="btn !min-h-7 !px-2 text-[0.7rem] text-warn"
                      >
                        <Trash2 size={12} /> सब हटाएँ
                      </button>
                    </div>
                  </div>

                  <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                    {queuedFiles.map((qf, idx) => (
                      <div
                        key={qf.id}
                        className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2 text-xs"
                      >
                        <span className="flex size-5 flex-none items-center justify-center rounded-md bg-brand-soft font-bold text-brand">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold text-ink">{qf.detectedTitle}</div>
                          <div className="flex items-center gap-2 text-[0.68rem] text-mute">
                            <span className="truncate">{qf.name}</span>
                            <span>·</span>
                            <span>{qf.words} शब्द</span>
                            {qf.h1Count > 1 && (
                              <span className="rounded bg-amber-500/15 px-1.5 py-0.2 font-semibold text-amber-600 dark:text-amber-400">
                                {qf.h1Count} H1 खंड
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveFile(idx, 'up')}
                            disabled={idx === 0}
                            className="btn !min-h-6.5 !px-1.5"
                            title="ऊपर करें"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFile(idx, 'down')}
                            disabled={idx === queuedFiles.length - 1}
                            className="btn !min-h-6.5 !px-1.5"
                            title="नीचे करें"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile(qf.id)}
                            className="btn !min-h-6.5 !px-1.5 text-warn"
                            title="हटाएँ"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Mode & Content Flow Options */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-raised p-3">
                  <div className="mb-2 text-xs font-bold text-ink">
                    1. आयात मोड (Import Mode)
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <label className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-canvas/60">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-ink">
                          नयी ई-बुक बनाएँ (टेम्पलेट/पुराने अध्याय मिटाएँ)
                        </div>
                        <div className="text-[0.68rem] text-mute">
                          पहले के सैंपल अध्याय हटाकर इन फ़ाइलों से संपूर्ण ई-बुक बनाएगा
                        </div>
                      </div>
                    </label>

                    <label className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-canvas/60">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-ink">
                          वर्तमान ई-बुक में आगे जोड़ें (Append Chapters)
                        </div>
                        <div className="text-[0.68rem] text-mute">
                          मौजूदा अध्यायों के बाद इन फ़ाइलों को नए अध्यायों के रूप में जोड़ेगा
                        </div>
                      </div>
                    </label>

                    <label className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-canvas/60">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge-single'}
                        onChange={() => setImportMode('merge-single')}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-ink">
                          एकल मास्टर स्ट्रीम में मर्ज करें (Single Merged Stream)
                        </div>
                        <div className="text-[0.68rem] text-mute">
                          सभी फ़ाइलों को मिलाकर एक ही बड़े अध्याय में संयोजित करेगा
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-raised p-3">
                  <div className="mb-2 text-xs font-bold text-ink">
                    2. सामग्री प्रवाह व पेजिंग (Content Flow)
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <label className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-canvas/60">
                      <input
                        type="radio"
                        name="flowMode"
                        checked={flowMode === 'continuous'}
                        onChange={() => setFlowMode('continuous')}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-ink">
                          सतत सघन प्रवाह (Continuous Seamless Flow)
                        </div>
                        <div className="text-[0.68rem] text-mute">
                          बिना कोई कॉलम/पेज खाली छोड़े एक फ़ाइल के तुरंत बाद दूसरी फ़ाइल का टेक्स्ट बहेगा
                        </div>
                      </div>
                    </label>

                    <label className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-canvas/60">
                      <input
                        type="radio"
                        name="flowMode"
                        checked={flowMode === 'page-per-chapter'}
                        onChange={() => setFlowMode('page-per-chapter')}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-ink">
                          नया पेज प्रति अध्याय (Fresh Page per Chapter)
                        </div>
                        <div className="text-[0.68rem] text-mute">
                          प्रत्येक .md फ़ाइल / मुख्य अध्याय एक नए A4 पेज से शुरू होगा
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Consistent Styling & Formatting Harmonization */}
              <div className="rounded-xl border border-line bg-raised p-3.5">
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Sparkles size={14} className="text-brand" />
                  <span>3. एकसमान स्टाइलिंग एवं फ़ॉर्मेटिंग सामंजस्य (Consistent Styling & Flow)</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ensureTopH1}
                      onChange={e => setEnsureTopH1(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>प्रत्येक फ़ाइल में मुख्य # H1 शीर्षक व पदानुक्रम सुनिश्चित करें</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cleanTypography}
                      onChange={e => setCleanTypography(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>हिंदी विराम चिह्न (।), सूचियाँ व कॉलआउट बॉक्स एकसमान करें</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={splitByH1}
                      onChange={e => setSplitByH1(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>एक फ़ाइल में कई # H1 हों तो उन्हें अलग-अलग अध्याय बनाएँ</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoNumberChapters}
                      onChange={e => setAutoNumberChapters(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>अध्यायों में स्वचालित क्रमांक (अध्याय 1, 2, 3...) जोड़ें</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enableToc}
                      onChange={e => setEnableToc(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>सभी फ़ाइलों की संयुक्त विषय-सूची (TOC) पेज सक्रिय करें</span>
                  </label>
                </div>
              </div>

              {/* Optional Book Title Override when replacing */}
              {importMode !== 'append' && (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="field-label">ई-बुक का मुख्य शीर्षक (वैकल्पिक)</label>
                    <input
                      type="text"
                      placeholder={s.title || 'उदा. भारतीय राजव्यवस्था संपूर्ण नोट्स'}
                      value={customBookTitle}
                      onChange={e => setCustomBookTitle(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="field-label">उप-शीर्षक / विवरण (वैकल्पिक)</label>
                    <input
                      type="text"
                      placeholder={s.subtitle || 'सिविल सेवा एवं राज्य पीएससी परीक्षा हेतु'}
                      value={customBookSubtitle}
                      onChange={e => setCustomBookSubtitle(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- TAB 2: Erase Template Content & Create New E-book --- */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                <div className="min-w-0 flex-1 text-xs leading-relaxed text-ink">
                  <b>✨ टेम्पलेट की सैंपल सामग्री पूरी तरह मिटाएँ (Erase Template Content):</b> आप एक क्लिक में
                  डिफ़ॉल्ट सैंपल अध्यायों (संघ राज्य क्षेत्र आदि) को हटाकर बिल्कुल खाली नयी ई-बुक शुरू कर सकते हैं,
                  या नीचे अपनी नयी ई-बुक के अध्याय और विवरण तय कर सकते हैं।
                </div>
                <button
                  type="button"
                  onClick={() => handleRunEraseAndCreateNew(true)}
                  className="btn !border-amber-600 bg-amber-500/20 font-bold text-amber-800 hover:bg-amber-500/30 dark:text-amber-300"
                >
                  <Eraser size={15} /> तुरंत खाली ई-बुक शुरू करें (1-Click Blank)
                </button>
              </div>

              {/* New Ebook Metadata Setup */}
              <div className="space-y-3 rounded-2xl border border-line bg-raised p-4">
                <div className="text-xs font-bold text-ink">
                  नयी ई-बुक का विवरण (New E-book Details)
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="field-label">पुस्तक / ई-बुक का शीर्षक</label>
                    <input
                      type="text"
                      placeholder="उदा. आधुनिक भारत का इतिहास"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="field-label">उप-शीर्षक (Subtitle)</label>
                    <input
                      type="text"
                      placeholder="उदा. प्रारंभिक एवं मुख्य परीक्षा विशेषांक"
                      value={newSubtitle}
                      onChange={e => setNewSubtitle(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="field-label">संस्थान / प्रकाशन का नाम</label>
                    <input
                      type="text"
                      placeholder={clearBrandMetadata ? 'खाली छोड़ें या नया नाम लिखें' : s.institute}
                      value={newInstitute}
                      onChange={e => setNewInstitute(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="field-label">लेखक / संपादक का नाम</label>
                    <input
                      type="text"
                      placeholder={clearBrandMetadata ? 'लेखक का नाम' : s.brand.authorName}
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="field-label">लक्षित परीक्षा / टैग (Cover Tag)</label>
                    <input
                      type="text"
                      placeholder="उदा. UPSC · State PSC · 2026"
                      value={newExamTag}
                      onChange={e => setNewExamTag(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="field-label">विषय थीम (Cover Subject Glyph)</label>
                    <select
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      className="input text-xs"
                    >
                      {SUBJECT_THEMES.map(subj => (
                        <option key={subj.key} value={subj.key}>
                          {subj.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Styling & Brand Preservation Options */}
                <div className="flex flex-wrap gap-4 border-t border-line pt-3 text-xs">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={keepStyling}
                      onChange={e => setKeepStyling(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span className="font-semibold">
                      वर्तमान थीम रंग, फ़ॉन्ट व लेआउट स्टाइल बनाए रखें (Keep Current Styling)
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={clearBrandMetadata}
                      onChange={e => setClearBrandMetadata(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>
                      पुराने संस्थान/पता/हस्ताक्षर टेम्पलेट नाम भी पूरी तरह साफ़ करें
                    </span>
                  </label>
                </div>
              </div>

              {/* Starter Chapters List */}
              <div className="space-y-2.5 rounded-2xl border border-line bg-raised p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-ink">
                    प्रारंभिक अध्याय संरचना ({starterChapters.length} खाली अध्याय)
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMode('import')}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    या सीधे .md फ़ाइलें अपलोड करने के लिए यहाँ क्लिक करें →
                  </button>
                </div>

                <div className="max-h-36 space-y-1.5 overflow-y-auto">
                  {starterChapters.map((chTitle, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs"
                    >
                      <span className="flex size-5 items-center justify-center rounded bg-brand-soft font-bold text-brand">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={chTitle}
                        onChange={e => {
                          const val = e.target.value;
                          setStarterChapters(prev =>
                            prev.map((item, i) => (i === idx ? val : item))
                          );
                        }}
                        className="input !min-h-7 flex-1 border-none bg-transparent px-1 text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStarterChapter(idx)}
                        disabled={starterChapters.length <= 1}
                        className="btn !min-h-6.5 !px-1.5 text-warn"
                        title="हटाएँ"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddStarterChapter} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="नया खाली अध्याय शीर्षक जोड़ें (उदा. अध्याय 2 : प्रमुख विशेषताएँ)..."
                    value={newChInput}
                    onChange={e => setNewChInput(e.target.value)}
                    className="input text-xs"
                  />
                  <button type="submit" className="btn flex-none text-xs">
                    <Plus size={14} /> अध्याय जोड़ें
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/50 px-5 py-3">
          {activeMode === 'import' ? (
            <>
              <div className="text-xs text-mute">
                {queuedFiles.length > 0
                  ? `${queuedFiles.length} फ़ाइलें तैयार · ${
                      flowMode === 'continuous' ? 'सतत प्रवाह' : 'नया पेज प्रति अध्याय'
                    }`
                  : 'कृपया कम से कम 1 .md या .txt फ़ाइल चुनें'}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="btn text-xs">
                  रद्द करें
                </button>
                <button
                  type="button"
                  disabled={queuedFiles.length === 0}
                  onClick={handleRunBatchImport}
                  className="btn btn-primary font-bold"
                >
                  <Check size={15} />
                  <span>
                    {importMode === 'replace'
                      ? `बड़ी ई-बुक बनाएँ (${queuedFiles.length} फ़ाइलें)`
                      : importMode === 'append'
                        ? `${queuedFiles.length} फ़ाइलें ई-बुक में जोड़ें`
                        : `${queuedFiles.length} फ़ाइलें एक में मर्ज करें`}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-mute">
                सभी पुराने टेम्पलेट अध्याय मिटा दिए जाएंगे (Ctrl+Z से Undo उपलब्ध है)
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="btn text-xs">
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={() => handleRunEraseAndCreateNew(false)}
                  className="btn btn-primary font-bold"
                >
                  <BookPlus size={15} />
                  <span>टेम्पलेट मिटाएँ व नयी ई-बुक बनाएँ</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
