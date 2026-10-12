import type { Locale } from "../i18n/ui";
import type { Text } from "./accessibility";

/**
 * The FAQ, in English and Spanish. Each answer is a list of paragraphs; `backticks` mark inline
 * code. `link` points to the page with the details.
 */
export interface FaqItem {
  /** Stable, ASCII anchor id, the same in both languages. */
  id: string;
  question: Text;
  answer: Record<Locale, string[]>;
  link?: { href: string; label: Text };
}

export const faq: FaqItem[] = [
  {
    id: "no-aschild",
    question: { en: "Why is there no `asChild`?", es: "¿Por qué no hay `asChild`?" },
    answer: {
      en: [
        "`asChild` merges a component's props into whatever child you pass, so a Button can render a link. Buril keeps one element per component instead: a Button is always a `<button>`, and the element in your JSX is the element in the page.",
        "For a link that looks like a button, put `buttonVariants()` on an `<a>`. For a text link, use the Link component. Neither needs a slot component, and a link never pretends to be a button.",
      ],
      es: [
        "`asChild` combina las props de un componente con el hijo que le pases, así que un Button puede renderizar un enlace. Buril mantiene un elemento por componente: un Button siempre es un `<button>`, y el elemento que escribes en JSX es el elemento que aparece en la página.",
        "Para un enlace con aspecto de botón, aplica `buttonVariants()` a un `<a>`. Para un enlace de texto, usa el componente Link. Ninguno de los dos necesita un componente slot, y un enlace nunca se hace pasar por un botón.",
      ],
    },
    link: { href: "/docs/components/button", label: { en: "Button", es: "Button" } },
  },
  {
    id: "native-elements",
    question: {
      en: "Why native elements instead of headless primitives?",
      es: "¿Por qué elementos nativos en lugar de primitivas sin estilo?",
    },
    answer: {
      en: [
        "Native controls already work with the keyboard, forms, autofill, zoom and screen readers, and browsers have tested that for years. A styled `<select>` or a checkbox `<input>` needs no JavaScript to behave correctly.",
        "The trade-off is control: the platform draws a Select's picker, so options hold text only. Where HTML has a native answer, such as `<dialog>` and the `popover` attribute for overlays, Buril uses it; where it has none, Buril writes the behavior and tests it against its WAI-ARIA pattern.",
      ],
      es: [
        "Los controles nativos ya funcionan con el teclado, los formularios, el autocompletado, el zoom y los lectores de pantalla, y los navegadores llevan años probándolo. Un `<select>` con estilo o un `<input>` de tipo casilla no necesitan JavaScript para comportarse bien.",
        "La contrapartida es el control: el selector de un Select lo dibuja la plataforma, así que las opciones solo contienen texto. Donde HTML tiene una respuesta nativa, como `<dialog>` y el atributo `popover` para las superposiciones, Buril la usa; donde no la tiene, Buril escribe el comportamiento y lo prueba contra su patrón de WAI-ARIA.",
      ],
    },
    link: { href: "/docs/accessibility", label: { en: "Accessibility", es: "Accesibilidad" } },
  },
  {
    id: "cn-package",
    question: { en: "What is the `cn` package?", es: "¿Qué es el paquete `cn`?" },
    answer: {
      en: [
        "Every component imports `cn()` from `@/lib/utils`, the helper shadcn's `utils` item installs. It merges class names and resolves Tailwind conflicts, so a `className` you pass wins over the component's own classes.",
        "The current version of that item re-exports `cn()` from the `cn` npm package. When the CLI installs or updates `lib/utils.ts`, it also adds `cn` to your dependencies. An older `lib/utils.ts` built on `clsx` and `tailwind-merge` works the same: Buril only needs a `cn()` that merges classes.",
      ],
      es: [
        "Todos los componentes importan `cn()` de `@/lib/utils`, el helper que instala el item `utils` de shadcn. Combina nombres de clase y resuelve los conflictos de Tailwind, así que un `className` que pases tiene prioridad sobre las clases del componente.",
        "La versión actual de ese item reexporta `cn()` desde el paquete de npm `cn`. Cuando la CLI instala o actualiza `lib/utils.ts`, también agrega `cn` a tus dependencias. Un `lib/utils.ts` anterior basado en `clsx` y `tailwind-merge` funciona igual: Buril solo necesita un `cn()` que combine clases.",
      ],
    },
  },
  {
    id: "opt-in-theme",
    question: { en: "Do I have to use the Buril theme?", es: "¿Tengo que usar el tema de Buril?" },
    answer: {
      en: [
        "No. Components read the standard shadcn tokens, so they take on any shadcn theme, and installing one never changes your theme. The ink-and-paper palette is a separate item, `@buril/theme`.",
        "Buril shows focus as an outline in `--ring` and draws field borders with `--input`, so check that both reach 3:1 against your background.",
      ],
      es: [
        "No. Los componentes leen los tokens estándar de shadcn, así que adoptan cualquier tema de shadcn, e instalar uno nunca cambia tu tema. La paleta de tinta y papel es un item aparte, `@buril/theme`.",
        "Buril muestra el foco como un contorno en `--ring` y dibuja los bordes de los campos con `--input`, así que comprueba que los dos lleguen a 3:1 frente a tu fondo.",
      ],
    },
    link: {
      href: "/docs/guides/theme",
      label: { en: "Customizing the theme", es: "Personalizar el tema" },
    },
  },
  {
    id: "button-keyframes",
    question: {
      en: "Why does installing the Button change my CSS?",
      es: "¿Por qué instalar el Button cambia mi CSS?",
    },
    answer: {
      en: [
        "The IconButton, which ships in the Button's file, plays its `motion` gestures with CSS keyframes. The Button item appends them to your CSS: only `@keyframes` rules named `buril-icon-*`. Your tokens, variants and other rules stay as they are.",
        "If you copy `button.tsx` by hand, paste the keyframes too. Without them the icons stay still.",
      ],
      es: [
        "El IconButton, que viene en el archivo del Button, reproduce sus gestos de `motion` con keyframes de CSS. El item del Button los agrega a tu CSS: solo reglas `@keyframes` llamadas `buril-icon-*`. Tus tokens, tus variantes y el resto de las reglas no cambian.",
        "Si copias `button.tsx` a mano, pega también los keyframes. Sin ellos, los iconos se quedan quietos.",
      ],
    },
    link: { href: "/docs/components/icon-button", label: { en: "Icon Button", es: "Icon Button" } },
  },
  {
    id: "browser-support",
    question: { en: "Which browsers are supported?", es: "¿Qué navegadores son compatibles?" },
    answer: {
      en: [
        "The ones Tailwind CSS v4 targets: Chrome 111, Safari 16.4 and Firefox 128 or later.",
        "A few effects are progressive enhancements and quietly do less where they are missing: the soft spring uses `linear()` easing, and without it transitions use the default curve; entry fades use `@starting-style`; the Select chevron turns with `:open`. Nothing depends on them to work.",
        "Automated real-browser tests run in Chromium only.",
      ],
      es: [
        "Los que admite Tailwind CSS v4: Chrome 111, Safari 16.4 y Firefox 128 o posteriores.",
        "Algunos efectos son mejoras progresivas y hacen menos, sin fallar, donde faltan: el rebote suave usa la curva `linear()`, y sin ella las transiciones usan la curva por defecto; los fundidos de entrada usan `@starting-style`; la flecha del Select gira con `:open`. Nada depende de ellos para funcionar.",
        "Los tests automáticos en navegador real solo se ejecutan en Chromium.",
      ],
    },
  },
  {
    id: "server-components",
    question: {
      en: "Do the components work in React Server Components?",
      es: "¿Los componentes funcionan en React Server Components?",
    },
    answer: {
      en: [
        'Yes. A component that handles events or keeps state, such as the Button, IconButton, SkipLink, Avatar, Checkbox, Field or Radio Group, starts with `"use client"`, so you can render it from a Server Component in Next.js. The others, such as Card, Badge or Link, have no client code and stay Server Components.',
      ],
      es: [
        'Sí. Los componentes que manejan eventos o guardan estado, como el Button, el IconButton, el SkipLink, el Avatar, el Checkbox, el Field o el Radio Group, empiezan con `"use client"`, así que puedes renderizarlos desde un Server Component en Next.js. Los demás, como Card, Badge o Link, no tienen código de cliente y siguen siendo Server Components.',
      ],
    },
  },
  {
    id: "npm-package",
    question: { en: "Is Buril an npm package?", es: "¿Buril es un paquete de npm?" },
    answer: {
      en: [
        "No. Buril is a shadcn registry: the CLI copies each component's source into your project, and from then on the code is yours. There is no Buril runtime to update; reinstall a component to get a newer version.",
        "Reinstalling overwrites the file, including any edits you made to it. Check what would change first with `npx shadcn@latest add @buril/<item> --diff`, which only shows the diff and writes nothing.",
      ],
      es: [
        "No. Buril es un registry de shadcn: la CLI copia el código fuente de cada componente en tu proyecto y, a partir de ahí, el código es tuyo. No hay un runtime de Buril que actualizar; vuelve a instalar un componente para obtener una versión más nueva.",
        "Reinstalar sobrescribe el archivo, incluidos los cambios que le hayas hecho. Revisa antes qué cambiaría con `npx shadcn@latest add @buril/<item> --diff`, que solo muestra las diferencias y no escribe nada.",
      ],
    },
    link: { href: "/docs/installation", label: { en: "Installation", es: "Instalación" } },
  },
];
