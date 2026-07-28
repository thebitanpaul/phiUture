# `src/data/about.json`

Feeds the About page, the KPI board, the Contact page's three tabs, and the
footer social row.

```json
{
  "people": [ … ],
  "kpis": [ … ],
  "capabilities": [ … ],
  "social": { … }
}
```

## `people[]`

One entry renders as a single card; several render as a switchable stack. There
is currently one, `phi-people-001`.

| Field | Req | Notes |
| --- | --- | --- |
| `id` | yes | `phi-people-NNN`. |
| `name` | yes | |
| `avatar` | no | Image URL. Replaces the monogram when present. |
| `monogram` | yes | Initials shown when there is no avatar. |
| `location` | yes | |
| `roles` | yes | `string[]`. Also becomes `jobTitle` in the Person structured data, so keep them real job titles rather than taglines. |
| `bio` | yes | A paragraph. Also becomes the Person schema `description`. |
| `journeyCta` | no | Label on the button that opens the timeline modal. |
| `journey` | yes | The timeline, below. |

### `journey[]`

```json
{ "id": "phi-jrny-008", "year": "2026", "title": "…", "description": "…", "icon": "award", "color": "#d946ef" }
```

- `id` — `phi-jrny-NNN`, `max + 1` across all people.
- `year` — string, e.g. `"2020"`. Entries render in array order, so append
  chronologically.
- `icon` — one of `graduation` `cpu` `smartphone` `award` `briefcase` `lightbulb`
  `target`. Anything else falls back to `target`.
- `color` — a brand hex. In use: `#7c3aed` `#a855f7` `#d946ef` `#e879f9`.

## `kpis[]`

**Every KPI value is derived at render time. There is no `value` field and you
must never add one** — the board is built this way so it can never go stale.

| `kind` | Value comes from | Extra fields |
| --- | --- | --- |
| `years` | whole years since `since` (auto-increments) | `since`: `"YYYY-MM"` |
| `github` | live public-repo count for `githubUsername` | `githubUsername`, `githubReposFallback` (number used when the fetch fails) |
| `products` | total entries in products.json | — |
| `ai-products` | products with `category: "ai"` | — |
| `records` | music items in beyond.json | — |
| `videos` | video items in beyond.json | — |

Common fields: `id` (`phi-kpi-NNN`), `kind`, `label`, `sub` (the small line under
the label), `suffix` (appended to the number, e.g. `"+"`).

```json
{ "id": "phi-kpi-003", "kind": "products", "label": "Products Shipped", "sub": "across six domains" }
```

Adding a genuinely new metric needs a new `kind`, which means a code change in
`src/pages/About.tsx` — flag that rather than inventing a kind that the UI will
render as zero.

## `capabilities[]`

The discipline cards on the About page.

```json
{ "id": "phi-cap-007", "icon": "cpu", "title": "…", "description": "…", "products": ["VERA", "ArchAItect"], "color": "#d946ef", "href": "/beyond" }
```

Note `products` here is a list of **labels**, not slugs — see the table.

| Field | Req | Notes |
| --- | --- | --- |
| `id` | yes | `phi-cap-NNN`. |
| `icon` | yes | One of `appwindow` `cpu` `database` `flask` `sparkles` `workflow`. Unknown keys fall back to a sparkle. |
| `title` | yes | |
| `description` | yes | One or two sentences. |
| `products` | yes | Display labels, rendered as plain mono chips — **not** resolved against products.json. Use the product's `name` when naming one (`"TheAcepirant"`, not the slug `"theacepirant"`), or a content kind where the card is not about products (`"Records"`, `"Images (soon)"`). |
| `color` | yes | Brand hex. In use: `#7c3aed` `#a855f7` `#c026d3` `#d946ef` `#e879f9`. |
| `href` | no | An internal path that turns the whole card into a link, e.g. `"/beyond"`. |

## `social`

```json
{
  "email": "…",
  "founderEmail": "…",
  "business": [ … ],
  "people":   [ … ],
  "artist":   [ … ]
}
```

- `email` — the business inbox. The Contact form composes to it and the page
  shows it as the direct address.
- `founderEmail` — optional; listed under the Founder group.

Three groups matching the three identities behind the site, which are also the
three tabs on the Contact page:

| Group | Identity | Holds |
| --- | --- | --- |
| `business` | the studio | site, studio channel, developer page, business inbox |
| `people` | the founder | code, professional and everyday social, direct inbox |
| `artist` | the musician | streaming and video profiles. **Also surfaced on the Beyond page**, so a listener can go straight to a platform. |

The `people` key predates the "Founder" label in the UI and is kept as-is:
renaming it would break any older copy of this file still being served at runtime.

### Link entries

```json
{ "id": "people-github", "platform": "GitHub", "url": "https://github.com/thebitanpaul", "icon": "github", "footer": true }
```

| Field | Req | Notes |
| --- | --- | --- |
| `id` | yes | Descriptive, group-prefixed: `business-website`, `people-github`, `artist-spotify`. Not the `phi-*-NNN` numeric form. |
| `platform` | yes | Display label. |
| `url` | yes | Absolute `https://…` or a `mailto:` address. |
| `icon` | yes | See the list below. An unknown key renders no icon. |
| `footer` | no | `true` also places it in the compact footer row. Keep that set small — it is currently eight links. |

Available `icon` keys: `github` `linkedin` `mail` `globe` `x` `instagram`
`facebook` `youtube` `spotify` `applemusic` `amazonmusic` `youtubemusic`
`googleplay` `snapchat` `threads` `jiosaavn`.

Adding a platform outside that list needs a new icon in
`src/components/icons/socialIcons.tsx` — flag it rather than reusing a wrong one.

### How these feed structured data

`sameAs` in the Organization and Person JSON-LD is derived live from these
groups: `business` links go on the Organization, `people` + `artist` on the
Person. `mailto:` and relative links are excluded automatically. So adding a real
profile here also strengthens the site's entity signals — which is a reason to
keep the URLs canonical (the profile's own permalink, not a share link).
