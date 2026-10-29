# Ifihanjesu Eben — Portfolio

Static site (HTML/CSS/JS, no build step) with GSAP + ScrollTrigger + Lenis motion, deployed on Vercel.

- Pages are generated from `scripts/build.py` — edit content there, then run `python3 scripts/build.py`.
- Social links live in the `SOCIAL` dict at the top of `scripts/build.py`.
- Fonts: the design uses Acid Grotesk and Neue Montreal (licensed). The site uses them if installed locally and otherwise falls back to Schibsted Grotesk / Inter, which ship in `assets/fonts/`. Add licensed `.woff2` files there and reference them in `assets/css/style.css` to use the real typefaces for every visitor.

## Loader: rules that keep it from breaking
- The loader lives in `assets/js/loader.js` and is **inlined** into every page by `scripts/build.py`. It must stay self-contained: no GSAP, no imports, no network requests.
- `main.js` never drives the loader. It only waits for the `eben:loader-done` event (max 6s) before playing the hero intro.
- Three independent fail-safes remove the loader: its own animation loop (finishes by 4s), a timer (5.2s, for background tabs), and a CSS animation (8s, even if every script fails).
- CSS and JS URLs carry a content hash (`style.css?v=…`), so browsers can never mix an old cached script with a new page.
- Before pushing, run `npm test`. GitHub runs the same loader check on every push (`.github/workflows/loader-check.yml`) and marks the commit red if the loader fails on any page, device or slow network.
