/**
 * Advanced Markdown & Educational Content Parser
 * Supports headings, bilingual study callouts, tables, lists, MCQs, QR codes, and page breaks.
 */

import { Block } from '../types/ebook';

export interface ParsedDocument {
  meta: Record<string, string>;
  body: string;
}

export const extractFrontmatter = (raw: string): ParsedDocument => {
  const normalized = raw.replace(/\r/g, '').replace(/^\uFEFF/, '');
  const match = normalized.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!match) {
    return { meta: {}, body: normalized };
  }
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*$/);
    if (kv) {
      meta[kv[1].toLowerCase()] = kv[2].replace(/^["']|["']$/g, '').trim();
    }
  }
  return { meta, body: normalized.slice(match[0].length) };
};

const splitTableRow = (row: string): string[] => {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
};

export const parseMarkdownToBlocks = (source: string): Block[] => {
  const { body } = extractFrontmatter(source);
  const lines = body.split('\n');
  const blocks: Block[] = [];
  let buffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length > 0) {
      blocks.push({ t: 'p', text: buffer.join(' ') });
      buffer = [];
    }
  };

  let idx = 0;
  while (idx < lines.length) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushParagraph();
      idx++;
      continue;
    }

    // Comment line
    if (trimmed.startsWith('%%')) {
      idx++;
      continue;
    }

    // Page break
    if (/^(={3,}|-{3}\s*pagebreak\s*-{3})$/i.test(trimmed)) {
      flushParagraph();
      if (blocks.length > 0 && blocks[blocks.length - 1].t !== 'pagebreak') {
        blocks.push({ t: 'pagebreak' });
      }
      idx++;
      continue;
    }

    // Standalone markdown horizontal rule (---, ***, ___) — flush paragraph without rendering raw dashes
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      idx++;
      continue;
    }

    // Mermaid Diagram parser (```mermaid ... ```)
    if (/^```mermaid/i.test(trimmed)) {
      flushParagraph();
      const metaMatch = trimmed.match(/^```mermaid(?:\s*\[(.*?)\])?/i);
      const metaStr = metaMatch?.[1] || '';
      idx++;
      const chartLines: string[] = [];
      while (idx < lines.length && !/^```/.test(lines[idx].trim())) {
        chartLines.push(lines[idx]);
        idx++;
      }
      if (idx < lines.length && /^```/.test(lines[idx].trim())) {
        idx++;
      }
      let title: string | undefined;
      let caption: string | undefined;
      let align: 'center' | 'left' | 'right' = 'center';
      if (metaStr) {
        const titleM = metaStr.match(/(?:title|शीर्षक)\s*:\s*([^|,\]]+)/i);
        const captionM = metaStr.match(/(?:caption|विवरण)\s*:\s*([^|,\]]+)/i);
        const alignM = metaStr.match(/(?:align|संरेखण)\s*:\s*(left|center|right)/i);
        if (titleM) title = titleM[1].trim();
        if (captionM) caption = captionM[1].trim();
        if (alignM) align = alignM[1].toLowerCase() as any;
      }
      blocks.push({
        t: 'mermaid',
        chart: chartLines.join('\n').trim(),
        title,
        caption,
        align,
      });
      continue;
    }

    // SVG Vector Diagram parser (```svg ... ```)
    if (/^```svg/i.test(trimmed)) {
      flushParagraph();
      const metaMatch = trimmed.match(/^```svg(?:\s*\[(.*?)\])?/i);
      const metaStr = metaMatch?.[1] || '';
      idx++;
      const svgLines: string[] = [];
      while (idx < lines.length && !/^```/.test(lines[idx].trim())) {
        svgLines.push(lines[idx]);
        idx++;
      }
      if (idx < lines.length && /^```/.test(lines[idx].trim())) {
        idx++;
      }
      let title: string | undefined;
      let caption: string | undefined;
      let align: 'center' | 'left' | 'right' = 'center';
      if (metaStr) {
        const titleM = metaStr.match(/(?:title|शीर्षक)\s*:\s*([^|,\]]+)/i);
        const captionM = metaStr.match(/(?:caption|विवरण)\s*:\s*([^|,\]]+)/i);
        const alignM = metaStr.match(/(?:align|संरेखण)\s*:\s*(left|center|right)/i);
        if (titleM) title = titleM[1].trim();
        if (captionM) caption = captionM[1].trim();
        if (alignM) align = alignM[1].toLowerCase() as any;
      }
      blocks.push({
        t: 'svg',
        svgCode: svgLines.join('\n').trim(),
        title,
        caption,
        align,
      });
      continue;
    }

    // Direct inline/block <svg ... </svg>
    if (/^<svg[\s>]/i.test(trimmed)) {
      flushParagraph();
      const svgLines: string[] = [];
      while (idx < lines.length) {
        svgLines.push(lines[idx]);
        if (/<\/svg>/i.test(lines[idx])) {
          idx++;
          break;
        }
        idx++;
      }
      blocks.push({
        t: 'svg',
        svgCode: svgLines.join('\n').trim(),
        align: 'center',
      });
      continue;
    }

    // MCQ Block parser
    if (/^\[mcq\]/i.test(trimmed)) {
      flushParagraph();
      idx++;
      let question = '';
      const options: { key: string; text: string }[] = [];
      let answer = '';
      let explanation = '';

      while (idx < lines.length && !/^\[\/mcq\]/i.test(lines[idx].trim())) {
        const mcqLine = lines[idx].trim();
        const qMatch = mcqLine.match(/^(?:Q|प्रश्न)\s*[:.]\s*(.*)$/i);
        const optMatch = mcqLine.match(/^\(([A-Da-d1-4])\)\s*(.*)$/);
        const ansMatch = mcqLine.match(/^(?:Ans|उत्तर)\s*[:.]\s*([A-Da-d1-4])/i);
        const expMatch = mcqLine.match(/^(?:Exp|व्याख्या|Explanation)\s*[:.]\s*(.*)$/i);

        if (qMatch) {
          question = qMatch[1];
        } else if (optMatch) {
          options.push({ key: optMatch[1].toUpperCase(), text: optMatch[2] });
        } else if (ansMatch) {
          answer = ansMatch[1].toUpperCase();
        } else if (expMatch) {
          explanation = expMatch[1];
        } else if (!question) {
          question = mcqLine;
        } else if (explanation) {
          explanation += ' ' + mcqLine;
        }
        idx++;
      }
      if (idx < lines.length && /^\[\/mcq\]/i.test(lines[idx].trim())) {
        idx++;
      }
      if (question) {
        blocks.push({
          t: 'mcq',
          question,
          options,
          answer: answer || undefined,
          explanation: explanation || undefined,
        });
      }
      continue;
    }

    // QR Code block
    const qrMatch = trimmed.match(/^\[(?:qr|qrcode)\s*:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]/i);
    if (qrMatch) {
      flushParagraph();
      blocks.push({
        t: 'qrcode',
        url: qrMatch[1].trim(),
        label: (qrMatch[2] || 'स्कैन करें').trim(),
      });
      idx++;
      continue;
    }

    // Signature block
    const signMatch = trimmed.match(/^\[(?:sign|signature)\s*:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]/i);
    if (signMatch) {
      flushParagraph();
      blocks.push({
        t: 'signature',
        name: signMatch[1].trim(),
        title: (signMatch[2] || 'प्रमाणित').trim(),
      });
      idx++;
      continue;
    }

    // Headings H1..H6 (normalize H4..H6 to H3 for consistent ebook styling)
    const headMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headMatch) {
      flushParagraph();
      const level = Math.min(3, headMatch[1].length);
      blocks.push({
        t: ('h' + level) as 'h1' | 'h2' | 'h3',
        text: headMatch[2].replace(/\s+#+\s*$/, '').trim(),
      });
      idx++;
      continue;
    }

    // Unordered lists (-, *, +, •)
    if (/^[-*+•]\s+/.test(trimmed)) {
      flushParagraph();
      const items: string[] = [];
      while (idx < lines.length && /^[-*+•]\s+/.test(lines[idx].trim())) {
        items.push(lines[idx].trim().replace(/^[-*+•]\s+/, ''));
        idx++;
      }
      blocks.push({ t: 'ul', items });
      continue;
    }

    // Numbered lists
    if (/^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph();
      const items: string[] = [];
      while (idx < lines.length && /^\d+[.)]\s+/.test(lines[idx].trim())) {
        items.push(lines[idx].trim().replace(/^\d+[.)]\s+/, ''));
        idx++;
      }
      blocks.push({ t: 'ol', items });
      continue;
    }

    // Callout boxes (supports multi-line blockquotes and bold callout tags)
    if (trimmed.startsWith('>')) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (idx < lines.length && lines[idx].trim().startsWith('>')) {
        quoteLines.push(lines[idx].trim().replace(/^>\s*/, ''));
        idx++;
      }
      const calloutText = quoteLines.join(' ').trim();
      const calloutMatch = calloutText.match(
        /^(?:\*\*)?(तथ्य|Fact|नोट|Note|याद रखें|Tip|महत्वपूर्ण|Important|चेतावनी|Warning|सारांश|Summary)\s*[:：-]?(?:\*\*)?\s*[:：-]?\s+(.*)$/i
      );

      if (calloutMatch) {
        const tag = calloutMatch[1].replace(/\*\*/g, '');
        let kind: 'fact' | 'note' | 'tip' | 'warning' = 'note';
        if (/तथ्य|fact|सारांश|summary/i.test(tag)) kind = 'fact';
        else if (/याद|tip|महत्वपूर्ण|important/i.test(tag)) kind = 'tip';
        else if (/चेतावनी|warning/i.test(tag)) kind = 'warning';
        blocks.push({
          t: 'callout',
          kind,
          label: tag,
          text: calloutMatch[2].trim(),
        });
      } else {
        blocks.push({
          t: 'callout',
          kind: 'quote',
          text: calloutText,
        });
      }
      continue;
    }

    // Markdown tables
    if (trimmed.startsWith('|')) {
      flushParagraph();
      const tableRows: string[][] = [];
      while (idx < lines.length && lines[idx].trim().startsWith('|')) {
        const curRow = lines[idx].trim();
        // Skip separator row |---|---|
        if (!/^\s*\|?[\s:|-]+\|?\s*$/.test(curRow) || !curRow.includes('-')) {
          tableRows.push(splitTableRow(curRow));
        }
        idx++;
      }
      if (tableRows.length > 0) {
        blocks.push({
          t: 'table',
          head: tableRows[0] || [],
          rows: tableRows.slice(1),
        });
      }
      continue;
    }

    // Standard paragraph line
    buffer.push(trimmed);
    idx++;
  }

  flushParagraph();

  // Strip trailing pagebreak blocks to prevent arbitrary blank trailing pages
  while (blocks.length > 0 && blocks[blocks.length - 1].t === 'pagebreak') {
    blocks.pop();
  }

  return blocks;
};

export const countWords = (text: string): number => {
  const { body } = extractFrontmatter(text);
  const cleaned = body.replace(/^%%.*$/gm, '').trim();
  const tokens = cleaned.match(/[\p{L}\p{M}\p{N}]+/gu);
  return tokens ? tokens.length : 0;
};
