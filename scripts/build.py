#!/usr/bin/env python3
"""Generates the static HTML pages from shared partials.
Run:  python3 scripts/build.py   (outputs index.html, contact.html, work/*.html)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SOCIAL = {
    "linkedin": "https://www.linkedin.com/in/ifihanjesu-ebenezer-b473b716b/",
    "twitter": "https://x.com/ebenunlimited",
    "instagram": "https://www.instagram.com/eben_unlimited/",
}

GSAP = "assets/vendor/gsap.min.js"
ST = "assets/vendor/ScrollTrigger.min.js"
LENIS = "assets/vendor/lenis.min.js"
WEB3FORMS_KEY = "5aaf31ed-c1ff-4d60-81c3-8690c062d927"  # Web3Forms public access key (safe to expose)
FIGMA_PORTFOLIO = "https://www.figma.com/design/Sp9hHC3WiIq77BEGOhXxiL/Eben-s-Portfolio-Site?node-id=0-1"


def roll(text):
    return f'<span class="roll"><span>{text}</span><span aria-hidden="true">{text}</span></span>'


def head(title, desc, p, dark=False):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#161616">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="/assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{p}assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="{p}assets/img/apple-touch-icon.png">
<link rel="preload" href="{p}assets/fonts/schibsted-grotesk-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{p}assets/css/style.css">
<script>
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  try {{
    if (sessionStorage.getItem('eben-transition')) {{ document.documentElement.classList.add('is-entering'); sessionStorage.removeItem('eben-transition'); }}
    if (sessionStorage.getItem('eben-visited')) document.documentElement.classList.add('no-loader');
  }} catch (e) {{}}
</script>
</head>
<body{' class="is-dark"' if dark else ''}>
<div class="loader" aria-hidden="true">
  <div class="loader__name">{''.join(f'<span>{c if c != " " else "&nbsp;"}</span>' for c in "Ifihanjesu Eben.")}</div>
  <div class="loader__count">000</div>
</div>
<div class="transition" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div>
"""


def nav(p, home=False):
    about = "#about" if home else f"{p}index.html#about"
    work = "#work" if home else f"{p}index.html#work"
    return f"""<header class="nav">
  <a href="{p}index.html" class="nav__brand" aria-label="Ifihanjesu Eben — home">{roll("Ifihanjesu Eben.")}</a>
  <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-links"><span class="nav__toggle-text">Menu</span><i aria-hidden="true"></i></button>
  <nav class="nav__links" id="nav-links" aria-label="Main">
    <a href="{about}">{roll("About")}</a>
    <a href="{work}">{roll("Work")}</a>
    <a href="{p}contact.html">{roll("Contact")}</a>
  </nav>
</header>
"""


def socials():
    return f"""<div class="socials">
      <a href="{SOCIAL['linkedin']}" target="_blank" rel="noopener">{roll("Linkedin")}</a>
      <a href="{SOCIAL['twitter']}" target="_blank" rel="noopener">{roll("Twitter")}</a>
      <a href="{SOCIAL['instagram']}" target="_blank" rel="noopener">{roll("Instagram")}</a>
    </div>"""


def footer_bottom():
    return f"""<div class="footer__bottom">
    <p class="footer__credit">Build with 💖 by Eben.</p>
    {socials()}
    <p class="footer__time" data-clock></p>
  </div>"""


def footer(p):
    return f"""<footer class="footer" id="contact">
  <div class="footer__glow" aria-hidden="true"></div>
  <img class="footer__logo" src="{p}assets/img/logo.webp" alt="Eben logo" width="481" height="481" loading="lazy" decoding="async">
  <h2 class="footer__headline">Eben is working with brands all over the globe.</h2>
  <div class="footer__cta" data-reveal><a class="pill" href="{p}contact.html" data-magnetic="0.4">{roll("Get in touch")}</a></div>
  {footer_bottom()}
</footer>
"""


