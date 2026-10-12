// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { Field } from "./field";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const html = renderToStaticMarkup(
  <Field label="Email" description="Work address." error="Enter an email address." required>
    {(control) => <input {...control} />}
  </Field>,
);

/** Classes of the first element whose opening tag matches the pattern. */
const classesOf = (tag: RegExp) => {
  const opening = tag.exec(html)?.[0];
  if (!opening) throw new Error(`No element matches ${tag}`);
  return classList(/class="([^"]*)"/.exec(opening)![1]!);
};

const label = classesOf(/<label[^>]*>/);
const description = classesOf(/<div[^>]*id="[^"]*-description"[^>]*>/);
const error = classesOf(/<div[^>]*aria-live="polite"[^>]*>/);
const marker = classesOf(/<span[^>]*aria-hidden="true"[^>]*>\(required\)/);

describe("Field compiled with Tailwind", () => {
  it("uses the body font for the label, never the display font", () => {
    expect(cascade.computed(label, "font-family")).toBeUndefined();
    expect(cascade.computed(label, "font-weight")).toBe("var(--font-weight-semibold)");
  });

  it("shows the description in the muted text color", () => {
    expect(cascade.computed(description, "color")).toBe("var(--muted-foreground)");
  });

  it("shows the required marker in the muted color, as text rather than color", () => {
    expect(cascade.computed(marker, "color")).toBe("var(--muted-foreground)");
  });

  it("shows the error in the destructive color, next to its icon", () => {
    expect(cascade.computed(error, "color")).toBe("var(--destructive)");
    expect(cascade.computed(error, "display")).toBe("flex");
  });

  // The live region stays in the page so screen readers track it, but takes no space while empty.
  it("takes the empty error region out of the layout without hiding it from screen readers", () => {
    const empty = { states: [":empty"] };
    expect(cascade.computed(error, "position", empty)).toBe("absolute");
    expect(cascade.computed(error, "clip-path", empty)).toBe("inset(50%)");
    expect(cascade.computed(error, "display", empty)).toBe("flex");
    expect(cascade.computed(error, "visibility", empty)).toBeUndefined();
    expect(cascade.computed(error, "position")).toBeUndefined();
  });
});
