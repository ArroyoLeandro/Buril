import type { Locale } from "../i18n/ui";

/**
 * Hand-written reference for each component page, keyed by the slug in `components.ts`: a minimal
 * usage snippet, the props of each export and a summary of keyboard and screen reader behavior.
 * Text may use `backticks` for inline code. Keep it in step with `registry/ui/*`.
 *
 * The Spanish text lives in `spanishDocs` below, keyed by export, prop name and key, so names,
 * types, code defaults and the usage snippet are written once and stay in English.
 */
export interface PropDoc {
  name: string;
  type: string;
  /** The default as a code value, such as `"default"` or `false`. */
  default?: string;
  /** A default that is not a code value, such as "generated", shown as text. */
  defaultText?: string;
  description: string;
}

export interface ApiDoc {
  /** The export the table documents, such as `Button` or `buttonVariants()`. */
  component: string;
  description?: string;
  props: PropDoc[];
}

export interface KeyDoc {
  key: string;
  action: string;
}

export interface ComponentDocs {
  usage: string;
  api: ApiDoc[];
  keyboard?: KeyDoc[];
  accessibility: string[];
}

const className: PropDoc = {
  name: "className",
  type: "string",
  description: "Extra classes, merged with `cn()`.",
};

const buttonVariant: PropDoc = {
  name: "variant",
  type: '"default" | "secondary" | "outline" | "ghost" | "link" | "destructive"',
  default: '"default"',
  description: "Visual style. `destructive` is for actions that delete or cannot be undone.",
};

const fieldKeyboard: KeyDoc[] = [
  { key: "Tab", action: "Moves focus to the control, and on to the next one." },
];

