# Asset credits

Every asset in the deck is committed to this repo. Nothing is hotlinked, so the deck
renders with the venue wifi unplugged.

## Avatar — in use

`goomba.png` — the speaker's own Mastodon avatar, fetched once from
[chaos.social/@yogan](https://chaos.social/@yogan) so nothing is hotlinked. 400 × 400 PNG,
293 KB, which is over Vite's 4 KB inline threshold, so it is emitted as a separate file in
`dist/` rather than inlined — still local, still offline-safe.

It is the speaker's own profile image, on the speaker's own closing slide. Worth noting only
that the character is Nintendo's; this is a personal avatar in a conference talk, not a
commercial use, and it is the speaker's call rather than a licence question this repo can
settle.

## Logos and icons — in use

### ZAM wordmark

`zam.png` — the official ZAM mark from [zam.haus](https://zam.haus), the stylised "ZAM"
wordmark (their file is named `ZAM_ohne_Text-Logo-square`, but the mark *is* the wordmark).
Trademark of ZAM e.V., used nominatively to name the venue.

**Derived, not the original file.** Upstream ships black-on-white JPEG — no alpha to mask, and
a `mix-blend-mode` trick cannot reach the slide background from inside the content layer's own
stacking context. So it was converted once to a tight white-on-transparent PNG (300 × 300 →
cropped 250 × 80) and is masked like every other icon, taking its colour from the palette.

The conversion used headless Chrome as an image decoder: draw to a canvas, set
`alpha = 1 − luminance` with a small contrast stretch so JPEG ringing does not leave a grey
haze, force RGB to white, then crop to the glyph's bounding box. To redo it, re-fetch
`https://www.zam.haus/wp-content/uploads/2022/05/cropped-ZAM_ohne_Text-Logo-square-300x300.jpg`
and repeat that recipe.

### Line icons

From [Tabler Icons](https://tabler.io/icons) v3.46.0, **MIT** — the outline set, so all three
share one stroke weight.

| File | Icon | Used for |
| --- | --- | --- |
| `tabler-brand-github.svg` | `brand-github` | the repo link |
| `tabler-brand-mastodon.svg` | `brand-mastodon` | the Mastodon handle |
| `tabler-mail.svg` | `mail` | the mail address |

Committed **unmodified**. They are stroke-based with `stroke="currentColor"`, which renders
black inside an `<img>`, so the deck applies them as CSS masks and paints the palette colour
through them.

> **Gotcha.** Vite inlines these as data URIs and rewrites their attribute quotes to
> apostrophes. An unquoted CSS `url()` token cannot contain an apostrophe, so `url(${src})` is
> silently dropped and you get a solid coloured box. Quote it: `url("${src}")`.

## Photography

**None.** No stock photos anywhere in the deck.

A deliberate call, not a search that came up empty: every page is carried by typography and
the background art instead. See `DECISIONS.md` § "No photography".

> If a page ever needs a brand mark, [simple-icons](https://simpleicons.org/) ships them under
> CC0 1.0 and `https://cdn.simpleicons.org/<slug>/E8EDF2` bakes the palette colour into the
> file, so no runtime recolouring is needed. An earlier version of the deck used `gitlab`,
> `docker` and `claude` that way.

## Fonts

**None bundled.** OS font stacks only:

- body / display — `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
- monospace accents — `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`

No webfont is fetched, so there is nothing to vendor and nothing to fail offline. On the
speaker's macOS machine this resolves to SF Pro and SF Mono.

## JavaScript

All JS is bundled locally by `open-slide build` (Vite) into `dist/`. The icons are under Vite's
4 KB inline threshold and get inlined as data URIs; the two PNGs are emitted as files beside the
bundle. Either way everything ships inside `dist/`, so the built deck loads no third-party
script and makes **no network request at runtime**.
