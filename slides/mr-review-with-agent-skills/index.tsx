import type { ReactNode } from 'react';
import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';

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
// variables (and the dev UI's Design panel); `BG` re-exports it for the one place a
// CSS variable cannot reach — SVG attributes. If you need the accent in an SVG or a
// JS conditional, add `const ACCENT = design.palette.accent;` here rather than
// pasting the hex.
//
// The full token set is documented in `themes/synthwave-terminal.md`, which is what
// future slides should be built from.
const BG = design.palette.bg;

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
const BODY = '#C9D5E1'; // secondary body copy, table cells
const MUTED = '#98A6BC'; // supporting copy, sub-headings
const DIM = '#6E7C95'; // de-emphasis only — separators. Never load-bearing.

// Synthwave neon — background only, never text, so everything *readable* still
// answers to exactly one accent. Kept as bare `r,g,b` triplets because the blooms
// need them at several alphas; `NEON_*` are the solid forms for SVG strokes.
const NEON_PINK_RGB = '255,45,170';
const NEON_CYAN_RGB = '0,217,255';
const NEON_VIOLET_RGB = '120,60,255';
const NEON_SUNSET_RGB = '255,140,60'; // the horizon glow the accent is tuned against
const NEON_PINK = `rgb(${NEON_PINK_RGB})`;
const NEON_CYAN = `rgb(${NEON_CYAN_RGB})`;

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
 * horizon. Sits behind everything and is masked to fade upward, so the lowest line
 * of a dense page still reads cleanly over it.
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
      {/* Front-edge shadow, so the grid sinks into darkness at the very bottom edge
          instead of ending at full strength against the frame. */}
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

// Content is centred on the canvas rather than pinned to the top: the pages carry
// deliberately little text, and top-alignment left a lot of dead space below the
// sparser ones. Padding is symmetric — there is no footer to reserve room for.
const Shell = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundColor: 'var(--osd-bg)',
      backgroundImage: TEXTURE,
      color: 'var(--osd-text)',
      fontFamily: 'var(--osd-font-body)',
      padding: PAD,
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
  </div>
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

// ── 01 · Title ───────────────────────────────────────────────────────────────

// Deliberately bare: eyebrow, title, byline. No footer, no page number, nothing else.
const Title: Page = () => (
  <Shell>
    {/* Tighter tracking than the theme's standard eyebrow: that one is tracked-out
        uppercase, which reads badly on lowercase command names. The colour split is
        the house pattern — accent slash, plain text for the name. */}
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


// ── 02 · review-mr ───────────────────────────────────────────────────────────

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
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 48, height: 76 }}>
    <span style={{ fontFamily: MONO, fontSize: 32, color: 'var(--osd-accent)', width: 360 }}>
      {label}
    </span>
    {/* Fixed note width rather than flex, so the asides form their own column right
        next to the text they annotate instead of drifting to the canvas edge. */}
    <span style={{ width: 660, fontSize: 36, color: BODY }}>{note}</span>
    {aside ? <Aside text={aside} /> : null}
  </div>
);

const ReviewMr: Page = () => (
  <Shell>
    <SkillH name="review-mr" sub="reviewing someone else's MR" />

    <div style={{ marginTop: 64 }}>
      <Row label="explainer" note="a blog-style article for context" aside="/explain-branch" />
      <Row label="agent review" note="findings, severity-tagged" aside="/review-branch" />
      <Row label="human review" note="the comments you write yourself" aside="synced into the agent session" />
      <Row label="follow-up" note="which topics are resolved" aside="per-topic diffs · your ack closes" />
      <Row label="drafting" note="support for writing good findings" />
    </div>
  </Shell>
);

export const notes: (string | undefined)[] = [
  // 01 Title
  'Show of hands, four questions, quick: Who here is using AI day to day? Who is now doing more code review than actual coding? Who does reviews with AI support already? And who uses dedicated tooling for it — not just pasting a diff into a chat window? Read the room off the last two; that gap is the talk.',
  // 02 review-mr
  '▶ START `/review-mr !1` NOW — it runs unattended for about 4 minutes, so it has to be going before you talk through this list. Then walk the five rows, slowly. Two of them are other skills from the same repo doing the work: review-mr composes, it is not one monolith. The pair that matters is agent review and human review — findings the agent produced, and comments I wrote by hand in the browser, synced into the same list and tracked the same way. On follow-up: the agent can tell me which topics are actually resolved and show me the diff per topic, but only my ack closes one — the author resolving a thread does not.',
];

export const meta: SlideMeta = {
  title: 'Agentic Code Reviews',
  theme: 'synthwave-terminal',
  createdAt: '2026-08-05T15:19:53.556Z',
};

export default [Title, ReviewMr] satisfies Page[];
