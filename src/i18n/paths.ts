import { getRelativeLocaleUrl } from "astro:i18n";

import { getLocale, locales, type Locale } from "./ui";

/**
 * Locale-aware page paths. English pages are unprefixed (`/docs`) and Spanish pages live under
 * `/es/` (`/es/docs`), as Astro's i18n routing builds them with `prefixDefaultLocale: false`.
 * Paths keep the site's style: no trailing slash, except a locale's home page (`/`, `/es/`).
 */

/** The same page path in `locale`, built with Astro's `getRelativeLocaleUrl`. */
export function localizePath(path: string, locale: Locale) {
  const page = unlocalizePath(path).replace(/^\//, "");
  const url = getRelativeLocaleUrl(locale, page);
  return page === "" ? url : url.replace(/\/$/, "");
}

/** The page a path shows, without its locale prefix or trailing slash: `/es/docs/` → `/docs`. */
export function unlocalizePath(path: string) {
  const page = getLocale(path) === "es" ? path.replace(/^\/es/, "") : path;
  return page.replace(/(.)\/$/, "$1") || "/";
}

/** The URL of a page file under `src/pages`: `../pages/docs/index.astro` → `/docs`. */
export function routeOf(file: string) {
  const route = file
    .replace(/^.*?\/pages/, "")
    .replace(/\.astro$/, "")
    .replace(/\/index$/, "");
  return route === "/es" ? "/es/" : route || "/";
}

/** Every page the site builds, by URL. Only the file names are read, never the modules. */
export const pageRoutes: readonly string[] = Object.keys(
  import.meta.glob("../pages/**/*.astro"),
).map(routeOf);

/**
 * The language versions of a page, in locale order, when it has more than one: the hreflang
 * alternates and the language switcher's targets. A page not translated yet has none.
 */
export function alternates(path: string, routes: readonly string[] = pageRoutes) {
  const versions = locales
    .map((locale) => ({ locale, href: localizePath(path, locale) }))
    .filter(({ href }) => routes.includes(href));
  return versions.length > 1 ? versions : [];
}
