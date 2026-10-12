// @vitest-environment node
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import registry from "../../registry.json";
import { componentDocs } from "../../src/data/component-docs";
import { componentHref, documentedComponents } from "../../src/data/components";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const root = resolve(__dirname, "../..");
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
const squash = (value: string) => value.replace(/\s+/g, " ").trim();

const componentPages = Object.fromEntries(
  Object.entries(
    import.meta.glob<AstroComponentFactory>("../../src/pages/docs/components/*.astro", {
      eager: true,
      import: "default",
    }),
  ).map(([path, page]) => [/([^/]+)\.astro$/.exec(path)![1]!, page]),
);

const pascal = (slug: string) =>
  slug.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase());

/** The h2 sections of the main content, by title, each up to the next h2. */
function sections(html: string) {
  const main = /<main[\s\S]*<\/main>/.exec(html)![0];
  const starts = [...main.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)];
  return starts.map((match, i) => ({
    title: squash(text(match[1]!)),
    html: main.slice(match.index, starts[i + 1]?.index ?? main.length),
  }));
}

/** The whole <div> element that opens at `start`, nested divs included. */
function balancedDiv(html: string, start: number) {
  const tags = /<div[\s>]|<\/div>/g;
  tags.lastIndex = start;
  let depth = 0;
  for (let match = tags.exec(html); match; match = tags.exec(html)) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(start, match.index + match[0].length);
  }
  throw new Error("Unbalanced <div> in rendered HTML");
}

/** A server-rendered tab group: its tabs, and each tab's panel. */
function tabGroup(html: string, label: string) {
  const list = new RegExp(
    `<div[^>]*role="tablist"[^>]*aria-label="${label}"[^>]*>([\\s\\S]*?)</div>`,
  ).exec(html);
  expect(list, label).not.toBeNull();
  return [...list![1]!.matchAll(/<button\b([^>]*role="tab"[^>]*)>([\s\S]*?)<\/button>/g)].map(
    ([, attributes, label]) => {
      const id = /\sid="([^"]+)"/.exec(attributes!)![1]!;
      const panelId = /aria-controls="([^"]+)"/.exec(attributes!)![1]!;
      const open = new RegExp(`<div[^>]*role="tabpanel"[^>]*id="${panelId}"[^>]*>`).exec(html);
      expect(open, panelId).not.toBeNull();
      const panel = balancedDiv(html, open!.index);
      return { id, label: squash(text(label!)), attributes: attributes!, open: open![0], panel };
    },
  );
}

/** The code a reader can copy: every <pre> outside Installation, the API and Accessibility. */
function shownCode(html: string) {
  return sections(html)
    .filter(({ title }) => !["Installation", "API reference", "Accessibility"].includes(title))
    .flatMap(({ html }) => [...html.matchAll(/<pre[\s\S]*?<\/pre>/g)].map(([pre]) => text(pre)))
    .join("\n");
}

function expectTabSemantics(tabs: ReturnType<typeof tabGroup>) {
  for (const [index, tab] of tabs.entries()) {
    const selected = index === 0;
    expect(tab.attributes).toMatch(/type="button"/);
    expect(tab.attributes).toContain(`aria-selected="${selected}"`);
    expect(tab.attributes).toContain(`tabindex="${selected ? 0 : -1}"`);
    expect(tab.open).toContain(`aria-labelledby="${tab.id}"`);
    expect(/\shidden\b/.test(tab.open)).toBe(!selected);
  }
}

const items = registry.items as { name: string; dependencies?: string[] }[];

