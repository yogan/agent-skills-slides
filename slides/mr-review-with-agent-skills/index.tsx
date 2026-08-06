import type { ReactNode } from 'react';
import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import gitlabLogo from '@assets/gitlab.svg';
import dockerLogo from '@assets/docker.svg';
import claudeLogo from '@assets/claude.svg';

export const design: DesignSystem = {
  // accent = "sunset gold". Warmer than the amber this deck started with (hue 40° → 35°),
  // which pulls it into the same family as the sunset bloom at the bottom of the canvas
  // and reads as the sun in the synthwave scene rather than as a warning yellow.
  palette: { bg: '#0A0716', text: '#E8EDF2', accent: '#FFAE3D' },
  fonts: {
    display: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    body: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  typeScale: { hero: 132, body: 36 },
  radius: 10,
};

// ── Palette ──────────────────────────────────────────────────────────────────
// Single source of truth. `design.palette` above drives the `var(--osd-*)` CSS
// variables (and the dev UI's Design panel); these re-export the same values for
// the places a CSS variable cannot reach — SVG attributes and JS conditionals.
// Never hardcode a hex below this block: change the palette here and everything,
// including the background art, follows.
//
// The full token set is documented in `themes/synthwave-terminal.md`, which is what
// future slides should be built from.
const BG = design.palette.bg;
const ACCENT = design.palette.accent;

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
const BODY = '#C9D5E1'; // secondary body copy, table cells
const MUTED = '#98A6BC'; // supporting copy, sub-headings
const DIM = '#6E7C95'; // furniture only — footer, footnotes. Never load-bearing.
const LINE = '#241C3C'; // hairlines, panel borders
const PANEL = '#130E24'; // code/callout panel fill

// Synthwave neon — background only, never text, so everything *readable* still
// answers to exactly one accent. Kept as bare `r,g,b` triplets because the blooms
// need them at several alphas; `NEON_*` are the solid forms for SVG strokes.
const NEON_PINK_RGB = '255,45,170';
const NEON_CYAN_RGB = '0,217,255';
const NEON_VIOLET_RGB = '120,60,255';
const NEON_SUNSET_RGB = '255,140,60'; // the horizon glow the accent is tuned against
const NEON_PINK = `rgb(${NEON_PINK_RGB})`;
const NEON_CYAN = `rgb(${NEON_CYAN_RGB})`;

// Semantic colours that are not part of the theme: these mirror what the actual
// tools emit, so they stay fixed even if the accent changes.
const SEV_CRITICAL = '#FF6B6B';
const CODE_TEXT = '#B9C6D4';
const CODE_LITERAL = '#7EE787';

/**
 * Starfield for the sky above the floor grid — 64 hand-placed points, so it renders
 * identically every time. Density is biased upward and thins out before y≈790 where
 * the grid takes over; anything landing in the text band is dimmed to ~55 % so it
 * stays scenery. Nothing here is above 2.2px or 0.62 alpha.
 *
 * To re-scatter: change the positions. They are plain background layers, not nodes,
 * so there is no DOM cost to the count.
 */
const STARS = [
  'radial-gradient(2.2px 2.2px at 944px 215px, rgba(255,255,255,0.32), transparent)',
  'radial-gradient(1.7px 1.7px at 766px 88px, rgba(255,255,255,0.33), transparent)',
  'radial-gradient(1.3px 1.3px at 1807px 100px, rgba(255,190,235,0.44), transparent)',
  'radial-gradient(1.1px 1.1px at 682px 265px, rgba(255,255,255,0.16), transparent)',
  'radial-gradient(1.2px 1.2px at 1403px 113px, rgba(255,255,255,0.60), transparent)',
  'radial-gradient(1.1px 1.1px at 16px 262px, rgba(255,255,255,0.32), transparent)',
  'radial-gradient(1.6px 1.6px at 126px 190px, rgba(255,190,235,0.17), transparent)',
  'radial-gradient(1.2px 1.2px at 681px 208px, rgba(255,255,255,0.15), transparent)',
  'radial-gradient(1.0px 1.0px at 437px 569px, rgba(255,255,255,0.21), transparent)',
  'radial-gradient(1.5px 1.5px at 997px 43px, rgba(190,220,255,0.58), transparent)',
  'radial-gradient(2.0px 2.0px at 1181px 136px, rgba(255,255,255,0.48), transparent)',
  'radial-gradient(1.6px 1.6px at 1804px 40px, rgba(255,255,255,0.54), transparent)',
  'radial-gradient(2.1px 2.1px at 1202px 88px, rgba(255,255,255,0.47), transparent)',
  'radial-gradient(2.2px 2.2px at 390px 215px, rgba(255,255,255,0.15), transparent)',
  'radial-gradient(1.7px 1.7px at 1499px 397px, rgba(255,255,255,0.12), transparent)',
  'radial-gradient(1.6px 1.6px at 1540px 454px, rgba(190,220,255,0.24), transparent)',
  'radial-gradient(1.3px 1.3px at 78px 529px, rgba(255,255,255,0.26), transparent)',
  'radial-gradient(1.3px 1.3px at 449px 567px, rgba(255,190,235,0.34), transparent)',
  'radial-gradient(1.6px 1.6px at 1377px 448px, rgba(255,255,255,0.19), transparent)',
  'radial-gradient(1.1px 1.1px at 1157px 273px, rgba(255,255,255,0.20), transparent)',
  'radial-gradient(1.4px 1.4px at 1208px 522px, rgba(190,220,255,0.16), transparent)',
  'radial-gradient(1.3px 1.3px at 143px 396px, rgba(255,255,255,0.29), transparent)',
  'radial-gradient(1.1px 1.1px at 866px 98px, rgba(190,220,255,0.26), transparent)',
  'radial-gradient(1.1px 1.1px at 1003px 403px, rgba(255,255,255,0.16), transparent)',
  'radial-gradient(1.5px 1.5px at 28px 561px, rgba(255,255,255,0.57), transparent)',
  'radial-gradient(1.5px 1.5px at 267px 307px, rgba(255,255,255,0.14), transparent)',
  'radial-gradient(1.5px 1.5px at 1626px 587px, rgba(255,190,235,0.59), transparent)',
  'radial-gradient(1.2px 1.2px at 1325px 426px, rgba(255,255,255,0.15), transparent)',
  'radial-gradient(1.4px 1.4px at 91px 379px, rgba(255,255,255,0.28), transparent)',
  'radial-gradient(1.6px 1.6px at 1158px 78px, rgba(190,220,255,0.50), transparent)',
  'radial-gradient(1.6px 1.6px at 1698px 105px, rgba(255,190,235,0.24), transparent)',
  'radial-gradient(1.7px 1.7px at 1072px 236px, rgba(190,220,255,0.32), transparent)',
  'radial-gradient(1.7px 1.7px at 780px 191px, rgba(255,255,255,0.29), transparent)',
  'radial-gradient(2.1px 2.1px at 253px 533px, rgba(255,190,235,0.24), transparent)',
  'radial-gradient(1.4px 1.4px at 1281px 49px, rgba(255,190,235,0.38), transparent)',
  'radial-gradient(1.1px 1.1px at 782px 87px, rgba(255,255,255,0.27), transparent)',
  'radial-gradient(2.0px 2.0px at 1339px 66px, rgba(255,190,235,0.54), transparent)',
  'radial-gradient(1.5px 1.5px at 1189px 237px, rgba(190,220,255,0.18), transparent)',
  'radial-gradient(1.3px 1.3px at 840px 218px, rgba(255,255,255,0.24), transparent)',
  'radial-gradient(1.5px 1.5px at 1059px 361px, rgba(255,255,255,0.30), transparent)',
  'radial-gradient(1.1px 1.1px at 1683px 263px, rgba(255,190,235,0.58), transparent)',
  'radial-gradient(1.6px 1.6px at 1804px 101px, rgba(255,190,235,0.48), transparent)',
  'radial-gradient(1.0px 1.0px at 1511px 335px, rgba(255,255,255,0.16), transparent)',
  'radial-gradient(1.2px 1.2px at 1145px 617px, rgba(255,255,255,0.24), transparent)',
  'radial-gradient(1.1px 1.1px at 558px 627px, rgba(255,255,255,0.26), transparent)',
  'radial-gradient(1.1px 1.1px at 1035px 412px, rgba(255,255,255,0.31), transparent)',
  'radial-gradient(1.6px 1.6px at 486px 314px, rgba(255,190,235,0.17), transparent)',
  'radial-gradient(1.1px 1.1px at 701px 311px, rgba(255,255,255,0.33), transparent)',
  'radial-gradient(1.2px 1.2px at 752px 40px, rgba(255,255,255,0.48), transparent)',
  'radial-gradient(2.1px 2.1px at 1014px 127px, rgba(255,255,255,0.24), transparent)',
  'radial-gradient(1.6px 1.6px at 1642px 216px, rgba(255,255,255,0.56), transparent)',
  'radial-gradient(1.6px 1.6px at 671px 212px, rgba(255,255,255,0.12), transparent)',
  'radial-gradient(1.2px 1.2px at 1782px 331px, rgba(255,255,255,0.47), transparent)',
  'radial-gradient(1.5px 1.5px at 137px 472px, rgba(255,190,235,0.22), transparent)',
  'radial-gradient(1.1px 1.1px at 1533px 637px, rgba(255,255,255,0.20), transparent)',
  'radial-gradient(2.1px 2.1px at 224px 74px, rgba(255,255,255,0.41), transparent)',
  'radial-gradient(1.3px 1.3px at 1124px 634px, rgba(255,255,255,0.15), transparent)',
  'radial-gradient(1.6px 1.6px at 902px 49px, rgba(255,190,235,0.27), transparent)',
  'radial-gradient(1.7px 1.7px at 1869px 415px, rgba(255,255,255,0.53), transparent)',
  'radial-gradient(1.6px 1.6px at 1656px 12px, rgba(190,220,255,0.30), transparent)',
  'radial-gradient(1.3px 1.3px at 1834px 286px, rgba(255,190,235,0.44), transparent)',
  'radial-gradient(1.3px 1.3px at 410px 241px, rgba(255,190,235,0.15), transparent)',
  'radial-gradient(1.5px 1.5px at 1708px 106px, rgba(190,220,255,0.40), transparent)',
  'radial-gradient(1.6px 1.6px at 635px 511px, rgba(255,255,255,0.21), transparent)',
];

// Layered, topmost first. Stars sit above the nebula blooms so they stay crisp; the
// neon lives in the corners and along the bottom horizon, and the middle of the
// canvas — where the text sits — stays close to the flat base colour, which is what
// keeps contrast intact on a washed-out projector.
const TEXTURE = [
  ...STARS,
  `radial-gradient(1250px 800px at 86% -8%, rgba(${NEON_PINK_RGB},0.16), transparent 60%)`,
  `radial-gradient(1050px 720px at -4% 104%, rgba(${NEON_CYAN_RGB},0.13), transparent 60%)`,
  `radial-gradient(1500px 460px at 50% 112%, rgba(${NEON_SUNSET_RGB},0.13), transparent 68%)`,
  `radial-gradient(900px 620px at 12% -10%, rgba(${NEON_VIOLET_RGB},0.10), transparent 62%)`,
  // CRT scanlines. 6px period, not 3-4px: a tighter pitch moirés against projector
  // pixels. Delete this one line if it shimmers on the venue hardware.
  'repeating-linear-gradient(to bottom, rgba(0,0,0,0.13) 0 1px, transparent 1px 6px)',
].join(', ');

const PAD = 120;

/**
 * The synthwave perspective grid along the bottom edge, plus its horizon glow.
 * Vanishing point (960, 820); rows spaced quadratically so they bunch toward the
 * horizon. Sits behind everything and is masked to fade upward, so the footer and
 * the lowest line of a dense page still read cleanly over it.
 */
const Horizon = () => (
  <svg
    viewBox="0 0 1920 1080"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    aria-hidden="true"
  >
    <defs>
      {/* userSpaceOnUse, not the default objectBoundingBox: a horizontal line has a
          zero-height bbox, which collapses a vertical gradient to nothing. */}
      <linearGradient id="acr-depth" gradientUnits="userSpaceOnUse" x1="0" y1="820" x2="0" y2="1080">
        <stop offset="0%" stopColor={NEON_PINK} stopOpacity="0.05" />
        <stop offset="35%" stopColor={NEON_PINK} stopOpacity="0.30" />
        <stop offset="100%" stopColor={NEON_CYAN} stopOpacity="0.42" />
      </linearGradient>
      {/* Falloff for the whole grid, anchored at the bottom centre. Because the units
          are the grid box's own (1920 × 260), the circle stretches into a wide ellipse,
          which fades the left and right edges and the far end in one pass — and the far
          corners, being furthest from the anchor, drop out almost entirely. */}
      <radialGradient id="acr-falloff" cx="0.5" cy="1" r="1.2">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
        <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.92" />
        <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.48" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <mask id="acr-grid-mask" maskUnits="userSpaceOnUse" x="0" y="820" width="1920" height="260">
        <rect x="0" y="820" width="1920" height="260" fill="url(#acr-falloff)" />
      </mask>
      {/* Front-edge shadow. The grid is densest exactly where the footer sits, so it
          sinks into darkness there — keeps the marker and page number readable. */}
      <linearGradient id="acr-floor" gradientUnits="userSpaceOnUse" x1="0" y1="950" x2="0" y2="1080">
        <stop offset="0%" stopColor={BG} stopOpacity="0" />
        <stop offset="100%" stopColor={BG} stopOpacity="0.92" />
      </linearGradient>
    </defs>

    <g mask="url(#acr-grid-mask)" stroke="url(#acr-depth)" strokeWidth="2" fill="none">
      {/* Rays to the vanishing point. Spacing widens geometrically outward, and the
          outermost pairs run far off-canvas (±16000) on purpose: near the horizon the
          rays converge hard, so without those the verticals stop short and the grid
          visibly runs out at the left and right of its upper band. */}
      <line x1="960" y1="820" x2="-15040" y2="1080" />
      <line x1="960" y1="820" x2="-9040" y2="1080" />
      <line x1="960" y1="820" x2="-6540" y2="1080" />
      <line x1="960" y1="820" x2="-4540" y2="1080" />
      <line x1="960" y1="820" x2="-3190" y2="1080" />
      <line x1="960" y1="820" x2="-2240" y2="1080" />
      <line x1="960" y1="820" x2="-1540" y2="1080" />
      <line x1="960" y1="820" x2="-990" y2="1080" />
      <line x1="960" y1="820" x2="-540" y2="1080" />
      <line x1="960" y1="820" x2="-160" y2="1080" />
      <line x1="960" y1="820" x2="170" y2="1080" />
      <line x1="960" y1="820" x2="460" y2="1080" />
      <line x1="960" y1="820" x2="720" y2="1080" />
      <line x1="960" y1="820" x2="960" y2="1080" />
      <line x1="960" y1="820" x2="1200" y2="1080" />
      <line x1="960" y1="820" x2="1460" y2="1080" />
      <line x1="960" y1="820" x2="1750" y2="1080" />
      <line x1="960" y1="820" x2="2080" y2="1080" />
      <line x1="960" y1="820" x2="2460" y2="1080" />
      <line x1="960" y1="820" x2="2910" y2="1080" />
      <line x1="960" y1="820" x2="3460" y2="1080" />
      <line x1="960" y1="820" x2="4160" y2="1080" />
      <line x1="960" y1="820" x2="5110" y2="1080" />
      <line x1="960" y1="820" x2="6460" y2="1080" />
      <line x1="960" y1="820" x2="8460" y2="1080" />
      <line x1="960" y1="820" x2="10960" y2="1080" />
      <line x1="960" y1="820" x2="16960" y2="1080" />
      {/* depth rows */}
      <line x1="0" y1="836" x2="1920" y2="836" />
      <line x1="0" y1="857" x2="1920" y2="857" />
      <line x1="0" y1="885" x2="1920" y2="885" />
      <line x1="0" y1="922" x2="1920" y2="922" />
      <line x1="0" y1="966" x2="1920" y2="966" />
      <line x1="0" y1="1019" x2="1920" y2="1019" />
    </g>

    <rect x="0" y="950" width="1920" height="130" fill="url(#acr-floor)" />
  </svg>
);

const Footer = ({ marker }: { marker: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: PAD,
        right: PAD,
        bottom: 52,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: MONO,
        fontSize: 22,
        color: DIM,
        letterSpacing: '0.06em',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 10, height: 10, background: 'var(--osd-accent)' }} />
        {marker}
      </span>
      <span>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

// Content is centred in the band above the footer rather than pinned to the top:
// the pages carry deliberately little text, and top-alignment left 200–350px of
// dead space below the sparser ones. The footer stays absolutely positioned, so
// the slide furniture does not move even though the content block does.
// `marker` omitted → no footer at all (the title page carries no furniture).
const Shell = ({ marker, children }: { marker?: string; children: ReactNode }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundColor: 'var(--osd-bg)',
      backgroundImage: TEXTURE,
      color: 'var(--osd-text)',
      fontFamily: 'var(--osd-font-body)',
      padding: `${PAD}px ${PAD}px 152px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}
  >
    <Horizon />
    {/* Content sits in its own layer above the background art. */}
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
    {marker ? <Footer marker={marker} /> : null}
  </div>
);

const Kicker = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 26,
      lineHeight: 1.2,
      color: 'var(--osd-accent)',
      letterSpacing: '0.24em',
    }}
  >
    {children}
  </div>
);

/** Page heading, sans, heavy. */
const H = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontSize: 76,
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      margin: 0,
    }}
  >
    {children}
  </h2>
);

/** Heading for a skill name — monospace, because that is how you type it. */
const SkillH = ({ name, sub }: { name: string; sub?: string }) => (
  <div>
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
    </h2>
    {sub ? (
      <div style={{ fontSize: 34, lineHeight: 1.2, color: MUTED, marginTop: 16 }}>{sub}</div>
    ) : null}
  </div>
);

const BULLETS = {
  fontSize: 'var(--osd-size-body)',
  lineHeight: 1.5,
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
} as const;

const Panel = ({ children, width }: { children: ReactNode; width?: number }) => (
  <div
    style={{
      background: PANEL,
      border: `1px solid ${LINE}`,
      borderRadius: 'var(--osd-radius)',
      borderLeft: `4px solid var(--osd-accent)`,
      padding: '28px 36px',
      fontFamily: MONO,
      fontSize: 26,
      lineHeight: 1.5,
      width,
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

// ── 01 · Title ───────────────────────────────────────────────────────────────

// Deliberately bare: eyebrow, title, byline. No footer, no page number, nothing else.
const Title: Page = () => (
  <Shell>
    {/* Own eyebrow style rather than <Kicker>: that one is tracked-out uppercase,
        which reads badly on lowercase command names. Colour split matches <SkillH>
        on every other page — accent slash, plain text for the command name. */}
    <div
      style={{
        fontFamily: MONO,
        fontSize: 36,
        lineHeight: 1.2,
        color: 'var(--osd-text)',
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ color: 'var(--osd-accent)' }}>/</span>review-mr
      <span style={{ color: DIM, margin: '0 18px' }}>·</span>
      <span style={{ color: 'var(--osd-accent)' }}>/</span>rework-mr
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 850,
        lineHeight: 1.02,
        letterSpacing: '-0.035em',
        margin: '44px 0 0',
      }}
    >
      Agentic Code Reviews
    </h1>
    <div
      style={{
        marginTop: 56,
        fontFamily: MONO,
        fontSize: 30,
        color: MUTED,
        lineHeight: 1.4,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <div>
        Frank Blendinger
        <span style={{ color: DIM, margin: '0 22px' }}>·</span>
        <span style={{ color: 'var(--osd-accent)' }}>@</span>yogan
      </div>
      <div>
        Open Source Contributors @ ZAM
        <span style={{ color: DIM, margin: '0 22px' }}>·</span>
        2026-08-06
      </div>
    </div>
  </Shell>
);

// ── 02 · review-branch ───────────────────────────────────────────────────────

const ReviewBranch: Page = () => (
  <Shell marker="review-branch">
    <Kicker>LOCAL ONLY · NO GITLAB · THE SEED</Kicker>
    <div style={{ marginTop: 28 }}>
      <SkillH name="review-branch" />
    </div>

    <ul style={{ ...BULLETS, marginTop: 40 }}>
      <li>Every commit since the branch left <code style={{ fontFamily: MONO }}>origin/main</code></li>
      <li>Flat, prioritized, anchored at <code style={{ fontFamily: MONO }}>file:line</code></li>
      <li>Severity-tagged 🔴 critical → 🔵 low</li>
      <li>Critique only. No praise, no summary, no fixes.</li>
    </ul>

    <div style={{ marginTop: 44 }}>
      <Panel width={1180}>
        <div>
          <span>🔴 </span>
          <span style={{ color: SEV_CRITICAL, fontWeight: 700 }}>CRITICAL</span>
          <span style={{ color: DIM }}>{'   '}</span>
          <span style={{ color: 'var(--osd-accent)' }}>src/testing/mocks/server.ts:14</span>
        </div>
        <div style={{ height: 14 }} />
        <div style={{ color: CODE_TEXT }}>
          app.use(cors(&#123; origin: <span style={{ color: CODE_LITERAL }}>&apos;*&apos;</span>,
          credentials: <span style={{ color: CODE_LITERAL }}>true</span> &#125;))
        </div>
        <div style={{ height: 14 }} />
        <div style={{ color: MUTED }}>Wildcard origin together with credentials — the</div>
        <div style={{ color: MUTED }}>browser refuses to send them, so auth silently breaks.</div>
      </Panel>
    </div>
  </Shell>
);

// ── 03 · explain-diff ────────────────────────────────────────────────────────

const RailRow = ({ label, note }: { label: string; note: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 24,
      padding: '18px 0',
      borderBottom: `1px solid ${LINE}`,
    }}
  >
    <span style={{ fontFamily: MONO, fontSize: 28, color: 'var(--osd-accent)', width: 200 }}>
      {label}
    </span>
    <span style={{ fontSize: 28, color: MUTED }}>{note}</span>
  </div>
);

const ExplainDiff: Page = () => (
  <Shell marker="explain-diff">
    <Kicker>TEACHING, NOT CRITIQUE</Kicker>
    <div style={{ marginTop: 28 }}>
      <SkillH name="explain-diff" sub="one change, explained properly" />
    </div>

    <div style={{ marginTop: 48, display: 'flex', gap: 90 }}>
      <ul style={{ ...BULLETS, flex: 1, fontSize: 34 }}>
        <li>One self-contained HTML page, opened in your browser</li>
        <li>Graphviz diagrams, highlighted code, follows OS dark mode</li>
        <li>Target: this branch, a named branch, an MR, one commit</li>
        <li>Zero findings — it explains, it does not judge</li>
      </ul>
      <div style={{ width: 620 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            color: DIM,
            letterSpacing: '0.14em',
            marginBottom: 10,
          }}
        >
          THE PAGE
        </div>
        <RailRow label="Background" note="the system it lands in" />
        <RailRow label="Intuition" note="the essence, with toy data" />
        <RailRow label="Code" note="a walkthrough, as a narrative" />
        <RailRow label="Quiz" note="five questions, no gotchas" />
      </div>
    </div>
  </Shell>
);

// ── 04 · explain-branch ──────────────────────────────────────────────────────

const ExplainBranch: Page = () => (
  <Shell marker="explain-branch">
    <Kicker>YOU WILL SEE THIS ONE RUN</Kicker>
    <div style={{ marginTop: 28 }}>
      <SkillH name="explain-branch" sub="how the feature was built, step by step" />
    </div>

    <div style={{ marginTop: 48, display: 'flex', gap: 90 }}>
      <ul style={{ ...BULLETS, flex: 1, fontSize: 34 }}>
        <li>One chapter per <em>substantial</em> commit, in build order</li>
        <li>Renames and formatting get a sentence, not a chapter</li>
        <li>A mini-quiz per chapter, where there is something to test</li>
        <li>Too few real steps? It falls back to the flat explainer.</li>
      </ul>
      <div style={{ width: 620 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            color: DIM,
            letterSpacing: '0.14em',
            marginBottom: 10,
          }}
        >
          THE PAGE
        </div>
        <RailRow label="Intro" note="the problem, end to end" />
        <RailRow label="Chapter 1" note="the first real step" />
        <RailRow label="Chapter 2" note="what it made possible" />
        <RailRow label="Summary" note="loose ends the commits flagged" />
        <div style={{ fontFamily: MONO, fontSize: 22, color: DIM, marginTop: 18 }}>
          demo MR: 2 chapters · 4 diagrams · 47 KB
        </div>
      </div>
    </div>
  </Shell>
);

// ── 05 · review-mr, the loop ─────────────────────────────────────────────────

const Stage = ({
  n,
  text,
  accent = false,
}: {
  n: string;
  text: ReactNode;
  accent?: boolean;
}) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, height: 60 }}>
    <span
      style={{
        fontFamily: MONO,
        fontSize: 26,
        color: accent ? ACCENT : DIM,
        width: 48,
      }}
    >
      {n}
    </span>
    <span
      style={{
        fontSize: 34,
        lineHeight: 1.3,
        color: accent ? ACCENT : 'var(--osd-text)',
        fontWeight: accent ? 700 : 400,
      }}
    >
      {text}
    </span>
  </div>
);

const ReviewMrLoop: Page = () => (
  <Shell marker="review-mr">
    <Kicker>SOMEONE ELSE&rsquo;S MR</Kicker>
    <div style={{ marginTop: 24 }}>
      <SkillH name="review-mr" sub="the loop" />
    </div>

    <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Stage n="01" text="explain-branch, in the background, while you wait" />
      <Stage n="02" text="review-branch seeds the findings" />
      <Stage n="03" text="curate the list with me — one topic at a time" />
      <Stage n="04" text="draft the comment, in the repo's language" />
      <Stage n="05" text="you paste it into GitLab" accent />
    </div>

    <div style={{ marginTop: 40, fontSize: 32, lineHeight: 1.45, color: MUTED, maxWidth: 1520 }}>
      A comment you write in the browser yourself gets adopted as a topic on the next{' '}
      <code style={{ fontFamily: MONO, color: 'var(--osd-text)' }}>sync</code>. All the git work
      happens in a throwaway review worktree, so your own checkout never moves.
    </div>
  </Shell>
);

// ── 06 · review-mr, the multi-day part ───────────────────────────────────────

const TopicRow = ({
  handle,
  kind,
  summary,
  state,
  stateColor,
}: {
  handle: string;
  kind: string;
  summary: ReactNode;
  state: string;
  stateColor: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      height: 46,
      fontFamily: MONO,
      fontSize: 27,
      borderBottom: `1px solid ${LINE}`,
    }}
  >
    <span style={{ width: 54, color: 'var(--osd-accent)' }}>{handle}</span>
    <span style={{ width: 46 }}>{kind}</span>
    <span style={{ flex: 1, color: BODY }}>{summary}</span>
    <span style={{ width: 300, color: stateColor, textAlign: 'right' }}>{state}</span>
  </div>
);

const ReviewMrDays: Page = () => (
  <Shell marker="review-mr">
    <Kicker>DAY 1 · DAY 4 · THE THURSDAY AFTER</Kicker>
    <div style={{ marginTop: 24 }}>
      <SkillH name="review-mr" sub="the part that survives the week" />
    </div>

    <div style={{ marginTop: 36 }}>
      <div
        style={{
          display: 'flex',
          gap: 20,
          height: 38,
          alignItems: 'center',
          fontFamily: MONO,
          fontSize: 22,
          color: DIM,
          letterSpacing: '0.12em',
          borderBottom: `2px solid ${LINE}`,
        }}
      >
        <span style={{ width: 54 }} />
        <span style={{ width: 46 }} />
        <span style={{ flex: 1 }}>TOPIC</span>
        <span style={{ width: 300, textAlign: 'right' }}>STATE</span>
      </div>
      <TopicRow handle="t1" kind="🔴" summary="CORS: wildcard origin + credentials" state="◐ needs-ack ✓" stateColor={ACCENT} />
      <TopicRow handle="t2" kind="🟡" summary="persistDb('comment') never awaited" state="◐ needs-ack" stateColor={ACCENT} />
      <TopicRow handle="t3" kind="🟠" summary="loadDb() returns null, callers spread it" state="◐ needs-ack" stateColor={ACCENT} />
      <TopicRow handle="t4" kind="🔵" summary="mock DB path depends on cwd" state="○ open" stateColor={MUTED} />
      <TopicRow handle="t5" kind="💬" summary="a peer reviewer's thread" state="○ open" stateColor={MUTED} />
      <div style={{ fontFamily: MONO, fontSize: 25, color: DIM, marginTop: 16 }}>
        2 pushes since your baseline · drafts in en
      </div>
      <div style={{ fontFamily: MONO, fontSize: 26, color: MUTED, marginTop: 12 }}>
        ✎ draft{'  '}·{'  '}○ open{'  '}·{'  '}◐ needs-ack{'  '}·{'  '}● acked{'  '}·{'  '}⊘ wontfix
      </div>
    </div>

    <div style={{ marginTop: 38, fontSize: 31, lineHeight: 1.45, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: MUTED }}>
        Replies and pushes reconciled by head-SHA delta — force-pushes included.
      </div>
      <div style={{ color: MUTED }}>
        <code style={{ fontFamily: MONO, color: 'var(--osd-text)' }}>diff t1</code> shows what the
        author actually changed for that one topic.
      </div>
      <div style={{ color: 'var(--osd-text)', fontWeight: 600 }}>
        Only <span style={{ color: 'var(--osd-accent)' }}>your ack</span> closes a topic. Them
        resolving the thread does not.
      </div>
    </div>
  </Shell>
);

// ── 07 · rework-mr ───────────────────────────────────────────────────────────

const ReworkMr: Page = () => (
  <Shell marker="rework-mr">
    <Kicker>THE OTHER HAT · YOUR OWN MR</Kicker>
    <div style={{ marginTop: 24 }}>
      <SkillH name="rework-mr" sub="answering the review" />
    </div>

    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Stage n="01" text="pull the open threads, one line of summary each" />
      <Stage n="02" text="talk each one to a plan — trivial gets a recommendation, hard gets grilled" />
      <Stage n="03" text="only then, code: failing test first, then the fix" />
      <Stage n="04" text="fixup into the commit that introduced it, force-push" />
      <Stage n="05" text="a drafted reply per thread, in the thread's language" />
    </div>

    <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 31, lineHeight: 1.45, color: MUTED }}>
      <div>
        <span style={{ color: 'var(--osd-text)', fontWeight: 600 }}>No code until every topic
        has a plan.</span> Grilling that edits files is not grilling.
      </div>
      <div>
        The reply links a compare URL, never a commit URL — a force-push would rot that link
        the same afternoon.
      </div>
    </div>
  </Shell>
);

// ── 08 · Design principles ───────────────────────────────────────────────────

const Principle = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 40, alignItems: 'baseline' }}>
    <span
      style={{
        fontFamily: MONO,
        fontSize: 28,
        color: 'var(--osd-accent)',
        width: 400,
        flexShrink: 0,
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </span>
    <span style={{ fontSize: 34, lineHeight: 1.45, color: BODY }}>{children}</span>
  </div>
);

const Principles: Page = () => (
  <Shell marker="design">
    <H>Three things I would keep.</H>

    <div style={{ marginTop: 56 }}>
      <Steps>
        <Step>
          <div style={{ marginBottom: 44 }}>
            <Principle label="read-only">
              It never posts and never resolves. The tone stays mine — and it never fights me
              for the browser.
            </Principle>
          </div>
        </Step>
        <Step>
          <div style={{ marginBottom: 44 }}>
            <Principle label="state lives in files">
              A review spans days and several sessions. Findings, plans and baselines are on
              disk, not in a context window.
            </Principle>
          </div>
        </Step>
        <Step>
          <div>
            <Principle label="printed &gt; remembered">
              An instruction the agent must carry across forty turns gets dropped. Output the
              tool <em>prints</em> does not. Several features exist only for that reason — and
              one rule needed a{' '}
              <code style={{ fontFamily: MONO, color: 'var(--osd-accent)' }}>Stop</code> hook,
              because documenting it failed three times.
            </Principle>
          </div>
        </Step>
      </Steps>
    </div>
  </Shell>
);

// ── 09 · The rig ─────────────────────────────────────────────────────────────

const Rig: Page = () => (
  <Shell marker="the rig">
    <Kicker>NOTHING HERE IS STAGED</Kicker>
    <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 40 }}>
      <H>The rig</H>
      <img src={dockerLogo} alt="Docker" style={{ width: 76, height: 76, opacity: 0.8 }} />
      <img src={gitlabLogo} alt="GitLab" style={{ width: 68, height: 68, opacity: 0.8 }} />
      <img src={claudeLogo} alt="Claude" style={{ width: 66, height: 66, opacity: 0.8 }} />
    </div>

    <ul style={{ ...BULLETS, marginTop: 44, fontSize: 34 }}>
      <li>
        A real GitLab, in Docker, at{' '}
        <code style={{ fontFamily: MONO, color: 'var(--osd-accent)' }}>gitlab.test</code>
      </li>
      <li>
        MR !1 is <code style={{ fontFamily: MONO }}>bulletproof-react</code> PR #175, replayed
        commit for commit
      </li>
      <li>Two of its flaws are genuinely upstream&rsquo;s. Two I planted.</li>
      <li>
        <code style={{ fontFamily: MONO, color: 'var(--osd-accent)' }}>python3 fixture.py</code>{' '}
        puts all of it back in ~20 seconds
      </li>
    </ul>

    <div style={{ marginTop: 40, fontFamily: MONO, fontSize: 26, color: DIM }}>
      4 tmux windows · 3 warm sessions · 3 browser tabs · 0 network calls that matter
    </div>
  </Shell>
);

// ── 10 · Wrap ────────────────────────────────────────────────────────────────

const SkillLine = ({ name, note }: { name: string; note: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 32, height: 52 }}>
    <span style={{ fontFamily: MONO, fontSize: 30, color: 'var(--osd-accent)', width: 380 }}>
      {name}
    </span>
    <span style={{ fontSize: 30, color: MUTED }}>{note}</span>
  </div>
);

const Wrap: Page = () => (
  <Shell marker="wrap">
    <H>Take it. Break it.</H>

    <div style={{ marginTop: 48 }}>
      <SkillLine name="review-branch" note="local critique — the seed for everything else" />
      <SkillLine name="explain-diff" note="one change, taught rather than reviewed" />
      <SkillLine name="explain-branch" note="the same, a chapter per commit" />
      <SkillLine name="review-mr" note="their MR, from first read to your approval" />
      <SkillLine name="rework-mr" note="your MR, from feedback to force-push" />
    </div>

    <div
      style={{
        marginTop: 46,
        fontFamily: MONO,
        fontSize: 34,
        color: 'var(--osd-text)',
      }}
    >
      github.com/yogan/<span style={{ color: 'var(--osd-accent)' }}>agent-skills</span>
    </div>

    <div style={{ marginTop: 38, fontSize: 30, lineHeight: 1.5, color: MUTED, maxWidth: 1520 }}>
      Honest caveat: this is a personal toolset, not a product. It wants{' '}
      <code style={{ fontFamily: MONO, color: BODY }}>glab</code>, it wants macOS for the
      clipboard bits, and it wants that <code style={{ fontFamily: MONO, color: BODY }}>Stop</code>{' '}
      hook before it behaves.
    </div>
  </Shell>
);

export const notes: (string | undefined)[] = [
  // 01 Title
  'The command is already running behind this slide — say that out loud, it buys you the next four minutes and sets up the whole talk. Introduce yourself fast, then frame the pain in your own words: not that reviewing code is hard, but the shuttling between terminal and browser, over and over, for days. Two hats: reviewing someone else, and answering a review of your own. Do not explain the skills yet.',
  // 02 review-branch
  'This is the boring one and the foundation. Purely local, no GitLab, no network. It reads every commit since the branch left main and returns a flat severity-tagged list. That CORS finding is real output from a rehearsal — and it is one of the two flaws I planted.',
  // 03 explain-diff
  'Different intent from review: no findings at all, just teaching. It writes one self-contained HTML file and opens it. Mention the quiz — people either love it or find it deeply strange, both are fine reactions.',
  // 04 explain-branch
  'This is the one running right now, so keep it short — the audience will see the real output in a minute. The interesting judgement is which commits get a chapter: renames and reformats get a sentence folded into a neighbour.',
  // 05 review-mr, the loop
  'The centrepiece. Walk the five stages and stress stage five: it drafts, I post. Then the worktree detail, which developers always ask about — my checkout never moves. If a comment I typed in the browser myself shows up, sync adopts it as a tracked topic.',
  // 06 review-mr, the multi-day part
  'The table is the money shot — this is close to what you are about to see live. Point at t1 through t5, then the two pushes line. The line that matters is the last one: the author resolving a thread is not a close. Only my ack is.',
  // 07 rework-mr
  'Hat switch: now the review comments are pointed at me. The discipline is that nothing gets coded until every thread has an agreed plan — otherwise you fix the easy three and lose the argument on the hard one. Fixup, not a new commit, so the branch stays reviewable.',
  // 08 Principles
  'Three reveals, so pace yourself. Read-only and state-in-files are quick. Spend your time on the third: instructions an agent has to remember across many turns get dropped, but output it printed does not. That is why so much of this is rendered blocks — and why one rule is enforced by a Stop hook, after documenting it failed three times.',
  // 09 The rig
  'Credibility beat. Everything you just saw runs against a GitLab in Docker on this laptop, reset in twenty seconds. The MR is a real upstream PR replayed commit for commit — two flaws are genuinely upstream’s, which is the more interesting half.',
  // 10 Wrap
  'One line per skill, then the repo. Do not oversell: it is a personal toolset, glab-only, macOS-flavoured, and it needs the Stop hook. Then open the floor — the rig and the Stop hook are what people ask about.',
];

export const meta: SlideMeta = {
  title: 'Agentic Code Reviews',
  theme: 'synthwave-terminal',
  createdAt: '2026-08-05T15:19:53.556Z',
};

export default [
  Title,
  ReviewBranch,
  ExplainDiff,
  ExplainBranch,
  ReviewMrLoop,
  ReviewMrDays,
  ReworkMr,
  Principles,
  Rig,
  Wrap,
] satisfies Page[];
