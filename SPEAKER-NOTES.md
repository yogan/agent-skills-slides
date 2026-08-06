# Speaker notes

Cues only. Same text as the `notes` export in the deck, which is what the presenter window
shows on `P`. **Edit both if you edit one.**

> **State: clean base.** Two slides — see [DECISIONS.md](DECISIONS.md) § "Reset to a clean base".

| # | Page | Cue |
| --- | --- | --- |
| 01 | Title | Show of hands: using AI? · more review than coding? · reviews with AI? · dedicated tooling? |
| 02 | `/review-mr` | Start `/review-mr !1`, show when done (about 4 min). Then `/review-mr !2`, for the follow-up workflow. |

## The one thing to get right

`/review-mr !1` runs **~4 minutes unattended**. Start it as the slide goes up, not after.

Pre-answer everything so it cannot stop on a question:

```
/review-mr !1 — generate the explainer first, then seed findings with review-branch,
then show me the overview and stop. Don't ask me anything before the overview.
```
