/**
 * Export and Packaging Utilities for Gyankunj Studio
 */

import { EbookSettings } from '../types/ebook';
import { makeGradient, makeSoftGradient } from './colorUtils';

export const downloadBlob = (filename: string, content: string, mimeType = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const exportProjectJson = (settings: EbookSettings) => {
  const payload = {
    app: 'Gyankunj Studio',
    version: '3.0',
    exportedAt: new Date().toISOString(),
    settings,
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const cleanTitle = (settings.title || 'Gyankunj_Project')
    .replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_')
    .slice(0, 40);
  downloadBlob(`${cleanTitle}_project.json`, jsonStr, 'application/json');
};

export const exportMarkdownBook = (settings: EbookSettings, chapterOnly = false) => {
  const frontmatter = `---
title: "${settings.title}"
subtitle: "${settings.subtitle}"
institute: "${settings.institute}"
address: "${settings.address}"
edition: "${settings.brand.edition}"
exam: "${settings.brand.examTag}"
subject: "${settings.brand.subject}"
---
`;

  let body = '';
  if (chapterOnly) {
    const active = settings.chapters.find(c => c.id === settings.activeChapterId);
    body = active ? active.source : '';
  } else {
    body = settings.chapters
      .map(ch => `%% === ${ch.title} ===\n\n${ch.source.trim()}`)
      .join('\n\n===\n\n');
  }

  const cleanTitle = (settings.title || 'Gyankunj_Book')
    .replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_')
    .slice(0, 40);
  downloadBlob(`${cleanTitle}${chapterOnly ? '_chapter' : '_full_book'}.md`, `${frontmatter}\n${body}`);
};

export const exportCssTokens = (settings: EbookSettings): string => {
  const { theme, heads, hf } = settings;
  const headingColors = heads.gradPreset === 'theme'
    ? [theme.primary, theme.secondary, theme.accent]
    : heads.g;

  return `:root {
  /* Gyankunj Brand Palette */
  --gk-primary: ${theme.primary};
  --gk-accent: ${theme.accent};
  --gk-secondary: ${theme.secondary};
  --gk-paper: ${theme.paper};
  --gk-text: ${theme.text};

  /* Heading Gradient */
  --gk-heading-gradient: ${makeGradient(heads.gAng, headingColors as [string, string, string])};

  /* Header & Footer Gradients */
  --gk-header-gradient: ${makeGradient(hf.ang, hf.h)};
  --gk-footer-gradient: ${makeGradient(hf.mirror ? (hf.ang + 180) % 360 : hf.ang, hf.link ? hf.h : hf.f)};
}

/* Tailwind CSS v4 Theme Extension */
@theme {
  --color-gk-primary: ${theme.primary};
  --color-gk-accent: ${theme.accent};
  --color-gk-secondary: ${theme.secondary};
  --color-gk-paper: ${theme.paper};
  --color-gk-text: ${theme.text};
}`;
};

export const exportStandaloneHtml = (renderedPagesHtml: string, title: string, cssRules: string): void => {
  const safeTitle = title.replace(/[<&>]/g, m => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[m] || '');

  const htmlDoc = `<!doctype html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle} — Gyankunj Studio E-book</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Noto+Serif+Devanagari:wght@400;600;700;800;900&family=Mukta:wght@400;600;700;800&family=Inter:wght@400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    ${cssRules}
    html, body {
      height: auto !important;
      overflow: auto !important;
      background: #e2e8f0 !important;
      margin: 0;
      padding: 0;
    }
    body::before { display: none !important; }
    .standalone-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      gap: 32px;
    }
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      html, body {
        background: #ffffff !important;
      }
      .standalone-container {
        padding: 0 !important;
        gap: 0 !important;
        display: block !important;
      }
      .page {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        break-after: auto !important;
        page-break-after: auto !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      [data-pg] {
        display: block !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        break-after: page !important;
        page-break-after: always !important;
      }
      [data-pg]:last-child {
        break-after: auto !important;
        page-break-after: auto !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="standalone-container">
    ${renderedPagesHtml}
  </div>
</body>
</html>`;

  downloadBlob(`${safeTitle.replace(/\s+/g, '_')}_print_ready.html`, htmlDoc, 'text/html;charset=utf-8');
};
