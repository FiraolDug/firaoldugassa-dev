# firaol.dev — Portfolio

A fast, dependency-free portfolio site. Vanilla HTML/CSS/JS, no build step,
no frameworks — designed to be easy to edit and cheap to host.

## Structure

```
index.html                 Single-page markup (sections are empty containers
                            filled in by js/content.js) + the TV <dialog>
css/
  styles.css                Everything in one file (one render-blocking
                             request): tokens (dark + light), base, components,
                             the TV viewer, motion, responsive, print
js/                          All loaded with `defer`
  icons.js                  Inline SVG icon set (no icon-font/CDN dependency)
  content.js                Reads the inline JSON and renders every section,
                             including the featured "live" projects + filters
  github.js                 Live GitHub API panel with an honest fallback
  animations.js             Typing effect, counters, scroll reveals
  tv.js                     FIRAOL·TV — TV-style viewer for live projects
  main.js                   Boot sequence, theme toggle, navigation,
                             header state, contact form (mailto)
data/
  site-content.json          All copy. Edit this, then run the sync script.
assets/
  live/                      Snapshots of live sites shown inside the TV
  projects/                  SVG cover art
  og-image.png               1200×630 social share image
  resume/                    Resume PDF
```

The theme is applied by a tiny inline script in `<head>` so there's no flash
of the wrong theme before the page paints.

## Live projects TV

Any project with a `live` block becomes a channel in the TV viewer (opened
from "Watch live" buttons, or anything with a `data-tv-open` attribute):

```json
"featured": true,
"live": {
  "url": "https://mesobequb.com",
  "embed": false,
  "snapshots": {
    "desktop": "assets/live/mesob-equb-desktop.webp",
    "mobile": "assets/live/mesob-equb-mobile.webp"
  }
}
```

- `embed: true` shows the real, interactive site in an `<iframe>`.
- `embed: false` shows scrollable snapshots plus an "Open live" button. Use
  this for sites that send `X-Frame-Options: DENY` or a CSP
  `frame-ancestors` rule (both current live sites do). To make one fully
  interactive, allow framing from your portfolio on that server, e.g.
  `Content-Security-Policy: frame-ancestors 'self' https://firaol.dev`,
  then flip `embed` to `true`.
- `featured: true` gives the project a large card at the top of Projects.

Controls: ← / → change channel, 1–9 jump, D toggles desktop/mobile view,
Esc powers off.

Refreshing snapshots (headless Chrome + ImageMagick):

```bash
google-chrome --headless=new --hide-scrollbars --window-size=1440,2600 \
  --virtual-time-budget=12000 --screenshot=shot.png https://mesobequb.com
magick shot.png -resize 1280x -quality 74 assets/live/mesob-equb-desktop.webp
# mobile: --window-size=390,2200, no resize
```

## Editing content

Everything text-based — your bio, skills, project descriptions, experience,
contact links — lives in `data/site-content.json`. Edit that file, then run:

```bash
python3 scripts/sync-content.py
```

This copies the JSON into a small inline `<script>` block inside
`index.html`. That's the site's *actual* data source at runtime — see
"Why the content is inlined" below for why. Refresh the page after
syncing; no other files need to change for routine content updates.

To swap the resume PDF, replace the file in `assets/resume/` and update
`about.resumeHref` / `hero.actions[].href` in the JSON if the filename
changes (then re-run the sync script).

## Why the content is inlined

Earlier versions of this site loaded `data/site-content.json` with
`fetch()`. That breaks with a CORS error if you just double-click
`index.html` and open it from disk (`file://…`) — browsers block
`fetch()` of local files that way for security reasons. To make the site
work correctly straight out of the zip, with no server required,
`index.html` now embeds the JSON directly in a
`<script type="application/json" id="site-content-data">` block, and
`js/content.js` reads from that first. `data/site-content.json` is kept
as the readable, diff-friendly source of truth for editing — just remember
to run `scripts/sync-content.py` after changing it.

(If `index.html` is ever served over http(s) and that inline block is
missing for some reason, `content.js` will automatically fall back to
`fetch('data/site-content.json')` instead — see below.)

## Running locally

Because content is inlined, you can just double-click `index.html` and it
will work. If you'd rather serve it over HTTP (recommended for testing
things closer to production, and required if you ever remove the inline
data and rely on `fetch()` instead):

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (VS Code "Live Server", `npx serve`, etc).

## The live GitHub panel

The "GitHub" section calls the public GitHub REST API directly from the
browser (`api.github.com/users/FiraolDug` and `.../repos`) — no token, no
backend. If the API is unreachable (offline, rate-limited, or blocked in a
sandboxed preview), it shows a clearly-labeled fallback instead of fake
numbers. Once deployed to a real domain this will show live, accurate data
on every page load.

## Deploying

This is a static site — any static host works: GitHub Pages, Netlify,
Vercel, Cloudflare Pages, etc. Just upload the whole folder; `index.html`
is the entry point.

## Contact form

The form validates input and opens the visitor's email app with a
pre-filled message to you (`mailto:`), so messages genuinely arrive
without a backend. Swap in Formspree or a serverless endpoint in
`js/main.js` if you'd rather receive submissions directly.
