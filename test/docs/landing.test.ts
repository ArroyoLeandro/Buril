// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import IndexPage from "../../src/pages/index.astro";
import IndexPageEs from "../../src/pages/es/index.astro";
import DocsIndexPage from "../../src/pages/docs/index.astro";
import DocsIndexPageEs from "../../src/pages/es/docs/index.astro";
import ButtonPage from "../../src/pages/docs/components/button.astro";
import ButtonPageEs from "../../src/pages/es/docs/components/button.astro";
import { documentedComponents } from "../../src/data/components";
import { localizedHref } from "../../src/i18n/paths";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
const render = () => container.renderToString(IndexPage, { request: new Request("http://x/") });
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];
const section = (html: string, title: string) => {
  const start = html.search(new RegExp(`>\\s*${title}\\s*</h2>`));
  expect(start, title).toBeGreaterThan(-1);
  const end = html.indexOf("<h2", start);
  return html.slice(start, end === -1 ? undefined : end);
};

const heroes = [
  {
    locale: "en",
    page: IndexPage,
    path: "/",
    title: "Accessible components, engraved to last",
    engraved: "engraved",
    pill: "See the changelog",
    count: `${documentedComponents.length} components`,
    lead: "React components that the shadcn CLI copies into your project as source you can edit. Each one ships with keyboard and accessibility-tree tests.",
    ctas: ["Get started", "Browse components"],
    traits: ["Native HTML", "Keyboard first", "AA in both themes"],
  },
  {
    locale: "es",
    page: IndexPageEs,
    path: "/es/",
    title: "Componentes accesibles, grabados para durar",
    engraved: "grabados",
    pill: "Ver los cambios",
    count: `${documentedComponents.length} componentes`,
    lead: "Componentes de React que la CLI de shadcn copia en tu proyecto como código fuente que puedes editar. Cada uno incluye tests de teclado y del árbol de accesibilidad.",
    ctas: ["Empezar", "Explorar los componentes"],
    traits: ["HTML nativo", "Primero el teclado", "AA en los dos temas"],
  },
] as const;