export const componentDocs: Record<string, ComponentDocs> = {
  button: {
    usage: `import { Button } from "@/components/ui/button";

<Button onClick={save}>Save changes</Button>`,
    api: [
      {
        component: "Button",
        description: "Every other prop goes to the native `<button>`.",
        props: [
          buttonVariant,
          {
            name: "size",
            type: '"sm" | "default" | "lg" | "icon-sm" | "icon" | "icon-lg"',
            default: '"default"',
            description: "Height and padding: 32, 40 or 48px, or a square of the same sizes.",
          },
          {
            name: "loading",
            type: "boolean",
            default: "false",
            description: "Shows a spinner and blocks activation, while the button keeps focus.",
          },
          {
            name: "type",
            type: '"button" | "submit" | "reset"',
            default: '"button"',
            description: 'Pass `"submit"` for a form\'s submit button.',
          },
          className,
        ],
      },
      {
        component: "buttonVariants()",
        description: "The same classes as a string, for a link that looks like a button.",
        props: [
          buttonVariant,
          {
            name: "size",
            type: '"sm" | "default" | "lg" | "icon-sm" | "icon" | "icon-lg"',
            default: '"default"',
            description: "The same sizes as the Button.",
          },
        ],
      },
    ],
    keyboard: [
      { key: "Enter", action: "Activates the button." },
      { key: "Space", action: "Activates the button." },
    ],
    accessibility: [
      "It is a native `<button>`, so it is focusable and announced as a button.",
      'While loading it sets `aria-busy` and `aria-disabled` and stays focusable; announce progress from a `role="status"` region outside it.',
      "`disabled` removes it from the Tab order. Prefer `loading` while an action is in progress.",
      "The focus ring is an outline, so it stays visible in forced-colors mode.",
    ],
  },
  "icon-button": {
    usage: `import { IconButton } from "@/components/ui/button";

<IconButton aria-label="Close dialog" variant="ghost" onClick={close}>
  <XIcon />
</IconButton>`,
    api: [
      {
        component: "IconButton",
        description: "It accepts every Button prop except `size` values that are not square.",
        props: [
          {
            name: "aria-label",
            type: "string",
            description: "Required. The button's only accessible name: describe the action.",
          },
          {
            name: "children",
            type: "ReactNode",
            description: "Required. The icon, hidden from assistive technology.",
          },
          {
            name: "size",
            type: '"icon-sm" | "icon" | "icon-lg"',
            default: '"icon"',
            description: "A square of 32, 40 or 48px.",
          },
          buttonVariant,
          {
            name: "loading",
            type: "boolean",
            default: "false",
            description: "Replaces the icon with a spinner and blocks activation.",
          },
          {
            name: "motion",
            type: '"rotate" | "spin" | "wiggle" | "swing" | "nudge-x" | "nudge-up" | "nudge-diagonal" | "pop"',
            description:
              "A gesture the icon plays once on hover and keyboard focus (`pop` also on press). `wiggle` lifts a lid marked with `data-lid`.",
          },
        ],
      },
    ],
    keyboard: [
      { key: "Enter", action: "Activates the button." },
      { key: "Space", action: "Activates the button." },
    ],
    accessibility: [
      "`aria-label` is required by its type, because an icon has no text.",
      "The icon sits in an `aria-hidden` span, so it never adds to the name.",
      "Every size is at least 32px, above the 24px minimum target.",
      "`motion` gestures run only when the user has not asked for reduced motion, play once and never loop, and leave the focus ring untouched.",
    ],
  },
  link: {
    usage: `import { Link } from "@/components/ui/link";

<Link href="/pricing">See pricing</Link>`,
    api: [
      {
        component: "Link",
        description: "Every other prop goes to the native `<a>`.",
        props: [
          {
            name: "href",
            type: "string",
            description: "Required. Without it an anchor is not a link.",
          },
          {
            name: "variant",
            type: '"default" | "muted"',
            default: '"default"',
            description: "Text color. Both keep the underline.",
          },
          {
            name: "external",
            type: "boolean",
            default: "false",
            description:
              'Opens a new tab with `rel="noopener noreferrer"` and says so to every user.',
          },
          className,
        ],
      },
    ],
    keyboard: [{ key: "Enter", action: "Follows the link." }],
    accessibility: [
      "It is always a real `<a href>`, announced as a link and reachable with Tab.",
      "The underline stays in every state, so color is never the only signal.",
      'A new tab adds "(opens in a new tab)" to the accessible name, even with `aria-label`.',
    ],
  },
  field: {
    usage: `import { Field } from "@/components/ui/field";

<Field label="Email" error={errors.email} required>
  {(control) => <input type="email" {...control} />}
</Field>`,
    api: [
      {
        component: "Field",
        description: "Every other prop goes to the wrapping `<div>`.",
        props: [
          {
            name: "label",
            type: "ReactNode",
            description: "Required. Rendered as the control's `<label>`.",
          },
          {
            name: "description",
            type: "ReactNode",
            description: "Help text, linked with `aria-describedby`.",
          },
          {
            name: "error",
            type: "ReactNode",
            description: "Error text. While set, the control gets `aria-invalid`.",
          },
          {
            name: "required",
            type: "boolean",
            default: "false",
            description: 'Sets the native `required` and shows "(required)".',
          },
          {
            name: "children",
            type: "(control) => ReactNode | ReactElement",
            description: "Required. A render prop that spreads the control props, or one element.",
          },
          className,
        ],
      },
    ],
    keyboard: fieldKeyboard,
    accessibility: [
      "Clicking the label focuses the control, because the label's `for` matches its id.",
      "Screen readers read the description, then the error, after the name.",
      'The error region is always present with `aria-live="polite"`, so new errors are announced.',
      'The "(required)" marker is hidden from screen readers, which announce the native `required` state.',
    ],
  },
  input: {
    usage: `import { Input } from "@/components/ui/input";

<Input type="email" autoComplete="email" />`,
    api: [
      {
        component: "Input",
        description: "Every prop goes to the native `<input>`.",
        props: [
          {
            name: "type",
            type: "string",
            default: '"text"',
            description: "Any native input type, such as `email` or `search`.",
          },
          {
            name: "aria-invalid",
            type: "boolean",
            description: "Turns the border destructive. Field sets it for you.",
          },
          className,
        ],
      },
    ],
    keyboard: fieldKeyboard,
    accessibility: [
      "It needs a visible label: put it in a Field.",
      "The border has at least 3:1 contrast, and focus shows the ring outline.",
      "A 16px font stops mobile browsers zooming in on focus.",
    ],
  },
  textarea: {
    usage: `import { Textarea } from "@/components/ui/textarea";

<Textarea maxLength={200} />`,
    api: [
      {
        component: "Textarea",
        description: "Every prop goes to the native `<textarea>`.",
        props: [
          {
            name: "rows",
            type: "number",
            description: "Starting height in lines. It starts about three lines tall.",
          },
          {
            name: "aria-invalid",
            type: "boolean",
            description: "Turns the border destructive. Field sets it for you.",
          },
          className,
        ],
      },
    ],
    keyboard: fieldKeyboard,
    accessibility: [
      "It needs a visible label: put it in a Field.",
      "It resizes vertically, so people can enlarge it to read long text.",
    ],
  },
  checkbox: {
    usage: `import { Checkbox } from "@/components/ui/checkbox";

<label className="flex min-h-6 items-center gap-2">
  <Checkbox name="terms" />
  I accept the terms
</label>`,
    api: [
      {
        component: "Checkbox",
        description: "Every other prop, `ref` included, goes to the native `<input>`.",
        props: [
          {
            name: "checked",
            type: "boolean",
            description: "The checked state, for a controlled checkbox. Update it from `onChange`.",
          },
          {
            name: "indeterminate",
            type: "boolean",
            default: "false",
            description: "Shows a dash and reports a mixed state.",
          },
          className,
        ],
      },
    ],
    keyboard: [{ key: "Space", action: "Checks or unchecks it." }],
    accessibility: [
      "It is a native checkbox, so its state is announced without extra ARIA.",
      "`indeterminate` is announced as mixed.",
      "Checked and mixed draw a shape, not only a color. In forced-colors mode the native checkbox returns.",
    ],
  },
  "radio-group": {
    usage: `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

<RadioGroup legend="Delivery" defaultValue="standard">
  <RadioGroupItem value="standard">Standard</RadioGroupItem>
  <RadioGroupItem value="express">Express</RadioGroupItem>
</RadioGroup>`,
    api: [
      {
        component: "RadioGroup",
        description: "Every other prop goes to the `<fieldset>`.",
        props: [
          {
            name: "legend",
            type: "ReactNode",
            description: "Required. The visible question, and the group's accessible name.",
          },
          {
            name: "name",
            type: "string",
            defaultText: "generated",
            description: "The shared `name` that forms submit.",
          },
          {
            name: "value",
            type: "string",
            description: "The checked value, for a controlled group.",
          },
          {
            name: "defaultValue",
            type: "string",
            description: "The value checked at first, for an uncontrolled group.",
          },
          {
            name: "onValueChange",
            type: "(value: string) => void",
            description: "Called with the value the user checks.",
          },
          {
            name: "required",
            type: "boolean",
            default: "false",
            description: "A form cannot submit without a choice.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables every radio through the fieldset.",
          },
        ],
      },
      {
        component: "RadioGroupItem",
        description: "`className` styles the label row; other props go to the `<input>`.",
        props: [
          {
            name: "value",
            type: "string",
            description: "Required. The value this radio reports.",
          },
          {
            name: "children",
            type: "ReactNode",
            description: "Required. The visible label.",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables this radio only.",
          },
        ],
      },
    ],
    keyboard: [
      { key: "Tab", action: "Moves focus into the group: the checked radio, or the first one." },
      { key: "Arrow keys", action: "Move focus and the choice, skipping disabled radios." },
      { key: "Space", action: "Checks the focused radio if none is checked." },
    ],
    accessibility: [
      "The `<legend>` names the group, so screen readers announce the question with each radio.",
      "The group is one Tab stop, managed by the browser.",
      "A checked radio shows a filled dot, not only a color.",
    ],
  },
  switch: {
    usage: `import { Switch } from "@/components/ui/switch";

<label className="flex items-center gap-2">
  <Switch checked={wifi} onChange={(event) => setWifi(event.target.checked)} />
  Wi-Fi
</label>`,
    api: [
      {
        component: "Switch",
        description: "Every other prop, `ref` included, goes to the native `<input>`.",
        props: [
          {
            name: "checked",
            type: "boolean",
            description: "On or off, for a controlled switch. Update it from `onChange`.",
          },
          {
            name: "stateLabels",
            type: "{ on: ReactNode; off: ReactNode }",
            description: "Visible text for each state, hidden from screen readers.",
          },
          className,
        ],
      },
    ],
    keyboard: [{ key: "Space", action: "Turns it on or off." }],
    accessibility: [
      'It has `role="switch"`, so screen readers announce it as on or off.',
      "The thumb's position shows the state, so it is never color alone.",
      "The thumb slides only without reduced motion.",
    ],
  },
  select: {
    usage: `import { Select } from "@/components/ui/select";

<Select name="size" defaultValue="m">
  <option value="s">Small</option>
  <option value="m">Medium</option>
</Select>`,
    api: [
      {
        component: "Select",
        description: "Every prop, `ref` included, goes to the native `<select>`.",
        props: [
          {
            name: "multiple",
            type: "boolean",
            default: "false",
            description: "A list box with no picker, and no chevron.",
          },
          {
            name: "size",
            type: "number",
            description: "Above 1, a list box showing that many rows, with no chevron.",
          },
          className,
        ],
      },
    ],
    keyboard: [
      { key: "Space", action: "Opens the platform picker in most browsers." },
      { key: "Arrow keys", action: "Change the option, or move through an open picker." },
      { key: "Letters", action: "Jump to a matching option." },
    ],
    accessibility: [
      "It is a native `<select>`, so the keyboard, touch and screen reader behavior are the platform's.",
      "The chevron is `aria-hidden` and ignores clicks. In forced-colors mode the native arrow returns.",
    ],
  },
  card: {
    usage: `import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Starter plan</CardTitle>
    <CardDescription>For a single project.</CardDescription>
  </CardHeader>
  <CardContent>Three seats and 10 GB of storage.</CardContent>
  <CardFooter>Billed monthly.</CardFooter>
</Card>`,
    api: [
      {
        component: "Card",
        description: "Every other prop goes to the `<div>`.",
        props: [
          {
            name: "decor",
            type: "boolean",
            default: "false",
            description:
              "Adds a hatched band across the top: hidden from assistive technology and removed in forced-colors mode.",
          },
          {
            name: "interactive",
            type: "boolean",
            default: "false",
            description:
              "For a card that is one stretched link: it lifts and shows a shadow on hover and on keyboard focus. The lift needs motion; the shadow fades in every mode.",
          },
          className,
        ],
      },
      {
        component: "CardTitle",
        description: "Every other prop goes to the heading.",
        props: [
          {
            name: "as",
            type: '"h2" | "h3" | "h4" | "h5" | "h6"',
            default: '"h3"',
            description: "Heading level, to fit the page outline. The look stays the same.",
          },
          className,
        ],
      },
      {
        component: "CardDescription",
        description: "Every other prop goes to the `<p>`.",
        props: [className],
      },
      {
        component: "CardHeader, CardContent, CardFooter",
        description: "Layout parts: every other prop goes to their `<div>`.",
        props: [className],
      },
    ],
    accessibility: [
      "It is a plain `<div>` with no role, so it is not focusable and adds no landmark.",
      "`CardTitle` is a real heading, `h3` by default; set `as` so the page outline skips no level.",
      "The `decor` band is `aria-hidden` and removed in forced-colors mode.",
      "To make the whole card a link, stretch one real link in the title over the card; never put `onClick` on the card.",
      "An `interactive` card gives keyboard focus the same lift and shadow as hover, lifts only when reduced motion is off, and leaves the link's focus ring untouched.",
    ],
  },
  badge: {
    usage: `import { Badge } from "@/components/ui/badge";

<Badge>New</Badge>`,
    api: [
      {
        component: "Badge",
        description: "Every other prop goes to the `<span>`.",
        props: [
          {
            name: "variant",
            type: '"default" | "secondary" | "outline" | "destructive"',
            default: '"default"',
            description: "Visual style. The text, not the color, says what it means.",
          },
          className,
        ],
      },
      {
        component: "badgeVariants()",
        description: "The same classes as a string.",
        props: [
          {
            name: "variant",
            type: '"default" | "secondary" | "outline" | "destructive"',
            default: '"default"',
            description: "The same variants as the Badge.",
          },
        ],
      },
    ],
    accessibility: [
      "It is a `<span>` with no role, read inline with the text around it.",
      "It is not focusable. For something people can act on, use a Button or a Link.",
      "Its text carries the meaning, never its color alone.",
      "In forced-colors mode the fill is dropped and the border keeps the shape.",
      'Screen readers do not announce a badge whose text changes: announce it from a `role="status"` region.',
    ],
  },
  avatar: {
    usage: `import { Avatar } from "@/components/ui/avatar";

<Avatar src={user.photo} alt={user.name} />`,
    api: [
      {
        component: "Avatar",
        description: "`ref` and every other prop go to the root `<span>`.",
        props: [
          {
            name: "alt",
            type: "string",
            description:
              'Required. Who the avatar shows, such as the person\'s name. It names the image and the initials fallback; `alt=""` hides the avatar from assistive technology.',
          },
          {
            name: "src",
            type: "string",
            description:
              "Image URL. Without it, or when it fails to load, the avatar shows initials.",
          },
          {
            name: "fallback",
            type: "string",
            defaultText: "initials of `alt`",
            description: "Text for the fallback.",
          },
          {
            name: "size",
            type: '"sm" | "default" | "lg"',
            default: '"default"',
            description: "32, 40 or 48px.",
          },
          className,
        ],
      },
    ],
    accessibility: [
      "`alt` is required by its type, so every avatar either has a name or is marked decorative.",
      'The initials fallback has `role="img"` named by `alt`, and the letters are `aria-hidden`, so screen readers hear the name, not letters.',
      '`alt=""` hides the image, or its fallback, from screen readers, for an avatar next to a visible name.',
      "In forced-colors mode a border keeps the circle visible.",
    ],
  },
  separator: {
    usage: `import { Separator } from "@/components/ui/separator";

<section>…</section>
<Separator />
<section>…</section>`,
    api: [
      {
        component: "Separator",
        description: "Every other prop, `ref` included, goes to the `<hr>` or `<div>`.",
        props: [
          {
            name: "orientation",
            type: '"horizontal" | "vertical"',
            default: '"horizontal"',
            description: "`horizontal` renders an `<hr>`; `vertical` a separator for a row.",
          },
          {
            name: "decorative",
            type: "boolean",
            default: "false",
            description:
              "For a line that only decorates: it is hidden from assistive technology. Leave it off between sections of content.",
          },
          className,
        ],
      },
    ],
    accessibility: [
      "A horizontal separator is a native `<hr>`, announced as a separator.",
      'A vertical one is a `<div>` with `role="separator"` and `aria-orientation="vertical"`.',
      '`decorative` renders `role="none"` with `aria-hidden`, so screen readers skip it.',
      "It is never focusable.",
      "It is drawn with a border, not a background, so it stays visible in forced-colors mode.",
    ],
  },
  alert: {
    usage: `import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert variant="destructive">
  <AlertTitle>Payment failed</AlertTitle>
  <AlertDescription>Your card was declined.</AlertDescription>
</Alert>`,
    api: [
      {
        component: "Alert",
        description: "Every other prop goes to the `<div>`.",
        props: [
          {
            name: "variant",
            type: '"default" | "destructive"',
            default: '"default"',
            description: "Visual style. Each variant has its own default icon.",
          },
          {
            name: "live",
            type: '"off" | "polite" | "assertive"',
            default: '"off"',
            description:
              '`polite` makes it a `role="status"` region; `assertive` a `role="alert"` region, only for important messages that appear or change while the user works.',
          },
          {
            name: "icon",
            type: "ReactNode",
            defaultText: "per variant",
            description:
              "The icon before the title, hidden from assistive technology. `null` shows none.",
          },
          className,
        ],
      },
      {
        component: "AlertTitle, AlertDescription",
        description: "Each renders a `<div>` in the text column; every other prop goes to it.",
        props: [
          {
            name: "children",
            type: "ReactNode",
            description: "The title or the description. The title can hold a heading.",
          },
          className,
        ],
      },
    ],
    accessibility: [
      "By default it has no role: text that is on the page from the start needs no announcement.",
      '`live="assertive"` gives it `role="alert"`, which interrupts the screen reader; use `live="polite"` for most messages.',
      "Render a live alert before its content changes: a region inserted together with its text is often not announced.",
      "The icon is `aria-hidden`, and the title says what kind of message it is, so color is never the only signal.",
    ],
  },
  spinner: {
    usage: `import { Spinner } from "@/components/ui/spinner";

<Spinner label="Loading comments" />`,
    api: [
      {
        component: "Spinner",
        description: 'Every other prop goes to the `role="status"` `<span>`.',
        props: [
          {
            name: "label",
            type: "string",
            default: '"Loading"',
            description: "What is loading, read by screen readers and hidden on screen.",
          },
          {
            name: "size",
            type: '"sm" | "default" | "lg"',
            default: '"default"',
            description: "16, 24 or 32px. The color follows the text color.",
          },
          className,
        ],
      },
    ],
    accessibility: [
      'It is a `role="status"` element named by a visually hidden `label`; the drawing is `aria-hidden`.',
      "It is not focusable.",
      "It spins only without reduced motion; otherwise it shows three static dots.",
      "It draws with the current text color, so it follows forced-colors mode.",
    ],
  },
  skeleton: {
    usage: `import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-36" />`,
    api: [
      {
        component: "Skeleton",
        description: "Every other prop goes to the `<div>`. It takes no children.",
        props: [
          {
            name: "className",
            type: "string",
            description: "Size and shape, such as `h-4 w-36`, merged with `cn()`.",
          },
        ],
      },
    ],
    accessibility: [
      "It is `aria-hidden`: a placeholder block means nothing to a screen reader.",
      'Mark the loading region with `aria-busy="true"`, and announce completion from a `role="status"` region that is already on the page.',
      "It pulses only without reduced motion.",
      "In forced-colors mode a border keeps each block visible.",
    ],
  },
  "skip-link": {
    usage: `import { SkipLink } from "@/components/ui/skip-link";

<SkipLink />
<main id="main" tabIndex={-1}>…</main>`,
    api: [
      {
        component: "SkipLink",
        description: "Every other prop goes to the native `<a>`.",
        props: [
          {
            name: "href",
            type: "`#${string}`",
            default: '"#main"',
            description: 'The in-page target. Give it `tabindex="-1"`.',
          },
          {
            name: "children",
            type: "ReactNode",
            default: '"Skip to content"',
            description: "The link text.",
          },
          className,
        ],
      },
    ],
    keyboard: [
      { key: "Tab", action: "From the top of the page, shows the link." },
      { key: "Enter", action: "Moves focus to the main content." },
    ],
    accessibility: [
      "It is clipped, not removed, so screen readers still find it.",
      "On focus it appears above sticky headers, so focus is never hidden (WCAG 2.4.11).",
    ],
  },
};

