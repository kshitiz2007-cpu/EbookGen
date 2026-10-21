/**
 * Diagrams & Flowcharts Panel in Sidebar
 * Provides quick preview, template library, and 1-click insertion for Mermaid and SVG vectors.
 */

import React, { useState } from 'react';
import { GitFork, PenTool, Plus, Copy, Check, Sparkles, Eye, Info } from 'lucide-react';
import { DIAGRAM_TEMPLATES } from '../../constants/diagramTemplates';
import { MermaidRenderer } from '../renderers/MermaidRenderer';
import { SvgRenderer } from '../renderers/SvgRenderer';
import { SectionTitle } from '../FormControls';
import { EbookSettings } from '../../types/ebook';

interface DiagramsPanelProps {
  s: EbookSettings;
  onInsertDiagram: (code: string) => void;
  onOpenFullStudio: () => void;
  toast: (msg: string, kind?: 'ok' | 'warn') => void;
}

export const DiagramsPanel: React.FC<DiagramsPanelProps> = ({
  s,
  onInsertDiagram,
  onOpenFullStudio,
  toast,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'mermaid' | 'svg'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = DIAGRAM_TEMPLATES.filter(
    t => filterType === 'all' || t.type === filterType
  );

  const handleInsert = (tplCode: string, title: string) => {
    onInsertDiagram(tplCode);
    toast(`"${title}" सक्रिय अध्याय में जोड़ा गया!`);
  };

  const handleCopy = async (tplCode: string, id: string) => {
    try {
      await navigator.clipboard.writeText(tplCode);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast('Markdown कोड कॉपी हुआ!');
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Studio Banner */}
      <div className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-soft/70 via-surface-solid to-raised p-3.5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-brand">
          <Sparkles size={16} />
          <span>डिज़ाइनर रेखाचित्र एवं फ़्लोचार्ट्स</span>
        </div>
        <p className="mt-1 text-[0.72rem] leading-relaxed text-mute">
          Mermaid फ़्लोचार्ट व SVG आरेख A4 पन्नों पर बिना ओवरफ्लो के वेक्टर-शार्प रेंडर होते हैं।
        </p>
        <button
          type="button"
          onClick={onOpenFullStudio}
          className="btn btn-primary mt-3 !min-h-8 w-full text-xs font-bold shadow-sm"
        >
          <GitFork size={14} /> पूर्ण स्क्रीन स्टूडियो खोलें (Full Studio)
        </button>
      </div>

      {/* Filter Tabs */}
      <SectionTitle>टेम्पलेट पुस्तकालय (Template Gallery)</SectionTitle>
      <div className="flex rounded-xl border border-line bg-canvas p-0.5">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`flex-1 rounded-[0.6rem] py-1 text-center text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-raised text-brand shadow-xs'
              : 'text-mute hover:text-ink'
          }`}
        >
          सभी ({DIAGRAM_TEMPLATES.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('mermaid')}
          className={`flex-1 rounded-[0.6rem] py-1 text-center text-xs font-bold transition-all ${
            filterType === 'mermaid'
              ? 'bg-raised text-brand shadow-xs'
              : 'text-mute hover:text-ink'
          }`}
        >
          Mermaid फ़्लोचार्ट
        </button>
        <button
          type="button"
          onClick={() => setFilterType('svg')}
          className={`flex-1 rounded-[0.6rem] py-1 text-center text-xs font-bold transition-all ${
            filterType === 'svg'
              ? 'bg-raised text-brand shadow-xs'
              : 'text-mute hover:text-ink'
          }`}
        >
          SVG वेक्टर
        </button>
      </div>

      {/* Template Cards List */}
      <div className="space-y-3">
        {filtered.map(tpl => {
          // Extract inner chart/svg code
          const codeMatch = tpl.code.match(/```(?:mermaid|svg)(?:\[.*?\])?\s*([\s\S]*?)```/i);
          const innerCode = codeMatch ? codeMatch[1].trim() : tpl.code.trim();

          return (
            <div
              key={tpl.id}
              className="overflow-hidden rounded-2xl border border-line bg-raised p-3 shadow-xs transition-colors hover:border-brand/40"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 border-b border-line/50 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`grid size-6 place-items-center rounded-md text-[0.65rem] font-bold ${
                      tpl.type === 'mermaid'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {tpl.type === 'mermaid' ? 'FLOW' : 'SVG'}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-ink">{tpl.hindiTitle}</div>
                    <div className="text-[0.66rem] text-mute">{tpl.title}</div>
                  </div>
                </div>
              </div>

              {/* Mini Preview */}
              <div className="my-2.5 max-h-48 overflow-y-auto rounded-xl border border-line/40 bg-canvas/60 p-2">
                {tpl.type === 'mermaid' ? (
                  <MermaidRenderer chart={innerCode} />
                ) : (
                  <SvgRenderer svgCode={innerCode} />
                )}
              </div>

              <div className="mb-2.5 text-[0.7rem] text-mute">{tpl.description}</div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleInsert(tpl.code, tpl.hindiTitle)}
                  className="btn btn-primary !min-h-7.5 flex-1 text-xs font-bold"
                  title="वर्तमान अध्याय में जोड़ें"
                >
                  <Plus size={14} /> अध्याय में जोड़ें (Insert)
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(tpl.code, tpl.id)}
                  className="btn !min-h-7.5 !px-2.5 text-xs text-mute hover:text-ink"
                  title="Markdown कोड कॉपी करें"
                >
                  {copiedId === tpl.id ? (
                    <Check size={14} className="text-ok" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
