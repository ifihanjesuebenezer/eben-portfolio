/* Ifihanjesu Eben — Portfolio interactions
   Requires GSAP + ScrollTrigger + Lenis (loaded from CDN before this file). */
(() => {
  const html = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = () => window.innerWidth < 768;
  const hasGsap = typeof window.gsap !== "undefined";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  if (!hasGsap) { html.classList.add("no-loader"); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Smooth scroll ---------------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else (typeof target === "number" ? window.scrollTo({ top: target, behavior: "smooth" }) : target.scrollIntoView({ behavior: "smooth" }));
  };

  /* ---------------- Text splitting ---------------- */
  function splitWords(el) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
            else { const w = document.createElement("span"); w.className = "word"; w.textContent = part; frag.appendChild(w); }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains("word")) walk(child);
      });
    };
    walk(el);
    return $$(".word", el);
  }
  function splitLines(el) {
    if (el.dataset.splitDone) return $$(".line-inner", el);
    const original = el.innerHTML;
    el.dataset.original = original;
    const words = splitWords(el);
    const lines = [];
    let top = null;
    words.forEach((w) => {
      const t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w.textContent);
    });
    el.innerHTML = lines.map((l) => `<span class="line-mask"><span class="line-inner">${l.join(" ")}</span></span>`).join("");
    el.dataset.splitDone = "1";
    return $$(".line-inner", el);
  }

  /* ---------------- Loader & page transitions ---------------- */
  const loader = $(".loader");
  const transition = $(".transition");
  const firstVisit = (() => { try { return !sessionStorage.getItem("eben-visited"); } catch (e) { return true; } })();
  const cameFromTransition = html.classList.contains("is-entering");

  function intro() {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (cameFromTransition && transition) {
      tl.to(transition, { yPercent: -100, duration: 1, ease: "expo.inOut" }, 0)
        .add(() => { html.classList.remove("is-entering"); gsap.set(transition, { yPercent: 100, y: 0 }); });
    }
    const heroMedia = $(".hero__media, .case-hero__media");
    if (heroMedia) tl.from(heroMedia, { scale: 1.18, duration: 2.2 }, 0.05);
    const nav = $(".nav");
    if (nav) tl.from(nav.children, { yPercent: -120, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.25);
    const marquee = $(".hero__marquee");
    if (marquee) tl.from(marquee, { yPercent: 110, opacity: 0, duration: 1.6 }, 0.3);
    $$("[data-intro]").forEach((el, i) => {
      const lines = splitLines(el);
      tl.from(lines, { yPercent: 110, duration: 1.4, stagger: 0.09 }, 0.3 + i * 0.1);
    });
    $$("[data-intro-fade]").forEach((el) => tl.from(el, { opacity: 0, y: 20, duration: 1.2 }, 0.7));
    return tl;
  }

  function runLoader() {
    if (!loader) return intro();
    if (!firstVisit || reduce || cameFromTransition) { loader.remove(); return intro(); }
    try { sessionStorage.setItem("eben-visited", "1"); } catch (e) {}
    lenis && lenis.stop();
    const count = $(".loader__count", loader);
    const obj = { v: 0 };
    const tl = gsap.timeline();
    tl.from($$(".loader__name span", loader), { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.05 })
      .to(obj, { v: 100, duration: 1.5, ease: "power3.inOut", onUpdate: () => (count.textContent = String(Math.round(obj.v)).padStart(3, "0")) }, 0)
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "+=0.1")
      .add(() => { loader.remove(); lenis && lenis.start(); })
      .add(intro(), "-=0.7");
  }

  // intercept internal links for wipe transition
  $$("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || a.target === "_blank" || /^https?:/.test(href)) return;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || reduce || !transition) return;
      e.preventDefault();
      try { sessionStorage.setItem("eben-transition", "1"); } catch (err) {}
      transition.classList.add("is-active");
      gsap.fromTo(transition, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "expo.inOut", onComplete: () => (window.location.href = a.href) });
    });
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted && transition) { gsap.set(transition, { yPercent: 100 }); html.classList.remove("is-entering"); } });

  // in-page anchors
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const t = $(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    closeMenu();
    scrollTo(t);
  }));

  /* ---------------- Nav ---------------- */
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  function closeMenu() { if (nav && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); toggle && toggle.setAttribute("aria-expanded", "false"); lenis && lenis.start(); } }
  toggle && toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".nav__toggle-text").textContent = open ? "Close" : "Menu";
    open ? lenis && lenis.stop() : lenis && lenis.start();
  });
  $$(".nav__links a").forEach((a) => a.addEventListener("click", () => {
    if (toggle) toggle.querySelector(".nav__toggle-text").textContent = "Menu";
  }));
  let lastY = 0;
  const onScrollNav = (y) => {
    if (!nav || nav.classList.contains("is-open")) return;
    nav.classList.toggle("is-hidden", y > lastY && y > 200);
    nav.classList.toggle("is-solid", y > 60);
    lastY = y;
  };
  if (lenis) lenis.on("scroll", ({ scroll }) => onScrollNav(scroll));
  else window.addEventListener("scroll", () => onScrollNav(window.scrollY), { passive: true });

  /* ---------------- Cursor ---------------- */
  const cursor = $(".cursor");
  if (cursor && fine && !reduce) {
    const label = $(".cursor__label", cursor);
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener("mouseover", (e) => {
      const view = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button, input, textarea, .exp-item");
      cursor.classList.toggle("is-view", !!view);
      cursor.classList.toggle("is-hover", !view && !!link);
      label.textContent = view ? view.dataset.cursor : "";
    });
    document.addEventListener("mouseleave", () => gsap.to(cursor, { opacity: 0, duration: 0.2 }));
    document.addEventListener("mouseenter", () => gsap.to(cursor, { opacity: 1, duration: 0.2 }));
  } else if (cursor) cursor.remove();

  /* ---------------- Magnetic ---------------- */
  if (fine && !reduce) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.35;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ---------------- Marquees (scroll-velocity reactive) ---------------- */
  $$("[data-marquee]").forEach((wrap) => {
    const track = $(".marquee__track", wrap);
    const group = $(".marquee__group", track);
    // make sure the track is at least 2× viewport by cloning groups
    const ensure = () => {
      while (track.scrollWidth < window.innerWidth * 2.2 && track.children.length < 8) track.appendChild(group.cloneNode(true));
      $$(".marquee__group", track).forEach((g, i) => i > 0 && g.setAttribute("aria-hidden", "true"));
    };
    ensure();
    const speed = parseFloat(wrap.dataset.marquee) || 60; // px per second
    let x = 0, dir = wrap.dataset.dir === "right" ? 1 : -1, boost = 0;
    const width = () => group.offsetWidth;
    if (reduce) return;
    gsap.ticker.add((time, delta) => {
      const w = width();
      if (!w) return;
      x += (dir * speed * (1 + boost) * delta) / 1000;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      track.style.transform = `translate3d(${x}px,0,0)`;
      boost *= 0.92;
    });
    const onV = (v) => { boost = Math.min(Math.abs(v) * 0.12, 8); if (wrap.dataset.react === "dir") dir = v < 0 ? 1 : -1; };
    if (lenis) lenis.on("scroll", ({ velocity }) => onV(velocity));
    if (fine && wrap.dataset.hoverSlow !== undefined) {
      wrap.addEventListener("mouseenter", () => gsap.to({}, { duration: 0 }));
    }
    window.addEventListener("resize", ensure);
  });

  /* ---------------- Scroll reveals ---------------- */
  function setupReveals() {
    // headline lines
    $$("[data-split]").forEach((el) => {
      const lines = splitLines(el);
      gsap.from(lines, {
        yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
    // about paragraph: word-by-word ink on scroll
    $$("[data-words]").forEach((el) => {
      const words = splitWords(el);
      gsap.to(words, {
        opacity: 1, ease: "none", stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 55%", scrub: 0.6 },
      });
    });
    // generic fade-up
    $$("[data-reveal]").forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease: "expo.out", delay: parseFloat(el.dataset.delay) || 0, scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    // stagger children
    $$("[data-stagger]").forEach((el) => {
      gsap.from(el.children, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    // image clip reveal
    $$("[data-reveal-img]").forEach((el) => {
      const img = el.querySelector("img");
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 92%" } });
      tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.out" });
      if (img) tl.from(img, { scale: 1.2, duration: 1.4, ease: "expo.out" }, 0);
    });
    // work rows: divider draw + text rise
    $$(".work-item").forEach((row) => {
      gsap.from(row, { "--line": 0, opacity: 0, y: 30, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 92%" } });
    });
    // parallax
    $$("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax);
      gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // hero image drifts and dims as you leave
    const heroMedia = $(".hero__media, .case-hero__media");
    if (heroMedia) {
      gsap.to(heroMedia, { yPercent: 18, ease: "none", scrollTrigger: { trigger: heroMedia.parentElement, start: "top top", end: "bottom top", scrub: true } });
    }
    // kwikish columns: staggered parallax speeds (desktop)
    ScrollTrigger.matchMedia({
      "(min-width: 768px)": () => {
        $$(".g-kwikish__col").forEach((col, i) => {
          const amt = [0, -80, 40, -120][i % 4];
          gsap.to(col, { y: amt, ease: "none", scrollTrigger: { trigger: ".g-kwikish", start: "top bottom", end: "bottom top", scrub: true } });
        });
      },
    });
    // footer headline
    const foot = $(".footer__headline");
    if (foot) {
      const lines = splitLines(foot);
      gsap.from(lines, { yPercent: 110, duration: 1.4, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: foot, start: "top 85%" } });
    }
  }

  /* ---------------- Work list hover preview ---------------- */
  const preview = $(".preview");
  if (preview && fine) {
    const items = $$(".work-item");
    const imgs = $$(".preview__img", preview);
    const xTo = gsap.quickTo(preview, "x", { duration: 0.7, ease: "power3" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.7, ease: "power3" });
    const rTo = gsap.quickTo(preview, "rotation", { duration: 0.8, ease: "power3" });
    let lastX = 0;
    const list = $(".work-list");
    list.addEventListener("mousemove", (e) => {
      const w = preview.offsetWidth, h = preview.offsetHeight;
      xTo(e.clientX - w * 0.5 + 40);
      yTo(e.clientY - h * 0.5);
      rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    });
    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        const key = item.dataset.preview;
        imgs.forEach((im) => im.classList.toggle("is-current", im.dataset.key === key));
        preview.classList.toggle("is-visible", !!key);
      });
    });
    list.addEventListener("mouseleave", () => { preview.classList.remove("is-visible"); rTo(0); });
  }

  /* ---------------- Lightbox ---------------- */
  const tiles = $$(".tile");
  if (tiles.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML = `<button class="lightbox__close" type="button">Close ✕</button>
      <button class="lightbox__nav lightbox__nav--prev" type="button">← Prev</button>
      <button class="lightbox__nav lightbox__nav--next" type="button">Next →</button>
      <span class="lightbox__count"></span><img class="lightbox__img" alt="">`;
    document.body.appendChild(lb);
    const lbImg = $(".lightbox__img", lb), lbCount = $(".lightbox__count", lb);
    let idx = 0, lastFocus = null;
    const show = (i) => {
      idx = (i + tiles.length) % tiles.length;
      const src = tiles[idx].querySelector("img");
      lbImg.classList.remove("is-wide");
      lbImg.src = src.currentSrc || src.src;
      lbImg.alt = src.alt;
      lbImg.onload = () => lbImg.classList.toggle("is-wide", lbImg.naturalWidth / lbImg.naturalHeight > 1.2);
      lbCount.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(tiles.length).padStart(2, "0")}`;
      lb.scrollTop = 0;
    };
    const open = (i) => { lastFocus = document.activeElement; show(i); lb.classList.add("is-open"); lenis && lenis.stop(); document.body.style.overflow = "hidden"; $(".lightbox__close", lb).focus(); };
    const close = () => { lb.classList.remove("is-open"); lenis && lenis.start(); document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
    tiles.forEach((t, i) => {
      t.setAttribute("tabindex", "0");
      t.setAttribute("role", "button");
      t.addEventListener("click", () => open(i));
      t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
    });
    $(".lightbox__close", lb).addEventListener("click", close);
    $(".lightbox__nav--prev", lb).addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
    $(".lightbox__nav--next", lb).addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
    // swipe
    let sx = null;
    lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 60) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ---------------- Footer: glow + Lagos clock ---------------- */
  $$(".footer, .contact").forEach((f) => {
    const glow = $(".footer__glow", f);
    if (glow && fine) {
      const xTo = gsap.quickTo(glow, "left", { duration: 1.2, ease: "power3" });
      const yTo = gsap.quickTo(glow, "top", { duration: 1.2, ease: "power3" });
      f.addEventListener("mousemove", (e) => { const r = f.getBoundingClientRect(); xTo(e.clientX - r.left); yTo(e.clientY - r.top); });
    }
  });
  const clocks = $$("[data-clock]");
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" });
    const tick = () => clocks.forEach((c) => (c.textContent = `Lagos ${fmt.format(new Date())}`));
    tick(); setInterval(tick, 15000);
  }

  /* ---------------- Contact form → email ---------------- */
  const form = $("#contact-form");
  if (form) {
    const status = $(".form__status", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      $$("[required]", form).forEach((f) => {
        const valid = f.value.trim() && (f.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
        f.closest(".field").classList.toggle("is-invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) { status.textContent = "Please fill in the highlighted fields."; return; }
      const d = Object.fromEntries(new FormData(form));
      const body = `${d.message}\n\n— ${d.name}\n${d.email}`;
      window.location.href = `mailto:designedbyeben@gmail.com?subject=${encodeURIComponent(d.subject || "Project enquiry")}&body=${encodeURIComponent(body)}`;
      status.textContent = "Opening your email app…";
    });
    $$("input, textarea", form).forEach((f) => f.addEventListener("input", () => f.closest(".field").classList.remove("is-invalid")));
  }

  /* ---------------- Boot ---------------- */
  // always open pages at the top (or at the #section the link points to)
  const startPosition = () => {
    const target = location.hash && document.querySelector(location.hash);
    if (target) { lenis ? lenis.scrollTo(target, { immediate: true }) : target.scrollIntoView(); }
    else { lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0); }
  };
  window.addEventListener("pageshow", startPosition);
  // some hosts restore the previous scroll position late (after load);
  // keep re-asserting the start position until the visitor scrolls themselves
  let userScrolled = false;
  ["wheel", "touchmove", "keydown", "mousedown"].forEach((ev) => window.addEventListener(ev, () => (userScrolled = true), { once: true, passive: true }));
  const reassert = () => { if (!userScrolled) startPosition(); };
  window.addEventListener("load", reassert);
  [150, 400, 900, 1600].forEach((ms) => setTimeout(reassert, ms));
  const boot = () => {
    startPosition();
    if (reduce) { loader && loader.remove(); html.classList.remove("is-entering"); return; }
    setupReveals();
    runLoader();
    ScrollTrigger.refresh();
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else window.addEventListener("load", boot);
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
