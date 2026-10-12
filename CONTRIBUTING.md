# Contributing to Buril UI

Thanks for helping. This guide covers the local setup, the scripts, how the tests are organized and why some tool versions are pinned. Read [COMPONENTS.md](./COMPONENTS.md) first: its accessibility rules and definition of done apply to every change.

## Setup

- **Node.js** 22.12 or later. Astro needs at least 22.12, and Vitest supports the 22, 24 and 26+ lines.
- **pnpm** 11 (the exact version is in `packageManager` in `package.json`; `corepack enable` picks it up).

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

The second line downloads the headless Chromium that `pnpm test:browser` runs in. It is needed once per machine, and again after a Playwright upgrade.

`pnpm dev` serves the docs site. Consumers can use any package manager; pnpm is only for developing Buril.

## Scripts

| Script                | What it does                                                                           |
| --------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`            | Docs site with live reload.                                                            |
| `pnpm test`           | Runs every jsdom Vitest suite once (`pnpm test:watch` keeps it running).               |
| `pnpm test:browser`   | Runs the real-browser tests (`*.browser.test.tsx`) in headless Chromium.               |
| `pnpm check`          | `astro check`, `tsc --noEmit` (twice, see below) and `shadcn registry validate`.       |
| `pnpm lint`           | ESLint, including the `jsx-a11y` rules.                                                |
| `pnpm format`         | Prettier, with class sorting from `prettier-plugin-tailwindcss`.                       |
| `pnpm format:check`   | Prettier without writing.                                                              |
| `pnpm registry:build` | `shadcn build`: writes the registry JSON to `public/r/` (git-ignored).                 |
| `pnpm build`          | `shadcn build` and then `astro build`, so the site always ships the `/r/*.json` files. |

Before opening a pull request, run:

```bash
pnpm test && pnpm test:browser && pnpm check && pnpm lint && pnpm format:check && pnpm build
```

`pnpm check` stays static (types and the registry schema) and never starts a browser. The browser tests are their own step, so `pnpm test` stays fast while you iterate.

## Project layout

- `registry/` holds the source that consumers install: components in `registry/ui/`, helpers in `registry/lib/` and the tokens in `registry/styles/buril.css`.
- `registry.json` lists the registry items. Components depend only on standard shadcn tokens and shadcn's `utils` item, so installing one never rewrites the consumer's theme or helpers. The Buril theme is a separate, opt-in item.
- `src/` is the Astro docs site. Code samples on it are read from `registry/` at build time, never copied by hand.

## Tests

Vitest runs everything. Each kind of test answers a different question:

- **Component behavior** (`registry/ui/*.test.tsx`): Testing Library in jsdom, plus `vitest-axe`. Test what users do (click, type, Tab, Enter) and what assistive technology reads (roles, names, states).
- **Compiled styles** (`registry/ui/*.styles.test.ts`): jsdom does not apply CSS, so class-name assertions cannot catch cascade bugs. These tests compile the real stylesheet with Tailwind's `compile()` API and check which rule wins, including forced-colors mode.
- **Tokens** (`test/tokens.test.ts`): parses `buril.css`, resolves `var()` and `color-mix()`, and measures every WCAG contrast pair in light and dark mode. It also checks that the registry theme ships the same values.
- **Registry contract** (`test/registry.test.ts`): components must not depend on a theme, and their dependencies must not use a namespace, so URL installs work.
- **Real browser** (`*.browser.test.tsx`, `pnpm test:browser`): Vitest browser mode with Playwright and headless Chromium, with the compiled Tailwind stylesheet and the Buril theme loaded (`test/browser.css`). Use it for what jsdom and the compiled-style tests cannot see: geometry (`getBoundingClientRect()`), computed colors in light and dark mode, real focus, transitions and `@starting-style` entries, and overlays. `test/browser.ts` switches the theme (every test starts in light mode), emulates the reduced-motion setting (`setReducedMotion`), reads the duration and easing a property transitions with (`transitionTiming`), waits for transitions to settle, measures pseudo-elements, which have no `getBoundingClientRect()`, and reads painted pixels from a screenshot. Vitest's browser matchers and jest-dom type the same matchers differently, so the browser tests, their helper and the Vitest configs are type-checked on their own with `tsconfig.browser.json`.
- **Docs pages** (`test/docs/`): renders each page with Astro's container API and checks landmarks, the skip link, the theme toggle, install commands and code-block contrast.

The project uses test-driven development: write a failing test first, watch it fail, then make it pass.

## Motion

Motion is unhurried and settles softly: "ink settles, the plate presses". Press and hover feedback stay quick, while state changes and entries take longer and end on a gentle spring. It is plain CSS, with no animation library.

- **Tokens.** Durations (`--buril-duration-instant` 100ms for presses, `fast` 200ms for hover and color, `base` 420ms for state changes, `slow` 460ms and `slower` 560ms for entries, and `--buril-duration-gesture` 720ms for one-shot icon gestures) and easings (`--buril-ease-out`, `-in`, `-in-out`, `-linear`) live in `:root` in `registry/styles/buril.css` and in the theme item's `css[":root"]`, never in `cssVars`. `--buril-ease-out` and `--buril-ease-in-out` are a soft `linear()` spring that passes its target by about 3% and settles; `--buril-ease-in` stays a plain accelerating curve for exits.
- **Fallbacks.** Components stay standalone, so every token use carries its literal value as a fallback, such as `duration-(--buril-duration-fast,200ms)` and `ease-(--buril-ease-out,linear(0,0.045,…,1))` (the full spring, without spaces). Without the theme a component looks and moves the same. `test/motion.test.ts` fails if a fallback drifts from `buril.css`.
- **Reduced motion.** Movement (translate, scale, rotate, size) goes behind `motion-safe:`. Color and opacity may change in every mode. See rule 10 in [COMPONENTS.md](./COMPONENTS.md).
- **Focus.** Never transition `outline-color` or any other part of a focus indicator. List the properties, such as `transition-[color,background-color,border-color]`; `transition`, `transition-all` and `transition-colors` include `outline-color`.
- **Performance.** Animate opacity, translate, scale and rotate. Never transition `left`, `top`, `width` or `height`.
- **No waiting.** Focus moves and state changes never wait for `transitionend` or `animationend`.
- **Tests.** Compiled-style tests check the transition properties, the token values and that movement only applies under `(prefers-reduced-motion: no-preference)`. The cascade helper resolves `@starting-style` (`startingStyle: true`) and `@supports` (`supports: [...]`). Real entry transitions, end states and positions are checked in browser tests.

## Pinned versions

Two dev tools stay one major version behind on purpose. Both pins are about plugin compatibility:

- **TypeScript 6.0.** `typescript-eslint` 8 supports TypeScript `>=4.8.4 <6.1.0`, so TypeScript 6.1 or 7 would break type-aware linting. `package.json` uses `~6.0.3`, which allows 6.0.x patches only; a caret range would let installs drift to 6.1. Widen it when `typescript-eslint` does.
- **ESLint 9.** `eslint-plugin-react` 7 declares ESLint up to `^9.7` and `eslint-plugin-jsx-a11y` 6 up to `^9`. ESLint 10 would drop the accessibility lint rules this project relies on. Upgrade when both plugins support it.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `build:`). Keep each commit to one reviewable unit, with its tests and docs alongside the code.