describe.each(heroes)("$locale landing hero", (hero) => {
  const renderHero = async () => {
    const html = main(
      await container.renderToString(hero.page, {
        request: new Request(`http://x${hero.path}`),
      }),
    );
    const section = /<section[^>]*data-hero[\s\S]*?<\/section>/.exec(html);
    expect(section, "hero section").not.toBeNull();
    return { html, hero: section![0] };
  };
  const href = (path: string) => localizedHref(path, hero.locale);

  it("opens the page and is named by its one headline", async () => {
    const { html, hero: section } = await renderHero();
    expect(html.indexOf("<section")).toBe(html.indexOf(section));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const h1 = /<h1[^>]*>[\s\S]*?<\/h1>/.exec(section)![0];
    expect(text(h1)).toBe(hero.title);
    const id = /<h1[^>]*id="([^"]+)"/.exec(h1)![1];
    expect(section).toMatch(new RegExp(`^<section[^>]*aria-labelledby="${id}"`));
  });

  it("underlines one word of the headline with the engraved hatching", async () => {
    const { hero: section } = await renderHero();
    const h1 = /<h1[^>]*>[\s\S]*?<\/h1>/.exec(section)![0];
    const marked = [...h1.matchAll(/<span[^>]*data-engraved[^>]*>([\s\S]*?)<\/span>/g)];
    expect(marked.map(([, word]) => text(word!))).toEqual([hero.engraved]);
    expect(marked[0]![0]).toMatch(/repeating-linear-gradient\(135deg,var\(--decor\)/);
  });

  it("starts with a pill that counts the components and links to the changelog", async () => {
    const { hero: section } = await renderHero();
    const pill = /<a[^>]*>[\s\S]*?<\/a>/.exec(section)![0];
    expect(pill).toMatch(new RegExp(`href="${href("/docs/changelog")}"`));
    expect(pill).toMatch(/data-slot="badge"/);
    expect(text(pill)).toBe(`${hero.count} ${hero.pill}`);
    expect(pill).toMatch(/data-icon="arrow-right"/);
  });

  it("says what Buril is in one lead paragraph", async () => {
    const { hero: section } = await renderHero();
    const paragraphs = [...section.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)].map(([, p]) =>
      text(p!),
    );
    expect(paragraphs).toEqual([hero.lead]);
  });

  it("offers two link CTAs styled as pill buttons, the first with a forward arrow", async () => {
    const { hero: section } = await renderHero();
    const links = [...section.matchAll(/<a[^>]*>[\s\S]*?<\/a>/g)].map(([a]) => a).slice(1);
    expect(links.map((a) => text(a))).toEqual([...hero.ctas]);
    expect(links[0]).toMatch(new RegExp(`href="${href("/docs")}"`));
    expect(links[1]).toMatch(new RegExp(`href="${href("/docs/components")}"`));
    for (const link of links) expect(link).toMatch(/^<a[^>]*class="[^"]*\brounded-full\b/);
    expect(links[0]).toMatch(/data-icon="arrow-right"/);
    expect(links[1]).not.toMatch(/<svg/);
  });

  it("ends with one line of traits, as a list", async () => {
    const { hero: section } = await renderHero();
    const list = /<ul[^>]*>[\s\S]*?<\/ul>/.exec(section)![0];
    const items = [...list.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(([, li]) =>
      text(li!.replace(/<span aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, "")),
    );
    expect(items).toEqual([...hero.traits]);
  });

  it("draws the engraving behind the headline, hidden from assistive technology", async () => {
    const { html, hero: section } = await renderHero();
    const art = [...html.matchAll(/<svg\b[^>]*data-engraving[^>]*>/g)].map(([tag]) => tag);
    expect(art.length).toBeGreaterThanOrEqual(1);
    const behind = /<svg\b[^>]*data-engraving[^>]*>/.exec(section)![0];
    expect(behind).toMatch(/aria-hidden="true"/);
    expect(behind).toMatch(/focusable="false"/);
    // Before the copy in the source, painted under it, and never in the way of the pointer.
    expect(section.indexOf(behind)).toBeLessThan(section.indexOf("<h1"));
    expect(section.slice(0, section.indexOf(behind))).toMatch(/pointer-events-none/);
    for (const tag of art) {
      expect(tag).toMatch(/aria-hidden="true"/);
      expect(tag).toMatch(/focusable="false"/);
    }
    expect(html).not.toMatch(/<svg[^>]*role="img"/);
  });
});

const showcases = [
  {
    locale: "en",
    page: IndexPage,
    path: "/",
    heading: "Examples built with Buril UI",
    viewCode: "View code",
    viewCodeFor: (name: string) => `View code for ${name}`,
    labels: ["Team", "Settings", "Checkbox", "Field", "Alert", "Button", "Gestures"],
  },
  {
    locale: "es",
    page: IndexPageEs,
    path: "/es/",
    heading: "Ejemplos hechos con Buril UI",
    viewCode: "Ver código",
    viewCodeFor: (name: string) => `Ver código de ${name}`,
    labels: ["Equipo", "Ajustes", "Checkbox", "Field", "Alert", "Button", "Gestos"],
  },
] as const;

/** The cells in reading order and the component page each one links to. */
const cells = [
  ["team", "avatar", "Avatar"],
  ["settings", "switch", "Switch"],
  ["checkbox", "checkbox", "Checkbox"],
  ["field", "field", "Field"],
  ["alert", "alert", "Alert"],
  ["buttons", "button", "Button"],
  ["gestures", "icon-button", "IconButton"],
] as const;

