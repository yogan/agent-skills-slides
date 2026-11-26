import type { ReactNode } from 'react';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { Step, Steps, useIsActivePage } from '@open-slide/core';
import goomba from '@assets/goomba.png';
import iconGithub from '@assets/tabler-brand-github.svg';
import iconMail from '@assets/tabler-mail.svg';
import inovexLogo from './assets/inovex-logo-white.svg';
import fontRegular from './assets/atkinson-regular.woff2';
import fontBold from './assets/atkinson-700.woff2';
import fontMono400 from './assets/atkinson-mono-400.woff2';
import fontMono700 from './assets/atkinson-mono-700.woff2';

// inovex CI, dark: Grundblau as the base, Leuchtgrün as the one readable accent,
// Leuchtblau / Logoblau only in the background and the diagram boxes.
export const design: DesignSystem = {
  palette: { bg: '#040F38', text: '#FFFFFF', accent: '#7DF481' },
  fonts: {
    display: '"Atkinson Hyperlegible", system-ui, sans-serif',
    body: '"Atkinson Hyperlegible", system-ui, sans-serif',
  },
  typeScale: { hero: 132, body: 36 },
  radius: 12,
};

const TEXT = design.palette.text;
const ACCENT = design.palette.accent;
const SANS = design.fonts.body;

const MONO = '"Atkinson Hyperlegible Mono", ui-monospace, Menlo, monospace';
const BODY = '#DFE5F0'; // Dunkelgrau — secondary body copy
const MUTED = '#A9B6D6'; // supporting copy
const DIM = '#6F7FA8'; // separators only
const GRUNDBLAU = '#061B59';
const LEUCHTBLAU_RGB = '45,93,255';
const LOGOBLAU_RGB = '10,175,232';

const FONT_STYLE_ID = 'osd-webfont-agentic-code-reviews-inovex-erlangen-2026';
if (typeof document !== 'undefined' && !document.getElementById(FONT_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = FONT_STYLE_ID;
  style.textContent = `
@font-face { font-family: 'Atkinson Hyperlegible'; font-weight: 400; font-display: block; src: url("${fontRegular}") format('woff2'); }
@font-face { font-family: 'Atkinson Hyperlegible'; font-weight: 700; font-display: block; src: url("${fontBold}") format('woff2'); }
@font-face { font-family: 'Atkinson Hyperlegible Mono'; font-weight: 400; font-display: block; src: url("${fontMono400}") format('woff2'); }
@font-face { font-family: 'Atkinson Hyperlegible Mono'; font-weight: 700; font-display: block; src: url("${fontMono700}") format('woff2'); }
`;
  document.head.appendChild(style);
}

// The Schmuckverlauf (Leuchtblau → Grundblau) as soft blooms in the corners, so the
// middle of the canvas, where the text sits, stays close to the flat base.
const TEXTURE = [
  `radial-gradient(900px 700px at 0% 0%, rgba(${LOGOBLAU_RGB},0.10), transparent 60%)`,
  `linear-gradient(160deg, ${GRUNDBLAU} 0%, #040F38 70%)`,
].join(', ');

const PAD = 120;

// The top-right light: Side Rays on the page the audience sees, and where it cannot run (a
// thumbnail, the overview, print, a machine without WebGL2) the static glow it replaced.
const CORNER_GLOW = `radial-gradient(1300px 900px at 100% 0%, rgba(${LEUCHTBLAU_RGB},0.42), transparent 65%)`;

/**
 * The official inovex mark (paths from the inovex slidev master), large and cropped by the
 * bottom-right corner, in the same place on every page: the full-colour logo on the title, a
 * faint, colourless watermark on the content pages, and gone on the close.
 *
 * The mark always changes as one image (filter and opacity on the <svg>), never piece by
 * piece: fading the pieces separately lets their anti-aliased edges add up into bright seams.
 *
 * - Title: two pages with the same content (see `Title`); the logo fades between them.
 * - Content ↔ close: the watermark fades out on entering the close, and back in on leaving it.
 *   Which way is decided by what the audience last saw, kept in module state, so content →
 *   content never animates. Thumbnails and the outgoing snapshot are not the active page, so
 *   they neither animate nor move that state.
 */
type MarkMode = 'brand' | 'faint' | 'none';
let shownMode: MarkMode | null = null;
const MARK_FAINT = 0.08;
const FAINT_FILTER = 'grayscale(1) brightness(1.6)';

const MARK_CSS = `
.aci-mark { opacity: 1; filter: none; }
.aci-mark.aci-faint { opacity: ${MARK_FAINT}; filter: ${FAINT_FILTER}; }
.aci-mark.aci-none { opacity: 0; filter: ${FAINT_FILTER}; }
.aci-mark.aci-to-faint { animation: aci-to-faint 1000ms ease-in-out both; }
.aci-mark.aci-to-brand { animation: aci-to-brand 1000ms ease-in-out both; }
@keyframes aci-to-faint { from { opacity: 1; filter: grayscale(0) brightness(1); } to { opacity: ${MARK_FAINT}; filter: ${FAINT_FILTER}; } }
@keyframes aci-to-brand { from { opacity: ${MARK_FAINT}; filter: ${FAINT_FILTER}; } to { opacity: 1; filter: grayscale(0) brightness(1); } }
.aci-mark.aci-to-none { animation: aci-to-none 700ms ease-in-out both; }
.aci-mark.aci-from-none { animation: aci-from-none 700ms ease-in-out both; }
@keyframes aci-to-none { from { opacity: ${MARK_FAINT}; } to { opacity: 0; } }
@keyframes aci-from-none { from { opacity: 0; } to { opacity: ${MARK_FAINT}; } }
@media (prefers-reduced-motion: reduce) {
  .aci-mark { animation: none !important; }
}
`;

/** One coloured piece: its flat colour plus the multiply-blended shading the original carries. */
const Fill = ({ d, fill, shade, shadeOpacity }: { d: string; fill: string; shade: string; shadeOpacity: number }) => (
  <g>
    <path d={d} fill={fill} />
    <path d={d} fill={`url(#${shade})`} style={{ mixBlendMode: 'multiply' }} opacity={shadeOpacity} />
  </g>
);

const P_GREEN = 'm38.75484,23.48243c-.37175.3718-.53897.86633-.51441,1.35311l.00584.05837,16.94601-4.55691.05459-.05838h0l12.20318-3.26984.13132-.08946-2.1303-7.37067L63.02446.11571l-.13134-.11335c-.42641.02153-.84693.18881-1.17259.51447l-22.96569,22.9656Z';
const P_SKY = 'm67.45005,17.00878h0l3.26985,12.20317.13675.09647,16.8036-4.55691.06608-.09648c-.02153-.42641-.18881-.84693-.51447-1.17259L64.24623.51683c-.3718-.3718-.86633-.53908-1.35311-.51447l2.55794,9.54629,1.99898,7.46013Z';
const P_BLUE = 'm70.7199,29.21194l-12.12441,3.24874-.07877.02111-.19157.10191,4.55691,16.8036.19153.10096c.42641-.02153.84699-.18881,1.17265-.51447l22.96563-22.96566c.3718-.3718.53908-.86633.51447-1.35311l-17.00643,4.55692h0Z';
const P_TEAL = 'm38.24043,24.83554c.02153.42641.18876.84693.51441,1.17259l22.96569,22.96566c.3718.3718.86633.53908,1.35305.51447l-7.82672-29.20963-17.00643,4.55692Z';

const markMotion = (active: boolean, mode: MarkMode) => {
  if (!active) return '';
  if (mode === 'none' && shownMode === 'faint') return 'aci-to-none';
  if (mode === 'faint' && shownMode === 'none') return 'aci-from-none';
  if (mode === 'faint' && shownMode === 'brand') return 'aci-to-faint';
  if (mode === 'brand' && shownMode === 'faint') return 'aci-to-brand';
  return '';
};

const Mark = ({ mode }: { mode: MarkMode }) => {
  const active = useIsActivePage();
  const [motion] = useState(() => markMotion(active, mode));
  useLayoutEffect(() => {
    if (active) shownMode = mode;
  }, [active, mode]);
  const id = useId().replace(/:/g, '');
  const g = (n: string) => `${id}-${n}`;
  return (
    <svg
      viewBox="0 0 49.49 49.49"
      aria-hidden="true"
      className={`aci-mark aci-${mode} ${motion}`}
      style={{
        position: 'absolute',
        right: -260,
        bottom: -300,
        width: 860,
        height: 860,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <style>{MARK_CSS}</style>
      <defs>
        <linearGradient id={g('green')} x1="50.89927" y1="12.34173" x2="69.49429" y2="7.47575" gradientUnits="userSpaceOnUse">
          <stop offset=".30862" stopColor="#fff" />
          <stop offset=".46656" stopColor="#c1d9cb" />
          <stop offset=".82996" stopColor="#277c4c" />
          <stop offset=".89934" stopColor="#096a34" />
        </linearGradient>
        <linearGradient id={g('sky')} x1="73.52021" y1="5.48389" x2="79.07588" y2="26.49125" gradientUnits="userSpaceOnUse">
          <stop offset=".42806" stopColor="#fff" />
          <stop offset=".65046" stopColor="#d2d1ea" />
          <stop offset=".83365" stopColor="#8481c7" />
          <stop offset="1" stopColor="#241f9c" />
        </linearGradient>
        <linearGradient id={g('blue')} x1="79.69638" y1="35.64565" x2="60.22347" y2="41.17174" gradientUnits="userSpaceOnUse">
          <stop offset=".38073" stopColor="#fff" />
          <stop offset="1" stopColor="#241f9c" />
        </linearGradient>
        <linearGradient id={g('teal')} x1="51.6638" y1="41.18861" x2="46.99627" y2="22.86423" gradientUnits="userSpaceOnUse">
          <stop offset=".30862" stopColor="#fff" />
          <stop offset=".49188" stopColor="#d2d1ea" />
          <stop offset=".84138" stopColor="#5753b3" />
          <stop offset=".96877" stopColor="#241f9c" />
        </linearGradient>
      </defs>
      {/* Clockwise from the top left. */}
      <g transform="translate(-38.24 0)">
        <g style={{ isolation: 'isolate' }}>
          <Fill d={P_GREEN} fill="#80f879" shade={g('green')} shadeOpacity={0.32} />
          <Fill d={P_SKY} fill="#31acea" shade={g('sky')} shadeOpacity={0.25} />
          <Fill d={P_BLUE} fill="#424bff" shade={g('blue')} shadeOpacity={0.3} />
          <Fill d={P_TEAL} fill="#28a3a3" shade={g('teal')} shadeOpacity={0.13} />
        </g>
      </g>
    </svg>
  );
};

const MARK_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 49.49 49.49'><g transform='translate(-38.24 0)' fill='#fff'>${[P_GREEN, P_SKY, P_BLUE, P_TEAL].map(d => `<path d='${d}'/>`).join('')}</g></svg>`
)}")`;
const GLOSS_CSS = `
.aci-gloss { opacity: 0; }
.aci-gloss.aci-brand { opacity: 0.8; }
.aci-gloss.aci-to-faint { animation: aci-gloss-out 1000ms ease-in-out both; }
.aci-gloss.aci-to-brand { animation: aci-gloss-out 1000ms ease-in-out reverse both; }
@keyframes aci-gloss-out { from { opacity: 0.8; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .aci-gloss { animation: none !important; } }
`;

/**
 * The gloss on the colour mark: the rays' own frame (copied by SideRays each frame), clipped to
 * the mark and colour-dodged onto it, so the mark shines exactly where a beam falls, and moves
 * with the beams. Fades with the mark; only on the active page with WebGL2.
 */
const Gloss = ({ mode }: { mode: MarkMode }) => {
  const active = useIsActivePage();
  const [motion] = useState(() => markMotion(active, mode));
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    if (!active) return;
    if (!ref.current) return;
    const target = { canvas: ref.current };
    raysShared.glosses.add(target);
    return () => {
      raysShared.glosses.delete(target);
    };
  }, [active]);
  if (!active || !hasWebgl2() || (mode !== 'brand' && motion !== 'aci-to-faint')) return null;
  return (
    <div
      aria-hidden="true"
      className={`aci-gloss aci-${mode} ${motion}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        mixBlendMode: 'color-dodge',
        maskImage: MARK_MASK,
        WebkitMaskImage: MARK_MASK,
        maskSize: '860px 860px',
        WebkitMaskSize: '860px 860px',
        maskPosition: 'right -260px bottom -300px',
        WebkitMaskPosition: 'right -260px bottom -300px',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
    >
      <style>{GLOSS_CSS}</style>
      <canvas
        ref={ref}
        style={{ position: 'absolute', left: `${GLOSS_X * 100}%`, top: `${GLOSS_Y * 100}%`, right: 0, bottom: 0, width: `${(1 - GLOSS_X) * 100}%`, height: `${(1 - GLOSS_Y) * 100}%` }}
      />
    </div>
  );
};

/**
 * `center` for the title and the close. Content pages hang from a fixed top instead, so their
 * headings sit at the same height on every page and do not jump on a page change.
 */
const CONTENT_TOP = 180;
// `bright`: the rays at full strength; on the title (with the colour mark) and on the close.
const Shell = ({ children, mark = 'faint', center, bright = mark === 'brand' }: { children: ReactNode; mark?: MarkMode; center?: boolean; bright?: boolean }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundColor: 'var(--osd-bg)',
      backgroundImage: TEXTURE,
      color: 'var(--osd-text)',
      fontFamily: 'var(--osd-font-body)',
      padding: center ? PAD : `${CONTENT_TOP}px ${PAD}px ${PAD}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}
  >
    {/* The rays above the mark, screened: where a beam crosses the mark it lights it up, as a
        real light would; over the plain background screen looks like the rays alone. */}
    <Mark mode={mark} />
    <Rays bright={bright} />
    <Gloss mode={mark} />
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: center ? 'center' : 'flex-start',
      }}
    >
      {children}
    </div>
  </div>
);

/** Page heading, sans and heavy. */
const H = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontSize: 76,
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      margin: 0,
    }}
  >
    {children}
  </h2>
);

/** Heading for a skill name — monospace, because that is how you type it. */
const SkillH = ({ name, suffix = 'Skill' }: { name: string; suffix?: string }) => (
  <h2
    style={{
      fontFamily: MONO,
      fontSize: 76,
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      margin: 0,
    }}
  >
    <span style={{ color: 'var(--osd-accent)' }}>/</span>
    {name}
    <span style={{ color: MUTED }}> {suffix}</span>
  </h2>
);

// Room left of the word for the selection frame and its label, which TechText draws outside
// the glyph; the container is shifted left by the same amount.
const TECH_INSET = 60;

// ── TechText ─────────────────────────────────────────────────────────────────
//
// Ported from React Bits, "Tech Text" (src/content/TextAnimations/TechText/TechText.jsx),
// https://reactbits.dev/text-animations/tech-text — kept as close to the original as possible.
// Changes: inlined here (a slide is one file), its two CSS rules moved onto the elements, loose
// TypeScript annotations, labels at a size a projector shows, and `align: 'left'` starting at
// the container's edge so the word sits on the deck's left axis.
//
// MIT + Commons Clause License Condition v1.0 — Copyright (c) 2026 David Haz.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software
// and associated documentation files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify, merge, publish,
// and distribute the Software as part of an application, website, or product, subject to the
// following conditions: The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software. Commons Clause: you may not sell,
// sublicense, or redistribute the components themselves, whether alone, in a bundle, or as a
// ported version. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
/* eslint-disable */
// The labels use the same face as the word: a canvas only draws reliably with a font that is
// already loaded and measured, and both mono choices (the vendored Atkinson Mono, then the system
// mono) came out with overlapping glyphs on the speaker's machine.
const LABEL_FONT = '400 20px "Atkinson Hyperlegible", sans-serif';
const FALLOFF_STEPS = 8;
const SPRING = 320;
const INHERIT = /^(currentcolor|inherit)$/i;
const INTRO_DELAY = 0.15;
const KICK_DECAY = 0.62;

const approach = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));

const clamp01 = value => Math.min(1, Math.max(0, Number(value) || 0));

