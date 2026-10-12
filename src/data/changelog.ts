import type { Locale } from "../i18n/ui";
import type { Text } from "./accessibility";

/**
 * What changed, newest first, written for people who use Buril. It is curated by hand in English
 * and Spanish rather than generated from the git history: merge subjects are written for
 * contributors, in English only, and a build from a shallow clone would see no history at all.
 * `test/docs/faq-changelog.test.ts` reads `git log --merges --first-parent` and fails when a
 * merged feature has no entry here, so the page cannot fall behind.
 */
export interface ChangelogEntry {
  /** The merged branch, as in its merge subject ("Merge motion-v2: …"); null for the first commits. */
  branch: string | null;
  /** The day it reached main, as `YYYY-MM-DD`. */
  date: string;
  title: Text;
  changes: Record<Locale, string[]>;
}

export const changelog: ChangelogEntry[] = [
  {
    branch: "copy-edit",
    date: "2026-10-12",
    title: { en: "Plainer docs copy", es: "Textos más directos en la documentación" },
    changes: {
      en: [
        "Plainer wording on every docs page and in the README, in English and Spanish.",
        "Component pages say once, in the shared install note, that the CLI asks before replacing `lib/utils.ts`.",
        "The FAQ presents `<dialog>` and the `popover` attribute as the plan for the overlays still to come, and the README no longer lists `<dialog>` as shipped.",
        "The Spanish docs give the soft spring and the Switch thumb one name each, everywhere.",
      ],
      es: [
        "Redacción más directa en todas las páginas de la documentación y en el README, en inglés y en español.",
        "Las páginas de componentes dicen una sola vez, en la nota de instalación compartida, que la CLI pregunta antes de reemplazar `lib/utils.ts`.",
        "Las preguntas frecuentes presentan `<dialog>` y el atributo `popover` como el plan para los componentes superpuestos que todavía no existen, y el README ya no menciona `<dialog>` como disponible.",
        'La documentación en español usa un solo nombre para cada idea: "resorte suave" para el movimiento final e "indicador" para la pieza móvil del Switch.',
      ],
    },
  },
  {
    branch: "docs-fixes",
    date: "2026-10-12",
    title: { en: "Ready for Server Components", es: "Listos para los Server Components" },
    changes: {
      en: [
        'Button, IconButton and SkipLink start with `"use client"`, so a Next.js Server Component can render them without throwing.',
        "Props and token tables keep names such as `variant` and `--buril-duration-instant` whole; on a phone they scroll instead of breaking mid-word.",
        "Corrected docs: the urgent Alert example, the font tokens you apply yourself, the brand red that includes `--accent`, dark mode without the Buril theme and a `--diff` check before reinstalling.",
      ],
      es: [
        'Button, IconButton y SkipLink empiezan con `"use client"`, así que un Server Component de Next.js puede renderizarlos sin errores.',
        "Las tablas de props y de tokens mantienen enteros nombres como `variant` y `--buril-duration-instant`; en un teléfono se desplazan en lugar de cortarlos a mitad de palabra.",
        "Documentación corregida: el ejemplo de la alerta urgente, los tokens de fuente que aplicas tú, el rojo de marca que incluye `--accent`, el modo oscuro sin el tema de Buril y una comprobación con `--diff` antes de reinstalar.",
      ],
    },
  },
  {
    branch: "docs-content",
    date: "2026-10-12",
    title: { en: "New docs pages and guides", es: "Nuevas páginas y guías de la documentación" },
    changes: {
      en: [
        "New Accessibility, Motion, FAQ and Changelog pages, and five guides: forms, dark mode, theming, using Buril with shadcn and migrating from it.",
        "Every component page has a Keyboard and an ARIA section, and an example for each variant, size and state.",
        "The IconButton `pop` gesture squeezes on press and settles on release instead of snapping back.",
        "On phones the site header fits one row: the theme is one icon button and the main links fold into a menu.",
      ],
      es: [
        "Nuevas páginas de Accesibilidad, Movimiento, Preguntas frecuentes y Cambios, y cinco guías: formularios, modo oscuro, temas, usar Buril junto a shadcn y migrar desde shadcn.",
        "Cada página de componente tiene una sección de Teclado y otra de ARIA, y un ejemplo de cada variante, tamaño y estado.",
        "El gesto `pop` del IconButton se encoge al pulsar y se asienta al soltar, en lugar de volver de golpe.",
        "En los teléfonos, el encabezado del sitio cabe en una fila: el tema es un solo botón de icono y los enlaces principales se pliegan en un menú.",
      ],
    },
  },
  {
    branch: "motion-v2",
    date: "2026-10-12",
    title: { en: "Slower motion and icon gestures", es: "Movimiento más lento y gestos de icono" },
    changes: {
      en: [
        "Slower state changes and entries, ending on a soft spring that settles about 3% past its target.",
        "IconButton `motion` presets: rotate, spin, wiggle, swing, three nudges and pop.",
        "`interactive` Cards lift and show a shadow on hover and keyboard focus.",
        "Field takes `requiredLabel` and `errorPrefix`, and Link takes `newTabLabel`, so the text they write can be in your language.",
        "More room between the loading Button's spinner and its label.",
      ],
      es: [
        "Cambios de estado y entradas más lentos, que terminan con un resorte suave que sobrepasa su destino en aproximadamente un 3% y se asienta.",
        "Presets de `motion` para el IconButton: rotate, spin, wiggle, swing, tres variantes de nudge y pop.",
        "Las Card `interactive` se elevan y muestran una sombra con el puntero y con el foco del teclado.",
        "Field acepta `requiredLabel` y `errorPrefix`, y Link acepta `newTabLabel`, para que el texto que escriben esté en tu idioma.",
        "Más espacio entre el indicador de carga del Button y su etiqueta.",
      ],
    },
  },
  {
    branch: "docs-i18n",
    date: "2026-10-12",
    title: { en: "The docs in Spanish", es: "La documentación en español" },
    changes: {
      en: [
        "Every page of the docs site in English and Spanish, with a language switcher and localized demos.",
      ],
      es: [
        "Todas las páginas del sitio de documentación en inglés y en español, con un selector de idioma y demos traducidas.",
      ],
    },
  },
  {
    branch: "motion",
    date: "2026-10-12",
    title: { en: "Motion", es: "Movimiento" },
    changes: {
      en: [
        "Motion tokens with literal fallbacks, so components move the same with or without the theme.",
        "Focus rings appear at once instead of fading in.",
        "A letterpress press for buttons, a drawn check, an ink-drop radio dot and a turning Select chevron, all off with reduced motion.",
        "The Switch thumb stays inside its track in every browser.",
      ],
      es: [
        "Tokens de movimiento con valores alternativos literales, así que los componentes se mueven igual con o sin el tema.",
        "Los anillos de foco se muestran al instante en lugar de aparecer gradualmente.",
        "Un golpe de imprenta al pulsar los botones, una marca que se dibuja, un punto de radio que se extiende como tinta y una flecha del Select que gira, todo desactivado con movimiento reducido.",
        "El indicador del Switch se mantiene dentro de su pista en todos los navegadores.",
      ],
    },
  },
  {
    branch: "site-polish",
    date: "2026-10-12",
    title: { en: "A one-scroll docs layout", es: "La documentación en un solo desplazamiento" },
    changes: {
      en: ["One page scroll, a sticky header and side panels, and full-width proportions."],
      es: [
        "Un único desplazamiento de página, un encabezado y paneles laterales fijos, y proporciones de ancho completo.",
      ],
    },
  },
  {
    branch: "docs-site",
    date: "2026-10-12",
    title: { en: "The docs site", es: "El sitio de documentación" },
    changes: {
      en: [
        "A landing page, Getting Started pages and a page for every component, with a live demo, install tabs, usage, an API table and accessibility notes.",
      ],
      es: [
        "Una página de inicio, páginas de Primeros pasos y una página para cada componente, con una demo en vivo, pestañas de instalación, uso, una tabla de la API y notas de accesibilidad.",
      ],
    },
  },
  {
    branch: "phase1-content",
    date: "2026-10-12",
    title: { en: "Content and feedback components", es: "Componentes de contenido y de avisos" },
    changes: {
      en: ["New: Card, Badge, Avatar, Separator, Alert, Spinner and Skeleton."],
      es: ["Nuevos: Card, Badge, Avatar, Separator, Alert, Spinner y Skeleton."],
    },
  },
  {
    branch: "phase1-forms",
    date: "2026-10-12",
    title: { en: "Form components", es: "Componentes de formulario" },
    changes: {
      en: ["New: Field, Input, Textarea, Checkbox, Radio Group, Switch and Select."],
      es: ["Nuevos: Field, Input, Textarea, Checkbox, Radio Group, Switch y Select."],
    },
  },
  {
    branch: "phase1-actions",
    date: "2026-10-12",
    title: { en: "Actions and navigation", es: "Acciones y navegación" },
    changes: {
      en: ["New: Icon Button, Link and Skip Link."],
      es: ["Nuevos: Icon Button, Link y Skip Link."],
    },
  },
  {
    branch: "review-hardening",
    date: "2026-10-12",
    title: { en: "Review fixes", es: "Correcciones de la revisión" },
    changes: {
      en: [
        "The Button no longer depends on the theme, so installing it never changes your tokens.",
        "The docs stop claiming that `aria-busy` announces loading; announce it from a status region.",
      ],
      es: [
        "El Button ya no depende del tema, así que instalarlo nunca cambia tus tokens.",
        "La documentación deja de afirmar que `aria-busy` anuncia la carga; anúnciala desde una región de estado.",
      ],
    },
  },
  {
    branch: null,
    date: "2026-10-12",
    title: { en: "The beginning", es: "El comienzo" },
    changes: {
      en: [
        "The Button, the shadcn registry and the optional Buril theme, with light and dark palettes measured for contrast.",
      ],
      es: [
        "El Button, el registry de shadcn y el tema opcional de Buril, con paletas clara y oscura medidas para el contraste.",
      ],
    },
  },
];
