# `src/data/beyond.json`

The creative side — music and video releases, plus which of them the home page
features.

```json
{
  "featured": {
    "fresh release": "<music slug>",
    "latest videos": ["<video slug>", "<video slug>", "<video slug>", "<video slug>"]
  },
  "mediums": [ { "id": "music", … }, { "id": "video", … }, { "id": "images", … } ]
}
```

**Formatting:** this file keeps each music and video item on a **single line**.
Preserve that — an item expanded across many lines makes the file much harder to
scan, which is the reason it is written this way.

## `featured` — the home page picks

| Key | Type | Feeds |
| --- | --- | --- |
| `"fresh release"` | one music slug | The "Fresh Release" card on the home page (a playable Spotify embed) |
| `"latest videos"` | array of video slugs | The "Latest Videos" thumbnail grid. **In order**; the first four are used. |

The keys have spaces on purpose — they read as the UI labels they drive. Slugs
are resolved **within the medium each key feeds**, so `"fresh release"` only ever
looks at Music and `"latest videos"` only at Video.

An unknown slug is skipped; if nothing resolves, the section falls back to the
natural data order (first release / first four videos). So a typo degrades
quietly rather than emptying the section — which is exactly why the validator
checks these.

Because this file is fetched at runtime, **editing these two lists reshuffles the
home page within about a minute of the commit. No redeploy.**

## `mediums[]`

| Field | Req | Notes |
| --- | --- | --- |
| `id` | yes | Stable key. `music`, `video`, `images` exist. The home page and the featured resolver look up `music` and `video` by this id — do not rename either. |
| `label` | yes | Tab label in the Beyond gallery. |
| `status` | yes | `live` or `coming-soon`. A `coming-soon` medium renders its `blurb` on a placeholder card instead of a grid. |
| `icon` | yes | One of `music` `video` `images`. Anything else falls back to a generic sparkle. |
| `blurb` | yes | One or two sentences. The visible copy on a `coming-soon` card. |
| `music` | no | Music items (below). Present on the Music medium. |
| `videos` | no | Video items (below). Present on the Video medium. |

A medium showing both arrays renders `videos` and ignores `music`; keep one kind
per medium. Adding a whole new medium is data-only — no code change needed.

## Music items

```json
{ "id": "phi-music-005", "slug": "naya-savera", "spotifyId": "4lh6TFDISC2xbGPrO1Sxa8", "height": 352, "title": "Naya Savera", "artist": "Bitan Paul", "tags": ["hindi", "uplifting"] }
```

| Field | Req | Notes |
| --- | --- | --- |
| `id` | yes | `phi-music-NNN`, `max + 1`. |
| `slug` | yes | Kebab-case title, e.g. `tera-mera-afsaana`. What `"fresh release"` points at. |
| `spotifyId` | yes | The **album** id — the segment after `/album/` in the Spotify URL. From `https://open.spotify.com/album/44nfvCCJAerycDbsgyOGvv?si=…` take `44nfvCCJAerycDbsgyOGvv`. Never guess one; a wrong id renders an empty player. |
| `height` | no | Embed height in px: `152` for a compact single, `352` for a full tracklist. Existing entries all use `352`. |
| `title` | no | Baked in so gallery search and labels work with no network call. Omitted, it is fetched live from Spotify oEmbed — so include it. |
| `artist` | no | Shown as the card subtitle. |
| `tags` | no | Free text, searched by the gallery box. Mood/language/genre works well: `["bengali", "melancholy", "love lost"]`. |
| `cover` | no | Art override. Normally left out — Spotify supplies it. |

## Video items

```json
{ "id": "phi-video-006", "slug": "naya-savera-video", "youtubeId": "HlAhtfn9qlI", "title": "Naya Savera", "artist": "Official Lyrical Video", "tags": ["hindi", "lyrical"] }
```

| Field | Req | Notes |
| --- | --- | --- |
| `id` | yes | `phi-video-NNN`, `max + 1`. |
| `slug` | yes | Kebab-case title **plus `-video`**. See the convention note below. |
| `youtubeId` | yes | The 11-character id. From `https://youtu.be/NdHy-XpAmPM` or `…/watch?v=NdHy-XpAmPM` take `NdHy-XpAmPM`. Never guess. |
| `title` | yes | Card title. |
| `artist` | no | Used as the **subtitle line**, so it holds the descriptor rather than a name: `"Official Lyrical Video"`, `"Ek Deewane Ki Deewaniyat · Side B"`. |
| `tags` | no | Same as music. |

Thumbnails are derived from `youtubeId` automatically — there is no thumbnail
field to fill.

### Why video slugs carry a `-video` suffix

A song and its video share a title, so without a suffix the two `featured` lists
would appear to hold the same handle and be easy to mix up while editing. Music
gets the bare kebab title, video gets `-video`. Keep it consistent for new
entries.
