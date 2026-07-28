---
name: fill-site-data
description: Fill or update the three phiUture content files — src/data/products.json, beyond.json, about.json — from any source (a project README, a repo, a Spotify or YouTube link, a CV, loose notes). Use whenever adding a product, a music release, a video, a journey entry, a capability, or a social link; changing what the home page features; or asking "put this into products.json". Covers the field order, id/slug conventions, allowed enum values, house tone, and a validator to run before finishing.
---

# Filling the phiUture content files

Three JSON files under `src/data/` hold every piece of editable content on the
site. Nothing else needs touching to add a product, a release, or a bio entry.

| File | Holds | Read before editing |
| --- | --- | --- |
| `src/data/products.json` | Every product + the featured carousel order | `references/products.md` |
| `src/data/beyond.json` | Music and video releases + the home page's Beyond picks | `references/beyond.md` |
| `src/data/about.json` | The person, KPI tiles, capabilities, all social links | `references/about.md` |

**Read the matching reference file before writing anything.** They carry the
per-field schema, the allowed values, and which UI heading each field lands
under. This file is the workflow and the rules that apply to all three.

## Workflow

1. **Identify the target file and the operation.** Adding a whole new entry, or
   editing fields on an existing one? If the request is ambiguous ("add VERA"),
   look up whether the slug already exists before assuming.
2. **Read the target JSON and the matching `references/` file.** Never write from
   the schema in your head — the field order and enums are load-bearing.
3. **Read the source material fully.** A README, the repo itself, a package
   manifest, a Spotify/YouTube URL. Pull real specifics out of it; the fields
   below are not places for generic filler.
4. **Draft the entry**, following the field order and content rules exactly.
5. **Write it** with a targeted `Edit`, not a whole-file rewrite (see below).
6. **Validate**: `node .claude/skills/fill-site-data/scripts/validate-data.mjs`
7. **Report** what you added, and whether it needs a deploy (next section).

## What goes live without a deploy

All three files are compiled into the bundle *and* fetched at runtime from the
content source (`GITHUB_DATA_BASE` → the committed copy on the branch, proxied
through `/api/content/<file>`). So:

- **Editing existing content** — copy, links, images, featured picks, a new music
  or video release — goes live within about a minute of the commit landing on the
  branch. No redeploy.
- **Adding a NEW product needs a deploy.** Its detail route works client-side
  either way, but the prerendered HTML and the `sitemap.xml` entry come from
  `getStaticPaths` reading the *bundled* copy at build time. Until a build runs,
  the page exists but is invisible to crawlers. Say so when you add one.

## Rules that apply to every file

**Preserve formatting.** Match the file's existing style — `products.json` is
2-space expanded, `beyond.json` keeps each music/video item on one line. Never
reformat or re-key a file you were asked to add one entry to; the diff should
show only the entry.

**Never reorder or renumber existing entries.** Only `featured` blocks express
ordering intent; everything else is positional history.

**IDs are sequential and never reused.** Take `max(existing) + 1` for the
prefix in question — *not* the array length, since `products` is stored
newest-first. Prefixes: `phi-prod-NNN`, `phi-music-NNN`, `phi-video-NNN`,
`phi-people-NNN`, `phi-jrny-NNN`, `phi-kpi-NNN`, `phi-cap-NNN`.

**Slugs are permanent URLs.** A product slug is its live path
(`/products/<slug>`) and is referenced by `featured` and `relatedProducts`.
Changing one breaks links and search rankings — treat it as immutable once
shipped, and say so if asked to rename.

**Cross-references must resolve.** products.json's `featured` ranks and
`relatedProducts`, and beyond.json's two `featured` lists, all hold slugs. An
unknown slug is silently skipped, so a typo shows up as a missing card rather
than an error. The validator catches these. (about.json's
`capabilities[].products` is the exception — those are display labels, not
slugs.)

**Images** can be a direct URL from any host (Cloudinary is what the site uses),
a normal Google Drive share link (auto-converted at render time), or a path
under `/public`. Never invent an image URL — leave the field out if you do not
have a real one; every media field has a branded fallback.

**Optional fields are omitted, not blanked.** A section renders only when its
field is present and non-empty, so leaving `problem` out is how you say "this
product has no problem section". The one exception is `links`, whose keys are
conventionally all present with `""` for the ones that do not apply.

## House tone

The site is a **studio showcase**, not a student portfolio or a CV. Every string
you write is customer-facing copy.

- Write as a studio shipping products: "Version-aware clinical protocol
  intelligence you can trust." Not "a project I built to learn about RAG."
- **Never frame anything as coursework, practice, or a learning exercise** — no
  "learnings", "as a student", "to explore", "my first attempt at". The UI
  headings were deliberately renamed away from that framing; do not reintroduce
  it in the content.
- Third person or first-person plural ("we built", "the system resolves"), never
  "I made this for fun".
- Be concrete. Pull real numbers, model names, and stack details from the source
  rather than writing "high performance" or "scalable".
- **Never name a client or employer** in any of these files. The site is
  deliberately client-anonymous — describe the work, not who paid for it. If the
  source material names one, drop the name and keep the substance.
- Match the existing entries' length and register. Read two or three neighbours
  before writing a new one.

## When the source is thin

If the source material does not cover a field, **leave the field out** rather
than inventing content. Then list what you left empty and what you would need to
fill it. A half-filled entry that is accurate beats a complete one that is
partly fabricated — and the app is built to render partial entries cleanly.

Never guess at: `spotifyId`, `youtubeId`, image URLs, dates, metric values, or
any link. Those are facts, and a wrong one ships a broken embed.

## Validating

```
node .claude/skills/fill-site-data/scripts/validate-data.mjs
```

Checks all three files: JSON parses, ids and slugs are unique, enum fields hold
allowed values, required fields are present, product field order matches the
canonical order, and every cross-reference resolves. Fix everything it reports
before finishing.

If a build is also warranted (new product), `npm run build` is the full check —
it typechecks, prerenders every product page, and regenerates the sitemap.
