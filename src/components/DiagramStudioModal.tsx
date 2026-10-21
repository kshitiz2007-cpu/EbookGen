/**
 * Interactive Diagram & Flowchart Studio Modal
 * Allows visual creation, template selection, live previewing, and 1-click insertion
 * of modern Mermaid flowcharts and designer SVG vectors into notes.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Copy,
  Check,
  Sparkles,
  GitFork,
  PenTool,
  BookOpen,
  Eye,
  Code,
  Layers,
  ArrowRight,
  Palette,
  Info,
} from 'lucide-react';
import { DIAGRAM_TEMPLATES, DiagramTemplate } from '../constants/diagramTemplates';
import { MermaidRenderer } from './renderers/MermaidRenderer';
import { SvgRenderer } from './renderers/SvgRenderer';
import { EbookSettings } from '../types/ebook';

interface DiagramStudioModalProps {
  open: boolean;
  onClose: () => void;
  onInsertDiagram: (markdownCode: string) => void;
  s: EbookSettings;
}

export const DiagramStudioModal: React.FC<DiagramStudioModalProps> = ({
  open,
  onClose,
  onInsertDiagram,
  s,
}) => {
  const [activeTab, setActiveTab] = useState<'mermaid' | 'svg'>('mermaid');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DIAGRAM_TEMPLATES[0].id);
  const [customCode, setCustomCode] = useState<string>('');
  const [diagramTitle, setDiagramTitle] = useState<string>('');
  const [diagramCaption, setDiagramCaption] = useState<string>('');
  const [align, setAlign] = useState<'center' | 'left' | 'right'>('center');
  const [copied, setCopied] = useState(false);

  // Filter templates by current tab
  const tabTemplates = useMemo(() => {
    return DIAGRAM_TEMPLATES.filter(tpl => tpl.type === activeTab);
  }, [activeTab]);

  // Selected template
  const currentTemplate = useMemo(() => {
    return DIAGRAM_TEMPLATES.find(t => t.id === selectedTemplateId) || tabTemplates[0];
  }, [selectedTemplateId, tabTemplates]);

  // When switching tabs or templates
  const handleSelectTemplate = (tpl: DiagramTemplate) => {
    setSelectedTemplateId(tpl.id);
    // Extract code inside ``` or use as is
    const codeMatch = tpl.code.match(/```(?:mermaid|svg)(?:\[.*?\])?\s*([\s\S]*?)```/i);
    const innerCode = codeMatch ? codeMatch[1].trim() : tpl.code.trim();
    setCustomCode(innerCode);

    // Extract title if present in snippet
    const titleMatch = tpl.code.match(/(?:title|शीर्षक)\s*:\s*([^|,\]]+)/i);
    const captionMatch = tpl.code.match(/(?:caption|विवरण)\s*:\s*([^|,\]]+)/i);
    setDiagramTitle(titleMatch ? titleMatch[1].trim() : tpl.hindiTitle);
    setDiagramCaption(captionMatch ? captionMatch[1].trim() : tpl.title);
  };

  // Sync template on tab change
  const handleTabChange = (tab: 'mermaid' | 'svg') => {
    setActiveTab(tab);
    const firstOfTab = DIAGRAM_TEMPLATES.find(t => t.type === tab);
    if (firstOfTab) {
      handleSelectTemplate(firstOfTab);
    }
  };

  // Construct Markdown for insertion
  const generateMarkdown = (): string => {
    const metaParts: string[] = [];
    if (diagramTitle.trim()) metaParts.push(`शीर्षक: ${diagramTitle.trim()}`);
    if (diagramCaption.trim()) metaParts.push(`विवरण: ${diagramCaption.trim()}`);
    if (align !== 'center') metaParts.push(`संरेखण: ${align}`);

    const metaStr = metaParts.length > 0 ? ` [${metaParts.join(' | ')}]` : '';
    const code = customCode.trim() || (currentTemplate ? currentTemplate.code : '');

    return `\n\`\`\`${activeTab}${metaStr}\n${code}\n\`\`\`\n`;
  };

  const handleInsert = () => {
    const md = generateMarkdown();
    onInsertDiagram(md);
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-5">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-surface-solid shadow-float">
        {/* Modal Top Header */}
        <div className="flex flex-none items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-indigo-600 text-white">
              <GitFork size={17} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink sm:text-base">
                डिज़ाइनर रेखाचित्र एवं फ़्लोचार्ट स्टूडियो (Diagram & Flowchart Studio)
              </h2>
              <p className="text-[0.68rem] text-mute">
                Mermaid फ़्लोचार्ट व आधुनिक SVG वेक्टर आरेख बनाएँ और एक क्लिक में नोट्स में जोड़ें।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn !min-h-8 !px-2"
            title="बंद करें (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher & Template Pill Bar */}
        <div className="flex flex-none flex-wrap items-center justify-between gap-2 border-b border-line bg-canvas/40 px-5 py-2">
          {/* Main Format Tabs */}
          <div className="flex rounded-xl border border-line bg-canvas p-0.5">
            <button
              type="button"
              onClick={() => handleTabChange('mermaid')}
              className={`flex items-center gap-1.5 rounded-[0.6rem] px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'mermaid'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-mute hover:text-ink'
              }`}
            >
              <GitFork size={13} />
              <span>Mermaid फ़्लोचार्ट</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('svg')}
              className={`flex items-center gap-1.5 rounded-[0.6rem] px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'svg'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-mute hover:text-ink'
              }`}
            >
              <PenTool size={13} />
              <span>SVG वेक्टर आरेख</span>
            </button>
          </div>

          {/* Quick Info Badge */}
          <div className="hidden items-center gap-1.5 text-[0.7rem] text-mute md:flex">
            <Info size={13} className="text-brand" />
            <span>
              {activeTab === 'mermaid'
                ? 'फ्लोचार्ट, टाइमलाइन, माइंडमैप एवं निर्णय प्रक्रिया'
                : 'कलर-थीमयुक्त 3-चरणीय प्रक्रिया, चक्र, वेन डायग्राम व सोपान'}
            </span>
          </div>
        </div>

        {/* Main 2-Column Studio Workspace */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
          {/* Left Column: Template Library & Code Editor (5 cols) */}
          <div className="flex min-h-0 flex-col border-b border-line p-4 lg:col-span-5 lg:border-b-0 lg:border-r">
            {/* Template Selector Cards */}
            <div className="mb-3">
              <label className="field-label mb-1.5">
                <span>पुस्तकालय से टेम्पलेट चुनें (Templates)</span>
                <span className="text-[0.65rem] font-bold text-brand">
                  {tabTemplates.length} उपलब्ध
                </span>
              </label>
              <div className="grid max-h-36 grid-cols-1 gap-1.5 overflow-y-auto pr-1">
                {tabTemplates.map(tpl => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`flex items-start justify-between gap-2 rounded-xl border p-2 text-left transition-colors ${
                        isSelected
                          ? 'border-brand bg-brand-soft/50 shadow-xs'
                          : 'border-line bg-raised hover:border-brand/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold text-ink">
                          {tpl.hindiTitle}
                        </div>
                        <div className="truncate text-[0.68rem] text-mute">
                          {tpl.description}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={14} className="mt-0.5 flex-none text-brand" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diagram Title & Caption Inputs */}
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="field-label">आरेख शीर्षक (Title)</label>
                <input
                  type="text"
                  value={diagramTitle}
                  onChange={e => setDiagramTitle(e.target.value)}
                  placeholder="उदा. विधि निर्माण प्रक्रिया"
                  className="input !min-h-8 text-xs"
                />
              </div>
              <div>
                <label className="field-label">विवरण (Caption / Note)</label>
                <input
                  type="text"
                  value={diagramCaption}
                  onChange={e => setDiagramCaption(e.target.value)}
                  placeholder="उदा. अनुच्छेद 108 के तहत"
                  className="input !min-h-8 text-xs"
                />
              </div>
            </div>

            {/* Live Code Editor */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-1 flex items-center justify-between">
                <label className="field-label !mb-0">
                  <span className="flex items-center gap-1 font-mono text-[0.72rem]">
                    <Code size={13} /> {activeTab.toUpperCase()} कोड सम्पादक
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn !min-h-6 !px-2 text-[0.66rem]"
                  title="Markdown कोड कॉपी करें"
                >
                  {copied ? (
                    <>
                      <Check size={11} className="text-ok" /> कॉपी हुआ
                    </>
                  ) : (
                    <>
                      <Copy size={11} /> कोड कॉपी
                    </>
                  )}
                </button>
              </div>
              <textarea
                spellCheck={false}
                value={customCode}
                onChange={e => setCustomCode(e.target.value)}
                className="input min-h-[140px] flex-1 resize-none font-mono text-xs leading-relaxed"
                placeholder={
                  activeTab === 'mermaid'
                    ? 'graph TD\n  A[आरंभ] --> B[प्रक्रिया]\n  B --> C[समाप्त]'
                    : '<svg viewBox="0 0 400 120">\n  ...\n</svg>'
                }
              />
            </div>
          </div>

          {/* Right Column: High-Fidelity Live Document Preview (7 cols) */}
          <div className="flex min-h-0 flex-col bg-canvas/30 p-4 lg:col-span-7">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Eye size={15} className="text-brand" />
                <span>लाइव दस्तावेज़ पूर्वावलोकन (Live Note Preview)</span>
              </div>
              <div className="text-[0.68rem] text-mute">
                दस्तावेज़ की वर्तमान थीम ({s.theme.key}) के साथ रेंडर
              </div>
            </div>

            {/* Interactive Preview Container */}
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto rounded-2xl border border-dashed border-line bg-surface-solid p-4">
              <div className="w-full max-w-lg">
                {activeTab === 'mermaid' ? (
                  <MermaidRenderer
                    chart={customCode.trim() || 'graph TD\n  A[आरंभ] --> B[लक्ष्य]'}
                    title={diagramTitle}
                    caption={diagramCaption}
                    align={align}
                  />
                ) : (
                  <SvgRenderer
                    svgCode={
                      customCode.trim() ||
                      '<svg viewBox="0 0 200 60"><rect width="200" height="60" rx="8" fill="#0c2d49"/><text x="100" y="35" fill="#fff" text-anchor="middle">SVG आरेख</text></svg>'
                    }
                    title={diagramTitle}
                    caption={diagramCaption}
                    align={align}
                  />
                )}
              </div>
            </div>

            {/* Quick Presets Guidance */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.68rem] text-mute">
              <div>
                💡 <b>संकेत:</b> यह आरेख A4 पन्नों पर वेक्टर-शार्प रेंडर होगा तथा PDF निर्यात में बिल्कुल साफ दिखेगा।
              </div>
              <div className="flex items-center gap-1">
                <span>संरेखण:</span>
                {(['center', 'left', 'right'] as const).map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAlign(a)}
                    className={`rounded px-1.5 py-0.5 capitalize ${
                      align === a ? 'bg-brand text-white font-bold' : 'bg-line/40 hover:bg-line'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="flex flex-none items-center justify-between border-t border-line bg-canvas/40 px-5 py-3">
          <div className="text-xs text-mute">
            दस्तावेज़ में जोड़ने पर यह सक्रिय अध्याय के अंत में प्रविष्ट होगा।
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn">
              रद्द करें
            </button>
            <button
              type="button"
              onClick={handleInsert}
              className="btn btn-primary !px-4 font-bold shadow-md"
            >
              <Plus size={16} />
              <span>अध्याय में आरेख जोड़ें (Insert Diagram)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
