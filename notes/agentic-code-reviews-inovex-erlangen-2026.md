# inovex Meetup Erlangen 2026 deck — notes

The Seneca deck's structure in the inovex CI, dark: Grundblau base, Leuchtgrün as the one
readable accent, Atkinson Hyperlegible (vendored, so the deck works offline). Colours follow
the inovex colour sheet; the logo is the official horizontal lockup with its viewBox trimmed
to the artwork (the slidev master's version looks squished).

## Presenting

- The deck has nine pages but you stop on seven. Pages 2 and 8 are **transit pages**: copies
  of the title and of "Under the hood" on which the inovex mark fades (colour → watermark,
  watermark → gone). Arriving on one forward, it waits out the fade and steps on by itself
  with a synthetic `→`; arriving backward, it steps straight back. So one `→` on the title
  fades the logo, then lands on `/review-mr`.
- Landing on a transit page directly (thumbnail click, deck opened there) does not move on.
- A PDF export (toolbar → Export) is a handout: it leaves out both transit pages and shows the
  first workflow loop at full strength, where the live deck dims it once the second arrives.
- The rays in the background lean towards the mouse cursor. Park the cursor off the slide.
- On the workflow pages a comet runs the current loop (the last one revealed) and lights the
  steps it passes; revealing the second sends one spark along the arrow. Only on the page
  being presented.
- Once the second loop is up, the first dims, so the new one has the focus.
- On the review-mr workflow the who-tabs and the key take a `→` of their own, after the first
  loop and before the second: the tabs one by one (curate, draft, post), then the key's entries.
  The rework-mr workflow shows them with its first loop.
- **Demo cues** are reveals of their own on the workflow pages: after the first loop of
  review-mr (demo 1), after its second (demo 2), after both loops of rework-mr (demo 3). The
  page blurs back, the lights go up as on the title and "Demo Time!" rises in, shining where the
  beams cross it; the next `→` clears it, and the second loop waits for the lights to dim back
  (`DEMO_DIM_MS`) before it arrives.
- **Who does a step is a shape as well as a colour** (a tab on the step's top edge: spark for
  the agent, person for the human, both for together), so it survives a washed-out projector
  and colour-blind viewers. Emoji were rejected as too amateurish.
- The contact lines on the close are links and re-scramble on hover.

## Why it is built this way

- **Transit pages, not a hidden `<Step>`**: a page you land on directly starts with its steps
  revealed, so the title's fade would have been skipped on the page the deck opens on.
- **Module-level state** (`shownMode`, `techCarry`, `raysShared`) carries what the audience
  last saw across page instances: which way the mark fades, where Tech Text's sweep was, and
  the rays' clock and brightness. Only the active page (`useIsActivePage`) reads or writes
  it; thumbnails and the outgoing snapshot render the settled state.
- **The mark changes as one image** (filter + opacity on the `<svg>`). Fading its four pieces
  separately showed bright seams where their edges overlap; a wireframe version showed
  doubled shared edges.
- **Tech Text's labels are drawn one character at a time.** Drawn as whole strings in
  GPU-composited Chrome, the glyphs overlapped whatever the font. Headless Chrome without a GPU
  does not show the bug, so check this on real hardware.
- **The rays are drawn above the mark**, `mix-blend-mode: screen`, so a beam lights the mark
  where it crosses it. On bright pages they tilt down onto the mark (`tilt`, eased in
  `raysShared`). A fake sheen on the mark was tried and dropped: it did not match the rays.
- **The gloss on the colour mark is the rays' own frame**: SideRays copies the mark's corner
  of each frame into `raysShared.gloss`, a 2D canvas masked to the mark and colour-dodged over
  it (`Gloss`), so the shine sits exactly under the beams. Each gloss canvas gets the part of the
  frame under it; "Demo Time!" uses the same (`DemoGloss`), cut to its letters by drawing them
  into the canvas where the DOM has them, with the light doubled, since the near-full green barely
  takes a colour-dodge. A second WebGL instance would have
  double-eased the shared state. Bright pages also lower `falloff` (eased) so the beams reach
  the corner at all. The gloss fades out with the mark.
- **Demo cue = the latest reveal**: `<Step>`s add up, so `DemoTime` watches the step attributes
  and shows only while its step is the last revealed one; the other content is blurred by
  `:has(.aci-demo-on)`. The cue's steps are `display: contents`, so they do not count as flex
  items between the loops. The lights are module state too (`demoLights`), set by the active
  page's cue and read by `Rays`. The wait after demo 1 is a class on the second loop
  (`aci-after-demo`) that sets `--wait` for the whole row: `:has()` does not nest, so "the step
  after a demo step" cannot be a selector.
- **Side Rays** needs WebGL2; without it, and on inactive pages, the static corner glow stands
  in. Its GLSL uses `clamp`: the port renames the JS helper, and must not touch the shader.

## Licences

Tech Text, Side Rays and Echo Text are ports of [React Bits](https://reactbits.dev) components, © David
Haz, MIT + Commons Clause: use inside this deck is allowed, redistributing the components on
their own is not. The notice is kept in `index.tsx` above each port.
