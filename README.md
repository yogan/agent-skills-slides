# Agentic Code Reviews — talk deck

Slides for the ~30 minute talk on reviewing GitLab MRs (and answering the review) with
Claude Code agent skills. Built with [open-slide](https://open-slide.dev/): each page is a
React component on a fixed 1920×1080 canvas.

**The deck is support, not the act.** The talk is ~90 % live terminal demo. These 10 pages
exist mainly to cover the ~4 minute stretch at the top while `/review-mr !1` runs
unattended, plus a handful of beats later on.

## Present it

```bash
npm install     # once
npm run dev     # → http://localhost:5173
```

Open the slide **Agentic Code Reviews**, then:

| Key | Does |
| --- | --- |
| `F` | fullscreen play mode — **this is what you present from** |
| `P` | presenter window: current page, next page, **speaker notes**, elapsed timer |
| `→` / `Space` | next page (or next reveal, on page 8) |
| `←` | previous page / peel back a reveal |
| `Esc` | leave play mode |

Put the presenter window on the laptop and mirror play mode to the projector.

That is the single documented command: `npm run dev`, then `F`.

### Presenting without the dev server

```bash
npm run build     # static site into dist/ — client-rendered, no server needed
npm run preview   # → http://localhost:4173, serves dist/
```

`dist/` is fully self-contained: every asset is inlined or bundled, the fonts are OS fonts,
and there are no runtime network calls. Copy `dist/` to a USB stick and it still works.

## Export to PDF

open-slide has no export CLI — it is a toolbar action. In `npm run dev` (or `preview`), open
the deck and use the **Export** menu in the slide toolbar:

- **PDF** — one 1920×1080 landscape page per deck page. **Use Chrome, not Safari** (Safari is
  unsupported).
- **HTML** — a static snapshot; downloads as a zip when the deck references assets.
- **PPTX** — each page as an image on a slide. Not editable.

A PDF flattens page 8's stepped reveal into its fully-revealed state, which is what you want
for a handout.

## The pages

| # | Page | Footer marker |
| --- | --- | --- |
| 01 | Title — **no footer, no page number, by design** | — |
| 02 | `review-branch` | `review-branch` |
| 03 | `explain-diff` | `explain-diff` |
| 04 | `explain-branch` | `explain-branch` |
| 05 | `review-mr` — the loop | `review-mr` |
| 06 | `review-mr` — the multi-day part | `review-mr` |
| 07 | `rework-mr` | `rework-mr` |
| 08 | Design principles — **3 stepped reveals** | `design` |
| 09 | The rig | `the rig` |
| 10 | Wrap | `wrap` |

## Speaker notes

Notes live in **two** places, deliberately:

- `slides/mr-review-with-agent-skills/index.tsx` → the `notes` export. This is what the
  presenter window (`P`) shows. **This is the copy that matters during the talk.**
- [`SPEAKER-NOTES.md`](SPEAKER-NOTES.md) — the same notes, plus timing and the handful of
  facts worth having in front of you. Readable on a phone.

If you edit one, edit the other. They are index-aligned with the page array.

## What to edit for a last-minute tweak

Everything is one file: `slides/mr-review-with-agent-skills/index.tsx`. `npm run dev` hot-reloads.

| Want to change | Where |
| --- | --- |
| Title, the `/review-mr - /rework-mr` eyebrow, the name / event / date line | `Title`. It is intentionally bare — three elements and no footer. |
| Colours, fonts, hero size | the `design` const at the top; or live-tweak via the **Design** button in the dev UI and hit Save |
| Anything on one page | find its component — `grep -n ": Page = " slides/*/index.tsx` |
| Page order, or cut a page | the `export default [...]` array at the bottom. Page numbers and `NN / 10` update themselves via `useSlidePageNumber()` — nothing to renumber. **Keep `notes` in the same order.** |
| Give the title page a footer after all | pass a `marker` to its `<Shell>`; omitting `marker` is what suppresses the footer |
| Drop the stepped reveal on page 8 | delete the `<Steps>`/`<Step>` wrappers in `Principles`; the content stays |
| The footer marker per page | the `marker` prop on each `<Shell>` |

Cutting a page is the safest way to lose time on the day: pages 3, 4 and 9 are the ones the
talk can survive without — and of those, protect 9 (the rig), which this crowd will want.

## Layout rules worth knowing before you edit

The canvas does **not** scroll — anything past 1080px is silently cropped. Content sits in a
120px-padded band that stops 152px above the bottom edge (the footer lives there), so the
usable height is about **808px**. Before adding a line, count: `font-size × line-height ×
lines`, plus gaps. If it does not fit, split the page rather than shrinking the type — this
deck is built to be read from the back of a bright room.

Fuller reference: `.agents/skills/slide-authoring/SKILL.md`.

## Repo map

| Path | What |
| --- | --- |
| `slides/mr-review-with-agent-skills/index.tsx` | the whole deck — 10 pages, `notes`, `design` |
| `assets/` | the three brand icons, plus [`CREDITS.md`](assets/CREDITS.md) |
| `previews/` | rendered PNG of all 10 pages, so you can judge it without building |
| [`DECISIONS.md`](DECISIONS.md) | every judgement call and why |
| [`SPEAKER-NOTES.md`](SPEAKER-NOTES.md) | notes + timing, phone-readable |
| `.agents/`, `.claude/` | open-slide's own authoring skills, shipped by the framework |
