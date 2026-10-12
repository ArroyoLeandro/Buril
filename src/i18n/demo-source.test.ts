import { describe, expect, it } from "vitest";

import { plainDemoSource } from "./demo-source";

const localized = `import { useState } from "react";

import { Button } from "../../registry/ui/button";
import { demoHref, demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the labels and announcements. */
  locale?: Locale;
}

/** A demo. */
export default function SaveDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const href = demoHref(locale);
  const [count, setCount] = useState(0);
  const names = { draft: t("Draft") };

  return (
    <div>
      <h3 className="text-sm">{t("Saving")}</h3>
      <Button aria-label={t("Save draft")} onClick={() => setCount(count + 1)}>
        {t("Save")}
      </Button>
      <a href={href("/docs/components/button")}>{names.draft}</a>
      <p role="status">{count > 0 ? t("Saved {count} times.", { count }) : ""}</p>
      <p>{t("Saved by {name}.", { name: names.draft.toLowerCase() })}</p>
    </div>
  );
}
`;

describe("plainDemoSource", () => {
  const plain = plainDemoSource(localized);

  it("drops the locale plumbing: imports, the Props interface, the prop and the helpers", () => {
    expect(plain).not.toMatch(/demoTranslator|demoHref|Locale|Props|locale/);
    expect(plain).toContain("export default function SaveDemo() {");
    expect(plain).toContain('import { useState } from "react";');
    expect(plain).toContain('import { Button } from "../../registry/ui/button";');
  });

  it("writes each string as the English text, in the form its position needs", () => {
    expect(plain).not.toMatch(/\bt\(|\bhref\(/);
    expect(plain).toContain('const names = { draft: "Draft" };');
    expect(plain).toContain('<h3 className="text-sm">Saving</h3>');
    expect(plain).toContain('<Button aria-label="Save draft"');
    expect(plain).toMatch(/>\s+Save\s+<\/Button>/);
    expect(plain).toContain('<a href="/docs/components/button">');
  });

  it("turns placeholders into template literals with the original expressions", () => {
    expect(plain).toContain('count > 0 ? `Saved ${count} times.` : ""');
    expect(plain).toContain("<p>{`Saved by ${names.draft.toLowerCase()}.`}</p>");
  });

  it("leaves no run of blank lines, and no blank line opening a block, behind", () => {
    expect(plain).not.toMatch(/\n\s*\n\s*\n/);
    expect(plain).not.toMatch(/\{\n\s*\n/);
    const short = `import { demoTranslator } from "../i18n/demos";

export default function Hello({ locale = "en" }: { locale?: "en" | "es" }) {
  const t = demoTranslator(locale);

  return <p>{t("Hello")}</p>;
}
`;
    expect(plainDemoSource(short)).toBe(
      "export default function Hello() {\n  return <p>Hello</p>;\n}\n",
    );
  });

  it("returns a source without localization unchanged", () => {
    const source = 'export default function Demo() {\n  return <p className="a">{"x"}</p>;\n}\n';
    expect(plainDemoSource(source)).toBe(source);
  });
});
