# Buril UI

**English** · [Español](./README.es.md)

Accessible, copy-paste React components with an engraved-print look. Built from scratch, styled with Tailwind CSS, and distributed as source code you own.

> **Status: early development.** Button, Icon Button, Link, Skip Link, Field, Input, Textarea, Checkbox, Radio Group, Switch, Select, Card, Badge, Avatar, Separator, Alert, Spinner and Skeleton are available, with tests and docs pages. The registry is not hosted yet: the commands below use the placeholder domain `example.com`, which changes once the site is live.

## Why Buril

| Principle | What it means |
|-----------|---------------|
| **You own the code** | Components are copied into your project, not installed as a runtime dependency. Edit them freely. |
| **Accessible by default** | Every component targets WCAG 2.2 AA and follows its [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/) pattern. |
| **Platform first** | Native `<dialog>`, the `popover` attribute and semantic HTML before any JavaScript workaround. |
| **Built from scratch** | No headless UI primitives. Behavior (focus, keyboard, ARIA) is written and tested here. |
| **Themeable** | Components use semantic design tokens only. Swap the palette without touching a component. |

## Install

Buril is a [shadcn-compatible registry](https://ui.shadcn.com/docs/registry). In a project set up with shadcn (it has a `components.json`), install the Button from its URL:

```bash
npx shadcn@latest add https://example.com/r/button.json
```

Or register the `@buril` namespace once and install components by name:

```bash
npx shadcn@latest registry add @buril=https://example.com/r/{name}.json
npx shadcn@latest add @buril/button
```

The examples use npx. With other package managers, replace `npx` with `pnpm dlx`, `yarn dlx` or `bunx --bun`.

Components use the standard shadcn tokens and the `cn()` helper your project already has, so installing one does not change your theme. The docs show each component's source, read from the same file the registry ships.

### Optional theme

The Buril palette is a separate install:

```bash
npx shadcn@latest add @buril/theme
```

It replaces your shadcn color tokens with the Buril values for light and dark mode and adds two decorative tokens, `--decor` and `--grid`. It also follows the system color scheme without JavaScript: the dark palette applies under `prefers-color-scheme: dark` unless `<html>` has the `light` class, and the `dark:` variant follows the same rule. To force light mode, your theme toggle must set `class="light"` on `<html>`; next-themes with `attribute="class"` already does this.

## Visual style

The default theme pairs engraved print with a terminal:

- Ink on raw paper. The primary color is ink in light mode and bone in dark mode.
- Red lacquer is reserved for the focus ring, decoration and destructive actions, so red always carries meaning.
- A pixel display font for headings and a neutral sans-serif for body text.
- Thin grid lines, pill-shaped buttons and optional CSS hatching.

Light and dark modes ship from the first release. Decorative elements stay optional, so the components also work with a neutral theme.

## Roadmap

| Phase | Focus | Examples |
|-------|-------|----------|
| **1** | Foundations | Button, Field, Input, Checkbox, Radio Group, Switch, Card, Alert |
| **2** | What makes the library useful | Dialog, Popover, Tooltip, Tabs, Toast, Dropdown Menu |
| **3** | Hard components | Combobox, Command Palette, Date Picker, Carousel |

React comes first. An Angular version is planned for a later stage.

See [COMPONENTS.md](./COMPONENTS.md) for the full catalog, the mandatory accessibility rules and the definition of done, and [CONTRIBUTING.md](./CONTRIBUTING.md) for the local setup, scripts and tests.

## Tech stack

- **Components:** React, TypeScript, Tailwind CSS v4
- **Positioning:** [Floating UI](https://floating-ui.com/) (`@floating-ui/dom`) for tooltips, popovers and menus (planned)
- **Docs site:** [Astro](https://astro.build/) with live React demos
- **Testing:** Vitest, Testing Library and axe

## License

[MIT](./LICENSE)
