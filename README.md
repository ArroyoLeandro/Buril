# Buril UI

**English** · [Español](./README.es.md)

Accessible, copy-paste React components with an engraved-print look. Built from scratch, styled with Tailwind CSS, and distributed as source code you own.

> **Status: early development.** Button, Icon Button, Link, Skip Link, Field, Input, Textarea, Checkbox, Radio Group, Switch, Select, Card, Badge, Avatar, Separator, Alert, Spinner and Skeleton are available, with tests and docs pages. The docs and the registry are live at [buril.site](https://buril.site).

## Why Buril

| Principle | What it means |
|-----------|---------------|
| **You own the code** | Components are copied into your project as source. Edit them freely. |
| **Accessible by default** | Every component targets WCAG 2.2 AA and follows its [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/) pattern. |
| **Platform first** | Native elements, the `popover` attribute and semantic HTML before any JavaScript workaround. |
| **Built from scratch** | No headless UI primitives. Behavior (focus, keyboard, ARIA) is written and tested here. |
| **Themeable** | Components use the standard shadcn tokens only. Swap the palette without touching a component. |

## Install

Buril is a [shadcn-compatible registry](https://ui.shadcn.com/docs/registry). In a project set up with shadcn (it has a `components.json`), install the Button from its URL:

```bash
npx shadcn@latest add https://buril.site/r/button.json
```

Or register the `@buril` namespace once and install components by name:

```bash
npx shadcn@latest registry add @buril=https://buril.site/r/{name}.json
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

## Use with AI agents

The [shadcn MCP server](https://ui.shadcn.com/docs/mcp) reads every registry in your `components.json`, so an AI agent in your editor can browse, search and install Buril components. Add the registry:

```json
{
  "registries": {
    "@buril": "https://buril.site/r/{name}.json"
  }
}
```

Then set up the server for your client (`claude`, `cursor`, `vscode`, `opencode` or `codex`):

```bash
npx shadcn@latest mcp init --client claude
```

For agents that read the web, the docs are also published as plain text: [llms.txt](https://buril.site/llms.txt), an index of every page and registry item, and [llms-full.txt](https://buril.site/llms-full.txt), the whole docs in one file. The [AI agents page](https://buril.site/docs/ai-agents) has the setup for each client.

## Visual style

The default theme has an engraved-print look:

- Ink on raw paper. The primary color is ink in light mode and bone in dark mode.
- Red lacquer is reserved for the focus ring, the hover wash (`--accent`), decoration and destructive actions, so red always carries meaning.
- A pixel display font for headings and a neutral sans-serif for body text.
- Thin grid lines, pill-shaped buttons and optional CSS hatching.

Light and dark modes ship from the first release. Decorative elements stay optional, so the components also work with a neutral theme.

## Roadmap

| Phase | Focus | Examples |
|-------|-------|----------|
| **1** | Foundations | Button, Field, Input, Checkbox, Radio Group, Switch, Card, Alert |
| **2** | Overlays, menus and tabs | Dialog, Popover, Tooltip, Tabs, Toast, Dropdown Menu |
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