def scripts(p):
    return f"""<script src="{p}{GSAP}" defer></script>
<script src="{p}{ST}" defer></script>
<script src="{p}{LENIS}" defer></script>
<script src="{p}assets/js/main.js" defer></script>
</body>
</html>
"""


def img(src, alt, p, eager=False, extra=""):
    loading = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    return f'<img src="{p}assets/img/{src}" alt="{alt}" {loading} {extra}>'


# --------------------------------------------------------------------------
# Landing page
# --------------------------------------------------------------------------
WORK = [
    dict(title="Freddie Co.", tags="Brand Design / Email Design / Static Ads", href="work/freddie-co.html", preview="hover-freddie.webp", arrow="arrow-a.svg"),
    dict(title="Kwikish", tags="Brand Design / Email Design / Static Ads", href="work/kwikish.html", preview="hover-kwikish.webp", arrow="arrow-a.svg"),
    dict(title="Pulse/Makina", tags="Brand Design / Social Media / Editorial / Email Design", href=None, preview="hover-pulse.webp", arrow="arrow-a.svg", soon=True),
    dict(title="Laplandia Vodka", tags="Brand Design / Static Ads / Editorial", href="work/laplandia-vodka.html", preview="hover-laplandia.webp", arrow="arrow-a.svg"),
    dict(title="Other Ads Design", tags=None, href="https://www.figma.com/design/Sp9hHC3WiIq77BEGOhXxiL/Eben-s-Portfolio-Site?node-id=0-1", preview=None, arrow="arrow-a.svg", external=True),
    dict(title="Other Email Marketing Projects", tags=None, href="https://www.figma.com/design/Sp9hHC3WiIq77BEGOhXxiL/Eben-s-Portfolio-Site?node-id=0-1", preview=None, arrow="arrow-a.svg", external=True),
]

EXPERIENCE = [
    ("Swayleo Marketing", "2026", "Email & Ads Design Partner"),
    ("Studio Scopus", "2026", "Design Partner"),
    ("Pulse/Makina", "2025", "Brand Designer"),
    ("Freddie Co", "2024", "Graphic Designer"),
    ("Tention Marketing", "2024", "Retention Marketing Designer"),
]


def work_item(w, p):
    key = w["preview"].split(".")[0] if w["preview"] else ""
    badge = '<span class="work-item__badge">Coming soon</span>' if w.get("soon") else ""
    tags = f'<span class="work-item__tags">{w["tags"]}</span>' if w["tags"] else ""
    thumb = f'<span class="work-item__thumb">{img(w["preview"], "", p)}</span>' if w["preview"] else ""
    inner = f"""<span class="work-item__text">
          <span class="work-item__title">{w["title"]}{badge}</span>
          {tags}
          {thumb}
        </span>
        <span class="work-item__arrow" aria-hidden="true">
          <img class="is-default" src="{p}assets/img/arrow-a.svg" alt="">
          <img class="is-active" src="{p}assets/img/arrow-b.svg" alt="">
        </span>"""
    cls = "work-item is-soon" if w.get("soon") else "work-item"
    attr = f' data-preview="{key}"' if key else ""
    if w.get("external"):
        return f'<li class="{cls}"{attr}><a class="work-item__link" href="{w["href"]}" target="_blank" rel="noopener">{inner}<span class="sr-only"> (opens Figma in a new tab)</span></a></li>'
    if w["href"]:
        return f'<li class="{cls}"{attr}><a class="work-item__link" href="{p}{w["href"]}">{inner}</a></li>'
    return f'<li class="{cls}"{attr}><div class="work-item__link" aria-disabled="true">{inner}</div></li>'


