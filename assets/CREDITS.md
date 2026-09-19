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

### Seneca phoenix

`seneca.png` — the official Seneca mark from [seneca.camp](https://seneca.camp/), the phoenix
without the wordmark (the slide says "Seneca" in type right beside it, so the lettering would
only repeat itself). Mark of the Seneca orga team, used nominatively to name the event.

**The original artwork, only smaller.** Upstream already ships white-on-transparent RGBA and
is cropped tight to the glyph, so there is nothing to fix — no alpha to fake, no background to
knock out. It was resampled once from 1144 × 1377 to **219 × 264** (`sips -Z 264`), which is
~3.6× the 60 × 72 it renders at, so it stays sharp on a retina panel and in the PDF export.
40 KB. To redo it, re-fetch and repeat:

```
curl -O https://seneca.camp/wp-content/uploads/2023/05/logo-bird.png
sips -Z 264 logo-bird.png --out seneca.png
```

**Not masked.** It is the one mark in the deck that does not go through `Icon`. Its gradient —
sunset orange → crimson → cyan — is already this deck's neon palette, and flattening it to a
single colour would throw the brand away to buy a consistency nothing here needs.

> The previous edition of this deck carried the ZAM wordmark (`zam.png`) instead; it needed a
> black-on-white JPEG converting to white-on-transparent first. Both the file and the
> conversion recipe are in git history if that edition is ever restored.

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
