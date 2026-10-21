/**
 * Multi-File Markdown E-book Builder & Template Erasure Engine
 * Enables creating large ebooks from multiple .md files in one go with consistent
 * styling and content flow, as well as erasing template content to start a fresh ebook.
 */

import { Chapter, EbookSettings } from '../types/ebook';
import { DEFAULT_BOOK_SETTINGS } from '../constants/sampleData';
import { cleanHindiTypography } from './hindiFormatters';
import { countWords, extractFrontmatter } from './markdownParser';

export interface MarkdownFileInput {
  id?: string;
  name: string;
  content: string;
}

export interface NormalizeFlowOptions {
  ensureTopH1?: boolean;
  cleanTypography?: boolean;
  stripInternalPageBreaks?: boolean;
  normalizeHeadingLevels?: boolean;
  chapterNumberPrefix?: string;
}

export interface BatchMarkdownImportOptions {
  /**
   * 'replace': Erase existing/template chapters and create a new ebook from these files
   * 'append': Add imported files as chapters after existing chapters
   * 'merge-single': Combine all imported files into a single continuous chapter
   */
  mode: 'replace' | 'append' | 'merge-single';
  /**
   * 'continuous': Smooth, uninterrupted column/page flow across chapters (newPageH1 = false)
   * 'page-per-chapter': Each chapter starts on a fresh A4 page (newPageH1 = true)
   */
  flowMode: 'continuous' | 'page-per-chapter';
  ensureTopH1: boolean;
  cleanTypography: boolean;
  splitByH1: boolean;
  autoNumberChapters: boolean;
  enableToc: boolean;
  bookTitle?: string;
  bookSubtitle?: string;
  institute?: string;
  authorName?: string;
}

export interface EraseTemplateOptions {
  keepStyling?: boolean;
  clearBrandMetadata?: boolean;
  title?: string;
  subtitle?: string;
  institute?: string;
  address?: string;
  authorName?: string;
  edition?: string;
  examTag?: string;
  subject?: string;
  initialChapters?: { title: string; source?: string }[];
}

/**
 * Natural filename comparator (so chapter_2.md comes before chapter_10.md)
 */
const naturalCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export const sortMarkdownFilesNaturally = <T extends { name: string }>(files: T[]): T[] => {
  return [...files].sort((a, b) => naturalCollator.compare(a.name, b.name));
};

/**
 * Derive a clean human-readable chapter title from a file name
 */
