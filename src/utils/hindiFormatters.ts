/**
 * Hindi & Bilingual Text Formatting Utilities
 */

export const cleanHindiTypography = (text: string): string => {
  // Split by code blocks to avoid altering mermaid charts, svg code, or tables
  const lines = text.split('\n');
  let inCodeBlock = false;
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('```') || trimmed.startsWith('<svg') || trimmed.startsWith('</svg>')) {
      if (trimmed.startsWith('```')) inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inCodeBlock || trimmed.startsWith('|') || trimmed.startsWith('%%')) {
      return line;
    }
    let res = line;
    // Replace standalone vertical bars used at sentence end with Devanagari Danda
    res = res.replace(/(\S)\s*\|\s*$/g, '$1।');
    res = res.replace(/(\S)\s*\|\s+(\S)/g, '$1। $2');
    // Double vertical bars to double danda
    res = res.replace(/\|\|/g, '॥');
    // Normalize quotes
    res = res.replace(/[""]/g, '"').replace(/['']/g, "'");
    return res;
  });

  return processed.join('\n');
};

export const calculateReadingTime = (wordCount: number): string => {
  const wpm = 180; // Standard Hindi/English study reading speed
  const mins = Math.ceil(wordCount / wpm);
  if (mins <= 1) return 'लगभग 1 मिनट पठन';
  return `लगभग ${mins} मिनट पठन`;
};

export const SNIPPETS = {
  h1: '\n# नया अध्याय शीर्षक (H1)\n',
  h2: '\n## महत्वपूर्ण उप-शीर्षक (H2)\n',
  h3: '\n### मुख्य बिंदु (H3)\n',
  fact: '\n> तथ्य: यहाँ महत्वपूर्ण तथ्य या आँकड़ा लिखें।\n',
  note: '\n> नोट: यहाँ विशेष टिप्पणी अथवा अपवाद लिखें।\n',
  tip: '\n> याद रखें: परीक्षा में सीधे पूछे जाने वाले सूत्र या संकेत।\n',
  warning: '\n> चेतावनी: सामान्यतः होने वाली गलतियाँ और सावधानियाँ।\n',
  quote: '\n> "यहाँ कोई प्रेरक अथवा संवैधानिक उद्धरण लिखें।"\n',
  table: `
| क्रम | विषय / प्रावधान | अनुच्छेद / वर्ष |
|---|---|---|
| 1 | मौलिक अधिकार | अनुच्छेद 12-35 |
| 2 | नीति निदेशक तत्व | अनुच्छेद 36-51 |
| 3 | मौलिक कर्तव्य | अनुच्छेद 51A |
`,
  mcq: `
[MCQ]
Q: संविधान के किस भाग में संघ राज्य क्षेत्रों का उल्लेख है?
(A) भाग VI
(B) भाग VII
(C) भाग VIII
(D) भाग IX
Ans: C
Exp: संविधान के भाग VIII (अनुच्छेद 239-241) में संघ राज्य क्षेत्रों के प्रशासन के संबंध में विशेष उपबंध हैं।
[/MCQ]
`,
  mermaid: `
\`\`\`mermaid [शीर्षक: संघ राज्य प्रशासन संरचना | विवरण: प्रशासनिक सोपान]
graph TD
  A[राष्ट्रपति] --> B[उपराज्यपाल / प्रशासक]
  B --> C[मुख्यमंत्री एवं मंत्रिपरिषद]
  B --> D[मुख्य सचिव]
  C --> E[विधानसभा (दिल्ली, पुदुचेरी, J&K)]
  D --> F[विभागीय सचिव व निदेशालय]
\`\`\`
`,
  svg: `
\`\`\`svg [शीर्षक: 3-स्तरीय प्रशासनिक चक्र]
<svg viewBox="0 0 520 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0c2d49" />
      <stop offset="100%" stop-color="#1d5f80" />
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1d5f80" />
      <stop offset="100%" stop-color="#c39a48" />
    </linearGradient>
    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8e1934" />
      <stop offset="100%" stop-color="#c39a48" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15" />
    </filter>
  </defs>
  <!-- Step 1 -->
  <g filter="url(#shadow)">
    <rect x="10" y="20" width="145" height="80" rx="10" fill="url(#g1)" />
    <circle cx="35" cy="40" r="14" fill="#ffffff" fill-opacity="0.2" />
    <text x="35" y="45" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">01</text>
    <text x="35" y="70" font-family="system-ui, 'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#ffffff">नीति निर्धारण</text>
    <text x="35" y="86" font-family="system-ui, 'Noto Sans Devanagari', sans-serif" font-size="10" fill="#e2e8f0">संसद व मंत्रिमंडल</text>
  </g>
  <!-- Arrow 1 -->
  <path d="M 165 60 L 185 60" stroke="#c39a48" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow)" />
  <!-- Step 2 -->
  <g filter="url(#shadow)">
    <rect x="190" y="20" width="145" height="80" rx="10" fill="url(#g2)" />
    <circle cx="215" cy="40" r="14" fill="#ffffff" fill-opacity="0.2" />
    <text x="215" y="45" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">02</text>
    <text x="215" y="70" font-family="system-ui, 'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#ffffff">क्रियान्वयन</text>
    <text x="215" y="86" font-family="system-ui, 'Noto Sans Devanagari', sans-serif" font-size="10" fill="#fef08a">उपराज्यपाल / मुख्य सचिव</text>
  </g>
  <!-- Arrow 2 -->
  <path d="M 345 60 L 365 60" stroke="#c39a48" stroke-width="3" stroke-linecap="round" />
  <!-- Step 3 -->
  <g filter="url(#shadow)">
    <rect x="370" y="20" width="140" height="80" rx="10" fill="url(#g3)" />
    <circle cx="395" cy="40" r="14" fill="#ffffff" fill-opacity="0.2" />
    <text x="395" y="45" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">03</text>
    <text x="395" y="70" font-family="system-ui, 'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#ffffff">न्यायिक समीक्षा</text>
    <text x="395" y="86" font-family="system-ui, 'Noto Sans Devanagari', sans-serif" font-size="10" fill="#fecdd3">उच्च व सर्वोच्च न्यायालय</text>
  </g>
</svg>
\`\`\`
`,
  qrcode: '\n[QR: https://example.com/lecture | वीडियो लेक्चर देखें]\n',
  signature: '\n[SIGN: डॉ. ज्ञान प्रकाश | विभागाध्यक्ष (सिविल सेवा प्रकोष्ठ)]\n',
  pagebreak: '\n===\n',
};
