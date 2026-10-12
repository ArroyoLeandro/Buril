/**
 * Build-time helpers for the docs "On this page" list. Astro pages are not Markdown, so their
 * headings are read from the rendered HTML of the page content.
 */
export interface Heading {
  depth: 2 | 3;
  id: string;
  text: string;
}

const entities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
};

/** Visible text of an HTML fragment: tags removed, common entities decoded, spaces collapsed. */
export function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|#x27);/g, (entity) => entities[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(html: string) {
  return plainText(html)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // "Instalación" → "instalacion", not "instalaci-n"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const heading = /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g;

/**
 * Gives every h2 and h3 an id (keeping one it already has) and lists them in order. Markup inside
 * React islands is left alone: a demo's headings belong to the demo, not to the page outline.
 */
export function collectHeadings(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();

  const unique = (base: string) => {
    let id = base || "section";
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };

  const process = (segment: string) =>
    segment.replace(heading, (match, depth: string, attributes = "", inner: string) => {
      const existing = /\sid="([^"]+)"/.exec(attributes)?.[1];
      const id = existing ?? unique(slugify(inner));
      if (existing) used.add(existing);
      headings.push({ depth: Number(depth) as 2 | 3, id, text: plainText(inner) });
      return existing ? match : `<h${depth} id="${id}"${attributes}>${inner}</h${depth}>`;
    });

  const parts = html.split(/(<astro-island[\s\S]*?<\/astro-island>)/);
  const output = parts
    .map((part) => (part.startsWith("<astro-island") ? part : process(part)))
    .join("");
  return { html: output, headings };
}