/** Spanish text for one export: its description, and each prop's description by prop name. */
interface SpanishApiDoc {
  description?: string;
  props: Record<string, string>;
  /** Spanish for the `defaultText` of a prop, by prop name. */
  defaultTexts?: Record<string, string>;
}

/** Spanish text for one component page. Terminology follows the glossary in `src/i18n/ui.ts`. */
interface SpanishDocs {
  /** By export name, as in `ApiDoc.component`. */
  api: Record<string, SpanishApiDoc>;
  /** By key as written in English; `key` gives the key's Spanish name when it has one. */
  keyboard?: Record<string, { key?: string; action: string }>;
  /** In the same order as the English notes. */
  accessibility: string[];
}

const classNameEs = "Clases adicionales, combinadas con `cn()`.";
const buttonVariantEs =
  "Estilo visual. `destructive` es para acciones que eliminan algo o no se pueden deshacer.";
const buttonKeyboardEs = {
  Enter: { action: "Activa el botón." },
  Space: { key: "Espacio", action: "Activa el botón." },
};
const fieldKeyboardEs = { Tab: { action: "Mueve el foco al control y, después, al siguiente." } };
const inputInvalidEs = "Pone el borde en el color destructivo. Field lo aplica por ti.";
const visibleLabelEs = "Necesita una etiqueta visible: ponlo en un Field.";

