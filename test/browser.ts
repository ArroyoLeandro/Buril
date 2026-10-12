/** Helpers for the real-browser tests (`*.browser.test.tsx`, run with `pnpm test:browser`). */
import { page } from "vitest/browser";

export const themes = ["light", "dark"] as const;
export type Theme = (typeof themes)[number];

/** Switch the Buril theme the way the docs do: `.dark` on `<html>`. */
export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Wait until the styles are recalculated and every running transition or animation ends. */
export async function settle() {
  await frame();
  await frame();
  await Promise.all(document.getAnimations().map((animation) => animation.finished));
}

/** Split a CSS value on the spaces outside parentheses: `calc(1px + 2%) 3px` has two parts. */
function topLevelParts(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let part = "";
  for (const char of value.trim()) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (char === " " && depth === 0) {
      parts.push(part);
      part = "";
    } else {
      part += char;
    }
  }
  return [...parts, part].filter(Boolean);
}

/** Resolve a computed `<length-percentage>`, such as `calc(-100% + 62.5px)`, to px. */
function resolveLength(value: string, percentBase: number) {
  const terms = value
    .replace(/^calc\((.*)\)$/, "$1")
    .replace(/\s+/g, "")
    .match(/[+-]?[\d.]+(?:e[+-]?\d+)?(?:px|%)/g);
  if (!terms || terms.join("") !== value.replace(/^calc\((.*)\)$/, "$1").replace(/\s+/g, "")) {
    throw new Error(`Cannot resolve the length ${value}`);
  }
  return terms.reduce(
    (sum, term) =>
      sum + (term.endsWith("%") ? (parseFloat(term) / 100) * percentBase : parseFloat(term)),
    0,
  );
}

/**
 * The painted box of a pseudo-element, which has no `getBoundingClientRect()`. It assumes the
 * pseudo-element is the first box in its originating element, at the start of its content box,
 * as a `::before` flex item or block is, and adds its margin and its `translate`.
 */
export function pseudoBox(element: Element, pseudo: "::before" | "::after") {
  const owner = element.getBoundingClientRect();
  const ownerStyle = getComputedStyle(element);
  const style = getComputedStyle(element, pseudo);
  const width = parseFloat(style.width);
  const height = parseFloat(style.height);
  const [x = "0px", y = "0px"] = style.translate === "none" ? [] : topLevelParts(style.translate);
  const start = (side: "Left" | "Top") =>
    parseFloat(ownerStyle[`border${side}Width`]) +
    parseFloat(ownerStyle[`padding${side}`]) +
    parseFloat(style[`margin${side}`]);
  return new DOMRect(
    owner.left + start("Left") + resolveLength(x, width),
    owner.top + start("Top") + resolveLength(y, height),
    width,
    height,
  );
}

type Channels = [number, number, number];

const toLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
const numbers = (match: RegExpExecArray) => match.slice(1, 4).map(Number) as Channels;

/**
 * The linear-light sRGB channels of a computed color: `rgb(...)`, `color(srgb ...)`, or
 * `oklab(...)`, which is how Chromium reports a `color-mix()` in oklab.
 */
function linearChannels(color: string): Channels {
  const rgb = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(color);
  if (rgb) return numbers(rgb).map((channel) => toLinear(channel / 255)) as Channels;
  const srgb = /^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)/.exec(color);
  if (srgb) return numbers(srgb).map(toLinear) as Channels;
  const oklab = /^oklab\(([\d.e-]+) ([\d.e-]+) ([\d.e-]+)/.exec(color);
  if (oklab) {
    const [lightness, a, b] = numbers(oklab);
    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const clamp = (channel: number) => Math.min(1, Math.max(0, channel));
    return [
      clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    ];
  }
  throw new Error(`Cannot read the color ${color}`);
}

function luminance(color: string) {
  const [r, g, b] = linearChannels(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const toGamma = (channel: number) =>
  Math.round(255 * (channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055));

/** A computed color as 0–255 sRGB channels, whatever notation the browser reports it in. */
export function srgb(color: string) {
  return linearChannels(color).map(toGamma) as Channels;
}

/** Whether two colors look the same: every sRGB channel within `tolerance` (0–255). */
export function sameColor(a: string, b: string, tolerance = 12) {
  const [x, y] = [srgb(a), srgb(b)];
  return x.every((channel, index) => Math.abs(channel - y[index]!) <= tolerance);
}

/**
 * Screenshot an element as the browser painted it and read its pixels, in CSS px from the
 * element's top-left corner. Use it where computed styles cannot show the result, such as a
 * stroke drawn by its dash offset or a dot left by an inset shadow.
 */
export async function paintOf(element: Element) {
  const base64 = await page.screenshot({ element, save: false });
  const image = new Image();
  image.src = `data:image/png;base64,${base64}`;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.drawImage(image, 0, 0);
  const scale = image.width / element.getBoundingClientRect().width;
  const at = (x: number, y: number) => {
    const [r, g, b] = context.getImageData(Math.floor(x * scale), Math.floor(y * scale), 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  /** How many pixels look like this color. */
  const count = (color: string) => {
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let matches = 0;
    for (let index = 0; index < data.length; index += 4) {
      const pixel = `rgb(${data[index]}, ${data[index + 1]}, ${data[index + 2]})`;
      if (sameColor(pixel, color)) matches++;
    }
    return matches;
  };
  return { at, count, width: canvas.width / scale, height: canvas.height / scale };
}

/** A theme color token, such as `--primary`, resolved to its computed color. */
export function tokenColor(name: `--${string}`) {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** WCAG contrast ratio between two computed colors. */
export function contrast(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}
