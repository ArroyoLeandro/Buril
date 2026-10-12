import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The IconButton gesture keyframes that installing the button item adds to your CSS, read from
 * the stylesheet the registry ships, so the docs never show stale CSS. A `?raw` CSS import would
 * be empty under Vitest (`css: false`), so the file is read from the project root.
 */
const css = () => readFileSync(resolve("registry/styles/icon-button.css"), "utf8");

/** One line per keyframes rule, such as `@keyframes buril-icon-spin { … }`. */
export function iconKeyframesExample() {
  return [...css().matchAll(/@keyframes ([\w-]+)/g)]
    .map(([, name]) => `@keyframes ${name} { … }`)
    .join("\n");
}

/** The whole stylesheet without its header comment, for a manual install. */
export function iconKeyframesCss() {
  return css()
    .replace(/^\/\*[\s\S]*?\*\/\s*/, "")
    .trim();
}
