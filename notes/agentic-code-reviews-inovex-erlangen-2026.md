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
- The rays in the background lean towards the mouse cursor. Park the cursor off the slide.
- On the workflow pages a comet runs the current loop (the last one revealed) and lights the
  steps it passes; revealing the second sends one spark along the arrow. Only on the page
  being presented.
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
  it (`Gloss`), so the shine sits exactly under the beams. A second WebGL instance would have
  double-eased the shared state. Bright pages also lower `falloff` (eased) so the beams reach
  the corner at all. The gloss fades out with the mark.
- **Side Rays** needs WebGL2; without it, and on inactive pages, the static corner glow stands
  in. Its GLSL uses `clamp`: the port renames the JS helper, and must not touch the shader.

## Licences

Tech Text and Side Rays are ports of [React Bits](https://reactbits.dev) components, © David
Haz, MIT + Commons Clause: use inside this deck is allowed, redistributing the components on
their own is not. The notice is kept in `index.tsx` above each port.
