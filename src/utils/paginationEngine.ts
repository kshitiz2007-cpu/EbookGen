/**
 * Precision Client-Side A4 Pagination Engine
 * Splits content across columns and pages with Keep-With-Next rules,
 * table row splitting, and list item splitting.
 */

import { Block, ChunkedBlockRef, PageLayout } from '../types/ebook';

const PADDING_SAFETY_MARGIN = 6; // px safety to prevent browser rounding overflow

/**
 * Helper to split a long paragraph into two parts at a natural sentence or word boundary.
 */
function splitParagraphText(
  text: string,
  targetRatio: number
): [string, string] | null {
  if (!text || text.length < 40) return null;
  const clampedRatio = Math.max(0.2, Math.min(0.85, targetRatio));
  const targetIndex = Math.floor(text.length * clampedRatio);

  // Preferred sentence delimiters: Hindi danda, double danda, period, exclamation, question mark, semicolon
  const sentenceRegex = /[।॥.!?;\n]\s+/g;
  let match: RegExpExecArray | null;
  let bestSentenceIdx = -1;
  let minDiff = Infinity;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const splitPoint = match.index + match[0].length;
    const diff = Math.abs(splitPoint - targetIndex);
    if (diff < minDiff && splitPoint > 20 && splitPoint < text.length - 20) {
      minDiff = diff;
      bestSentenceIdx = splitPoint;
    }
  }

  // If a reasonable sentence boundary was found within 35% of the target
  if (bestSentenceIdx !== -1 && minDiff < text.length * 0.35) {
    const part1 = text.slice(0, bestSentenceIdx).trim();
    const part2 = text.slice(bestSentenceIdx).trim();
    if (part1 && part2) return [part1, part2];
  }

  // Fallback to nearest space/word boundary
  const searchStart = Math.max(15, targetIndex - 40);
  const searchEnd = Math.min(text.length - 15, targetIndex + 40);
  const spaceIdx = text.indexOf(' ', targetIndex);
  const altSpaceIdx = text.lastIndexOf(' ', targetIndex);

  let chosenIdx = -1;
  if (spaceIdx !== -1 && spaceIdx <= searchEnd) {
    chosenIdx = spaceIdx;
  } else if (altSpaceIdx !== -1 && altSpaceIdx >= searchStart) {
    chosenIdx = altSpaceIdx;
  }

  if (chosenIdx > 15 && chosenIdx < text.length - 15) {
    const part1 = text.slice(0, chosenIdx).trim();
    const part2 = text.slice(chosenIdx).trim();
    if (part1 && part2) return [part1, part2];
  }

  return null;
}

