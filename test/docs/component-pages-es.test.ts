// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import astroConfig from "../../astro.config.mjs";
import { componentDocs, localizedComponentDocs } from "../../src/data/component-docs";
import {
  componentDescription,
  componentHref,
  documentedComponents,
} from "../../src/data/components";

/**
 * The Spanish component pages: the shared template in Spanish, the same outline, code and install
 * commands as the English twin, Spanish docs text, a Spanish demo, and links that stay in Spanish.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const decode = (html: string) =>
  html
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
const text = (html: string) => decode(html.replace(/<[^>]+>/g, ""));
const squash = (value: string) => value.replace(/\s+/g, " ").trim();
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];

const pagesFrom = (pages: Record<string, AstroComponentFactory>) =>
  Object.fromEntries(
    Object.entries(pages).map(([path, page]) => [/([^/]+)\.astro$/.exec(path)![1]!, page]),
  );
const english = pagesFrom(
  import.meta.glob<AstroComponentFactory>("../../src/pages/docs/components/*.astro", {
    eager: true,
    import: "default",
  }),
);
const spanish = pagesFrom(
  import.meta.glob<AstroComponentFactory>("../../src/pages/es/docs/components/*.astro", {
    eager: true,
    import: "default",
  }),
);

const render = (page: AstroComponentFactory | undefined, path: string) => {
  expect(page, path).toBeDefined();
  return container.renderToString(page!, { request: new Request(`http://localhost${path}`) });
};

/** The h2 titles of the main content, in order. */
const sectionTitles = (html: string) =>
  [...main(html).matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(([, title]) => squash(text(title!)));

/** The text of one h2 section, up to the next h2. */
function section(html: string, title: string) {
  const content = main(html);
  const starts = [...content.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)];
  const index = starts.findIndex(([, heading]) => squash(text(heading!)) === title);
  expect(index, title).toBeGreaterThan(-1);
  return content.slice(starts[index]!.index, starts[index + 1]?.index ?? content.length);
}

