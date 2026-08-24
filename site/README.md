# firaol.dev — Portfolio

A fast, dependency-free portfolio site. Vanilla HTML/CSS/JS, no build step,
no frameworks — designed to be easy to edit and cheap to host.

## Structure

```
index.html                 Single-page markup (all sections are empty
                            containers filled in by js/content.js)
css/
  tokens.css                Design tokens: colors (dark + light theme), type,
                             spacing, radii, motion
  base.css                  Reset, typography, layout primitives
  components-*.css          One file per component group (buttons, header,
                             hero, content, projects, misc)
  animations.css            Scroll-reveal + motion keyframes
  responsive.css            All breakpoint overrides (1080/900/720/560/380px)
js/
  icons.js                  Inline SVG icon set (no icon-font/CDN dependency)
  theme.js                  Dark/light theme toggle + persistence
  content.js                Fetches data/site-content.json and renders
                             every section into the DOM
  github.js                 Live GitHub API integration (profile + repos)
                             with a graceful, honest fallback if the API
                             call fails or is rate-limited
  animations.js              Typing effect, animated counters, skill bars,
                             IntersectionObserver-based scroll reveals
  portfolio.js               Project category filtering
  main.js                    Boot sequence + navigation, header scroll
                             state, back-to-top, contact form handler
data/
  site-content.json          All copy: hero, about, skills, projects,
                              experience, education, contact. Edit this
                              file to update the site — no HTML/JS edits
                              needed for content changes.
assets/                      SVG artwork, favicon, resume PDF
```

## Editing content

Everything text-based — your bio, skills, project descriptions, experience,
contact links — lives in `data/site-content.json`. Edit that file and
refresh; no other files need to change for routine content updates.

To swap the resume PDF, replace the file in `assets/resume/` and update
`about.resumeHref` / `hero.actions[].href` in the JSON if the filename
changes.

## Running locally

Because `content.js` uses `fetch()` to load the JSON, you need to serve the
folder over HTTP — opening `index.html` directly via `file://` will fail
due to browser CORS restrictions on local file fetches.

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

The form in `#contact` currently only simulates a submission client-side
(see the `NOTE` in `js/main.js`) and points people to email directly. Wire
it to a real endpoint (Formspree, a serverless function, etc.) before
relying on it to actually deliver messages.
