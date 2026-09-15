/**
 * SEO guardrails, run against a served build (npm run start).
 *
 * Enforces the checks from docs/seo/02-internal-linking.md and 03:
 *   1. Orphans: every sitemap URL is reachable via rendered <a> links from /.
 *   2. No internal link returns 404 or a redirect.
 *   3. No banned anchor text ("click here", "learn more", "read more", "here").
 *   4. Every sitemap <loc> is on the canonical host and returns 200.
 *   5. Every crawled page has a self-referencing canonical.
 *   6. Every @id referenced in JSON-LD resolves to a node defined somewhere
 *      in the site's combined graph (dangling refs fail silently otherwise).
 *
 * Usage: BASE_URL=http://localhost:3000 node scripts/seo-checks.mjs
 * The site's declared host (NEXT_PUBLIC_SITE_URL) is rewritten to BASE_URL
 * when fetching, so the script works against localhost and previews alike.
 */

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.scholarsoppfund.com").replace(/\/$/, "");

const BANNED_ANCHORS = new Set(["click here", "learn more", "read more", "here"]);

const failures = [];
const fail = (msg) => failures.push(msg);

const toLocal = (url) => url.replace(SITE_URL, BASE_URL);
const toPath = (url) =>
  url.startsWith(BASE_URL) ? url.slice(BASE_URL.length) || "/" :
  url.startsWith(SITE_URL) ? url.slice(SITE_URL.length) || "/" : url;

async function fetchPage(path) {
  const res = await fetch(`${BASE_URL}${path === "/" ? "" : path}`, { redirect: "manual" });
  return { status: res.status, html: res.status === 200 ? await res.text() : "" };
}

function extractLinks(html) {
  const links = [];
  const re = /<a\s([^>]*?)>(.*?)<\/a>/gis;
  for (const m of html.matchAll(re)) {
    const hrefMatch = m[1].match(/href="([^"]*)"/i);
    if (!hrefMatch) continue;
    const text = m[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    links.push({ href: hrefMatch[1], text });
  }
  return links;
}

function isInternal(href) {
  return (
    (href.startsWith("/") && !href.startsWith("//")) ||
    href.startsWith(SITE_URL) ||
    href.startsWith(BASE_URL)
  );
}

async function main() {
  // ── Sitemap: canonical host, all 200 ──
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  if (sitemapRes.status !== 200) {
    fail(`sitemap.xml returned ${sitemapRes.status}`);
    report();
    return;
  }
  const sitemapXml = await sitemapRes.text();
  const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  for (const url of sitemapUrls) {
    if (!url.startsWith(SITE_URL)) {
      fail(`sitemap <loc> not on canonical host: ${url}`);
      continue;
    }
    const res = await fetch(toLocal(url), { redirect: "manual" });
    if (res.status !== 200) fail(`sitemap entry ${toPath(url)} returned ${res.status} (must be 200, no redirect)`);
  }

  // ── Crawl the rendered link graph from / ──
  const visited = new Map(); // path -> { links }
  const queue = ["/"];
  while (queue.length > 0) {
    const path = queue.shift();
    if (visited.has(path)) continue;
    const { status, html } = await fetchPage(path);
    const links = status === 200 ? extractLinks(html) : [];
    visited.set(path, { status, html, links });
    for (const link of links) {
      if (!isInternal(link.href)) continue;
      const target = toPath(link.href).split("#")[0].split("?")[0];
      if (target && !visited.has(target) && !queue.includes(target)) queue.push(target);
    }
  }

  // ── Orphans: every sitemap URL reachable in the crawl ──
  for (const url of sitemapUrls) {
    const path = toPath(url);
    if (!visited.has(path)) {
      fail(`orphan: ${path} is in the sitemap but unreachable via rendered links from /`);
    }
  }

  // ── Internal link health + anchor text ──
  for (const [path, page] of visited) {
    if (page.status !== 200) continue;
    for (const link of page.links) {
      if (!isInternal(link.href)) continue;
      const target = toPath(link.href).split("#")[0].split("?")[0];
      if (!target) continue;
      const targetPage = visited.get(target);
      if (targetPage && targetPage.status !== 200) {
        fail(`${path}: internal link to ${target} returns ${targetPage.status}`);
      }
      const anchor = link.text.toLowerCase();
      if (BANNED_ANCHORS.has(anchor)) {
        fail(`${path}: banned anchor text "${link.text}" (link to ${target})`);
      }
    }
  }

  // ── Canonicals: present and self-referencing on crawled 200 pages ──
  for (const [path, page] of visited) {
    if (page.status !== 200) continue;
    if (path.startsWith("/opengraph-image") || path.startsWith("/twitter-image")) continue;
    const m = page.html.match(/<link rel="canonical" href="([^"]+)"/);
    if (!m) {
      fail(`${path}: no canonical tag`);
      continue;
    }
    const expected = `${SITE_URL}${path === "/" ? "" : path}`;
    if (m[1] !== expected && m[1] !== `${expected}/` && m[1] !== SITE_URL + "/") {
      if (!(path === "/" && m[1] === SITE_URL)) {
        fail(`${path}: canonical is ${m[1]}, expected ${expected}`);
      }
    }
  }

  // ── JSON-LD: no dangling @id references across the combined graph ──
  const definedIds = new Set();
  const referencedIds = new Map(); // id -> first page referencing it
  for (const [path, page] of visited) {
    if (page.status !== 200) continue;
    const blocks = [...page.html.matchAll(
      /<script type="application\/ld\+json">(.*?)<\/script>/gs
    )];
    for (const b of blocks) {
      let data;
      try {
        data = JSON.parse(b[1]);
      } catch {
        fail(`${path}: JSON-LD block does not parse`);
        continue;
      }
      const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (node === null || typeof node !== "object") return;
        const keys = Object.keys(node);
        if (node["@id"]) {
          if (keys.length === 1) {
            if (!referencedIds.has(node["@id"])) referencedIds.set(node["@id"], path);
          } else {
            definedIds.add(node["@id"]);
          }
        }
        keys.forEach((k) => walk(node[k]));
      };
      walk(data);
    }
  }
  for (const [id, path] of referencedIds) {
    if (!definedIds.has(id)) {
      fail(`dangling JSON-LD @id reference ${id} (first seen on ${path}); no node defines it`);
    }
  }

  report(sitemapUrls.length, visited.size);
}

function report(sitemapCount = 0, crawledCount = 0) {
  if (failures.length > 0) {
    console.error(`SEO checks FAILED (${failures.length}):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(
    `SEO checks passed: ${sitemapCount} sitemap URLs verified, ${crawledCount} pages crawled, no orphans, no broken or banned links, canonicals and JSON-LD consistent.`
  );
}

main().catch((err) => {
  console.error("SEO checks crashed:", err);
  process.exit(1);
});