describe.each(showcases)("$locale landing showcase", (showcase) => {
  const renderShowcase = async () => {
    const html = main(
      await container.renderToString(showcase.page, {
        request: new Request(`http://x${showcase.path}`),
      }),
    );
    const found = /<section[^>]*data-showcase[\s\S]*?<\/section>/.exec(html);
    expect(found, "showcase section").not.toBeNull();
    return { html, showcase: found![0] };
  };
  const articles = (html: string) =>
    html
      .split(/(?=<article\b)/)
      .slice(1)
      .map((part) => part.slice(0, part.indexOf("</article>")));

  it("follows the hero, named by a heading only screen readers see", async () => {
    const { html, showcase: section } = await renderShowcase();
    expect(html.indexOf(section)).toBeGreaterThan(html.indexOf("data-hero"));
    const h2 = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(section)!;
    expect(text(h2[1]!)).toBe(showcase.heading);
    expect(h2[0]).toMatch(/class="[^"]*\bsr-only\b/);
    const id = /<h2[^>]*id="([^"]+)"/.exec(h2[0])![1];
    expect(section).toMatch(new RegExp(`^<section[^>]*aria-labelledby="${id}"`));
  });

  it("lays the cells on a 1, 2 then 12 column grid capped at 1320px", async () => {
    const { showcase: section } = await renderShowcase();
    const grid = /<div[^>]*data-bento[^>]*>/.exec(section)![0];
    for (const name of ["grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-12"]) {
      expect(grid).toMatch(new RegExp(`class="[^"]*(?<=[" ])${name}(?=[" ])`));
    }
    expect(grid).toMatch(/max-w-\[1320px\]/);
  });

  it("puts the seven cells in reading order, each named by its pixel-font label", async () => {
    const { showcase: section } = await renderShowcase();
    const found = articles(section);
    expect(found.map((cell) => /data-cell="([^"]+)"/.exec(cell)![1])).toEqual(
      cells.map(([id]) => id),
    );
    found.forEach((cell, index) => {
      const h3 = /<h3[^>]*>[\s\S]*?<\/h3>/.exec(cell)![0];
      expect(text(h3)).toBe(showcase.labels[index]);
      expect(h3).toMatch(/class="[^"]*\bfont-display\b/);
      const id = /<h3[^>]*id="([^"]+)"/.exec(h3)![1];
      expect(cell).toMatch(new RegExp(`^<article[^>]*aria-labelledby="${id}"`));
    });
  });

  it("gives every cell a quiet View code link to its component page", async () => {
    const { showcase: section } = await renderShowcase();
    const slugs = documentedComponents.map(({ slug }) => slug);
    articles(section).forEach((cell, index) => {
      const [, slug, name] = cells[index]!;
      expect(slugs).toContain(slug);
      const link = [...cell.matchAll(/<a[^>]*data-view-code[^>]*>[\s\S]*?<\/a>/g)];
      expect(link).toHaveLength(1);
      const [anchor] = link[0]!;
      expect(anchor).toMatch(
        new RegExp(`href="${localizedHref(`/docs/components/${slug}`, showcase.locale)}"`),
      );
      // The visible words start the accessible name; the component name is for screen readers.
      expect(text(anchor)).toBe(showcase.viewCodeFor(name));
      const visible = text(anchor.replace(/<span class="sr-only">[\s\S]*?<\/span>/g, ""));
      expect(visible).toBe(showcase.viewCode);
      expect(anchor).toMatch(/class="[^"]*\btext-muted-foreground\b/);
    });
  });
  const cell = (section: string, id: string) =>
    articles(section).find((part) => part.includes(`data-cell="${id}"`))!;

  it("renders the top row as static HTML except the Field, which hydrates when visible", async () => {
    const { showcase: section } = await renderShowcase();
    for (const id of ["team", "settings", "checkbox"]) {
      expect(cell(section, id), id).not.toMatch(/<astro-island/);
    }
    const islands = cell(section, "field").match(/<astro-island[^>]*>/g)!;
    expect(islands).toHaveLength(1);
    expect(islands[0]).toMatch(/client="visible"/);
    expect(islands[0]).toMatch(new RegExp(`props="[^"]*locale[^"]*${showcase.locale}`));
  });

  it("fills the top row with the team, the settings stage, a Checkbox and a Field", async () => {
    const { showcase: section } = await renderShowcase();
    expect(cell(section, "team")).toMatch(/data-slot="avatar"/);
    expect(cell(section, "team")).toMatch(/data-slot="badge"/);
    expect(cell(section, "settings")).toMatch(/<input[^>]+role="switch"/);
    expect(cell(section, "checkbox")).toMatch(/<input[^>]+type="checkbox"(?![^>]*role="switch")/);
    expect(cell(section, "field")).toMatch(/<input[^>]+type="email"/);
  });

  it("draws the engraved band on one card only, in the settings stage", async () => {
    const { showcase: section } = await renderShowcase();
    expect(section.match(/data-decor/g)).toHaveLength(1);
    expect(cell(section, "settings")).toMatch(/data-decor/);
    const fragment = /<svg\b[^>]*data-engraving[^>]*>/.exec(cell(section, "settings"))![0];
    expect(fragment).toMatch(/aria-hidden="true"/);
  });

  it("renders the bottom row as static HTML except the Gestures, which hydrate when visible", async () => {
    const { showcase: section } = await renderShowcase();
    expect(cell(section, "alert")).not.toMatch(/<astro-island/);
    expect(cell(section, "buttons")).not.toMatch(/<astro-island/);
    const islands = cell(section, "gestures").match(/<astro-island[^>]*>/g)!;
    expect(islands).toHaveLength(1);
    expect(islands[0]).toMatch(/client="visible"/);
    expect(islands[0]).toMatch(new RegExp(`props="[^"]*locale[^"]*${showcase.locale}`));
    expect(cell(section, "alert")).toMatch(/data-slot="alert"/);
    expect(cell(section, "buttons").match(/<button\b/g)!.length).toBeGreaterThanOrEqual(6);
    expect(cell(section, "gestures").match(/data-motion=/g)).toHaveLength(6);
  });

  it("hydrates only the two blocks that keep state", async () => {
    const { showcase: section } = await renderShowcase();
    expect(section.match(/<astro-island/g)).toHaveLength(2);
  });

  it("marks every faded copy inert and hidden from assistive technology", async () => {
    const { showcase: section } = await renderShowcase();
    const inert = [...section.matchAll(/<[a-z]+\b[^>]*\binert\b[^>]*>/g)].map(([tag]) => tag);
    expect(inert.length).toBeGreaterThanOrEqual(3);
    for (const tag of inert) expect(tag).toMatch(/aria-hidden="true"/);
  });
});

