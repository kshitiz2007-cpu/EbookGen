/**
 * Gyankunj Studio - A4 Page & Content Block Renderer
 */

import React, { useId, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Block, EbookSettings, HeaderFooterSettings } from '../types/ebook';
import { getBestTextColor, makeGradient, makeSoftGradient } from '../utils/colorUtils';
import { SUBJECT_THEMES } from '../constants/presets';

const FONT_FAMILIES: Record<string, string> = {
  noto: '"Noto Sans Devanagari", "Hind", Inter, system-ui, sans-serif',
  serif: '"Noto Serif Devanagari", "Noto Serif", Georgia, serif',
  mukta: '"Mukta", "Noto Sans Devanagari", sans-serif',
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

const HEADING_FONTS: Record<string, string> = {
  same: '',
  serif: '"Noto Serif Devanagari", "Noto Serif", Georgia, serif',
  display: '"Noto Serif Devanagari", Georgia, serif',
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

export const getDocumentStyles = (s: EbookSettings): React.CSSProperties => {
  const headingColors = s.heads.gradPreset === 'theme'
    ? [s.theme.primary, s.theme.secondary, s.theme.accent]
    : s.heads.g;
  const wmColor = s.theme[s.watermark.color];

  return {
    ['--d-hfont' as string]: HEADING_FONTS[s.type.headFont] || FONT_FAMILIES[s.type.font],
    ['--d-hweight' as string]: s.type.headFont === 'display' ? 900 : 800,
    ['--d-align' as string]: s.type.align,
    ['--d-hyph' as string]: s.type.hyphens ? 'auto' : 'manual',
    ['--d-pat' as string]: s.layout.patternOpacity / 100,
    ['--d-wm' as string]: wmColor,
    ['--d-wm-o' as string]: s.watermark.opacity / 100,
    ['--d-wm-a' as string]: `${s.watermark.angle}deg`,
    ['--d-wm-s' as string]: `${s.watermark.size}mm`,
    ['--d-primary' as string]: s.theme.primary,
    ['--d-accent' as string]: s.theme.accent,
    ['--d-secondary' as string]: s.theme.secondary,
    ['--d-paper' as string]: s.theme.paper,
    ['--d-ink' as string]: s.theme.text,
    ['--d-font' as string]: FONT_FAMILIES[s.type.font],
    ['--d-fs' as string]: s.type.size,
    ['--d-lh' as string]: s.type.line,
    ['--d-hs' as string]: s.type.headScale / 100,
    ['--d-ts' as string]: s.type.tableSize,
    ['--d-padx' as string]: `${s.layout.padX}mm`,
    ['--d-pady' as string]: `${s.layout.padY}mm`,
    ['--d-radius' as string]: `${s.layout.radius}px`,
    ['--d-g1' as string]: headingColors[0],
    ['--d-g2' as string]: headingColors[1],
    ['--d-g3' as string]: headingColors[2],
    ['--d-gang' as string]: `${s.heads.gAng}deg`,
  };
};

export const getDocumentDataAttributes = (s: EbookSettings): Record<string, string | undefined> => ({
  'data-h1': s.heads.h1,
  'data-h2': s.heads.h2,
  'data-h3': s.heads.h3,
  'data-table': s.heads.table,
  'data-callout': s.heads.callout,
  'data-list': s.heads.list,
  'data-pstyle': s.layout.pageStyle,
  'data-frame': s.layout.frame,
  'data-indent': s.type.indent ? '' : undefined,
  'data-dropcap': s.type.dropcap ? '' : undefined,
  'data-pattern': s.layout.pattern,
  'data-guides': s.layout.guides ? '' : undefined,
});

export const getHeaderFooterStyles = (hf: HeaderFooterSettings): React.CSSProperties => {
  const fColors = hf.link ? hf.h : hf.f;
  const hColors = hf.h;
  const fAng = hf.mirror ? (hf.ang + 180) % 360 : hf.ang;
  const shadowIntensity = (hf.glow / 100) * 0.55;

  const onh = getBestTextColor(hColors, hf.tm);
  const onf = getBestTextColor(fColors, hf.tm);

  const makeShadow = (color: string, yOffset: number) => {
    return shadowIntensity > 0
      ? `0 ${yOffset}mm 3.4mm -1.2mm color-mix(in srgb, ${color} ${Math.round(shadowIntensity * 100)}%, transparent)`
      : 'none';
  };

  const isDarkFooter = ['band', 'aurora', 'angle'].includes(hf.fs);

  return {
    ['--hf-g1' as string]: hColors[0],
    ['--hf-g2' as string]: hColors[1],
    ['--hf-g3' as string]: hColors[2],
    ['--hf-f1' as string]: fColors[0],
    ['--hf-f2' as string]: fColors[1],
    ['--hf-f3' as string]: fColors[2],
    ['--hf-hfill' as string]: makeGradient(hf.ang, hColors),
    ['--hf-hline' as string]: makeGradient(90, hColors),
    ['--hf-hsoft' as string]: makeSoftGradient(hf.ang, hColors),
    ['--hf-ffill' as string]: makeGradient(fAng, fColors),
    ['--hf-fline' as string]: makeGradient(90, fColors),
    ['--hf-fsoft' as string]: makeSoftGradient(fAng, fColors),
    ['--hf-onh' as string]: onh,
    ['--hf-onf' as string]: onf,
    ['--hf-ink' as string]: hf.ink,
    ['--hf-hshadow' as string]: makeShadow(hColors[1], 1.3),
    ['--hf-fshadow' as string]: makeShadow(fColors[1], -1.3),
    ['--hf-pbg' as string]: isDarkFooter ? 'rgba(255, 255, 255, 0.94)' : makeGradient(90, fColors),
    ['--hf-pfg' as string]: isDarkFooter ? hf.ink : onf,
    ['--hf-pbd' as string]: isDarkFooter ? 'rgba(255, 255, 255, 0.85)' : fColors[1],
  };
};

export const InlineMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|==[^=]+==|\*[^*\s][^*]*\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
          return <mark key={i}>{part.slice(2, -2)}</mark>;
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code key={i} className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.88em]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};