/** Tab labels of the tab list named `label`. */
const tabLabels = (html: string, label: string) => {
  const list = new RegExp(
    `<div[^>]*role="tablist"[^>]*aria-label="${label}"[^>]*>([\\s\\S]*?)</div>`,
  ).exec(html);
  expect(list, label).not.toBeNull();
  return [...list![1]!.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map(([, tab]) =>
    squash(text(tab!)),
  );
};

/** Column headers of every table in an HTML fragment. */
const tableHeaders = (html: string) =>
  [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map(([table]) =>
    [...table.matchAll(/<th[^>]*scope="col"[^>]*>([\s\S]*?)<\/th>/g)].map(([, cell]) =>
      squash(text(cell!)),
    ),
  );

/** Every inline and block `<code>` text in the main content: identifiers stay in English. */
const codeTexts = (html: string) =>
  new Set(
    [...main(html).matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/g)].map(([, code]) =>
      squash(text(code!)),
    ),
  );

/** The source shown in the Code tab of the example. */
const codePanel = (html: string) => {
  const start = html.indexOf('id="example-panel-code"');
  expect(start).toBeGreaterThan(-1);
  return text(html.slice(start, html.indexOf("</pre>", start)));
};

describe("Spanish component pages", () => {
  it("exist for every documented component, and for nothing else", () => {
    expect(Object.keys(spanish).sort()).toEqual(
      documentedComponents.map(({ slug }) => slug).sort(),
    );
  });
});

describe.each(documentedComponents.map((entry) => [entry.slug, entry] as const))(
  "%s in Spanish",
  (slug, entry) => {
    const path = `/es${componentHref(slug)}`;
    const renderEs = () => render(spanish[slug], path);
    const renderEn = () => render(english[slug], componentHref(slug));

    it("is a Spanish document titled with the component name and a Spanish description", async () => {
      const html = await renderEs();
      expect(html).toMatch(/<html lang="es"/);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      expect(squash(text(/<h1[^>]*>[\s\S]*?<\/h1>/.exec(html)![0]))).toBe(entry.name);
      expect(html).toContain(`<title>${entry.name} | Buril UI</title>`);
      const description = componentDescription(entry, "es");
      expect(decode(/<meta name="description" content="([^"]*)"/.exec(html)![1]!)).toBe(
        description,
      );
      expect(squash(text(main(html)))).toContain(description);
    });

    it("has the template's sections and tabs in Spanish", async () => {
      const html = await renderEs();
      const titles = sectionTitles(html);
      for (const title of [
        "Ejemplo",
        "Instalación",
        "Uso",
        "Referencia de la API",
        "Accesibilidad",
      ])
        expect(
          titles.filter((found) => found === title),
          title,
        ).toHaveLength(1);
      expect(tabLabels(html, "Ejemplo")).toEqual(["Vista previa", "Código"]);
      expect(tabLabels(html, "Método de instalación")).toEqual(["CLI", "Manual"]);
      for (const english of ["Example", "Installation", "Usage", "API reference", "Accessibility"])
        expect(titles).not.toContain(english);
    });

    it("has the same outline as the English page", async () => {
      const outline = (html: string) =>
        [...main(html).matchAll(/<h([23])[\s>]/g)].map(([, depth]) => depth);
      expect(outline(await renderEs())).toEqual(outline(await renderEn()));
    });

    it("keeps every code identifier and code sample of the English page", async () => {
      const [es, en] = [codeTexts(await renderEs()), codeTexts(await renderEn())];
      expect([...en].filter((code) => !es.has(code))).toEqual([]);
      expect([...es].filter((code) => !en.has(code))).toEqual([]);
    });

    it("shows the same demo source, install commands and component source", async () => {
      const [es, en] = [await renderEs(), await renderEn()];
      expect(codePanel(es)).toBe(codePanel(en));
      const visible = text(main(es));
      expect(visible).toContain(`npx shadcn@latest add https://example.com/r/${entry.item}.json`);
      expect(visible).toContain(`npx shadcn@latest add @buril/${entry.item}`);
      expect(squash(text(section(es, "Instalación")))).toMatch(
        /reexporta cn\(\) desde el paquete de npm cn/,
      );
    });

    it("documents the API and accessibility in Spanish", async () => {
      const html = await renderEs();
      const docs = localizedComponentDocs(slug, "es")!;
      const api = section(html, "Referencia de la API");
      for (const headers of tableHeaders(api))
        expect(headers).toEqual(["Prop", "Tipo", "Valor por defecto", "Descripción"]);
      const visibleApi = squash(text(api));
      for (const doc of docs.api) {
        if (doc.description)
          expect(visibleApi).toContain(squash(doc.description.replace(/`/g, "")));
        for (const prop of doc.props)
          expect(visibleApi).toContain(squash(prop.description.replace(/`/g, "")));
      }
      const a11y = section(html, "Accesibilidad");
      if (docs.keyboard?.length) expect(tableHeaders(a11y)[0]).toEqual(["Tecla", "Acción"]);
      for (const note of docs.accessibility)
        expect(squash(text(a11y))).toContain(squash(note.replace(/`/g, "")));
    });

    it("runs its demo in Spanish", async () => {
      const island = /<astro-island\b[^>]*>/.exec(await renderEs())![0];
      // The avatar demo shows only names, which read the same in both languages.
      if (slug !== "avatar") expect(decode(island)).toMatch(/"locale":\[0,"es"\]/);
    });

    it("links only to Spanish pages, from the sidebar to the demo", async () => {
      const html = await renderEs();
      const nav = /<nav[^>]*aria-label="Documentación"[\s\S]*?<\/nav>/.exec(html)![0];
      const current = [...nav.matchAll(/<a[^>]+aria-current="page"[^>]*>/g)];
      expect(current).toHaveLength(1);
      expect(current[0]![0]).toContain(`href="${path}"`);
      // Every internal link stays in Spanish, except the switcher to the English twin.
      const internal = [...html.matchAll(/<a\b[^>]*\shref="(\/[^"]*)"[^>]*>/g)]
        .filter(([tag]) => !tag.includes("data-language-switcher"))
        .map(([, href]) => href!)
        .filter((href) => !href.startsWith("/es/"));
      expect(internal).toEqual([]);
    });
  },
);

describe("icon-button in Spanish", () => {
  it("explains the gestures, the lid marker and reduced motion in Spanish", async () => {
    const visible = squash(
      text(main(await render(spanish["icon-button"], "/es/docs/components/icon-button"))),
    );
    expect(visible).toContain("data-lid");
    expect(visible).toMatch(/movimiento reducido/);
    expect(visible).toMatch(/una vez/);
    expect(visible).toContain("@keyframes buril-icon-");
  });
});

describe("card in Spanish", () => {
  it("explains the interactive hover in Spanish", async () => {
    const visible = squash(text(main(await render(spanish["card"], "/es/docs/components/card"))));
    expect(visible).toContain("interactive");
    expect(visible).toMatch(/se eleva/);
    expect(visible).toMatch(/sombra/);
    expect(visible).toMatch(/foco del teclado/);
    expect(visible).toMatch(/movimiento reducido/);
  });
});

describe("Spanish component docs data", () => {
  it("translates every description, key action and note, and keeps names, types and keys", () => {
    for (const { slug } of documentedComponents) {
      const en = componentDocs[slug]!;
      const es = localizedComponentDocs(slug, "es")!;
      expect(es.usage, slug).toBe(en.usage);
      expect(es.api.map(({ component }) => component)).toEqual(
        en.api.map(({ component }) => component),
      );
      for (const [index, api] of es.api.entries()) {
        const original = en.api[index]!;
        if (original.description) expect(api.description, slug).not.toBe(original.description);
        expect(api.props.map(({ name, type }) => [name, type])).toEqual(
          original.props.map(({ name, type }) => [name, type]),
        );
        for (const [i, prop] of api.props.entries()) {
          expect(prop.description.trim(), `${slug} ${prop.name}`).not.toBe("");
          expect(prop.description, `${slug} ${prop.name}`).not.toBe(original.props[i]!.description);
          // Code defaults stay as written; prose defaults are translated.
          const before = original.props[i]!.default;
          if (before && /^[\w"'`#.-]+$/.test(before)) expect(prop.default).toBe(before);
        }
      }
      expect(es.keyboard?.length ?? 0).toBe(en.keyboard?.length ?? 0);
      for (const [index, key] of (es.keyboard ?? []).entries())
        expect(key.action, `${slug} ${key.key}`).not.toBe(en.keyboard![index]!.action);
      expect(es.accessibility).toHaveLength(en.accessibility.length);
      for (const [index, note] of es.accessibility.entries())
        expect(note, slug).not.toBe(en.accessibility[index]);
    }
  });

  it("returns the English docs unchanged for English", () => {
    for (const { slug } of documentedComponents)
      expect(localizedComponentDocs(slug, "en")).toBe(componentDocs[slug]);
  });
});

describe("Spanish component URLs", () => {
  it("redirect /es/components/<slug> like the English ones", () => {
    const redirects = astroConfig.redirects ?? {};
    for (const { slug } of documentedComponents)
      expect(redirects[`/es/components/${slug}`], slug).toBe(`/es/docs/components/${slug}`);
    expect(redirects["/es/components"]).toBe("/es/docs/components");
  });
});