const spanishDocs: Record<string, SpanishDocs> = {
  button: {
    api: {
      Button: {
        description: "Todas las demás props van al `<button>` nativo.",
        props: {
          variant: buttonVariantEs,
          size: "Alto y relleno: 32, 40 o 48px, o un cuadrado de esos mismos tamaños.",
          loading:
            "Muestra un indicador de carga y bloquea la activación, mientras el botón conserva el foco.",
          type: 'Pasa `"submit"` para el botón de envío de un formulario.',
          className: classNameEs,
        },
      },
      "buttonVariants()": {
        description: "Las mismas clases como cadena, para un enlace con aspecto de botón.",
        props: { variant: buttonVariantEs, size: "Los mismos tamaños que el Button." },
      },
    },
    keyboard: buttonKeyboardEs,
    accessibility: [
      "Es un `<button>` nativo, así que puede recibir el foco y se anuncia como botón.",
      'Mientras carga, aplica `aria-busy` y `aria-disabled` y sigue pudiendo recibir el foco; anuncia el progreso desde una región `role="status"` fuera del botón.',
      "`disabled` lo quita del orden de tabulación. Mientras una acción está en curso, es preferible `loading`.",
      "El anillo de foco es un contorno, así que sigue visible en el modo de colores forzados.",
    ],
  },
  "icon-button": {
    api: {
      IconButton: {
        description:
          "Acepta todas las props del Button, salvo los valores de `size` que no son cuadrados.",
        props: {
          "aria-label": "Obligatoria. Es el único nombre accesible del botón: describe la acción.",
          children: "Obligatoria. El icono, oculto para las tecnologías de apoyo.",
          size: "Un cuadrado de 32, 40 o 48px.",
          variant: buttonVariantEs,
          loading: "Reemplaza el icono por un indicador de carga y bloquea la activación.",
          motion:
            "Un gesto que el icono reproduce una vez al pasar el puntero y al recibir el foco con el teclado (`pop`, también al pulsar). `wiggle` levanta una tapa marcada con `data-lid`.",
        },
      },
    },
    keyboard: buttonKeyboardEs,
    accessibility: [
      "`aria-label` es obligatoria según su tipo, porque un icono no tiene texto.",
      "El icono va dentro de un span con `aria-hidden`, así que nunca se suma al nombre.",
      "Todos los tamaños miden al menos 32px, por encima del objetivo mínimo de 24px.",
      "Los gestos de `motion` solo se reproducen si el usuario no pidió movimiento reducido, se reproducen una vez sin repetirse y no tocan el anillo de foco.",
    ],
  },
  link: {
    api: {
      Link: {
        description: "Todas las demás props van al `<a>` nativo.",
        props: {
          href: "Obligatoria. Sin ella, un ancla no es un enlace.",
          variant: "Color del texto. Las dos conservan el subrayado.",
          external:
            'Abre una pestaña nueva con `rel="noopener noreferrer"` y se lo indica a todos los usuarios.',
          className: classNameEs,
        },
      },
    },
    keyboard: { Enter: { action: "Abre el enlace." } },
    accessibility: [
      "Siempre es un `<a href>` real, que se anuncia como enlace y se alcanza con Tab.",
      "El subrayado se mantiene en todos los estados, así que el color nunca es la única señal.",
      'Una pestaña nueva agrega "(opens in a new tab)" al nombre accesible, incluso con `aria-label`.',
    ],
  },
  field: {
    api: {
      Field: {
        description: "Todas las demás props van al `<div>` contenedor.",
        props: {
          label: "Obligatoria. Se renderiza como el `<label>` del control.",
          description: "Texto de ayuda, vinculado con `aria-describedby`.",
          error: "Texto del error. Mientras tiene valor, el control recibe `aria-invalid`.",
          required: 'Aplica el `required` nativo y muestra "(required)".',
          children:
            "Obligatoria. Una render prop que expande las props del control, o un solo elemento.",
          className: classNameEs,
        },
      },
    },
    keyboard: fieldKeyboardEs,
    accessibility: [
      "Hacer clic en la etiqueta enfoca el control, porque el `for` de la etiqueta coincide con su id.",
      "Los lectores de pantalla leen la descripción y luego el error, después del nombre.",
      'La región del error siempre está presente, con `aria-live="polite"`, así que los errores nuevos se anuncian.',
      'La marca "(required)" está oculta para los lectores de pantalla, que anuncian el estado `required` nativo.',
    ],
  },
  input: {
    api: {
      Input: {
        description: "Todas las props van al `<input>` nativo.",
        props: {
          type: "Cualquier tipo de input nativo, como `email` o `search`.",
          "aria-invalid": inputInvalidEs,
          className: classNameEs,
        },
      },
    },
    keyboard: fieldKeyboardEs,
    accessibility: [
      visibleLabelEs,
      "El borde tiene un contraste de al menos 3:1, y el foco muestra el anillo.",
      "Una fuente de 16px evita que los navegadores móviles hagan zoom al recibir el foco.",
    ],
  },
  textarea: {
    api: {
      Textarea: {
        description: "Todas las props van al `<textarea>` nativo.",
        props: {
          rows: "Altura inicial en líneas. Empieza con unas tres líneas de alto.",
          "aria-invalid": inputInvalidEs,
          className: classNameEs,
        },
      },
    },
    keyboard: fieldKeyboardEs,
    accessibility: [
      visibleLabelEs,
      "Se redimensiona en vertical, así que se puede agrandar para leer textos largos.",
    ],
  },
  checkbox: {
    api: {
      Checkbox: {
        description: "Todas las demás props, `ref` incluida, van al `<input>` nativo.",
        props: {
          checked: "El estado marcado, para una casilla controlada. Actualízalo desde `onChange`.",
          indeterminate: "Muestra un guion e informa un estado mixto.",
          className: classNameEs,
        },
      },
    },
    keyboard: { Space: { key: "Espacio", action: "La marca o la desmarca." } },
    accessibility: [
      "Es una casilla nativa, así que su estado se anuncia sin ARIA adicional.",
      "`indeterminate` se anuncia como mixto.",
      "Los estados marcado y mixto dibujan una forma, no solo un color. En el modo de colores forzados vuelve la casilla nativa.",
    ],
  },
  "radio-group": {
    api: {
      RadioGroup: {
        description: "Todas las demás props van al `<fieldset>`.",
        props: {
          legend: "Obligatoria. La pregunta visible y el nombre accesible del grupo.",
          name: "El `name` compartido que envían los formularios.",
          value: "El valor marcado, para un grupo controlado.",
          defaultValue: "El valor marcado al principio, para un grupo no controlado.",
          onValueChange: "Se llama con el valor que marca el usuario.",
          required: "El formulario no se puede enviar sin elegir una opción.",
          disabled: "Deshabilita todos los botones de opción a través del fieldset.",
        },
        defaultTexts: { name: "generado" },
      },
      RadioGroupItem: {
        description:
          "`className` da estilo a la fila de la etiqueta; las demás props van al `<input>`.",
        props: {
          value: "Obligatoria. El valor que informa este botón de opción.",
          children: "Obligatoria. La etiqueta visible.",
          disabled: "Deshabilita solo este botón de opción.",
        },
      },
    },
    keyboard: {
      Tab: { action: "Lleva el foco al grupo: al botón marcado o, si no hay ninguno, al primero." },
      "Arrow keys": {
        key: "Flechas",
        action: "Mueven el foco y la elección, y saltan los botones deshabilitados.",
      },
      Space: { key: "Espacio", action: "Marca el botón enfocado si no hay ninguno marcado." },
    },
    accessibility: [
      "La `<legend>` da nombre al grupo, así que los lectores de pantalla anuncian la pregunta con cada botón.",
      "El grupo es una sola parada de Tab, gestionada por el navegador.",
      "Un botón marcado muestra un punto relleno, no solo un color.",
    ],
  },
  switch: {
    api: {
      Switch: {
        description: "Todas las demás props, `ref` incluida, van al `<input>` nativo.",
        props: {
          checked:
            "Activado o desactivado, para un Switch controlado. Actualízalo desde `onChange`.",
          stateLabels: "Texto visible para cada estado, oculto para los lectores de pantalla.",
          className: classNameEs,
        },
      },
    },
    keyboard: { Space: { key: "Espacio", action: "Lo activa o lo desactiva." } },
    accessibility: [
      'Tiene `role="switch"`, así que los lectores de pantalla lo anuncian como activado o desactivado.',
      "La posición del indicador muestra el estado, así que nunca depende solo del color.",
      "El indicador solo se desliza si no se pidió movimiento reducido.",
    ],
  },
  select: {
    api: {
      Select: {
        description: "Todas las props, `ref` incluida, van al `<select>` nativo.",
        props: {
          multiple: "Un cuadro de lista sin selector desplegable y sin flecha.",
          size: "Por encima de 1, un cuadro de lista que muestra esa cantidad de filas, sin flecha.",
          className: classNameEs,
        },
      },
    },
    keyboard: {
      Space: {
        key: "Espacio",
        action: "Abre el selector de la plataforma en la mayoría de los navegadores.",
      },
      "Arrow keys": { key: "Flechas", action: "Cambian la opción o recorren el selector abierto." },
      Letters: { key: "Letras", action: "Saltan a una opción que coincida." },
    },
    accessibility: [
      "Es un `<select>` nativo, así que el comportamiento con teclado, pantalla táctil y lector de pantalla es el de la plataforma.",
      "La flecha tiene `aria-hidden` e ignora los clics. En el modo de colores forzados vuelve la flecha nativa.",
    ],
  },
  card: {
    api: {
      Card: {
        description: "Todas las demás props van al `<div>`.",
        props: {
          decor:
            "Agrega una franja rayada en la parte superior, oculta para las tecnologías de apoyo y eliminada en el modo de colores forzados.",
          interactive:
            "Para una tarjeta que es un solo enlace extendido: se eleva y muestra una sombra al pasar el puntero y con el foco del teclado. La elevación necesita movimiento; la sombra aparece en todos los modos.",
          className: classNameEs,
        },
      },
      CardTitle: {
        description: "Todas las demás props van al encabezado.",
        props: {
          as: "Nivel del encabezado, para encajar en el esquema de la página. El aspecto no cambia.",
          className: classNameEs,
        },
      },
      CardDescription: {
        description: "Todas las demás props van al `<p>`.",
        props: { className: classNameEs },
      },
      "CardHeader, CardContent, CardFooter": {
        description: "Partes de la estructura: todas las demás props van a su `<div>`.",
        props: { className: classNameEs },
      },
    },
    accessibility: [
      "Es un `<div>` simple sin rol, así que no recibe el foco ni agrega un punto de referencia.",
      "`CardTitle` es un encabezado real, `h3` por defecto; ajusta `as` para que el esquema de la página no salte ningún nivel.",
      "La franja de `decor` tiene `aria-hidden` y se elimina en el modo de colores forzados.",
      "Para que toda la tarjeta sea un enlace, extiende un enlace real del título sobre la tarjeta; nunca pongas `onClick` en la tarjeta.",
      "Una tarjeta `interactive` da al foco del teclado la misma elevación y sombra que al puntero, solo se eleva si no se pidió movimiento reducido y no toca el anillo de foco del enlace.",
    ],
  },
  badge: {
    api: {
      Badge: {
        description: "Todas las demás props van al `<span>`.",
        props: {
          variant: "Estilo visual. El texto, no el color, dice lo que significa.",
          className: classNameEs,
        },
      },
      "badgeVariants()": {
        description: "Las mismas clases como cadena.",
        props: { variant: "Las mismas variantes que el Badge." },
      },
    },
    accessibility: [
      "Es un `<span>` sin rol, que se lee junto con el texto que lo rodea.",
      "No recibe el foco. Para algo con lo que se pueda interactuar, usa un Button o un Link.",
      "Su texto transmite el significado, nunca solo su color.",
      "En el modo de colores forzados se quita el relleno y el borde conserva la forma.",
      'Los lectores de pantalla no anuncian un badge cuyo texto cambia: anúncialo desde una región `role="status"`.',
    ],
  },
  avatar: {
    api: {
      Avatar: {
        description: "`ref` y todas las demás props van al `<span>` raíz.",
        props: {
          alt: 'Obligatoria. A quién muestra el avatar, como el nombre de la persona. Da nombre a la imagen y a las iniciales de respaldo; `alt=""` oculta el avatar para las tecnologías de apoyo.',
          src: "URL de la imagen. Sin ella, o si no carga, el avatar muestra las iniciales.",
          fallback: "Texto de respaldo.",
          size: "32, 40 o 48px.",
          className: classNameEs,
        },
        defaultTexts: { fallback: "iniciales de `alt`" },
      },
    },
    accessibility: [
      "`alt` es obligatoria según su tipo, así que todo avatar tiene un nombre o está marcado como decorativo.",
      'Las iniciales de respaldo tienen `role="img"` con `alt` como nombre, y las letras tienen `aria-hidden`, así que los lectores de pantalla oyen el nombre, no letras sueltas.',
      '`alt=""` oculta la imagen, o su respaldo, para los lectores de pantalla, en un avatar junto a un nombre visible.',
      "En el modo de colores forzados, un borde mantiene visible el círculo.",
    ],
  },
  separator: {
    api: {
      Separator: {
        description: "Todas las demás props, `ref` incluida, van al `<hr>` o al `<div>`.",
        props: {
          orientation: "`horizontal` renderiza un `<hr>`; `vertical`, un separador para una fila.",
          decorative:
            "Para una línea que solo decora: queda oculta para las tecnologías de apoyo. No la uses entre secciones de contenido.",
          className: classNameEs,
        },
      },
    },
    accessibility: [
      "Un separador horizontal es un `<hr>` nativo, que se anuncia como separador.",
      'Uno vertical es un `<div>` con `role="separator"` y `aria-orientation="vertical"`.',
      '`decorative` renderiza `role="none"` con `aria-hidden`, así que los lectores de pantalla lo omiten.',
      "Nunca recibe el foco.",
      "Se dibuja con un borde, no con un fondo, así que sigue visible en el modo de colores forzados.",
    ],
  },
  alert: {
    api: {
      Alert: {
        description: "Todas las demás props van al `<div>`.",
        props: {
          variant: "Estilo visual. Cada variante tiene su propio icono por defecto.",
          live: '`polite` la convierte en una región `role="status"`; `assertive`, en una región `role="alert"`, solo para mensajes importantes que aparecen o cambian mientras el usuario trabaja.',
          icon: "El icono antes del título, oculto para las tecnologías de apoyo. `null` no muestra ninguno.",
          className: classNameEs,
        },
        defaultTexts: { icon: "según la variante" },
      },
      "AlertTitle, AlertDescription": {
        description:
          "Cada uno renderiza un `<div>` en la columna de texto; todas las demás props van a ese elemento.",
        props: {
          children: "El título o la descripción. El título puede contener un encabezado.",
          className: classNameEs,
        },
      },
    },
    accessibility: [
      "Por defecto no tiene rol: el texto que está en la página desde el principio no necesita anunciarse.",
      '`live="assertive"` le da `role="alert"`, que interrumpe al lector de pantalla; usa `live="polite"` para la mayoría de los mensajes.',
      "Renderiza una alerta viva antes de que cambie su contenido: una región insertada junto con su texto a menudo no se anuncia.",
      "El icono tiene `aria-hidden` y el título dice qué tipo de mensaje es, así que el color nunca es la única señal.",
    ],
  },
  spinner: {
    api: {
      Spinner: {
        description: 'Todas las demás props van al `<span>` con `role="status"`.',
        props: {
          label:
            "Lo que se está cargando, leído por los lectores de pantalla y oculto en pantalla.",
          size: "16, 24 o 32px. El color sigue al color del texto.",
          className: classNameEs,
        },
      },
    },
    accessibility: [
      'Es un elemento `role="status"` con un `label` visualmente oculto como nombre; el dibujo tiene `aria-hidden`.',
      "No recibe el foco.",
      "Solo gira si no se pidió movimiento reducido; si no, muestra tres puntos estáticos.",
      "Se dibuja con el color de texto actual, así que respeta el modo de colores forzados.",
    ],
  },
  skeleton: {
    api: {
      Skeleton: {
        description: "Todas las demás props van al `<div>`. No admite contenido.",
        props: { className: "Tamaño y forma, como `h-4 w-36`, combinados con `cn()`." },
      },
    },
    accessibility: [
      "Tiene `aria-hidden`: un bloque de relleno no significa nada para un lector de pantalla.",
      'Marca la región que carga con `aria-busy="true"` y anuncia que terminó desde una región `role="status"` que ya esté en la página.',
      "Solo se anima si no se pidió movimiento reducido.",
      "En el modo de colores forzados, un borde mantiene visible cada bloque.",
    ],
  },
  "skip-link": {
    api: {
      SkipLink: {
        description: "Todas las demás props van al `<a>` nativo.",
        props: {
          href: 'El destino dentro de la página. Dale `tabindex="-1"`.',
          children: "El texto del enlace.",
          className: classNameEs,
        },
      },
    },
    keyboard: {
      Tab: { action: "Desde el principio de la página, muestra el enlace." },
      Enter: { action: "Mueve el foco al contenido principal." },
    },
    accessibility: [
      "Está recortado, no eliminado, así que los lectores de pantalla lo siguen encontrando.",
      "Al recibir el foco aparece por encima de los encabezados fijos, así que el foco nunca queda oculto (WCAG 2.4.11).",
    ],
  },
};