def index():
    p = ""
    items = "\n      ".join(work_item(w, p) for w in WORK)
    previews = "\n  ".join(
        f'<div class="preview__img" data-key="{w["preview"].split(".")[0]}">{img(w["preview"], "", p)}'
        + ('<span class="preview__tag">Coming Soon</span>' if w.get("soon") else "")
        + "</div>"
        for w in WORK if w["preview"]
    )
    exp = "\n        ".join(
        f"""<li class="exp-item"><div class="exp-item__head"><span class="exp-item__co">{c}</span><span class="exp-item__yr">{y}</span></div><p class="exp-item__role">{r}</p></li>"""
        for c, y, r in EXPERIENCE
    )
    roles = '<span>/</span><span>Email Designer</span><span>/</span><span>Brand Designer</span><span>/</span><span>Art Director</span>'
    strip = [
        ("strip-2.webp", "Kwikish email design on a laptop", "center 55%"),
        ("strip-3.webp", "Team in Makina \u201cRewrite your longevity\u201d t-shirts", "center center"),
        ("strip-4.webp", "Design work in progress on a laptop", "center 55%"),
        ("strip-5.webp", "Eben at dinner", "center 40%"),
    ]
    strip_cards = "".join(f'<div class="strip__card">{img(s, a, p, extra=f"style=\"object-position:{pos}\"")}</div>' for s, a, pos in strip)
    body = f"""{head("Ifihanjesu Eben — Brand, Email & Art Direction", "Ifihanjesu Eben is a multidisciplinary designer specialising in brand design, art direction, social presence, lifecycle and email marketing design.", p)}
{nav(p, home=True)}
<main>
  <section class="hero" aria-label="Intro">
    <div class="hero__media">{img("hero.webp", "Portrait of Eben", p, eager=True)}</div>
    <h1 class="sr-only">Ifihanjesu Eben — Email Designer, Brand Designer, Art Director</h1>
    <div class="hero__marquee" data-marquee="70" data-react="dir" aria-hidden="true">
      <div class="marquee__track"><div class="marquee__group">{roles}</div></div>
    </div>
  </section>

  <section class="about" id="about">
    <div class="row">
      <h2 class="label" data-reveal>About</h2>
      <div class="row__body about__text" data-words>
        <p>Hello! I’m Eben.</p>
        <p>A multidisciplinary designer shaping how brands look, feel, and connect with people. I specialise in brand design, art direction, social presence design, lifecycle design, and email marketing, creating thoughtful visual experiences that bridge creativity with commercial impact.</p>
        <p>From shaping a brand’s visual presence to crafting email experiences that drive engagement and retention, my work brings together strategy, aesthetics, and functionality to build brands that stand out, connect, and grow.</p>
      </div>
    </div>
  </section>

  <section class="work dark" id="work">
    <div class="work__bg" data-parallax="0.06" aria-hidden="true">{img("work-bg.webp", "", p)}</div>
    <div class="row">
      <h2 class="label" data-reveal>Work</h2>
      <ul class="row__body work-list">
      {items}
      </ul>
    </div>
  </section>

  <section class="experience" id="experience">
    <div class="row"><h2 class="label" data-reveal>Experience</h2></div>
    <div class="experience__grid">
      <div class="experience__photo" data-reveal-img>{img("about-portrait.webp", "Eben in a brown suit", p)}</div>
      <ul class="exp-list" data-stagger>
        {exp}
      </ul>
    </div>
  </section>

  <section class="strip" aria-label="Gallery" data-marquee="40" data-dir="right">
    <div class="marquee__track"><div class="marquee__group">{strip_cards}</div></div>
  </section>
</main>
{footer(p)}
<div class="preview" aria-hidden="true">
  {previews}
</div>
{scripts(p)}"""
    (ROOT / "index.html").write_text(body)


# --------------------------------------------------------------------------
# Case studies
# --------------------------------------------------------------------------
def tile(src, alt, p, style=""):
    s = f' style="{style}"' if style else ""
    return f'<div class="tile" data-cursor="View" data-reveal-img{s}>{img(src, alt, p)}</div>'