describe("landing page", () => {
  it("states the four principles", async () => {
    const values = text(section(main(await render()), "Why Buril"));
    for (const principle of [
      "You own the code",
      "Accessible by default",
      "Platform first",
      "Themeable",
    ]) {
      expect(values).toContain(principle);
    }
  });

  it("states the shadcn requirement in a static Alert before the commands", async () => {
    const html = section(main(await render()), "Install");
    const alert = /<div[^>]*data-slot="alert"[^>]*>/.exec(html);
    expect(alert).not.toBeNull();
    // Static content on load: no live role that would announce it.
    expect(alert![0]).not.toMatch(/role=/);
    expect(alert!.index).toBeLessThan(html.indexOf("data-install-tabs"));
    const callout = text(html.slice(alert!.index));
    expect(callout).toMatch(/components\.json/);
    expect(callout).toMatch(/npx shadcn@latest init/);
  });

  it("ends with the install commands and a link to the guide", async () => {
    const html = section(main(await render()), "Install");
    expect(html).toMatch(/data-install-tabs/);
    expect(text(html)).toContain(
      "npx shadcn@latest registry add @buril=https://example.com/r/{name}.json",
    );
    expect(text(html)).toContain("npx shadcn@latest add @buril/button");
    expect(html).toMatch(/<a[^>]+href="\/docs\/installation"/);
  });

  it("has no docs sidebar or page TOC", async () => {
    const html = await render();
    expect(html).not.toMatch(/aria-label="Docs"/);
    expect(html).not.toMatch(/aria-label="On this page"/);
  });
});

