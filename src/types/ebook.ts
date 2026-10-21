/**
 * Gyankunj Studio - Types & Interfaces
 */

export interface ThemeColors {
  key: string;
  primary: string;
  accent: string;
  secondary: string;
  paper: string;
  text: string;
}

export interface TypeSettings {
  font: 'noto' | 'serif' | 'mukta' | 'system';
  headFont: 'same' | 'serif' | 'display' | 'system';
  size: number;
  line: number;
  headScale: number;
  tableSize: number;
  align: 'justify' | 'left';
  indent: boolean;
  dropcap: boolean;
  hyphens: boolean;
}

export interface LayoutSettings {
  columns: 1 | 2;
  padX: number;
  padY: number;
  radius: number;
  frame: 'none' | 'thin' | 'double' | 'top' | 'corners';
  pageStyle: 'clean' | 'soft' | 'paper' | 'modern';
  newPageH1: boolean;
  pattern: 'none' | 'dots' | 'grid' | 'lines' | 'diag';
  patternOpacity: number;
  guides: boolean;
}

export interface HeadingsSettings {
  h1: 'rule' | 'band' | 'left' | 'center' | 'gradient';
  h2: 'left' | 'band' | 'underline' | 'numbered' | 'gradient';
  h3: 'accent' | 'pill' | 'underline' | 'plain' | 'gradient';
  table: 'striped' | 'grid' | 'minimal' | 'cards';
  callout: 'left' | 'filled' | 'border';
  list: 'classic' | 'check' | 'compact';
  gradPreset: string;
  g: [string, string, string];
  gAng: number;
}

export interface BrandSettings {
  showCover: boolean;
  showHeader: boolean;
  showTitleBar: boolean;
  showFooter: boolean;
  showAddress: boolean;
  showPageNumber: boolean;
  compactHeader: boolean;
  coverStyle: 'thematic' | 'premium' | 'split' | 'mesh' | 'ornate' | 'minimal';
  subject: string;
  authorName: string;
  edition: string;
  examTag: string;
  signatureStamp?: {
    enabled: boolean;
    name: string;
    designation: string;
  };
}

export interface WatermarkSettings {
  on: boolean;
  text: string;
  opacity: number;
  angle: number;
  size: number;
  color: 'primary' | 'accent' | 'secondary';
}

export interface TocSettings {
  on: boolean;
  title: string;
  depth: 1 | 2;
}

export interface HeaderFooterSettings {
  hs: 'keep' | 'band' | 'aurora' | 'glass' | 'under' | 'diag' | 'angle' | 'outline';
  fs: 'keep' | 'band' | 'aurora' | 'glass' | 'line' | 'angle' | 'outline';
  edge: 'none' | 'top' | 'bottom' | 'both' | 'corners' | 'frame';
  pn: 'keep' | 'pill' | 'badge' | 'outline' | 'plain';
  logo: 'ring' | 'glass' | 'none';
  tm: 'auto' | 'light' | 'dark';
  ang: number;
  glow: number;
  link: boolean;
  mirror: boolean;
  live: boolean;
  h: [string, string, string];
  f: [string, string, string];
  ink: string;
}

export interface Chapter {
  id: string;
  title: string;
  source: string;
}

export interface LibraryItem {
  id: string;
  name: string;
  at: number;
  data: Partial<EbookSettings>;
}

export interface EbookSettings {
  title: string;
  subtitle: string;
  institute: string;
  address: string;
  theme: ThemeColors;
  type: TypeSettings;
  layout: LayoutSettings;
  heads: HeadingsSettings;
  brand: BrandSettings;
  watermark: WatermarkSettings;
  toc: TocSettings;
  hf: HeaderFooterSettings;
  hfApplied: HeaderFooterSettings | null;
  chapters: Chapter[];
  activeChapterId: string;
  library: LibraryItem[];
}

export type Block =
  | { t: 'h1'; text: string }
  | { t: 'h2'; text: string }
  | { t: 'h3'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'callout'; kind: 'fact' | 'note' | 'tip' | 'warning' | 'quote'; label?: string; text: string }
  | {
      t: 'mcq';
      question: string;
      options: { key: string; text: string }[];
      answer?: string;
      explanation?: string;
    }
  | { t: 'qrcode'; url: string; label: string }
  | { t: 'pagebreak' }
  | { t: 'signature'; name: string; title: string }
  | {
      t: 'mermaid';
      chart: string;
      title?: string;
      caption?: string;
      align?: 'center' | 'left' | 'right';
    }
  | {
      t: 'svg';
      svgCode: string;
      title?: string;
      caption?: string;
      align?: 'center' | 'left' | 'right';
      width?: string;
    };

export interface ChunkedBlockRef {
  i: number;
  r0?: number;
  r1?: number;
  subText?: string;
}

export interface PageLayout {
  columns: ChunkedBlockRef[][];
  section: string;
  chapterId?: string;
  chapterTitle?: string;
}