/** A Spanish string the docs need, or an error that names what is missing. */
function required(value: string | undefined, where: string) {
  if (value === undefined || value.trim() === "") throw new Error(`No Spanish text for ${where}`);
  return value;
}

/**
 * A component's docs in `locale`: the English docs as written, or the same entries with the
 * Spanish text. Names, types, code defaults and the usage snippet stay in English. A missing
 * Spanish string fails the build rather than showing English on a Spanish page.
 */
export function localizedComponentDocs(slug: string, locale: Locale): ComponentDocs | undefined {
  const docs = componentDocs[slug];
  if (docs === undefined || locale === "en") return docs;
  const spanish = spanishDocs[slug];
  if (spanish === undefined) throw new Error(`No Spanish docs for "${slug}"`);
  if (spanish.accessibility.length !== docs.accessibility.length) {
    throw new Error(`The Spanish accessibility notes for "${slug}" do not match the English ones`);
  }
  return {
    usage: docs.usage,
    api: docs.api.map((api) => {
      const text = spanish.api[api.component];
      const where = `${slug} ${api.component}`;
      if (text === undefined) throw new Error(`No Spanish text for ${where}`);
      return {
        component: api.component,
        description: api.description && required(text.description, `${where} description`),
        props: api.props.map((prop) => ({
          ...prop,
          defaultText:
            prop.defaultText &&
            required(text.defaultTexts?.[prop.name], `${where} ${prop.name} default`),
          description: required(text.props[prop.name], `${where} ${prop.name}`),
        })),
      };
    }),
    keyboard: docs.keyboard?.map(({ key }) => {
      const text = spanish.keyboard?.[key];
      return {
        key: text?.key ?? key,
        action: required(text?.action, `${slug} key ${key}`),
      };
    }),
    accessibility: docs.accessibility.map((_, index) =>
      required(spanish.accessibility[index], `${slug} accessibility note ${index + 1}`),
    ),
  };
}
