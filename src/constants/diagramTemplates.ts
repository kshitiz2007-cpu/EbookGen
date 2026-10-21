/**
 * Designer Flowcharts & Diagram Templates for Gyankunj Studio
 * Authentic bilingual templates for Indian Civil Services, State PSCs, Academics & Notes.
 */

export interface DiagramTemplate {
  id: string;
  type: 'mermaid' | 'svg';
  category: 'polity' | 'process' | 'hierarchy' | 'timeline' | 'comparison' | 'cycle';
  title: string;
  hindiTitle: string;
  description: string;
  code: string;
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  // 1. Mermaid: Constitutional Law-Making Process
  {
    id: 'mm-law-making',
    type: 'mermaid',
    category: 'polity',
    title: 'Parliamentary Law-Making Process',
    hindiTitle: 'संसद में विधेयक पारित होने की प्रक्रिया',
    description: 'प्रथम वाचन से राष्ट्रपति की सहमति एवं राजपत्र में प्रकाशन तक का संपूर्ण प्रवाह।',
    code: `\`\`\`mermaid [शीर्षक: विधि निर्माण प्रक्रिया | विवरण: साधारण विधेयक का पारित होना]
graph TD
  A[विधेयक की प्रस्तुति<br/>प्रथम वाचन] --> B[विस्तृत चर्चा व प्रवर समिति<br/>द्वितीय वाचन]
  B --> C[मतदान व पारगमन<br/>तृतीय वाचन]
  C --> D{दूसरे सदन में प्रस्तुति}
  D -->|सहमति| E[राष्ट्रपति के समक्ष प्रस्तुति]
  D -->|गतिरोध 6 माह| F[संयुक्त बैठक<br/>अनुच्छेद 108]
  F --> E
  E -->|हस्ताक्षर| G[अधिनियम / कानून<br/>राजपत्र में अधिसूचित]
  E -->|पुनर्विचार / वीटो| H[संसद को वापसी]
\`\`\``,
  },

  // 2. Mermaid: 3 Organs of State
  {
    id: 'mm-state-organs',
    type: 'mermaid',
    category: 'hierarchy',
    title: 'Three Organs of the State',
    hindiTitle: 'राज्य के तीन अंग (विधायिका, कार्यपालिका, न्यायपालिका)',
    description: 'संविधान के अंतर्गत शक्ति पृथक्करण एवं नियंत्रण-संतुलन की व्यवस्था।',
    code: `\`\`\`mermaid [शीर्षक: भारतीय शासन के तीन प्रमुख अंग | विवरण: शक्ति पृथक्करण एवं नियंत्रण]
graph TD
  Gov[भारतीय राज्य व्यवस्था]
  
  Gov --> Leg[विधायिका / Legislature<br/>संसद व विधानसभाएं]
  Gov --> Exec[कार्यपालिका / Executive<br/>राष्ट्रपति, पीएम व मंत्रिपरिषद]
  Gov --> Jud[न्यायपालिका / Judiciary<br/>सर्वोच्च व उच्च न्यायालय]

  Leg -->|विधि निर्माण| Laws[कानून व नीतियां]
  Exec -->|क्रियान्वयन| Admin[लोक प्रशासन]
  Jud -->|संविधान का संरक्षक| Review[न्यायिक पुनरावलोकन]

  Leg -.->|प्रश्नकाल / अविश्वास| Exec
  Exec -.->|न्यायाधीशों की नियुक्ति| Jud
  Jud -.->|मूल ढांचा सिद्धांत| Leg
\`\`\``,
  },

  // 3. Mermaid: Union Territories Hierarchy
  {
    id: 'mm-ut-hierarchy',
    type: 'mermaid',
    category: 'polity',
    title: 'Union Territories Administration Hierarchy',
    hindiTitle: 'संघ राज्य क्षेत्र प्रशासनिक संरचना',
    description: 'अनुच्छेद 239 के अंतर्गत राष्ट्रपति से लेकर ज़िला प्रशासन तक की श्रृंखला।',
    code: `\`\`\`mermaid [शीर्षक: संघ राज्य प्रशासन संरचना | विवरण: अनुच्छेद 239 के अंतर्गत प्रशासनिक सोपान]
graph TD
  Pres[भारत के राष्ट्रपति<br/>अनुच्छेद 239] --> MHA[गृह मंत्रालय<br/>नोडल केंद्रीय मंत्रालय]
  MHA --> LG[उपराज्यपाल / प्रशासक<br/>LG / Administrator]
  LG --> CM[मुख्यमंत्री एवं मंत्रिपरिषद<br/>दिल्ली, पुदुचेरी, J&K]
  LG --> CS[मुख्य सचिव / सलाहकार<br/>Chief Secretary / Advisor]
  CM --> Leg[विधानसभा / Legislative Assembly]
  CS --> Depts[विभागीय सचिव व निदेशालय]
  Depts --> Dist[जिला मजिस्ट्रेट / उपायुक्त]
\`\`\``,
  },

