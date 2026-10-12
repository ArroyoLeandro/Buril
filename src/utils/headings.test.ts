import { describe, expect, it } from "vitest";

import { collectHeadings, slugify } from "./headings";

describe("slugify", () => {
  it("lowercases, drops punctuation and joins words with hyphens", () => {
    expect(slugify("Coming from shadcn/ui")).toBe("coming-from-shadcn-ui");
    expect(slugify("  API reference ")).toBe("api-reference");
    expect(slugify("What it wires")).toBe("what-it-wires");
  });

  it("decodes entities and ignores markup inside the heading", () => {
    expect(slugify("Use <code>aria-label</code> &amp; friends")).toBe("use-aria-label-friends");
  });
});

describe("collectHeadings", () => {
  it("lists h2 and h3 in order and gives each one an id", () => {
    const { html, headings } = collectHeadings(
      `<h1>Title</h1><h2 class="x">Install</h2><p>…</p><h3>Manual</h3><h4>Deep</h4>`,
    );
    expect(headings).toEqual([
      { depth: 2, id: "install", text: "Install" },
      { depth: 3, id: "manual", text: "Manual" },
    ]);
    expect(html).toContain(`<h2 id="install" class="x">Install</h2>`);
    expect(html).toContain(`<h3 id="manual">Manual</h3>`);
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<h4>Deep</h4>");
  });

  it("keeps an id the heading already has", () => {
    const { html, headings } = collectHeadings(`<h2 class="a" id="custom">Usage</h2>`);
    expect(headings).toEqual([{ depth: 2, id: "custom", text: "Usage" }]);
    expect(html).toBe(`<h2 class="a" id="custom">Usage</h2>`);
  });

  it("makes repeated titles unique", () => {
    const { headings } = collectHeadings(`<h2>Usage</h2><h3>Usage</h3><h2>Usage</h2>`);
    expect(headings.map(({ id }) => id)).toEqual(["usage", "usage-2", "usage-3"]);
  });

  it("uses the visible text of headings with markup", () => {
    const { headings } = collectHeadings(`<h2>The <code>loading</code> prop</h2>`);
    expect(headings).toEqual([{ depth: 2, id: "the-loading-prop", text: "The loading prop" }]);
  });

  it("skips headings inside React islands, which belong to the demo", () => {
    const source = `<h2>Preview</h2><astro-island uid="1"><section><h3 id="demo-variants">Variants</h3></section></astro-island><h2>Usage</h2>`;
    const { html, headings } = collectHeadings(source);
    expect(headings.map(({ text }) => text)).toEqual(["Preview", "Usage"]);
    expect(html).toContain(`<astro-island uid="1"><section><h3 id="demo-variants">Variants</h3>`);
  });
});
