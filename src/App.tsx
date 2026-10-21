/**
 * Gyankunj Studio — E-book & Study Notes Designer
 * Advanced React 19 + TypeScript + Tailwind CSS v4 Application
 */

import React, {
  useState,
  useReducer,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
} from 'react';
import {
  Sparkles,
  Palette,
  Type,
  Layout,
  Heading,
  Layers,
  Sliders,
  FileEdit,
  Download,
  Eye,
  GitFork,
} from 'lucide-react';
import {
  Chapter,
  EbookSettings,
  PageLayout,
} from './types/ebook';
import { DEFAULT_BOOK_SETTINGS } from './constants/sampleData';
import { parseMarkdownToBlocks, countWords } from './utils/markdownParser';
import {
  BatchMarkdownImportOptions,
  EraseTemplateOptions,
  MarkdownFileInput,
  buildLargeEbookFromMarkdownFiles,
  eraseTemplateAndCreateNewEbook,
  sortMarkdownFilesNaturally,
} from './utils/ebookBuilder';
import {
  distributeBlocksIntoColumns,
  assemblePages,
} from './utils/paginationEngine';
import { exportStandaloneHtml } from './utils/exportUtils';
import {
  getDocumentStyles,
  getDocumentDataAttributes,
  PageView,
  ContentBlockView,
} from './components/PageRenderer';
import { Header } from './components/Header';
import { DocumentPreview } from './components/DocumentPreview';
import { CommandPalette, CommandItem } from './components/CommandPalette';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ChapterManagerModal } from './components/ChapterManagerModal';
import { BatchMarkdownModal } from './components/BatchMarkdownModal';
import { DiagramStudioModal } from './components/DiagramStudioModal';
import { Toast, ToastMessage } from './components/Toast';

// Panels
import { StudioPanel } from './components/panels/StudioPanel';
import { ThemePanel } from './components/panels/ThemePanel';
import { TypographyPanel } from './components/panels/TypographyPanel';
import { LayoutPanel } from './components/panels/LayoutPanel';
import { HeadingsPanel } from './components/panels/HeadingsPanel';
import { HeaderFooterPanel } from './components/panels/HeaderFooterPanel';
import { ContentEditorPanel } from './components/panels/ContentEditorPanel';
import { DiagramsPanel } from './components/panels/DiagramsPanel';
import { ExtrasPanel } from './components/panels/ExtrasPanel';
import { ExportPanel } from './components/panels/ExportPanel';

const STORAGE_KEY = 'gyankunj_ebook_settings_v3_2';
const THEME_MODE_KEY = 'gyankunj_ui_theme_mode';
const ASIDE_WIDTH_KEY = 'gyankunj_aside_width';
const MAX_UNDO = 60;

// Deep path setter helper
function setDeep(obj: any, path: string, value: any): any {
  const parts = path.split('.');
  const setAt = (curr: any, idx: number): any => {
    const key = parts[idx];
    const nextVal = idx === parts.length - 1 ? value : setAt(curr?.[key] ?? {}, idx + 1);
    if (Array.isArray(curr)) {
      const copy = curr.slice();
      (copy as any)[key] = nextVal;
      return copy;
    }
    return { ...curr, [key]: nextVal };
  };
  return setAt(obj, 0);
}

// History Reducer
type Action =
  | { type: 'set'; path: string; value: any; coalesce?: boolean }
  | { type: 'patch'; patch: (prev: EbookSettings) => EbookSettings }
  | { type: 'replace'; value: EbookSettings }
  | { type: 'undo' }
  | { type: 'redo' };

interface HistoryState {
  present: EbookSettings;
  past: EbookSettings[];
  future: EbookSettings[];
  lastKey: string;
  lastAt: number;
}