const smoothstep = (edge0, edge1, value) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const noise = (...values) => {
  let h = 2166136261;
  for (const value of values) {
    h = Math.imul(h ^ (value | 0), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
};

const signed = value => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '0');

/**
 * Deck addition: the lens state of the last TechText that drew, so a fresh instance on the next
 * page (the title's transit copy) can start exactly where the last one left off and let the
 * outlined letter and its frame settle out smoothly instead of popping.
 */
/**
 * Deck addition: labels are drawn one character at a time, each advanced by its width as a
 * fresh, stateless context measures it. Drawn as whole strings, they came out with overlapping
 * glyphs in GPU-composited Chrome (the speaker's machine), whatever the font.
 */
const labelProbe = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
const fillLabel = (ctx: any, text: string, x: number, y: number, align: 'left' | 'right') => {
  if (!labelProbe) return ctx.fillText(text, x, y);
  labelProbe.font = LABEL_FONT;
  const widths = Array.from(text).map((ch) => labelProbe.measureText(ch).width);
  let at = align === 'right' ? x - widths.reduce((a, b) => a + b, 0) : x;
  const saved = ctx.textAlign;
  ctx.textAlign = 'left';
  Array.from(text).forEach((ch, i) => {
    ctx.fillText(ch, at, y);
    at += widths[i];
  });
  ctx.textAlign = saved;
};

let techCarry: { index: number; outline: number; frame: any } | null = null;

const TechText = ({
  text = 'React Bits',
  fontFamily = '',
  fontWeight = 600,
  fontSize = 150,
  letterSpacing = -0.05,
  color = 'currentColor',
  accentColor = 'currentColor',
  align = 'center',
  reach = 200,
  softness = 0.7,
  dashLength = 4,
  dashGap = 2,
  strokeWidth = 1.5,
  lineStyle = 'dashed',
  reveal = 'letter',
  specks = 15,
  selection = true,
  labels = true,
  draggable = true,
  bounce = 0.4,
  sweep = true,
  speed = 1,
  clickKick = true,
  intro = 'none',
  introDuration = 2,
  guides = false,
  calm = false,
  className = '',
  style
}: any) => {
  const containerRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const settingsRef = useRef<any>(null);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    settingsRef.current = {
      text,
      fontFamily,
      fontWeight,
      fontSize,
      letterSpacing,
      color,
      accentColor,
      align,
      reach,
      softness,
      dashLength,
      dashGap,
      strokeWidth,
      lineStyle,
      reveal,
      specks,
      selection,
      labels,
      draggable,
      bounce,
      sweep,
      speed,
      clickKick,
      intro,
      introDuration,
      guides,
      calm
    };
    wakeRef.current();
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const scratch = document.createElement('canvas');
    const scratchCtx = scratch.getContext('2d');
    if (!container || !canvas || !ctx || !scratchCtx) return undefined;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = false;
    let alive = true;
    let layoutKey = '';
    let sizeDirty = true;
    let requestedFont = '';
    let word: any = null;
    let glyphs: any[] = [];
    let presence = 0;
    let clock = 0;
    let pulse = 0;
    let placed = false;
    let dragging = -1;
    let cursor = '';
    let introClock = 0;
    let introKind = '';
    let introducing = false;
    let fontsReady = !document.fonts;
    let guideAlpha = 0;
    let carried = false;
    const kicks: any[] = [];
    const press = { x: 0, y: 0, time: 0, index: -1 };
    const pointer = { x: 0, y: 0, inside: false };
    const grab = { x: 0, y: 0 };
    const lens = { x: 0, y: 0 };
    const frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

    const invalidateLayout = () => {
      layoutKey = '';
      wakeRef.current();
    };

    const fontsLoaded = () => {
      fontsReady = true;
      invalidateLayout();
    };

    const family = s => s.fontFamily || getComputedStyle(container).fontFamily || 'sans-serif';
    const fontFor = (s, size) => `${s.fontWeight} ${size}px ${family(s)}`;

    const palette = s => {
      const current = getComputedStyle(container).color || '#000000';
      const pick = value => (!value || INHERIT.test(String(value).trim()) ? current : value);
      return { ink: pick(s.color), accent: pick(s.accentColor) };
    };

    const setFont = (target, s, size) => {
      target.font = fontFor(s, size);
      if ('letterSpacing' in target) target.letterSpacing = `${s.letterSpacing * size}px`;
      target.textAlign = 'left';
      target.textBaseline = 'alphabetic';
    };

    const sprite = (s, view, glyph, stroke, ink) => {
      const pad = Math.ceil(s.strokeWidth * 2 + 4);
      const left = glyph.box.x1 - pad;
      const top = glyph.box.y1 - pad;
      const w = glyph.box.x2 - glyph.box.x1 + pad * 2;
      const h = glyph.box.y2 - glyph.box.y1 + pad * 2;
      const image = document.createElement('canvas');
      image.addEventListener('contextrestored', invalidateLayout);
      image.width = Math.max(1, Math.ceil(w * dpr));
      image.height = Math.max(1, Math.ceil(h * dpr));
      const c = image.getContext('2d');
      if (!c) return { image, left, top };
      c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
      setFont(c, s, view.size);
      if (stroke) {
        c.lineJoin = 'round';
        c.lineWidth = s.strokeWidth * 2;
        c.lineCap = 'butt';
        c.strokeStyle = ink;
        if (s.lineStyle !== 'solid') c.setLineDash([Math.max(1, s.dashLength), Math.max(1, s.dashGap)]);
        c.strokeText(glyph.char, glyph.x, view.baseline);
        c.setLineDash([]);
        c.globalCompositeOperation = 'destination-out';
        c.fillStyle = '#000000';
        c.fillText(glyph.char, glyph.x, view.baseline);
        c.globalCompositeOperation = 'source-over';
      } else {
        c.fillStyle = ink;
        c.fillText(glyph.char, glyph.x, view.baseline);
      }
      return { image, left, top };
    };

    const ensureLayout = (s, ink) => {
      const key = [
        s.text,
        family(s),
        s.fontWeight,
        s.fontSize,
        s.letterSpacing,
        s.align,
        ink,
        s.dashLength,
        s.dashGap,
        s.strokeWidth,
        s.lineStyle,
        width,
        height,
        dpr
      ].join('|');
      if (key === layoutKey && word) return word;
      layoutKey = key;
      const wanted = fontFor(s, 64);
      if (document.fonts && wanted !== requestedFont) {
        requestedFont = wanted;
        document.fonts.load(wanted, s.text).then(invalidateLayout, invalidateLayout);
      }

      const probe = scratchCtx;
      setFont(probe, s, s.fontSize);
      let m = probe.measureText(s.text);
      const fit = Math.min(
        1,
        (width * 0.9) / Math.max(m.actualBoundingBoxLeft + m.actualBoundingBoxRight, 1),
        (height * 0.66) / Math.max(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, 1)
      );
      const size = s.fontSize * fit;
      setFont(probe, s, size);
      m = probe.measureText(s.text);
      const inkWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const inkHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const margin = s.align === 'left' ? TECH_INSET : width * 0.05;
      const start =
        s.align === 'left' ? margin : s.align === 'right' ? width - margin - inkWidth : (width - inkWidth) / 2;
      const x = start + m.actualBoundingBoxLeft;
      const baseline = (height - inkHeight) / 2 + m.actualBoundingBoxAscent;
      const xHeight = baseline - probe.measureText('x').actualBoundingBoxAscent;
      const capHeight = baseline - probe.measureText('H').actualBoundingBoxAscent;
      const ascender = baseline - probe.measureText('d').actualBoundingBoxAscent;
      const descender = baseline + probe.measureText('p').actualBoundingBoxDescent;
      const top = baseline - m.actualBoundingBoxAscent;
      const bottom = baseline + m.actualBoundingBoxDescent;
      const inkTop = Math.min(top, capHeight) - 2;
      const inkBottom = Math.max(bottom, baseline) + 2;
      const next = {
        size,
        baseline,
        left: x - m.actualBoundingBoxLeft,
        right: x + m.actualBoundingBoxRight,
        top,
        bottom,
        lines: [
          { y: baseline, label: 'baseline' },
          { y: xHeight, label: 'x-height' },
          { y: capHeight, label: 'cap height' },
          ...(capHeight - ascender > Math.max(11, size * 0.06) ? [{ y: ascender, label: 'ascender' }] : []),
          { y: descender, label: 'descender' }
        ],
        bands: [
          { y0: xHeight, y1: baseline, up: true, order: 0 },
          { y0: capHeight, y1: xHeight, up: true, order: 1 },
          { y0: inkTop, y1: capHeight, up: true, order: 2 },
          { y0: baseline, y1: inkBottom, up: false, order: 1 }
        ].filter(band => band.y1 - band.y0 > 0.5)
      };
      word = next;

      const chars = Array.from(s.text);
      const previous = glyphs;
      glyphs = [];
      let prefix = '';
      chars.forEach((char, i) => {
        prefix += char;
        const own = probe.measureText(char);
        const gx = x + probe.measureText(prefix).width - own.width;
        if (!char.trim()) return;
        const base = {
          char,
          x: gx,
          box: {
            x1: gx - own.actualBoundingBoxLeft,
            y1: baseline - own.actualBoundingBoxAscent,
            x2: gx + own.actualBoundingBoxRight,
            y2: baseline + own.actualBoundingBoxDescent
          }
        };
        const kept = previous[glyphs.length];
        const sameGlyph = kept?.char === char && kept.index === i;
        glyphs.push({
          ...base,
          offset: sameGlyph ? kept.offset : { x: 0, y: 0 },
          velocity: sameGlyph ? kept.velocity : { x: 0, y: 0 },
          outline: sameGlyph ? kept.outline : 0,
          shown: sameGlyph ? kept.shown : 1,
          cells: null,
          assembled: 0,
          index: i,
          fill: sprite(s, next, base, false, ink),
          dashes: sprite(s, next, base, true, ink)
        });
      });
      if (dragging >= 0 && glyphs[dragging]?.index !== previous[dragging]?.index) dragging = -1;
      if (frame.index >= 0 && glyphs[frame.index]?.char !== previous[frame.index]?.char) frame.index = -1;
      return next;
    };

    const glyphAt = (x, y) => {
      if (!word || y < word.top - 24 || y > word.bottom + 24) return -1;
      let best = -1;
      let bestDistance = Infinity;
      glyphs.forEach((glyph, i) => {
        const x1 = glyph.box.x1 + glyph.offset.x;
        const x2 = glyph.box.x2 + glyph.offset.x;
        const d = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return bestDistance < 28 ? best : -1;
    };

    const falloff = (target, cx, cy, radius, strength, softness) => {
      const inner = Math.min(1, Math.max(0, 1 - softness));
      const gradient = target.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
      if (inner > 0.995) {
        gradient.addColorStop(0.995, `rgba(0, 0, 0, ${strength})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        return gradient;
      }
      for (let i = 0; i <= FALLOFF_STEPS; i++) {
        const t = i / FALLOFF_STEPS;
        const eased = t * t * (3 - 2 * t);
        gradient.addColorStop(inner + (1 - inner) * t, `rgba(0, 0, 0, ${strength * (1 - eased)})`);
      }
      return gradient;
    };

    const blit = (target, art, dx, dy, originX, originY) => {
      target.drawImage(
        art.image,
        Math.round((art.left + dx) * dpr - originX),
        Math.round((art.top + dy) * dpr - originY)
      );
    };

    const drawReveal = s => {
      const radius = s.reach * dpr;
      const cx = lens.x * dpr;
      const cy = lens.y * dpr;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = falloff(ctx, cx, cy, radius, presence, s.softness);
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.globalCompositeOperation = 'source-over';

      const x0 = Math.max(0, Math.floor(cx - radius));
      const y0 = Math.max(0, Math.floor(cy - radius));
      const x1 = Math.min(canvas.width, Math.ceil(cx + radius));
      const y1 = Math.min(canvas.height, Math.ceil(cy + radius));
      if (x1 <= x0 || y1 <= y0) return;
      const w = x1 - x0;
      const h = y1 - y0;
      if (scratch.width < w || scratch.height < h) {
        scratch.width = Math.max(scratch.width, w);
        scratch.height = Math.max(scratch.height, h);
      }
      scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      scratchCtx.globalCompositeOperation = 'source-over';
      scratchCtx.clearRect(0, 0, w, h);
      for (const glyph of glyphs) blit(scratchCtx, glyph.dashes, glyph.offset.x, glyph.offset.y, x0, y0);
      scratchCtx.globalCompositeOperation = 'destination-in';
      scratchCtx.fillStyle = falloff(scratchCtx, cx - x0, cy - y0, radius, 1, s.softness);
      scratchCtx.fillRect(0, 0, w, h);
      scratchCtx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = presence;
      ctx.drawImage(scratch, 0, 0, w, h, x0, y0, w, h);
      ctx.globalAlpha = 1;
    };

    const crisp = value => (Math.round(value * dpr) + 0.5) / dpr;

    const perimeterPoint = (distance, w, h) => {
      let d = ((distance % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
      if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
      d -= w;
      if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
      d -= w;
      return [frame.x1, frame.y2 - d, -1, 0];
    };

    const drawSpecks = (s, a, accent) => {
      const w = frame.x2 - frame.x1;
      const h = frame.y2 - frame.y1;
      if (w < 2 || h < 2) return;
      const perimeter = 2 * (w + h);
      const seed = frame.index + 1;
      const grid = 3;
      ctx.fillStyle = accent;
      ctx.strokeStyle = accent;

      for (let k = 0; k < s.specks; k++) {
        const period = 0.5 + noise(seed, k, 11) * 1.2;
        const t = pulse / period + noise(seed, k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) continue;
        const [px, py, nx, ny] = perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
        const pick = noise(seed, k, cycle, 2);
        const size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        const large = size >= 8;
        const out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        const x = frame.x1 + Math.round((px + nx * out - frame.x1) / grid) * grid;
        const y = frame.y1 + Math.round((py + ny * out - frame.y1) / grid) * grid;
        const tone = noise(seed, k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const alpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        const left = Math.round(x - size / 2);
        const top = Math.round(y - size / 2);
        ctx.globalAlpha = alpha;
        if (tone < 0.26 || (large && tone < 0.78)) {
          ctx.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
        } else {
          ctx.fillRect(left, top, size, size);
        }
      }

      for (let j = 0; j < 2; j++) {
        const head = (pulse * 0.42 * s.speed + j * 0.5) * perimeter;
        for (let i = 0; i < 4; i++) {
          const [x, y] = perimeterPoint(head - i * 6, w, h);
          const size = i === 0 ? 3 : 2;
          ctx.globalAlpha = a * [0.95, 0.55, 0.32, 0.16][i];
          ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawFrame = (s, accent) => {
      const glyph = glyphs[frame.index];
      if (!glyph || frame.alpha < 0.01) return;
      const a = frame.alpha;
      const x1 = crisp(frame.x1);
      const y1 = crisp(frame.y1);
      const x2 = crisp(frame.x2);
      const y2 = crisp(frame.y2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = accent;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;

      const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
      if (moved > 1) {
        const hx = (glyph.box.x1 + glyph.box.x2) / 2;
        const hy = (glyph.box.y1 + glyph.box.y2) / 2;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + glyph.offset.x, hy + glyph.offset.y);
        ctx.setLineDash([3, 4]);
        ctx.globalAlpha = 0.45 * a;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        ctx.globalAlpha = 0.7 * a;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.globalAlpha = 0.5 * a;
      ctx.stroke();

      ctx.beginPath();
      for (const [cx, cy] of [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2]
      ]) {
        ctx.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
      }
      ctx.globalAlpha = 0.95 * a;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (s.specks > 0) drawSpecks(s, a, accent);

      if (!s.labels) return;
      ctx.font = LABEL_FONT;
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0px';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.62 * a;
      const label =
        moved > 1
          ? `${signed(Math.round(glyph.offset.x))}, ${signed(Math.round(-glyph.offset.y))}`
          : `${glyph.char}  ${Math.round(glyph.box.x2 - glyph.box.x1)} × ${Math.round(glyph.box.y2 - glyph.box.y1)}`;
      fillLabel(ctx, label, Math.round(frame.x1), Math.round(frame.y1) - 7, 'left');
      ctx.globalAlpha = 1;
    };

    const drawLines = (s, view, accent, alpha, growth) => {
      const pad = Math.max(12, view.size * 0.12);
      const x1 = Math.round(view.left - pad);
      const x2 = Math.round(view.right + pad);
      const room = width - x2 > x1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = accent;
      ctx.fillStyle = accent;
      ctx.lineWidth = 1;
      ctx.font = LABEL_FONT;
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0px';
      ctx.textBaseline = 'middle';
      ctx.textAlign = room ? 'left' : 'right';
      view.lines.forEach((line, k) => {
        const grow = growth(k);
        if (grow <= 0.001) return;
        const y = crisp(line.y);
        const end = x1 + (x2 - x1) * grow;
        ctx.globalAlpha = alpha * 0.4;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(end, y);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillRect(x1 - 1, Math.round(line.y) - 1, 3, 3);
        ctx.fillRect(Math.round(end) - 1, Math.round(line.y) - 1, 3, 3);
        if (s.labels) {
          ctx.globalAlpha = alpha * 0.62 * smoothstep(0.7, 1, grow);
          fillLabel(ctx, line.label, room ? x2 + 8 : x1 - 8, Math.round(line.y), room ? 'left' : 'right');
        }
      });
      ctx.textAlign = 'left';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
    };

    const ensureCells = (glyph, view) => {
      if (glyph.cells) return glyph.cells;
      const art = glyph.fill;
      const size = Math.max(3, Math.round(view.size / 26));
      const w = art.image.width;
      const h = art.image.height;
      const source = art.image.getContext('2d');
      const cells: any[] = [];
      glyph.cells = cells;
      glyph.assembled = 0;
      if (!source || w < 2 || h < 2) return cells;
      const data = source.getImageData(0, 0, w, h).data;
      const gx = Math.floor(art.left / size) * size;
      const gy = Math.floor(art.top / size) * size;
      const cols = Math.ceil((art.left + w / dpr - gx) / size) + 1;
      const rows = Math.ceil((art.top + h / dpr - gy) / size) + 1;
      const hit = new Uint8Array(cols * rows);
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          if (data[(py * w + px) * 4 + 3] < 24) continue;
          const cx = Math.floor((art.left + px / dpr - gx) / size);
          const cy = Math.floor((art.top + py / dpr - gy) / size);
          hit[cy * cols + cx] = 1;
        }
      }
      const center = (glyph.box.x1 + glyph.box.x2) / 2;
      const along = clamp01((center - view.left) / Math.max(1, view.right - view.left));
      for (let k = 0; k < hit.length; k++) {
        if (!hit[k]) continue;
        const angle = noise(glyph.index, k, 1) * Math.PI * 2;
        const distance = view.size * (0.25 + 0.6 * noise(glyph.index, k, 2));
        const start = 0.03 + 0.36 * along + 0.12 * noise(glyph.index, k, 3);
        const land = start + 0.3 + 0.14 * noise(glyph.index, k, 4);
        cells.push({
          x: gx + (k % cols) * size,
          y: gy + Math.floor(k / cols) * size,
          size,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance * 0.7,
          start,
          land
        });
        glyph.assembled = Math.max(glyph.assembled, land);
      }
      return cells;
    };

    const cellRect = (x, y, size) => {
      const left = Math.round(x * dpr);
      const top = Math.round(y * dpr);
      return [left, top, Math.round((x + size) * dpr) - left, Math.round((y + size) * dpr) - top];
    };

    const drawAssembling = (glyph, progress, accent) => {
      const cells = glyph.cells || [];
      ctx.save();
      ctx.beginPath();
      let landed = 0;
      for (const cell of cells) {
        if (progress < cell.land) continue;
        const [x, y, w, h] = cellRect(cell.x, cell.y, cell.size);
        ctx.rect(x, y, w, h);
        landed++;
      }
      if (landed) {
        ctx.clip();
        blit(ctx, glyph.fill, 0, 0, 0, 0);
      }
      ctx.restore();
      ctx.fillStyle = accent;
      for (const cell of cells) {
        if (progress < cell.start || progress >= cell.land) continue;
        const u = (progress - cell.start) / (cell.land - cell.start);
        const eased = 1 - Math.pow(1 - u, 4);
        const size = cell.size * (0.4 + 0.6 * eased);
        const x = cell.x + (cell.size - size) / 2 + cell.dx * (1 - eased);
        const y = cell.y + (cell.size - size) / 2 + cell.dy * (1 - eased);
        const [left, top, w, h] = cellRect(x, y, size);
        ctx.globalAlpha = Math.min(1, u * 4) * (0.55 + 0.45 * eased);
        ctx.fillRect(left, top, Math.max(1, w), Math.max(1, h));
      }
      ctx.globalAlpha = 1;
    };

    const drawFilling = (glyph, lead, progress, view) => {
      const art = glyph.fill;
      const left = Math.floor(art.left * dpr);
      const top = Math.floor(art.top * dpr);
      const w = art.image.width + 2;
      const h = art.image.height + 2;
      const fill = clamp01((progress - 0.24 - 0.28 * lead) / 0.48);
      const rects: any[] = [];
      for (const band of view.bands) {
        const amount = smoothstep(0.3 * band.order, 0.3 * band.order + 0.4, fill);
        if (amount <= 0) continue;
        const span = (band.y1 - band.y0) * amount;
        const y0 = Math.round((band.up ? band.y1 - span : band.y0) * dpr);
        const y1 = Math.round((band.up ? band.y1 : band.y0 + span) * dpr);
        if (y1 > y0) rects.push([y0, y1 - y0]);
      }
      const outline = smoothstep(0.08 + 0.2 * lead, 0.22 + 0.2 * lead, progress);
      if (outline > 0.001) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(left - 2, top - 2, w + 2, h + 2);
        for (const [y, span] of rects) ctx.rect(left - 2, y, w + 2, span);
        ctx.clip('evenodd');
        ctx.globalAlpha = outline;
        blit(ctx, glyph.dashes, 0, 0, 0, 0);
        ctx.restore();
      }
      if (rects.length) {
        ctx.save();
        ctx.beginPath();
        for (const [y, span] of rects) ctx.rect(left - 2, y, w + 2, span);
        ctx.clip();
        blit(ctx, glyph.fill, 0, 0, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const kick = index => {
      const strength = (word ? word.size : 120) * 11;
      kicks.push({ index, at: pulse, velocity: strength });
      for (let d = 1; d < glyphs.length; d++) {
        const velocity = strength * Math.pow(KICK_DECAY, d);
        if (velocity < 30) break;
        for (const j of [index - d, index + d]) {
          if (j >= 0 && j < glyphs.length) kicks.push({ index: j, at: pulse + d * 0.055, velocity });
        }
      }
      wakeRef.current();
    };

    const tick = now => {
      raf = 0;
      const s = settingsRef.current;
      if (!s) return;
      if (sizeDirty) {
        sizeDirty = false;
        width = Math.max(1, container.clientWidth);
        height = Math.max(1, container.clientHeight);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const pixelWidth = Math.round(width * dpr);
        const pixelHeight = Math.round(height * dpr);
        if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
        if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const { ink, accent } = palette(s);
      const view = ensureLayout(s, ink);
      if (s.calm && !carried && glyphs.length) {
        carried = true;
        if (techCarry && glyphs[techCarry.index]) {
          glyphs[techCarry.index].outline = techCarry.outline;
          Object.assign(frame, techCarry.frame, { index: techCarry.index });
        }
      }
      const damping = 2 * Math.sqrt(SPRING) * (1 - clamp01(s.bounce) * 0.96);

      if (s.intro !== introKind) {
        introKind = s.intro;
        introClock = 0;
      }
      const introOn = introKind !== 'none' && !reducedMotion && glyphs.length > 0;
      if (introOn && fontsReady) introClock += dt;
      const progress = introOn ? clamp01((introClock - INTRO_DELAY) / Math.max(0.3, s.introDuration)) : 1;
      introducing = introOn && progress < 1;

      const sweeping = !introducing && s.sweep && !reducedMotion && !pointer.inside && dragging < 0;
      if (sweeping) clock += dt * s.speed;
      pulse += dt;
      let targetX = pointer.x;
      let targetY = pointer.y;
      if (sweeping) {
        targetX = view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(clock * 0.45));
        targetY = view.top + (view.bottom - view.top) * (0.45 + 0.1 * Math.sin(clock * 0.8));
      }
      const active = !introducing && (pointer.inside || sweeping || dragging >= 0);
      if (active && !placed) {
        lens.x = targetX;
        lens.y = targetY;
      }
      if (active) {
        const lag = pointer.inside ? 0.05 : 0.22;
        lens.x = approach(lens.x, targetX, dt, lag);
        lens.y = approach(lens.y, targetY, dt, lag);
      }
      placed = active;
      presence = approach(presence, s.reveal === 'area' && active && dragging < 0 ? 1 : 0, dt, 0.16);

      for (let k = kicks.length - 1; k >= 0; k--) {
        if (kicks[k].at > pulse) continue;
        const glyph = glyphs[kicks[k].index];
        if (glyph) glyph.velocity.y -= kicks[k].velocity;
        kicks.splice(k, 1);
      }

      let moving = false;
      glyphs.forEach((glyph, i) => {
        if (i === dragging) {
          glyph.offset.x = approach(glyph.offset.x, pointer.x - grab.x, dt, 0.03);
          glyph.offset.y = approach(glyph.offset.y, pointer.y - grab.y, dt, 0.03);
          glyph.velocity.x = 0;
          glyph.velocity.y = 0;
          moving = true;
          return;
        }
        const { offset, velocity } = glyph;
        if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05 && Math.hypot(velocity.x, velocity.y) < 0.5) {
          offset.x = 0;
          offset.y = 0;
          velocity.x = 0;
          velocity.y = 0;
          return;
        }
        velocity.x += (-SPRING * offset.x - damping * velocity.x) * dt;
        velocity.y += (-SPRING * offset.y - damping * velocity.y) * dt;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt;
        moving = true;
      });

      let typing = -1;
      if (introducing && introKind === 'type') {
        const step = 0.86 / glyphs.length;
        const cursorAt = Math.min(glyphs.length - 1, Math.floor(progress / step));
        typing = progress < 0.93 ? cursorAt : -1;
        glyphs.forEach((glyph, i) => {
          glyph.shown = i < cursorAt ? 1 : i === cursorAt ? smoothstep(0, step * 0.3, progress - i * step) : 0;
        });
      } else {
        glyphs.forEach(glyph => {
          glyph.shown = 1;
        });
      }

      const focus = introducing ? typing : dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
      if (focus >= 0 && s.selection) {
        const glyph = glyphs[focus];
        const bx1 = glyph.box.x1 + glyph.offset.x - 6;
        const by1 = glyph.box.y1 + glyph.offset.y - 6;
        const bx2 = glyph.box.x2 + glyph.offset.x + 6;
        const by2 = glyph.box.y2 + glyph.offset.y + 6;
        if (frame.index < 0 || frame.alpha < 0.02) {
          frame.x1 = bx1;
          frame.y1 = by1;
          frame.x2 = bx2;
          frame.y2 = by2;
        }
        const glide = focus === dragging ? 0.02 : 0.08;
        frame.x1 = approach(frame.x1, bx1, dt, glide);
        frame.y1 = approach(frame.y1, by1, dt, glide);
        frame.x2 = approach(frame.x2, bx2, dt, glide);
        frame.y2 = approach(frame.y2, by2, dt, glide);
        frame.index = focus;
      }
      frame.alpha = approach(frame.alpha, focus >= 0 && s.selection ? 1 : 0, dt, s.calm ? 0.3 : 0.1);

      glyphs.forEach((glyph, i) => {
        const target = introducing
          ? introKind === 'type' && (i === typing || (typing >= 0 && i > typing))
            ? 1
            : 0
          : s.reveal === 'letter' && i === focus && i !== dragging
            ? 1
            : 0;
        if (introducing && glyph.shown === 0) glyph.outline = target;
        glyph.outline = approach(glyph.outline, target, dt, s.calm ? 0.3 : 0.09);
        if (Math.abs(glyph.outline - target) > 0.002) moving = true;
        else glyph.outline = target;
      });

      guideAlpha = approach(guideAlpha, s.guides && !introducing && (focus >= 0 || presence > 0.4) ? 1 : 0, dt, 0.14);

      const hovering = !introducing && focus >= 0 && pointer.inside;
      const nextCursor =
        dragging >= 0 ? 'grabbing' : hovering && s.draggable ? 'grab' : hovering && s.clickKick ? 'pointer' : '';
      if (nextCursor !== cursor) {
        cursor = nextCursor;
        container.style.cursor = nextCursor;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved > 1) {
          ctx.globalAlpha = Math.min(1, moved / 24) * 0.55;
          blit(ctx, glyph.dashes, 0, 0, 0, 0);
          ctx.globalAlpha = 1;
        }
      }
      if (introducing && introKind === 'metrics') {
        drawLines(s, view, accent, 1 - smoothstep(0.84, 1, progress), k =>
          smoothstep(0.02 + 0.04 * k, 0.2 + 0.04 * k, progress)
        );
      } else if (guideAlpha > 0.005) {
        drawLines(s, view, accent, guideAlpha * 0.6, () => 1);
      }
      glyphs.forEach((glyph, i) => {
        if (introducing && introKind === 'assemble') {
          ensureCells(glyph, view);
          if (progress < glyph.assembled) {
            drawAssembling(glyph, progress, accent);
            return;
          }
        }
        if (introducing && introKind === 'metrics') {
          const lead = glyphs.length > 1 ? i / (glyphs.length - 1) : 0;
          if (progress < 0.72 + 0.28 * lead) {
            drawFilling(glyph, lead, progress, view);
            return;
          }
        }
        if (glyph.shown < 0.001) return;
        if (glyph.outline < 0.999) {
          ctx.globalAlpha = (1 - glyph.outline) * glyph.shown;
          blit(ctx, glyph.fill, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        if (glyph.outline > 0.001) {
          ctx.globalAlpha = glyph.outline * glyph.shown;
          blit(ctx, glyph.dashes, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        ctx.globalAlpha = 1;
      });
      if (presence > 0.001) drawReveal(s);
      drawFrame(s, accent);
      if (!s.calm && frame.index >= 0)
        techCarry = { index: frame.index, outline: glyphs[frame.index]?.outline ?? 0, frame: { ...frame } };

      const settling =
        moving ||
        introducing ||
        kicks.length > 0 ||
        (guideAlpha > 0.005 && guideAlpha < 0.995) ||
        Math.abs(presence - (s.reveal === 'area' && active && dragging < 0 ? 1 : 0)) > 0.002 ||
        (frame.alpha > 0.01 && frame.alpha < 0.99);
      if ((active || settling) && visible && alive) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const resize = () => {
      sizeDirty = true;
      wake();
    };

    const locate = e => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onMove = e => {
      locate(e);
      pointer.inside = true;
      wake();
    };
    const onLeave = () => {
      if (dragging >= 0) return;
      pointer.inside = false;
      wake();
    };
    const onDown = e => {
      locate(e);
      pointer.inside = true;
      const s = settingsRef.current;
      const primary = e.pointerType !== 'mouse' || e.button === 0;
      const index = introducing || !primary ? -1 : glyphAt(pointer.x, pointer.y);
      press.x = pointer.x;
      press.y = pointer.y;
      press.time = performance.now();
      press.index = index;
      if (s?.draggable && index >= 0) {
        dragging = index;
        grab.x = pointer.x - glyphs[index].offset.x;
        grab.y = pointer.y - glyphs[index].offset.y;
        container.setPointerCapture?.(e.pointerId);
      }
      wake();
    };
    const onUp = e => {
      if (dragging >= 0) {
        dragging = -1;
        container.releasePointerCapture?.(e.pointerId);
        const rect = container.getBoundingClientRect();
        pointer.inside =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      }
      if (
        e.type === 'pointerup' &&
        press.index >= 0 &&
        settingsRef.current?.clickKick &&
        !reducedMotion &&
        performance.now() - press.time < 450
      ) {
        const rect = container.getBoundingClientRect();
        if (Math.hypot(e.clientX - rect.left - press.x, e.clientY - rect.top - press.y) < 6) kick(press.index);
      }
      press.index = -1;
      wake();
    };

    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerenter', onMove, { passive: true });
    container.addEventListener('pointerdown', onDown, { passive: true });
    container.addEventListener('pointerup', onUp, { passive: true });
    container.addEventListener('pointercancel', onUp, { passive: true });
    container.addEventListener('pointerleave', onLeave, { passive: true });
    canvas.addEventListener('contextrestored', invalidateLayout);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener('resize', resize, { passive: true });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    intersectionObserver.observe(container);
    const themeObserver = new MutationObserver(wake);
    for (const node of [document.documentElement, document.body]) {
      if (node) themeObserver.observe(node, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
    }
    const schemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    schemeQuery?.addEventListener?.('change', wake);
    if (document.fonts) document.fonts.ready.then(fontsLoaded, fontsLoaded);

    resize();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wakeRef.current = () => {};
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      schemeQuery?.removeEventListener?.('change', wake);
      container.style.cursor = '';
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerenter', onMove);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('pointercancel', onUp);
      container.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('contextrestored', invalidateLayout);
    };
  }, []);

  return (
    <div ref={containerRef as any} className={`tech-text ${className}`.trim()} style={{ position: 'relative', width: '100%', height: '100%', touchAction: 'pan-y', userSelect: 'none', ...style }} role="img" aria-label={text}>
      <canvas ref={canvasRef as any} className="tech-text-canvas" style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};


// ── SideRays ─────────────────────────────────────────────────────────────────
//
// Ported from React Bits, "Side Rays" (src/content/Backgrounds/SideRays/SideRays.jsx),
// https://reactbits.dev/backgrounds/side-rays — kept as close to the original as possible.
// Changes: inlined (a slide is one file), CSS moved onto the elements, names prefixed so they
// do not clash with the deck's, loose TypeScript annotations, and one clock shared by every
// instance (`raysShared`), so the rays carry on across a page change instead of restarting, and
// the intro reveal runs once per load rather than on every page.
//
// MIT + Commons Clause License Condition v1.0 — Copyright (c) 2026 David Haz. Same terms as the
// TechText notice above: used as part of this deck, not redistributed on its own.
/* eslint-disable */
// A gloss: a 2D canvas that gets the part of each rays frame under it, then `clip` cuts it to a shape.
type GlossTarget = { canvas: HTMLCanvasElement; clip?: (g2: CanvasRenderingContext2D) => void };
const raysShared = { time: Math.random() * 100, revealed: false, level: -1, tilt: NaN, falloff: NaN, glosses: new Set<GlossTarget>() };
// Where the mark's gloss sits (the visible mark, bottom right), as fractions of the page.
const GLOSS_X = 1320 / 1920;
const GLOSS_Y = 480 / 1080;

const RAYS_PIXEL_BUDGET = 2.4e6;
const RAYS_TAU = Math.PI * 2;

const RAYS_ORIGINS = {
  'top-right': { flipX: 0, flipY: 0, side: 0 },
  'top-left': { flipX: 1, flipY: 0, side: 0 },
  'bottom-right': { flipX: 0, flipY: 1, side: 0 },
  'bottom-left': { flipX: 1, flipY: 1, side: 0 },
  right: { flipX: 0, flipY: 0, side: 1 },
  left: { flipX: 1, flipY: 0, side: 1 }
};

const RAYS_VERTEX = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`;

const RAYS_FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uBlend;
uniform float uIntensity;
uniform float uSpread;
uniform float uDensity;
uniform float uSharpness;
uniform float uFalloff;
uniform float uGlow;
uniform float uSaturation;
uniform float uDust;
uniform float uOpacity;
uniform float uReveal;
uniform float uLight;
uniform vec3 uFrame;
uniform float uAim;
uniform vec3 uFocus;
uniform float uSway;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

float shafts(float u, float t, float seed, float aa) {
  float sway = (0.4 * sin(t * 0.31 + seed) + 0.24 * sin(t * 0.17 + seed * 2.3)) * uSway;
  float n = 0.7 * noise(vec2(u + sway + seed, t * 0.3)) + 0.3 * noise(vec2(u * 2.4 + sway * 1.5 + seed * 1.7, t * 0.45 + 3.0));
  float width = mix(0.5, 0.1, uSharpness);
  float s = mix(smoothstep(0.5 - width, 0.5 + width, n), 0.5, aa);
  return mix(0.05, 1.0, s);
}

float motes(vec2 p, float cell, float t, float seed) {
  p += vec2(t * 0.021, -t * 0.013) + seed * 7.31;
  vec2 grid = p / cell;
  vec2 id = floor(grid);
  vec2 f = grid - id;
  float h = hash(id + seed);
  if (h > 0.5) return 0.0;
  vec2 center = 0.25 + 0.5 * vec2(hash(id + 1.7 + seed), hash(id + 3.1 + seed));
  center += 0.1 * vec2(sin(t * 0.7 + h * 31.0), cos(t * 0.6 + h * 23.0));
  float size = mix(0.035, 0.09, hash(id + 5.3 + seed));
  float edge = length(fwidth(grid)) * 0.7;
  float twinkle = 0.55 + 0.45 * sin(t * 1.9 + h * 41.0);
  return (1.0 - smoothstep(size - edge, size + edge, length(f - center))) * twinkle;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 q = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  if (uFrame.x > 0.5) q.x = -q.x;
  if (uFrame.y > 0.5) q.y = -q.y;
  vec2 source = uFrame.z > 0.5 ? vec2(aspect * 0.5 + 0.42, 0.3) : vec2(aspect * 0.5 + 0.1, 0.62);
  float heading = (uFrame.z > 0.5 ? 3.42 : -2.48) + uAim + 0.035 * sin(uTime * 0.21) * uSway;
  vec2 v = q - source;
  float r = length(v);
  float angle = mod(atan(v.y, v.x) - heading + 3.14159265, 6.28318531) - 3.14159265;
  float t = uTime;
  float u = angle * uDensity;
  float aa = smoothstep(0.12, 0.45, fwidth(u));
  float offset = uSpread * 0.22;
  float fanA = exp(-pow((angle + offset) / uSpread, 2.0) * 1.4);
  float fanB = exp(-pow((angle - offset) / (uSpread * 1.15), 2.0) * 1.4);
  float focus = 1.0 + uFocus.z * exp(-pow((angle - uFocus.x) / uFocus.y, 2.0));
  float lightA = fanA * shafts(u, t, 0.0, aa) * focus;
  float lightB = fanB * shafts(u * 0.83, t * 0.6, 17.0, aa) * focus;
  float reach = 1.0 / (1.0 + pow(r / 0.4, uFalloff));
  vec3 glowColor = mix(uColorA, uColorB, uBlend);
  vec3 light = (uColorA * lightA * (1.0 - uBlend) + uColorB * lightB * uBlend) * 2.0 * reach;
  light += glowColor * uGlow * exp(-pow(r / 0.4, 2.0));
  if (uDust > 0.0) {
    float sparkle = motes(q, 0.06, t, 0.0) + 0.7 * motes(q, 0.038, t * 0.8, 9.0);
    light += mix(glowColor, vec3(1.0), 0.6) * sparkle * (lightA + lightB) * reach * uDust * 2.5;
  }
  light *= uIntensity * (1.0 - smoothstep(uReveal * 2.6 - 0.45, uReveal * 2.6, r)) * smoothstep(0.0, 0.35, uReveal);
  float gray = dot(light, vec3(0.2126, 0.7152, 0.0722));
  light = max(mix(vec3(gray), light, uSaturation), 0.0);
  float peak = max(light.r, max(light.g, light.b));
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLight > 0.5) {
    vec3 ink = pow(light / max(peak, 1e-4), vec3(2.0)) * 0.75;
    float alpha = clamp(pow(1.0 - exp(-peak * 2.6), 2.5) * 0.9 * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(pow(ink, vec3(1.0 / 2.2)) * alpha, alpha);
    return;
  }
  float mapped = 1.0 - exp(-peak);
  vec3 tone = light * (mapped / max(peak, 1e-4));
  tone = mix(tone, vec3(mapped), smoothstep(0.7, 1.0, mapped) * 0.55);
  vec3 shown = clamp(tone * uOpacity, 0.0, 1.0);
  float alpha = max(shown.r, max(shown.g, shown.b));
  vec3 color = clamp(shown * alpha + grain, 0.0, 1.0);
  fragColor = vec4(min(color, vec3(alpha)), alpha);
}`;

const raysClamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const wrapAngle = (angle: number) => ((((angle + Math.PI) % RAYS_TAU) + RAYS_TAU) % RAYS_TAU) - Math.PI;

const parseColor = (value: any) => {
  const text = String(value || '').trim();
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const full = hex[1].length === 3 ? hex[1].replace(/./g, (digit: string) => digit + digit) : hex[1];
    return [0, 2, 4].map((index: number) => parseInt(full.slice(index, index + 2), 16) / 255);
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map((channel: string) => raysClamp(parseFloat(channel) / 255, 0, 1));
  return [1, 1, 1];
};

const geometryFor = (frame: any, aspect: number) => ({
  source: frame.side ? [aspect * 0.5 + 0.42, 0.3] : [aspect * 0.5 + 0.1, 0.62],
  heading: frame.side ? 3.42 : -2.48
});

const raysCompile = (gl: any, type: any, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const raysLink = (gl: any) => {
  const vertex = raysCompile(gl, gl.VERTEX_SHADER, RAYS_VERTEX);
  const fragment = raysCompile(gl, gl.FRAGMENT_SHADER, RAYS_FRAGMENT);
  const program = vertex && fragment ? gl.createProgram() : null;
  if (!vertex || !fragment || !program) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  const uniforms: any = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let index = 0; index < count; index++) {
    const info = gl.getActiveUniform(program, index);
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
};

const SideRays = ({
  rayColor1 = '#FFC46B',
  rayColor2 = '#96c8ff',
  blend = 0.6,
  origin = 'top-right',
  speed = 2.5,
  intensity = 2,
  spread = 2,
  density = 5,
  sharpness = 0.5,
  tilt = 0,
  falloff = 1.6,
  glow = 1,
  saturation = 1,
  dust = 0,
  followMouse = true,
  mouseInfluence = 0.5,
  intro = true,
  lightMode = false,
  opacity = 1,
  maxDevicePixelRatio = 2,
  className = '',
  style
}: any) => {
  const containerRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const wakeRef = useRef<any>(null);
  const [generation, setGeneration] = useState(0);

  const settings = {
    colorA: parseColor(rayColor1),
    colorB: parseColor(rayColor2),
    blend: raysClamp(blend, 0, 1),
    frame: RAYS_ORIGINS[origin] ?? RAYS_ORIGINS['top-right'],
    speed: Math.max(0, speed) * 0.4,
    intensity: Math.max(0, intensity) * 0.75,
    spread: raysClamp(spread, 0.1, 8) * 0.225,
    density: raysClamp(density, 1, 40),
    sharpness: raysClamp(sharpness, 0, 1),
    tilt: (raysClamp(tilt, -180, 180) * Math.PI) / 180,
    falloff: raysClamp(falloff, 0.2, 6),
    glow: Math.max(0, glow) * 1.2,
    saturation: Math.max(0, saturation),
    dust: raysClamp(dust, 0, 1),
    followMouse,
    mouseInfluence: raysClamp(mouseInfluence, 0, 1),
    intro,
    light: lightMode,
    opacity: raysClamp(opacity, 0, 1),
    maxRatio: raysClamp(maxDevicePixelRatio, 0.5, 3)
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    wakeRef.current?.();
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance'
    });
    const shader = gl ? raysLink(gl) : null;
    if (!gl || !shader) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vao = gl.createVertexArray();
    const size = { width: 1, height: 1 };
    const pointer = { x: 0, y: 0, inside: false };
    const aim = { value: 0, velocity: 0 };
    const focus = { angle: 0, strength: 0 };
    let time = raysShared.time;
    let reveal = settingsRef.current.intro && !reduced && generation === 0 && !raysShared.revealed ? 0 : 1;
    raysShared.revealed = true;
    let raf = 0;
    let last = 0;
    let visible = true;
    let pageVisible = document.visibilityState !== 'hidden';
    let lost = false;

    let lastMove = -1e9;
    let idle = 0;
    let breath = 1;
    let resizePending = false;
    const applyResize = () => {
      const s = settingsRef.current;
      const rect = container.getBoundingClientRect();
      const cssWidth = Math.max(1, rect.width);
      const cssHeight = Math.max(1, rect.height);
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        s.maxRatio,
        Math.sqrt(RAYS_PIXEL_BUDGET / (cssWidth * cssHeight))
      );
      const width = Math.max(1, Math.round(cssWidth * ratio));
      const height = Math.max(1, Math.round(cssHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      size.width = cssWidth;
      size.height = cssHeight;
    };

    const resize = () => {
      resizePending = true;
      wake();
    };

    const pointerAngle = (s: any) => {
      let x = (pointer.x - size.width / 2) / size.height;
      let y = (size.height / 2 - pointer.y) / size.height;
      if (s.frame.flipX) x = -x;
      if (s.frame.flipY) y = -y;
      const { source, heading } = geometryFor(s.frame, size.width / size.height);
      return wrapAngle(Math.atan2(y - source[1], x - source[0]) - heading - s.tilt);
    };

    const frame = (now: number) => {
      raf = 0;
      if (resizePending) {
        resizePending = false;
        applyResize();
      }
      if (lost) return;
      const s = settingsRef.current;
      const dt = raysClamp((now - last) / 1000 || 0, 0, 0.05);
      last = Math.max(last, now);
      time += dt * s.speed * (reduced ? 0.3 : 1);
      raysShared.time = time;
      if (reveal < 1) reveal = Math.min(1, reveal + dt / 1.6);

      const tracking = s.followMouse && pointer.inside && !reduced;
      const pointed = tracking ? pointerAngle(s) : 0;
      // Deck addition: with the pointer still, the rays drift and breathe on their own: a slow
      // sway of the aim and a swell of the light, both sums of incommensurate sines so the motion
      // never visibly repeats. `idle` eases in over a couple of seconds after the last move.
      const idleTarget = reduced ? 0 : raysClamp((now - lastMove - 1500) / 2000, 0, 1);
      idle += (idleTarget - idle) * (1 - Math.exp(-dt * 1.5));
      const wall = now / 1000;
      const drift = idle * s.spread * (0.22 * Math.sin(wall * 0.21) + 0.12 * Math.sin(wall * 0.53 + 1.3));
      breath = 1 + idle * (0.16 * Math.sin(wall * 0.62) + 0.09 * Math.sin(wall * 1.37 + 2.1) + 0.05 * Math.sin(wall * 2.9 + 0.4));
      const target = (tracking ? raysClamp(pointed, -s.spread, s.spread) * s.mouseInfluence : 0) + drift;
      const focusTarget = tracking ? s.mouseInfluence : 0;
      const ease = 1 - Math.exp(-dt * 6);
      if (tracking) focus.angle += (raysClamp(pointed - aim.value, -s.spread * 1.5, s.spread * 1.5) - focus.angle) * ease;
      focus.strength += (focusTarget - focus.strength) * ease;
      const stiffness = 18;
      const damping = 2 * Math.sqrt(stiffness);
      aim.velocity += ((target - aim.value) * stiffness - aim.velocity * damping) * dt;
      aim.value += aim.velocity * dt;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(shader.program);
      gl.bindVertexArray(vao);
      const u = shader.uniforms;
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, time);
      gl.uniform3f(u.uColorA, s.colorA[0], s.colorA[1], s.colorA[2]);
      gl.uniform3f(u.uColorB, s.colorB[0], s.colorB[1], s.colorB[2]);
      gl.uniform1f(u.uBlend, s.blend);
      // Deck addition: the shown intensity eases towards the page's, shared across instances, so
      // the light brightens or dims smoothly over a page change instead of jumping.
      if (raysShared.level < 0) raysShared.level = s.intensity;
      raysShared.level += (s.intensity - raysShared.level) * (1 - Math.exp(-dt * 2.5));
      gl.uniform1f(u.uIntensity, raysShared.level * breath);
      gl.uniform1f(u.uSpread, s.spread);
      gl.uniform1f(u.uDensity, s.density);
      gl.uniform1f(u.uSharpness, s.sharpness);
      // Deck addition: the reach eases too, so the light reaches the mark only on bright pages.
      if (Number.isNaN(raysShared.falloff)) raysShared.falloff = s.falloff;
      raysShared.falloff += (s.falloff - raysShared.falloff) * (1 - Math.exp(-dt * 1.2));
      gl.uniform1f(u.uFalloff, raysShared.falloff);
      gl.uniform1f(u.uGlow, s.glow);
      gl.uniform1f(u.uSaturation, s.saturation);
      gl.uniform1f(u.uDust, s.dust);
      gl.uniform1f(u.uOpacity, s.opacity);
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3));
      gl.uniform1f(u.uLight, s.light ? 1 : 0);
      gl.uniform3f(u.uFrame, s.frame.flipX, s.frame.flipY, s.frame.side);
      // Deck addition: the tilt eases too (shared), so the beam swings rather than jumps.
      if (Number.isNaN(raysShared.tilt)) raysShared.tilt = s.tilt;
      raysShared.tilt += (s.tilt - raysShared.tilt) * (1 - Math.exp(-dt * 1.2));
      gl.uniform1f(u.uAim, raysShared.tilt + aim.value);
      gl.uniform3f(u.uFocus, focus.angle, Math.max(0.06, s.spread * 0.25), focus.strength * 1.4);
      gl.uniform1f(u.uSway, reduced ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // Deck addition: copy the part of this frame under each gloss layer to it (see `Gloss`,
      // `DemoGloss`), in canvas pixels, so the shine sits exactly under the beams.
      if (raysShared.glosses.size) {
        const frameBox = canvas.getBoundingClientRect();
        const k = canvas.width / frameBox.width;
        for (const { canvas: gloss, clip } of raysShared.glosses) {
          if (!gloss.isConnected) continue;
          const box = gloss.getBoundingClientRect();
          const sx = Math.round((box.left - frameBox.left) * k);
          const sy = Math.round((box.top - frameBox.top) * k);
          const w = Math.max(1, Math.round(box.width * k));
          const h = Math.max(1, Math.round(box.height * k));
          if (gloss.width !== w || gloss.height !== h) {
            gloss.width = w;
            gloss.height = h;
          }
          const g2 = gloss.getContext('2d');
          if (g2) {
            g2.clearRect(0, 0, w, h);
            g2.drawImage(canvas, sx, sy, w, h, 0, 0, w, h);
            clip?.(g2);
          }
        }
      }

      const settling =
        Math.abs(target - aim.value) > 1e-4 ||
        Math.abs(aim.velocity) > 1e-4 ||
        Math.abs(focusTarget - focus.strength) > 1e-3;
      const busy = (s.speed > 0 && !reduced) || reveal < 1 || settling || Math.abs(s.intensity - raysShared.level) > 1e-3 || Math.abs(s.tilt - raysShared.tilt) > 1e-3 || Math.abs(s.falloff - raysShared.falloff) > 1e-3;
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || lost || !visible || !pageVisible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = () => {
      resize();
      wake();
    };

    const onPointerMove = (event: any) => {
      const rect = container.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      lastMove = performance.now();
      pointer.inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      wake();
    };
    const onLeave = () => {
      pointer.inside = false;
      wake();
    };
    const onPointerUp = (event: any) => {
      if (event.pointerType !== 'mouse') onLeave();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    const onLost = (event: any) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => setGeneration((value: number) => value + 1);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      wake();
    });
    resizeObserver.observe(container);

    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      wake();
    });
    intersection.observe(container);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== 'hidden';
      wake();
    };
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    wake();

    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (!gl.isContextLost()) {
        gl.deleteVertexArray(vao);
        gl.deleteProgram(shader.program);
      }
    };
  }, [generation]);

  return (
    <div ref={containerRef} className={`side-rays${className ? ` ${className}` : ''}`} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', ...style }}>
      <canvas ref={canvasRef} className="side-rays__canvas" aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};


/**
 * Moonlight rays out of the top-right corner, away from the inovex mark in the bottom right,
 * leaning a little towards the pointer. One per visible page; the shared clock makes a page change seamless.
 */
let webgl2Support: boolean | null = null;
const hasWebgl2 = () => {
  if (webgl2Support === null)
    webgl2Support = typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl2');
  return webgl2Support;
};

/**
 * The demo cue turns the lights up while it shows (`DemoTime` sets it; only the active page's
 * does): the rays go as bright as on the title and the close, and ease back when it clears. They
 * keep their aim through the middle of the page, where the cue is, instead of tilting to the mark.
 */
const demoLights = { on: false, subscribers: new Set<() => void>() };
const setDemoLights = (on: boolean) => {
  if (demoLights.on === on) return;
  demoLights.on = on;
  demoLights.subscribers.forEach((notify) => notify());
};
const subscribeDemoLights = (notify: () => void) => {
  demoLights.subscribers.add(notify);
  return () => {
    demoLights.subscribers.delete(notify);
  };
};

const Rays = ({ bright }: { bright: boolean }) => {
  const active = useIsActivePage();
  const lit = useSyncExternalStore(subscribeDemoLights, () => demoLights.on, () => false);
  if (!active || !hasWebgl2()) return <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: CORNER_GLOW, zIndex: 0 }} />;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, mixBlendMode: 'screen' }}>
      <SideRays
        rayColor1="#dbe4ff"
        rayColor2="#7aa2ff"
        blend={0.7}
        speed={1.5}
        intensity={bright || lit ? 2.4 : 0.85}
        origin="top-right"
        tilt={bright ? 22 : 0}
        falloff={bright || lit ? 0.9 : 1.6}
        followMouse
        mouseInfluence={0.25}
      />
    </div>
  );
};

// ── 01 · Title ───────────────────────────────────────────────────────────────

/**
 * The title is two pages with the same content: the first shows the logo in colour, the second
 * fades it to the watermark in place. So the first → settles the logo, the second cuts to the
 * content. A hidden <Step> would have been tidier, but a page you land on directly (the deck
 * opens on it) starts with its steps revealed, and that press would have been lost.
 */
// One left axis: logo top left, author as an eyebrow, event at the bottom, mark in the corner.
/**
 * "Agentic" in the TechText treatment, on the title page only and only where the audience is
 * looking (it runs a canvas loop; thumbnails and the transit copy get the plain word, which is
 * what TechText settles to anyway). The canvas is taller than the line so the selection frame
 * and specks have room; negative margins keep the line box at the h1's 150px.
 */
const TECH_BOX = { w: 1200, h: 250 };
const AgenticWord = ({ calm }: { calm: boolean }) => {
  const active = useIsActivePage();
  if (!active)
    return (
      <>
        Agentic
        <br />
      </>
    );
  return (
    <div style={{ width: TECH_BOX.w, height: TECH_BOX.h, margin: `${-(TECH_BOX.h - 150) / 2}px 0 ${-(TECH_BOX.h - 150) / 2}px ${-TECH_INSET}px` }}>
      <TechText
        text="Agentic"
        fontFamily="Atkinson Hyperlegible"
        fontWeight={700}
        fontSize={150}
        letterSpacing={-0.02}
        color={TEXT}
        accentColor={ACCENT}
        align="left"
        intro={calm ? 'none' : 'metrics'}
        introDuration={2.2}
        calm={calm}
        sweep={!calm}
        selection={!calm}
        speed={0.6}
        draggable={false}
        clickKick={false}
      />
    </div>
  );
};

const TitleBody = ({ mark }: { mark: MarkMode }) => (
  <Shell mark={mark} center>
    <img src={inovexLogo} alt="inovex" style={{ position: 'absolute', top: 0, left: 0, height: 46 }} />
    <div>
      <div style={{ fontSize: 30, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        Frank Blendinger
      </div>
      <div style={{ width: 96, height: 4, background: ACCENT, margin: '36px 0 40px' }} />
      <h1
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 150,
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          margin: 0,
        }}
      >
        <AgenticWord calm={mark !== 'brand'} />
        Code Reviews
      </h1>
    </div>
    <div style={{ position: 'absolute', left: 0, bottom: 0, fontSize: 30, color: MUTED }}>
      Meetup Erlangen
      <span style={{ color: DIM, margin: '0 18px' }}>·</span>
      2026-11-26
    </div>
  </Shell>
);

const Title: Page = () => <TitleBody mark="brand" />;
/**
 * A transit page: it only exists to let the logo fade in place. Arriving from the title it moves
 * on by itself once the fade is done; arriving back from the content it goes straight on to the
 * title, which brings the colour back. Landed on directly (deck opened here), it stays.
 * The step is a synthetic arrow key, so the presenter window follows as for a real press.
 */
const pressKey = (key: string) => window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

/**
 * Drives a transit page. `ahead` is the mark the audience saw on the page before it going
 * forward: arriving from there, wait out the fade and move on; arriving from anywhere else that
 * was seen (i.e. backward), step straight back. Landed on directly, do nothing.
 */
const useTransit = (ahead: MarkMode, fadeMs: number) => {
  const active = useIsActivePage();
  const [from] = useState(() => (active ? shownMode : null));
  useEffect(() => {
    if (!active || from === null) return;
    const forward = from === ahead;
    const t = window.setTimeout(() => pressKey(forward ? 'ArrowRight' : 'ArrowLeft'), forward ? fadeMs + 100 : 0);
    return () => window.clearTimeout(t);
  }, [active, from, ahead, fadeMs]);
};

const TitleSettled: Page = () => {
  useTransit('brand', 1000);
  return <TitleBody mark="faint" />;
};

// ── 02 · review-mr ───────────────────────────────────────────────────────────

/**
 * Stepped-reveal motion for the row lists.
 *
 * `<Step>` only animates opacity, and it keeps its children mounted — so a `@keyframes`
 * animation would fire at page mount, not at reveal. What it does give us is a
 * `data-osd-step="revealed|pending"` attribute on its wrapper, and a *transition* against
 * that attribute fires exactly when it flips. So the framework keeps owning the fade and
 * the keyboard handling, and this adds the movement on top.
 *
 * Scoped under `.acr-reveal` because any CSS loaded here is global.
 *
 * The intro sentence sits in the gap the rows leave below the heading and fades out as soon
 * as the first row lands — `:has()` on the stage, so no state has to be threaded through.
 * It stays in flow while hidden, so nothing below it shifts.
 *
 * The row rises as it fades in; the accent label settles in from the left a beat behind it,
 * which leans on the deck's left axis instead of fighting it. 18px / 12px and 320ms sit
 * just above the theme's transition band — a reveal you deliberately trigger can carry a
 * little more than an automatic page change.
 */
const REVEAL_CSS = `
.acr-stage .acr-intro {
  transform: translateY(-50%);
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
.acr-stage:has([data-osd-step='revealed']) .acr-intro {
  opacity: 0;
  transform: translateY(calc(-50% - 8px));
}
@media (prefers-reduced-motion: reduce) {
  .acr-stage .acr-intro { transition: none; }
}
.acr-reveal [data-osd-step] .acr-row,
.acr-reveal [data-osd-step] .acr-label {
  transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}
.acr-reveal [data-osd-step] .acr-label { transition-delay: 60ms; }
.acr-reveal [data-osd-step='pending'] .acr-row { transform: translateY(18px); }
.acr-reveal [data-osd-step='pending'] .acr-label { transform: translateX(-12px); }
.acr-reveal [data-osd-step='revealed'] .acr-row,
.acr-reveal [data-osd-step='revealed'] .acr-label { transform: none; }
@media (prefers-reduced-motion: reduce) {
  .acr-reveal [data-osd-step] .acr-row,
  .acr-reveal [data-osd-step] .acr-label { transition: none; transform: none; }
}
`;

const RevealStyles = () => <style>{REVEAL_CSS}</style>;

/**
 * Short description of the skill, shown when the page arrives and gone once the first row
 * reveals.
 *
 * Absolutely positioned, so it costs no layout and the rows keep the exact positions they
 * have without it. `top: 50%` centres it on the canvas, because the stage *is* the centred
 * content block — its own midpoint is the canvas midpoint.
 *
 * The centring transform lives in the stylesheet rather than here: an inline `transform`
 * outranks a class selector, so the hidden-state rule could never override it.
 *
 * Centred, it shares space with the first row's slot, so the out-fade is quick (200ms) —
 * the sentence is gone before the row settles rather than dissolving through it.
 */
const Intro = ({ children }: { children: ReactNode }) => (
  <p
    className="acr-intro"
    style={{
      position: 'absolute',
      top: '50%',
      left: 0,
      maxWidth: 1680,
      fontSize: 44,
      lineHeight: 1.75,
      color: MUTED,
      margin: 0,
    }}
  >
    {children}
  </p>
);

/**
 * Line icon, coloured from the palette rather than from the file. The sources are
 * unmodified tabler outline SVGs (`stroke="currentColor"`, which renders black in an
 * `<img>`); masking uses only their alpha, so the colour comes from here.
 *
 * The url() MUST be quoted: Vite inlines these as data URIs and rewrites their attribute
 * quotes to apostrophes, which an unquoted CSS url() token cannot contain — the declaration
 * gets dropped and you get a solid coloured box.
 */
const Icon = ({
  src,
  height,
  width = height,
  color,
}: {
  src: string;
  height: number;
  width?: number;
  color: string;
}) => (
  <span
    aria-hidden="true"
    style={{
      display: 'block',
      width,
      height,
      flexShrink: 0,
      backgroundColor: color,
      WebkitMaskImage: `url("${src}")`,
      maskImage: `url("${src}")`,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
    }}
  />
);

/** The one word in an intro line that names which hat you are wearing. */
const Hat = ({ children }: { children: ReactNode }) => (
  <span style={{ color: 'var(--osd-accent)' }}>{children}</span>
);

/** Wraps the rows so each one reveals on its own `→`. */
const RevealList = ({ children }: { children: ReactNode }) => (
  <div className="acr-reveal" style={{ marginTop: 121 }}>
    <RevealStyles />
    <Steps>{children}</Steps>
  </div>
);

/** Groups heading + intro + rows so `:has()` can see the steps from the intro. */
const Stage = ({ children }: { children: ReactNode }) => (
  <div className="acr-stage" style={{ position: 'relative' }}>{children}</div>
);

/**
 * The right-hand annotation. A value starting with `/` is another skill from the same
 * repo doing the work, so it renders as a command — monospace, accent slash, matching
 * how command names appear everywhere else. Anything else is prose, so it renders in
 * sans: the house rule is that monospace is only for things you could actually type.
 */
const Aside = ({ text }: { text: string }) =>
  text.startsWith('/') ? (
    <span style={{ fontFamily: MONO, fontSize: 26, color: MUTED }}>
      <span style={{ color: 'var(--osd-accent)' }}>/</span>
      {text.slice(1)}
    </span>
  ) : (
    <span style={{ fontSize: 28, color: MUTED }}>{text}</span>
  );

const Row = ({ label, note, aside }: { label: string; note: string; aside?: string }) => (
  <div className="acr-row" style={{ display: 'flex', alignItems: 'baseline', gap: 48, height: 76 }}>
    <span
      className="acr-label"
      style={{
        fontFamily: MONO,
        fontSize: 32,
        color: 'var(--osd-accent)',
        width: 360,
        display: 'inline-block',
      }}
    >
      {label}
    </span>
    {/* Fixed note width rather than flex, so the asides form their own column right
        next to the text they annotate instead of drifting to the canvas edge. */}
    <span style={{ width: 720, fontSize: 36, color: BODY }}>{note}</span>
    {aside ? <Aside text={aside} /> : null}
  </div>
);

const ReviewMr: Page = () => (
  <Shell>
    <Stage>
      <SkillH name="review-mr" />
      <Intro>
        Support for the <Hat>reviewer</Hat> of a merge request.
        <br />
        Understand it, find issues, write good comments, follow up.
      </Intro>

      {/* Order is the actual chronology of a review. */}
      <RevealList>
        <Step duration={320}>
          <Row label="explainer" note="a blog-style article for context" aside="/explain-branch" />
        </Step>
        <Step duration={320}>
          <Row label="human review" note="own and other reviewers' threads" aside="synced in as topics" />
        </Step>
        <Step duration={320}>
          <Row label="agent review" note="findings, severity-tagged" aside="/review-branch" />
        </Step>
        <Step duration={320}>
          <Row label="drafting" note="each topic worded as a comment" aside="posted on click only" />
        </Step>
        <Step duration={320}>
          <Row label="follow-up" note="replies and pushes" aside="agent judges · human acks" />
        </Step>
      </RevealList>
    </Stage>
  </Shell>
);

// ── 04 · rework-mr ───────────────────────────────────────────────────────────

const ReworkMr: Page = () => (
  <Shell>
    <Stage>
      <SkillH name="rework-mr" />
      <Intro>
        Support for the <Hat>author</Hat> of a merge request.
        <br />
        Discuss feedback with the agent, agree on plans, fix step by step.
      </Intro>

      <RevealList>
        <Step duration={320}>
          <Row label="threads" note="the reviewers' open topics" aside="one round through all" />
        </Step>
        <Step duration={320}>
          <Row label="planning" note="every topic argued to a plan" aside="before any code" />
        </Step>
        <Step duration={320}>
          <Row label="fixing" note="checks pass, fixup into its commit" aside="diff in hunk to annotate" />
        </Step>
        <Step duration={320}>
          <Row label="pushing" note="force-push on one press" aside="checks already ran" />
        </Step>
        <Step duration={320}>
          <Row label="replies" note="one per thread, in its language" aside="post or post + resolve" />
        </Step>
      </RevealList>
    </Stage>
  </Shell>
);

// ── Workflow loops ───────────────────────────────────────────────────────────

/**
 * Each skill's workflow as two loops side by side, the second fed by the first. A loop is three
 * steps on a ring, clockwise from the top, with its name in the middle; the arcs between the
 * steps draw themselves in when the loop is revealed. Both loops are one <Step> each, so the
 * page builds left, then right.
 *
 * Words follow the skills' own SKILL.md: review-mr curates and drafts topic by topic, then runs
 * re-review rounds whose news is judged settled / more / wait; rework-mr plans every open topic
 * (fix, reply or push-back), then fixes them one at a time, checked, reviewed in hunk, pushed.
 */
type Skin = { fill: string; stroke: string };
const STEP_SKIN: Skin = { fill: 'rgba(45,93,255,0.22)', stroke: 'rgba(120,150,255,0.95)' }; // Leuchtblau

const RING_W = 740;
const RING_H = 560;
const RING = { cx: RING_W / 2, cy: 300, r: 240 };
const PILL = { w: 264, h: 92 };
// Clockwise from the top: 12, 4 and 8 o'clock.
const ANGLES = [-90, 30, 150];
// How far each arc stays clear of the pills at its ends, in degrees.
const ARC_GAP = { top: 40, side: 22 };

const rad = (deg: number) => (deg * Math.PI) / 180;
const onRing = (deg: number) => ({ x: RING.cx + RING.r * Math.cos(rad(deg)), y: RING.cy + RING.r * Math.sin(rad(deg)) });
const gapAt = (deg: number) => (deg === -90 ? ARC_GAP.top : ARC_GAP.side);

/**
 * How a loop arrives, in beats, all keyed off its <Step> flipping to `revealed` (the Step's own
 * fade is instant; these do the work). `--d` delays a whole loop: 0 for the first, and for the
 * second the time the hand-off takes: its arrow draws, its label types itself, then the ring
 * fades in, its arcs draw, and only then the comet starts (`COMET_DELAY`). The key arrives last.
 * Delays live on the revealed state only, so stepping back hides everything at once.
 * `will-change` keeps each ring on its own layer for good: otherwise Chrome drops the layer when
 * the transition ends and re-rasters the text snapped to the pixel grid, a visible 1px jump.
 * Once the second loop is up, the first dims so the new one has the focus.
 * `--wait` delays all of it when the step follows a demo cue (set in DEMO_CSS).
 */
const HANDOFF_MS = 1100;
const COMET_DELAY = 1500;
const WHO_STAGGER = 350; // the who-tabs, then the key's entries, one after the other
const DEMO_DIM_MS = 1400; // after a demo cue, the lights dim back before the next step arrives
const LOOP_CSS = `
.aci-loops [data-osd-step] .aci-loop { will-change: opacity, transform; transform-origin: 50% 55%; transition: opacity 800ms ease-out, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1), filter 500ms ease-out; }
.aci-loops [data-osd-step]:has(~ [data-osd-step='revealed'] .aci-loop) .aci-loop { opacity: 0.45; }
.aci-tab { transition: opacity 450ms ease-out; }
.aci-pill-text { transform: translateY(6px); transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1); }
.aci-tab, .aci-pill-text { transition-delay: calc(var(--i) * ${WHO_STAGGER}ms); }
.aci-loops:has([data-osd-step='pending'] > .aci-who-intro) .aci-tab { opacity: 0; transition: none; }
.aci-loops:has([data-osd-step='pending'] > .aci-who-intro) .aci-pill-text { transform: none; transition: none; }
.aci-loops [data-osd-step] > .aci-who-intro .aci-key { transition: filter 500ms ease-out; }
.aci-key > * { transition: opacity 450ms ease-out; }
.aci-loops [data-osd-step='pending'] > .aci-who-intro .aci-key > * { opacity: 0; transition: none; }
.aci-loops [data-osd-step='revealed'] > .aci-who-intro .aci-key > * { transition-delay: calc(${3 * WHO_STAGGER}ms + var(--i) * ${WHO_STAGGER}ms); }
.aci-loops [data-osd-step='pending'] .aci-loop { opacity: 0; transform: scale(0.94); transition: none; }
.aci-loops [data-osd-step='revealed'] .aci-loop { transition-delay: calc(var(--wait, 0ms) + var(--d, 0ms)), calc(var(--wait, 0ms) + var(--d, 0ms)), 0ms; }
.aci-loop .aci-arc { transition: stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1); }
.aci-loops [data-osd-step='pending'] .aci-arc { stroke-dashoffset: var(--len); transition: none; }
.aci-loops [data-osd-step='revealed'] .aci-arc { stroke-dashoffset: 0; transition-delay: calc(var(--wait, 0ms) + var(--d, 0ms) + 450ms); }
.aci-key { transition: opacity 900ms ease-out, filter 500ms ease-out; }
.aci-loops [data-osd-step='pending'] .aci-key { opacity: 0; transition: none; }
.aci-loops [data-osd-step='revealed'] .aci-key { transition-delay: ${COMET_DELAY + 400}ms, 0ms; }
.aci-hand-line { stroke-dasharray: 172; transition: stroke-dashoffset 500ms cubic-bezier(0.4, 0, 0.2, 1); }
.aci-hand-head { transition: opacity 200ms ease-out; }
.aci-hand-text { transition: clip-path 600ms steps(18, end); }
.aci-loops [data-osd-step='pending'] .aci-hand-line { stroke-dashoffset: 172; transition: none; }
.aci-loops [data-osd-step='pending'] .aci-hand-head { opacity: 0; transition: none; }
.aci-loops [data-osd-step='pending'] .aci-hand-text { clip-path: inset(0 100% 0 0); transition: none; }
.aci-loops [data-osd-step='revealed'] .aci-hand-line { transition-delay: var(--wait, 0ms); }
.aci-loops [data-osd-step='revealed'] .aci-hand-head { transition-delay: calc(var(--wait, 0ms) + 420ms); }
.aci-loops [data-osd-step='revealed'] .aci-hand-text { clip-path: inset(0 0 0 0); transition-delay: calc(var(--wait, 0ms) + 500ms); }
@media (prefers-reduced-motion: reduce) {
  .aci-loops * { transition: none !important; }
}
`;

/** One arc of a ring, from one step to the next, with its length known for the draw-in. */
const Arc = ({ from, to }: { from: number; to: number }) => {
  const a0 = from + gapAt(from);
  const a1 = (to < from ? to + 360 : to) - gapAt(to);
  const p0 = onRing(a0);
  const p1 = onRing(a1);
  const len = RING.r * rad(a1 - a0);
  return (
    <path
      className="aci-arc"
      d={`M ${p0.x} ${p0.y} A ${RING.r} ${RING.r} 0 0 1 ${p1.x} ${p1.y}`}
      style={{ strokeDasharray: len, strokeDashoffset: 0, ['--len' as string]: len }}
      markerEnd="url(#aci-loop-arrow)"
    />
  );
};

/**
 * A step on the ring. Its glow ring (`aci-glow`) is lit by the comet as it passes; the comet's
 * loop writes the opacity straight to the DOM, so the page never re-renders per frame.
 */
const StepPill = ({ at, order, label, detail, who, glowRef }: LoopStep & { at: number; order: number; glowRef?: (el: SVGRectElement | null) => void }) => {
  const ring = onRing(at);
  const p = { x: Math.round(ring.x), y: Math.round(ring.y) };
  const box = { x: p.x - PILL.w / 2, y: p.y - PILL.h / 2, width: PILL.w, height: PILL.h, rx: PILL.h / 2 };
  return (
    <g style={{ ['--i' as string]: order }}>
      {/* opaque underlay, so the comet passes behind the step rather than through its text */}
      <rect {...box} fill="#06164D" />
      <rect {...box} fill={WHO_SKIN[who].fill} stroke={WHO_SKIN[who].stroke} strokeWidth={2} />
      <rect ref={glowRef} {...box} fill="rgba(255,255,255,0.08)" stroke="#FFFFFF" strokeWidth={2.5} opacity={0} filter="url(#aci-comet-glow)" />
      {/* centred in the pill; moves down a little to make room when the tab arrives */}
      <g className="aci-pill-text">
        <text x={p.x} y={p.y - 4} textAnchor="middle" fontFamily={SANS} fontSize={32} fontWeight={700} fill={TEXT}>
          {label}
        </text>
        <text x={p.x} y={p.y + 30} textAnchor="middle" fontFamily={SANS} fontSize={23} fill={MUTED}>
          {detail}
        </text>
      </g>
      <WhoTab who={who} x={p.x} y={box.y} />
    </g>
  );
};

/** Who does a step: the agent by itself, a human, or both together. */
type Who = 'agent' | 'human' | 'both';
type LoopStep = { label: string; detail: string; who: Who };

// Agent = Leuchtblau, human = Leuchtgrün, together = both, blended across the pill.
const WHO_SKIN: Record<Who, { fill: string; stroke: string }> = {
  agent: { fill: 'rgba(45,93,255,0.22)', stroke: 'rgba(120,150,255,0.95)' },
  human: { fill: 'rgba(125,244,129,0.16)', stroke: 'rgba(125,244,129,0.95)' },
  both: { fill: 'url(#aci-both-fill)', stroke: 'url(#aci-both-stroke)' },
};

/**
 * Who, as a shape as well as a colour, so it reads on a washed-out projector and without colour
 * vision: a four-point spark for the agent (the usual AI mark), a person for the human, both
 * for together. Monochrome line-weight glyphs in the pill's own colours; centred on (x, y).
 */
const AGENT_C = 'rgba(150,175,255,1)';
const HUMAN_C = 'rgba(125,244,129,1)';
const Spark = ({ x, y, size, color }: { x: number; y: number; size: number; color: string }) => (
  <path
    transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}
    d="M12 1.5C12.9 7.6 16.4 11.1 22.5 12C16.4 12.9 12.9 16.4 12 22.5C11.1 16.4 7.6 12.9 1.5 12C7.6 11.1 11.1 7.6 12 1.5Z"
    fill={color}
  />
);
const Person = ({ x, y, size, color }: { x: number; y: number; size: number; color: string }) => (
  <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
    <circle cx={12} cy={7.5} r={4.5} />
    <path d="M3.5 22.5C3.5 17.5 7.3 14 12 14S20.5 17.5 20.5 22.5" />
  </g>
);
const WhoGlyphs = ({ who, x, y, size }: { who: Who; x: number; y: number; size: number }) => {
  if (who === 'agent') return <Spark x={x} y={y} size={size} color={AGENT_C} />;
  if (who === 'human') return <Person x={x} y={y} size={size} color={HUMAN_C} />;
  return (
    <g>
      <Spark x={x} y={y} size={size} color={AGENT_C} />
      <Person x={x + size * 1.15} y={y} size={size} color={HUMAN_C} />
    </g>
  );
};

/** Who, as a small tab on the step's top edge: the glyphs in a capsule of the step's skin. */
const WhoTab = ({ who, x, y }: { who: Who; x: number; y: number }) => {
  const w = who === 'both' ? 62 : 40;
  const box = { x: x - w / 2, y: y - 16, width: w, height: 32, rx: 16 };
  return (
    <g className="aci-tab">
      <rect {...box} fill="#06164D" />
      <rect {...box} fill={WHO_SKIN[who].fill} stroke={WHO_SKIN[who].stroke} strokeWidth={2} />
      <WhoGlyphs who={who} x={who === 'both' ? x - 10.5 : x} y={y} size={18} />
    </g>
  );
};

/** The three kinds, as a small key; same pill shapes as the steps. */
const WhoKey = ({ who, label, i }: { who: Who; label: string; i: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, ['--i' as string]: i }}>
    <svg width={68} height={34} viewBox="0 0 68 34" aria-hidden="true">
      <defs>
        <linearGradient id={`aci-key-${who}`} x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(120,150,255,0.95)" />
          <stop offset="100%" stopColor="rgba(125,244,129,0.95)" />
        </linearGradient>
      </defs>
      <rect x={1.5} y={1.5} width={65} height={31} rx={15.5} fill={who === 'both' ? 'rgba(85,170,190,0.18)' : WHO_SKIN[who].fill}
        stroke={who === 'both' ? `url(#aci-key-${who})` : WHO_SKIN[who].stroke} strokeWidth={2} />
      <WhoGlyphs who={who} x={who === 'both' ? 23.5 : 34} y={17} size={18} />
    </svg>
    <span style={{ fontSize: 26, color: MUTED }}>{label}</span>
  </div>
);

/**
 * A comet runs the ring clockwise, one lap per `LAP_MS`, a fading trail behind it; each step
 * lights up as it passes. Behind the pills, so it seems to go through each step. Runs only on
 * the page the audience sees, on the current loop (the last revealed), always starting from the
 * top step, the loop's entry point; thumbnails show the ring at rest.
 */
const LAP_MS = 5200;
const TRAIL = 48;
const TRAIL_STEP = 0.9; // degrees between trail dots

const Loop = ({ title, sub, steps, second }: { title: string; sub?: string; steps: [LoopStep, LoopStep, LoopStep]; second?: boolean }) => {
  const active = useIsActivePage();
  const svg = useRef<SVGSVGElement | null>(null);
  const comet = useRef<SVGGElement | null>(null);
  const glows = useRef<(SVGRectElement | null)[]>([]);
  useEffect(() => {
    if (!active || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let t0 = -1; // set when the loop becomes current, so every lap starts at the top step
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // Only the current loop runs: the last one revealed on its page.
      const own = svg.current?.closest('[data-osd-step]');
      const revealed = own?.parentElement?.querySelectorAll(":scope > [data-osd-step='revealed']:has(.aci-loop)");
      const shown = !!own && !!revealed?.length && revealed[revealed.length - 1] === own;
      if (!shown) glows.current.forEach((g) => g?.setAttribute('opacity', '0'));
      if (comet.current) comet.current.style.opacity = shown ? '1' : '0';
      if (!shown) {
        t0 = -1;
        return;
      }
      // the comet waits for the ring to finish arriving
      if (t0 < 0) t0 = now + (parseFloat(getComputedStyle(own).getPropertyValue('--wait')) || 0) + COMET_DELAY + (second ? HANDOFF_MS : 0);
      if (now < t0) {
        if (comet.current) comet.current.style.opacity = '0';
        return;
      }
      const head = -90 + (((now - t0) / LAP_MS) % 1) * 360;
      const dots = comet.current?.children;
      if (dots)
        for (let i = 0; i < dots.length; i++) {
          const p = onRing(head - i * TRAIL_STEP);
          dots[i].setAttribute('cx', String(p.x));
          dots[i].setAttribute('cy', String(p.y));
        }
      ANGLES.forEach((at, k) => {
        let d = head - at;
        d = ((d % 360) + 540) % 360 - 180; // signed distance, head minus step
        // brightest just as the head arrives, then a slow afterglow
        const lit = d < 0 ? Math.exp(-((d / 10) ** 2)) : Math.exp(-d / 40);
        glows.current[k]?.setAttribute('opacity', lit.toFixed(3));
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, second]);
  return (
    <svg ref={svg} className="aci-loop" width={RING_W} height={RING_H} viewBox={`0 0 ${RING_W} ${RING_H}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <marker id="aci-loop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={MUTED} />
        </marker>
        <linearGradient id="aci-both-stroke" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(120,150,255,0.95)" />
          <stop offset="100%" stopColor="rgba(125,244,129,0.95)" />
        </linearGradient>
        <linearGradient id="aci-both-fill" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(45,93,255,0.22)" />
          <stop offset="100%" stopColor="rgba(125,244,129,0.16)" />
        </linearGradient>
        <filter id="aci-comet-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill="none" stroke={MUTED} strokeWidth={2.5} strokeLinecap="round">
        <Arc from={ANGLES[0]} to={ANGLES[1]} />
        <Arc from={ANGLES[1]} to={ANGLES[2]} />
        <Arc from={ANGLES[2]} to={ANGLES[0]} />
      </g>
      {active ? (
        <g ref={comet} filter="url(#aci-comet-glow)" style={{ opacity: 0, transition: 'opacity 400ms' }}>
          {Array.from({ length: TRAIL }, (_, i) => (
            <circle key={i} r={i === 0 ? 6 : 4.5 * (1 - i / TRAIL) + 0.8} fill={i === 0 ? '#EFFFF0' : ACCENT} opacity={i === 0 ? 1 : 0.7 * (1 - i / TRAIL) ** 1.5} />
          ))}
        </g>
      ) : null}
      <text x={RING.cx} y={sub ? RING.cy - 14 : RING.cy + 12} textAnchor="middle" fontFamily={SANS} fontSize={36} fontWeight={700} fill={ACCENT}>
        {title}
      </text>
      {sub ? (
        <text x={RING.cx} y={RING.cy + 24} textAnchor="middle" fontFamily={SANS} fontSize={24} fill={MUTED}>
          {sub}
        </text>
      ) : null}
      <StepPill at={ANGLES[0]} order={0} {...steps[0]} glowRef={(el) => (glows.current[0] = el)} />
      <StepPill at={ANGLES[1]} order={1} {...steps[1]} glowRef={(el) => (glows.current[1] = el)} />
      <StepPill at={ANGLES[2]} order={2} {...steps[2]} glowRef={(el) => (glows.current[2] = el)} />
    </svg>
  );
};

/** What carries the work from the first loop into the second. */
const Handoff = ({ label }: { label: string }) => (
  <div className="aci-handoff" style={{ width: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 280 }}>
    <svg width={200} height={24} viewBox="0 0 200 24" aria-hidden="true">
      <path className="aci-hand-line" d="M 12 12 H 184" stroke={MUTED} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <path className="aci-hand-head" d="M 180 4 L 194 12 L 180 20 z" fill={MUTED} />
    </svg>
    <div className="aci-hand-text" style={{ fontSize: 24, color: MUTED, textAlign: 'center', lineHeight: 1.3 }}>{label}</div>
  </div>
);

// ── EchoText ─────────────────────────────────────────────────────────────────
// Ported from React Bits, "Echo Text" (src/content/TextAnimations/EchoText/EchoText.jsx),
// https://reactbits.dev/text-animations/echo-text — kept as close to the original as possible.
// Changes: inlined (a slide is one file), CSS as a string with the class names prefixed, names
// prefixed so they do not clash with the deck's, loose TypeScript annotations.
//
// MIT + Commons Clause License Condition v1.0 — Copyright (c) 2026 David Haz. Same terms as the
// TechText notice above: used as part of this deck, not redistributed on its own.
/* eslint-disable */
const ECHO_CSS = `
.aci-echo-text {
  position: relative;
  display: inline-block;
  white-space: nowrap;
  line-height: 0.9;
  letter-spacing: -0.04em;
  user-select: none;
  contain: layout style;
  font-kerning: normal;
  text-rendering: geometricPrecision;
}
.aci-echo-text__echo {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  transform-origin: 50% 50%;
  will-change: transform, opacity;
  backface-visibility: hidden;
}
.aci-echo-text__bursts {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.aci-echo-text__echo--outline {
  -webkit-text-fill-color: transparent;
  -webkit-text-stroke: max(1px, 0.014em) currentColor;
}
.aci-echo-text__echo--front {
  position: relative;
  z-index: 2;
  opacity: 1;
  filter: none;
  text-shadow: 0 0.035em 0 rgba(255, 255, 255, 0.04);
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .aci-echo-text__echo:not(.aci-echo-text__echo--front) { display: none; }
  .aci-echo-text__echo--front { transform: none !important; }
}
`;

const echoClamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const echoDirectionVectors: any = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  diagonal: { x: 0.72, y: 0.72 }
};

const echoEasing: any = {
  linear: (t: number) => t,
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  snappy: (t: number) => 1 - Math.pow(1 - t, 5)
};

const ECHO_DRIFT_PERIOD = 7200;
const ECHO_DRIFT_IDLE = 2600;
const ECHO_BURST_LIFE = 1100;
const ECHO_BURST_GAP = 80;

const echoReadScroll = (target: any) =>
  target instanceof Element ? [target.scrollLeft || 0, target.scrollTop || 0] : [window.scrollX, window.scrollY];

const EchoText = ({
  text = 'Motion Echo',
  echoes = 12,
  lag = 0.24,
  offset = 36,
  direction = 'right',
  fade = 0.72,
  blur = 3,
  tint = '#7dd3fc',
  echoColors,
  echoStyle = 'solid',
  echoScale = 1,
  mode = 'both',
  trail = 'pointer',
  clickBurst = true,
  cursorRadius = 320,
  duration = 900,
  ease = 'ease-out',
  fontSize = 'clamp(3rem, 9vw, 7rem)',
  fontWeight = 800,
  color = 'currentColor',
  className = '',
  style
}: any) => {
  const rootRef = useRef<any>(null);
  const burstRef = useRef<any>(null);
  const copyRefs = useRef<any[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const echoCount = prefersReducedMotion ? 0 : echoClamp(Math.round(echoes), 0, 24);
  const echoIndexes = useMemo(() => Array.from({ length: echoCount }, (_, index) => echoCount - index), [echoCount]);
  const ramp = Array.isArray(echoColors) && echoColors.length ? echoColors : null;
  const canBurst = clickBurst && echoCount > 0;

  const echoColor = (index: number) => {
    if (ramp) {
      const depth = echoCount > 1 ? (index - 1) / (echoCount - 1) : 0;
      return `color-mix(in srgb, ${ramp[ramp.length - 1]} ${Math.round(depth * 100)}%, ${ramp[0]})`;
    }
    return tint ? `color-mix(in srgb, ${tint} ${Math.min(72, 18 + index * 5)}%, currentColor)` : undefined;
  };

  useEffect(() => {
    if (!window.matchMedia) return undefined;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(media.matches);
    updateMotionPreference();

    media.addEventListener?.('change', updateMotionPreference);
    return () => media.removeEventListener?.('change', updateMotionPreference);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const vector = echoDirectionVectors[direction] || echoDirectionVectors.right;
    const safeOffset = echoClamp(Number(offset) || 0, 0, 120);
    const safeCursorRadius = echoClamp(Number(cursorRadius) || 320, 40, 1200);
    const safeLag = echoClamp(Number(lag) || 0.16, 0.02, 0.5);
    const safeFade = echoClamp(Number(fade) || 0.64, 0.1, 0.95);
    const safeBlur = echoClamp(Number(blur) || 0, 0, 16);
    const safeScale = echoClamp(Number(echoScale) || 1, 0.25, 2.5);
    const safeDuration = Math.max(0, Number(duration) || 0);
    const easeFn = echoEasing[ease] || echoEasing['ease-out'];
    const entranceEnabled = mode === 'entrance' || mode === 'both';
    const liveEnabled = mode === 'pointer' || mode === 'both';
    const canHover = Boolean(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches);
    const drifting = liveEnabled && trail === 'auto';
    const scrolling = liveEnabled && trail === 'scroll';
    const following = liveEnabled && canHover && !scrolling;
    const driftSpacing = 0.12 + safeLag * 1.1;
    const burstReach = echoClamp(safeOffset / 36, 0.35, 2.5);
    const shiftLimit = safeOffset * 4;

    const state: any = {
      targetX: 0,
      targetY: 0,
      lastTargetX: 0,
      lastTargetY: 0,
      activity: entranceEnabled ? 1 : 0,
      positions: Array.from({ length: echoCount + 1 }, (_, index) => {
        const entranceAmount = entranceEnabled ? safeOffset * (index + 0.35) : 0;
        return { x: vector.x * entranceAmount, y: vector.y * entranceAmount };
      }),
      bends: Array.from({ length: echoCount + 1 }, () => ({ x: 0, y: 0 })),
      startTime: performance.now(),
      lastTime: 0,
      drift: 0,
      phase: 0,
      pointerNear: false,
      pointerTime: -Infinity,
      visible: true,
      pushX: 0,
      pushY: 0,
      velocityX: 0,
      velocityY: 0,
      bursts: []
    };
    let frame = 0;

    for (let index = 1; index <= echoCount; index += 1) {
      const copy = copyRefs.current[index];
      if (copy) copy.style.filter = safeBlur > 0 ? `blur(${((safeBlur * index) / echoCount).toFixed(2)}px)` : 'none';
    }

    const renderBursts = (now: number) => {
      state.bursts = state.bursts.filter((burst: any) => {
        const age = now - burst.start;
        let alive = false;

        burst.nodes.forEach((node: any, index: number) => {
          const local = (age - index * ECHO_BURST_GAP) / ECHO_BURST_LIFE;
          if (local < 1) alive = true;

          const progress = echoClamp(local, 0, 1);
          const spread = 1 - Math.pow(1 - progress, 3);
          const scale = 1 + spread * 0.34 * burstReach;
          const peak = 0.75 * Math.pow(safeFade, index * 0.5);
          const opacity = local <= 0 ? 0 : Math.min(1, progress * 8) * Math.pow(1 - progress, 1.5) * peak;

          node.style.transform = `translate3d(${burst.x.toFixed(2)}px, ${burst.y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
          node.style.opacity = opacity.toFixed(3);
          node.style.filter = safeBlur > 0 ? `blur(${(safeBlur * 0.3 * spread).toFixed(2)}px)` : 'none';
        });

        if (!alive) burst.nodes.forEach((node: any) => node.remove());
        return alive;
      });
    };

    const renderFrame = (now: number) => {
      frame = 0;

      const dt = state.lastTime ? echoClamp(now - state.lastTime, 0, 64) : 16.67;
      const step = dt / 16.67;
      state.lastTime = now;

      const elapsed = now - state.startTime;
      const entranceProgress = entranceEnabled && safeDuration > 0 ? echoClamp(elapsed / safeDuration, 0, 1) : 1;
      const entranceRest = entranceEnabled ? 1 - easeFn(entranceProgress) : 0;
      const targetVelocity = Math.hypot(state.targetX - state.lastTargetX, state.targetY - state.lastTargetY);

      state.lastTargetX = state.targetX;
      state.lastTargetY = state.targetY;

      if (drifting) {
        const away = !following || !state.pointerNear || now - state.pointerTime > ECHO_DRIFT_IDLE;
        state.drift += ((away ? 1 : 0) - state.drift) * (1 - Math.pow(0.965, step));
        state.phase += (dt / ECHO_DRIFT_PERIOD) * Math.PI * 2;
      }

      if (scrolling) {
        const blend = 1 - Math.pow(0.7, step);
        state.velocityX += (state.pushX / Math.max(step, 0.25) - state.velocityX) * blend;
        state.velocityY += (state.pushY / Math.max(step, 0.25) - state.velocityY) * blend;
        state.pushX = 0;
        state.pushY = 0;
      }

      const speed = Math.hypot(state.velocityX, state.velocityY);
      const shiftX = echoClamp(-state.velocityX * 3.2, -shiftLimit, shiftLimit);
      const shiftY = echoClamp(-state.velocityY * 3.2, -shiftLimit, shiftLimit);
      const followX = state.targetX * (1 - state.drift);
      const followY = state.targetY * (1 - state.drift);

      let maxSeparation = 0;
      let maxGap = 0;

      for (let index = 0; index <= echoCount; index += 1) {
        const copy = copyRefs.current[index];
        const current = state.positions[index];
        const bend = state.bends[index];
        if (!copy || !current || !bend) continue;

        const depth = echoCount ? index / echoCount : 0;
        const entranceAmount = entranceRest * safeOffset * (index + 0.35);
        let desiredX = followX + vector.x * entranceAmount;
        let desiredY = followY + vector.y * entranceAmount;

        if (state.drift > 0.0005) {
          const phase = state.phase - index * driftSpacing;
          const swing = safeOffset * state.drift * (0.25 + 0.75 * depth);
          desiredX += Math.sin(phase) * swing;
          desiredY += Math.sin(phase) * Math.cos(phase) * swing * 1.3;
        }

        const lerp = 1 - Math.pow(1 - echoClamp(0.34 / (1 + index * safeLag * 4.2), 0.018, 0.36), step);
        const bendLerp = 1 - Math.pow(1 - 0.3 / (1 + depth * (1 + safeLag * 8)), step);

        current.x += (desiredX - current.x) * lerp;
        current.y += (desiredY - current.y) * lerp;
        bend.x += (shiftX * depth - bend.x) * bendLerp;
        bend.y += (shiftY * depth - bend.y) * bendLerp;
        maxGap = Math.max(
          maxGap,
          Math.abs(desiredX - current.x),
          Math.abs(desiredY - current.y),
          Math.abs(shiftX * depth - bend.x),
          Math.abs(shiftY * depth - bend.y)
        );

        const x = current.x + bend.x;
        const y = current.y + bend.y;
        const scale = 1 + (safeScale - 1) * depth;
        copy.style.transform = `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) scale(${scale.toFixed(4)})`;

        if (index > 0) {
          const front = state.positions[0];
          maxSeparation = Math.max(maxSeparation, Math.hypot(x - front.x, y - front.y));
        }
      }

      const separationActivity = safeOffset > 0 ? echoClamp(maxSeparation / (safeOffset * 2.25), 0, 1) : 0;
      const targetActivity = safeOffset > 0 ? echoClamp(targetVelocity / (safeOffset * 0.35), 0, 1) : 0;
      const nextActivity = Math.max(
        entranceRest,
        separationActivity,
        targetActivity,
        state.drift * 0.9,
        echoClamp(speed / 5, 0, 1)
      );
      state.activity += (nextActivity - state.activity) * (1 - Math.pow(0.82, step));

      renderBursts(now);

      const running =
        entranceProgress < 1 ||
        state.activity > 0.002 ||
        maxGap > 0.05 ||
        speed > 0.02 ||
        state.bursts.length > 0 ||
        (drifting && state.visible);
      if (!running) state.activity = 0;

      for (let index = 1; index <= echoCount; index += 1) {
        const copy = copyRefs.current[index];
        if (copy) copy.style.opacity = String(Math.pow(safeFade, index) * state.activity);
      }

      if (running) frame = requestAnimationFrame(renderFrame);
    };

    const wake = () => {
      if (!frame) {
        state.lastTime = 0;
        frame = requestAnimationFrame(renderFrame);
      }
    };

    const handlePointerMove = (event: any) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const deltaX = event.clientX - (rect.left + rect.width / 2);
      const deltaY = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(deltaX, deltaY);
      const reach = distance > 0 ? echoClamp(distance / safeCursorRadius, 0, 1) : 0;
      const dirX = distance > 0 ? deltaX / distance : 0;
      const dirY = distance > 0 ? deltaY / distance : 0;

      state.targetX = dirX * reach * safeOffset;
      state.targetY = dirY * reach * safeOffset * 0.72;
      state.pointerNear = distance <= safeCursorRadius;
      state.pointerTime = performance.now();
      wake();
    };

    const handlePointerOut = (event: any) => {
      if (event.relatedTarget) return;
      state.targetX = 0;
      state.targetY = 0;
      state.pointerNear = false;
      wake();
    };

    const scrollMemory = new WeakMap();

    const handleScroll = (event: any) => {
      const target = event.target;
      if (!(target instanceof Document) && !(target instanceof Element && target.contains(root))) return;

      const [x, y] = echoReadScroll(target);
      const last = scrollMemory.get(target);
      scrollMemory.set(target, [x, y]);
      if (!last) return;

      state.pushX -= x - last[0];
      state.pushY -= y - last[1];
      wake();
    };

    const handleClick = (event: any) => {
      const layer = burstRef.current;
      const rect = root.getBoundingClientRect();
      if (!layer || !echoCount || !rect.width || !rect.height) return;

      const originX = echoClamp((event.clientX - rect.left) / rect.width, 0, 1) * 100;
      const originY = echoClamp((event.clientY - rect.top) / rect.height, 0, 1) * 100;
      const count = echoClamp(Math.round(echoCount / 3) + 2, 3, 6);
      const front = state.positions[0];
      const nodes: any[] = [];

      for (let index = 0; index < count; index += 1) {
        const source = copyRefs.current[1 + Math.round((index / Math.max(1, count - 1)) * (echoCount - 1))];
        if (!source) continue;
        const node = source.cloneNode(true);
        node.removeAttribute('data-echo-index');
        node.style.transformOrigin = `${originX.toFixed(1)}% ${originY.toFixed(1)}%`;
        node.style.opacity = '0';
        layer.appendChild(node);
        nodes.push(node);
      }

      state.bursts.push({ start: performance.now(), x: front?.x || 0, y: front?.y || 0, nodes });
      while (state.bursts.length > 4) state.bursts.shift().nodes.forEach((node: any) => node.remove());
      wake();
    };

    if (following) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerout', handlePointerOut);
    }

    if (scrolling) {
      scrollMemory.set(document, echoReadScroll(document));
      for (let node = root.parentElement; node; node = node.parentElement) scrollMemory.set(node, echoReadScroll(node));
      document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    }

    if (clickBurst) root.addEventListener('click', handleClick);

    let observer: any;
    if (drifting && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(entries => {
        state.visible = entries[entries.length - 1].isIntersecting;
        if (state.visible) wake();
      });
      observer.observe(root);
    }

    renderFrame(state.startTime);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('scroll', handleScroll, { capture: true } as any);
      root.removeEventListener('click', handleClick);
      observer?.disconnect();
      state.bursts.forEach((burst: any) => burst.nodes.forEach((node: any) => node.remove()));
    };
  }, [
    blur,
    clickBurst,
    cursorRadius,
    direction,
    duration,
    ease,
    echoCount,
    echoScale,
    fade,
    lag,
    mode,
    offset,
    prefersReducedMotion,
    trail
  ]);

  const rootStyle = {
    fontSize,
    fontWeight,
    color,
    cursor: canBurst ? 'pointer' : undefined,
    ...style
  };

  const echoClassName = echoStyle === 'outline' ? 'aci-echo-text__echo aci-echo-text__echo--outline' : 'aci-echo-text__echo';

  return (
    <span ref={rootRef} className={`aci-echo-text ${className}`.trim()} style={rootStyle}>
      <style>{ECHO_CSS}</style>
      {echoIndexes.map(index => (
        <span
          aria-hidden="true"
          className={echoClassName}
          data-echo-index={index}
          key={`echo-${index}`}
          ref={element => {
            copyRefs.current[index] = element;
          }}
          style={{ color: echoColor(index), opacity: 0 }}
        >
          {text}
        </span>
      ))}
      <span aria-hidden="true" className="aci-echo-text__bursts" ref={burstRef} />
      <span
        className="aci-echo-text__echo aci-echo-text__echo--front"
        data-echo-index="0"
        ref={element => {
          copyRefs.current[0] = element;
        }}
      >
        {text}
      </span>
    </span>
  );
};
/* eslint-enable */

// ── Demo time ────────────────────────────────────────────────────────────────

/**
 * The cue for a live demo: a reveal of its own on a workflow page. While it is the latest reveal
 * the page's content blurs back and "Demo Time!" rises in (Echo Text, its "Wake" preset, in
 * inovex green into Leuchtblau); the next `→` clears it as the following content arrives.
 * The text remounts on every showing, so the entrance plays each time, also when stepping back.
 * While it shows, the lights go up (`demoLights`) and the letters shine under the beams like the
 * colour mark does (`DemoGloss`). When it clears, the loop after it (`aci-after-demo`) waits
 * `DEMO_DIM_MS` (`--wait`, see LOOP_CSS) for the lights to dim back before it arrives; so does the
 * dimming of the loop before. (`:has()` does not nest, hence the class rather than a selector.)
 */
const DEMO_CSS = `
.aci-loops:has(> [data-osd-step='revealed'] > .aci-after-demo) { --wait: ${DEMO_DIM_MS}ms; }
.aci-loops > [data-osd-step]:has(> .aci-demo, > .aci-who-intro) { display: contents; }
.aci-demo { opacity: 0; transition: opacity 350ms ease-out; pointer-events: none; }
.aci-demo.aci-demo-on { opacity: 1; transition-duration: 500ms; }
.aci-page :is(.aci-head, .aci-handoff) { transition: filter 500ms ease-out; }
.aci-page:has(.aci-demo-on) :is(.aci-head, .aci-loop, .aci-key, .aci-handoff) { filter: blur(14px) brightness(0.55); }
@media (prefers-reduced-motion: reduce) {
  .aci-demo, .aci-page :is(.aci-head, .aci-loop, .aci-key, .aci-handoff) { transition: none !important; }
}
`;

/**
 * The gloss on "Demo Time!": the mark's gloss (see `Gloss`), cut to the front letters instead of
 * masked to the mark. The letters are drawn into the canvas where the DOM has them, every frame,
 * so the shine follows them while they rise in.
 */
const DemoGloss = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current;
    const front = canvas?.parentElement?.querySelector<HTMLElement>('.aci-echo-text__echo--front');
    if (!canvas || !front) return;
    const clip = (g2: CanvasRenderingContext2D) => {
      const box = canvas.getBoundingClientRect();
      const at = front.getBoundingClientRect();
      const k = (canvas.width / box.width) * (at.width / front.offsetWidth); // canvas px per CSS px
      const css = getComputedStyle(front);
      const size = parseFloat(css.fontSize);
      const lineHeight = css.lineHeight.endsWith('px') ? parseFloat(css.lineHeight) : parseFloat(css.lineHeight) * size;
      g2.font = `${css.fontWeight} ${size * k}px ${css.fontFamily}`;
      g2.letterSpacing = `${(parseFloat(css.letterSpacing) || 0) * k}px`;
      g2.fontKerning = 'normal';
      const text = front.textContent ?? '';
      const m = g2.measureText(text);
      // the baseline where CSS puts it: half the leading, then the font's ascent
      const baseline = (lineHeight * k - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent;
      // twice the light: the green is near full brightness already, so a colour-dodge of the
      // beams alone barely shows on it (the mark's darker colours take it more readily)
      g2.globalCompositeOperation = 'lighter';
      g2.drawImage(canvas, 0, 0);
      g2.globalCompositeOperation = 'destination-in';
      g2.fillStyle = '#fff';
      g2.fillText(text, (at.left - box.left) * (canvas.width / box.width), (at.top - box.top) * (canvas.height / box.height) + baseline);
      g2.globalCompositeOperation = 'source-over';
    };
    const target = { canvas, clip };
    raysShared.glosses.add(target);
    return () => {
      raysShared.glosses.delete(target);
    };
  }, []);
  if (!hasWebgl2()) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'absolute', left: -40, top: -60, width: 'calc(100% + 80px)', height: 'calc(100% + 120px)', zIndex: 3, pointerEvents: 'none', mixBlendMode: 'color-dodge' }}
    />
  );
};

