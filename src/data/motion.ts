import type { Text } from "./accessibility";
import type { MotionToken } from "../utils/tokens";

/**
 * The Motion page's content in English and Spanish. Token values are never written here: the page
 * reads them from `registry/styles/buril.css`, and `test/docs/motion-page.test.ts` checks that
 * every token has a use below and every preset times itself like the IconButton classes.
 */

/** What each motion token is for, by token name without the leading dashes. */
export const motionTokenUses: Record<string, Text> = {
  "buril-duration-instant": {
    en: "Presses: the Button's letterpress and the IconButton's squeeze.",
    es: "Pulsaciones: el golpe de imprenta del Button y el encogimiento del IconButton.",
  },
  "buril-duration-fast": {
    en: "Hover and color changes, fades in and out.",
    es: "Cambios de color y al pasar el puntero, y fundidos.",
  },
  "buril-duration-base": {
    en: "State changes: the Switch dot, the Checkbox stroke, the Radio dot, the Card lift.",
    es: "Cambios de estado: el punto del Switch, el trazo del Checkbox, el punto del Radio y la elevación de la Card.",
  },
  "buril-duration-slow": {
    en: "The pop gesture today. Kept for entries, such as a dialog or a popover appearing.",
    es: "Hoy, el gesto pop. Reservado para entradas, como la aparición de un diálogo o un popover.",
  },
  "buril-duration-slower": {
    en: "The spin gesture today. Kept for larger entries, such as a drawer.",
    es: "Hoy, el gesto spin. Reservado para entradas más grandes, como un drawer.",
  },
  "buril-duration-gesture": {
    en: "One-shot icon gestures: the trash wiggle, the bell swing, the nudges.",
    es: "Gestos de icono de una sola vez: la sacudida de la papelera, el balanceo de la campana y los empujones.",
  },
  "buril-ease-out": {
    en: "Entries and state changes: a soft spring that passes its target by about 3% and settles.",
    es: "Entradas y cambios de estado: un rebote suave que pasa su destino en un 3% y se asienta.",
  },
  "buril-ease-in": {
    en: "Exits: a plain curve that speeds up as it leaves. Kept for the overlays to come.",
    es: "Salidas: una curva simple que acelera al irse. Reservada para las superposiciones que vendrán.",
  },
  "buril-ease-in-out": {
    en: "Position changes and round trips: the Switch dot, the spin and the nudges. The same soft spring.",
    es: "Cambios de posición y gestos de ida y vuelta: el punto del Switch, spin y los empujones. El mismo rebote suave.",
  },
  "buril-ease-linear": {
    en: "Constant motion, such as a progress stripe. Kept for components to come.",
    es: "Movimiento constante, como una franja de progreso. Reservado para componentes que vendrán.",
  },
};

/** One IconButton `motion` preset and the duration token it is timed with. */
export interface IconPreset {
  preset: string;
  /** The icon it suits. */
  icon: Text;
  /** What the icon does. */
  gesture: Text;
  /** The duration token, without `--buril-duration-`. */
  token: string;
  /** The multiple of the token the gesture lasts. */
  factor: number;
}

export const iconPresets: IconPreset[] = [
  {
    preset: "rotate",
    icon: { en: "Close", es: "Cerrar" },
    gesture: {
      en: "The cross turns a quarter while hovered or focused, and back after.",
      es: "La cruz gira un cuarto de vuelta mientras tiene el puntero o el foco, y vuelve después.",
    },
    token: "base",
    factor: 1,
  },
  {
    preset: "spin",
    icon: { en: "Refresh", es: "Actualizar" },
    gesture: { en: "One full turn.", es: "Una vuelta completa." },
    token: "slower",
    factor: 1.5,
  },
  {
    preset: "wiggle",
    icon: { en: "Delete", es: "Eliminar" },
    gesture: {
      en: "A lid marked `data-lid` lifts, then the can shakes once on its base.",
      es: "Una tapa marcada con `data-lid` se levanta y después la papelera se sacude una vez sobre su base.",
    },
    token: "gesture",
    factor: 1,
  },
  {
    preset: "swing",
    icon: { en: "Bell", es: "Campana" },
    gesture: {
      en: "Swings from the top, a little less on every pass.",
      es: "Se balancea desde arriba, un poco menos en cada pasada.",
    },
    token: "gesture",
    factor: 1.3,
  },
  {
    preset: "nudge-x",
    icon: { en: "Arrow, send", es: "Flecha, enviar" },
    gesture: {
      en: "Out and back, forward in the reading direction.",
      es: "Sale y vuelve, hacia adelante en el sentido de lectura.",
    },
    token: "gesture",
    factor: 0.9,
  },
  {
    preset: "nudge-up",
    icon: { en: "Back to top, upload", es: "Volver arriba, subir" },
    gesture: { en: "Up and back.", es: "Sube y vuelve." },
    token: "gesture",
    factor: 0.9,
  },
  {
    preset: "nudge-diagonal",
    icon: { en: "External link", es: "Enlace externo" },
    gesture: {
      en: "Up and forward, and back.",
      es: "Sube hacia adelante y vuelve.",
    },
    token: "gesture",
    factor: 0.9,
  },
  {
    preset: "pop",
    icon: { en: "Like", es: "Me gusta" },
    gesture: {
      en: "Grows, dips and settles. A press squeezes it, and the release springs it back.",
      es: "Crece, baja y se asienta. Al pulsarlo se encoge, y al soltarlo vuelve con un rebote suave.",
    },
    token: "slow",
    factor: 1.4,
  },
];