function historyReducer(state: HistoryState, action: Action): HistoryState {
  const applyNewState = (next: EbookSettings, key: string, coalesce: boolean) => {
    if (next === state.present) return state;
    const now = Date.now();
    const shouldCoalesce = coalesce && key === state.lastKey && now - state.lastAt < 900;
    return {
      present: next,
      past: shouldCoalesce ? state.past : [...state.past, state.present].slice(-MAX_UNDO),
      future: [],
      lastKey: key,
      lastAt: now,
    };
  };

  switch (action.type) {
    case 'set':
      return applyNewState(setDeep(state.present, action.path, action.value), action.path, !!action.coalesce);
    case 'patch':
      return applyNewState(action.patch(state.present), '', false);
    case 'replace':
      return applyNewState(action.value, '', false);
    case 'undo':
      if (state.past.length === 0) return state;
      return {
        present: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future],
        lastKey: '',
        lastAt: 0,
      };
    case 'redo':
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        present: next,
        past: [...state.past, state.present],
        future: rest,
        lastKey: '',
        lastAt: 0,
      };
  }
}

function loadInitialSettings(): EbookSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.theme) {
        const savedChapters =
          Array.isArray(parsed.chapters) && parsed.chapters.length > 0
            ? parsed.chapters
            : DEFAULT_BOOK_SETTINGS.chapters;
        const validActiveId = savedChapters.some((c: Chapter) => c.id === parsed.activeChapterId)
          ? parsed.activeChapterId
          : savedChapters[0].id;

        return {
          ...DEFAULT_BOOK_SETTINGS,
          ...parsed,
          chapters: savedChapters,
          activeChapterId: validActiveId,
        };
      }
    }
  } catch {}
  return DEFAULT_BOOK_SETTINGS;
}

const TABS = [
  { id: 'studio', label: 'Studio', icon: Sparkles },
  { id: 'content', label: 'सामग्री', icon: FileEdit },
  { id: 'diagrams', label: 'रेखाचित्र / Flowcharts', icon: GitFork },
  { id: 'theme', label: 'थीम', icon: Palette },
  { id: 'type', label: 'टाइपो', icon: Type },
  { id: 'layout', label: 'लेआउट', icon: Layout },
  { id: 'heads', label: 'शीर्षक', icon: Heading },
  { id: 'hf', label: 'हेडर/फ़ूटर', icon: Layers },
  { id: 'extras', label: 'Extras', icon: Sliders },
  { id: 'export', label: 'Export', icon: Download },
] as const;

type TabId = typeof TABS[number]['id'];

