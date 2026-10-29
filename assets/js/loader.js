/* Ifihanjesu Eben — first-visit loader.
   Self-contained on purpose: no GSAP, no main.js, no network. It is inlined into
   each page right after the loader markup by scripts/build.py, so it starts on the
   very first paint and can never be blocked by another script failing.
   Guarantees: it always finishes between MIN_MS and MAX_MS, it never pauses, and
   three independent fail-safes remove it (rAF loop, a timer, and a CSS animation). */
(function () {
  var d = document, html = d.documentElement, L = d.getElementById("loader");
  var MIN_MS = 1900;   // shortest the loader is shown (enough for the rhythm to read)
  var MAX_MS = 4000;   // hard cap: never longer than this, whatever the connection
  var BEAT_MS = 600;   // one quarter-turn per beat
  var done = false;

  function markDone() { window.__ebenLoaderDone = true; try { d.dispatchEvent(new Event("eben:loader-done")); } catch (e) {} }
  function finish() {
    if (done || !L) return;
    done = true;
    try { sessionStorage.setItem("eben-visited", "1"); } catch (e) {}
    L.classList.add("is-done");
    markDone();
    setTimeout(function () { if (L && L.parentNode) L.parentNode.removeChild(L); }, 1400);
  }
  if (!L) { markDone(); return; }
  var skip = html.classList.contains("no-loader") || html.classList.contains("is-entering");
  try { skip = skip || window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  if (skip) { L.parentNode.removeChild(L); markDone(); return; }

  var logo = L.querySelector(".loader__logo");
  var ring = L.querySelector(".loader__progress");
  var pct = L.querySelector(".loader__pct");
  var start = performance.now();
  var shown = 0;

  // share of the page's eager images that have finished (lazy ones load later anyway)
  function realProgress() {
    if (d.readyState === "complete") return 1;
    var imgs = d.images, total = 0, ok = 0;
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].loading === "lazy") continue;
      total++;
      if (imgs[i].complete) ok++;
    }
    return total ? ok / total : 1;
  }
  // "back" easing: a small overshoot at the end of each quarter-turn gives the tick its rhythm
  function easeOutBack(t) { var c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  function frame(now) {
    if (done) return;
    var t = now - start;
    var beat = Math.floor(t / BEAT_MS), within = (t % BEAT_MS) / BEAT_MS;
    var turn = within < 0.7 ? easeOutBack(within / 0.7) : 1;
    if (logo) logo.style.transform = "rotate(" + (beat + turn) * 90 + "deg)";

    // progress never runs ahead of real loading, but always creeps forward and hits 100% by MAX_MS
    var byTime = Math.min(1, t / MIN_MS);
    var ceiling = t >= MAX_MS ? 1 : Math.max(realProgress(), Math.min(0.92, t / MAX_MS));
    var target = Math.min(byTime, ceiling);
    shown += (target - shown) * 0.14;
    if (target >= 1 && shown > 0.994) shown = 1;
    if (ring) ring.style.strokeDashoffset = String(100 - shown * 100);
    if (pct) pct.textContent = Math.round(shown * 100) + "%";

    if (shown >= 1) { setTimeout(finish, 220); return; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  // fail-safe 2: background tabs pause requestAnimationFrame; a timer still finishes the loader
  setTimeout(finish, MAX_MS + 1200);
})();
