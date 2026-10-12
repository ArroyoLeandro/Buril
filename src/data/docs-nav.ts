import { componentCategories } from "./catalog";
import {
  componentCategory,
  componentHref,
  documentedComponents,
  type ComponentCategory,
  type ComponentStatus,
  type DocumentedComponent,
} from "./components";
import { localizedHref } from "../i18n/paths";
import { translator, type Locale } from "../i18n/ui";

export interface NavItem {
  name: string;
  href: string;
  status?: ComponentStatus;
}

export interface NavGroup {
  /** Translated group title. */
  title: string;
  /** The catalog category the group lists; Getting Started has none. */
  category?: ComponentCategory | "Other";
  items: NavItem[];
}

/** The Getting Started pages, with titles and links in `locale` (English until translated). */
export function gettingStarted(locale: Locale = "en"): NavItem[] {
  const t = translator(locale);
  return [
    { name: t("docsNav.introduction"), href: localizedHref("/docs", locale) },
    { name: t("docsNav.installation"), href: localizedHref("/docs/installation", locale) },
    { name: t("docsNav.theming"), href: localizedHref("/docs/theming", locale) },
  ];
}

/**
 * The docs sidebar: Getting Started, then one group per catalog category that has documented
 * components, in catalog order. Components keep their order from `components.ts`. Group titles and
 * links follow `locale`; component names are code identifiers and stay in English.
 */
export function docsNav(
  locale: Locale = "en",
  components: readonly DocumentedComponent[] = documentedComponents,
): NavGroup[] {
  const t = translator(locale);
  const order = [...componentCategories, "Other"] as const;
  const groups: NavGroup[] = order
    .map((category) => ({
      title: t(`category.${category}`),
      category,
      items: components
        .filter((entry) => componentCategory(entry) === category)
        .map(({ slug, name, status }) => ({
          name,
          href: localizedHref(componentHref(slug), locale),
          status,
        })),
    }))
    .filter(({ items }) => items.length > 0);
  return [{ title: t("docsNav.gettingStarted"), items: gettingStarted(locale) }, ...groups];
}
