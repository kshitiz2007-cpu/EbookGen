/**
 * Color and contrast calculation utilities (WCAG AA compliance)
 */

export const DARK_INK = '#0b1b2b';
export const LIGHT_PAPER = '#fffefa';

export const parseHex = (hex: string | null | undefined): string | null => {
  let val = String(hex ?? '').trim();
  if (val && val[0] !== '#') val = '#' + val;
  if (/^#[0-9a-f]{3}$/i.test(val)) {
    val = '#' + [...val.slice(1)].map(c => c + c).join('');
  }
  return /^#[0-9a-f]{6}$/i.test(val) ? val.toLowerCase() : null;
};

export const hexToRgb = (hex: string): [number, number, number] => {
  const clean = parseHex(hex) ?? '#000000';
  return [1, 3, 5].map(i => parseInt(clean.slice(i, i + 2), 16)) as [number, number, number];
};

export const getLuminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const getContrastRatio = (fg: string, bg: string): number => {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

export const getWorstContrast = (fg: string, bgColors: string[]): number => {
  return Math.min(...bgColors.map(bg => getContrastRatio(fg, bg)));
};

export const getBestTextColor = (bgColors: string[], mode: 'auto' | 'light' | 'dark' = 'auto'): string => {
  if (mode === 'light') return '#ffffff';
  if (mode === 'dark') return DARK_INK;
  const whiteRatio = getWorstContrast('#ffffff', bgColors);
  const darkRatio = getWorstContrast(DARK_INK, bgColors);
  return whiteRatio >= darkRatio ? '#ffffff' : DARK_INK;
};

export const formatContrastBadge = (ratio: number): { label: string; pass: boolean } => {
  if (ratio >= 4.5) return { label: `${ratio.toFixed(1)}:1 (Pass AA)`, pass: true };
  if (ratio >= 3.0) return { label: `${ratio.toFixed(1)}:1 (Large text)`, pass: true };
  return { label: `${ratio.toFixed(1)}:1 (Low contrast)`, pass: false };
};

export const makeGradient = (angle: number, colors: [string, string, string]): string => {
  return `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
};

export const makeSoftGradient = (angle: number, colors: [string, string, string]): string => {
  return `linear-gradient(${angle}deg, color-mix(in srgb, ${colors[0]} 14%, #fff), color-mix(in srgb, ${colors[1]} 9%, #fff) 58%, color-mix(in srgb, ${colors[2]} 18%, #fff))`;
};

export const hexToHsl = (hex: string): [number, number, number] => {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }
  return [Math.round(h), s, l];
};

export const hslToHex = (h: number, s: number, l: number): string => {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const generateHarmonicPalette = (
  baseHex: string,
  scheme: 'analogous' | 'complementary' | 'triad' | 'split' | 'mono'
): { primary: string; accent: string; secondary: string; paper: string; text: string } => {
  const [h, s] = hexToHsl(baseHex);
  const safeSat = Math.max(0.35, Math.min(0.85, s));

  // Determine dark primary for clear readability
  let priLight = 0.22;
  let primary = hslToHex(h, safeSat, priLight);
  while (getContrastRatio(primary, '#ffffff') < 5.0 && priLight > 0.08) {
    priLight -= 0.02;
    primary = hslToHex(h, safeSat, priLight);
  }

  const offsets: Record<string, [number, number]> = {
    analogous: [30, -30],
    complementary: [180, 160],
    triad: [120, 240],
    split: [150, 210],
    mono: [0, 0],
  };

  const [off1, off2] = offsets[scheme] || [30, -30];
  const accent = scheme === 'mono'
    ? hslToHex(h, safeSat * 0.9, 0.62)
    : hslToHex(h + off1, Math.max(0.55, safeSat), 0.52);

  let secLight = scheme === 'mono' ? 0.28 : 0.36;
  let secondary = scheme === 'mono'
    ? hslToHex(h, safeSat, secLight)
    : hslToHex(h + off2, Math.max(0.5, safeSat), secLight);

  while (getContrastRatio(secondary, LIGHT_PAPER) < 4.5 && secLight > 0.12) {
    secLight -= 0.02;
    secondary = hslToHex(scheme === 'mono' ? h : h + off2, Math.max(0.5, safeSat), secLight);
  }

  return {
    primary,
    accent,
    secondary,
    paper: hslToHex(h, 0.35, 0.985),
    text: hslToHex(h, 0.25, 0.12),
  };
};