export const distributeBlocksIntoColumns = (
  blocks: Block[],
  blockHeights: number[],
  tableRowHeights: (number[] | null)[],
  tableHeaderHeights: number[],
  maxColumnHeight: number,
  columnsPerPage: number,
  newPageOnH1: boolean,
  listRowHeights?: (number[] | null)[]
): ChunkedBlockRef[][] => {
  const columns: ChunkedBlockRef[][] = [[]];
  let curHeight = 0;

  const remainingSpace = () => Math.max(0, maxColumnHeight - PADDING_SAFETY_MARGIN - curHeight);

  const startNewColumn = () => {
    // If the last column is already completely empty, do not add another empty column
    if (columns[columns.length - 1].length === 0) {
      curHeight = 0;
      return;
    }
    columns.push([]);
    curHeight = 0;
  };

  const advanceToNewPage = () => {
    if (!columns.some(col => col.length > 0)) return;

    const lastColIdx = columns.length - 1;
    const isAtStartOfFreshPage = (lastColIdx % columnsPerPage === 0) && columns[lastColIdx].length === 0;
    if (isAtStartOfFreshPage) {
      // Already at the start of a clean new page, do not push redundant empty pages
      curHeight = 0;
      return;
    }

    if (columns[lastColIdx].length > 0) {
      // Pad out remaining columns on the current page
      while (columns.length % columnsPerPage !== 0) {
        columns.push([]);
      }
      // Start the first column of the new page
      columns.push([]);
      curHeight = 0;
    } else {
      // Current column is empty, pad to next page boundary
      while (columns.length % columnsPerPage !== 0) {
        columns.push([]);
      }
      columns.push([]);
      curHeight = 0;
    }
  };

  // We maintain a working queue of blocks and sub-chunks
  interface WorkItem {
    blockIndex: number;
    subText?: string;
    overrideHeight?: number;
  }

  const queue: WorkItem[] = blocks.map((_, i) => ({ blockIndex: i }));

  while (queue.length > 0) {
    const item = queue.shift()!;
    const i = item.blockIndex;
    const block = blocks[i];
    const bHeight = item.overrideHeight ?? (blockHeights[i] || 0);
    const isHeading = block.t === 'h1' || block.t === 'h2' || block.t === 'h3';

    // Keep-with-next estimation: A heading must stay with at least ~45px of following content
    const nextItemHeight = isHeading && queue.length > 0
      ? Math.min(blockHeights[queue[0].blockIndex] || 50, 75)
      : 0;

    // Explicit Page Break
    if (block.t === 'pagebreak') {
      advanceToNewPage();
      continue;
    }

    // New Page on H1 option
    if (newPageOnH1 && block.t === 'h1') {
      advanceToNewPage();
    }

    const space = remainingSpace();

    // Check if entire block fits
    // For headings, ensure bHeight + nextItemHeight fits, or start clean column if not at top
    const fits = isHeading
      ? (bHeight + nextItemHeight <= space || curHeight === 0)
      : (bHeight <= space);

    if (fits) {
      columns[columns.length - 1].push({ i, subText: item.subText });
      curHeight += bHeight;
      continue;
    }

    // 1. Try splitting tables across columns
    const rowHeights = tableRowHeights[i];
    if (rowHeights && rowHeights.length > 0) {
      let rIdx = 0;
      const thHeight = tableHeaderHeights[i] || 32;

      while (rIdx < rowHeights.length) {
        let batchHeight = thHeight;
        let nextR = rIdx;

        while (nextR < rowHeights.length && batchHeight + rowHeights[nextR] <= remainingSpace()) {
          batchHeight += rowHeights[nextR];
          nextR++;
        }

        // Avoid leaving single orphan rows if not at start
        const isTooSmall = (nextR - rIdx) < Math.min(2, rowHeights.length - rIdx) && curHeight > 0;
        if (nextR === rIdx || isTooSmall) {
          if (curHeight === 0 && nextR === rIdx) {
            nextR = rIdx + 1; // force at least 1 row if empty column
          } else {
            startNewColumn();
            continue;
          }
        }

        const isFullTable = rIdx === 0 && nextR === rowHeights.length;
        columns[columns.length - 1].push(
          isFullTable ? { i } : { i, r0: rIdx, r1: nextR }
        );
        curHeight += batchHeight;
        rIdx = nextR;

        if (rIdx < rowHeights.length) {
          startNewColumn();
        }
      }
      continue;
    }

    // 2. Try splitting unordered or ordered lists across columns
    const lHeights = listRowHeights?.[i];
    if (lHeights && lHeights.length > 1 && (block.t === 'ul' || block.t === 'ol')) {
      let itemIdx = 0;
      while (itemIdx < lHeights.length) {
        let batchHeight = 0;
        let nextItem = itemIdx;

        while (nextItem < lHeights.length && batchHeight + lHeights[nextItem] <= remainingSpace()) {
          batchHeight += lHeights[nextItem];
          nextItem++;
        }

        // Need at least 1 item; if none fit and not top of column, start new column
        if (nextItem === itemIdx) {
          if (curHeight > 0) {
            startNewColumn();
            continue;
          } else {
            nextItem = itemIdx + 1; // force 1 item
            batchHeight = lHeights[itemIdx] || 20;
          }
        }

        const isFullList = itemIdx === 0 && nextItem === lHeights.length;
        columns[columns.length - 1].push(
          isFullList ? { i } : { i, r0: itemIdx, r1: nextItem }
        );
        curHeight += batchHeight;
        itemIdx = nextItem;

        if (itemIdx < lHeights.length) {
          startNewColumn();
        }
      }
      continue;
    }

    // 3. Try splitting long paragraphs across columns to achieve true zero overflow
    if (block.t === 'p') {
      const activeText = item.subText ?? block.text;
      const curSpace = remainingSpace();

      // If there's room for at least 2 lines (>= 36px) or if we are at top of column and paragraph exceeds column height
      if ((curSpace >= 36 && curHeight > 0) || (curHeight === 0 && bHeight > maxColumnHeight - PADDING_SAFETY_MARGIN)) {
        const targetRatio = curHeight === 0
          ? (maxColumnHeight - PADDING_SAFETY_MARGIN) / bHeight
          : curSpace / bHeight;

        const splitResult = splitParagraphText(activeText, targetRatio);
        if (splitResult) {
          const [firstPart, secondPart] = splitResult;
          const firstHeight = Math.max(20, Math.min(bHeight - 20, Math.round(bHeight * (firstPart.length / activeText.length))));
          const secondHeight = Math.max(20, bHeight - firstHeight);

          // Add first part to current column
          columns[columns.length - 1].push({ i, subText: firstPart });
          curHeight += firstHeight;

          // Start new column and put second part into queue
          startNewColumn();
          queue.unshift({
            blockIndex: i,
            subText: secondPart,
            overrideHeight: secondHeight,
          });
          continue;
        }
      }
    }

    // Block didn't fit and couldn't be split: move to next column
    if (curHeight > 0) {
      startNewColumn();
    }
    columns[columns.length - 1].push({ i, subText: item.subText });
    curHeight += bHeight;
  }

  // Remove trailing completely empty columns except the first
  while (columns.length > 1 && columns[columns.length - 1].length === 0) {
    columns.pop();
  }

  return columns;
};