  // 4. Mermaid: Historical Timeline of Key Acts
  {
    id: 'mm-timeline',
    type: 'mermaid',
    category: 'timeline',
    title: 'Constitutional Evolution Timeline',
    hindiTitle: 'संवैधानिक विकास का ऐतिहासिक कालक्रम',
    description: '1773 से 1950 तक के प्रमुख ऐतिहासिक पड़ाव।',
    code: `\`\`\`mermaid [शीर्षक: भारत में संवैधानिक विकास | विवरण: प्रमुख मील के पत्थर]
timeline
  title भारतीय संविधान निर्माण यात्रा
  1773 : रेगुलेटिंग एक्ट : सुप्रीम कोर्ट की स्थापना
  1858 : भारत सरकार अधिनियम : कंपनी शासन का अंत, क्राउन का प्रत्यक्ष शासन
  1909 : मार्ले-मिंटो सुधार : पृथक निर्वाचन प्रणाली की शुरुआत
  1919 : मोंटेग्यू-चेम्सफोर्ड : प्रांतों में द्वैध शासन प्रणाली
  1935 : भारत सरकार अधिनियम : अखिल भारतीय संघ, प्रांतीय स्वायत्तता
  1946 : कैबिनेट मिशन : संविधान सभा का गठन
  1950 : 26 जनवरी : संविधान पूर्णतः लागू, गणतंत्र दिवस
\`\`\``,
  },

  // 5. Mermaid: Policy Decision Cycle
  {
    id: 'mm-policy-cycle',
    type: 'mermaid',
    category: 'cycle',
    title: 'Public Policy Formulation Cycle',
    hindiTitle: 'लोक नीति निर्माण एवं मूल्यांकन चक्र',
    description: 'समस्या पहचान से लेकर नीति प्रभाव मूल्यांकन तक का 5-चरणीय चक्र।',
    code: `\`\`\`mermaid [शीर्षक: लोक नीति निर्माण चक्र | विवरण: नीति-निर्माण के प्रमुख चरण]
graph LR
  A[1. समस्या की पहचान<br/>एजेंडा निर्धारण] --> B[2. नीति प्रारूप निर्माण<br/>विशेषज्ञ व नागरिक परामर्श]
  B --> C[3. विधायी स्वीकृति<br/>कैबिनेट व संसद अनुमोदन]
  C --> D[4. ज़मीनी क्रियान्वयन<br/>प्रशासनिक मशीनरी]
  D --> E[5. सामाजिक अंकेक्षण<br/>प्रभाव व परिणाम समीक्षा]
  E --> A
\`\`\``,
  },

