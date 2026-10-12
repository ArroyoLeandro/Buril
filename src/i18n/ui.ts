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
  "landing.lead": "Accessible React components you copy into your project and make your own.",
  "landing.sublead":
    "Styled with Tailwind CSS, installed with the shadcn CLI, and tested with the keyboard and the accessibility tree in mind.",
  "landing.getStarted": "Get started",
  "landing.why": "Why Buril",
  "landing.ownTitle": "You own the code",
  "landing.ownBody":
    "Components are copied into your project as source, not installed as a dependency. Edit them freely.",
  "landing.accessibleTitle": "Accessible by default",
  "landing.accessibleBody":
    "Every component targets WCAG 2.2 AA and follows its WAI-ARIA pattern, with keyboard and screen reader tests.",
  "landing.platformTitle": "Platform first",
  "landing.platformBody":
    "Native elements and browser features come before JavaScript: a select stays a select, a link stays a link.",
  "landing.themeableTitle": "Themeable",
  "landing.themeableBody":
    "Components read the standard shadcn tokens, so your palette applies without touching a component.",
  "landing.atWork": "Components at work",
  "landing.atWorkBody":
    "These panels use the same files the registry ships. Try them with the keyboard: every control has a visible focus ring and a label, and each change is announced.",
  "landing.panelSignIn": "Sign in",
  "landing.panelSettings": "Notifications",
  "landing.panelButtons": "Buttons",
  "landing.componentsUsed": "Components used",
  "landing.install": "Install",
  "landing.installBody":
    "In a project set up with shadcn, add the Buril namespace once, then install components by name.",
  "landing.requirementTitle": "Needs a shadcn project",
  "landing.requirementBody":
    "Your project needs a `components.json` file. If it does not have one, run `npx shadcn@latest init` first.",
  "landing.guide": "Read the installation guide",
  "tokens.token": "Token",
  "tokens.caption": "Buril values for each token, read from `registry/styles/buril.css`.",
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
  "landing.lead": "Componentes de React accesibles que copias en tu proyecto y haces tuyos.",
  "landing.sublead":
    "Estilizados con Tailwind CSS, se instalan con la CLI de shadcn y se prueban teniendo en cuenta el teclado y el árbol de accesibilidad.",
  "landing.getStarted": "Empezar",
  "landing.why": "Por qué Buril",
  "landing.ownTitle": "El código es tuyo",
  "landing.ownBody":
    "Los componentes se copian en tu proyecto como código fuente, no se instalan como una dependencia. Puedes editarlos sin restricciones.",
  "landing.accessibleTitle": "Accesible por defecto",
  "landing.accessibleBody":
    "Todos los componentes apuntan a WCAG 2.2 AA y siguen su patrón de WAI-ARIA, con tests de teclado y de lector de pantalla.",
  "landing.platformTitle": "La plataforma primero",
  "landing.platformBody":
    "Los elementos nativos y las funciones del navegador van antes que JavaScript: un select sigue siendo un select y un enlace sigue siendo un enlace.",
  "landing.themeableTitle": "Personalizable",
  "landing.themeableBody":
    "Los componentes leen los tokens estándar de shadcn, así que tu paleta se aplica sin tocar ningún componente.",
  "landing.atWork": "Componentes en acción",
  "landing.atWorkBody":
    "Estos paneles usan los mismos archivos que distribuye el registry. Pruébalos con el teclado: cada control tiene un anillo de foco visible y una etiqueta, y cada cambio se anuncia.",
  "landing.panelSignIn": "Iniciar sesión",
  "landing.panelSettings": "Notificaciones",
  "landing.panelButtons": "Botones",
  "landing.componentsUsed": "Componentes usados",
  "landing.install": "Instalación",
  "landing.installBody":
    "En un proyecto configurado con shadcn, registra el namespace de Buril una sola vez y después instala los componentes por nombre.",
  "landing.requirementTitle": "Requiere un proyecto con shadcn",
  "landing.requirementBody":
    "Tu proyecto necesita un archivo `components.json`. Si no lo tiene, ejecuta primero `npx shadcn@latest init`.",
  "landing.guide": "Lee la guía de instalación",
  "tokens.token": "Token",
  "tokens.caption": "Valores de Buril para cada token, leídos de `registry/styles/buril.css`.",
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
