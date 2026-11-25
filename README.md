# Agentic Code Reviews — talk decks

Slides for a talk on reviewing GitLab MRs, and answering the review, with the agent skills in
[yogan/agent-skills](https://github.com/yogan/agent-skills). The talk is mostly live demo
(the skills repo's `e2e/` rig and `e2e/RUNBOOK.md`); the slides only frame it. Built with
[open-slide](https://open-slide.dev/).

| Deck | Event |
| --- | --- |
| `slides/agentic-code-reviews-seneca-2026/` | Seneca barcamp, Erlangen, 2026-09-19 (first given at ZAM, 2026-08-06) |
| `slides/agentic-code-reviews-inovex-erlangen-2026/` | inovex Meetup Erlangen, 2026-11-26 |

Each deck has `notes/<deck-id>.md` with what its code does not say: why it is built the way
it is, and how it behaves when presented.

## Present

```bash
npm install
npm run dev     # → http://localhost:8181 (not 5173: see open-slide.config.ts)
```

Open the deck, then `F` to present, `P` for the presenter window (notes, next page, timer),
`→` / `←` for the next / previous reveal or page. Reveals only run in Present mode; a page
you jump to or step back into shows complete.

Without the dev server: `npm run build` writes a self-contained static site to `dist/`
(`npm run preview` serves it). PDF, HTML and PPTX export are in the slide toolbar's
**Export** menu; PDF needs Chrome.

## Speaker notes

The `notes` export in each deck's `index.tsx`, one entry per page. The presenter pane shows
them as plain text: newlines survive, markdown does not, so write bullets as `•` and build
multi-line notes as an array joined with `'\n'`.

## Checking a page

The canvas does not scroll, so check overflow and contrast on a real 1920×1080 render in
headless Chrome. Keep renders in `previews/`, which is gitignored. A page with `<Steps>`
takes one `→` per reveal, so a screenshot walk that presses `→` once per page drifts.

There is no typecheck: the build uses esbuild, which strips types without checking them.
