import type { Locale } from "../i18n/ui";

/**
 * The Accessibility page's content: the 11 rules of COMPONENTS.md in plain words, the kinds of
 * check that enforce them and the known limits, in English and Spanish. Text may use `backticks`
 * for inline code. `test/docs/accessibility-page.test.ts` keeps the rule titles equal to
 * COMPONENTS.md, so the page and the rules cannot drift apart.
 */
export type Text = Record<Locale, string>;

export type CheckId =
  "behavior" | "axe" | "types" | "lint" | "styles" | "tokens" | "browser" | "manual";

export interface Check {
  name: Text;
  description: Text;
  /** Whether the check runs today. Only the manual screen reader pass is still pending. */
  status: "automated" | "pending";
}

export const accessibilityChecks: Record<CheckId, Check> = {
  behavior: {
    name: { en: "Behavior tests", es: "Tests de comportamiento" },
    description: {
      en: "Testing Library in jsdom. Tests find controls by role and name, as a screen reader does, and press Tab, Enter, Space and the arrow keys with `user-event`.",
      es: "Testing Library en jsdom. Los tests buscan cada control por su rol y su nombre, como lo hace un lector de pantalla, y pulsan Tab, Enter, Espacio y las flechas con `user-event`.",
    },
    status: "automated",
  },
  axe: {
    name: { en: "axe", es: "axe" },
    description: {
      en: "Every component test file runs `axe` on the rendered markup, and every docs page is checked with axe in both languages.",
      es: "Cada archivo de tests de un componente ejecuta `axe` sobre el marcado renderizado, y cada página de la documentación se revisa con axe en los dos idiomas.",
    },
    status: "automated",
  },
  types: {
    name: { en: "TypeScript", es: "TypeScript" },
    description: {
      en: "Props that give a name are required by the types: `aria-label` on IconButton, `alt` on Avatar, `legend` on RadioGroup and `label` on Field. Leaving one out does not compile.",
      es: "Las props que dan un nombre son obligatorias en los tipos: `aria-label` en IconButton, `alt` en Avatar, `legend` en RadioGroup y `label` en Field. Si falta una, el código no compila.",
    },
    status: "automated",
  },
  lint: {
    name: { en: "Lint", es: "Lint" },
    description: {
      en: "ESLint with the `jsx-a11y` rules, in components, demos and Astro pages: no click handlers on static elements, labels tied to controls, valid ARIA.",
      es: "ESLint con las reglas de `jsx-a11y`, en componentes, demos y páginas de Astro: nada de manejadores de clic en elementos estáticos, etiquetas asociadas a sus controles y ARIA válido.",
    },
    status: "automated",
  },
  styles: {
    name: { en: "Compiled styles", es: "Estilos compilados" },
    description: {
      en: "jsdom applies no CSS, so these tests compile the real stylesheet with Tailwind and check which rule wins: focus outlines, sizes, `motion-safe` gating and forced-colors mode.",
      es: "jsdom no aplica CSS, así que estos tests compilan la hoja de estilos real con Tailwind y comprueban qué regla gana: contornos de foco, tamaños, el uso de `motion-safe` y el modo de colores forzados.",
    },
    status: "automated",
  },
  tokens: {
    name: { en: "Token contrast", es: "Contraste de los tokens" },
    description: {
      en: "Parses the theme, resolves `var()` and `color-mix()`, and measures every WCAG contrast pair in light and dark mode.",
      es: "Lee el tema, resuelve `var()` y `color-mix()`, y mide cada par de contraste de WCAG en modo claro y oscuro.",
    },
    status: "automated",
  },
  browser: {
    name: { en: "Real browser", es: "Navegador real" },
    description: {
      en: "Vitest browser mode in headless Chromium: real focus, computed colors in both themes, geometry, transitions with reduced motion on and off, and whole docs pages at 320px.",
      es: "El modo navegador de Vitest en Chromium sin interfaz: foco real, colores calculados en los dos temas, geometría, transiciones con y sin movimiento reducido, y páginas completas de la documentación a 320px.",
    },
    status: "automated",
  },
  manual: {
    name: { en: "Screen reader pass", es: "Prueba con lector de pantalla" },
    description: {
      en: "A manual pass with NVDA. It is required for the overlay and advanced components still to come; no pass has been recorded for the current components yet.",
      es: "Una prueba manual con NVDA. Es obligatoria para los componentes superpuestos y avanzados que todavía no existen; aún no se registró ninguna prueba de los componentes actuales.",
    },
    status: "pending",
  },
};

