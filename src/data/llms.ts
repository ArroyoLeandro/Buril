import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { accessibilityRules, knownLimits } from "./accessibility";
import { agentPrompts, mcpClients, mcpInitCommand, registriesExample } from "./agents";
import { componentDocs, type ApiDoc, type ComponentDocs } from "./component-docs";
import { componentHref, documentedComponents, type DocumentedComponent } from "./components";
import { gettingStarted, guideItems } from "./docs-nav";
import { faq } from "./faq";
import { guides, guideHref } from "./guides";
import { motionTokenUses, reducedMotionBehavior } from "./motion";
import { githubUrl, registryItemUrl, registryUrl, siteUrl } from "./site";
import {
  applyFontsExample,
  darkModeExample,
  overrideRedExample,
  retuneMotionExample,
} from "./snippets";
import { readMotionTokens, readTokens } from "../utils/tokens";
import registry from "../../registry.json";

/**
 * The plain-text docs for AI agents, served at `/llms.txt` and `/llms-full.txt` and built with the
 * site, in English only. Lists come from the site's data (`components.ts`, `component-docs.ts`,
 * the docs nav, the guides, the FAQ, the motion and accessibility tables, `registry.json` and the
 * theme's CSS), so a new component or page shows up here without editing this file. Only the
 * short summaries of the Installation, Theming and Motion pages are written here, because those
 * pages keep their prose in `.astro` markup.
 */

const summary =
  "Buril UI is a set of accessible React components that the shadcn CLI copies into your project as source you own. It is a shadcn registry: components need React 19 and Tailwind CSS v4, read only the standard shadcn tokens, use native HTML first, target WCAG 2.2 AA and ship with keyboard and accessibility-tree tests.";

const cli = (args: string) => `npx shadcn@latest ${args}`;
const absolute = (href: string) => new URL(href, siteUrl).href.replace(/\/$/, "");
const fence = (lang: string, code: string) => `\`\`\`${lang}\n${code}\n\`\`\``;

interface RegistryItem {
  name: string;
  type: string;
  description?: string;
  dependencies?: string[];
}
const registryItems = registry.items as RegistryItem[];

/** The `description` a docs page passes to its layout, read from the page's source. */
function pageDescription(href: string): string | undefined {
  const file = resolve(`src/pages${href === "/docs" ? "/docs/index" : href}.astro`);
  if (!existsSync(file)) return undefined;
  return /<DocsLayout[\s\S]*?\sdescription="([^"]+)"/.exec(readFileSync(file, "utf8"))?.[1];
}

const link = (name: string, url: string, note?: string) =>
  `- [${name}](${url})${note ? `: ${note}` : ""}`;

/** The registry items, components first in catalog order, then the other items such as the theme. */
function itemLinks() {
  const names = [...new Set(documentedComponents.map(({ item }) => item))];
  const components = names.map((name) =>
    link(
      name,
      registryItemUrl(name),
      documentedComponents
        .filter(({ item }) => item === name)
        .map((entry) => entry.name)
        .join(", "),
    ),
  );
  const others = registryItems
    .filter(({ name }) => !names.includes(name))
    .map(({ name, description }) => link(name, registryItemUrl(name), description));
  return [...components, ...others];
}

const agentNotes = [
  `- Registry URL pattern: \`${registryUrl}\`, one JSON file per item, such as ${registryItemUrl("button")}.`,
  `- Install from a URL: \`${cli(`add ${registryItemUrl("button")}`)}\`.`,
  `- Install by name: add the \`@buril\` registry to \`components.json\` (\`${cli(`registry add @buril=${registryUrl}`)}\` does it), then \`${cli("add @buril/button")}\`.`,
  `- shadcn MCP server: with \`"@buril": "${registryUrl}"\` under \`registries\` in \`components.json\`, run \`${cli(mcpInitCommand("claude"))}\` (other clients: ${mcpClients
    .filter(({ id }) => id !== "claude")
    .map(({ id }) => `\`${id}\``)
    .join(", ")}). The agent can then list, search, view and install Buril items.`,
  `- The Buril palette is optional and separate: \`${cli("add @buril/theme")}\`. Components never depend on it.`,
];