def natural_ar(src):
    from PIL import Image
    w, h = Image.open(ROOT / "assets" / "img" / src).size
    return f"{w}/{h}"


def balance(items, ncols):
    """Distribute (src, alt) items into columns of roughly equal height, keeping order within a column."""
    from PIL import Image
    cols = [[] for _ in range(ncols)]
    heights = [0.0] * ncols
    for src, alt in items:
        w, h = Image.open(ROOT / "assets" / "img" / src).size
        i = heights.index(min(heights))
        cols[i].append((src, alt))
        heights[i] += h / w
    return cols


def masonry(cols, p, extra_cls=""):
    """Full, uncropped images in floating columns (each column drifts at its own speed on scroll)."""
    html = "".join(
        '<div class="g-masonry__col">' + "".join(tile(src, alt, p, f"aspect-ratio:{natural_ar(src)}") for src, alt in col) + "</div>"
        for col in cols
    )
    return f'<div class="g-masonry {extra_cls}">{html}</div>'


def case_page(slug, name, services, year_role, gallery_html, next_slug, next_name, more_href, hero="hero.webp", hero_pos=None):
    p = "../"
    body = f"""{head(f"{name} — Ifihanjesu Eben", f"{name}: {services}. Case study by Ifihanjesu Eben.", p)}
{nav(p)}
<main>
  <section class="case-hero">
    <div class="case-hero__media">{img(hero, "", p, eager=True, extra=(f'style="object-position:{hero_pos}"' if hero_pos else ""))}</div>
    <h1 class="case-hero__title" data-intro>{name}</h1>
  </section>
  <section class="case-services"><p class="label" data-reveal>Services: <span class="sep"></span>{services}</p></section>
  <section class="gallery" aria-label="{name} work">
    {gallery_html}
  </section>
  <div class="case-more"><a class="pill pill--navy" href="{FIGMA_PORTFOLIO}" target="_blank" rel="noopener" data-magnetic="0.4">{roll("View More")}<span class="sr-only"> (opens Figma in a new tab)</span></a></div>
  <a class="next-case" href="{p}work/{next_slug}.html">
    <span class="next-case__label">Next project</span>
    <span class="next-case__title">{next_name} <img src="{p}assets/img/arrow-a.svg" alt=""></span>
  </a>
</main>
{footer(p)}
{scripts(p)}"""
    (ROOT / "work").mkdir(exist_ok=True)
    (ROOT / "work" / f"{slug}.html").write_text(body)


def freddie():
    p = "../"
    slides = "".join(tile(f"fc-slide-{i}.webp", f"Freddie Co. brand slide {i}", p) for i in [1, 2, 3, 4, 5, 6])
    emails = [(f"fc-email-{i}.webp", f"Freddie Co. email design {i}") for i in range(1, 9)]
    g = f'<div class="g-freddie__slides">{slides}</div>\n    {masonry(balance(emails, 4), p, "g-masonry--spaced")}'
    case_page("freddie-co", "Freddie Co", "Brand Design / Email Design / Static Ads", "Graphic Designer — 2024", g, "kwikish", "Kwikish", "work/kwikish.html", hero="fc-hero.webp", hero_pos="center 42%")


def kwikish():
    p = "../"
    cols = [
        ["kw-19may.webp", "kw-welcome-3b.webp"],
        ["kw-9june.webp", "kw-promo-orange.webp", "kw-promo-green.webp", "kw-12may.webp"],
        ["kw-welcome-3.webp", "kw-8july.webp"],
        ["kw-thursday.webp", "kw-22may.webp"],
    ]
    n = 0
    named = []
    for c in cols:
        col = []
        for src in c:
            n += 1
            col.append((src, f"Kwikish email and ad design {n}"))
        named.append(col)
    g = masonry(named, p)
    case_page("kwikish", "Kwikish", "Brand Design / Email Design / Static Ads", "Brand &amp; Email Design", g, "laplandia-vodka", "Laplandia Vodka", "work/laplandia-vodka.html")


