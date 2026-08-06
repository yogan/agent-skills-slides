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

## Icons — currently unused

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
