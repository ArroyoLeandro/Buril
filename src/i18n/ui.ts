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
 * - Component pages: Example → Ejemplo; Preview → Vista previa; Usage → Uso; Examples → Ejemplos;
 *   API reference → Referencia de la API; Type → Tipo; Default → Valor por defecto
 * - Keys: Tab, Enter and Shift stay as printed on keyboards; Space → Espacio; Arrow keys →
 *   Flechas; Letters → Letras; press → pulsar; Tab stop → parada de Tab
 * - fieldset, legend, render prop, cloneElement and other code terms stay in English; a legend in
 *   prose → leyenda; skip link (the pattern) → enlace de salto (the component stays Skip Link)
 * - forced-colors mode → modo de colores forzados; target size → tamaño del objetivo; outline
 *   (focus) → contorno; border → borde; thumb (Switch) → indicador; track → pista; chevron → flecha
 * - stretched link → enlace extendido; callout → aviso destacado; badge → insignia (in prose,
 *   when not the component name); placeholder block → bloque de relleno; status region → región
 *   de estado; live region → región viva
 * - build time → al compilar el sitio; npm package → paquete de npm; helper stays in English
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
  "nav.menu": "Site menu",
  "theme.label": "Theme",
  "theme.current": "Theme: {choice}",
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
  "footer.licensePrefix": "Buril UI is open source under the",
  "footer.licenseLink": "MIT license",
  "footer.source": "Source on",
  "install.managers": "Package manager",
  "install.copy": "Copy",
  "install.copyLabel": "Copy {name} command",
  "install.copied": "Copied the {name} command.",
  "install.copyFailed": "Could not copy. Select the command and copy it manually.",
  "install.placeholder":
    "example.com is a placeholder until the registry is hosted; the paths after it stay the same.",
  "landing.title": "Accessible|components,|{engraved} to last",
  "landing.titleEngraved": "engraved",
  "landing.count": "{count} components",
  "landing.changelog": "See the changelog",
  "landing.lead":
    "React components that the shadcn CLI copies into your project as source you can edit. Each one ships with keyboard and accessibility-tree tests.",
  "landing.getStarted": "Get started",
  "landing.browse": "Browse components",
  "landing.traitNative": "Native HTML",
  "landing.traitKeyboard": "Keyboard first",
  "landing.traitContrast": "AA in both themes",
  "landing.showcase": "Examples built with Buril UI",
  "landing.viewCode": "View code",
  "landing.viewCodeFor": "for {name}",
  "landing.cellTeam": "Team",
  "landing.captionTeam": "Avatars with initials, and a Badge for each role.",
  "landing.cellSettings": "Settings",
  "landing.captionSettings": "A Switch, a Checkbox and a Separator in one Card.",
  "landing.cellCheckbox": "Checkbox",
  "landing.captionCheckbox": "The check draws in like a burin stroke.",
  "landing.cellField": "Field",
  "landing.captionField": "Screen readers announce the error. Add the domain to clear it.",
  "landing.cellAlert": "Alert",
  "landing.cellButtons": "Button",
  "landing.captionButtons": "Pill-shaped, from 32 to 48 pixels tall.",
  "landing.cellGestures": "Gestures",
  "landing.captionGestures": "Hover or Tab to them. Each gesture plays once.",
  "landing.closingTitle": "Add your first component",
  "landing.closingBody":
    "The installation guide takes two commands: one registers Buril, the other copies a component into your project.",
  "landing.readDocs": "Read the docs",
  "tokens.token": "Token",
  "tokens.caption": "Buril values for each token, read from `registry/styles/buril.css`.",
  "component.example": "Example",
  "component.preview": "Preview",
  "component.code": "Code",
  "component.noDemoSource": "This demo has no source file yet.",
  "component.installation": "Installation",
  "component.installMethod": "Installation method",
  "component.cli": "CLI",
  "component.manual": "Manual",
  "component.installFromUrl": "Install the component from its URL:",
  "component.installByName": "Or add the Buril namespace once and install by name:",
  "component.cnNote":
    "Every component imports `cn()` from shadcn's `utils` item. The current version of that item re-exports `cn()` from the `cn` npm package, so when the CLI installs or updates `lib/utils.ts`, it also adds `cn` to your dependencies. If your `lib/utils.ts` differs from the current shadcn version, the CLI asks before replacing it, and answering no is safe.",
  "component.installDependencies": "Install the dependencies:",
  "component.checkUtils": "Check that `lib/utils.ts` exports `cn()`. shadcn's `init` creates it.",
  "component.copySource":
    "Copy the source into `components/ui/{file}`. It is read from `{source}` at build time.",
  "component.copyKeyframes":
    "Paste the icon `motion` keyframes into your global CSS. Without them, IconButton icons stay still.",
  "component.usage": "Usage",
  "component.examples": "Examples",
  "component.api": "API reference",
  "component.prop": "Prop",
  "component.type": "Type",
  "component.default": "Default",
  "component.propsLabel": "{name} props",
  "component.description": "Description",
  "component.none": "None",
  "component.accessibility": "Accessibility",
  "component.keyboard": "Keyboard",
  "component.key": "Key",
  "component.action": "Action",
  "component.noKeyboard": "No keyboard interaction",
  "component.role": "Role",
  "component.states": "States",
  "component.notes": "Notes",
  "component.aria": "ARIA",
  "component.noKeyboardDetail": "No keyboard interaction: the component itself never takes focus.",
  "docsNav.accessibility": "Accessibility",
  "a11y.rule": "Rule",
  "a11y.rulesCaption": "The 11 rules every component follows, and how each is checked.",
  "a11y.howChecked": "How it is checked",
  "a11y.checkedBy": "Checked by:",
  "a11y.check": "Check",
  "a11y.whatItDoes": "What it does",
  "a11y.status": "Status",
  "a11y.automated": "Automated",
  "a11y.pending": "Pending",
  "a11y.checksCaption": "The kinds of check behind the rules.",
  "a11y.component": "Component",
  "a11y.aria": "Role and states",
  "a11y.componentsCaption": "Keyboard and screen reader behavior of every component.",
  "docsNav.motion": "Motion",
  "docsNav.guides": "Guides",
  "docsNav.faq": "FAQ",
  "docsNav.changelog": "Changelog",
  "faq.readMore": "Read more:",
  "migration.caption": "What changes from the shadcn/ui component, for each Buril component.",
  "migration.changes": "What changes",
  "motion.value": "Value",
  "motion.use": "Used for",
  "motion.tokensCaption": "Motion tokens, read from `registry/styles/buril.css`.",
  "motion.withMotion": "With motion",
  "motion.reduced": "With reduced motion",
  "motion.reducedCaption": "What each moving part does, with and without reduced motion.",
  "motion.preset": "Preset",
  "motion.for": "For",
  "motion.gesture": "Gesture",
  "motion.duration": "Duration",
  "motion.presetsCaption": "The IconButton `motion` presets, timed from the tokens above.",
} as const;

