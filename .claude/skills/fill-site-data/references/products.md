# `src/data/products.json`

```json
{
  "featured": { "1": "<slug>", "2": "<slug>", … },
  "products": [ { … }, { … } ]
}
```

## `featured`

Rank → product slug. `"1"` is the first card in the home page carousel. Ranks are
sorted numerically, and a slug that matches no product is skipped. Five entries
is the current size; there is no hard limit.

## `products` — ordering

**Newest first. A new product goes at the TOP of the array.** The array order is
an authoring convenience only; the Products page sorts by `date` descending at
render time, so a wrong position shows up as a wrong `date`, not a wrong order.

## Field order within an entry

Follow this exactly — it mirrors the order the fields appear on the detail page,
which is what makes a half-filled entry readable in the diff:

```
id, slug, date,
name, tagline, category, subcategory, status,
overview, icon, heroImage,
features, problem, solution, gallery,
trigger, process, outcome,
dataFlow, kpis, insights,
motivation, findings,
technologies, architecture, challenges,
results, metrics,
links, relatedProducts
```

Omit any field that does not apply; do not reorder the ones you keep.

## Identity and taxonomy

| Field | Req | Notes |
| --- | --- | --- |
| `id` | yes | `phi-prod-NNN`, zero-padded to 3. `max(existing) + 1` — **not** array position. |
| `slug` | yes | The live URL segment, `/products/<slug>`. Unique, permanent. Match the product's own name casing — existing slugs are mixed (`VERA`, `ArchAItect`, `theacepirant`, `datanexus`). |
| `date` | no | Year as a string, e.g. `"2026"`. Sorts the Products page, newest first; entries without it sink to the bottom. Rendered as "Launched · 2026". |
| `name` | yes | Display name. Gets the ™ mark automatically in the UI — do not add one. |
| `tagline` | yes | One line, under 100 chars. Shown on cards and under the detail title, and used as the page meta description. |
| `category` | yes | Exactly one of: `applications` `ai` `automation` `data` `research` `games`. Drives the filter bar. |
| `subcategory` | no | Free text sub-label shown in the badge, e.g. `"Website"`, `"RAG / LLM"`, `"Mobile App"`, `"PowerBI Dashboard"`. |
| `status` | yes | Exactly one of: `live` `beta` `research` `prototype` `opensource` `archived`. |
| `overview` | yes | One solid paragraph. The single description reused on the product card, the featured card, and the detail Overview block. |

## Media

| Field | Notes |
| --- | --- |
| `icon` | Card/thumbnail image URL. |
| `heroImage` | Detail-page hero. Falls back to `icon` when absent. Also the per-product Open Graph image. |
| `gallery` | `[{ "src": "…", "caption": "…" }]`. `src` may be an image **or** a YouTube / Instagram / Facebook video URL — playable embeds are detected from the URL, so one array holds both. Two or more items render as a horizontal carousel, one renders centred. |

## Narrative sections — and the heading each one renders under

Every one is optional and renders only when present. Pick the set that fits the
product; nothing looks unfinished for being absent.

| Field | Type | Renders as |
| --- | --- | --- |
| `features` | `[{title, description?}]` | Features — "What's inside" |
| `problem` | string | Problem — "The challenge" |
| `solution` | string | Solution — "How we solved it" |
| `technologies` | `string[]` | Stack — "Technologies used" |
| `architecture` | string | Architecture — "How it's built" |
| `challenges` | `string[]` | Challenges — "Challenges we tackled" |
| `results` | string | Results — "The impact" |
| `metrics` | `[{label, value}]` | the tile grid under Results |

Category-specific extras — use the row that matches:

