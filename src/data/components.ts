/**
 * The documented components, in catalog order. This list is the single source for the header
 * nav, the index page and each component page's title, description, install item and source.
 */
export interface DocumentedComponent {
  /** URL segment: the page lives at `src/pages/components/<slug>.astro`. */
  slug: string;
  name: string;
  /** One sentence, used as the page lead and its meta description. */
  description: string;
  /** Registry item that installs it. Several pages can share one item. */
  item: string;
  /** Repository path of the file the registry item ships, shown as the page's Source. */
  source: string;
}

export const documentedComponents: readonly DocumentedComponent[] = [
  {
    slug: "button",
    name: "Button",
    description: "A native button with variants, sizes and a loading state.",
    item: "button",
    source: "registry/ui/button.tsx",
  },
];

export const componentHref = (slug: string) => `/components/${slug}`;

export function findComponent(slug: string): DocumentedComponent {
  const found = documentedComponents.find((entry) => entry.slug === slug);
  if (!found) throw new Error(`No documented component with the slug "${slug}"`);
  return found;
}
