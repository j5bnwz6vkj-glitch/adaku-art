# adaku.art

Official site for ADAKU. Static site served by GitHub Pages. Everything you
normally change lives in two files — no HTML editing needed:

- `catalogue.js` — releases, featured hero, videos, news strip
- `lyrics-data.js` — song lyrics

## catalogue.js, top to bottom

| Block | What it controls |
|---|---|
| `ADAKU_VIDEO` | The big video player on the home page (YouTube id = the part after `watch?v=`) |
| `ADAKU_VIDEOS` | Thumbnail row under the player, newest first |
| `ADAKU_NEWS` | The "Latest" strip (the News link in the menu), about four items |
| `ADAKU_FEATURED_RELEASE` | The hero at the top of the home page |
| `ADAKU_CAMPAIGN` | The campaign band under the hero (set to `null` to remove) |
| `ADAKU_RELEASES` | Every release; first five show on the home page |

## Hero video loop

`loop` in the featured block points to a silent MP4 in `assets/`
(currently `assets/deconstruct-the-moon-loop.mp4`). If that file isn't there,
the site plays the YouTube video named in `loopYouTube` instead, muted. If
neither can play — or the visitor has "reduce motion" turned on — the cover
artwork shows, exactly as before. Delete both lines to go back to the still
artwork. Keep loop files small (under ~8 MB, 1080p H.264, no audio).

## New single checklist

1. Put the cover in `assets/` (1000×1000 JPG is plenty).
2. Add a block at the top of `ADAKU_RELEASES` (use `soon: true` and an empty
   `listen` until it's out).
3. Paste the lyrics into `lyrics-data.js` under the exact same title.
4. Optional: point `ADAKU_FEATURED_RELEASE` at it and add a news item.

Current launch: **Deconstruct the Moon** (official video, Nov 2026).
