import { componentCategories } from "./catalog";
import {
  componentCategory,
  componentHref,
  documentedComponents,
  type ComponentStatus,
  type DocumentedComponent,
} from "./components";

export interface NavItem {
  name: string;
  href: string;
  status?: ComponentStatus;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const gettingStarted: NavItem[] = [
  { name: "Introduction", href: "/docs" },
  { name: "Installation", href: "/docs/installation" },
  { name: "Theming", href: "/docs/theming" },
];

/**
 * The docs sidebar: Getting Started, then one group per catalog category that has documented
 * components, in catalog order. Components keep their order from `components.ts`.
 */
export function docsNav(components: readonly DocumentedComponent[] = documentedComponents) {
  const order = [...componentCategories, "Other"] as const;
  const groups: NavGroup[] = order
    .map((category) => ({
      title: category,
      items: components
        .filter((entry) => componentCategory(entry) === category)
        .map(({ slug, name, status }) => ({ name, href: componentHref(slug), status })),
    }))
    .filter(({ items }) => items.length > 0);
  return [{ title: "Getting Started", items: gettingStarted }, ...groups];
}