export interface AccessibilityRule {
  number: number;
  /** The rule's title, as in COMPONENTS.md. */
  title: Text;
  /** The rule in plain words. */
  summary: Text;
  /** How Buril checks it, in one or two sentences. */
  how: Text;
  checks: CheckId[];
}

export const accessibilityRules: AccessibilityRule[] = [
  {
    number: 1,
    title: { en: "Semantic HTML first", es: "Primero, HTML semántico" },
    summary: {
      en: "A button is a `<button>` and a link is an `<a href>`. Native elements bring their keyboard support and role with them, so ARIA is only added where HTML has nothing.",
      es: "Un botón es un `<button>` y un enlace es un `<a href>`. Los elementos nativos traen su soporte de teclado y su rol, así que ARIA solo se agrega donde HTML no ofrece nada.",
    },
    how: {
      en: "Tests query every control by its role. Lint rejects click handlers on static elements.",
      es: "Los tests buscan cada control por su rol. El lint rechaza manejadores de clic en elementos estáticos.",
    },
    checks: ["behavior", "lint", "axe"],
  },
  {
    number: 2,
    title: { en: "Everything works with the keyboard", es: "Todo funciona con el teclado" },
    summary: {
      en: "The Tab order follows the page. Escape closes overlays. A group of options, such as a radio group, is one Tab stop and the arrow keys move inside it.",
      es: "El orden de Tab sigue a la página. Escape cierra las superposiciones. Un grupo de opciones, como un grupo de botones de opción, es una sola parada de Tab, y las flechas se mueven dentro de él.",
    },
    how: {
      en: "Behavior tests drive each component with Tab, Enter, Space and the arrow keys; browser tests check real keyboard focus.",
      es: "Los tests de comportamiento usan cada componente con Tab, Enter, Espacio y las flechas; los tests en navegador comprueban el foco real del teclado.",
    },
    checks: ["behavior", "browser"],
  },
  {
    number: 3,
    title: { en: "Focus management", es: "Gestión del foco" },
    summary: {
      en: "Focus goes where you expect. A modal keeps focus inside and gives it back when it closes, and nothing sticky ever covers the focused element.",
      es: "El foco va adonde esperas. Un modal mantiene el foco dentro y lo devuelve al cerrarse, y nada fijo tapa nunca el elemento enfocado.",
    },
    how: {
      en: "The Skip Link's tests check that focus lands on its target and that the link shows above sticky headers. Modals arrive with the overlay components.",
      es: "Los tests del Skip Link comprueban que el foco llega a su destino y que el enlace aparece por encima de los encabezados fijos. Los modales llegan con los componentes superpuestos.",
    },
    checks: ["behavior", "styles"],
  },
  {
    number: 4,
    title: { en: "Focus is always visible", es: "El foco siempre es visible" },
    summary: {
      en: "Keyboard focus shows a 2px outline in the ring color, at least 3:1 against the background. It appears at once, and it is an outline, so it survives forced-colors mode.",
      es: "El foco del teclado muestra un contorno de 2px en el color del anillo, con un contraste de al menos 3:1 frente al fondo. Aparece al instante y, como es un contorno, se mantiene en el modo de colores forzados.",
    },
    how: {
      en: "Style tests check the outline on `:focus-visible`; the token tests measure the ring; a browser test checks that its first frame is already at full contrast.",
      es: "Los tests de estilos comprueban el contorno en `:focus-visible`; los tests de tokens miden el anillo; un test en navegador comprueba que su primer cuadro ya tiene el contraste completo.",
    },
    checks: ["styles", "tokens", "browser"],
  },
  {
    number: 5,
    title: {
      en: "Every control has an accessible name",
      es: "Todo control tiene un nombre accesible",
    },
    summary: {
      en: "Every input has a `<label>`, icon buttons have an `aria-label`, help and error text are linked with `aria-describedby`, and an invalid field says so with `aria-invalid`.",
      es: "Cada campo tiene un `<label>`, los botones de icono tienen un `aria-label`, los textos de ayuda y de error se vinculan con `aria-describedby`, y un campo no válido lo indica con `aria-invalid`.",
    },
    how: {
      en: "The props that give a name are required by the types, and tests find each control by its name.",
      es: "Las props que dan un nombre son obligatorias en los tipos, y los tests encuentran cada control por su nombre.",
    },
    checks: ["types", "behavior", "axe"],
  },
  {
    number: 6,
    title: { en: "State is exposed through ARIA", es: "El estado se expone con ARIA" },
    summary: {
      en: "What you see is what is announced: checked, pressed, expanded, busy or invalid. Native state comes first, such as a checkbox's `checked`.",
      es: "Lo que ves es lo que se anuncia: marcado, presionado, expandido, ocupado o no válido. Primero se usa el estado nativo, como el `checked` de una casilla.",
    },
    how: {
      en: "Behavior tests assert the announced state after every interaction.",
      es: "Los tests de comportamiento comprueban el estado anunciado después de cada interacción.",
    },
    checks: ["behavior", "axe"],
  },
  {
    number: 7,
    title: { en: "Contrast", es: "Contraste" },
    summary: {
      en: "Text has at least 4.5:1 contrast; borders, icons and focus indicators at least 3:1. Color is never the only signal: errors also get an icon and text.",
      es: "El texto tiene un contraste de al menos 4.5:1; los bordes, los iconos y los indicadores de foco, de al menos 3:1. El color nunca es la única señal: los errores también llevan un icono y texto.",
    },
    how: {
      en: "The token tests measure every pair in both modes. Browser tests measure painted colors, such as the Switch dot against its track.",
      es: "Los tests de tokens miden cada par en los dos modos. Los tests en navegador miden los colores pintados, como el punto del Switch frente a su pista.",
    },
    checks: ["tokens", "browser"],
  },
  {
    number: 8,
    title: {
      en: "Minimum target size is 24×24px",
      es: "El tamaño mínimo del objetivo es de 24×24px",
    },
    summary: {
      en: "Anything you click or tap is at least 24px in each direction. The smallest Buril button is 32px.",
      es: "Todo lo que se pulsa mide al menos 24px en cada dirección. El botón más pequeño de Buril mide 32px.",
    },
    how: {
      en: "Style tests check the sizes, such as the Button's smallest square and the radio row; browser tests measure the header controls.",
      es: "Los tests de estilos comprueban los tamaños, como el cuadrado más pequeño del Button y la fila de un botón de opción; los tests en navegador miden los controles del encabezado.",
    },
    checks: ["styles", "browser"],
  },
  {
    number: 9,
    title: { en: "Dynamic announcements", es: "Anuncios dinámicos" },
    summary: {
      en: 'Messages that appear while you work use `role="status"` or `aria-live="polite"`. `assertive` is only for critical errors.',
      es: 'Los mensajes que aparecen mientras trabajas usan `role="status"` o `aria-live="polite"`. `assertive` es solo para errores críticos.',
    },
    how: {
      en: "Tests check that live regions exist before their text changes, such as the Field's error region, which is always present.",
      es: "Los tests comprueban que las regiones vivas existen antes de que cambie su texto, como la región de error del Field, que siempre está presente.",
    },
    checks: ["behavior"],
  },
  {
    number: 10,
    title: { en: "Respect user preferences", es: "Respetar las preferencias del usuario" },
    summary: {
      en: "Anything that moves waits for `motion-safe`, so reduced motion stops it; fades may stay. Focus rings never animate. Forced-colors mode, 200% zoom and a 320px width all work.",
      es: "Todo lo que se mueve espera a `motion-safe`, así que el movimiento reducido lo detiene; los fundidos pueden quedarse. Los anillos de foco nunca se animan. El modo de colores forzados, el zoom al 200% y un ancho de 320px funcionan.",
    },
    how: {
      en: "Style tests check `motion-safe` and forced colors; a test rejects transitions that would animate the outline; browser tests emulate reduced motion and load docs pages at 320px.",
      es: "Los tests de estilos comprueban `motion-safe` y los colores forzados; un test rechaza las transiciones que animarían el contorno; los tests en navegador emulan el movimiento reducido y cargan páginas de la documentación a 320px.",
    },
    checks: ["styles", "browser"],
  },
  {
    number: 11,
    title: {
      en: "Tooltips never contain interactive content",
      es: "Los tooltips nunca contienen contenido interactivo",
    },
    summary: {
      en: "If it needs a button or a link, it is a popover, not a tooltip.",
      es: "Si necesita un botón o un enlace, es un popover, no un tooltip.",
    },
    how: {
      en: "There is no Tooltip yet. The rule is part of its definition of done, with axe and behavior tests.",
      es: "Todavía no hay un Tooltip. La regla forma parte de su definición de terminado, con axe y tests de comportamiento.",
    },
    checks: ["behavior", "axe"],
  },
];

