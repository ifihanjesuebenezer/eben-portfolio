# Ifihanjesu Eben — Portfolio

Static site (HTML/CSS/JS, no build step) with GSAP + ScrollTrigger + Lenis motion, deployed on Vercel.

- Pages are generated from `scripts/build.py` — edit content there, then run `python3 scripts/build.py`.
- Social links live in the `SOCIAL` dict at the top of `scripts/build.py`.
- Fonts: the design uses Acid Grotesk and Neue Montreal (licensed). The site uses them if installed locally and otherwise falls back to Schibsted Grotesk / Inter, which ship in `assets/fonts/`. Add licensed `.woff2` files there and reference them in `assets/css/style.css` to use the real typefaces for every visitor.