/** How long a preset's gesture lasts, in ms, from the duration tokens. */
export function presetDuration(preset: IconPreset, tokens: MotionToken[]) {
  const value = tokens.find(({ name }) => name === `buril-duration-${preset.token}`)?.value;
  if (value === undefined) throw new Error(`No duration token "${preset.token}"`);
  const ms = value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
  return Math.round(ms * preset.factor);
}

/** What each moving part does with motion, and with reduced motion. */
export interface ReducedMotionRow {
  component: string;
  motion: Text;
  reduced: Text;
}

export const reducedMotionBehavior: ReducedMotionRow[] = [
  {
    component: "Button",
    motion: { en: "A press nudges it 1px down.", es: "Una pulsación lo baja 1px." },
    reduced: {
      en: "No nudge; colors still fade.",
      es: "No se mueve; los colores siguen fundiéndose.",
    },
  },
  {
    component: "Icon Button",
    motion: {
      en: "The `motion` gesture plays on hover and focus.",
      es: "El gesto de `motion` se reproduce con el puntero y el foco.",
    },
    reduced: { en: "The icon stays still.", es: "El icono se queda quieto." },
  },
  {
    component: "Checkbox",
    motion: {
      en: "The check draws itself; the dash grows from the middle.",
      es: "La marca se dibuja; el guion crece desde el centro.",
    },
    reduced: {
      en: "The check and the dash appear at once; the fill still fades.",
      es: "La marca y el guion aparecen al instante; el relleno sigue fundiéndose.",
    },
  },
  {
    component: "Radio Group",
    motion: {
      en: "The dot spreads like a drop of ink.",
      es: "El punto se extiende como una gota de tinta.",
    },
    reduced: {
      en: "The dot appears at once; the colors still fade.",
      es: "El punto aparece al instante; los colores siguen fundiéndose.",
    },
  },
  {
    component: "Switch",
    motion: { en: "The dot slides across.", es: "El punto se desliza." },
    reduced: {
      en: "The dot jumps; the colors still fade.",
      es: "El punto salta; los colores siguen fundiéndose.",
    },
  },
  {
    component: "Select",
    motion: {
      en: "The chevron turns over while the picker is open, where the browser supports `:open`.",
      es: "La flecha se da vuelta mientras el selector está abierto, en los navegadores que admiten `:open`.",
    },
    reduced: { en: "The chevron stays still.", es: "La flecha se queda quieta." },
  },
  {
    component: "Field",
    motion: {
      en: "A new error drops 3px into place as it fades in.",
      es: "Un error nuevo baja 3px hasta su lugar mientras aparece.",
    },
    reduced: { en: "The error only fades in.", es: "El error solo aparece con un fundido." },
  },
  {
    component: "Card",
    motion: {
      en: "An `interactive` card lifts 4.5px and shows a shadow on hover and keyboard focus.",
      es: "Una Card `interactive` se eleva 4.5px y muestra una sombra con el puntero y el foco del teclado.",
    },
    reduced: {
      en: "No lift; the shadow still fades in.",
      es: "No se eleva; la sombra sigue apareciendo.",
    },
  },
  {
    component: "Spinner",
    motion: { en: "Turns in eight steps.", es: "Gira en ocho pasos." },
    reduced: { en: "Shows three still dots instead.", es: "Muestra tres puntos quietos." },
  },
  {
    component: "Skeleton",
    motion: { en: "Pulses.", es: "Late." },
    reduced: { en: "Stays still.", es: "Se queda quieto." },
  },
  {
    component: "Avatar, Alert",
    motion: {
      en: "The image or the alert fades in.",
      es: "La imagen o la alerta aparecen con un fundido.",
    },
    reduced: {
      en: "The same fade: opacity is not movement.",
      es: "El mismo fundido: la opacidad no es movimiento.",
    },
  },
];