const DemoTime = () => {
  const active = useIsActivePage();
  const ref = useRef<HTMLDivElement | null>(null);
  const [showing, setShowing] = useState(0); // 0: not current; otherwise a key per showing
  useEffect(() => {
    const own = ref.current?.closest('[data-osd-step]');
    const parent = own?.parentElement;
    if (!active || !own || !parent) return;
    const check = () => {
      const revealed = parent.querySelectorAll(":scope > [data-osd-step='revealed']");
      const current = revealed.length > 0 && revealed[revealed.length - 1] === own;
      setShowing((n) => (current ? (n > 0 ? n : -n + 1) : n > 0 ? -n : n));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(parent, { subtree: true, attributes: true, attributeFilter: ['data-osd-step'] });
    return () => observer.disconnect();
  }, [active]);
  const on = active && showing > 0;
  useEffect(() => {
    if (!on) return;
    setDemoLights(true);
    return () => setDemoLights(false);
  }, [on]);
  return (
    <div
      ref={ref}
      className={`aci-demo${on ? ' aci-demo-on' : ''}`}
      style={{ position: 'absolute', inset: `-${CONTENT_TOP}px -${PAD}px -${PAD}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
    >
      {on ? (
        <span key={showing} style={{ position: 'relative', display: 'inline-block' }}>
          <EchoText
            text="Demo Time!"
            echoes={16}
            lag={0.3}
            offset={24}
            direction="down"
            fade={0.82}
            blur={5}
            mode="entrance"
            clickBurst={false}
            duration={1200}
            ease="ease-in-out"
            fontSize={200}
            fontWeight={700}
            color={ACCENT}
            echoColors={[ACCENT, `rgb(${LEUCHTBLAU_RGB})`]}
            style={{ fontFamily: SANS }}
          />
          <DemoGloss />
        </span>
      ) : null}
    </div>
  );
};

/** The key to who does a step, centred below the first loop. */
const WhoLegend = () => (
  <div className="aci-key" style={{ position: 'absolute', left: RING_W / 2, bottom: 0, transform: 'translateX(-50%)', display: 'flex', gap: 40 }}>
    <WhoKey who="human" label="human" i={0} />
    <WhoKey who="both" label="together" i={1} />
    <WhoKey who="agent" label="agent" i={2} />
  </div>
);

/**
 * `introduce`: the first time the loops are shown, the who-tabs and the key get a reveal of their
 * own after the first loop, so the steps can be talked through before who does them. Later loop
 * pages show them with the first loop, the audience knows the glyphs by then.
 */
const LoopPage = ({ name, first, handoff, second, introduce, demos = [] }: { name: string; first: ReactNode; handoff: string; second: ReactNode; introduce?: boolean; demos?: ('first' | 'second')[] }) => (
  <Shell>
    <div className="aci-page">
    <style>{LOOP_CSS}</style>
    <style>{DEMO_CSS}</style>
    <div className="aci-head">
      <SkillH name={name} suffix="Workflow" />
    </div>
    <div className="aci-loops" style={{ marginTop: 40, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Steps>
        <Step duration={1}>
          {first}
          {introduce ? null : <WhoLegend />}
        </Step>
        {introduce ? (
          <Step duration={1}>
            <div className="aci-who-intro">
              <WhoLegend />
            </div>
          </Step>
        ) : null}
        {demos.includes('first') ? (
          <Step duration={1}>
            <DemoTime />
          </Step>
        ) : null}
        <Step duration={1}>
          <div className={demos.includes('first') ? 'aci-after-demo' : undefined} style={{ display: 'flex', alignItems: 'flex-start', ['--d' as string]: `${HANDOFF_MS}ms` }}>
            <Handoff label={handoff} />
            {second}
          </div>
        </Step>
        {demos.includes('second') ? (
          <Step duration={1}>
            <DemoTime />
          </Step>
        ) : null}
      </Steps>
    </div>
    </div>
  </Shell>
);

const ReviewMrLoop: Page = () => (
  <LoopPage
    introduce
    demos={['first', 'second']}
    name="review-mr"
    first={
      <Loop
        title="Topic collection"
        steps={[
          { label: 'curate', detail: 'keep · drop · merge', who: 'both' },
          { label: 'draft', detail: 'the comment', who: 'both' },
          { label: 'post', detail: 'on click, as agreed', who: 'human' },
        ]}
      />
    }
    handoff="the author answers"
    second={
      <Loop
        title="Validate responses"
        second
        steps={[
          { label: 'news', detail: 'replies · pushes', who: 'agent' },
          { label: 'judge', detail: 'settled · more · wait', who: 'agent' },
          { label: 'react', detail: 'ack · follow up', who: 'human' },
        ]}
      />
    }
  />
);

const ReworkMrLoop: Page = () => (
  <LoopPage
    demos={['second']}
    name="rework-mr"
    first={
      <Loop
        title="Plan phase"
        steps={[
          { label: 'thread', detail: 'what is asked', who: 'agent' },
          { label: 'propose', detail: 'fix · reply · push back', who: 'both' },
          { label: 'agree', detail: 'the plan, on click', who: 'human' },
        ]}
      />
    }
    handoff="all topics planned"
    second={
      <Loop
        title="Fix phase"
        second
        steps={[
          { label: 'fix', detail: 'built to the plan', who: 'agent' },
          { label: 'review', detail: 'the diff in hunk', who: 'both' },
          { label: 'push', detail: 'and reply, on click', who: 'human' },
        ]}
      />
    }
  />
);

// ── 06 · Under the hood ──────────────────────────────────────────────────────

/** One building block: what it is (mono, as you would type or install it) and what it does. */
const Tile = ({ tag, title, text }: { tag: string; title: string; text: string }) => (
  <div
    className="acr-row"
    style={{
      padding: '36px 44px',
      borderRadius: 'var(--osd-radius)',
      background: 'rgba(45,93,255,0.14)',
      border: '2px solid rgba(120,150,255,0.45)',
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 28, color: ACCENT }}>{tag}</div>
    <div style={{ fontSize: 40, fontWeight: 700, marginTop: 14, lineHeight: 1.25 }}>{title}</div>
    <div style={{ fontSize: 30, color: MUTED, marginTop: 10, lineHeight: 1.4 }}>{text}</div>
  </div>
);

/** The tiles one per press on the page itself; all at once on its transit copy. */
const TechBody = ({ stepped, mark }: { stepped: boolean; mark: MarkMode }) => {
  const tiles = [
    <Tile key="skill" tag="SKILL.md + scripts/" title="Workflow in prose, state in Python" text="glab for GitLab, per-MR state survives sessions" />,
    <Tile key="mod" tag="review-ui mod" title="Cards, buttons, sidebar" text="a press runs the script directly, no model turn" />,
    <Tile key="hunk" tag="hunk + tmux" title="Diffs in a real diff viewer" text="line notes go back to the agent" />,
    <Tile key="press" tag="one-time press token" title="Only humans post, push, resolve" text="the mod blocks the model's own attempts" />,
  ];
  return (
    <Shell mark={mark}>
      <div>
        <RevealStyles />
        <H>Under the hood</H>
        <div
          className="acr-reveal"
          style={{
            marginTop: 64,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
          }}
        >
          {stepped ? (
            <Steps>
              <Step duration={320}>{tiles[0]}</Step>
              <Step duration={320}>{tiles[1]}</Step>
              <Step duration={320}>{tiles[2]}</Step>
              <Step duration={320}>{tiles[3]}</Step>
            </Steps>
          ) : (
            tiles
          )}
        </div>
      </div>
    </Shell>
  );
};

const Tech: Page = () => <TechBody stepped mark="faint" />;

/** Transit, like `TitleSettled`: the watermark fades out here, then the close follows. */
const TechSettled: Page = () => {
  useTransit('faint', 700);
  return <TechBody stepped={false} mark="none" />;
};

// ── 07 · Outro ───────────────────────────────────────────────────────────────

/** A contact line; a link, which the deck's click-to-advance leaves alone. */
const Contact = ({ icon, href, children }: { icon: string; href: string; children: ReactNode }) => (
  <a
    href={href}
    target={href.startsWith('http') ? '_blank' : undefined}
    rel="noreferrer"
    style={{ display: 'flex', alignItems: 'center', gap: 26, textDecoration: 'none', color: 'inherit' }}
  >
    <Icon src={icon} height={40} color={MUTED} />
    <span style={{ fontFamily: MONO, fontSize: 40, lineHeight: 1.3, color: 'var(--osd-text)' }}>
      {children}
    </span>
  </a>
);

/**
 * The close arrives on an empty canvas (the watermark just faded out on the transit page). The
 * block fades in, and the two contact lines decrypt left to
 * right as it does: a short run of random glyphs runs ahead of the settled text. Mono only, so
 * no line changes width while it scrambles; the unrevealed rest is held in place, invisible.
 * Only when arrived at from that transit page; thumbnails and jumps show it settled.
 */
const OUTRO_CSS = `
@keyframes aci-outro-in { from { opacity: 0; } to { opacity: 1; } }
.aci-outro-in { animation: aci-outro-in 900ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .aci-outro-in { animation: none; } }
`;

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/<>{}[]#$%&*+=';
const SCRAMBLE_RUN = 5;
const CHAR_MS = 34;

type Seg = { text: string; accent?: boolean; dim?: boolean };

/**
 * One line that decrypts left to right: on arrival (after `delay`), and again whenever the
 * pointer enters it, as React Bits' Decrypted Text does on hover.
 */
const DecryptLine = ({ segs, delay, live }: { segs: Seg[]; delay: number; live: boolean }) => {
  const total = segs.reduce((n, seg) => n + seg.text.length, 0);
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = useState(live && !reduce ? -SCRAMBLE_RUN : total + SCRAMBLE_RUN);
  const [, setTick] = useState(0);
  const raf = useRef(0);
  const mode = useRef<'arrive' | 'hover'>('arrive');
  const play = (wait: number, how: 'arrive' | 'hover') => {
    if (reduce) return;
    mode.current = how;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now() + wait;
    const step = (now: number) => {
      const n = Math.floor((now - t0) / CHAR_MS);
      setShown(n);
      setTick((k) => k + 1);
      if (n < total + SCRAMBLE_RUN) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => {
    if (live) play(delay, 'arrive');
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);
  const settled = shown >= total + SCRAMBLE_RUN;
  let at = 0;
  return (
    <span onMouseEnter={() => settled && play(0, 'hover')}>
      {segs.map((seg, k) => {
        const chars = Array.from(seg.text).map((ch, i) => {
          const pos = at + i;
          if (pos < shown) return <span key={i}>{ch}</span>;
          if (pos < shown + SCRAMBLE_RUN && pos >= 0 && ch !== ' ')
            return <span key={i} style={{ color: ACCENT, opacity: 0.85 }}>{SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]}</span>;
          // On hover the line is re-scrambled rather than blanked: the not-yet-settled part shows
          // random glyphs, as the original does.
          if (mode.current === 'hover' && ch !== ' ')
            return <span key={i} style={{ color: MUTED }}>{SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]}</span>;
          return <span key={i} style={{ visibility: 'hidden' }}>{ch}</span>;
        });
        at += seg.text.length;
        return (
          <span key={k} style={seg.accent ? { color: 'var(--osd-accent)' } : seg.dim ? { color: DIM } : undefined}>
            {chars}
          </span>
        );
      })}
    </span>
  );
};

const Outro: Page = () => {
  const active = useIsActivePage();
  const [arriving] = useState(() => active && shownMode === 'none');
  return (
  <Shell mark="none" center bright>
    <style>{OUTRO_CSS}</style>
    <div
      className={arriving ? 'aci-outro-in' : undefined}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
    >
      <H>Agentic Code Reviews</H>
      <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 36, lineHeight: 1.2, letterSpacing: '0.02em' }}>
        <Hat>/</Hat>review-mr<span style={{ color: DIM, margin: '0 18px' }}>&amp;&amp;</span>
        <Hat>/</Hat>rework-mr
      </div>

      <div
        style={{
          marginTop: 112,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 100,
        }}
      >
            <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
              <img
                src={goomba}
                alt=""
                style={{ width: 160, height: 160, borderRadius: 18, flexShrink: 0 }}
              />
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 26, textAlign: 'left' }}
              >
                <Contact icon={iconGithub} href="https://github.com/yogan/agent-skills">
                  <DecryptLine live={arriving} delay={300} segs={[{ text: 'github.com/yogan/' }, { text: 'agent-skills', accent: true }]} />
                </Contact>
                <Contact icon={iconMail} href="mailto:frank.blendinger@inovex.de">
                  <DecryptLine
                    live={arriving}
                    delay={600}
                    segs={[{ text: 'frank.blendinger' }, { text: '@', accent: true }, { text: 'inovex.de' }]}
                  />
                </Contact>
              </div>
            </div>
            <img src={inovexLogo} alt="inovex" style={{ height: 56, display: 'block' }} />
      </div>
    </div>
  </Shell>
  );
};

// 01 Title
const TITLE_NOTES =
  [
    'Show of hands:',
    '• Who is using AI?',
    '• Who does more code review than actual coding now?',
    '• Who is doing reviews with AI support?',
    '• Who uses dedicated tooling for reviews?',
  ].join('\n');

export const notes: (string | undefined)[] = [
  // 00 / 01 Title — two candidates, same notes
  TITLE_NOTES,
  TITLE_NOTES, // the same title, logo settled
  // 02 review-mr
  [
    '• Start /review-mr !1 — explainer, overview, curate, own comment in GitLab UI → sync',
    '• Then /review-mr !2 — follow-up: replies, pushes, diff t1, ack',
  ].join('\n'),
  // review-mr workflow
  [
    '• Topic collection: each topic curated (keep / drop / merge), drafted, posted by you',
    '• → who does what: ✦ agent, person = you, both = together',
    '• → DEMO 1: /review-mr !1 (clean MR)',
    '• Author answers or pushes → validate the responses, round by round',
    '• News is judged before you get to it: settled · more · wait — you ack or follow up',
    '• → DEMO 2: /review-mr !2 (validate the author\'s responses)',
  ].join('\n'),
  // rework-mr
  [
    '• Hat switch — /rework-mr !3',
    '• t1 trivial, t2 the real cache bug, t3 scope creep → decline',
    '• Fix opens in hunk — annotate a line, then push',
  ].join('\n'),
  // rework-mr workflow
  [
    '• Plan phase: every open thread gets a proposal — fix, reply or push back — you agree',
    '• No code until every topic has a plan',
    '• Fix phase: one topic at a time — checks, diff in hunk, push, reply in the thread',
    '• → DEMO 3: /rework-mr !3 (my own MR, with review comments)',
  ].join('\n'),
  // 06 under the hood
  [
    '• Skills = SKILL.md (the workflow) + Python scripts (glab, per-MR state in ~/.claude)',
    '• review-ui mod: views as cards; most buttons run the script with no model turn',
    '• Without the mod (OpenCode): a Stop hook makes the model paste views verbatim',
    '• hunk in a tmux window: notes on diff lines go back to the agent',
    '• Post/push/resolve need a secret drawn per press — guards against accidents, not a wall',
  ].join('\n'),
  undefined, // under the hood, watermark fading — passes by itself
  // 07 outro
  ['• Questions'].join('\n'),
];

export const meta: SlideMeta = {
  title: 'Agentic Code Reviews · inovex Meetup Erlangen 2026',
  createdAt: '2026-11-25T09:11:58Z',
};

export default [Title, TitleSettled, ReviewMr, ReviewMrLoop, ReworkMr, ReworkMrLoop, Tech, TechSettled, Outro] satisfies Page[];
