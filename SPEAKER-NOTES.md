# Speaker notes

Same text as the `notes` export in the deck (which is what the presenter window shows on
`P`) — this copy adds timing and the facts worth having in reach. **Edit both if you edit
one.**

The deck's job is the **0:00–4:00 window**, while `/review-mr !1` runs unattended. Pages 1–6
are that window; 7–9 land during the demo; 10–12 are the wrap.

---

## 0:00 — Page 01 · Title

The command is already running behind this slide — **say that out loud**. It buys you the
next four minutes and it sets up the whole talk. Introduce yourself fast. Do not explain the
skills yet.

> Rehearsal fact if you want it: a bare `/review-mr !1` reached the parked overview in **4
> minutes flat**, with 7 findings.

## Page 02 · The pain

Read the quote as your own words, because they are. The point is *not* that reviewing code is
hard — it is the **shuttling**: terminal, browser, clipboard, terminal. Trace the zigzag with
a finger and land on "and again on Thursday".

## Page 03 · The shape

Three rows, one idea: the agent reads GitLab and drafts for me, and **the only write in the
whole loop is mine**. Then flag the two hats — reviewing someone else, and answering a review
of my own. The rest of the talk is those two, in that order.

## Page 04 · review-branch

The boring one, and the foundation. Purely local: no GitLab, no network. Reads every commit
since the branch left main, returns a flat severity-tagged list anchored at `file:line`.

That CORS finding is real rehearsal output — and it is **one of the two flaws I planted**. If
someone asks: wildcard origin *with* credentials is the classic misconfiguration.

## Page 05 · explain-diff

Different intent from review: **no findings at all**, just teaching. Writes one
self-contained HTML file and opens it. Mention the quiz — people either love it or find it
deeply strange, both are fine reactions.

*Cuttable if you are running late.*

## Page 06 · explain-branch

This is the one running **right now**, so keep it short — they will see the real output in a
minute. The interesting judgement is which commits earn a chapter: renames and reformats get
a sentence folded into a neighbour, not a heading of their own.

*Cuttable if you are running late.*

## ~4:00 — hand over to the terminal

From here the slides are punctuation. Come back to them between segments.

## Page 07 · review-mr — the loop

The centrepiece. Walk the five stages and **stress stage five: it drafts, I post.**

Then the worktree detail, which developers always ask about — my checkout never moves. And
the parallel-posting beat: a comment I typed in the browser myself shows up as a tracked
topic on the next `sync`. That is *why* it is read-only — it never fights me for the browser.

## Page 08 · review-mr — the multi-day part

**The table is the money shot** — this is close to what they are about to see live. Point at
t1 through t5, then the "2 pushes" line, then the glyph legend so they can read the real one.

The line that matters is the last one: **the author resolving a thread is not a close. Only
my ack is.**

If asked about `diff t1`: the author said "reworked it" — this shows the actual change
instead of making me trust the reply. Server-side, so force-pushes do not break it.

## Page 09 · rework-mr

Hat switch: now the review comments are pointed at me.

The discipline is that **nothing gets coded until every thread has an agreed plan** —
otherwise you fix the easy three and lose the argument on the hard one. And fixup rather than
a new commit, so the branch stays reviewable.

## Page 10 · Principles — **three reveals**

`→` three times. Pace yourself.

Read-only and state-in-files are quick. **Spend your time on the third:** instructions an
agent must remember across many turns get dropped, but output it *printed* does not. That is
why so much of this is rendered blocks — and why one rule is enforced by a `Stop` hook, after
documenting it failed three times.

This is the slide this audience came for.

## Page 11 · The rig

Credibility beat. Everything they just saw runs against a GitLab in Docker on this laptop,
reset in twenty seconds. The MR is `bulletproof-react` PR #175 replayed commit for commit —
**two flaws are genuinely upstream's**, which is the more interesting half.

*Cuttable, but this crowd will want it — protect it over page 05/06.*

## Page 12 · Wrap

One line per skill, then the repo. **Do not oversell:** personal toolset, `glab`-only,
macOS-flavoured for the clipboard bits, and it needs the `Stop` hook.

Then open the floor. The rig and the `Stop` hook are what people ask about.