/** `/llms.txt`: the llmstxt.org index of the docs and the registry. */
export function llmsTxt(): string {
  return [
    "# Buril UI",
    "",
    `> ${summary}`,
    "",
    ...agentNotes,
    "",
    "## Docs",
    "",
    ...gettingStarted("en").map(({ name, href }) =>
      link(name, absolute(href), pageDescription(href)),
    ),
    "",
    "## Guides",
    "",
    ...guideItems("en").map(({ name, href }, i) =>
      link(name, absolute(href), guides[i]!.description.en),
    ),
    "",
    "## Components",
    "",
    ...documentedComponents.map(({ name, slug, description }) =>
      link(name, absolute(componentHref(slug)), description),
    ),
    "",
    "## Registry",
    "",
    link("registry.json", `${siteUrl}/r/registry.json`, "The index of every registry item."),
    ...itemLinks(),
    "",
    "## Optional",
    "",
    link("llms-full.txt", `${siteUrl}/llms-full.txt`, "The whole docs as one Markdown file."),
    link("Source on GitHub", githubUrl),
    "",
  ].join("\n");
}

function installation() {
  return [
    "## Installation",
    "",
    "Buril is a registry: a set of JSON files the shadcn CLI reads. Each file describes one item, such as a component or the theme, with the source files and dependencies it installs. A namespace, such as `@buril`, is a short name for the registry, so items install by name.",
    "",
    "Requirements: a React 19 project with Tailwind CSS v4 set up for shadcn, which means it has a `components.json`. If it does not, run:",
    "",
    fence("bash", cli("init")),
    "",
    "Install a component from its URL, or register the namespace once and install by name:",
    "",
    fence(
      "bash",
      [
        cli(`add ${registryItemUrl("button")}`),
        cli(`registry add @buril=${registryUrl}`),
        cli("add @buril/button"),
      ].join("\n"),
    ),
    "",
    "The `registry add` command writes this to `components.json`, which you can also add by hand:",
    "",
    fence("json", registriesExample),
    "",
    "With other package managers, replace `npx` with `pnpm dlx`, `yarn dlx` or `bunx --bun`.",
    "",
    "The CLI adds the component file to `components/ui/`, asking before it replaces an existing file, and installs its npm dependencies. Every component imports `cn()` from shadcn's `utils` item, which re-exports it from the `cn` npm package. If your `lib/utils.ts` differs from the current shadcn version, the CLI asks before replacing it, and answering no is safe.",
    "",
    "### Optional theme",
    "",
    fence("bash", cli("add @buril/theme")),
    "",
    "It replaces your shadcn color tokens in `:root` and `.dark`, adds `--decor`, `--grid`, the font tokens `--font-display` and `--font-body` and the motion tokens, redefines the `dark:` variant with `@custom-variant dark` so it follows the system without JavaScript, and leaves `--sidebar-*` and `--chart-*` alone. The `button` item also appends the IconButton gesture keyframes (`buril-icon-*`) to your CSS.",
    "",
    "### Fonts",
    "",
    "The theme defines the font tokens but does not apply them, and Buril ships no font files. Load your own fonts, point the tokens at them and apply them:",
    "",
    fence("css", applyFontsExample),
  ];
}

function theming(css: string) {
  return [
    "## Theming",
    "",
    "Components read the standard shadcn tokens, so any shadcn theme works. The optional Buril theme sets them to ink on paper, with one red for focus, decoration, the `--accent` hover wash and destructive actions. Buril adds two decorative tokens, `--decor` and `--grid`, which always have fallbacks.",
    "",
    "### Tokens",
    "",
    "| Token | Light | Dark |",
    "| --- | --- | --- |",
    ...readTokens(css).map(
      ({ name, light, dark }) => `| \`--${name}\` | \`${light}\` | \`${dark}\` |`,
    ),
    "",
    "### Dark mode",
    "",
    "The theme reads two classes on `<html>`: `.dark` turns dark mode on and `.light` forces light mode. With neither, a `prefers-color-scheme` media query follows the system.",
    "",
    fence("html", darkModeExample),
    "",
    "### Changing the red",
    "",
    "Redefine the decoration, focus ring and hover wash tokens after the theme, in all three blocks it writes:",
    "",
    fence("css", overrideRedExample),
  ];
}

function motion(css: string) {
  return [
    "## Motion",
    "",
    "Motion is plain CSS and settles softly. Presses and hover stay quick; state changes and entries take longer and end on a gentle spring. Every component writes each token with its literal value as a fallback, so it moves the same without the theme.",
    "",
    "| Token | Value | Used for |",
    "| --- | --- | --- |",
    ...readMotionTokens(css).map(
      ({ name, value }) => `| \`--${name}\` | \`${value}\` | ${motionTokenUses[name]?.en ?? ""} |`,
    ),
    "",
    "Retune every component at once by redefining the tokens after the theme:",
    "",
    fence("css", retuneMotionExample),
    "",
    "### Reduced motion",
    "",
    "Movement sits behind Tailwind's `motion-safe:` variant; color and opacity fades stay.",
    "",
    ...reducedMotionBehavior.map(
      ({ component, motion, reduced }) => `- ${component}: ${motion.en} Reduced: ${reduced.en}`,
    ),
  ];
}

