/**
 * Gyankunj Studio - Header Component
 */

import React from 'react';
import {
  Undo2,
  Redo2,
  Command,
  Maximize2,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  Download,
  Layers,
  GitFork,
  FileStack,
  Eraser,
} from 'lucide-react';
import { Chapter } from '../types/ebook';

interface HeaderProps {
  title: string;
  chapters: Chapter[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onOpenChapterManager: () => void;
  onOpenBatchModal?: (mode: 'import' | 'new-ebook') => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenCommandPalette: () => void;
  onToggleFocus: () => void;
  isFocusMode: boolean;
  onOpenShortcuts: () => void;
  themeMode: 'light' | 'dark' | 'auto';
  onCycleTheme: () => void;
  onPrint: () => void;
  onOpenDiagramStudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  chapters,
  activeChapterId,
  onSelectChapter,
  onOpenChapterManager,
  onOpenBatchModal,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenCommandPalette,
  onToggleFocus,
  isFocusMode,
  onOpenShortcuts,
  themeMode,
  onCycleTheme,
  onPrint,
  onOpenDiagramStudio,
}) => {
  return (
    <header className="no-print glass z-10 m-3 mb-0 flex flex-none items-center justify-between gap-3 rounded-2xl px-4 py-2.5 shadow-sm">
      {/* Brand & Chapter Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9.5 place-items-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 text-lg font-black text-white shadow-md">
            G
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5 text-[0.84rem] font-black tracking-wide text-ink">
              GYANKUNJ <span className="text-amber-500">STUDIO</span>
              <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[0.62rem] font-bold text-brand">v3.0</span>
            </div>
            <div className="hidden text-[0.66rem] font-medium text-mute sm:block">
              ई-बुक व अध्ययन सामग्री डिज़ाइनर
            </div>
          </div>
        </div>

        <div className="hidden h-5 w-px bg-line sm:block" />

        {/* Multi-Chapter Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative">
            <select
              value={activeChapterId}
              onChange={e => onSelectChapter(e.target.value)}
              className="input !h-8.5 !min-h-0 max-w-[160px] truncate pr-7 text-xs font-semibold sm:max-w-[220px]"
              title="सक्रिय अध्याय चुनें"
            >
              {chapters.map((ch, idx) => (
                <option key={ch.id} value={ch.id}>
                  {idx + 1}. {ch.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenChapterManager}
            className="btn !min-h-8.5 !px-2 text-xs"
            title="अध्याय प्रबंधन (Chapters)"
          >
            <Layers size={14} className="text-brand" />
            <span className="hidden md:inline">अध्याय ({chapters.length})</span>
          </button>

          {onOpenBatchModal && (
            <>
              <button
                type="button"
                onClick={() => onOpenBatchModal('import')}
                className="btn !min-h-8.5 !px-2.5 text-xs font-semibold text-brand bg-brand-soft/40 hover:bg-brand-soft"
                title="एक साथ कई .md फ़ाइलें जोड़कर बड़ी ई-बुक बनाएँ (Batch Import Multiple .md Files)"
              >
                <FileStack size={14} className="text-brand" />
                <span className="hidden lg:inline">Multi .MD जोड़ें</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenBatchModal('new-ebook')}
                className="btn !min-h-8.5 !px-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                title="टेम्पलेट सामग्री मिटाएँ और नयी ई-बुक बनाएँ (Erase Template & Create New E-book)"
              >
                <Eraser size={14} />
                <span className="hidden xl:inline">नयी ई-बुक / Erase</span>
              </button>
            </>
          )}

          {onOpenDiagramStudio && (
            <button
              type="button"
              onClick={onOpenDiagramStudio}
              className="btn !min-h-8.5 !px-2.5 text-xs font-semibold text-brand bg-brand-soft/40 hover:bg-brand-soft"
              title="फ्लोचार्ट व रेखाचित्र डिज़ाइनर (Diagram & Flowchart Studio)"
            >
              <GitFork size={14} className="text-brand" />
              <span className="hidden 2xl:inline">रेखाचित्र / Flowcharts</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Action Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="btn !min-h-8.5 !px-2.5"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="btn !min-h-8.5 !px-2.5"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={15} />
        </button>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="btn !min-h-8.5 max-sm:!px-2.5"
          title="कमांड पैलेट (Ctrl+K)"
        >
          <Command size={14} />
          <span className="hidden sm:inline">Commands</span>
          <span className="kbd hidden lg:inline">Ctrl K</span>
        </button>

        <button
          type="button"
          onClick={onToggleFocus}
          className="btn !min-h-8.5 !px-2.5"
          title={isFocusMode ? 'Focus मोड से बाहर निकलें (F)' : 'Focus Mode (F)'}
        >
          <Maximize2 size={15} />
        </button>

        <button
          type="button"
          onClick={onOpenShortcuts}
          className="btn !min-h-8.5 !px-2.5"
          title="शॉर्टकट सूची (?)"
        >
          <HelpCircle size={15} />
        </button>

        <button
          type="button"
          onClick={onCycleTheme}
          className="btn !min-h-8.5 !px-2.5"
          title={`थीम: ${themeMode}`}
        >
          {themeMode === 'dark' ? (
            <Moon size={15} className="text-amber-400" />
          ) : themeMode === 'light' ? (
            <Sun size={15} className="text-amber-500" />
          ) : (
            <Laptop size={15} />
          )}
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="btn btn-primary !min-h-8.5 !px-3 font-bold"
          title="प्रिंट अथवा PDF सेव करें (A4)"
        >
          <Download size={15} />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>
    </header>
  );
};