| Product kind | Fields | Renders as |
| --- | --- | --- |
| automation / workflow | `trigger` (string), `process` (`string[]`, numbered steps), `outcome` (string) | Trigger — "What kicks it off" · Process — "How it runs" · Outcome — "The result" |
| data pipeline | `dataFlow` (`string[]`, numbered steps) | Data Flow — "From source to insight" |
| dashboard | `kpis` (`[{label, value}]`), `insights` (`string[]`) | KPIs — "What it tracks" · Insights — "Business impact" |
| research | `motivation` (string), `findings` (`string[]`) | Motivation — "Why we explored this" · Research — "What the research showed" |

`metrics` and `kpis` share the `{label, value}` shape. `value` is a display
string, so units and symbols go in it: `{"label": "Answer accuracy", "value":
"94%"}`.

## `links`

All keys optional; the convention in this file is to list them all with `""` for
the ones that do not apply. Only non-empty links become buttons, so a disabled
CTA can never appear.

Priority order (first non-empty becomes the primary CTA):
`website` → `demo` → `playStore` → `appStore` → `dashboard` → `workflow` →
`caseStudy` → `github` → then the socials `youtube` `facebook` `instagram` `x`
`linkedin`, which are kept last so they never become primary.

**A `*.phiuture.com` URL in any link field is auto-detected as that product's own
site and added to `sitemap.xml` on the next build** (see
`scripts/generate-sitemap.mjs`). That is the whole mechanism — no list to update.

## `relatedProducts`

Up to three slugs of *other* products, shown at the bottom of the detail page.
Fewer than three, or none, and the page fills the rest from the same category
automatically. Unknown slugs are skipped silently.

## Worked example — from a README to an entry

Source README says: a Streamlit app that lets non-technical users query a CSV in
plain English, built with LangChain + GPT-4, MIT licensed, live at a Streamlit
URL, repo on GitHub.

```json
{
  "id": "phi-prod-013",
  "slug": "CsvWhisperer",
  "date": "2026",
  "name": "CsvWhisperer",
  "tagline": "Ask a spreadsheet a question in plain English and get a chart back.",
  "category": "ai",
  "subcategory": "LLM / Analytics",
  "status": "live",
  "overview": "CsvWhisperer turns a raw CSV into a conversation. Upload a file and ask questions the way you would ask an analyst — it infers the schema, writes and runs the query, and answers with a chart plus the reasoning behind it, so a non-technical team can interrogate its own data without waiting on anyone.",
  "features": [
    { "title": "Schema inference", "description": "Reads column types and relationships on upload, with no configuration step." },
    { "title": "Chart-first answers", "description": "Picks the chart form that fits the question instead of returning a table by default." }
  ],
  "problem": "Analytics questions queue behind whoever can write SQL, so the people closest to the data are the last to see it.",
  "solution": "A conversational layer over the file itself: the model plans the query, executes it in-process, and returns the result with the steps it took.",
  "technologies": ["Python", "Streamlit", "LangChain", "GPT-4", "pandas", "Plotly"],
  "links": {
    "website": "https://csvwhisperer.streamlit.app",
    "playStore": "",
    "appStore": "",
    "github": "https://github.com/thebitanpaul/CsvWhisperer",
    "demo": "",
    "dashboard": "",
    "workflow": "",
    "caseStudy": "",
    "youtube": "",
    "facebook": "",
    "instagram": "",
    "x": "",
    "linkedin": ""
  },
  "relatedProducts": ["DataAnalyzerAi", "datanexus"]
}
```

What the example does deliberately:

- Sits at the **top** of `products` — newest first.
- `id` is `013` because `phi-prod-012` is the highest existing, not because there
  are twelve entries.
- Omits `icon`, `heroImage`, `gallery`, `metrics`, `architecture`, `challenges`,
  `results` — the README had no images, numbers, or write-up for them. Inventing
  any of those would ship something false; the page renders fine without them.
- Keeps the field order above even though most fields are missing.
- Writes as a studio ("A conversational layer over the file itself"), not as a
  learner ("I wanted to try LangChain").
- Does not touch `featured`. Add a rank there only if asked.
