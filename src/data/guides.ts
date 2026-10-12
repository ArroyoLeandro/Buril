import type { Text } from "./accessibility";

/** The guides under `/docs/guides`, in sidebar order. Each has a page in English and in Spanish. */
export interface Guide {
  slug: string;
  title: Text;
  description: Text;
}

export const guides: Guide[] = [
  {
    slug: "forms",
    title: { en: "Forms with Field", es: "Formularios con Field" },
    description: {
      en: "Label, describe and validate form controls with Field: the render prop, errors, required fields and your own language.",
      es: "Etiqueta, describe y valida controles de formulario con Field: la render prop, los errores, los campos obligatorios y tu propio idioma.",
    },
  },
  {
    slug: "dark-mode",
    title: { en: "Dark mode", es: "Modo oscuro" },
    description: {
      en: "Switch between light, dark and the system setting with next-themes, in Astro or in Vite, without a flash.",
      es: "Cambia entre claro, oscuro y la configuración del sistema con next-themes, en Astro o en Vite, sin parpadeos.",
    },
  },
  {
    slug: "theme",
    title: { en: "Customizing the theme", es: "Personalizar el tema" },
    description: {
      en: "Change the red, use a neutral palette or retune the motion, without touching a component.",
      es: "Cambia el rojo, usa una paleta neutra o ajusta el movimiento sin tocar ningún componente.",
    },
  },
  {
    slug: "shadcn",
    title: { en: "Using Buril with shadcn", es: "Usar Buril junto a shadcn" },
    description: {
      en: "Add Buril components to a project that already has shadcn/ui, without losing your theme or your components.",
      es: "Agrega componentes de Buril a un proyecto que ya usa shadcn/ui, sin perder tu tema ni tus componentes.",
    },
  },
  {
    slug: "migrating-from-shadcn",
    title: { en: "Migrating from shadcn", es: "Migrar desde shadcn" },
    description: {
      en: "What changes, component by component, when you replace a shadcn/ui component with Buril's.",
      es: "Qué cambia, componente por componente, cuando reemplazas un componente de shadcn/ui por el de Buril.",
    },
  },
];

export const guideHref = (slug: string) => `/docs/guides/${slug}`;

