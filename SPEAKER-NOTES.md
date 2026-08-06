# Speaker notes

Cues only. Same text as the `notes` export in the deck, which is what the presenter window
shows on `P`. **Edit both if you edit one.**

> **State: clean base.** Two slides — see [DECISIONS.md](DECISIONS.md) § "Reset to a clean base".

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

## Formatting notes in the presenter pane

The pane renders notes as **plain text with `white-space: pre-wrap`**:

- **Newlines survive** — write a list with `\n` and it renders as a list.
- **Markdown does not** — `**bold**` and `- item` render literally. Use a real bullet
  character (`•`) instead.
- The pane **scrolls** and has `A↓` / `A↑` font-size controls, so length is not a hard limit —
  but glanceability still is.

In source, build multi-line notes as an array joined with `'\n'` rather than one long string
with escapes; it stays readable and diffs line by line.
