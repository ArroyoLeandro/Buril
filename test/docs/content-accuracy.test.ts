// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import { componentDocs, localizedComponentDocs } from "../../src/data/component-docs";
import {
  componentDescription,
  documentedComponents,
  findComponent,
} from "../../src/data/components";
import { faq } from "../../src/data/faq";
import { overrideRedExample } from "../../src/data/snippets";
import { locales, ui, type Locale } from "../../src/i18n/ui";

/**
 * Facts the docs must get right, in both languages: what a command does, what the theme sets,
 * what a reader must do themselves, and what each copyable command needs nearby. Each test
 * guards one class of mistake an independent review found.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const pages = import.meta.glob<AstroComponentFactory>("../../src/pages/**/*.astro", {
  eager: true,
  import: "default",
});
const routeOf = (file: string) =>
  file
    .replace("../../src/pages", "")
    .replace(/\.astro$/, "")
    .replace(/\/index$/, "/")
    .replace(/^$/, "/");
const fileOf = (route: string) =>
  Object.keys(pages).find(
    (file) => routeOf(file) === route.replace(/^(.+)\/$/, "$1") || routeOf(file) === route,
  )!;

const decode = (html: string) =>
  html
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
const text = (html: string) =>
  decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];

async function render(route: string) {
  const file = fileOf(route);
  expect(file, route).toBeDefined();
  return container.renderToString(pages[file]!, {
    request: new Request(`http://localhost${route}`),
  });
}
const es = (route: string, locale: Locale) => (locale === "es" ? `/es${route}` : route);

/** The h2 sections of the main content: each from its h2 up to the next. */
const sections = (html: string) => {
  const body = main(html);
  const starts = [...body.matchAll(/<h2\b/g)].map(({ index }) => index);
  return [0, ...starts].map((start, i) => body.slice(start, starts[i] ?? body.length));
};

describe("the example.com placeholder", () => {
  const routes = Object.keys(pages).map(routeOf);

  it("is explained next to every copyable command that uses it", async () => {
    let checked = 0;
    for (const route of routes) {
      const locale: Locale = route.startsWith("/es") ? "es" : "en";
      const note = ui[locale]["install.placeholder"];
      for (const section of sections(await render(route))) {
        const commands = [...section.matchAll(/data-copy="([^"]*)"/g)].map(([, code]) => code!);
        if (!commands.some((code) => code.includes("example.com"))) continue;
        checked++;
        expect(text(section), route).toContain(note);
      }
    }
    expect(checked).toBeGreaterThan(40);
  });
});

