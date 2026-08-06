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

## Brand icons — currently unused

> These were the rig slide's; that page was pruned when the deck was reset to a clean base.
> They are kept because they are tiny, already licence-cleared, and likely to come back —
> re-fetching them offline later would be the annoying option.

From [simple-icons](https://simpleicons.org/), fetched once from
`https://cdn.simpleicons.org/<slug>/E8EDF2` so the glyph colour is baked into the file and no
runtime recolouring is needed.

| File | Source | Licence |
| --- | --- | --- |
| `gitlab.svg` | simple-icons, slug `gitlab` | [CC0 1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md) |
| `docker.svg` | simple-icons, slug `docker` | CC0 1.0 (as above) |
| `claude.svg` | simple-icons, slug `claude` | CC0 1.0 (as above) |

simple-icons ships the icon set under CC0 1.0. The underlying logos are trademarks of
GitLab B.V., Docker Inc. and Anthropic PBC respectively, used nominatively — to name the
tools the talk actually runs against. That is ordinary referential use in a conference talk,
not an endorsement claim.

## Photography

**None.** No stock photos anywhere in the deck.

A deliberate call, not a search that came up empty: every slide is carried by typography, a
code panel, or a hand-built CSS/SVG diagram instead. See `DECISIONS.md` § "No photography".

## Fonts

**None bundled.** OS font stacks only:

- body / display — `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
- monospace accents — `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`

No webfont is fetched, so there is nothing to vendor and nothing to fail offline. On the
speaker's macOS machine this resolves to SF Pro and SF Mono.

## JavaScript

All JS is bundled locally by `open-slide build` (Vite) into `dist/`. Every asset above is
under Vite's 4 KB inline threshold, so the built deck loads no third-party script and makes
**no network request at runtime**.