export type UiKey = keyof typeof en;

const es: Record<UiKey, string> = {
  "site.description": "Componentes de React accesibles que copias en tu proyecto.",
  skipLink: "Saltar al contenido",
  "nav.main": "Principal",
  "nav.docs": "Documentación",
  "nav.components": "Componentes",
  "nav.menu": "Menú del sitio",
  "theme.label": "Tema",
  "theme.current": "Tema: {choice}",
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
  "footer.licensePrefix": "Buril UI es de código abierto con la",
  "footer.licenseLink": "licencia MIT",
  "footer.source": "Código fuente en",
  "install.managers": "Gestor de paquetes",
  "install.copy": "Copiar",
  "install.copyLabel": "Copiar el comando de {name}",
  "install.copied": "Se copió el comando de {name}.",
  "install.copyFailed": "No se pudo copiar. Selecciona el comando y cópialo manualmente.",
  "install.placeholder":
    "example.com es provisional hasta que el registry esté publicado; las rutas que siguen no cambian.",
  "landing.title": "Componentes|accesibles,|{engraved} para durar",
  "landing.titleEngraved": "grabados",
  "landing.count": "{count} componentes",
  "landing.changelog": "Ver los cambios",
  "landing.lead":
    "Componentes de React que la CLI de shadcn copia en tu proyecto como código fuente que puedes editar. Cada uno incluye tests de teclado y del árbol de accesibilidad.",
  "landing.getStarted": "Empezar",
  "landing.browse": "Explorar los componentes",
  "landing.traitNative": "HTML nativo",
  "landing.traitKeyboard": "Primero el teclado",
  "landing.traitContrast": "AA en los dos temas",
  "landing.showcase": "Ejemplos hechos con Buril UI",
  "landing.viewCode": "Ver código",
  "landing.viewCodeFor": "de {name}",
  "landing.cellTeam": "Equipo",
  "landing.captionTeam": "Avatars con iniciales y un Badge para cada rol.",
  "landing.cellSettings": "Ajustes",
  "landing.captionSettings": "Un Switch, un Checkbox y un Separator en una Card.",
  "landing.cellCheckbox": "Checkbox",
  "landing.captionCheckbox": "La marca se dibuja como un trazo de buril.",
  "landing.cellField": "Field",
  "landing.captionField":
    "Los lectores de pantalla anuncian el error. Agrega el dominio para quitarlo.",
  "landing.cellAlert": "Alert",
  "landing.cellButtons": "Button",
  "landing.captionButtons": "Con forma de píldora, de 32 a 48 píxeles de alto.",
  "landing.cellGestures": "Gestos",
  "landing.captionGestures": "Pasa el puntero o llega con Tab. Cada gesto se reproduce una vez.",
  "landing.closingTitle": "Agrega tu primer componente",
  "landing.closingBody":
    "La guía de instalación usa dos comandos: uno registra Buril y el otro copia un componente en tu proyecto.",
  "landing.readDocs": "Lee la documentación",
  "tokens.token": "Token",
  "tokens.caption": "Valores de Buril para cada token, leídos de `registry/styles/buril.css`.",
  "component.example": "Ejemplo",
  "component.preview": "Vista previa",
  "component.code": "Código",
  "component.noDemoSource": "Esta demo todavía no tiene un archivo fuente.",
  "component.installation": "Instalación",
  "component.installMethod": "Método de instalación",
  "component.cli": "CLI",
  "component.manual": "Manual",
  "component.installFromUrl": "Instala el componente desde su URL:",
  "component.installByName":
    "O registra el namespace de Buril una sola vez e instálalo por nombre:",
  "component.cnNote":
    "Todos los componentes importan `cn()` del item `utils` de shadcn. La versión actual de ese item reexporta `cn()` desde el paquete de npm `cn`, así que, cuando la CLI instala o actualiza `lib/utils.ts`, también agrega `cn` a tus dependencias. Si tu `lib/utils.ts` es distinto de la versión actual de shadcn, la CLI pregunta antes de reemplazarlo, y puedes responder que no sin problema.",
  "component.installDependencies": "Instala las dependencias:",
  "component.checkUtils":
    "Comprueba que `lib/utils.ts` exporte `cn()`. El `init` de shadcn lo crea.",
  "component.copySource":
    "Copia el código fuente en `components/ui/{file}`. Se lee de `{source}` al compilar el sitio.",
  "component.copyKeyframes":
    "Pega los keyframes de `motion` de los iconos en tu CSS global. Sin ellos, los iconos de IconButton no se mueven.",
  "component.usage": "Uso",
  "component.examples": "Ejemplos",
  "component.api": "Referencia de la API",
  "component.prop": "Prop",
  "component.type": "Tipo",
  "component.default": "Valor por defecto",
  "component.propsLabel": "Props de {name}",
  "component.description": "Descripción",
  "component.none": "Ninguno",
  "component.accessibility": "Accesibilidad",
  "component.keyboard": "Teclado",
  "component.key": "Tecla",
  "component.action": "Acción",
  "component.noKeyboard": "Sin interacción con el teclado",
  "component.role": "Rol",
  "component.states": "Estados",
  "component.notes": "Notas",
  "component.aria": "ARIA",
  "component.noKeyboardDetail":
    "Sin interacción con el teclado: el componente en sí nunca recibe el foco.",
  "docsNav.accessibility": "Accesibilidad",
  "a11y.rule": "Regla",
  "a11y.rulesCaption": "Las 11 reglas que sigue cada componente y cómo se comprueba cada una.",
  "a11y.howChecked": "Cómo se comprueba",
  "a11y.checkedBy": "Lo comprueban:",
  "a11y.check": "Comprobación",
  "a11y.whatItDoes": "Qué hace",
  "a11y.status": "Estado",
  "a11y.automated": "Automática",
  "a11y.pending": "Pendiente",
  "a11y.checksCaption": "Los tipos de comprobación detrás de las reglas.",
  "a11y.component": "Componente",
  "a11y.aria": "Rol y estados",
  "a11y.componentsCaption":
    "Comportamiento con el teclado y el lector de pantalla de cada componente.",
  "docsNav.motion": "Movimiento",
  "docsNav.guides": "Guías",
  "docsNav.faq": "Preguntas frecuentes",
  "docsNav.changelog": "Cambios",
  "faq.readMore": "Más información:",
  "migration.caption":
    "Qué cambia respecto del componente de shadcn/ui, para cada componente de Buril.",
  "migration.changes": "Qué cambia",
  "motion.value": "Valor",
  "motion.use": "Uso",
  "motion.tokensCaption": "Tokens de movimiento, leídos de `registry/styles/buril.css`.",
  "motion.withMotion": "Con movimiento",
  "motion.reduced": "Con movimiento reducido",
  "motion.reducedCaption": "Qué hace cada parte que se mueve, con y sin movimiento reducido.",
  "motion.preset": "Preset",
  "motion.for": "Para",
  "motion.gesture": "Gesto",
  "motion.duration": "Duración",
  "motion.presetsCaption":
    "Los presets de `motion` del IconButton, con la duración calculada a partir de los tokens de arriba.",
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