/** What Buril does not cover, or does not check, today. */
export const knownLimits: Text[] = [
  {
    en: "No manual screen reader pass has been recorded yet. The current components rely on the automated checks above.",
    es: "Todavía no se registró ninguna prueba manual con lector de pantalla. Los componentes actuales se apoyan en las comprobaciones automáticas de arriba.",
  },
  {
    en: "Real-browser tests run in Chromium only. Firefox and Safari are not tested automatically.",
    es: "Los tests en navegador real solo se ejecutan en Chromium. Firefox y Safari no se prueban de forma automática.",
  },
  {
    en: "axe runs on server-rendered pages in jsdom, which has no layout, so its color contrast rule is off there. Contrast is measured by the token and browser tests instead.",
    es: "axe se ejecuta sobre páginas renderizadas en el servidor con jsdom, que no calcula el diseño, así que ahí su regla de contraste está desactivada. El contraste se mide con los tests de tokens y en navegador.",
  },
  {
    en: "200% zoom is not tested directly. The 320px reflow tests cover the same layouts.",
    es: "El zoom al 200% no se prueba directamente. Los tests de reflujo a 320px cubren los mismos diseños.",
  },
  {
    en: "Overlays (Dialog, Popover and others) are not built yet. When they arrive, browsers without the CSS `overlay` property, such as Firefox and Safari today, will close them at once instead of animating the exit.",
    es: "Las superposiciones (Dialog, Popover y otras) todavía no existen. Cuando lleguen, los navegadores sin la propiedad CSS `overlay`, como Firefox y Safari hoy, las cerrarán al instante en lugar de animar la salida.",
  },
  {
    en: "Native controls keep the platform's behavior. A Select's picker, and what Space does on it, depend on the browser and the operating system.",
    es: "Los controles nativos conservan el comportamiento de la plataforma. El selector de un Select, y lo que hace Espacio en él, dependen del navegador y del sistema operativo.",
  },
  {
    en: "With your own theme, contrast is yours to keep: the checks measure the Buril theme only.",
    es: "Con tu propio tema, mantener el contraste depende de ti: las comprobaciones solo miden el tema de Buril.",
  },
];
