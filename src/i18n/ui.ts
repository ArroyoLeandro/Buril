/**
 * Docs-site UI strings in English and Spanish. Every key exists in both languages; `ui.test.ts`
 * fails on a missing or empty one, and TypeScript fails when the Spanish table drops a key.
 *
 * Spanish register: neutral and professional, addressing the reader as "tú" (no voseo).
 *
 * Glossary, used the same way on every page:
 * - Kept in English, as Spanish-speaking developers use them: registry, token, props, prop, hook,
 *   render prop, namespace, slot, island, CLI, focus ring (as "anillo de foco" in prose), and every
 *   component name (Button, Radio Group, Skip Link), because they are also code identifiers.
 * - accessible name → nombre accesible; screen reader → lector de pantalla; keyboard → teclado
 * - live region → región viva; status region → región de estado; announce → anunciar
 * - focus → foco (verb: enfocar, "recibe el foco"); visible focus → foco visible
 * - theme → tema; dark mode → modo oscuro; light/dark/system → claro/oscuro/sistema
 * - install → instalar; copy into your project → copiar en tu proyecto; dependency → dependencia
 * - variant → variante; size → tamaño; state → estado; disabled → deshabilitado
 * - label → etiqueta; description → descripción; error message → mensaje de error
 * - required → obligatorio; invalid → no válido; placeholder → texto de ejemplo
 * - loading → carga / cargando; reduced motion → movimiento reducido
 * - forced colors → colores forzados; contrast → contraste; target size → tamaño del objetivo
 * - Getting Started → Primeros pasos; Theming → Temas; On this page → En esta página
 * - Feedback (category) → Avisos y estados; Overlays → Superposiciones
 */
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Each language's name in that language, for the language switcher. */
export const localeNames: Record<Locale, string> = { en: "English", es: "Español" };

const en = {
  "site.description": "Accessible React components you copy into your project.",
  skipLink: "Skip to content",
  "nav.main": "Main",
  "nav.docs": "Docs",
  "nav.components": "Components",
  "theme.label": "Theme",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "System",
  "docsNav.label": "Docs",
  "docsNav.menu": "Menu",
  "docsNav.gettingStarted": "Getting Started",
  "docsNav.introduction": "Introduction",
  "docsNav.installation": "Installation",
  "docsNav.theming": "Theming",
  "status.new": "New",
  "status.beta": "Beta",
  "category.Actions": "Actions",
  "category.Forms": "Forms",
  "category.Content": "Content",
  "category.Feedback": "Feedback",
  "category.Overlays": "Overlays",
  "category.Navigation": "Navigation",
  "category.Advanced": "Advanced",
  "category.Other": "Other",
  "toc.title": "On this page",
  "footer.licensePrefix": "Buril UI is released under the",
  "footer.licenseLink": "MIT license",
  "footer.source": "Source code on",
  "install.managers": "Package manager",
  "install.copy": "Copy",
  "install.copyLabel": "Copy {name} command",
  "install.copied": "Copied the {name} command.",
  "install.copyFailed": "Could not copy. Select the command and copy it manually.",
} as const;

export type UiKey = keyof typeof en;

const es: Record<UiKey, string> = {
  "site.description": "Componentes de React accesibles que copias en tu proyecto.",
  skipLink: "Saltar al contenido",
  "nav.main": "Principal",
  "nav.docs": "Documentación",
  "nav.components": "Componentes",
  "theme.label": "Tema",
  "theme.light": "Claro",
  "theme.dark": "Oscuro",
  "theme.system": "Sistema",
  "docsNav.label": "Documentación",
  "docsNav.menu": "Menú",
  "docsNav.gettingStarted": "Primeros pasos",
  "docsNav.introduction": "Introducción",
  "docsNav.installation": "Instalación",
  "docsNav.theming": "Temas",
  "status.new": "Nuevo",
  "status.beta": "Beta",
  "category.Actions": "Acciones",
  "category.Forms": "Formularios",
  "category.Content": "Contenido",
  "category.Feedback": "Avisos y estados",
  "category.Overlays": "Superposiciones",
  "category.Navigation": "Navegación",
  "category.Advanced": "Avanzados",
  "category.Other": "Otros",
  "toc.title": "En esta página",
  "footer.licensePrefix": "Buril UI se distribuye bajo la",
  "footer.licenseLink": "licencia MIT",
  "footer.source": "Código fuente en",
  "install.managers": "Gestor de paquetes",
  "install.copy": "Copiar",
  "install.copyLabel": "Copiar el comando de {name}",
  "install.copied": "Se copió el comando de {name}.",
  "install.copyFailed": "No se pudo copiar. Selecciona el comando y cópialo manualmente.",
};

export const ui: Record<Locale, Record<UiKey, string>> = { en, es };

/** The locale of a URL or path: `/es` and everything under `/es/` is Spanish. */
export function getLocale(url: URL | string): Locale {
  const path = typeof url === "string" ? url : url.pathname;
  return /^\/es(\/|$)/.test(path) ? "es" : defaultLocale;
}

/** A translator for one locale. `{name}` placeholders are filled from `values`. */
export function translator(locale: Locale) {
  return (key: UiKey, values: Record<string, string> = {}) =>
    ui[locale][key].replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}
