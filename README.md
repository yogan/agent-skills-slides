# Agentic Code Reviews — talk deck

Slides for the ~60 minute talk on reviewing GitLab MRs (and answering the review) with
Claude Code agent skills. Built with [open-slide](https://open-slide.dev/): each page is a
React component on a fixed 1920×1080 canvas.

**The deck is support, not the act.** The talk is ~90 % live terminal demo.

> **This edition: [Seneca](https://seneca.camp/), 2026-09-19** — the Software Engineering
> Erlangen Camp, a barcamp, so it is a session slot rather than a conference talk.
>
> First delivered **2026-08-06** at ZAM (Open Source Contributors), Erlangen. Four slides, and
> it ran ~60 min rather than the 30 it was planned for — budget an hour. Talk-day checklist:
> [`e2e/RUNBOOK.md`](https://github.com/yogan/agent-skills) in the skills repo.
>
> Re-pointing it at the next event is one row on the title page (mark, name, date) plus the
> logo in `assets/` — see [`CREDITS.md`](assets/CREDITS.md).

## Starting another deck — or adding the next slide?

Build from **`themes/synthwave-terminal.md`** — the palette, type scale, layout metrics and
paste-ready `Shell` / `Kicker` / `SkillH` components live there, with the reasoning
for each. `/create-slide` will offer it as a picker option, and the dev UI's **Themes** panel
previews it live from `themes/synthwave-terminal.demo.tsx`.

## Present it

```bash
npm install     # once
npm run dev     # → http://localhost:8181
```

Open the slide **Agentic Code Reviews**, then:

| Key | Does |
| --- | --- |
| `F` | fullscreen play mode — **this is what you present from** |
| `P` | presenter window: current page, next page, **speaker notes**, elapsed timer |
| `→` / `Space` | next reveal, then next page |
| `←` | previous reveal, then previous page |
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

## The pages

| # | Page | Reveals | Presses |
| --- | --- | --- | --- |
| 01 | Title (centred) | — | 1 |
| 02 | `/review-mr Skill` | 5 | 6 |
| 03 | `/rework-mr Skill` | 5 | 6 |
| 04 | Outro — repo, contact, caveat (centred) | 2 | 2 |

**15 `→` presses** from the title to the end of the deck.

There is **no slide furniture at all** — no footer, no page numbers, no running topic marker.

### Content reveals on click

Each skill page arrives showing its heading and a one-line description of the skill. The
description **fades out as the first row arrives**, and every `→` brings in the next row. The
closing slide does the same with two blocks: contact details, then the caveat.

Worth one dry run before you present — the press counts are in the table above.

Two consequences of how open-slide implements this:

- **Reveals only happen in Present mode** (`F`). In the editing viewer, pages render fully
  composed — that is the framework's behaviour for a page you jump into, not a bug.
- **Entering a page backwards shows it complete.** Walking back from page 3 to page 2 lands on
  page 2 with all five rows already up, rather than making you press `→` five times again.

To drop the reveals on a page, delete its `<Step>` wrappers and the `<RevealList>`; the rows
render as a plain list.

## Speaker notes

Notes live in **two** places, deliberately:

- `slides/mr-review-with-agent-skills/index.tsx` → the `notes` export. This is what the
  presenter window (`P`) shows. **This is the copy that matters during the talk.**
- [`SPEAKER-NOTES.md`](SPEAKER-NOTES.md) — the same notes plus the detail that does not fit a
  notes pane: the show-of-hands script, and the exact `/review-mr !1` invocation to paste.

If you edit one, edit the other. They are index-aligned with the page array.

**Page 02's note is a cue, not commentary:** start `/review-mr !1` as the slide goes up. It
runs ~4 minutes unattended and has to be going before you talk through the list.

## What to edit

Everything is one file: `slides/mr-review-with-agent-skills/index.tsx`. `npm run dev` hot-reloads.

| Want to change | Where |
| --- | --- |
| Title, the `/review-mr · /rework-mr` eyebrow, the name / event / date line | `Title`. It is intentionally bare — three elements and no footer. |
| Colours, fonts, hero size | the `design` const at the top; or live-tweak via the **Design** button in the dev UI and hit Save. Everything reads from it, so there are no stray hexes to chase. Mirror any change into `themes/synthwave-terminal.md`. |
| Anything on one page | find its component — `grep -n ": Page = " slides/*/index.tsx` |
| **Add a page** | write the component, add it to the `export default [...]` array, **and add a matching `notes` entry at the same index**. Page numbers update themselves via `useSlidePageNumber()`. |

## Layout rules worth knowing before you edit

The canvas does **not** scroll — anything past 1080px is silently cropped. Content sits in a
symmetrically 120px-padded band, so the usable height is about **840px**. Before adding a line, count: `font-size × line-height ×
lines`, plus gaps. If it does not fit, split the page rather than shrinking the type — this
deck is built to be read from the back of a bright room.

Fuller reference: `.agents/skills/slide-authoring/SKILL.md`.

### Page renders — local only

The canvas is fixed and does not scroll, so the reliable way to check overflow and contrast is
to look at a real 1920×1080 render rather than reason about the arithmetic. Capture the deck in
play mode with headless Chrome into `previews/`; there is no script for it in the repo, it was
done ad hoc.

`previews/` is **gitignored**, so keep as many rounds as you like — they never enter the
repository. If you capture a page with `<Steps>`, remember it swallows an `ArrowRight` per
reveal: a naive walk captures it blank and silently mis-indexes every page after it.

## Repo map

| Path | What |
| --- | --- |
| `slides/mr-review-with-agent-skills/index.tsx` | the whole deck — 4 pages, `notes`, `design`, and the background art |
| `themes/synthwave-terminal.md` | the house style — palette, type, paste-ready components. **Build new slides from this.** |
| `themes/synthwave-terminal.demo.tsx` | live preview of the theme, shown in the dev UI's Themes panel |
| `assets/` | avatar, Seneca mark, three line icons — see [`CREDITS.md`](assets/CREDITS.md) |
| `previews/` | **gitignored.** Local page renders, when you want to eyeball overflow and contrast without presenting — see below |
| [`DECISIONS.md`](DECISIONS.md) | every judgement call and why |
| [`SPEAKER-NOTES.md`](SPEAKER-NOTES.md) | notes + the show-of-hands script, phone-readable |
| `.agents/`, `.claude/` | open-slide's own authoring skills, shipped by the framework |
