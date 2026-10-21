# EbookGen - Gyankunj Studio E-Book & Study Notes Designer

A professional Hindi/English E-Book and Study Notes Creator web application with live pagination preview, customizable templates, interactive quiz & mindmap blocks, teacher branding, and print/PDF export.

---

## ✨ Features

- **📖 Real-time Pagination & Page Previews**: Live multi-page rendering with auto page-budget calculation, margins, headers, and footers.
- **🎨 Multiple Color Themes & Presets**: Vibrant UPSC, NCERT, Gyan Navy, Slate Royal, Emerald, Crimson, and Dark modes.
- **📑 Rich Content Blocks**:
  - Theory & Markdown chapters
  - Bullet summaries and highlight callouts
  - Formula boxes & mathematical definitions
  - Interactive MCQs & Practice Quiz cards
  - Flowcharts & visual mindmap blocks
  - Custom tables & vocabulary lists
- **👨‍🏫 Teacher & Coaching Branding**: Add coaching logos, watermarks, teacher signatures, contact details, and social links.
- **🖨️ Clean PDF & Print Export**: Optimized `@media print` layout without arbitrary blank pages, broken blocks, or split cards.
- **💾 Local Auto-save & Export/Import**: Save books locally and export projects to JSON anytime.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kshitiz2007-cpu/EbookGen.git
   cd EbookGen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Print Engine**: Pure CSS `@media print` with custom pagination manager

## New Features Added (v3.2)

### 1. Multi-File Markdown (`.md`) Batch E-book Builder (`src/utils/ebookBuilder.ts` & `src/components/BatchMarkdownModal.tsx`)
- **Batch Upload & Drag-and-Drop**: Select or drag-and-drop multiple `.md` / `.txt` files at once to build a large multi-chapter ebook in one go.
- **Natural File Sorting & Reordering**: Automatically orders files naturally (`01_intro.md`, `02_basics.md`, `10_summary.md`) with manual Up/Down reordering before import.
- **Import Modes**:
  - **Replace (`replace`)**: Erases existing/template chapters and builds a brand-new ebook from the uploaded `.md` files.
  - **Append (`append`)**: Appends the uploaded `.md` files as chapters to the current ebook.
  - **Merge Single (`merge-single`)**: Merges all uploaded `.md` files into a single unified chapter stream.
- **Consistent Styling & Content Flow Normalization (`normalizeMarkdownForConsistentFlow`)**:
  - Extracts YAML frontmatter (`title`, `subtitle`, `institute`, `address`, `author`, `edition`, `exam`, `subject`) from the first file and strips frontmatter headers from chapter bodies.
  - Standardizes heading hierarchy (`# H1` through `### H3`, normalizing `#### H4+` to `### H3`) and ensures every chapter has a top-level `# H1` heading for uniform Table of Contents (`TOC`) and running page headers.
  - Supports **Continuous Flow** (`newPageH1: false`, stripping stray internal page breaks and horizontal rules so chapters flow seamlessly across columns and pages) or **Fresh Page per Chapter** (`newPageH1: true`).
  - Optionally splits single `.md` files containing multiple `# H1` sections into separate chapters (`splitByH1`) and normalizes callout blockquotes (`> **Note:**`, `> तथ्य:`, etc.), list markers, and Hindi punctuation (`।`, `॥`).

### 2. Erase Template Content & Create New E-book (`eraseTemplateAndCreateNewEbook`)
- **1-Click Blank E-book & Custom New E-book Studio**: Completely erases default sample/template chapters (`ch-1`..`ch-4`) and starts a fresh ebook with either a single blank chapter or custom starter chapters.
- **Preserve or Reset Styling**: Keeps your active theme palette, typography, column layout, heading styles, and header/footer configuration (`keepStyling: true`) while wiping template text, with an option to clear template brand/institute metadata (`clearBrandMetadata: true`).
- **Persistence Fix**: Fixed `loadInitialSettings()` in `src/App.tsx` so deleted default chapters are never re-injected from `DEFAULT_BOOK_SETTINGS` on reload.