  // 6. SVG: 3-Stage Process Pipeline
  {
    id: 'svg-3step-pipeline',
    type: 'svg',
    category: 'process',
    title: '3-Stage Conceptual Process (Designer Vector)',
    hindiTitle: '3-स्तरीय संकल्पनात्मक प्रक्रिया (डिज़ाइनर वेक्टर)',
    description: 'सुंदर ग्रेडिएंट कार्ड्स, क्रमांक बैज और प्रवाह तीर।',
    code: `\`\`\`svg [शीर्षक: त्रि-स्तरीय प्रशासनिक प्रक्रिया | विवरण: प्रारंभिक, मुख्य एवं साक्षात्कार चरण]
<svg viewBox="0 0 540 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto">
  <defs>
    <linearGradient id="gk-step1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c2d49" />
      <stop offset="100%" stop-color="#1d5f80" />
    </linearGradient>
    <linearGradient id="gk-step2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d5f80" />
      <stop offset="100%" stop-color="#c39a48" />
    </linearGradient>
    <linearGradient id="gk-step3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8e1934" />
      <stop offset="100%" stop-color="#c39a48" />
    </linearGradient>
    <filter id="gk-shadow" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.14" />
    </filter>
  </defs>

  <!-- Card 1 -->
  <g filter="url(#gk-shadow)">
    <rect x="10" y="16" width="150" height="88" rx="12" fill="url(#gk-step1)" />
    <circle cx="36" cy="38" r="14" fill="#ffffff" fill-opacity="0.22" />
    <text x="36" y="43" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">01</text>
    <text x="30" y="70" font-family="'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#ffffff">प्रारंभिक चरण</text>
    <text x="30" y="87" font-family="'Noto Sans Devanagari', sans-serif" font-size="10" fill="#e2e8f0">अवधारणा व तथ्यात्मक समझ</text>
  </g>

  <!-- Connector Arrow 1 -->
  <g stroke="#c39a48" stroke-width="2.5" stroke-linecap="round" fill="none">
    <path d="M 168 60 L 190 60" />
    <path d="M 184 55 L 191 60 L 184 65" fill="#c39a48" />
  </g>

  <!-- Card 2 -->
  <g filter="url(#gk-shadow)">
    <rect x="195" y="16" width="150" height="88" rx="12" fill="url(#gk-step2)" />
    <circle cx="221" cy="38" r="14" fill="#ffffff" fill-opacity="0.22" />
    <text x="221" y="43" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">02</text>
    <text x="215" y="70" font-family="'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#ffffff">मुख्य विश्लेषण</text>
    <text x="215" y="87" font-family="'Noto Sans Devanagari', sans-serif" font-size="10" fill="#fef08a">आलोचनात्मक एवं नीतिगत पक्ष</text>
  </g>

  <!-- Connector Arrow 2 -->
  <g stroke="#c39a48" stroke-width="2.5" stroke-linecap="round" fill="none">
    <path d="M 353 60 L 375 60" />
    <path d="M 369 55 L 376 60 L 369 65" fill="#c39a48" />
  </g>

  <!-- Card 3 -->
  <g filter="url(#gk-shadow)">
    <rect x="380" y="16" width="150" height="88" rx="12" fill="url(#gk-step3)" />
    <circle cx="406" cy="38" r="14" fill="#ffffff" fill-opacity="0.22" />
    <text x="406" y="43" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">03</text>
    <text x="400" y="70" font-family="'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#ffffff">निष्कर्ष व समाधान</text>
    <text x="400" y="87" font-family="'Noto Sans Devanagari', sans-serif" font-size="10" fill="#fecdd3">भविष्योन्मुखी दृष्टिकोण</text>
  </g>
</svg>
\`\`\``,
  },

  // 7. SVG: 4-Quadrant Circular Cycle
  {
    id: 'svg-circular-cycle',
    type: 'svg',
    category: 'cycle',
    title: '4-Phase Strategic Loop (Circular Vector)',
    hindiTitle: '4-चरणीय निरंतर रणनीति चक्र',
    description: 'योजना, क्रियान्वयन, निगरानी एवं सुधार का वृत्ताकार वेक्टर।',
    code: `\`\`\`svg [शीर्षक: सतत प्रशासनिक सुधार चक्र | विवरण: PDCA मॉडल (योजना-क्रियान्वयन-जाँच-सुधार)]
<svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto">
  <defs>
    <filter id="c-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Center Hub -->
  <circle cx="230" cy="110" r="42" fill="#0c2d49" filter="url(#c-shadow)" />
  <text x="230" y="106" font-family="'Noto Sans Devanagari', sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">सतत</text>
  <text x="230" y="122" font-family="'Noto Sans Devanagari', sans-serif" font-size="11" font-weight="bold" fill="#c39a48" text-anchor="middle">सुधार चक्र</text>

  <!-- Top-Left: Plan -->
  <g filter="url(#c-shadow)">
    <rect x="25" y="18" width="140" height="65" rx="10" fill="#ffffff" stroke="#1d5f80" stroke-width="2" />
    <text x="38" y="42" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" font-weight="bold" fill="#0c2d49">1. योजना (Plan)</text>
    <text x="38" y="60" font-family="'Noto Sans Devanagari', sans-serif" font-size="9.5" fill="#64748b">लक्ष्य व रूपरेखा तय करना</text>
  </g>

  <!-- Top-Right: Do -->
  <g filter="url(#c-shadow)">
    <rect x="295" y="18" width="140" height="65" rx="10" fill="#ffffff" stroke="#c39a48" stroke-width="2" />
    <text x="308" y="42" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" font-weight="bold" fill="#8e1934">2. क्रियान्वयन (Do)</text>
    <text x="308" y="60" font-family="'Noto Sans Devanagari', sans-serif" font-size="9.5" fill="#64748b">ज़मीनी स्तर पर संचालन</text>
  </g>

  <!-- Bottom-Right: Check -->
  <g filter="url(#c-shadow)">
    <rect x="295" y="135" width="140" height="65" rx="10" fill="#ffffff" stroke="#15803d" stroke-width="2" />
    <text x="308" y="159" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" font-weight="bold" fill="#064e3b">3. निगरानी (Check)</text>
    <text x="308" y="177" font-family="'Noto Sans Devanagari', sans-serif" font-size="9.5" fill="#64748b">परिणामों का सटीक मूल्यांकन</text>
  </g>

  <!-- Bottom-Left: Act -->
  <g filter="url(#c-shadow)">
    <rect x="25" y="135" width="140" height="65" rx="10" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
    <text x="38" y="159" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" font-weight="bold" fill="#0b3a75">4. सुधार (Act)</text>
    <text x="38" y="177" font-family="'Noto Sans Devanagari', sans-serif" font-size="9.5" fill="#64748b">कमियों को दूर करना</text>
  </g>

  <!-- Connecting Arcs -->
  <path d="M 170 45 Q 230 20 290 45" stroke="#c39a48" stroke-width="2.5" fill="none" stroke-dasharray="4 3" />
  <path d="M 370 88 Q 395 110 370 132" stroke="#c39a48" stroke-width="2.5" fill="none" stroke-dasharray="4 3" />
  <path d="M 290 170 Q 230 195 170 170" stroke="#c39a48" stroke-width="2.5" fill="none" stroke-dasharray="4 3" />
  <path d="M 90 132 Q 65 110 90 88" stroke="#c39a48" stroke-width="2.5" fill="none" stroke-dasharray="4 3" />
</svg>
\`\`\``,
  },