def laplandia():
    p = "../"
    order = [
        ("lp-howdoyou.webp", "How do you like your vodka"), ("lp-halloween.webp", "Halloween"), ("lp-christmas.webp", "Christmas"),
        ("lp-insta-1.webp", "Instagram post"), ("lp-bilberry-2.webp", "Mini Bilberry"), ("lp-bottle-2.webp", "What's in the bottle"),
        ("lp-insta-2.webp", "Instagram post"), ("lp-bilberry-3.webp", "Mini Bilberry"), ("lp-bottle-3.webp", "What's in the bottle"),
        ("lp-insta-3.webp", "Instagram post"), ("lp-bilberry-4.webp", "Mini Bilberry"), ("lp-bottle-4.webp", "What's in the bottle"),
    ]
    g = '<div class="g-laplandia">' + "".join(tile(s, f"Laplandia Vodka — {a}", p, f"aspect-ratio:{natural_ar(s)}") for s, a in order) + "</div>"
    case_page("laplandia-vodka", "Laplandia Vodka", "Brand Design / Static Ads / Editorial", "Brand Design — Static Ads", g, "freddie-co", "Freddie Co", "contact.html", hero="lp-hero.webp", hero_pos="center 45%")


# --------------------------------------------------------------------------
# Contact
# --------------------------------------------------------------------------
def contact():
    p = ""
    portrait = f'<div class="contact__portrait" data-reveal-img>{img("contact-portrait.webp", "Portrait of Eben", p, eager=True)}</div>'
    body = f"""{head("Contact — Ifihanjesu Eben", "Get in touch with Ifihanjesu Eben for brand design, email design and art direction work.", p, dark=True)}
{nav(p)}
<main class="contact dark">
  <div class="footer__glow" aria-hidden="true"></div>
  <div class="contact__grid">
    <div class="contact__left">
      {portrait}
      <div class="contact__details">
        <div class="contact__group" data-reveal>
          <p class="contact__small">Contact Details</p>
          <div class="contact__big">
            <a href="mailto:designedbyeben@gmail.com">designedbyeben@gmail.com</a>
            <a href="tel:+2349034549154">+234 (0) 9034549154</a>
          </div>
        </div>
        <div class="contact__group" data-reveal data-delay="0.1">
          <p class="contact__small">Social</p>
          <div class="contact__big">
            <a href="{SOCIAL['linkedin']}" target="_blank" rel="noopener">Linkedin</a>
            <a href="{SOCIAL['instagram']}" target="_blank" rel="noopener">Instagram</a>
            <a href="{SOCIAL['twitter']}" target="_blank" rel="noopener">X</a>
          </div>
        </div>
      </div>
    </div>
    <div class="contact__right">
      <div class="contact__portrait contact__portrait-m">{img("contact-portrait.webp", "", p)}</div>
      <h1 class="contact__title" data-intro>Let’s build something cool</h1>
      <form class="form" id="contact-form" novalidate data-stagger data-form-key="{WEB3FORMS_KEY}">
        <input type="checkbox" name="botcheck" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" type="text" autocomplete="name" placeholder="Your name" required></div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" placeholder="you@brand.com" required></div>
        <div class="field"><label for="f-subject">Subject</label><input id="f-subject" name="subject" type="text" placeholder="For brand design work enquiry"></div>
        <div class="field"><label for="f-message">Message</label><textarea id="f-message" name="message" rows="4" placeholder="Type your Message" required></textarea></div>
        <div class="form__actions"><button class="pill" type="submit" data-magnetic="0.4">{roll("Send Message")}</button><p class="form__status" aria-live="polite"></p></div>
      </form>
    </div>
  </div>
  {footer_bottom()}
</main>
{scripts(p)}"""
    (ROOT / "contact.html").write_text(body)


if __name__ == "__main__":
    index(); freddie(); kwikish(); laplandia(); contact()
    print("built")