export const deriveTitleFromFilename = (filename: string): string => {
  const withoutExt = filename.replace(/\.(md|markdown|txt)$/i, '').trim();
  const strippedPrefix = withoutExt.replace(/^\d+[\s._-]+/, '').trim();
  const base = strippedPrefix || withoutExt || 'अध्याय';
  return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Normalize a single markdown string so multiple .md files share uniform heading hierarchy,
 * callout styling, list markers, spacing, and content flow.
 */
export const normalizeMarkdownForConsistentFlow = (
  rawSource: string,
  fallbackTitle = 'नया अध्याय',
  options: NormalizeFlowOptions = {}
): {
  title: string;
  normalizedSource: string;
  meta: Record<string, string>;
  wordCount: number;
  h1Count: number;
} => {
  const {
    ensureTopH1 = true,
    cleanTypography = true,
    stripInternalPageBreaks = false,
    normalizeHeadingLevels = true,
    chapterNumberPrefix,
  } = options;

  const { meta, body } = extractFrontmatter(rawSource);
  let processed = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  if (cleanTypography) {
    processed = cleanHindiTypography(processed);
  }

  const lines = processed.split('\n');
  let inCodeBlock = false;
  let detectedH1: string | null = null;
  let minHeadingLevel = 6;

  // First pass: inspect heading structure outside code blocks
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```') || trimmed.startsWith('<svg') || trimmed.startsWith('</svg>')) {
      if (trimmed.startsWith('```')) inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      if (level < minHeadingLevel) minHeadingLevel = level;
      if (level === 1 && !detectedH1) {
        detectedH1 = hMatch[2].replace(/\s+#+\s*$/, '').trim();
      }
    }
  }

  // Determine canonical chapter title
  let baseTitle =
    meta.title ||
    meta.chapter ||
    detectedH1 ||
    fallbackTitle ||
    'नया अध्याय';

  if (chapterNumberPrefix && !baseTitle.startsWith(chapterNumberPrefix)) {
    const stripped = baseTitle
      .replace(/^(?:अध्याय|chapter|unit|इकाई)\s*\d+\s*[:：.-]\s*/i, '')
      .trim();
    baseTitle = `${chapterNumberPrefix}${stripped || baseTitle}`;
  }

  // Second pass: normalize headings, lists, callouts, and page breaks
  inCodeBlock = false;
  let firstH1Seen = false;
  let h1Count = 0;
  const normalizedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('```') || trimmed.startsWith('<svg') || trimmed.startsWith('</svg>')) {
      if (trimmed.startsWith('```')) inCodeBlock = !inCodeBlock;
      normalizedLines.push(rawLine);
      continue;
    }

    if (inCodeBlock) {
      normalizedLines.push(rawLine);
      continue;
    }

    // Handle explicit page breaks and horizontal rules
    if (/^(={3,}|-{3}\s*pagebreak\s*-{3})$/i.test(trimmed)) {
      if (!stripInternalPageBreaks) {
        normalizedLines.push('===');
      }
      continue;
    }

    // Strip standalone markdown horizontal rules (---, ***, ___) so they don't disrupt flow
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      continue;
    }

    // Normalize headings
    const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      let level = hMatch[1].length;
      let text = hMatch[2].replace(/\s+#+\s*$/, '').trim();

      if (normalizeHeadingLevels) {
        if (minHeadingLevel > 1 && !ensureTopH1) {
          level = Math.max(1, level - (minHeadingLevel - 1));
        }
        level = Math.min(3, level);
      }

      if (level === 1) {
        if (!firstH1Seen) {
          firstH1Seen = true;
          if (chapterNumberPrefix) {
            text = baseTitle;
          }
        }
        h1Count++;
      }

      normalizedLines.push(`${'#'.repeat(level)} ${text}`);
      continue;
    }

    // Normalize unordered list markers (*, +, • -> -)
    if (/^[*+•]\s+/.test(trimmed)) {
      normalizedLines.push(trimmed.replace(/^[*+•]\s+/, '- '));
      continue;
    }

    // Normalize callout blockquotes (e.g. > **Note:** text -> > नोट: text)
    if (trimmed.startsWith('>')) {
      const inner = trimmed.replace(/^>\s*/, '');
      const boldCallout = inner.match(
        /^\*\*(तथ्य|Fact|नोट|Note|याद रखें|Tip|महत्वपूर्ण|Important|चेतावनी|Warning|सारांश|Summary)\s*[:：-]?\*\*\s*[:：-]?\s*(.*)$/i
      );
      if (boldCallout) {
        normalizedLines.push(`> ${boldCallout[1]}: ${boldCallout[2]}`);
        continue;
      }
    }

    normalizedLines.push(rawLine);
  }

  let finalBody = normalizedLines.join('\n').trim();
  finalBody = finalBody.replace(/\n{3,}/g, '\n\n');
  finalBody = finalBody.replace(/^(?:===\s*\n)+/, '').replace(/(?:\n\s*===)+$/, '').trim();

  if (ensureTopH1 && !firstH1Seen) {
    finalBody = `# ${baseTitle}\n\n${finalBody}`.trim();
    h1Count = Math.max(1, h1Count);
  }

  return {
    title: baseTitle,
    normalizedSource: finalBody,
    meta,
    wordCount: countWords(finalBody),
    h1Count,
  };
};

/**
 * Splits a single markdown document containing multiple # H1 headings into separate sections.
 */
