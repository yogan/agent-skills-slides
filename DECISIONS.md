# Decisions

Every judgement call the handoff left open, the changes made after the first review, and the
two places I deviated from the handoff. Ordered roughly by how likely you are to disagree.

## Changes made after the first review

**The pain page and the shape-of-the-solution page were cut**, on request — the deck went
from 12 pages to 10. Both were pre-demo framing (the terminal↔browser zigzag, and the
GitLab → agent → you flow diagram). What they carried is now spoken rather than shown: the
title page is bare and the speaker frames the pain over it, and page 08 still makes the
read-only point. The notes for page 01 carry the framing beats so nothing is lost silently.

The `FlowRow` component that only the shape page used was removed with it.

**The title page was rewritten to spec** and is deliberately the odd one out:

- eyebrow `/review-mr - /rework-mr`, then **Agentic Code Reviews**, then
  `Frank Blendinger / Open Source Contributors @ ZAM / 2026-08-06`
- **nothing else — no subtitle, no footer, no page number.** `Shell`'s `marker` prop is now
  optional, and omitting it suppresses the footer entirely. That is the only page without
  furniture; numbering on the rest is unaffected because `useSlidePageNumber()` counts pages,
  so page 02 reads `02 / 10`.
- the eyebrow does *not* use the shared `<Kicker>`: that style is tracked-out uppercase, which
  looks wrong on lowercase command names. It gets its own tighter, larger mono style.

## Deviations from the handoff

### 1. Content is centred vertically, not pinned to the top

The handoff asked for consistent slide furniture. I first built every page top-aligned at
120px, which gave a genuinely consistent heading anchor — and 200–350px of dead space under
the sparser pages. It read as unfinished rather than airy.

So the content block is now vertically centred in the band above the footer. The **furniture**
is still fixed: the footer marker and `NN / 10` sit at an identical absolute position on all
nine pages that have one, which is the part the eye actually tracks between slides. Easy to revert — one
`justifyContent` in `Shell`.

### 2. Page 8 is the only page with a stepped reveal

`<Steps>` is available and the handoff didn't ask for it. I used it on exactly one page — the
design principles — because the third principle (printed > remembered) is the payoff and
showing all three at once lets the room read ahead to it.

The cost is real and you should know about it: **`→` on page 8 advances the reveal, not the
page.** Three extra presses. It is documented in the README and flagged in the notes. Every
other page is shown whole, which is the right default for a deck you talk over.

## Deck structure

**10 pages.** The original build followed the handoff outline 1:1 at 12 pages; the two
framing pages were then cut (above), leaving a title, one page per skill with `review-mr`
split in two, principles, the rig and a wrap.

The 4-minute opening window is now carried by pages 1–4, which is closer to a minute a page.
That is fine for pages this sparse — the speaker is narrating, not reading — but it does put
more weight on the title page, which is why its notes are the longest in the deck.

**Pages 3, 4 and 9 are the designated cuts** if the talk runs late, and the notes say so. I
flagged 9 (the rig) as the one to protect, following the runbook's own instinct that this
crowd will want it.

## Look and feel