describe("component docs data", () => {
  it("documents usage, the API and accessibility for every documented component", () => {
    for (const { slug } of documentedComponents) {
      const docs = componentDocs[slug];
      expect(docs, slug).toBeDefined();
      expect(docs!.usage).toMatch(/@\/components\/ui\//);
      expect(docs!.api.length, slug).toBeGreaterThan(0);
      for (const api of docs!.api)
        expect(api.props.length, `${slug} ${api.component}`).toBeGreaterThan(0);
      expect(docs!.accessibility.length, slug).toBeGreaterThan(0);
    }
  });
});

describe.each(documentedComponents.map((entry) => [entry.slug, entry] as const))(
  "%s component page",
  (slug, entry) => {
    const render = () =>
      container.renderToString(componentPages[slug]!, {
        request: new Request(`http://localhost${componentHref(slug)}`),
      });

    it("opens with Preview and Code tabs: the live demo, then its source", async () => {
      const html = await render();
      const main = /<main[\s\S]*<\/main>/.exec(html)![0];
      const tabs = tabGroup(main, "Example");
      expect(tabs.map(({ label }) => label)).toEqual(["Preview", "Code"]);
      expectTabSemantics(tabs);
      // The first section: its h2 keeps the outline in order above the demos' own h3 headings.
      const [first, second] = sections(html);
      expect(first!.title).toBe("Example");
      expect(first!.html).toContain('aria-label="Example"');
      expect(second!.title).toBe("Installation");
      expect(tabs[0]!.panel).toMatch(/<astro-island/);
      const code = text(tabs[1]!.panel);
      expect(code).toContain(`export default function ${pascal(slug)}Demo`);
      expect(code).toMatch(/from "@\/components\/ui\//);
      expect(code).not.toMatch(/registry\/ui/);
      // The demo is localized for the docs site; the code shown is what a reader writes.
      expect(code).not.toMatch(/\bt\(|\bhref\(|demoTranslator|demoHref|\blocale\b|i18n/);
    });

    it("has Example, Installation, Usage, API reference and Accessibility sections in order", async () => {
      const titles = sections(await render()).map(({ title }) => title);
      const required = ["Example", "Installation", "Usage", "API reference", "Accessibility"];
      // Examples is optional, between Usage and API reference.
      const order = [...required.slice(0, 3), "Examples", ...required.slice(3)]
        .map((title) => titles.indexOf(title))
        .filter((index) => index !== -1);
      expect(order.length).toBeGreaterThanOrEqual(required.length);
      expect(order).toEqual([...order].sort((a, b) => a - b));
      for (const title of required) {
        expect(titles.filter((t) => t === title)).toHaveLength(1);
      }
    });

    it("installs from the CLI tab, or by hand from the Manual tab", async () => {
      const install = sections(await render()).find(({ title }) => title === "Installation")!.html;
      const tabs = tabGroup(install, "Installation method");
      expect(tabs.map(({ label }) => label)).toEqual(["CLI", "Manual"]);
      expectTabSemantics(tabs);

      const cli = text(tabs[0]!.panel);
      expect(cli).toContain(`npx shadcn@latest add https://example.com/r/${entry.item}.json`);
      expect(cli).toContain(`npx shadcn@latest add @buril/${entry.item}`);

      const manual = text(tabs[1]!.panel);
      const dependencies = items.find(({ name }) => name === entry.item)!.dependencies ?? [];
      if (dependencies.length > 0)
        expect(manual).toContain(`npm install ${dependencies.join(" ")}`);
      expect(manual).toContain(`components/ui/${basename(entry.source)}`);
      const file = readFileSync(resolve(root, entry.source), "utf8");
      expect(manual).toContain(/^export \{.*$/m.exec(file)![0]);
    });

    it("shows a minimal usage snippet that imports from components/ui", async () => {
      const usage = sections(await render()).find(({ title }) => title === "Usage")!.html;
      expect(usage).toMatch(/<pre class="astro-code/);
      expect(text(usage)).toContain(componentDocs[slug]!.usage.split("\n")[0]!);
    });

    it("documents every prop in an API table", async () => {
      const api = sections(await render()).find(({ title }) => title === "API reference")!.html;
      for (const doc of componentDocs[slug]!.api) {
        const name = doc.component.replace(/[()]/g, "\\$&");
        expect(api).toMatch(new RegExp(`<h3[^>]*>\\s*${name}\\s*</h3>`));
      }
      const tables = [...api.matchAll(/<table[\s\S]*?<\/table>/g)].map(([table]) => table);
      expect(tables).toHaveLength(componentDocs[slug]!.api.length);
      for (const [index, table] of tables.entries()) {
        const headers = [...table.matchAll(/<th[^>]*scope="col"[^>]*>([\s\S]*?)<\/th>/g)].map(
          ([, cell]) => squash(text(cell!)),
        );
        expect(headers).toEqual(["Prop", "Type", "Default", "Description"]);
        const rows = [...table.matchAll(/<th[^>]*scope="row"[^>]*>([\s\S]*?)<\/th>/g)].map(
          ([, cell]) => squash(text(cell!)),
        );
        expect(rows).toEqual(componentDocs[slug]!.api[index]!.props.map(({ name }) => name));
      }
    });

    // APG style: a Keyboard table, or a sentence saying the component takes no focus, then what
    // assistive technology gets: the role and the states.
    it("has Keyboard and ARIA subsections in its Accessibility section", async () => {
      const a11y = sections(await render()).find(({ title }) => title === "Accessibility")!.html;
      const subsections = [...a11y.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map(([, inner]) =>
        squash(text(inner!)),
      );
      expect(subsections).toEqual(["Keyboard", "ARIA"]);
      const docs = componentDocs[slug]!;
      if (!docs.keyboard?.length) {
        expect(a11y).not.toMatch(/<table/);
        expect(squash(text(a11y))).toContain("No keyboard interaction");
      }
      const plain = (value: string) => squash(value.replace(/`/g, ""));
      expect(squash(text(a11y))).toContain(plain(docs.aria.role));
      if (docs.aria.states) expect(squash(text(a11y))).toContain(plain(docs.aria.states));
    });

    // Every variant, size and mode the API lists is used in code a reader can copy: the demo's
    // source, the usage snippet or an example. Prose and the API table do not count.
    it("shows every variant, size and mode of its API in use", async () => {
      const shown = shownCode(await render());
      for (const api of componentDocs[slug]!.api) {
        for (const prop of api.props) {
          if (!["variant", "size", "orientation", "live", "motion"].includes(prop.name)) continue;
          const values = [...prop.type.matchAll(/"([\w-]+)"/g)].map(([, value]) => value!);
          for (const value of values) {
            if (prop.default === `"${value}"`) continue;
            const pattern = new RegExp(
              `${prop.name}[=:]\\s*\\{?["']${value}["']|\\b${prop.name}\\s*=\\s*\\{${prop.name}\\}`,
            );
            const listed = new RegExp(`["']${value}["']`);
            expect(
              pattern.test(shown) || listed.test(shown),
              `${api.component} ${prop.name}="${value}"`,
            ).toBe(true);
          }
        }
      }
    });

    // Every state the API documents as a boolean, such as `loading` or `decor`, is used in code too.
    it("shows every state of its API in use", async () => {
      const shown = shownCode(await render());
      for (const api of componentDocs[slug]!.api) {
        for (const prop of api.props.filter(({ type }) => type === "boolean")) {
          expect(shown, `${api.component} ${prop.name}`).toMatch(
            new RegExp(`\\b${prop.name}\\b(?!-)`),
          );
        }
      }
    });

    it("summarizes its keyboard and screen reader behavior", async () => {
      const a11y = sections(await render()).find(({ title }) => title === "Accessibility")!.html;
      const keyboard = componentDocs[slug]!.keyboard ?? [];
      if (keyboard.length > 0) {
        const table = /<table[\s\S]*?<\/table>/.exec(a11y)![0];
        const headers = [...table.matchAll(/<th[^>]*scope="col"[^>]*>([\s\S]*?)<\/th>/g)].map(
          ([, cell]) => squash(text(cell!)),
        );
        expect(headers).toEqual(["Key", "Action"]);
        const keys = [...table.matchAll(/<th[^>]*scope="row"[^>]*>([\s\S]*?)<\/th>/g)].map(
          ([, cell]) => squash(text(cell!)),
        );
        expect(keys).toEqual(keyboard.map(({ key }) => key));
      }
      for (const note of componentDocs[slug]!.accessibility) {
        expect(squash(text(a11y))).toContain(squash(note.replace(/`/g, "")));
      }
    });
  },
);
