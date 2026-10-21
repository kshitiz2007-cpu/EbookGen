/**
 * Mermaid Diagram Renderer with Gyankunj Theme Integration
 * Renders flowcharts, sequence diagrams, mindmaps, state diagrams, timelines, etc.
 */

import React, { useEffect, useState, useRef, useId } from 'react';
import mermaid from 'mermaid';
import { AlertTriangle, Copy, Check, Maximize2 } from 'lucide-react';

interface MermaidRendererProps {
  chart: string;
  title?: string;
  caption?: string;
  align?: 'center' | 'left' | 'right';
  className?: string;
}

// Track mermaid initialization
let isMermaidInitialized = false;

function initMermaid() {
  if (!isMermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      fontFamily: '"Inter", "Noto Sans Devanagari", system-ui, sans-serif',
      theme: 'default',
      themeVariables: {
        primaryColor: '#0c2d49',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#c39a48',
        lineColor: '#1d5f80',
        secondaryColor: '#f1f5f9',
        tertiaryColor: '#fffefa',
        background: 'transparent',
        nodeBorder: '#c39a48',
        mainBkg: '#f8fafc',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 12,
        nodeSpacing: 35,
        rankSpacing: 40,
      },
    });
    isMermaidInitialized = true;
  }
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({
  chart,
  title,
  caption,
  align = 'center',
  className = '',
}) => {
  const rawId = useId();
  const containerId = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMermaid();
    let isCancelled = false;

    if (!chart.trim()) {
      setSvgHtml('');
      setError(null);
      return;
    }

    const renderChart = async () => {
      try {
        const uniqueId = `mermaid-render-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, chart.trim());
        if (!isCancelled) {
          // Ensure svg is responsive and contained
          const responsiveSvg = svg
            .replace(/<svg\s+([^>]+)>/i, (_match, attrs) => {
              // Ensure width is 100% and height auto if viewBox is present
              let newAttrs = attrs;
              if (!/viewBox/i.test(newAttrs)) {
                const wMatch = newAttrs.match(/width="([0-9.]+)(?:px)?"/i);
                const hMatch = newAttrs.match(/height="([0-9.]+)(?:px)?"/i);
                if (wMatch && hMatch) {
                  newAttrs += ` viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`;
                }
              }
              newAttrs = newAttrs.replace(/width="[^"]*"/i, 'width="100%"');
              newAttrs = newAttrs.replace(/height="[^"]*"/i, 'height="auto"');
              newAttrs = newAttrs.replace(/style="[^"]*"/i, 'style="max-width:100%;height:auto;display:block;"');
              return `<svg ${newAttrs}>`;
            });

          setSvgHtml(responsiveSvg);
          setError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Mermaid render error:', err);
          setError(err?.message || 'Syntax error in flowchart');
          setSvgHtml('');
        }
      }
    };

    renderChart();

    return () => {
      isCancelled = true;
    };
  }, [chart]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={`diagram-block mermaid-block my-2 overflow-hidden rounded-xl border border-line/60 bg-surface-solid/80 p-3 shadow-xs print:border-none print:bg-transparent print:p-1 ${className}`}
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      {/* Title */}
      {title && (
        <div className="diagram-title mb-2 flex items-center justify-between border-b border-line/40 pb-1.5 text-xs font-bold text-brand">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-brand" />
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="no-print btn !min-h-6 !px-1.5 text-[0.65rem] text-mute hover:text-brand"
            title="Copy Mermaid Code"
          >
            {copied ? <Check size={11} className="text-ok" /> : <Copy size={11} />}
          </button>
        </div>
      )}

      {/* Rendered SVG or Error */}
      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-warn/30 bg-amber-500/10 p-2.5 text-left text-xs text-warn">
          <AlertTriangle size={15} className="mt-0.5 flex-none" />
          <div className="min-w-0 flex-1">
            <div className="font-bold">फ़्लोचार्ट सिंटैक्स त्रुटि (Mermaid)</div>
            <div className="mt-0.5 font-mono text-[0.68rem] opacity-90">{error}</div>
          </div>
        </div>
      ) : svgHtml ? (
        <div
          className={`diagram-svg-container relative mx-auto flex w-full justify-center overflow-x-auto ${alignClass}`}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      ) : (
        <div className="py-4 text-center text-xs text-mute">आरेख रेंडर हो रहा है...</div>
      )}

      {/* Caption */}
      {caption && (
        <div className="diagram-caption mt-2 text-center text-[0.7rem] italic text-mute">
          चित्र: {caption}
        </div>
      )}
    </div>
  );
};
