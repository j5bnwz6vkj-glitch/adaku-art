# adaku.art

Official site for ADAKU. Static page served by GitHub Pages.


## Featured release workflow

The homepage now has a reusable Featured Release hero. To promote the next single, edit only `window.ADAKU_FEATURED_RELEASE` at the top of `catalogue.js` (title, eyebrow, tagline, date, artwork, listen link and explore link), place the new artwork in `assets/`, and add the release as the first item in `window.ADAKU_RELEASES`.

Current launch: **Golden Sunshade** (released September 6, 2026). The supplied 2048×2048 artwork is web-optimized at high quality as `assets/golden-sunshade.jpg`. The previous blue-hat homepage hero is preserved as `assets/hero-home.jpg` and is now the poster for the NeuraLinked video panel. The circular collector's-edition image remains in the About ADAKU section.

The Golden Sunshade Listen buttons currently point to ADAKU's Spotify artist page because no song-specific smart-link URL was supplied. Replace the `listen` URL in the Featured Release block and first catalogue item when the preferred direct link is available.
