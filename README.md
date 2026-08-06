# Agentic Code Reviews — talk deck

Slides for the ~30 minute talk on reviewing GitLab MRs (and answering the review) with
Claude Code agent skills. Built with [open-slide](https://open-slide.dev/): each page is a
React component on a fixed 1920×1080 canvas.

**The deck is support, not the act.** The talk is ~90 % live terminal demo.

> ### State: clean base — 2 slides
>
> The deck was deliberately pruned back to a title and one `/review-mr` slide, and content is
> being built up again from there. What is here is finished; it is just not finished *talk*.
> See [DECISIONS.md](DECISIONS.md) § "Reset to a clean base".

## Starting another deck — or adding the next slide?

Build from **`themes/synthwave-terminal.md`** — the palette, type scale, layout metrics and
paste-ready `Shell` / `Footer` / `Kicker` / `SkillH` components live there, with the reasoning
for each. `/create-slide` will offer it as a picker option, and the dev UI's **Themes** panel
previews it live from `themes/synthwave-terminal.demo.tsx`.

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
| `→` / `Space` | next page |
| `←` | previous page |
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

| # | Page | Footer marker |
| --- | --- | --- |
| 01 | Title — **no footer, no page number, by design** | — |
| 02 | `/review-mr` — five verbs, what it does | `review-mr` |

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
| Give the title page a footer after all | pass a `marker` to its `<Shell>`; omitting `marker` is what suppresses the footer |
| The footer marker per page | the `marker` prop on each `<Shell>` |

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
| `slides/mr-review-with-agent-skills/index.tsx` | the whole deck — 2 pages, `notes`, `design`, and the background art |
| `themes/synthwave-terminal.md` | the house style — palette, type, paste-ready components. **Build new slides from this.** |
| `themes/synthwave-terminal.demo.tsx` | live preview of the theme, shown in the dev UI's Themes panel |
| `assets/` | brand icons (currently unused — see [`CREDITS.md`](assets/CREDITS.md)) |
| `previews/` | rendered PNG of every page, so you can judge it without building |
| [`DECISIONS.md`](DECISIONS.md) | every judgement call and why |
| [`SPEAKER-NOTES.md`](SPEAKER-NOTES.md) | notes + the show-of-hands script, phone-readable |
| `.agents/`, `.claude/` | open-slide's own authoring skills, shipped by the framework |
