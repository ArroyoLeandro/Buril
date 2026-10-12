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
  {
    slug: "icon-button",
    name: "Icon Button",
    description: "A square button that shows only an icon and requires an aria-label.",
    item: "button",
    source: "registry/ui/button.tsx",
  },
  {
    slug: "link",
    name: "Link",
    description: "An underlined text link with visible focus and a safe way to open a new tab.",
    item: "link",
    source: "registry/ui/link.tsx",
  },
  {
    slug: "field",
    name: "Field",
    description: "Wires a label, a description and an error message to one form control.",
    item: "field",
    source: "registry/ui/field.tsx",
  },
  {
    slug: "input",
    name: "Input",
    description: "A native text input with a visible border, focus ring and invalid state.",
    item: "input",
    source: "registry/ui/input.tsx",
  },
  {
    slug: "textarea",
    name: "Textarea",
    description: "A native multi-line text field styled to match the Input.",
    item: "textarea",
    source: "registry/ui/textarea.tsx",
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    description:
      "A native checkbox with a drawn check, an indeterminate state and a clickable label.",
    item: "checkbox",
    source: "registry/ui/checkbox.tsx",
  },
  {
    slug: "radio-group",
    name: "Radio Group",
    description:
      "Native radios in a fieldset: one Tab stop, arrow keys to choose, a legend as its name.",
    item: "radio-group",
    source: "registry/ui/radio-group.tsx",
  },
  {
    slug: "switch",
    name: "Switch",
    description: "An on/off control: a native checkbox with the switch role and a sliding thumb.",
    item: "switch",
    source: "registry/ui/switch.tsx",
  },
  {
    slug: "select",
    name: "Select",
    description: "A styled native select with its own chevron, which keeps the platform's picker.",
    item: "select",
    source: "registry/ui/select.tsx",
  },
  {
    slug: "skip-link",
    name: "Skip Link",
    description: "A link that lets keyboard users jump past the header to the main content.",
    item: "skip-link",
    source: "registry/ui/skip-link.tsx",
  },
];

export const componentHref = (slug: string) => `/components/${slug}`;

export function findComponent(slug: string): DocumentedComponent {
  const found = documentedComponents.find((entry) => entry.slug === slug);
  if (!found) throw new Error(`No documented component with the slug "${slug}"`);
  return found;
}
