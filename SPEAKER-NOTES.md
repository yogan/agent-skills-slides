# Speaker notes

Cues only. Same text as the `notes` export in the deck, which is what the presenter window
shows on `P`. **Edit both if you edit one.**

> Five slides. Seneca, 2026-09-19. First delivered 2026-08-06 as four; it ran ~60 min, so
> pace accordingly — and a barcamp session slot is 45 + 15, so the demo has to stay on rails.

## 01 · Title

```
Show of hands:
• Who is using AI?
• Who does more code review than actual coding now?
• Who is doing reviews with AI support?
• Who uses dedicated tooling for reviews?
```

## 02 · `/review-mr`

```
• Start /review-mr !1 — show when done (about 4 min)
• Then /review-mr !2 — for the follow-up workflow
```

`!1` runs **~4 minutes unattended**. Start it as the slide goes up, not after. Pre-answer
everything so it cannot stop on a question:

```
/review-mr !1 — generate the explainer first, then seed findings with review-branch,
then show me the overview and stop. Don't ask me anything before the overview.
```

## 03 · `/rework-mr`

```
• Hat switch — /rework-mr !3
• t1 trivial, t2 the real cache bug (keep the grilling short)
```

## 04 · How the skills fit together

```
• Violet = a skill you install · cyan = shared code, comes with the clone
• /review-mr pulls in /explain-branch (opt-in) and seeds findings from /review-branch
• /explain-branch resolves + renders through /explain-diff
• /explain-diff and /visualize both draw through the same engine
• Both commands share the GitLab plumbing, and every paste is gated by the Stop hook
```

**The page carries no legend and no labels on the arrows** — that is what these lines are for.
The version in the skills README has both, because a README has to answer with nobody standing
next to it. Say the colours first: without them the two families are just two colours.

## 05 · Outro

```
• Questions
```

## Formatting notes in the presenter pane

The pane renders notes as **plain text with `white-space: pre-wrap`**:

- **Newlines survive** — write a list with `\n` and it renders as a list.
- **Markdown does not** — `**bold**` and `- item` render literally. Use a real bullet
  character (`•`) instead.
- The pane **scrolls** and has `A↓` / `A↑` font-size controls, so length is not a hard limit —
  but glanceability still is.

In source, build multi-line notes as an array joined with `'\n'` rather than one long string
with escapes; it stays readable and diffs line by line.