export const assemblePages = (
  columns: ChunkedBlockRef[][],
  blocks: Block[],
  columnsPerPage: number
): PageLayout[] => {
  const pages: PageLayout[] = [];

  for (let i = 0; i < columns.length; i += columnsPerPage) {
    const pageCols = columns.slice(i, i + columnsPerPage);

    // Filter out arbitrary blank pages:
    // If every column on this page is empty and we already have pages, skip it!
    const hasAnyContent = pageCols.some(col => col.length > 0);
    if (!hasAnyContent) {
      continue;
    }

    // Pad if last page has fewer columns than layout
    while (pageCols.length < columnsPerPage) {
      pageCols.push([]);
    }

    // Identify active chapter/section heading
    let activeSection = '';
    for (let c = 0; c < pageCols.length; c++) {
      for (const item of pageCols[c]) {
        const b = blocks[item.i];
        if (b && b.t === 'h1') {
          activeSection = b.text;
        }
      }
    }

    // Fallback to previous page's section or document's first h1
    if (!activeSection && pages.length > 0) {
      activeSection = pages[pages.length - 1].section;
    }
    if (!activeSection) {
      const firstH1 = blocks.find(b => b.t === 'h1');
      activeSection = firstH1 && firstH1.t === 'h1' ? firstH1.text : '';
    }

    pages.push({
      columns: pageCols,
      section: activeSection,
    });
  }

  // Remove any trailing pages where all columns are empty
  while (pages.length > 1 && pages[pages.length - 1].columns.every(col => col.length === 0)) {
    pages.pop();
  }

  if (pages.length === 0) {
    pages.push({ columns: [[]], section: '' });
  }

  return pages;
};
