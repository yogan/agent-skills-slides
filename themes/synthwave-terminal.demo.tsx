import type { DesignSystem, Page } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';

export const design: DesignSystem = {
  palette: { bg: '#0A0716', text: '#E8EDF2', accent: '#FFAE3D' },
  fonts: {
    display: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    body: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  typeScale: { hero: 132, body: 36 },
  radius: 10,
};

const BG = design.palette.bg;
const ACCENT = design.palette.accent;

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
const BODY = '#C9D5E1';
const MUTED = '#98A6BC';
const DIM = '#6E7C95';
const LINE = '#241C3C';
const PANEL = '#130E24';

const NEON_PINK_RGB = '255,45,170';
const NEON_CYAN_RGB = '0,217,255';
const NEON_VIOLET_RGB = '120,60,255';
const NEON_SUNSET_RGB = '255,140,60';
const NEON_PINK = `rgb(${NEON_PINK_RGB})`;
const NEON_CYAN = `rgb(${NEON_CYAN_RGB})`;

// A trimmed starfield — the real deck carries 64. Literal positions, no RNG, so the
// field never shifts between renders.
const STARS = [
  'radial-gradient(2.2px 2.2px at 944px 215px, rgba(255,255,255,0.32), transparent)',
  'radial-gradient(1.7px 1.7px at 766px 88px, rgba(255,255,255,0.33), transparent)',
  'radial-gradient(1.3px 1.3px at 1807px 100px, rgba(255,190,235,0.44), transparent)',
  'radial-gradient(1.2px 1.2px at 1403px 113px, rgba(255,255,255,0.60), transparent)',
  'radial-gradient(1.1px 1.1px at 16px 262px, rgba(255,255,255,0.32), transparent)',
  'radial-gradient(1.5px 1.5px at 997px 43px, rgba(190,220,255,0.58), transparent)',
  'radial-gradient(2.0px 2.0px at 1181px 136px, rgba(255,255,255,0.48), transparent)',
  'radial-gradient(1.6px 1.6px at 1804px 40px, rgba(255,255,255,0.54), transparent)',
  'radial-gradient(1.3px 1.3px at 78px 529px, rgba(255,255,255,0.26), transparent)',
  'radial-gradient(1.6px 1.6px at 1158px 78px, rgba(190,220,255,0.50), transparent)',
  'radial-gradient(2.0px 2.0px at 1339px 66px, rgba(255,190,235,0.54), transparent)',
  'radial-gradient(1.1px 1.1px at 1683px 263px, rgba(255,190,235,0.58), transparent)',
  'radial-gradient(1.5px 1.5px at 28px 561px, rgba(255,255,255,0.57), transparent)',
  'radial-gradient(1.6px 1.6px at 1642px 216px, rgba(255,255,255,0.56), transparent)',
  'radial-gradient(1.7px 1.7px at 1869px 415px, rgba(255,255,255,0.53), transparent)',
  'radial-gradient(2.1px 2.1px at 224px 74px, rgba(255,255,255,0.41), transparent)',
  'radial-gradient(1.5px 1.5px at 1708px 106px, rgba(190,220,255,0.40), transparent)',
  'radial-gradient(1.2px 1.2px at 1782px 331px, rgba(255,255,255,0.47), transparent)',
];

const TEXTURE = [
  ...STARS,
  `radial-gradient(1250px 800px at 86% -8%, rgba(${NEON_PINK_RGB},0.16), transparent 60%)`,
  `radial-gradient(1050px 720px at -4% 104%, rgba(${NEON_CYAN_RGB},0.13), transparent 60%)`,
  `radial-gradient(1500px 460px at 50% 112%, rgba(${NEON_SUNSET_RGB},0.13), transparent 68%)`,
  `radial-gradient(900px 620px at 12% -10%, rgba(${NEON_VIOLET_RGB},0.10), transparent 62%)`,
  'repeating-linear-gradient(to bottom, rgba(0,0,0,0.13) 0 1px, transparent 1px 6px)',
].join(', ');

const PAD = 120;

const Horizon = () => (
  <svg
    viewBox="0 0 1920 1080"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="swt-depth" gradientUnits="userSpaceOnUse" x1="0" y1="820" x2="0" y2="1080">
        <stop offset="0%" stopColor={NEON_PINK} stopOpacity="0.05" />
        <stop offset="35%" stopColor={NEON_PINK} stopOpacity="0.30" />
        <stop offset="100%" stopColor={NEON_CYAN} stopOpacity="0.42" />
      </linearGradient>
      <radialGradient id="swt-falloff" cx="0.5" cy="1" r="1.2">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
        <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.92" />
        <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.48" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <mask id="swt-grid-mask" maskUnits="userSpaceOnUse" x="0" y="820" width="1920" height="260">
        <rect x="0" y="820" width="1920" height="260" fill="url(#swt-falloff)" />
      </mask>
      <linearGradient id="swt-floor" gradientUnits="userSpaceOnUse" x1="0" y1="950" x2="0" y2="1080">
        <stop offset="0%" stopColor={BG} stopOpacity="0" />
        <stop offset="100%" stopColor={BG} stopOpacity="0.92" />
      </linearGradient>
    </defs>

    <g mask="url(#swt-grid-mask)" stroke="url(#swt-depth)" strokeWidth="2" fill="none">
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
      <line x1="0" y1="836" x2="1920" y2="836" />
      <line x1="0" y1="857" x2="1920" y2="857" />
      <line x1="0" y1="885" x2="1920" y2="885" />
      <line x1="0" y1="922" x2="1920" y2="922" />
      <line x1="0" y1="966" x2="1920" y2="966" />
      <line x1="0" y1="1019" x2="1920" y2="1019" />
    </g>

    <rect x="0" y="950" width="1920" height="130" fill="url(#swt-floor)" />
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

const Shell = ({ marker, children }: { marker?: string; children: React.ReactNode }) => (
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

const Kicker = ({ children }: { children: React.ReactNode }) => (
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

// ── Demo pages ───────────────────────────────────────────────────────────────

const Cover: Page = () => (
  <Shell>
    <div
      style={{
        fontFamily: MONO,
        fontSize: 36,
        lineHeight: 1.2,
        color: 'var(--osd-accent)',
        letterSpacing: '0.02em',
      }}
    >
      /command · /another
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
      Synthwave Terminal
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
        Speaker Name
        <span style={{ color: DIM, margin: '0 22px' }}>·</span>
        <span style={{ color: 'var(--osd-accent)' }}>@</span>handle
      </div>
      <div>
        Event
        <span style={{ color: DIM, margin: '0 22px' }}>·</span>
        2026-01-01
      </div>
    </div>
  </Shell>
);

const Content: Page = () => (
  <Shell marker="the-theme">
    <Kicker>NEON IS SCENERY · TYPE IS PLAIN</Kicker>
    <div style={{ marginTop: 28 }}>
      <SkillH name="do-the-thing" sub="what this page is for" />
    </div>

    <ul
      style={{
        fontSize: 'var(--osd-size-body)',
        lineHeight: 1.5,
        listStyle: 'none',
        margin: '40px 0 0',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <li>
        Monospace for anything you could <code style={{ fontFamily: MONO }}>actually type</code>
      </li>
      <li>Three to five bullets, each on one line</li>
      <li>
        The accent marks sigils — the <span style={{ color: ACCENT }}>/</span> and the{' '}
        <span style={{ color: ACCENT }}>@</span>, not the word
      </li>
      <li>Severity glyphs stay legible: 🔴 🟠 🟡 🔵</li>
    </ul>

    <div style={{ marginTop: 44 }}>
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
          width: 1180,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ color: 'var(--osd-accent)' }}>$ some-command --flag</div>
        <div style={{ height: 14 }} />
        <div style={{ color: BODY }}>a line of real tool output</div>
        <div style={{ color: MUTED }}>and a quieter second line beneath it</div>
      </div>
    </div>
  </Shell>
);

const Closer: Page = () => (
  <Shell marker="wrap">
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
      One accent. Everything else is scenery.
    </h2>
    <p style={{ fontSize: 34, lineHeight: 1.5, color: BODY, marginTop: 48, maxWidth: 1400 }}>
      Magenta and cyan carry the background; sunset gold carries the meaning. Nothing readable
      drops below 4.5:1, because the deck is talked over in a bright room — not read.
    </p>
  </Shell>
);

export default [Cover, Content, Closer] satisfies Page[];
