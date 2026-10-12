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

describe("landing page", () => {
  it("has a hero with the name, a one-line value proposition and two link CTAs", async () => {
    const html = main(await render());
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(text(/<h1[^>]*>[\s\S]*?<\/h1>/.exec(html)![0])).toBe("Buril UI");
    expect(text(html)).toMatch(/Accessible React components you copy into your project/);
    // Real links styled as pill buttons, never a button that navigates.
    expect(html).toMatch(
      /<a[^>]+href="\/docs"[^>]+class="[^"]*rounded-full[^"]*"[^>]*>\s*Get started/,
    );
    expect(html).toMatch(
      /<a[^>]+href="\/docs\/components"[^>]+class="[^"]*rounded-full[^"]*"[^>]*>\s*Components/,
    );
  });

  it("keeps the engraved illustration out of the accessibility tree", async () => {
    const html = main(await render());
    const svgs = [...html.matchAll(/<svg\b[^>]*>/g)].map(([tag]) => tag);
    const art = svgs.filter((tag) => tag.includes("data-engraving"));
    expect(art).toHaveLength(1);
    expect(art[0]).toMatch(/aria-hidden="true"/);
    expect(art[0]).toMatch(/focusable="false"/);
    expect(html).not.toMatch(/role="img"/);
  });

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

  it("shows real components at work in three live panels", async () => {
    const html = section(main(await render()), "Components at work");
    expect(html.match(/<astro-island/g)).toHaveLength(3);
    // Server-rendered markup of the real components, readable before hydration.
    expect(html).toMatch(/<input[^>]+type="email"/);
    expect(html).toMatch(/<input[^>]+type="checkbox"(?![^>]*role="switch")/);
    expect(html).toMatch(/<input[^>]+role="switch"/);
    expect(html).toMatch(/<fieldset/);
    expect(html).toMatch(/<select/);
    expect(html).toMatch(/<button[^>]+type="submit"/);
  });

  it("frames each live panel in a real Card with a heading and the engraved band", async () => {
    const html = section(main(await render()), "Components at work");
    const cards = html.split(/(?=<div[^>]*data-slot="card")/).slice(1);
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(card).toMatch(/^<div[^>]*class="[^"]*\bborder-border\b/);
      expect(card).toMatch(/<div[^>]*data-decor[^>]*aria-hidden="true"/);
      expect(card).toMatch(/<h3[^>]*data-slot="card-title"/);
      // The island sits in the card's content, so the panel reads as one unit.
      expect(card).toMatch(/data-slot="card-content"[\s\S]*<astro-island/);
    }
    const titles = cards.map((card) => text(/<h3[^>]*>[\s\S]*?<\/h3>/.exec(card)![0]));
    expect(titles).toEqual(["Sign in", "Notifications", "Buttons"]);
  });

  it("names the components each panel uses with badges, not links or buttons", async () => {
    const html = section(main(await render()), "Components at work");
    const badges = [...html.matchAll(/<span[^>]*data-slot="badge"[^>]*>([\s\S]*?)<\/span>/g)];
    expect(badges.map(([, label]) => text(label!))).toEqual([
      "Field",
      "Input",
      "Checkbox",
      "Button",
      "Field",
      "Switch",
      "Radio Group",
      "Select",
      "Button",
    ]);
    for (const [badge] of badges) expect(badge).not.toMatch(/tabindex|role=/);
    expect(html.match(/<ul[^>]*aria-label="Components used"/g)).toHaveLength(3);
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

  it("has the Spanish hero and calls to action that stay in Spanish", async () => {
    const html = main(await renderEs());
    expect(text(/<h1[^>]*>[\s\S]*?<\/h1>/.exec(html)![0])).toBe("Buril UI");
    expect(text(html)).toMatch(/Componentes de React accesibles que copias en tu proyecto/);
    // The Spanish page, or the English one until it is translated.
    const docs = localizedHref("/docs", "es");
    const components = localizedHref("/docs/components", "es");
    expect(html).toMatch(new RegExp(`<a[^>]+href="${docs}"[^>]*>\\s*Empezar`));
    expect(html).toMatch(new RegExp(`<a[^>]+href="${components}"[^>]*>\\s*Componentes`));
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

  it("shows the live panels with Spanish titles and Spanish controls", async () => {
    const html = section(main(await renderEs()), "Componentes en acción");
    expect(html.match(/<astro-island/g)).toHaveLength(3);
    const titles = [...html.matchAll(/<h3[^>]*data-slot="card-title"[^>]*>([\s\S]*?)<\/h3>/g)].map(
      ([, title]) => text(title!),
    );
    expect(titles).toEqual(["Iniciar sesión", "Notificaciones", "Botones"]);
    // Server-rendered island markup is already Spanish, and the islands hydrate in Spanish.
    expect(text(html)).toContain("Mantener la sesión iniciada");
    expect(text(html)).toContain("Notificaciones por correo");
    expect(text(html)).toContain("Guardar borrador");
    for (const island of html.match(/<astro-island[^>]*>/g)!) {
      expect(island).toMatch(/props="[^"]*locale[^"]*es/);
    }
    expect(html.match(/<ul[^>]*aria-label="Componentes usados"/g)).toHaveLength(3);
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