  // 8. SVG: 2-Pillar Comparison Vector
  {
    id: 'svg-comparison-pillars',
    type: 'svg',
    category: 'comparison',
    title: 'Dual Pillar Comparison (Designer Vector)',
    hindiTitle: 'द्वि-स्तंभीय तुलनात्मक आरेख (राज्यों बनाम संघ राज्य क्षेत्र)',
    description: 'दो प्रमुख प्रणालियों के बीच स्पष्ट तुलनात्मक स्तंभ।',
    code: `\`\`\`svg [शीर्षक: राज्य बनाम संघ राज्य क्षेत्र तुलनात्मक स्तंभ | विवरण: संवैधानिक स्थिति एवं अधिकार]
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto">
  <defs>
    <filter id="p-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1" />
    </filter>
  </defs>

  <!-- Pillar 1: States -->
  <g filter="url(#p-shadow)">
    <rect x="20" y="15" width="230" height="150" rx="10" fill="#f8fafc" stroke="#0c2d49" stroke-width="2" />
    <path d="M 20 15 Q 20 15 250 15 L 250 45 L 20 45 Z" fill="#0c2d49" />
    <text x="135" y="34" font-family="'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">पूर्ण राज्य (States)</text>
    <text x="35" y="70" font-family="'Noto Sans Devanagari', sans-serif" font-size="10.5" fill="#0c2d49">✓ संविधान का भाग VI लागू</text>
    <text x="35" y="94" font-family="'Noto Sans Devanagari', sans-serif" font-size="10.5" fill="#0c2d49">✓ राज्यपाल संवैधानिक प्रमुख</text>
    <text x="35" y="118" font-family="'Noto Sans Devanagari', sans-serif" font-size="10.5" fill="#0c2d49">✓ राज्य सूची पर अनन्य विधायी अधिकार</text>
    <text x="35" y="142" font-family="'Noto Sans Devanagari', sans-serif" font-size="10.5" fill="#0c2d49">✓ संघीय व्यवस्था के वास्तविक भागीदार</text>
  </g>

  <!-- Versus Center Badge -->
  <circle cx="260" cy="90" r="18" fill="#c39a48" filter="url(#p-shadow)" />
  <text x="260" y="95" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">VS</text>

  <!-- Pillar 2: UTs -->
  <g filter="url(#p-shadow)">
    <rect x="270" y="15" width="230" height="150" rx="10" fill="#f8fafc" stroke="#8e1934" stroke-width="2" />
    <path d="M 270 15 Q 270 15 500 15 L 500 45 L 270 45 Z" fill="#8e1934" />
    <text x="385" y="34" font-family="'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">संघ राज्य क्षेत्र (UTs)</text>
    <text x="285" y="70" font-family="'Noto Sans Devanagari', sans-serif" font-size="10.5" fill="#8e1934">✓ संविधान का भाग VIII लागू</text>
    <text x="285" y="94" font-family="'Noto Sans Devanagari', sans-serif" font-size="10.5" fill="#8e1934">✓ राष्ट्रपति के प्रतिनिधि (प्रशासक/LG)</text>
    <text x="285" y="118" font-family="'Noto Sans Devanagari', sans-serif" font-size="10.5" fill="#8e1934">✓ संसद को सर्वोपरि विधायी शक्ति</text>
    <text x="285" y="142" font-family="'Noto Sans Devanagari', sans-serif" font-size="10.5" fill="#8e1934">✓ एकात्मक व्यवस्था का सीधा नियंत्रण</text>
  </g>
</svg>
\`\`\``,
  },