const QrCodeItem: React.FC<{ url: string; label: string }> = ({ url, label }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 1,
      width: 120,
      color: { dark: '#0c2d49', light: '#ffffff' },
    }).then(setDataUrl).catch(() => {});
  }, [url]);

  return (
    <div className="qrcode-box">
      {dataUrl ? <img src={dataUrl} alt={label} /> : <div className="h-10 w-10 bg-slate-200" />}
      <div className="qrcode-info">
        <b>{label}</b>
        <span className="text-[0.7em] opacity-75">{url}</span>
      </div>
    </div>
  );
};

import { MermaidRenderer } from './renderers/MermaidRenderer';
import { SvgRenderer } from './renderers/SvgRenderer';

export const ContentBlockView: React.FC<{
  b: Block;
  r0?: number;
  r1?: number;
  subText?: string;
}> = ({ b, r0, r1, subText }) => {
  switch (b.t) {
    case 'h1':
      return <h1><InlineMarkdown text={b.text} /></h1>;
    case 'h2':
      return <h2><InlineMarkdown text={b.text} /></h2>;
    case 'h3':
      return <h3><InlineMarkdown text={b.text} /></h3>;
    case 'p':
      return <p><InlineMarkdown text={subText ?? b.text} /></p>;
    case 'ul':
      return (
        <ul>
          {b.items.slice(r0 ?? 0, r1 ?? b.items.length).map((item, idx) => (
            <li key={idx}><InlineMarkdown text={item} /></li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol start={(r0 ?? 0) + 1}>
          {b.items.slice(r0 ?? 0, r1 ?? b.items.length).map((item, idx) => (
            <li key={idx}><InlineMarkdown text={item} /></li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <table>
          <thead>
            <tr>
              {b.head.map((th, idx) => (
                <th key={idx}><InlineMarkdown text={th} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.slice(r0 ?? 0, r1 ?? b.rows.length).map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}><InlineMarkdown text={cell} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'callout':
      return (
        <div className={`callout ${b.kind}`}>
          {b.label && <b className="callout-label">{b.label}</b>}
          <span><InlineMarkdown text={b.text} /></span>
        </div>
      );
    case 'mcq':
      return (
        <div className="mcq-card">
          <div className="mcq-q"><InlineMarkdown text={b.question} /></div>
          <div className="mcq-options">
            {b.options.map((opt, i) => (
              <div key={i} className="mcq-opt">
                <b>({opt.key})</b>
                <span><InlineMarkdown text={opt.text} /></span>
              </div>
            ))}
          </div>
          {(b.answer || b.explanation) && (
            <div className="mcq-solution">
              {b.answer && <span className="mcq-ans-badge">उत्तर: ({b.answer})</span>}
              {b.explanation && <span><InlineMarkdown text={b.explanation} /></span>}
            </div>
          )}
        </div>
      );
    case 'qrcode':
      return <QrCodeItem url={b.url} label={b.label} />;
    case 'signature':
      return (
        <div className="signature-box">
          <div className="signature-card">
            <b>{b.name}</b>
            <span className="opacity-80">{b.title}</span>
          </div>
        </div>
      );
    case 'mermaid':
      return (
        <MermaidRenderer
          chart={b.chart}
          title={b.title}
          caption={b.caption}
          align={b.align}
        />
      );
    case 'svg':
      return (
        <SvgRenderer
          svgCode={b.svgCode}
          title={b.title}
          caption={b.caption}
          align={b.align}
          width={b.width}
        />
      );
    case 'pagebreak':
      return null;
  }
};

export const BrandLogo: React.FC<{ s: EbookSettings; light?: boolean }> = ({ s, light }) => {
  const words = s.institute.trim().split(/\s+/);
  const lastWord = words.length > 1 ? words.pop() : '';
  const gradId = useId();

  return (
    <div className="brand" data-light={light ? '' : undefined}>
      <span className="brand-image" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="100%" height="100%">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--d-primary)" />
              <stop offset="100%" stopColor="var(--d-accent)" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="19" fill={`url(#${gradId})`} />
          <path
            d="M26.5 14.2A9 9 0 1 0 28 22h-8"
            fill="none"
            stroke="#fff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="brand-name">
        {words.join(' ')} {lastWord && <em>{lastWord}</em>}
      </span>
    </div>
  );
};

export const CoverPage: React.FC<{ s: EbookSettings }> = ({ s }) => {
  const subj = SUBJECT_THEMES.find(item => item.key === s.brand.subject) || SUBJECT_THEMES[0];
  const style = s.brand.coverStyle;
  const cvColors = style === 'thematic' || style === 'mesh'
    ? subj.colors
    : [s.theme.primary, s.theme.secondary, s.theme.accent];

  return (
    <article
      className="page cover"
      data-cover={style}
      style={{
        ['--cv1' as string]: cvColors[0],
        ['--cv2' as string]: cvColors[1],
        ['--cv3' as string]: cvColors[2],
      }}
    >
      <div className="cv-art" aria-hidden="true" />
      <div className="cv-grain" aria-hidden="true" />

      <div className="cv-top">
        <BrandLogo s={s} light={style !== 'minimal'} />
        <span className="cv-tag">
          {s.brand.examTag || 'CIVIL SERVICES'} · {s.brand.edition || new Date().getFullYear()}
        </span>
      </div>

      <div className="cv-glyph" aria-hidden="true">
        {subj.glyph}
      </div>

      <div className="cv-mid">
        <span className="cv-chip">{subj.name}</span>
        <h1>{s.title}</h1>
        <p>{s.subtitle}</p>
        <i className="cv-rule" />
      </div>

      <div className="cv-foot">
        <span>{s.brand.authorName ? `${s.brand.authorName} · ` : ''}{s.address}</span>
        <span>सफलता की ओर, एक कदम और</span>
      </div>
    </article>
  );
};

export const PageView: React.FC<{
  s: EbookSettings;
  columns: React.ReactNode[];
  no: number;
  section: string;
  hf: HeaderFooterSettings | null;
  mini?: boolean;
  innerRef?: React.Ref<HTMLElement>;
  label?: string;
  single?: boolean;
  extra?: string;
}> = ({ s, columns, no, section, hf, mini, innerRef, label, single, extra }) => {
  const brand = s.brand;
  const shortTitle = s.title.split('—')[0].trim();
  const hfStyles = hf ? getHeaderFooterStyles(hf) : undefined;
  const hfAttrs = hf && (hf.hs !== 'keep' || hf.fs !== 'keep' || hf.edge !== 'none' || hf.pn !== 'keep')
    ? {
        'data-hf': '',
        'data-hs': hf.hs,
        'data-fs': hf.fs,
        'data-edge': hf.edge,
        'data-pn': hf.pn,
        'data-logo': hf.logo,
      }
    : {};

  return (
    <article
      ref={innerRef}
      className={`page${brand.compactHeader ? ' compact' : ''}${mini ? ' mini' : ''}${extra ? ' ' + extra : ''}`}
      style={hfStyles}
      {...hfAttrs}
    >
      {brand.showHeader && (
        <header className="page-header">
          <BrandLogo s={s} />
          <div className="header-meta">
            {shortTitle}
            <br />
            {s.subtitle.split('·')[0].trim()}
          </div>
        </header>
      )}

      {brand.showTitleBar && section && (
        <div className="page-title">
          {section}
          <span> · प्रामाणिक अध्ययन सामग्री</span>
        </div>
      )}

      {s.layout.pattern !== 'none' && <div className="page-pattern" aria-hidden="true" />}

      {s.watermark.on && s.watermark.text.trim() && (
        <div className="watermark" aria-hidden="true">
          <span>{s.watermark.text}</span>
        </div>
      )}

      <div className="columns" data-n={single ? 1 : s.layout.columns}>
        {columns.map((col, idx) => (
          <div key={idx} className="column">
            {col}
          </div>
        ))}
      </div>

      {brand.showFooter && (
        <footer className="page-footer">
          <span className="footer-address">
            {brand.showAddress ? s.address : s.institute}
          </span>
          {brand.showPageNumber && (
            <span className="footer-page">
              पृष्ठ <b>{label ?? no}</b>
            </span>
          )}
        </footer>
      )}
    </article>
  );
};
