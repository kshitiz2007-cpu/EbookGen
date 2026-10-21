/**
 * Multi-Chapter Book Manager Modal
 */

import React, { useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  FileText,
  Layers,
  Upload,
  Eraser,
  FileStack,
} from 'lucide-react';
import { Chapter } from '../types/ebook';
import { countWords } from '../utils/markdownParser';

interface ChapterManagerModalProps {
  open: boolean;
  onClose: () => void;
  chapters: Chapter[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onAddChapter: (title: string) => void;
  onRenameChapter: (id: string, newTitle: string) => void;
  onDeleteChapter: (id: string) => void;
  onReorderChapter: (id: string, direction: 'up' | 'down') => void;
  onMergeChapters: () => void;
  onQuickUploadMultipleMd?: (files: FileList, mode: 'append' | 'replace') => void;
  onOpenBatchModal?: (mode: 'import' | 'new-ebook') => void;
  onEraseTemplateContent?: () => void;
}

export const ChapterManagerModal: React.FC<ChapterManagerModalProps> = ({
  open,
  onClose,
  chapters,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  onRenameChapter,
  onDeleteChapter,
  onReorderChapter,
  onMergeChapters,
  onQuickUploadMultipleMd,
  onOpenBatchModal,
  onEraseTemplateContent,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const multiMdInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<'append' | 'replace'>('append');

  if (!open) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddChapter(newTitle.trim());
    setNewTitle('');
  };

  const startEdit = (ch: Chapter) => {
    setEditingId(ch.id);
    setEditTitle(ch.title);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRenameChapter(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface-solid shadow-float">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Layers className="text-brand" size={20} />
            <h2 className="text-base font-bold text-ink">अध्याय प्रबंधन (Book Chapters)</h2>
          </div>
          <button type="button" onClick={onClose} className="btn !min-h-8 !px-2" title="बंद करें">
            <X size={16} />
          </button>
        </div>

        {/* Content List */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {/* Quick Multi-MD & Erase Template Action Bar */}
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-raised p-2.5">
            <button
              type="button"
              onClick={() => {
                setUploadMode('append');
                multiMdInputRef.current?.click();
              }}
              className="btn !min-h-8 text-xs font-semibold text-brand"
              title="एक साथ कई .md फ़ाइलें नए अध्यायों के रूप में जोड़ें"
            >
              <Upload size={14} /> Multiple .md फ़ाइलें जोड़ें
            </button>

            <button
              type="button"
              onClick={() => {
                setUploadMode('replace');
                multiMdInputRef.current?.click();
              }}
              className="btn !min-h-8 text-xs font-semibold"
              title="पुराने अध्याय हटाकर कई .md फ़ाइलों से नयी बड़ी ई-बुक बनाएँ"
            >
              <FileStack size={14} /> .md फ़ाइलों से नयी ई-बुक बनाएँ
            </button>

            {onEraseTemplateContent && (
              <button
                type="button"
                onClick={onEraseTemplateContent}
                className="btn !min-h-8 text-xs font-semibold text-warn hover:border-warn"
                title="सभी सैंपल/टेम्पलेट अध्याय मिटाकर खाली ई-बुक शुरू करें"
              >
                <Eraser size={14} /> टेम्पलेट मिटाएँ (Blank Book)
              </button>
            )}

            <input
              ref={multiMdInputRef}
              type="file"
              accept=".md,.markdown,.txt,text/markdown,text/plain"
              multiple
              hidden
              onChange={e => {
                if (e.target.files && e.target.files.length > 0 && onQuickUploadMultipleMd) {
                  onQuickUploadMultipleMd(e.target.files, uploadMode);
                }
                e.target.value = '';
              }}
            />
          </div>

          <p className="mb-3 text-xs text-mute">
            अपनी ई-बुक को कई अध्यायों में विभाजित करें। सभी अध्याय एक साथ सतत (continuous) पेज नंबरिंग और एकसमान स्टाइलिंग के साथ छपेंगे।
          </p>

          <div className="space-y-2">
            {chapters.map((ch, idx) => {
              const isEditing = editingId === ch.id;
              const words = countWords(ch.source);
              const isActive = ch.id === activeChapterId;

              return (
                <div
                  key={ch.id}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 transition-colors ${
                    isActive
                      ? 'border-brand bg-brand-soft/50'
                      : 'border-line bg-raised hover:border-brand/40'
                  }`}
                >
                  <span className="flex size-6 flex-none items-center justify-center rounded-lg bg-canvas text-xs font-bold text-mute">
                    {idx + 1}
                  </span>

                  {isEditing ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="input !min-h-8 flex-1 text-xs"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(ch.id)}
                        className="btn !min-h-8 !px-2.5 text-ok"
                        title="सुरक्षित करें"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex min-w-0 flex-1 cursor-pointer flex-col"
                      onClick={() => onSelectChapter(ch.id)}
                    >
                      <div className="truncate text-xs font-bold text-ink">{ch.title}</div>
                      <div className="flex items-center gap-2 text-[0.68rem] text-mute">
                        <FileText size={11} />
                        <span>{words} शब्द</span>
                        {isActive && <span className="font-semibold text-brand">· सक्रिय अध्याय</span>}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onReorderChapter(ch.id, 'up')}
                      disabled={idx === 0}
                      className="btn !min-h-7 !px-1.5"
                      title="ऊपर ले जाएँ"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorderChapter(ch.id, 'down')}
                      disabled={idx === chapters.length - 1}
                      className="btn !min-h-7 !px-1.5"
                      title="नीचे ले जाएँ"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(ch)}
                      className="btn !min-h-7 !px-1.5"
                      title="नाम बदलें"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteChapter(ch.id)}
                      disabled={chapters.length <= 1}
                      className="btn !min-h-7 !px-1.5 text-warn hover:border-warn"
                      title="हटाएँ"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Chapter */}
          <form onSubmit={handleAdd} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="नया अध्याय शीर्षक लिखें..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="input text-xs"
            />
            <button type="submit" className="btn btn-primary flex-none">
              <Plus size={15} /> जोड़ें
            </button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMergeChapters}
              className="btn text-xs text-mute"
              title="सभी अध्यायों को एक ही फ़ाइल में मिलाएँ"
            >
              सभी अध्याय एक में मिलाएँ (Merge All)
            </button>
            {onOpenBatchModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBatchModal('import');
                }}
                className="btn text-xs text-brand"
              >
                <FileStack size={13} /> एडवांस्ड बल्क .MD बिल्डर
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} className="btn btn-primary">
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
