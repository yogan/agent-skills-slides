# Speaker notes

Same text as the `notes` export in the deck (which is what the presenter window shows on
`P`) — this copy adds the detail that does not fit in a notes pane. **Edit both if you edit
one.**

> **State: clean base.** Two slides. The rest of the talk is being built back up
> deliberately — see [DECISIONS.md](DECISIONS.md) § "Reset to a clean base".

---

## 0:00 — Page 01 · Title

**Open with a show of hands.** Four questions, quick, no commentary between them:

1. *Who here is using AI day to day?*
2. *Who is now doing more code review than actual coding?*
3. *Who does reviews with AI support already?*
4. *Who uses dedicated tooling for it* — not just pasting a diff into a chat window?

Hands drop off sharply between 3 and 4. **That gap is the talk** — call it out as it happens
rather than explaining it afterwards.

Then introduce yourself, fast. Do not explain the skills yet.

## Page 02 · `/review-mr`

### ▶ Start the command before you talk

```
/review-mr !1
```

**Kick it off the moment this slide is up.** It runs unattended for roughly **4 minutes**, so
it has to be going before you start talking through the list — otherwise you arrive at the
demo with nothing on screen.

Pre-answer everything so it does not stop on a question:

```
/review-mr !1 — generate the explainer first, then seed findings with review-branch,
then show me the overview and stop. Don't ask me anything before the overview.
```

### Then walk the five verbs

Slowly — this is what fills the four minutes.

| | |
| --- | --- |
| **explains** | `explain-branch` in the background: one chapter per substantial commit |
| **finds** | `review-branch` seeds the findings — flat, severity-tagged, `file:line` |
| **adopts** | a comment you type in the GitLab UI yourself becomes a tracked topic on the next `sync` |
| **tracks** | author replies and pushes reconciled across days, force-pushes included |
| **drafts** | it writes the comment; **you** paste it |

**Land the last one.** It drafts, I post — read-only against GitLab. Everything else in the
talk follows from that: the tone stays mine, and it never fights me for the browser.

> Rehearsal fact if you want it: a bare `/review-mr !1` reached the parked overview in **4
> minutes flat**, with 7 findings.
