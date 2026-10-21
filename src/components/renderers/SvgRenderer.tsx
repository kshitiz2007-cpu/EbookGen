/**
 * SVG Vector Diagram Renderer
 * Renders modern, responsive, designer SVGs with theme palette integration.
 */

import React, { useMemo, useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

interface SvgRendererProps {
  svgCode: string;
  title?: string;
  caption?: string;
  align?: 'center' | 'left' | 'right';
  width?: string;
  className?: string;
}

export const SvgRenderer: React.FC<SvgRendererProps> = ({
  svgCode,
  title,
  caption,
  align = 'center',
  width,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // Clean and make SVG responsive
  const processedSvg = useMemo(() => {
    let raw = svgCode.trim();
    if (!raw.startsWith('<svg')) {
      const match = raw.match(/<svg[\s\S]*<\/svg>/i);
      if (match) raw = match[0];
    }

    // Ensure svg has viewBox
    return raw.replace(/<svg\s+([^>]+)>/i, (_match, attrs) => {
      let newAttrs = attrs;
      if (!/viewBox/i.test(newAttrs)) {
        const wMatch = newAttrs.match(/width="([0-9.]+)(?:px)?"/i);
        const hMatch = newAttrs.match(/height="([0-9.]+)(?:px)?"/i);
        if (wMatch && hMatch) {
          newAttrs += ` viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`;
        }
      }
      // Force responsive width and preserve aspect ratio
      newAttrs = newAttrs.replace(/width="[^"]*"/i, 'width="100%"');
      newAttrs = newAttrs.replace(/height="[^"]*"/i, 'height="auto"');
      if (!/preserveAspectRatio/i.test(newAttrs)) {
        newAttrs += ' preserveAspectRatio="xMidYMid meet"';
      }
      return `<svg ${newAttrs} style="max-width: 100%; height: auto; display: block; margin: 0 auto;">`;
    });
  }, [svgCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  return (
    <div
      className={`diagram-block svg-block my-2 overflow-hidden rounded-xl border border-line/60 bg-surface-solid/80 p-3 shadow-xs print:border-none print:bg-transparent print:p-1 ${className}`}
      style={{
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        maxWidth: width || undefined,
        marginInline: align === 'center' ? 'auto' : undefined,
      }}
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
            onClick={handleCopy}
            className="no-print btn !min-h-6 !px-1.5 text-[0.65rem] text-mute hover:text-brand"
            title="Copy SVG Code"
          >
            {copied ? <Check size={11} className="text-ok" /> : <Copy size={11} />}
          </button>
        </div>
      )}

      {/* Rendered SVG */}
      <div
        className={`diagram-svg-container relative mx-auto flex w-full justify-center overflow-x-auto ${alignClass}`}
        dangerouslySetInnerHTML={{ __html: processedSvg }}
      />

      {/* Caption */}
      {caption && (
        <div className="diagram-caption mt-2 text-center text-[0.7rem] italic text-mute">
          रेखाचित्र: {caption}
        </div>
      )}
    </div>
  );
};
