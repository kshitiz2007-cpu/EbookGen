/**
 * Document Preview with Zoom, Page Navigator, Two-Page Spread, and Auto-Fix Overflow
 */

import React, { useRef, useState, useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns,
  BookOpen,
  AlertTriangle,
  Wand2,
  Layers,
} from 'lucide-react';
import { Block, ChunkedBlockRef, EbookSettings, PageLayout } from '../types/ebook';
import {
  getDocumentStyles,
  getDocumentDataAttributes,
  CoverPage,
  PageView,
  ContentBlockView,
  InlineMarkdown,
} from './PageRenderer';

const A4_WIDTH_PX = 794; // 210mm in standard 96dpi screen px
const PAGE_GAP = 28;

interface DocumentPreviewProps {
  s: EbookSettings;
  blocks: Block[];
  layout: PageLayout[] | null;
  onAutoFixOverflow: () => void;
  overflowCount: number;
  previewScope?: 'full' | 'chapter';
  onTogglePreviewScope?: (scope: 'full' | 'chapter') => void;
  chaptersCount?: number;
  newPageH1?: boolean;
  onToggleNewPageH1?: (val: boolean) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  s,
  blocks,
  layout,
  onAutoFixOverflow,
  overflowCount,
  previewScope = 'full',
  onTogglePreviewScope,
  chaptersCount,
  newPageH1,
  onToggleNewPageH1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitMode, setFitMode] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(0.85);
  const [viewMode, setViewMode] = useState<'single' | 'spread'>('single');
  const [containerWidth, setContainerWidth] = useState<number>(900);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const cols = viewMode === 'spread' ? 2 : 1;
  const fitZoom = Math.max(0.25, Math.min(1.5, (containerWidth - 56 - PAGE_GAP * (cols - 1)) / (A4_WIDTH_PX * cols)));
  const currentZoom = fitMode ? fitZoom : zoom;

  const effectiveHf = s.hf.live ? s.hf : s.hfApplied;

  const hasToc = s.toc.on;
  const pageOffset = (s.brand.showCover ? 1 : 0) + (hasToc ? 1 : 0);

  // Build Table of Contents entries with authentic page numbers
  const tocEntries = useMemo(() => {
    const entries: { text: string; level: number; page: number }[] = [];
    layout?.forEach((page, pIdx) => {
      page.columns.forEach(col => {
        col.forEach(ref => {
          const b = blocks[ref.i];
          if (b && !ref.r0) {
            if (b.t === 'h1' || (b.t === 'h2' && s.toc.depth === 2)) {
              entries.push({
                text: b.text,
                level: b.t === 'h1' ? 1 : 2,
                page: pIdx + 1 + pageOffset,
              });
            }
          }
        });
      });
    });
    return entries;
  }, [layout, blocks, s.toc.depth, pageOffset]);

  const totalPages = pageOffset + (layout?.length ?? 0);

  // Scroll spy to detect active page
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const center = el.getBoundingClientRect().top + el.clientHeight * 0.35;
    let closestIndex = 0;
    let minDiff = Infinity;

    el.querySelectorAll<HTMLElement>('[data-pg]').forEach((pageEl, idx) => {
      const rect = pageEl.getBoundingClientRect();
      const diff = Math.abs(rect.top + rect.height / 2 - center);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setActivePageIndex(closestIndex);
  }, []);

  const scrollToPage = (idx: number) => {
    const target = Math.max(0, Math.min(totalPages - 1, idx));
    const pageEl = containerRef.current?.querySelectorAll('[data-pg]')[target];
    pageEl?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
      inline: 'center',
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        scrollToPage(activePageIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        scrollToPage(activePageIndex - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePageIndex, totalPages]);

  // Render Page Nodes
  const renderColumnContent = (col: ChunkedBlockRef[]) => (
    <div>
      {col.map((ref, idx) => {
        const b = blocks[ref.i];
        if (!b) return null;
        return (
          <div key={idx} className="blk">
            <ContentBlockView b={b} r0={ref.r0} r1={ref.r1} subText={ref.subText} />
          </div>
        );
      })}
    </div>
  );

  const pagesList: React.ReactNode[] = [];

  // 1. Cover
  if (s.brand.showCover) {
    pagesList.push(<CoverPage key="cover" s={s} />);
  }

  // 2. Table of Contents
  if (hasToc) {
    const colsCount = s.layout.columns;
    const chunkSize = Math.ceil(tocEntries.length / colsCount);
    const tocCols = Array.from({ length: colsCount }, (_, cIdx) => (
      <React.Fragment key={cIdx}>
        {cIdx === 0 && <div className="toc-title">{s.toc.title}</div>}
        <div className="toc">
          {tocEntries.slice(cIdx * chunkSize, (cIdx + 1) * chunkSize).map((entry, eIdx) => (
            <div key={eIdx} className="toc-row" data-l={entry.level}>
              <span className="toc-text"><InlineMarkdown text={entry.text} /></span>
              <i className="toc-dots" aria-hidden="true" />
              <b className="toc-no">{entry.page}</b>
            </div>
          ))}
        </div>
      </React.Fragment>
    ));

    pagesList.push(
      <PageView
        key="toc"
        s={s}
        no={0}
        label="सूची"
        section={s.toc.title}
        hf={effectiveHf}
        extra="toc-page"
        columns={tocCols}
      />
    );
  }

  // 3. Document Content Pages
  layout?.forEach((page, pIdx) => {
    pagesList.push(
      <PageView
        key={pIdx}
        s={s}
        no={pIdx + 1 + pageOffset}
        section={page.section}
        hf={effectiveHf}
        columns={page.columns.map(renderColumnContent)}
      />
    );
  });

  return (
    <div className="print-root flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Interactive Toolbar */}
      <div
        className="no-print glass mx-3 mt-3 flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2 shadow-sm"
        role="toolbar"
        aria-label="Preview tools"
      >
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn !min-h-8 !px-2"
            onClick={() => scrollToPage(activePageIndex - 1)}
            disabled={activePageIndex <= 0}
            title="पिछला पेज (Left Arrow)"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-20 text-center text-xs font-bold tabular-nums">
            पेज {Math.min(activePageIndex + 1, totalPages)} / {totalPages}
          </span>
          <button
            type="button"
            className="btn !min-h-8 !px-2"
            onClick={() => scrollToPage(activePageIndex + 1)}
            disabled={activePageIndex >= totalPages - 1}
            title="अगला पेज (Right Arrow)"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="btn !min-h-8 !px-2"
            onClick={() => {
              setFitMode(false);
              setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(2)));
            }}
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <input
            type="range"
            min={0.3}
            max={1.6}
            step={0.05}
            value={currentZoom}
            onChange={e => {
              setFitMode(false);
              setZoom(Number(e.target.value));
            }}
            className="w-20 sm:w-28"
            aria-label="Zoom Level"
          />
          <button
            type="button"
            className="btn !min-h-8 !px-2"
            onClick={() => {
              setFitMode(false);
              setZoom(z => Math.min(1.6, +(z + 0.1).toFixed(2)));
            }}
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <span className="w-11 text-xs font-semibold tabular-nums text-mute">
            {Math.round(currentZoom * 100)}%
          </span>
          <button
            type="button"
            className="btn !min-h-8 !px-2.5"
            aria-pressed={fitMode}
            onClick={() => setFitMode(true)}
            title="स्क्रीन पर फिट करें"
          >
            <Maximize2 size={13} className="mr-1 inline" /> Fit
          </button>
        </div>

        {/* Single / Spread View Toggle & Scope Switcher */}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {overflowCount > 0 && (
            <button
              type="button"
              onClick={onAutoFixOverflow}
              className="btn !min-h-8 !border-warn !bg-amber-500/10 !text-warn text-xs font-bold"
              title="ऑटो-एडजस्ट: फ़ॉन्ट और मार्जिन थोड़ा कम करके ओवरफ्लो समाप्त करें"
            >
              <Wand2 size={14} className="animate-spin text-warn" />
              <span>Auto-Fit ({overflowCount} Overflow)</span>
            </button>
          )}

          {/* Scope: Full E-book vs Active Chapter */}
          {onTogglePreviewScope && (
            <div className="flex rounded-xl border border-line bg-canvas p-0.5" role="radiogroup" aria-label="पूर्वावलोकन दायरा">
              <button
                type="button"
                role="radio"
                aria-checked={previewScope === 'full'}
                onClick={() => onTogglePreviewScope('full')}
                className="flex items-center gap-1 rounded-[0.6rem] px-2.5 py-1 text-xs font-semibold text-mute aria-checked:bg-raised aria-checked:text-brand aria-checked:shadow-sm"
                title="संपूर्ण ई-बुक देखें (सभी अध्याय)"
              >
                <Layers size={13} />
                <span className="hidden sm:inline">पूरी ई-बुक ({chaptersCount || s.chapters.length} अध्याय)</span>
                <span className="sm:hidden">पूरी ई-बुक</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={previewScope === 'chapter'}
                onClick={() => onTogglePreviewScope('chapter')}
                className="flex items-center gap-1 rounded-[0.6rem] px-2.5 py-1 text-xs font-semibold text-mute aria-checked:bg-raised aria-checked:text-brand aria-checked:shadow-sm"
                title="केवल सक्रिय अध्याय देखें"
              >
                <BookOpen size={13} />
                <span className="hidden sm:inline">सक्रिय अध्याय</span>
                <span className="sm:hidden">अध्याय</span>
              </button>
            </div>
          )}

          {/* Chapter Flow Toggle: Continuous vs New Page per Chapter */}
          {onToggleNewPageH1 && previewScope === 'full' && (
            <div className="flex rounded-xl border border-line bg-canvas p-0.5" role="radiogroup" aria-label="अध्याय प्रवाह शैली">
              <button
                type="button"
                role="radio"
                aria-checked={!newPageH1}
                onClick={() => onToggleNewPageH1(false)}
                className="flex items-center gap-1 rounded-[0.6rem] px-2.5 py-1 text-xs font-semibold text-mute aria-checked:bg-raised aria-checked:text-brand aria-checked:shadow-sm"
                title="सतत प्रवाह (Continuous): अध्याय बिना किसी खाली जगह के सघन रूप से बहेंगे"
              >
                <span>सतत (Continuous)</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!!newPageH1}
                onClick={() => onToggleNewPageH1(true)}
                className="flex items-center gap-1 rounded-[0.6rem] px-2.5 py-1 text-xs font-semibold text-mute aria-checked:bg-raised aria-checked:text-brand aria-checked:shadow-sm"
                title="नया पृष्ठ (New Page): प्रत्येक अध्याय नए पृष्ठ से आरंभ होगा"
              >
                <span>नया पृष्ठ (New Page)</span>
              </button>
            </div>
          )}

          <div className="flex rounded-xl border border-line bg-canvas p-0.5" role="radiogroup" aria-label="View mode">
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'single'}
              onClick={() => setViewMode('single')}
              className="flex items-center gap-1 rounded-[0.6rem] px-2.5 py-1 text-xs font-semibold text-mute aria-checked:bg-raised aria-checked:text-brand aria-checked:shadow-sm"
              title="एकल पेज देखें"
            >
              <BookOpen size={13} />
              <span className="hidden sm:inline">Single</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'spread'}
              onClick={() => setViewMode('spread')}
              className="flex items-center gap-1 rounded-[0.6rem] px-2.5 py-1 text-xs font-semibold text-mute aria-checked:bg-raised aria-checked:text-brand aria-checked:shadow-sm"
              title="दो पेज साथ देखें (Book Spread)"
            >
              <Columns size={13} />
              <span className="hidden sm:inline">Spread</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pages Workspace Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="workspace-bg min-h-0 flex-1 overflow-auto scroll-smooth"
        tabIndex={0}
        aria-label="Document pages viewer"
      >
        <div
          className="zoom-wrap doc mx-auto flex w-max flex-wrap justify-center p-6"
          style={{
            ...getDocumentStyles(s),
            zoom: currentZoom,
            gap: PAGE_GAP,
            maxWidth: (viewMode === 'spread' ? A4_WIDTH_PX * 2 + PAGE_GAP : A4_WIDTH_PX) + 48,
          }}
          {...getDocumentDataAttributes(s)}
        >
          {layout ? (
            pagesList.map((pageEl, pIdx) => (
              <div key={pIdx} data-pg={pIdx} className="flex-none animate-slide-up scroll-mt-4">
                {pageEl}
              </div>
            ))
          ) : (
            <div className="grid h-96 w-full place-items-center text-sm text-mute">
              पेज तैयार किए जा रहे हैं...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
