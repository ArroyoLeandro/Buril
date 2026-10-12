import { catalogCategory, type ComponentCategory } from "./catalog";
import type { Locale } from "../i18n/ui";

export type { ComponentCategory } from "./catalog";

/** A short marker shown next to the name in the sidebar. */
export type ComponentStatus = "new" | "beta";

/**
 * The documented components, in catalog order. This list is the single source for the docs
 * sidebar, the index page and each component page's title, description, install item and source.
 */
export interface DocumentedComponent {
  /** URL segment: the page lives at `src/pages/docs/components/<slug>.astro`. */
  slug: string;
  name: string;
  /** One sentence, used as the page lead and its meta description. */
  description: string;
  /** Registry item that installs it. Several pages can share one item. */
  item: string;
  /** Repository path of the file the registry item ships, shown as the page's Source. */
  source: string;
  /** Sidebar group. Optional: defaults to the component's category in COMPONENTS.md. */
  category?: ComponentCategory;
  /** Optional marker, such as "new", shown next to the sidebar link. */
  status?: ComponentStatus;
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
    slug: "card",
    name: "Card",
    description: "A bordered container with a title, a description, content and a footer.",
    item: "card",
    source: "registry/ui/card.tsx",
  },
  {
    slug: "badge",
    name: "Badge",
    description: "A small, non-interactive label whose text, not its color, carries the meaning.",
    item: "badge",
    source: "registry/ui/badge.tsx",
  },
  {
    slug: "avatar",
    name: "Avatar",
    description: "A round picture of a person that falls back to initials when there is no image.",
    item: "avatar",
    source: "registry/ui/avatar.tsx",
  },
  {
    slug: "separator",
    name: "Separator",
    description: "A horizontal or vertical line between groups of content, semantic or decorative.",
    item: "separator",
    source: "registry/ui/separator.tsx",
  },
  {
    slug: "alert",
    name: "Alert",
    description:
      "A callout with an icon, a title and a description, static unless you make it live.",
    item: "alert",
    source: "registry/ui/alert.tsx",
  },
  {
    slug: "spinner",
    name: "Spinner",
    description: "A spinning loading indicator with a hidden label, announced as a status.",
    item: "spinner",
    source: "registry/ui/spinner.tsx",
  },
  {
    slug: "skeleton",
    name: "Skeleton",
    description: "A placeholder block shown while content loads, hidden from assistive technology.",
    item: "skeleton",
    source: "registry/ui/skeleton.tsx",
  },
  {
    slug: "skip-link",
    name: "Skip Link",
    description: "A link that lets keyboard users jump past the header to the main content.",
    item: "skip-link",
    source: "registry/ui/skip-link.tsx",
  },
];

export const componentHref = (slug: string) => `/docs/components/${slug}`;

/** The entry's own category, else its catalog category, else "Other". */
export function componentCategory(entry: DocumentedComponent): ComponentCategory | "Other" {
  return entry.category ?? catalogCategory[entry.slug] ?? "Other";
}

export function findComponent(slug: string): DocumentedComponent {
  const found = documentedComponents.find((entry) => entry.slug === slug);
  if (!found) throw new Error(`No documented component with the slug "${slug}"`);
  return found;
}

/** Spanish page leads and meta descriptions, by slug. Component names stay in English. */
const spanishDescriptions: Readonly<Record<string, string>> = {
  button: "Un botón nativo con variantes, tamaños y un estado de carga.",
  "icon-button": "Un botón cuadrado que muestra solo un icono y requiere un aria-label.",
  link: "Un enlace de texto subrayado, con foco visible y una forma segura de abrir una pestaña nueva.",
  field:
    "Conecta una etiqueta, una descripción y un mensaje de error con un control de formulario.",
  input: "Un campo de texto nativo con borde visible, anillo de foco y estado no válido.",
  textarea: "Un campo de texto nativo de varias líneas, con el mismo estilo que el Input.",
  checkbox:
    "Una casilla de verificación nativa con una marca dibujada, un estado indeterminado y una etiqueta en la que se puede hacer clic.",
  "radio-group":
    "Botones de opción nativos en un fieldset: una sola parada de Tab, flechas para elegir y una leyenda como nombre.",
  switch:
    "Un control de encendido y apagado: una casilla nativa con el rol switch y un indicador deslizante.",
  select:
    "Un select nativo con estilo y su propia flecha, que conserva el selector de la plataforma.",
  card: "Un contenedor con borde, con título, descripción, contenido y pie.",
  badge: "Una etiqueta pequeña y no interactiva cuyo significado lo da el texto, no el color.",
  avatar: "Una imagen redonda de una persona que muestra sus iniciales cuando no hay imagen.",
  separator: "Una línea horizontal o vertical entre grupos de contenido, semántica o decorativa.",
  alert:
    "Un aviso destacado con icono, título y descripción, estático salvo que lo conviertas en región viva.",
  spinner: "Un indicador de carga giratorio con una etiqueta oculta, anunciado como estado.",
  skeleton:
    "Un bloque de relleno que se muestra mientras carga el contenido, oculto para las tecnologías de apoyo.",
  "skip-link":
    "Un enlace que permite a quienes usan el teclado saltar el encabezado e ir directo al contenido principal.",
};

/** The entry's one-sentence description in `locale`. */
export function componentDescription(entry: DocumentedComponent, locale: Locale): string {
  if (locale === "en") return entry.description;
  const spanish = spanishDescriptions[entry.slug];
  if (spanish === undefined) throw new Error(`No Spanish description for "${entry.slug}"`);
  return spanish;
}