describe.each([
  ["English landing page", IndexPage, "/"],
  ["Spanish landing page", IndexPageEs, "/es/"],
] as [string, AstroComponentFactory, string][])("footer on the %s", (_, page, path) => {
  it("is a footer outside the main with the license and the GitHub link", async () => {
    const html = await container.renderToString(page, {
      request: new Request(`http://localhost${path}`),
    });
    const footer = /<footer[\s\S]*?<\/footer>/.exec(html)?.[0] ?? "";
    expect(html.match(/<footer[\s>]/g)).toHaveLength(1);
    expect(html.indexOf("<footer")).toBeGreaterThan(html.indexOf("</main>"));
    expect(text(footer)).toMatch(/MIT/);
    expect(footer).toMatch(
      /<a[^>]+href="https:\/\/github\.com\/ArroyoLeandro\/Buril\/blob\/main\/LICENSE"/,
    );
    expect(footer).toMatch(/<a[^>]+href="https:\/\/github\.com\/ArroyoLeandro\/Buril"/);
  });
});

describe("Spanish landing page", () => {
  const pages = import.meta.glob<AstroComponentFactory>("../../src/pages/es/index.astro", {
    eager: true,
    import: "default",
  });
  const renderEs = () => {
    const page = pages["../../src/pages/es/index.astro"];
    expect(page, "src/pages/es/index.astro").toBeDefined();
    return container.renderToString(page!, { request: new Request("http://x/es/") });
  };

  it("is a Spanish document with a Spanish title and description", async () => {
    const html = await renderEs();
    expect(html).toMatch(/<html lang="es"/);
    expect(html).toContain("<title>Buril UI</title>");
    expect(html).toMatch(/<meta name="description" content="Componentes de React accesibles/);
  });

  it("states the four principles in Spanish", async () => {
    const values = text(section(main(await renderEs()), "Por qué Buril"));
    for (const principle of [
      "El código es tuyo",
      "Accesible por defecto",
      "La plataforma primero",
      "Personalizable",
    ]) {
      expect(values).toContain(principle);
    }
  });

  it("explains the shadcn requirement and links the Spanish installation guide", async () => {
    const html = section(main(await renderEs()), "Instalación");
    expect(text(html)).toMatch(/Requiere un proyecto con shadcn/);
    expect(text(html)).toMatch(/components\.json/);
    expect(text(html)).toContain(
      "npx shadcn@latest registry add @buril=https://example.com/r/{name}.json",
    );
    expect(html).toContain(`href="${localizedHref("/docs/installation", "es")}"`);
  });

  it("lists both languages and x-default as alternates, on both landing pages", async () => {
    const english = await container.renderToString(IndexPage, {
      request: new Request("http://x/"),
    });
    for (const html of [english, await renderEs()]) {
      const head = html.slice(0, html.indexOf("</head>"));
      const links = [
        ...head.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g),
      ].map(([, lang, href]) => [lang, href]);
      expect(links).toEqual([
        ["en", "/"],
        ["es", "/es/"],
        ["x-default", "/"],
      ]);
    }
  });

  it("switches to the twin landing page from the header", async () => {
    const english = await container.renderToString(IndexPage, {
      request: new Request("http://x/"),
    });
    const toSpanish = /<a[^>]*data-language-switcher[^>]*>[\s\S]*?<\/a>/.exec(english)![0];
    expect(toSpanish).toMatch(/href="\/es\/"/);
    expect(text(toSpanish)).toBe("Español");
    const toEnglish = /<a[^>]*data-language-switcher[^>]*>[\s\S]*?<\/a>/.exec(await renderEs())![0];
    expect(toEnglish).toMatch(/href="\/"/);
    expect(text(toEnglish)).toBe("English");
  });
});

// The footer belongs to the landing page only: docs pages end with their content.
describe.each([
  ["/docs", DocsIndexPage],
  ["/es/docs", DocsIndexPageEs],
  ["/docs/components/button", ButtonPage],
  ["/es/docs/components/button", ButtonPageEs],
] as [string, AstroComponentFactory][])("the docs page %s", (path, page) => {
  it("renders no footer", async () => {
    const html = await container.renderToString(page, {
      request: new Request(`http://localhost${path}`),
    });
    expect(html).not.toMatch(/<footer[\s>]/);
  });
});
