// @vitest-environment node
import { execFileSync } from "node:child_process";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import ChangelogPage from "../../src/pages/docs/changelog.astro";
import ChangelogPageEs from "../../src/pages/es/docs/changelog.astro";
import FaqPage from "../../src/pages/docs/faq.astro";
import FaqPageEs from "../../src/pages/es/docs/faq.astro";
import { changelog } from "../../src/data/changelog";
import { docsNav } from "../../src/data/docs-nav";
import { faq } from "../../src/data/faq";
import { localizedHref } from "../../src/i18n/paths";
import { locales } from "../../src/i18n/ui";

/**
 * The FAQ and the Changelog. FAQ answers and changelog entries live in data files, in English and
 * Spanish. Every feature merged into the first-parent history has a changelog entry, so the page
 * cannot fall behind the repository.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const plain = (value: string) => value.replace(/`/g, "");
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];
const headings = (html: string, level: 2 | 3) =>
  [...main(html).matchAll(new RegExp(`<h${level}[^>]*>([\\s\\S]*?)</h${level}>`, "g"))].map(
    ([, inner]) => text(inner!),
  );

describe("FAQ data", () => {
  it("answers the questions people ask, in both languages", () => {
    expect(faq.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "no-aschild",
        "native-elements",
        "cn-package",
        "opt-in-theme",
        "button-keyframes",
        "browser-support",
      ]),
    );
    for (const item of faq)
      for (const locale of locales) {
        expect(item.question[locale].trim()).not.toBe("");
        expect(item.answer[locale].length, `${item.id} ${locale}`).toBeGreaterThan(0);
      }
  });

  it("states the browsers Tailwind CSS v4 targets", () => {
    const answer = faq.find(({ id }) => id === "browser-support")!.answer.en.join(" ");
    expect(answer).toContain("Chrome 111");
    expect(answer).toContain("Safari 16.4");
    expect(answer).toContain("Firefox 128");
  });
});

/** Branch names of the features merged into the first-parent history, newest first. */
function mergedFeatures() {
  const subjects = execFileSync(
    "git",
    ["log", "--merges", "--first-parent", "--format=%s", "HEAD"],
    {
      encoding: "utf8",
    },
  );
  return subjects
    .split("\n")
    .map((subject) => /^Merge ([\w-]+):/.exec(subject)?.[1])
    .filter((branch): branch is string => branch !== undefined);
}

describe("changelog data", () => {
  it("has an entry for every merged feature, in the order they were merged", () => {
    const merged = mergedFeatures();
    expect(merged.length).toBeGreaterThan(5);
    const listed = changelog
      .map(({ branch }) => branch)
      .filter((branch) => merged.includes(branch!));
    expect(listed).toEqual(merged);
  });

  it("lists the newest entry first, each dated and described in both languages", () => {
    const dates = changelog.map(({ date }) => date);
    expect(dates).toEqual([...dates].sort().reverse());
    for (const entry of changelog) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const locale of locales) {
        expect(entry.title[locale].trim()).not.toBe("");
        expect(entry.changes[locale].length, `${entry.branch} ${locale}`).toBeGreaterThan(0);
      }
      expect(entry.changes.es).toHaveLength(entry.changes.en.length);
    }
  });
});

describe.each([
  ["en", FaqPage, ChangelogPage, "/docs/faq", "/docs/changelog", "FAQ", "Changelog"],
  [
    "es",
    FaqPageEs,
    ChangelogPageEs,
    "/es/docs/faq",
    "/es/docs/changelog",
    "Preguntas frecuentes",
    "Cambios",
  ],
] as const)(
  "%s FAQ and Changelog pages",
  (locale, faqPage, changelogPage, faqPath, changelogPath, faqTitle, changelogTitle) => {
    const render = (page: typeof FaqPage, path: string) =>
      container.renderToString(page, { request: new Request(`http://localhost${path}`) });

    it("titles the FAQ and asks every question as a heading, with its answer", async () => {
      const html = await render(faqPage, faqPath);
      expect(text(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)![1]!)).toBe(faqTitle);
      expect(html).toContain(`<title>${faqTitle} | Buril UI</title>`);
      expect(headings(html, 2)).toEqual(faq.map(({ question }) => plain(question[locale])));
      for (const item of faq)
        for (const paragraph of item.answer[locale])
          expect(text(main(html))).toContain(plain(paragraph));
    });

    it("titles the Changelog and lists every entry, newest first", async () => {
      const html = await render(changelogPage, changelogPath);
      expect(text(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)![1]!)).toBe(changelogTitle);
      expect(html).toContain(`<title>${changelogTitle} | Buril UI</title>`);
      expect(headings(html, 2)).toEqual(changelog.map(({ title }) => plain(title[locale])));
      for (const entry of changelog) {
        expect(main(html)).toContain(`<time datetime="${entry.date}"`);
        for (const change of entry.changes[locale])
          expect(text(main(html))).toContain(plain(change));
      }
    });

    it("puts both pages in Getting Started", () => {
      const hrefs = docsNav(locale)[0]!.items.map(({ href }) => href);
      expect(hrefs).toContain(localizedHref("/docs/faq", locale));
      expect(hrefs).toContain(localizedHref("/docs/changelog", locale));
    });
  },
);
