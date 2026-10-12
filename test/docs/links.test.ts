// @vitest-environment node
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Internal links over the built site, in both languages: every same-site `href`, from a header
 * link to an "On this page" anchor, must lead to a page the build wrote, and every `#fragment`
 * to an element with that id on the target page. The site is built into a temporary folder, the
 * way `astro build` builds it for hosting, redirect pages included.
 */
const root = fileURLToPath(new URL("../..", import.meta.url));
let outDir: string;
let pages: Map<string, string>;

/** Every HTML file under `dir`, by the URL path it serves: `docs/index.html` → `/docs`. */
function htmlFiles(dir: string, base = dir): [string, string][] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path, base);
    if (!name.endsWith(".html")) return [];
    const url = `/${relative(base, path).replace(/\\/g, "/")}`
      .replace(/index\.html$/, "")
      .replace(/\.html$/, "")
      .replace(/(.)\/$/, "$1");
    return [[url, readFileSync(path, "utf8")]];
  });
}

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), "buril-links-"));
  // Built by the Astro CLI in its own process, as `pnpm build` does, without Vitest's settings.
  const env = { ...process.env };
  delete env.VITEST;
  execFileSync(
    process.execPath,
    [join(root, "node_modules/astro/bin/astro.mjs"), "build", "--outDir", outDir, "--silent"],
    { cwd: root, env, stdio: "pipe" },
  );
  pages = new Map(htmlFiles(outDir));
}, 180_000);

afterAll(() => {
  if (outDir) rmSync(outDir, { recursive: true, force: true });
});

/** The id attributes of a page. */
const ids = (html: string) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id!));

/** Same-site links in a page: `<a href>` and the alternate-language `<link href>`. */
function links(html: string) {
  return [
    ...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g),
    ...html.matchAll(/<link\b[^>]*rel="alternate"[^>]*\shref="([^"]*)"/g),
  ]
    .map(([, href]) => href!.replace(/&amp;/g, "&"))
    .filter((href) => !/^[a-z][\w+.-]*:/i.test(href));
}

/** Whether the build wrote something at this path: a page, or a file such as /r/button.json. */
function exists(path: string) {
  if (pages.has(path)) return true;
  const file = join(outDir, decodeURIComponent(path));
  return existsSync(file) && statSync(file).isFile();
}

describe("internal links in the built site", () => {
  it("builds both languages", () => {
    const urls = [...pages.keys()];
    expect(urls).toEqual(expect.arrayContaining(["/", "/es", "/docs", "/es/docs"]));
    expect(urls.filter((url) => url.startsWith("/es")).length).toBeGreaterThan(30);
  });

  it("lead to pages and files that exist, and to ids that exist on them", () => {
    const broken: string[] = [];
    for (const [page, html] of pages) {
      for (const href of links(html)) {
        const url = new URL(href, `http://site${page === "/" ? "/" : `${page}/`}`);
        if (href.startsWith("#")) url.pathname = page;
        const path = url.pathname.replace(/(.)\/$/, "$1");
        if (!exists(path)) {
          broken.push(`${page} → ${href} (no page)`);
          continue;
        }
        const fragment = decodeURIComponent(url.hash.slice(1));
        if (fragment && !ids(pages.get(path) ?? "").has(fragment)) {
          broken.push(`${page} → ${href} (no #${fragment})`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it("checks a meaningful number of links", () => {
    const count = [...pages.values()].reduce((sum, html) => sum + links(html).length, 0);
    expect(count).toBeGreaterThan(2000);
  });
});