describe.each(locales)("content in %s", (locale) => {
  it("installs every Buril component the forms guide's example imports", async () => {
    const example = readFileSync(resolve("src/examples/SignupForm.tsx"), "utf8");
    const imported = [...example.matchAll(/from "\.\.\/\.\.\/registry\/ui\/([\w-]+)"/g)].map(
      ([, file]) =>
        documentedComponents.find(({ source }) => source.endsWith(`/${file}.tsx`))!.item,
    );
    expect(imported.length).toBeGreaterThan(3);
    const html = await render(es("/docs/guides/forms", locale));
    const install = /data-copy="(npx[^"]*)"/.exec(html)![1]!;
    for (const item of imported) expect(install).toContain(`@buril/${item}`);
  });

  it("says where --path puts the files when the @ alias maps to src", async () => {
    const page = text(main(await render(es("/docs/guides/shadcn", locale))));
    expect(page).toContain("--path components/buril");
    expect(page).toContain("src/components/buril");
  });

  it("warns that reinstalling overwrites local edits, and shows how to check first", async () => {
    const npm = faq.find(({ id }) => id === "npm-package")!.answer[locale].join(" ");
    for (const content of [npm, text(main(await render(es("/docs/changelog", locale))))]) {
      expect(content).toContain("npx shadcn@latest add @buril/<item> --diff");
      expect(content).toMatch(locale === "es" ? /sobrescribe|reemplaza/ : /overwrites|replaces/);
    }
  });

  it("tells readers to apply and load the fonts themselves", async () => {
    const page = text(main(await render(es("/docs/installation", locale))));
    expect(page).toContain("@apply font-body");
    expect(page).toContain("font-display");
    expect(page).toMatch(locale === "es" ? /carga tus propias fuentes/ : /load your own fonts/);
  });

  it("lists --accent with the red tokens and rebrands it in the snippet", async () => {
    for (const route of ["/docs/installation", "/docs/theming", "/docs/guides/theme"]) {
      const page = text(main(await render(es(route, locale))));
      expect(page, route).toContain("--accent");
    }
    for (const block of overrideRedExample.split(/\n\n/))
      for (const token of ["--decor", "--ring", "--accent", "--accent-foreground"])
        expect(block, token).toMatch(new RegExp(`${token}:`));
  });

  it("names on Theming exactly the tokens its override snippet sets", async () => {
    const html = main(await render(es("/docs/theming", locale)));
    // The override snippet is the code block that sets --decor; the paragraph before it names
    // the tokens to redefine.
    const pre = [...html.matchAll(/<pre[\s\S]*?<\/pre>/g)].find(([block]) =>
      text(block).replace(/\s/g, "").includes("--decor:"),
    )!;
    const before = html.slice(0, pre.index);
    const paragraph = before.slice(before.lastIndexOf("<p"));
    const named = [...paragraph.matchAll(/<code>(--[\w-]+)<\/code>/g)].map(([, token]) => token);
    const set = [...new Set([...overrideRedExample.matchAll(/(--[\w-]+):/g)].map(([, t]) => t))];
    expect(set.filter((token) => !named.includes(token))).toEqual([]);
  });

  it("says the dark mode fallback comes from the Buril theme, with a script for other themes", async () => {
    const html = main(await render(es("/docs/guides/dark-mode", locale)));
    const page = text(html);
    expect(page).toContain("@buril/theme");
    expect(page).toContain("matchMedia");
    expect(page).not.toMatch(/reads one class|lee una clase/);
    expect(page).toMatch(/\.dark.*\.light/);
  });

  it("describes everything the theme writes, and what it leaves alone", async () => {
    for (const route of ["/docs/installation", "/docs/theming"]) {
      const page = text(main(await render(es(route, locale))));
      expect(page, route).toContain("--buril-duration-");
      expect(page, route).toContain("@custom-variant dark");
      expect(page, route).toContain("--sidebar-*");
      expect(page, route).toContain("--chart-*");
    }
    const install = text(main(await render(es("/docs/installation", locale))));
    expect(install).toContain("buril-icon-*");
  });

  it("defines registry, item, namespace and token on Installation", async () => {
    const html = main(await render(es("/docs/installation", locale)));
    const terms = [...html.matchAll(/<dfn>([^<]+)<\/dfn>/g)].map(([, term]) => term!.trim());
    expect(terms).toEqual(expect.arrayContaining(["registry", "item", "namespace", "token"]));
  });

  it("ends Installation and Theming with next steps", async () => {
    const theming = main(await render(es("/docs/theming", locale)));
    const steps = theming.slice(theming.lastIndexOf("<h2"));
    expect(text(steps)).toMatch(locale === "es" ? /^Próximos pasos/ : /^Next steps/);
    expect(steps).toContain(`href="${es("/docs/guides/dark-mode", locale)}"`);
    expect(steps).toContain(`href="${es("/docs/guides/theme", locale)}"`);
    const installation = main(await render(es("/docs/installation", locale)));
    expect(text(installation.slice(installation.lastIndexOf("<h2")))).toMatch(
      locale === "es" ? /^Próximos pasos/ : /^Next steps/,
    );
  });

  it("claims accessibility-tree tests on the landing page, not screen reader tests", async () => {
    const page = text(await render(locale === "es" ? "/es/" : "/"));
    expect(page).not.toMatch(/screen reader tests|tests de teclado y de lector de pantalla/);
    expect(page).toMatch(locale === "es" ? /árbol de accesibilidad/ : /accessibility-tree tests/);
  });

  it("does not promise a label inside the Checkbox", () => {
    expect(componentDescription(findComponent("checkbox"), locale)).not.toMatch(
      /clickable label|clic/,
    );
  });

  it("names the button item, which ships IconButton, on the Motion page", async () => {
    const page = text(main(await render(es("/docs/motion", locale))));
    expect(page).not.toMatch(/Icon Button item|item Icon Button|item de Icon Button/);
    expect(page).toMatch(/button/);
  });

  it("puts the hand-copied keyframes in the Manual tab of Button and Icon Button", async () => {
    for (const slug of ["button", "icon-button"]) {
      const html = main(await render(es(`/docs/components/${slug}`, locale)));
      const panel = (id: string) => {
        const open = new RegExp(`<div[^>]*role="tabpanel"[^>]*id="installation-panel-${id}"`).exec(
          html,
        );
        expect(open, `${slug} ${id}`).not.toBeNull();
        const next = html.indexOf('role="tabpanel"', open!.index + 20);
        return html.slice(open!.index, next === -1 ? undefined : next);
      };
      expect(text(panel("manual")), slug).toContain("@keyframes buril-icon-");
      expect(text(panel("cli")), slug).not.toContain("@keyframes buril-icon-");
    }
  });
});

describe("API tables", () => {
  const rows = (slug: string, component: string) =>
    componentDocs[slug]!.api.find((api) => api.component === component)!.props.map(
      ({ name }) => name,
    );

  it("document the props readers need beyond the component's own", () => {
    expect(rows("link", "Link")).toContain("target");
    expect(rows("checkbox", "Checkbox")).toContain("defaultChecked");
    expect(rows("switch", "Switch")).toContain("defaultChecked");
    expect(rows("radio-group", "RadioGroup")).toEqual(
      expect.arrayContaining(["children", "className"]),
    );
    expect(rows("icon-button", "IconButton")).toContain("className");
    expect(rows("avatar", "initialsOf()")).toEqual(["name"]);
  });

  it("have Spanish text for every row", () => {
    for (const { slug } of documentedComponents)
      expect(() => localizedComponentDocs(slug, "es")).not.toThrow();
  });
});