export default function App() {
  const [history, dispatch] = useReducer(historyReducer, undefined, () => ({
    present: loadInitialSettings(),
    past: [],
    future: [],
    lastKey: '',
    lastAt: 0,
  }));

  const s = history.present;

  // Persist to localStorage
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [s]);

  // Set & Patch Dispatchers
  const set = useCallback((path: string, value: any, coalesce = false) => {
    dispatch({ type: 'set', path, value, coalesce });
  }, []);

  const patch = useCallback((fn: (prev: EbookSettings) => EbookSettings) => {
    dispatch({ type: 'patch', patch: fn });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  // UI State
  const [activeTab, setActiveTab] = useState<TabId>('studio');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isChapterManagerOpen, setIsChapterManagerOpen] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchModalMode, setBatchModalMode] = useState<'import' | 'new-ebook'>('import');
  const [isDiagramStudioOpen, setIsDiagramStudioOpen] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('preview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [overflowCount, setOverflowCount] = useState<number>(0);

  // Scope of preview: 'full' (entire ebook - all chapters) vs 'chapter' (current active chapter)
  const [previewScope, setPreviewScope] = useState<'full' | 'chapter'>('full');

  const toastIdRef = useRef(0);
  const showToast = useCallback((msg: string, kind: 'ok' | 'warn' = 'ok') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev.slice(-2), { id, msg, kind }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  const handleOpenBatchModal = useCallback((mode: 'import' | 'new-ebook' = 'import') => {
    setBatchModalMode(mode);
    setIsBatchModalOpen(true);
  }, []);

  // Multi-File (.md) Batch Import Handler
  const handleBatchImportMarkdown = useCallback(
    (files: MarkdownFileInput[], options: BatchMarkdownImportOptions) => {
      let importedCount = 0;
      let totalWords = 0;
      patch(prev => {
        const res = buildLargeEbookFromMarkdownFiles(files, prev, options);
        importedCount = res.importedChaptersCount;
        totalWords = res.totalWordsImported;
        return res.nextSettings;
      });
      setPreviewScope('full');
      showToast(
        `📚 ${importedCount} अध्याय (${totalWords} शब्द) एकसमान स्टाइलिंग व प्रवाह के साथ ई-बुक में जोड़े गए!`
      );
    },
    [patch, showToast]
  );

  // Direct Quick Upload of Multiple .md Files (from file input in ContentEditor or ChapterManager)
  const handleQuickUploadMultipleMd = useCallback(
    async (fileList: FileList, mode: 'append' | 'replace' = 'append') => {
      const arr = Array.from(fileList).filter(
        f => /\.(md|markdown|txt)$/i.test(f.name) || f.type.startsWith('text/')
      );
      if (arr.length === 0) {
        showToast('कृपया वैध .md या .txt फ़ाइलें चुनें।', 'warn');
        return;
      }

      const rawFiles: MarkdownFileInput[] = [];
      for (const f of arr) {
        try {
          const content = await f.text();
          rawFiles.push({ name: f.name, content });
        } catch {}
      }

      const sorted = sortMarkdownFilesNaturally(rawFiles);
      handleBatchImportMarkdown(sorted, {
        mode,
        flowMode: s.layout.newPageH1 ? 'page-per-chapter' : 'continuous',
        ensureTopH1: true,
        cleanTypography: true,
        splitByH1: false,
        autoNumberChapters: false,
        enableToc: true,
      });
    },
    [handleBatchImportMarkdown, s.layout.newPageH1, showToast]
  );

  // Erase Template Content & Create a New E-book Handler
  const handleEraseAndCreateNewEbook = useCallback(
    (options?: EraseTemplateOptions) => {
      patch(prev => eraseTemplateAndCreateNewEbook(prev, options));
      setPreviewScope('full');
      setActiveTab('content');
      showToast('✨ टेम्पलेट सामग्री मिटा दी गई — आपकी नयी ई-बुक तैयार है!');
    },
    [patch, showToast]
  );

  const handleInsertDiagram = useCallback((mdCode: string) => {
    patch(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === prev.activeChapterId
          ? { ...c, source: c.source.trimEnd() + '\n\n' + mdCode.trim() + '\n' }
          : c
      ),
    }));
    showToast('आरेख/फ़्लोचार्ट अध्याय में जोड़ा गया!');
  }, [patch, showToast]);

  // Theme Mode
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>(() => {
    try {
      return (localStorage.getItem(THEME_MODE_KEY) as any) || 'auto';
    } catch {
      return 'auto';
    }
  });

  const applyThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    if (mode === 'auto') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.dataset.theme = mode;
    }
  };

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  const handleCycleTheme = () => {
    const next = themeMode === 'auto' ? 'light' : themeMode === 'light' ? 'dark' : 'auto';
    setThemeMode(next);
    applyThemeMode(next);
    try {
      localStorage.setItem(THEME_MODE_KEY, next);
    } catch {}
  };

  // Resizable Sidebar Width
  const [asideWidth, setAsideWidth] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(ASIDE_WIDTH_KEY)) || 450;
    } catch {
      return 450;
    }
  });

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = asideWidth;
    let currW = startW;

    const onMove = (moveEv: PointerEvent) => {
      currW = Math.max(340, Math.min(680, startW + moveEv.clientX - startX));
      setAsideWidth(currW);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      try {
        localStorage.setItem(ASIDE_WIDTH_KEY, String(currW));
      } catch {}
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Compile Book Content
  // When s.layout.newPageH1 is true: chapters start on a fresh page (=== pagebreak)
  // When s.layout.newPageH1 is false (continuous flow): chapters flow smoothly across columns/pages
  const fullBookContent = useMemo(() => {
    const sep = s.layout.newPageH1 ? '\n\n===\n\n' : '\n\n';
    return s.chapters
      .map(ch => ch.source.trim())
      .filter(Boolean)
      .join(sep);
  }, [s.chapters, s.layout.newPageH1]);

  // Active Chapter source
  const activeChapter = s.chapters.find(c => c.id === s.activeChapterId) || s.chapters[0];

  // Compile Active Content for preview & layout
  const activeContent = useMemo(() => {
    if (previewScope === 'chapter') {
      return activeChapter ? activeChapter.source.trim() : '';
    }
    const sep = s.layout.newPageH1 ? '\n\n===\n\n' : '\n\n';
    return s.chapters
      .map(ch => ch.source.trim())
      .filter(Boolean)
      .join(sep);
  }, [s.chapters, previewScope, activeChapter, s.layout.newPageH1]);

  // Parse blocks for the preview
  const parsedBlocks = useMemo(() => {
    return parseMarkdownToBlocks(activeContent);
  }, [activeContent]);

  // Client-Side Measure Engine
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const measureColRef = useRef<HTMLDivElement>(null);
  const [layoutPages, setLayoutPages] = useState<PageLayout[] | null>(null);

  const measureAndLayout = useCallback(() => {
    const colEl = measureColRef.current;
    if (!colEl) return;
    const pageColHeight = colEl.parentElement?.clientHeight;
    if (!pageColHeight) return;

    const childNodes = Array.from(colEl.children) as HTMLElement[];
    const bHeights = childNodes.map(el => el.getBoundingClientRect().height);

    const tableRows: (number[] | null)[] = [];
    const tableHeaderHeights: number[] = [];
    const listRows: (number[] | null)[] = [];

    parsedBlocks.forEach((b, idx) => {
      const node = childNodes[idx];
      if (node && b.t === 'table') {
        const thead = node.querySelector('thead');
        tableHeaderHeights[idx] = thead ? thead.getBoundingClientRect().height : 32;
        const trs = Array.from(node.querySelectorAll('tbody tr')) as HTMLElement[];
        tableRows[idx] = trs.map(tr => tr.getBoundingClientRect().height);
        listRows[idx] = null;
      } else if (node && (b.t === 'ul' || b.t === 'ol')) {
        const lis = Array.from(node.querySelectorAll('li')) as HTMLElement[];
        listRows[idx] = lis.map(li => {
          const style = window.getComputedStyle(li);
          return (
            li.getBoundingClientRect().height +
            parseFloat(style.marginTop || '0') +
            parseFloat(style.marginBottom || '0')
          );
        });
        tableRows[idx] = null;
        tableHeaderHeights[idx] = 0;
      } else {
        tableRows[idx] = null;
        tableHeaderHeights[idx] = 0;
        listRows[idx] = null;
      }
    });

    const cols = distributeBlocksIntoColumns(
      parsedBlocks,
      bHeights,
      tableRows,
      tableHeaderHeights,
      pageColHeight,
      s.layout.columns,
      s.layout.newPageH1,
      listRows
    );

    const pages = assemblePages(cols, parsedBlocks, s.layout.columns);
    setLayoutPages(pages);
  }, [parsedBlocks, s.layout.columns, s.layout.newPageH1]);

  // Re-measure on typography/layout changes
  const measureDepsKey = useMemo(() => {
    return JSON.stringify([
      s.type,
      s.layout,
      s.heads.h1,
      s.heads.h2,
      s.heads.h3,
      s.heads.table,
      s.heads.callout,
      s.heads.list,
      s.brand.showHeader,
      s.brand.showTitleBar,
      s.brand.compactHeader,
      s.brand.showFooter,
      s.title,
      s.subtitle,
      s.address,
      s.institute,
      fullBookContent,
    ]);
  }, [
    s.type,
    s.layout,
    s.heads,
    s.brand.showHeader,
    s.brand.showTitleBar,
    s.brand.compactHeader,
    s.brand.showFooter,
    s.title,
    s.subtitle,
    s.address,
    s.institute,
    fullBookContent,
  ]);

  useLayoutEffect(() => {
    measureAndLayout();
  }, [measureAndLayout, measureDepsKey]);

  useEffect(() => {
    document.fonts?.ready.then(measureAndLayout);
  }, [measureAndLayout, measureDepsKey]);

  // Monitor Overflow
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      const columns = Array.from(
        document.querySelectorAll('.zoom-wrap .page:not(.cover) .column')
      ) as HTMLElement[];
      const overflowing = columns.filter(col => col.scrollHeight > col.clientHeight + 2);
      setOverflowCount(overflowing.length);
    });
    return () => cancelAnimationFrame(timer);
  }, [layoutPages, s]);

  // Auto-Fix Overflow Algorithm
  const handleAutoFixOverflow = () => {
    patch(prev => {
      // Slightly decrement font size or line height or padding to fit content perfectly
      const nextSize = +(Math.max(7.5, prev.type.size - 0.2)).toFixed(1);
      const nextLine = +(Math.max(1.2, prev.type.line - 0.05)).toFixed(2);
      const nextPadY = Math.max(3, prev.layout.padY - 1);
      return {
        ...prev,
        type: {
          ...prev.type,
          size: nextSize,
          line: nextLine,
        },
        layout: {
          ...prev.layout,
          padY: nextPadY,
        },
      };
    });
    showToast('⚡ लेआउट स्वतः समायोजित हुआ — ओवरफ्लो ठीक किया गया!');
  };

  // Print Handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Standalone HTML Export Handler
  const handleExportHtml = useCallback(() => {
    const wrap = document.querySelector('.zoom-wrap');
    if (!wrap) return;
    const clone = wrap.cloneNode(true) as HTMLElement;
    clone.style.zoom = '1';
    clone.style.maxWidth = 'none';

    // Collect all stylesheets
    const cssRules = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(r => r.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    exportStandaloneHtml(clone.outerHTML, s.title, cssRules);
    showToast('स्टैंडअलोन HTML ई-बुक डाउनलोड हुई!');
  }, [s.title, showToast]);

  // Chapter Management Functions
  const handleSelectChapter = (id: string) => {
    set('activeChapterId', id);
    setMobileView('edit');
    setActiveTab('content');
  };

  const handleAddChapter = (chapterTitle: string) => {
    const newId = 'ch-' + Date.now().toString(36);
    const newCh: Chapter = {
      id: newId,
      title: chapterTitle,
      source: `# ${chapterTitle}\n\nयहाँ इस अध्याय की सामग्री लिखें...\n`,
    };
    patch(prev => ({
      ...prev,
      chapters: [...prev.chapters, newCh],
      activeChapterId: newId,
    }));
    showToast(`नया अध्याय "${chapterTitle}" जोड़ा गया।`);
  };

  const handleRenameChapter = (id: string, newTitle: string) => {
    patch(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => (c.id === id ? { ...c, title: newTitle } : c)),
    }));
    showToast('अध्याय का नाम बदला गया।');
  };

  const handleDeleteChapter = (id: string) => {
    if (s.chapters.length <= 1) {
      showToast('कम से कम एक अध्याय होना आवश्यक है।', 'warn');
      return;
    }
    patch(prev => {
      const remaining = prev.chapters.filter(c => c.id !== id);
      const nextActive = prev.activeChapterId === id ? remaining[0].id : prev.activeChapterId;
      return {
        ...prev,
        chapters: remaining,
        activeChapterId: nextActive,
      };
    });
    showToast('अध्याय हटा दिया गया।');
  };

  const handleReorderChapter = (id: string, dir: 'up' | 'down') => {
    patch(prev => {
      const idx = prev.chapters.findIndex(c => c.id === id);
      if (idx === -1) return prev;
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.chapters.length) return prev;

      const list = [...prev.chapters];
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, chapters: list };
    });
  };

  const handleMergeChapters = () => {
    if (s.chapters.length <= 1) return;
    const sep = s.layout.newPageH1 ? '\n\n===\n\n' : '\n\n';
    const mergedSource = s.chapters.map(c => `%% === ${c.title} ===\n${c.source.trim()}`).join(sep);
    patch(prev => ({
      ...prev,
      chapters: [
        {
          id: 'ch-merged',
          title: prev.title || 'संपूर्ण पुस्तक',
          source: mergedSource,
        },
      ],
      activeChapterId: 'ch-merged',
    }));
    setIsChapterManagerOpen(false);
    showToast('सभी अध्याय एक एकल दस्तावेज़ में संयोजित हुए।');
  };

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.ctrlKey || e.metaKey;
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (isCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (isCmd && !isInput && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleOpenBatchModal('import');
      } else if (isCmd && !isInput && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (isCmd && !isInput && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (!isCmd && !isInput && e.key.toLowerCase() === 'd') {
        setIsDiagramStudioOpen(prev => !prev);
      } else if (!isCmd && !isInput && e.key.toLowerCase() === 'f') {
        setIsFocusMode(prev => !prev);
      } else if (!isCmd && !isInput && e.key === '?') {
        setIsShortcutsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsFocusMode(false);
        setIsShortcutsOpen(false);
        setIsCommandPaletteOpen(false);
        setIsChapterManagerOpen(false);
        setIsBatchModalOpen(false);
        setIsDiagramStudioOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleOpenBatchModal]);

  // Command Palette Items
  const commands: CommandItem[] = useMemo(() => {
    const nav = (tab: TabId) => () => {
      setActiveTab(tab);
      setMobileView('edit');
    };
    return [
      ...TABS.map(t => ({
        id: `tab-${t.id}`,
        label: `${t.label} पैनल खोलें`,
        group: 'Navigate',
        run: nav(t.id),
      })),
      {
        id: 'batch-md',
        label: '📚 एक साथ कई .md फ़ाइलें जोड़कर बड़ी ई-बुक बनाएँ (Multi-File .MD Import)',
        group: 'Chapters',
        hint: 'Ctrl+M',
        run: () => handleOpenBatchModal('import'),
      },
      {
        id: 'erase-template',
        label: '✨ टेम्पलेट सामग्री मिटाएँ और नयी ई-बुक बनाएँ (Erase Template & New E-book)',
        group: 'Chapters',
        run: () => handleOpenBatchModal('new-ebook'),
      },
      {
        id: 'instant-blank',
        label: '🧹 तुरंत खाली ई-बुक शुरू करें (1-Click Blank E-book)',
        group: 'Chapters',
        run: () => handleEraseAndCreateNewEbook({ keepStyling: true }),
      },
      { id: 'ch-mgr', label: 'अध्याय प्रबंधन (Manage Chapters)', group: 'Chapters', run: () => setIsChapterManagerOpen(true) },
      { id: 'diagram-studio', label: 'रेखाचित्र व फ़्लोचार्ट स्टूडियो (Diagram Studio)', group: 'Diagrams', hint: 'Flowchart', run: () => setIsDiagramStudioOpen(true) },
      { id: 'undo', label: 'Undo (अंतिम क्रिया वापस लें)', group: 'Edit', hint: 'Ctrl+Z', run: undo },
      { id: 'redo', label: 'Redo (पुनः लागू करें)', group: 'Edit', hint: 'Ctrl+Y', run: redo },
      { id: 'pdf', label: 'A4 PDF / प्रिंट करें', group: 'Export', hint: 'Ctrl+P', run: handlePrint },
      { id: 'html', label: 'स्टैंडअलोन HTML ई-बुक डाउनलोड', group: 'Export', run: handleExportHtml },
      { id: 'focus', label: 'Focus Mode (फुलस्क्रीन रीडिंग)', group: 'View', hint: 'F', run: () => setIsFocusMode(prev => !prev) },
      { id: 'theme-mode', label: 'Light / Dark / Auto मोड बदलें', group: 'View', run: handleCycleTheme },
      { id: 'toc-toggle', label: 'विषय-सूची (TOC) चालू / बंद', group: 'Layout', run: () => set('toc.on', !s.toc.on) },
      { id: 'cover-toggle', label: 'कवर पेज चालू / बंद', group: 'Layout', run: () => set('brand.showCover', !s.brand.showCover) },
      { id: 'cols-toggle', label: `कॉलम बदलें (वर्तमान: ${s.layout.columns}-कॉलम)`, group: 'Layout', run: () => set('layout.columns', s.layout.columns === 2 ? 1 : 2) },
      { id: 'autofix', label: '⚡ लेआउट ऑटो-फिट (ओवरफ्लो ठीक करें)', group: 'Layout', run: handleAutoFixOverflow },
    ];
  }, [
    s.toc.on,
    s.brand.showCover,
    s.layout.columns,
    undo,
    redo,
    handlePrint,
    handleExportHtml,
    handleCycleTheme,
    set,
    handleAutoFixOverflow,
    handleOpenBatchModal,
    handleEraseAndCreateNewEbook,
  ]);

  // Overall Statistics
  const stats = useMemo(() => {
    return {
      pages: (s.brand.showCover ? 1 : 0) + (s.toc.on ? 1 : 0) + (layoutPages?.length ?? 0),
      words: countWords(fullBookContent),
      headings: parsedBlocks.filter(b => b.t === 'h1' || b.t === 'h2' || b.t === 'h3').length,
      tables: parsedBlocks.filter(b => b.t === 'table').length,
      overflow: overflowCount,
    };
  }, [layoutPages, fullBookContent, parsedBlocks, overflowCount, s.brand.showCover, s.toc.on]);

  return (
    <div className="print-root flex h-dvh flex-col bg-canvas text-ink">
      {/* Invisible Measurement Stage with exact title bar alignment */}
      <div
        ref={measureContainerRef}
        className="doc measure-stage"
        style={getDocumentStyles(s)}
        {...getDocumentDataAttributes(s)}
        aria-hidden="true"
      >
        <PageView
          s={s}
          no={1}
          section={s.brand.showTitleBar ? (s.title || 'शीर्षक') : ''}
          hf={null}
          columns={Array.from({ length: s.layout.columns }, (_, cIdx) =>
            cIdx === 0 ? (
              <div key="measure-col" ref={measureColRef} className="measure-col">
                {parsedBlocks.map((b, idx) => (
                  <div key={idx} className="blk">
                    <ContentBlockView b={b} />
                  </div>
                ))}
              </div>
            ) : null
          )}
        />
      </div>

      {/* App Header */}
      {!isFocusMode && (
        <Header
          title={s.title}
          chapters={s.chapters}
          activeChapterId={s.activeChapterId}
          onSelectChapter={handleSelectChapter}
          onOpenChapterManager={() => setIsChapterManagerOpen(true)}
          onOpenBatchModal={handleOpenBatchModal}
          onUndo={undo}
          onRedo={redo}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleFocus={() => setIsFocusMode(true)}
          isFocusMode={isFocusMode}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          themeMode={themeMode}
          onCycleTheme={handleCycleTheme}
          onPrint={handlePrint}
          onOpenDiagramStudio={() => setIsDiagramStudioOpen(true)}
        />
      )}

      {/* Main Workspace */}
      <div className="print-root flex min-h-0 flex-1 gap-3 p-3 max-lg:flex-col">
        {/* Sidebar Controls */}
        <aside
          style={{ width: window.innerWidth >= 1024 ? asideWidth : undefined }}
          className={`no-print glass flex min-h-0 flex-col overflow-hidden rounded-2xl shadow-sm max-lg:flex-1 lg:flex-none ${
            mobileView === 'preview' ? 'max-lg:hidden' : ''
          } ${isFocusMode ? '!hidden' : ''}`}
        >
          {/* Tabs Navigation */}
          <div
            role="tablist"
            className="flex flex-none gap-1 overflow-x-auto border-b border-line p-1.5"
            aria-label="Studio Panel Tabs"
          >
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-none items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-brand-soft text-brand font-bold'
                      : 'text-mute hover:text-ink'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Panel */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {activeTab === 'studio' && (
              <StudioPanel
                s={s}
                patch={patch}
                toast={showToast}
                onOpenBatchModal={handleOpenBatchModal}
                onEraseTemplateContent={() => handleEraseAndCreateNewEbook({ keepStyling: true })}
              />
            )}
            {activeTab === 'content' && (
              <ContentEditorPanel
                s={s}
                set={set}
                patch={patch}
                toast={showToast}
                onOpenDiagramStudio={() => setIsDiagramStudioOpen(true)}
                onOpenBatchModal={handleOpenBatchModal}
                onQuickUploadMultipleMd={handleQuickUploadMultipleMd}
                onEraseTemplateContent={() => handleEraseAndCreateNewEbook({ keepStyling: true })}
              />
            )}
            {activeTab === 'diagrams' && (
              <DiagramsPanel
                s={s}
                onInsertDiagram={handleInsertDiagram}
                onOpenFullStudio={() => setIsDiagramStudioOpen(true)}
                toast={showToast}
              />
            )}
            {activeTab === 'theme' && <ThemePanel s={s} set={set} patch={patch} toast={showToast} />}
            {activeTab === 'type' && <TypographyPanel s={s} set={set} />}
            {activeTab === 'layout' && <LayoutPanel s={s} set={set} />}
            {activeTab === 'heads' && <HeadingsPanel s={s} set={set} patch={patch} toast={showToast} />}
            {activeTab === 'hf' && (
              <HeaderFooterPanel
                s={s}
                set={set}
                patch={patch}
                toast={showToast}
                blocks={parsedBlocks}
                layout={layoutPages}
              />
            )}
            {activeTab === 'extras' && <ExtrasPanel s={s} set={set} />}
            {activeTab === 'export' && (
              <ExportPanel
                s={s}
                stats={stats}
                onPrint={handlePrint}
                onExportHtml={handleExportHtml}
                patch={patch}
                toast={showToast}
                onEraseTemplateContent={() => handleEraseAndCreateNewEbook({ keepStyling: true })}
                onOpenBatchModal={handleOpenBatchModal}
              />
            )}
          </div>
        </aside>

        {/* Resizer Handle (Desktop) */}
        <div
          onPointerDown={handleResizePointerDown}
          role="separator"
          aria-orientation="vertical"
          className={`no-print -mx-1.5 hidden w-3 flex-none cursor-col-resize items-center justify-center lg:flex ${
            isFocusMode ? '!hidden' : ''
          }`}
          title="खींचकर चौड़ाई बदलें"
        >
          <span className="h-12 w-1 rounded-full bg-line transition-colors hover:bg-brand" />
        </div>

        {/* Live Document Preview */}
        <main
          className={`print-root flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-canvas/60 ${
            mobileView === 'edit' ? 'max-lg:hidden' : ''
          }`}
        >
          <DocumentPreview
            s={s}
            blocks={parsedBlocks}
            layout={layoutPages}
            onAutoFixOverflow={handleAutoFixOverflow}
            overflowCount={overflowCount}
            previewScope={previewScope}
            onTogglePreviewScope={setPreviewScope}
            chaptersCount={s.chapters.length}
            newPageH1={s.layout.newPageH1}
            onToggleNewPageH1={val => set('layout.newPageH1', val)}
          />
        </main>
      </div>

      {/* Mobile Floating View Switcher */}
      <nav
        className="no-print glass fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1 rounded-full p-1 shadow-float lg:hidden"
        aria-label="Mobile View Switcher"
      >
        <button
          type="button"
          onClick={() => setMobileView('edit')}
          aria-pressed={mobileView === 'edit'}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            mobileView === 'edit'
              ? 'bg-brand text-white shadow-sm'
              : 'text-mute hover:text-ink'
          }`}
        >
          <FileEdit size={13} /> Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          aria-pressed={mobileView === 'preview'}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            mobileView === 'preview'
              ? 'bg-brand text-white shadow-sm'
              : 'text-mute hover:text-ink'
          }`}
        >
          <Eye size={13} /> Preview
        </button>
      </nav>

      {/* Focus Mode Exit Floating Button */}
      {isFocusMode && (
        <button
          type="button"
          onClick={() => setIsFocusMode(false)}
          className="no-print glass fixed right-4 top-4 z-30 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-ink shadow-float"
        >
          <span>Esc · Focus बंद करें</span>
        </button>
      )}

      {/* Modals & Overlays */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />

      <ShortcutsModal
        open={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ChapterManagerModal
        open={isChapterManagerOpen}
        onClose={() => setIsChapterManagerOpen(false)}
        chapters={s.chapters}
        activeChapterId={s.activeChapterId}
        onSelectChapter={handleSelectChapter}
        onAddChapter={handleAddChapter}
        onRenameChapter={handleRenameChapter}
        onDeleteChapter={handleDeleteChapter}
        onReorderChapter={handleReorderChapter}
        onMergeChapters={handleMergeChapters}
        onQuickUploadMultipleMd={handleQuickUploadMultipleMd}
        onOpenBatchModal={handleOpenBatchModal}
        onEraseTemplateContent={() => {
          handleEraseAndCreateNewEbook({ keepStyling: true });
          setIsChapterManagerOpen(false);
        }}
      />

      <BatchMarkdownModal
        open={isBatchModalOpen}
        initialMode={batchModalMode}
        onClose={() => setIsBatchModalOpen(false)}
        s={s}
        onBatchImport={handleBatchImportMarkdown}
        onEraseAndCreateNew={handleEraseAndCreateNewEbook}
      />

      <DiagramStudioModal
        open={isDiagramStudioOpen}
        onClose={() => setIsDiagramStudioOpen(false)}
        onInsertDiagram={handleInsertDiagram}
        s={s}
      />

      <Toast toasts={toasts} />
    </div>
  );
}
