/**
 * Hand-written reference for each component page, keyed by the slug in `components.ts`: a minimal
 * usage snippet, the props of each export and a summary of keyboard and screen reader behavior.
 * Text may use `backticks` for inline code. Keep it in step with `registry/ui/*`.
 */
export interface PropDoc {
  name: string;
  type: string;
  default?: string;
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
            default: "generated",
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
