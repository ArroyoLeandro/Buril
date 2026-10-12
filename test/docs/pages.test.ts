// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import IndexPage from "../../src/pages/index.astro";
import ButtonPage from "../../src/pages/components/button.astro";
import { componentHref, documentedComponents } from "../../src/data/components";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

/** Visible text: Shiki splits code into many spans, so match on text content. */
const text = (html: string) => html.replace(/<[^>]+>/g, "");

const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0;

const luminance = (hex: string) => {
  const full = hex.length === 4 ? hex.replace(/\w/g, "$&$&") : hex;
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

/** Every token color in every highlighted code block, with that block's background. */
function codeColors(html: string) {
  const pairs: { color: string; background: string }[] = [];
  for (const block of html.matchAll(
    /<pre class="astro-code[^"]*" style="([^"]*)"[\s\S]*?<\/pre>/g,
  )) {
    const background = /background-color:\s*(#[0-9a-fA-F]{3,6})\b/.exec(block[1]!)![1]!;
    for (const match of block[0].matchAll(/(?<![-\w])color:\s*(#[0-9a-fA-F]{3,6})\b/g)) {
      pairs.push({ color: match[1]!, background });
    }
  }
  return pairs;
}

/** Every component page, keyed by slug, so new pages get the shared checks automatically. */
const componentPages = Object.fromEntries(
  Object.entries(
    import.meta.glob<AstroComponentFactory>("../../src/pages/components/*.astro", {
      eager: true,
      import: "default",
    }),
  ).map(([path, page]) => [/([^/]+)\.astro$/.exec(path)![1]!, page]),
);

const pages = [
  ["index", () => IndexPage] as const,
  ...Object.entries(componentPages).map(([slug, page]) => [slug, () => page] as const),
];

/** Rules every page must satisfy: one document, one main landmark, nothing after </html>. */
function expectWellFormedPage(html: string) {
  expect(count(html, /<main[\s>]/g)).toBe(1);
  expect(count(html, /<\/main>/g)).toBe(1);
  expect(count(html, /<html[\s>]/g)).toBe(1);
  expect(html.trimEnd().endsWith("</html>")).toBe(true);
  expect(html.slice(html.lastIndexOf("</html>") + "</html>".length).trim()).toBe("");
}

describe.each(pages)("%s page layout", (_, page) => {
  const render = () => container.renderToString(page());

  it("opens with a skip link to the main landmark, visible on focus", async () => {
    const html = await render();
    const body = html.slice(html.indexOf("<body"));
    const firstLink = /<a\b[^>]*>[\s\S]*?<\/a>/.exec(body)![0];
    expect(firstLink).toMatch(/href="#main"/);
    expect(text(firstLink)).toMatch(/Skip to content/);
    expect(firstLink).toMatch(/\bsr-only\b/);
    expect(firstLink).toMatch(/focus:not-sr-only/);
    expect(html).toMatch(/<main[^>]*id="main"/);
  });

  it("has a header with the main navigation", async () => {
    const html = await render();
    const header = /<header[\s\S]*?<\/header>/.exec(html)?.[0] ?? "";
    const nav = /<nav[^>]*aria-label="Main"[\s\S]*?<\/nav>/.exec(header)?.[0] ?? "";
    expect(nav).toMatch(/<a[^>]+href="\/"[^>]*>\s*Home\s*<\/a>/);
    expect(text(nav)).toMatch(/Components/);
    for (const { slug, name } of documentedComponents) {
      expect(nav).toMatch(
        new RegExp(`<a[^>]+href="${componentHref(slug)}"[^>]*>\\s*${name}\\s*</a>`),
      );
    }
  });

  it("has a theme toggle with light, dark and system choices", async () => {
    const html = await render();
    const group = /<div[^>]*role="group"[^>]*aria-label="Theme"[\s\S]*?<\/div>/.exec(html)?.[0];
    const buttons = [...(group ?? "").matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
    expect(buttons.map((button) => text(button[2]!).trim())).toEqual(["Light", "Dark", "System"]);
    for (const [, attributes] of buttons) {
      expect(attributes).toMatch(/type="button"/);
      expect(attributes).toMatch(/aria-pressed="(true|false)"/);
    }
  });

  it("applies the stored theme in <head> before first paint", async () => {
    const html = await render();
    const head = html.slice(0, html.indexOf("</head>"));
    expect(head).toMatch(/<script>[^<]*localStorage[^<]*<\/script>/);
    expect(head).toMatch(/<script>[^<]*try\s*\{[^<]*<\/script>/);
  });
});

describe("index page", () => {
  it("renders one document with a single main landmark", async () => {
    expectWellFormedPage(await container.renderToString(IndexPage));
  });

  it("links to every documented component from its main content", async () => {
    const html = await container.renderToString(IndexPage);
    const main = /<main[\s\S]*<\/main>/.exec(html)![0];
    for (const { slug, name } of documentedComponents) {
      expect(main).toMatch(
        new RegExp(`<a[^>]+href="${componentHref(slug)}"[^>]*>\\s*${name}\\s*</a>`),
      );
    }
  });

  it("uses buttonVariants for its call to action instead of a dead button", async () => {
    const html = await container.renderToString(IndexPage);
    const main = /<main[\s\S]*<\/main>/.exec(html)![0];
    expect(main).not.toMatch(/<button/);
    expect(main).toMatch(/<a[^>]+href="\/components\/button"[^>]+class="[^"]*rounded-full/);
  });
});

describe("component list", () => {
  it("has exactly one page per documented component", () => {
    expect(Object.keys(componentPages).sort()).toEqual(
      documentedComponents.map(({ slug }) => slug).sort(),
    );
  });
});

describe.each(documentedComponents.map((entry) => [entry.slug, entry] as const))(
  "%s page from the shared template",
  (slug, entry) => {
    const render = () =>
      container.renderToString(componentPages[slug]!, {
        request: new Request(`http://localhost${componentHref(slug)}`),
      });

    it("renders one document with a single main landmark", async () => {
      expectWellFormedPage(await render());
    });

    it("uses the component name as its heading and title", async () => {
      const html = await render();
      expect(count(html, /<h1[\s>]/g)).toBe(1);
      expect(text(/<h1[^>]*>[\s\S]*?<\/h1>/.exec(html)![0]).trim()).toBe(entry.name);
      expect(html).toContain(`<title>${entry.name} | Buril UI</title>`);
      expect(html).toContain(`content="${entry.description}"`);
    });

    it("marks its own nav link as the current page", async () => {
      const html = await render();
      expect(html).toMatch(
        new RegExp(`<a[^>]+href="${componentHref(slug)}"[^>]+aria-current="page"`),
      );
    });

    it("has Demo, Install and Source sections in that order", async () => {
      const html = await render();
      const order = ["Demo", "Install", "Source"].map((title) => {
        expect(count(html, new RegExp(`>${title}</h2>`, "g"))).toBe(1);
        return html.indexOf(`>${title}</h2>`);
      });
      expect(order).toEqual([...order].sort((a, b) => a - b));
    });

    it("renders the demo as a single island", async () => {
      expect(count(await render(), /<astro-island/g)).toBe(1);
    });

    it("installs its registry item from a URL or by name", async () => {
      const visible = text(await render());
      expect(visible).toContain(`npx shadcn@latest add https://example.com/r/${entry.item}.json`);
      expect(visible).toContain(`npx shadcn@latest add @buril/${entry.item}`);
    });

    it("shows the source file it documents, read at build time", async () => {
      const html = await render();
      const source = html.slice(html.indexOf(">Source</h2>"));
      expect(text(source)).toContain(entry.source);
      // The export line is plain text in the highlighted output, so it proves the real file.
      const file = readFileSync(resolve(__dirname, "../..", entry.source), "utf8");
      expect(text(source)).toContain(/^export \{.*$/m.exec(file)![0]);
      expect(source).toMatch(/<pre class="astro-code/);
    });
  },
);

describe("button page", () => {
  it("renders one document with a single main landmark", async () => {
    expectWellFormedPage(await container.renderToString(ButtonPage));
  });

  it("renders the Install section exactly once with URL and namespaced commands", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Install<\/h2>/g)).toBe(1);
    expect(
      count(text(html), /npx shadcn@latest add https:\/\/example\.com\/r\/button\.json/g),
    ).toBe(1);
    expect(count(text(html), /npx shadcn@latest registry add @buril=https:\/\/example\.com/g)).toBe(
      1,
    );
    expect(count(text(html), /npx shadcn@latest add @buril\/button/g)).toBe(1);
  });

  it("shows every install command for npm, pnpm, yarn and bun in accessible tabs", async () => {
    const html = await container.renderToString(ButtonPage);
    const groups = [...html.matchAll(/<div[^>]*data-install-tabs[\s\S]*?data-copy-status[^>]*>/g)];
    expect(groups).toHaveLength(3);
    for (const [group] of groups) {
      const tabs = [...group.matchAll(/<button\b([^>]*role="tab"[^>]*)>([^<]*)<\/button>/g)];
      expect(tabs.map(([, , label]) => label!.trim())).toEqual(["npm", "pnpm", "yarn", "bun"]);
      expect(group).toMatch(/role="tablist"[^>]*aria-label="[^"]+"/);
      for (const [index, [, attributes]] of tabs.entries()) {
        const selected = index === 0;
        expect(attributes).toContain(`aria-selected="${selected}"`);
        expect(attributes).toContain(`tabindex="${selected ? 0 : -1}"`);
        const panelId = /aria-controls="([^"]+)"/.exec(attributes!)![1]!;
        const panel = new RegExp(`<div[^>]*role="tabpanel"[^>]*id="${panelId}"[^>]*>`).exec(group);
        expect(panel?.[0]).toBeDefined();
        expect(panel![0].includes(" hidden")).toBe(!selected);
      }
      for (const name of ["npm", "pnpm", "yarn", "bun"]) {
        expect(group).toMatch(new RegExp(`<button[^>]*aria-label="Copy ${name} command"`));
      }
      expect(group).toMatch(/role="status"[^>]*data-copy-status/);
    }
    for (const runner of [
      "pnpm dlx shadcn@latest",
      "yarn dlx shadcn@latest",
      "bunx --bun shadcn@latest",
    ]) {
      expect(
        count(text(html), new RegExp(runner.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")),
      ).toBe(4);
    }
  });

  it("documents the API differences from shadcn's Button", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Coming from shadcn\/ui<\/h2>/g)).toBe(1);
    const section = text(html.slice(html.indexOf(">Coming from shadcn/ui</h2>")));
    expect(section).toMatch(/asChild/);
    expect(section).toMatch(/size=(&quot;|")icon(&quot;|")/);
    expect(section).toMatch(/type=(&quot;|")button(&quot;|")/);
    expect(section).toMatch(/components\/ui\/button\.tsx/);
  });

  it("documents the theme as a separate opt-in install and its dark-mode behavior", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Optional theme<\/h2>/g)).toBe(1);
    expect(count(text(html), /npx shadcn@latest add @buril\/theme/g)).toBe(1);
    expect(text(html)).toMatch(/does not change your theme/);
    expect(text(html)).toMatch(/prefers-color-scheme: dark/);
    expect(text(html)).toMatch(/class="light"|class=&quot;light&quot;/);
  });

  it("renders the Source section exactly once with the component source", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Source<\/h2>/g)).toBe(1);
    expect(count(text(html), /const buttonVariants = cva\(/g)).toBe(1);
  });

  it("meets AA contrast for every token color in its code blocks, comments included", async () => {
    const html = await container.renderToString(ButtonPage);
    const pairs = codeColors(html);
    expect(pairs.length).toBeGreaterThan(20);
    const worst = Math.min(...pairs.map(({ color, background }) => contrast(color, background)));
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });

  it("does not claim that screen readers announce aria-busy", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(text(html)).not.toMatch(/announces\s+`?aria-busy/);
  });

  it("documents announcing progress with a status region outside the button", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Loading<\/h2>/g)).toBe(1);
    expect(text(html)).toMatch(/role=(&quot;|")status(&quot;|")/);
    expect(html).toMatch(/<[a-z]+[^>]*role="status"/);
  });

  it("renders the demo as a single island", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, /<astro-island/g)).toBe(1);
  });
});