| Choice | Value | Why |
| --- | --- | --- |
| Background | `#0A0E13` | Near-black with a blue cast. True black bands badly on projectors. |
| Text | `#E8EDF2` | 16.4:1 on the background. |
| **Accent** | `#FFC24B` amber | One accent, used everywhere. 12.0:1 on the background, and it survives a washed-out projector far better than a mid-blue would. |
| Muted | `#8695A6` (6.3:1), dim `#5C6B7C` (3.6:1) | Secondary text only. **Nothing load-bearing is in dim** — it carries page numbers, the marker and footnotes. Dim is the one value below 4.5:1, which is why nothing you need to read sits in it. |
| Display / body | system sans (SF Pro on the speaker's Mac) | Heavy weights (800–850) for headings. |
| Monospace | SF Mono / Menlo stack | Used for **anything you could actually type** — skill names, file paths, commands, the topic table. That is the whole "nerdy" budget. |
| Hero | 132px | Fits "Agentic Code Reviews" on one line within the 1680px content width. |
| Body | 32–40px | Well above the 28px projector floor. |

**Why amber and not the obvious terminal green:** the deck reproduces the skills' own severity
glyphs (🔴🟠🟡🔵) and status glyphs. Green would have read as a sixth status colour. Amber
sits next to the severity dots without competing, and it is already the colour of `◐
needs-ack` in the real tool.

**Texture:** a 120px grid at ~3 % white plus one warm bloom top-right. Deliberately almost
invisible — anything busier turns to mud when projected. It is there so the pages don't read
as flat black rectangles.

**No page transitions.** open-slide has no default and snap-swap is tasteful. Adding motion to
a deck that gets driven mid-live-demo is risk for no gain.

## Assets

### No photography

`assets/CREDITS.md` has the licences; the reasoning belongs here.

The handoff allowed Unsplash/Pexels/undraw and also said a text or code slide beats a legally
dubious photo. I went further and used **no photos at all** — not because I couldn't find
free ones, but because every slide that might have wanted one had a better answer:

- **review-branch / review-mr** → real tool output. This audience prefers artefacts to
  imagery, and the handoff said so.
- **The rig** → three brand marks and four facts. A photo of a laptop adds nothing.

(The two cut pages were the other two: a hand-drawn SVG zigzag and a CSS flow diagram, both
built rather than sourced. They went for editorial reasons, not licensing ones.)

A stock photo would have been decoration competing with the type. Nothing was licensed that
did not earn its place.

### Three icons, and how they are coloured

`gitlab.svg`, `docker.svg`, `claude.svg` from simple-icons (CC0), used on the rig page to name
the tools the demo runs against.

I fetched them from `cdn.simpleicons.org/<slug>/E8EDF2` — **colour baked into the file**. The
alternative was shipping the stock black icons and recolouring them, which for an `<img>`
means either a `filter: invert()` hack or a CSS mask. Baking the hex in is one fewer moving
part, and these are decorative marks whose colour will never need to change independently.

Vite inlines all three as data URIs (each is under the 4 KB threshold), so the built deck
makes **zero** asset requests. Venue wifi is irrelevant.

### Fonts

**No webfont.** OS stacks only, so nothing to vendor and nothing to fail offline. The handoff
asked for fonts to be vendored *if* needed — the cheaper answer was not to need any. On the
speaker's macOS machine this is SF Pro + SF Mono, which is exactly the intended look.

**Glyphs verified rendering** in a real headless-Chrome capture, not assumed: `✎ ○ ◐ ● ⊘ ✓`
and `🔴 🟠 🟡 🔵 💬`. The status legend on page 6 exists partly so the audience can decode the
live demo, and partly as a standing check that these still render.

## Content accuracy

Every capability claim is traced to the skills' own docs — `SKILL.md` per skill,
`e2e/RUNBOOK.md` for the demo specifics. I read those and invented nothing. Specifically real,
not illustrative:

- the CORS finding, and that it is one of **two planted** flaws (two others are genuinely
  upstream's)
- the `t1`–`t5` topic table, including the states — that is the runbook's expected fixture
  state for MR !2 (`t1/t2/t3 ◐ needs-ack`, `t4 ○ open`, `t5 💬 peer`, 2 pushes)
- `drafts in en` — the marker the tool prints, and the language this talk runs in
- `bulletproof-react` PR #175, and `python3 fixture.py` resetting in ~20 s
- the `Stop` hook existing because documentation failed **three** times
- "2 chapters · 4 diagrams · 47 KB" for the captured explainer

The chapter titles in the explain-branch mock ("the first real step", "what it made
possible") are deliberately generic. I know the real explainer has two chapters, but not their
titles, so I did not invent plausible-looking ones for a slide that claims to show real
output.

**Language: English throughout**, per the handoff. Note the deck says `drafts in en`, while
`review-mr` defaults to German per repo — that marker is correct *for this demo*, and page 5
says "in the repo's language" rather than naming one.

## Things I chose not to do

- **A glyph-legend slide of its own.** Folded into page 6, under the table, where it is
  useful in context rather than as a page of notation.
- **A chart.** Nothing in the talk is quantitative. The `dataviz` skill's palette rules would
  have been solving a problem the deck doesn't have.
- **Two prototyped visual directions.** The constraints (dark, one accent, high contrast,
  monospace accents, projector-safe) left little genuine fork worth building twice. I spent
  the time on the diagrams instead.
- **Kept the scaffold's `getting-started` sample slide.** Deleted — it would show up beside
  the real deck on the slide index and there is nothing in it you want on the day.

## Verification

`npm run build` is clean. All 10 pages were rendered in headless Chrome at exactly 1920×1080
in play mode and inspected — that is what `previews/` contains, and it is how the overflow and
glyph checks were done rather than by trusting arithmetic. No page overflows the canvas.

The stepped page is captured **fully revealed**: entered forward it starts empty, so a naive
walk screenshots a blank slide and silently mis-indexes every page after it. Worth knowing if
you regenerate the previews.

There is **no typecheck in CI or in the project** — TypeScript is not a dependency and the
build uses esbuild, which strips types without checking them. Types here are authoring
assistance only. If you want a real check, `npm i -D typescript && npx tsc --noEmit`.

Nothing outside this repo was modified: `~/src/agent-skills/` was read only, and the demo
checkouts, the local GitLab, its Docker container and `~/.claude/` were never touched.