  // 9. SVG: 3-Circle Venn Diagram
  {
    id: 'svg-venn-diagram',
    type: 'svg',
    category: 'comparison',
    title: 'Constitutional Subjects Overlap (Venn Diagram)',
    hindiTitle: 'संघ, राज्य एवं समवर्ती सूची (वेन आरेख)',
    description: '7वीं अनुसूची के अंतर्गत विधायी शक्तियों का विभाजन।',
    code: `\`\`\`svg [शीर्षक: 7वीं अनुसूची — विधायी शक्तियों का विभाजन | विवरण: संघ, राज्य एवं समवर्ती अधिकार-क्षेत्र]
<svg viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto">
  <!-- Left Circle: Union -->
  <circle cx="180" cy="100" r="80" fill="#0c2d49" fill-opacity="0.22" stroke="#0c2d49" stroke-width="2.5" />
  
  <!-- Right Circle: State -->
  <circle cx="300" cy="100" r="80" fill="#8e1934" fill-opacity="0.22" stroke="#8e1934" stroke-width="2.5" />

  <!-- Left Content -->
  <text x="135" y="75" font-family="'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#0c2d49" text-anchor="middle">संघ सूची</text>
  <text x="135" y="95" font-family="'Noto Sans Devanagari', sans-serif" font-size="9" fill="#1e293b" text-anchor="middle">• रक्षा व विदेश मामले</text>
  <text x="135" y="110" font-family="'Noto Sans Devanagari', sans-serif" font-size="9" fill="#1e293b" text-anchor="middle">• रेलवे व बैंकिंग</text>
  <text x="135" y="125" font-family="'Noto Sans Devanagari', sans-serif" font-size="9" fill="#1e293b" text-anchor="middle">• परमाणु ऊर्जा</text>

  <!-- Overlap Content: Concurrent -->
  <text x="240" y="80" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" font-weight="bold" fill="#c39a48" text-anchor="middle">समवर्ती सूची</text>
  <text x="240" y="100" font-family="'Noto Sans Devanagari', sans-serif" font-size="8.5" font-weight="600" fill="#0c2d49" text-anchor="middle">• शिक्षा</text>
  <text x="240" y="115" font-family="'Noto Sans Devanagari', sans-serif" font-size="8.5" font-weight="600" fill="#0c2d49" text-anchor="middle">• वन व पर्यावरण</text>
  <text x="240" y="130" font-family="'Noto Sans Devanagari', sans-serif" font-size="8.5" font-weight="600" fill="#0c2d49" text-anchor="middle">• दंड विधि</text>

  <!-- Right Content -->
  <text x="345" y="75" font-family="'Noto Sans Devanagari', sans-serif" font-size="13" font-weight="bold" fill="#8e1934" text-anchor="middle">राज्य सूची</text>
  <text x="345" y="95" font-family="'Noto Sans Devanagari', sans-serif" font-size="9" fill="#1e293b" text-anchor="middle">• लोक व्यवस्था व पुलिस</text>
  <text x="345" y="110" font-family="'Noto Sans Devanagari', sans-serif" font-size="9" fill="#1e293b" text-anchor="middle">• लोक स्वास्थ्य</text>
  <text x="345" y="125" font-family="'Noto Sans Devanagari', sans-serif" font-size="9" fill="#1e293b" text-anchor="middle">• कृषि व स्थानीय शासन</text>
</svg>
\`\`\``,
  },
];
