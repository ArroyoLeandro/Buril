// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { faq } from "../src/data/faq";

/**
 * Next.js renders a file as a Server Component unless it starts with `"use client"`. A Server
 * Component cannot attach an event handler or keep client state, so a registry file that does
 * either must carry the directive, or it throws when a Server Component renders it. `useId`,
 * `useMemo` and `useCallback` work on the server (React's `react-server` build exports them), so
 * a file that only uses those stays a Server Component.
 */
const files = readdirSync("registry/ui")
  .filter((name) => name.endsWith(".tsx") && !name.includes(".test."))
  .map((name) => [name, readFileSync(`registry/ui/${name}`, "utf8")] as const);

const clientOnly =
  /\bon[A-Z]\w*=\{|\buse(?:State|Effect|LayoutEffect|InsertionEffect|Ref|Reducer|Context|SyncExternalStore|ImperativeHandle|Transition|DeferredValue|Optimistic|ActionState)\b/;
const directive = /^"use client";\n/;

describe('"use client" in the registry', () => {
  it("reads every component file", () => {
    expect(files.length).toBeGreaterThan(15);
  });

  it.each(files)("%s marks itself a client component exactly when it must", (_, source) => {
    expect(directive.test(source)).toBe(clientOnly.test(source));
  });

  it("marks Button, IconButton's file and SkipLink, which attach click handlers", () => {
    for (const name of ["button.tsx", "skip-link.tsx"]) {
      const source = files.find(([file]) => file === name)![1];
      expect(source, name).toMatch(directive);
    }
  });

  it("explains Server Components in the FAQ, in both languages", () => {
    const entry = faq.find(({ id }) => id === "server-components");
    expect(entry).toBeDefined();
    expect(entry!.answer.en.join(" ")).toContain('"use client"');
    expect(entry!.answer.es.join(" ")).toContain('"use client"');
  });
});