export const splitMarkdownByH1Sections = (
  rawSource: string,
  fallbackTitle: string
): { title: string; content: string; meta: Record<string, string> }[] => {
  const { meta, body } = extractFrontmatter(rawSource);
  const lines = body.replace(/\r\n/g, '\n').split('\n');

  const sections: { title: string; lines: string[]; meta: Record<string, string> }[] = [];
  let currentTitle = meta.title || fallbackTitle;
  let currentLines: string[] = [];
  let inCodeBlock = false;
  let seenFirstH1 = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```') || trimmed.startsWith('<svg') || trimmed.startsWith('</svg>')) {
      if (trimmed.startsWith('```')) inCodeBlock = !inCodeBlock;
      currentLines.push(line);
      continue;
    }

    if (!inCodeBlock) {
      const h1Match = trimmed.match(/^#\s+(.*)$/);
      if (h1Match) {
        const headingText = h1Match[1].replace(/\s+#+\s*$/, '').trim();
        if (!seenFirstH1) {
          seenFirstH1 = true;
          currentTitle = headingText || currentTitle;
          currentLines.push(line);
        } else {
          if (currentLines.join('\n').trim()) {
            sections.push({
              title: currentTitle,
              lines: currentLines,
              meta: sections.length === 0 ? meta : {},
            });
          }
          currentTitle = headingText;
          currentLines = [line];
        }
        continue;
      }
    }

    currentLines.push(line);
  }

  if (currentLines.join('\n').trim()) {
    sections.push({
      title: currentTitle,
      lines: currentLines,
      meta: sections.length === 0 ? meta : {},
    });
  }

  if (sections.length === 0) {
    return [{ title: fallbackTitle, content: body, meta }];
  }

  return sections.map(s => ({
    title: s.title,
    content: s.lines.join('\n').trim(),
    meta: s.meta,
  }));
};

/**
 * Batch-processes multiple .md files to create or expand a large ebook in one go
 * with consistent styling, unified heading hierarchy, and smooth content flow.
 */
export const buildLargeEbookFromMarkdownFiles = (
  files: MarkdownFileInput[],
  currentSettings: EbookSettings,
  options: BatchMarkdownImportOptions
): {
  nextSettings: EbookSettings;
  importedChaptersCount: number;
  totalWordsImported: number;
} => {
  if (!files || files.length === 0) {
    return {
      nextSettings: currentSettings,
      importedChaptersCount: 0,
      totalWordsImported: 0,
    };
  }

  const rawSegments: { title: string; content: string; meta: Record<string, string> }[] = [];
  for (const file of files) {
    const fallback = deriveTitleFromFilename(file.name);
    if (options.splitByH1) {
      const splitSections = splitMarkdownByH1Sections(file.content, fallback);
      rawSegments.push(...splitSections);
    } else {
      const { meta } = extractFrontmatter(file.content);
      rawSegments.push({
        title: meta.title || meta.chapter || fallback,
        content: file.content,
        meta,
      });
    }
  }

  const startIndex =
    options.mode === 'append' ? currentSettings.chapters.length : 0;

  let firstMeta: Record<string, string> = {};
  let totalWordsImported = 0;

  const builtChapters: Chapter[] = rawSegments.map((seg, idx) => {
    const chNum = startIndex + idx + 1;
    const prefix = options.autoNumberChapters ? `अध्याय ${chNum} : ` : undefined;

    const normalized = normalizeMarkdownForConsistentFlow(seg.content, seg.title, {
      ensureTopH1: options.ensureTopH1,
      cleanTypography: options.cleanTypography,
      stripInternalPageBreaks: options.flowMode === 'continuous',
      normalizeHeadingLevels: true,
      chapterNumberPrefix: prefix,
    });

    if (idx === 0) {
      firstMeta = { ...seg.meta, ...normalized.meta };
    }
    totalWordsImported += normalized.wordCount;

    return {
      id: `ch-md-${Date.now().toString(36)}-${idx + 1}`,
      title: normalized.title,
      source: normalized.normalizedSource,
    };
  });

  let finalChapters: Chapter[];
  if (options.mode === 'merge-single') {
    const joiner = options.flowMode === 'page-per-chapter' ? '\n\n===\n\n' : '\n\n';
    const mergedSource = builtChapters
      .map(ch => `%% === ${ch.title} ===\n\n${ch.source}`)
      .join(joiner);
    const mergedTitle =
      options.bookTitle?.trim() ||
      firstMeta.title ||
      (builtChapters.length > 0 ? builtChapters[0].title : currentSettings.title) ||
      'संपूर्ण ई-बुक';

    const mergedChapter: Chapter = {
      id: `ch-merged-${Date.now().toString(36)}`,
      title: mergedTitle,
      source: mergedSource,
    };
    finalChapters = [mergedChapter];
  } else if (options.mode === 'append') {
    const isSingleBlankChapter =
      currentSettings.chapters.length === 1 &&
      countWords(currentSettings.chapters[0].source) === 0;
    finalChapters = isSingleBlankChapter
      ? builtChapters
      : [...currentSettings.chapters, ...builtChapters];
  } else {
    finalChapters = builtChapters;
  }

  const nextSettings: EbookSettings = {
    ...currentSettings,
    title:
      options.bookTitle?.trim() ||
      (options.mode !== 'append' && firstMeta.title ? firstMeta.title : currentSettings.title),
    subtitle:
      options.bookSubtitle?.trim() ||
      (options.mode !== 'append' && firstMeta.subtitle
        ? firstMeta.subtitle
        : currentSettings.subtitle),
    institute:
      options.institute?.trim() ||
      (firstMeta.institute ? firstMeta.institute : currentSettings.institute),
    address: firstMeta.address ? firstMeta.address : currentSettings.address,
    brand: {
      ...currentSettings.brand,
      authorName:
        options.authorName?.trim() ||
        firstMeta.author ||
        currentSettings.brand.authorName,
      edition: firstMeta.edition || currentSettings.brand.edition,
      examTag: firstMeta.exam || currentSettings.brand.examTag,
      subject: firstMeta.subject || currentSettings.brand.subject,
    },
    layout: {
      ...currentSettings.layout,
      newPageH1: options.flowMode === 'page-per-chapter',
    },
    toc: {
      ...currentSettings.toc,
      on: options.enableToc ? true : currentSettings.toc.on,
    },
    chapters: finalChapters,
    activeChapterId:
      options.mode === 'append' && currentSettings.chapters.length > 1
        ? builtChapters[0].id
        : finalChapters[0].id,
  };

  return {
    nextSettings,
    importedChaptersCount: builtChapters.length,
    totalWordsImported,
  };
};

