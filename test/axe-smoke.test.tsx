import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { expect, it } from "vitest";

it("axe wiring: a button with an accessible name has no violations", async () => {
  const { container } = render(<button type="button">Save</button>);
  expect(await axe(container)).toHaveNoViolations();
});

it("axe wiring: detects a button without an accessible name", async () => {
  const { container } = render(<button type="button" />);
  const results = await axe(container);
  expect(results.violations.length).toBeGreaterThan(0);
});