function accessibility() {
  return [
    "## Accessibility",
    "",
    "The rules every component follows:",
    "",
    ...accessibilityRules.map(
      ({ number, title, summary }) => `${number}. ${title.en}: ${summary.en}`,
    ),
    "",
    "Known limits:",
    "",
    ...knownLimits.map((limit) => `- ${limit.en}`),
  ];
}

function guideSection() {
  return [
    "## Guides",
    "",
    ...guides.map(({ slug, title, description }) =>
      link(title.en, absolute(guideHref(slug)), description.en),
    ),
  ];
}

function agents() {
  return [
    "## AI agents",
    "",
    "The shadcn MCP server reads every registry in `components.json`, so with the `@buril` entry above an agent can list, search, view and install Buril items. Set the server up for your client:",
    "",
    ...mcpClients.map(
      ({ id, name, config, manual }) =>
        `- ${name}: \`${cli(mcpInitCommand(id))}\`${manual ? `, then add the server to \`${config}\` by hand` : `, which writes \`${config}\``}.`,
    ),
    "",
    "Then ask, for example:",
    "",
    ...agentPrompts.map((prompt) => `- ${prompt}`),
  ];
}

function apiTable({ component, description, props }: ApiDoc) {
  const value = (prop: ApiDoc["props"][number]) =>
    prop.default ? `\`${prop.default}\`` : (prop.defaultText ?? "");
  const cell = (text: string) => text.replace(/\|/g, "\\|");
  return [
    `#### ${component}`,
    "",
    ...(description ? [description, ""] : []),
    "| Prop | Type | Default | Description |",
    "| --- | --- | --- | --- |",
    ...props.map(
      (prop) =>
        `| \`${prop.name}\` | \`${cell(prop.type)}\` | ${cell(value(prop))} | ${cell(prop.description)} |`,
    ),
    "",
  ];
}

function componentSection(entry: DocumentedComponent, docs: ComponentDocs | undefined) {
  const item = registryItems.find(({ name }) => name === entry.item);
  const dependencies = item?.dependencies ?? [];
  return [
    `### ${entry.name}`,
    "",
    entry.description,
    "",
    `Docs: ${absolute(componentHref(entry.slug))}. Registry item: \`${entry.item}\` (${registryItemUrl(entry.item)}).${dependencies.length > 0 ? ` npm dependencies: ${dependencies.map((name) => `\`${name}\``).join(", ")}.` : ""}`,
    "",
    fence("bash", cli(`add @buril/${entry.item}`)),
    "",
    ...(docs
      ? [
          "Usage:",
          "",
          fence("tsx", docs.usage),
          "",
          ...docs.api.flatMap(apiTable),
          "Keyboard:",
          "",
          ...(docs.keyboard && docs.keyboard.length > 0
            ? docs.keyboard.map(({ key, action }) => `- ${key}: ${action}`)
            : ["- No keyboard interaction: the component itself never takes focus."]),
          "",
          `Role: ${docs.aria.role}${docs.aria.states ? `. States: ${docs.aria.states}` : ""}.`,
          "",
          ...docs.accessibility.map((note) => `- ${note}`),
          "",
        ]
      : []),
  ];
}

function faqSection() {
  return [
    "## FAQ",
    "",
    ...faq.flatMap(({ question, answer, link: more }) => [
      `### ${question.en}`,
      "",
      ...answer.en.flatMap((paragraph) => [paragraph, ""]),
      ...(more ? [`Read more: ${absolute(more.href)}`, ""] : []),
    ]),
  ];
}

/** `/llms-full.txt`: the docs in one Markdown file. */
export function llmsFullTxt(): string {
  const css = readFileSync(resolve("registry/styles/buril.css"), "utf8");
  return [
    "# Buril UI",
    "",
    `> ${summary}`,
    "",
    `Docs: ${siteUrl}. Index of links: ${siteUrl}/llms.txt. Source: ${githubUrl}.`,
    "",
    ...installation(),
    "",
    ...agents(),
    "",
    ...theming(css),
    "",
    ...motion(css),
    "",
    ...accessibility(),
    "",
    ...guideSection(),
    "",
    "## Components",
    "",
    ...documentedComponents.flatMap((entry) => componentSection(entry, componentDocs[entry.slug])),
    ...faqSection(),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()
    .concat("\n");
}
