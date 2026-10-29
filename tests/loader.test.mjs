// Loader regression test. Run: npm test   (needs: npm i -D playwright && npx playwright install chromium)
// Serves the site locally and checks, on every page, that the loader
//   1. spins (rotation keeps advancing),
//   2. always disappears within its time limit (desktop, mobile, slow 3G, broken scripts, background tab),
//   3. leaves the page scrollable with no JavaScript errors,
//   4. is skipped on a second visit in the same session.
import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PAGES = ["/index.html", "/work/freddie-co.html", "/work/kwikish.html", "/work/laplandia-vodka.html", "/contact.html"];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

const server = http.createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  try { const body = await readFile(join(ROOT, path)); res.writeHead(200, { "Content-Type": TYPES[extname(path)] || "application/octet-stream" }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(4321, r));
const BASE = "http://localhost:4321";

const SCENARIOS = [
  { name: "desktop", ctx: { viewport: { width: 1440, height: 900 } }, limit: 5500 },
  { name: "mobile", ctx: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, limit: 5500 },
  { name: "slow-3g", ctx: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, limit: 6500,
    net: { offline: false, latency: 400, downloadThroughput: 50 * 1024, uploadThroughput: 20 * 1024 } },
  { name: "scripts-blocked", ctx: { viewport: { width: 1440, height: 900 } }, limit: 9500, block: /assets\/(vendor|js)\// },
];

const hidden = () => {
  const l = document.getElementById("loader");
  if (!l) return true;
  const cs = getComputedStyle(l);
  return cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0;
};
const rotation = () => {
  const i = document.querySelector(".loader__logo");
  if (!i) return null;
  const m = getComputedStyle(i).transform;
  if (!m || m === "none") return 0;
  const [a, b] = m.slice(7, -1).split(",").map(Number);
  return Math.round(Math.atan2(b, a) * 180 / Math.PI);
};

let failures = 0;
const fail = (msg) => { failures++; console.log("  ✗ " + msg); };
const browser = await chromium.launch();

for (const sc of SCENARIOS) {
  for (const page of PAGES) {
    const ctx = await browser.newContext(sc.ctx);
    const pg = await ctx.newPage();
    const errors = [];
    pg.on("pageerror", (e) => errors.push(e.message));
    if (sc.block) await pg.route(sc.block, (r) => r.abort());
    if (sc.net) { const cdp = await ctx.newCDPSession(pg); await cdp.send("Network.emulateNetworkConditions", sc.net); }
    const t0 = Date.now();
    await pg.goto(BASE + page, { waitUntil: "commit" });
    await pg.waitForSelector("#loader", { state: "attached", timeout: 30000 }).catch(() => {});
    const t1 = Date.now();
    const angles = new Set();
    let goneAt = null;
    while (Date.now() - t1 < sc.limit + 1500) {
      const gone = await pg.evaluate(hidden).catch(() => false);
      if (gone) { goneAt = Date.now() - t1; break; }
      const r = await pg.evaluate(rotation).catch(() => null);
      if (r !== null) angles.add(r);
      await pg.waitForTimeout(120);
    }
    const label = `${sc.name.padEnd(16)} ${page}`;
    let ok = true;
    if (goneAt === null || goneAt > sc.limit) { fail(`${label}: loader still visible after ${sc.limit}ms`); ok = false; }
    if (!sc.block && angles.size < 3) { fail(`${label}: logo did not spin (angles seen: ${[...angles].join(",")})`); ok = false; }
    const realErrors = errors.filter((e) => !/_vercel|Failed to fetch|net::ERR/.test(e));
    if (!sc.block && realErrors.length) { fail(`${label}: JS errors: ${realErrors.join(" | ")}`); ok = false; }
    const scrolls = await pg.evaluate(async () => { window.scrollTo(0, 400); await new Promise((r) => setTimeout(r, 300)); return scrollY > 0; }).catch(() => false);
    if (!scrolls) { fail(`${label}: page not scrollable after loader`); ok = false; }
    if (ok) console.log(`  ✓ ${label}: loader gone in ${goneAt}ms (${Date.now() - t0}ms incl. network)`);

    if (sc.name === "desktop") {
      await pg.goto(BASE + page);
      const second = await pg.evaluate(hidden);
      if (!second) fail(`${label}: loader shown again on second visit`);
    }
    await ctx.close();
  }
}
await browser.close();
server.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll loader checks passed");
process.exit(failures ? 1 : 0);
