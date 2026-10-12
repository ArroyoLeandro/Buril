# Buril UI

**English** · [Español](./README.es.md)

Accessible, copy-paste React components with an engraved-print look. Built from scratch, styled with Tailwind CSS, and distributed as source code you own.

> **Status: early planning.** No components are published yet. This repository currently holds the component catalog and the accessibility rules every component will follow.

## Why Buril

| Principle | What it means |
|-----------|---------------|
| **You own the code** | Components are copied into your project, not installed as a runtime dependency. Edit them freely. |
| **Accessible by default** | Every component targets WCAG 2.2 AA and follows its [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/) pattern. |
| **Platform first** | Native `<dialog>`, the `popover` attribute and semantic HTML before any JavaScript workaround. |
| **Built from scratch** | No headless UI primitives. Behavior (focus, keyboard, ARIA) is written and tested here. |
| **Themeable** | Components use semantic design tokens only. Swap the palette without touching a component. |

## Planned usage

Buril will be a [shadcn-compatible registry](https://ui.shadcn.com/docs/registry). Install a component and its dependencies with the package manager you already use:

```bash
npx shadcn@latest add <buril-registry-url>/button.json
```

Each component will also have a copy button in the docs, generated from the same source file.

## Visual style

The default theme pairs engraved print with a terminal:

- A single vermilion ink on raw paper, split into a decorative accent and a stronger accent that passes AA for text.
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

See [COMPONENTS.md](./COMPONENTS.md) for the full catalog, the mandatory accessibility rules and the definition of done.

## Tech stack

- **Components:** React, TypeScript, Tailwind CSS v4
- **Positioning:** [Floating UI](https://floating-ui.com/) (`@floating-ui/dom`) for tooltips, popovers and menus
- **Docs site:** [Astro](https://astro.build/) with live React demos
- **Testing:** Vitest, Testing Library and axe

## License

[MIT](./LICENSE)