/** For each Buril component, what differs from its shadcn/ui counterpart, if it has one. */
export const migrationNotes: Record<string, Text> = {
  button: {
    en: "No `asChild`: style an `<a>` with `buttonVariants()` instead. `type` is `button` by default. There are no `xs` or `icon-xs` sizes; there is a `loading` prop. No `data-slot`, `data-variant` or `data-size` attributes.",
    es: "Sin `asChild`: aplica `buttonVariants()` a un `<a>`. `type` es `button` por defecto. No existen los tamaños `xs` ni `icon-xs`; existe la prop `loading`. Sin los atributos `data-slot`, `data-variant` ni `data-size`.",
  },
  "icon-button": {
    en: 'shadcn uses `<Button size="icon">`. `IconButton` requires `aria-label`, hides the icon from screen readers and adds `motion`.',
    es: 'shadcn usa `<Button size="icon">`. `IconButton` exige `aria-label`, oculta el icono para los lectores de pantalla y agrega `motion`.',
  },
  link: {
    en: "No shadcn counterpart. It keeps the underline in every state and opens new tabs safely with `external`.",
    es: "No tiene equivalente en shadcn. Conserva el subrayado en todos los estados y abre pestañas nuevas de forma segura con `external`.",
  },
  field: {
    en: "shadcn's Field is built from parts (`FieldLabel`, `FieldDescription`, `FieldError`) that you wire by hand. Buril's takes `label`, `description` and `error`, and wires the id, `aria-describedby` and `aria-invalid` for you.",
    es: "El Field de shadcn se arma con partes (`FieldLabel`, `FieldDescription`, `FieldError`) que conectas a mano. El de Buril recibe `label`, `description` y `error`, y conecta por ti el id, `aria-describedby` y `aria-invalid`.",
  },
  input: {
    en: "The same API: a native `<input>`. The border has 3:1 contrast and focus shows an outline.",
    es: "La misma API: un `<input>` nativo. El borde tiene un contraste de 3:1 y el foco muestra un contorno.",
  },
  textarea: {
    en: "The same API: a native `<textarea>`, which resizes vertically.",
    es: "La misma API: un `<textarea>` nativo, que se redimensiona en vertical.",
  },
  checkbox: {
    en: "A native checkbox: `checked` and `onChange` replace `onCheckedChange`, and the mixed state is the `indeterminate` prop. Wrap it in a `<label>` instead of pairing an `id` with a `Label`.",
    es: "Una casilla nativa: `checked` y `onChange` reemplazan a `onCheckedChange`, y el estado mixto es la prop `indeterminate`. Envuélvela en un `<label>` en lugar de vincular un `id` con un `Label`.",
  },
  "radio-group": {
    en: "Native radios in a `<fieldset>`: `legend` is required, and each `RadioGroupItem` takes its label as children, so there is no `id` or `Label`. `value`, `defaultValue` and `onValueChange` work as before.",
    es: "Botones de opción nativos en un `<fieldset>`: `legend` es obligatoria y cada `RadioGroupItem` recibe su etiqueta como contenido, así que no hay `id` ni `Label`. `value`, `defaultValue` y `onValueChange` funcionan igual.",
  },
  switch: {
    en: 'A native checkbox with `role="switch"`: `checked` and `onChange` replace `onCheckedChange`. `stateLabels` adds visible on and off text.',
    es: 'Una casilla nativa con `role="switch"`: `checked` y `onChange` reemplazan a `onCheckedChange`. `stateLabels` agrega texto visible para activado y desactivado.',
  },
  select: {
    en: "A styled native `<select>` with `<option>` children instead of `SelectTrigger`, `SelectValue`, `SelectContent` and `SelectItem`. Use `value` and `onChange`; the platform draws the picker, so options hold text only.",
    es: "Un `<select>` nativo con estilo y opciones `<option>` en lugar de `SelectTrigger`, `SelectValue`, `SelectContent` y `SelectItem`. Usa `value` y `onChange`; la plataforma dibuja el selector, así que las opciones solo contienen texto.",
  },
  card: {
    en: "The same parts, without `CardAction`. `CardTitle` is a real heading, `h3` by default, set with `as`. `decor` and `interactive` are new.",
    es: "Las mismas partes, sin `CardAction`. `CardTitle` es un encabezado real, `h3` por defecto, que se ajusta con `as`. `decor` e `interactive` son nuevas.",
  },
  badge: {
    en: "No `asChild`. The variants are `default`, `secondary`, `outline` and `destructive`.",
    es: "Sin `asChild`. Las variantes son `default`, `secondary`, `outline` y `destructive`.",
  },
  avatar: {
    en: "One component instead of `AvatarImage` and `AvatarFallback`: pass `src` and the required `alt`. The initials come from `alt`, or from `fallback`.",
    es: "Un solo componente en lugar de `AvatarImage` y `AvatarFallback`: pasa `src` y la prop obligatoria `alt`. Las iniciales salen de `alt`, o de `fallback`.",
  },
  separator: {
    en: "Semantic by default: `decorative` defaults to `false`, where shadcn's defaults to `true`. A horizontal one renders an `<hr>`.",
    es: "Semántico por defecto: `decorative` vale `false` por defecto, mientras que en shadcn vale `true`. El horizontal renderiza un `<hr>`.",
  },
  alert: {
    en: "The same parts and the `default` and `destructive` variants, with a default icon for each. No role by default: `live` makes it a status or an alert.",
    es: "Las mismas partes y las variantes `default` y `destructive`, con un icono por defecto para cada una. Sin rol por defecto: `live` la convierte en una región de estado o en una alerta.",
  },
  spinner: {
    en: 'A `<span role="status">` with a hidden `label`, "Loading" by default, and a `size`, instead of an SVG named with `aria-label`. It shows still dots with reduced motion.',
    es: 'Un `<span role="status">` con un `label` oculto, "Loading" por defecto, y un `size`, en lugar de un SVG con `aria-label`. Muestra puntos quietos con movimiento reducido.',
  },
  skeleton: {
    en: "The same API. It is `aria-hidden`, and it only pulses when motion is allowed.",
    es: "La misma API. Tiene `aria-hidden` y solo parpadea si se permite el movimiento.",
  },
  "skip-link": {
    en: 'No shadcn counterpart. Put it first in `<body>` and give the target `tabindex="-1"`.',
    es: 'No tiene equivalente en shadcn. Ponlo primero en `<body>` y dale `tabindex="-1"` al destino.',
  },
};