/**
 * Erases all sample/template chapters and creates a brand-new clean ebook altogether,
 * while optionally preserving the user's theme, typography, and layout styling.
 */
export const eraseTemplateAndCreateNewEbook = (
  currentSettings: EbookSettings,
  options: EraseTemplateOptions = {}
): EbookSettings => {
  const {
    keepStyling = true,
    clearBrandMetadata = false,
    title = 'नयी ई-बुक (New E-book)',
    subtitle = 'अध्ययन सामग्री एवं संपूर्ण नोट्स',
    institute,
    address,
    authorName,
    edition,
    examTag,
    subject,
    initialChapters,
  } = options;

  const baseSettings = keepStyling ? currentSettings : DEFAULT_BOOK_SETTINGS;

  const chaptersList: Chapter[] =
    initialChapters && initialChapters.length > 0
      ? initialChapters.map((ch, idx) => {
          const cleanTitle = ch.title.trim() || `अध्याय ${idx + 1}`;
          return {
            id: `ch-new-${Date.now().toString(36)}-${idx + 1}`,
            title: cleanTitle,
            source:
              ch.source !== undefined
                ? ch.source
                : `# ${cleanTitle}\n\n`,
          };
        })
      : [
          {
            id: `ch-blank-${Date.now().toString(36)}`,
            title: 'अध्याय 1 : प्रस्तावना',
            source: `# ${title.trim() || 'अध्याय 1 : प्रस्तावना'}\n\n`,
          },
        ];

  return {
    ...baseSettings,
    title: title.trim() || 'नयी ई-बुक',
    subtitle: subtitle.trim(),
    institute:
      institute !== undefined
        ? institute
        : clearBrandMetadata
          ? 'मेरा प्रकाशन'
          : currentSettings.institute,
    address:
      address !== undefined
        ? address
        : clearBrandMetadata
          ? ''
          : currentSettings.address,
    brand: {
      ...baseSettings.brand,
      subject: subject || baseSettings.brand.subject,
      authorName:
        authorName !== undefined
          ? authorName
          : clearBrandMetadata
            ? ''
            : currentSettings.brand.authorName,
      edition:
        edition !== undefined
          ? edition
          : clearBrandMetadata
            ? `${new Date().getFullYear()} संस्करण`
            : currentSettings.brand.edition,
      examTag:
        examTag !== undefined
          ? examTag
          : clearBrandMetadata
            ? 'E-BOOK'
            : currentSettings.brand.examTag,
      signatureStamp: clearBrandMetadata
        ? {
            enabled: false,
            name: '',
            designation: '',
          }
        : baseSettings.brand.signatureStamp,
    },
    watermark: clearBrandMetadata
      ? {
          ...baseSettings.watermark,
          on: false,
          text: title.trim() || 'E-BOOK',
        }
      : baseSettings.watermark,
    chapters: chaptersList,
    activeChapterId: chaptersList[0].id,
    library: currentSettings.library,
  };
};
