import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Separator } from "./separator";

describe("Separator", () => {
  it("is a native hr when horizontal, with the implicit separator role", () => {
    render(<Separator />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("HR");
    expect(separator).not.toHaveAttribute("role");
    // Horizontal is the default orientation of a separator, so nothing needs to say it.
    expect(separator).not.toHaveAttribute("aria-orientation");
  });

  it("reports a vertical orientation when vertical", () => {
    render(<Separator orientation="vertical" />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("DIV");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it.each(["horizontal", "vertical"] as const)(
    "is hidden from assistive technology when decorative and %s",
    (orientation) => {
      const { container } = render(<Separator orientation={orientation} decorative />);
      const separator = container.firstElementChild!;
      expect(screen.queryByRole("separator")).toBeNull();
      expect(separator).toHaveAttribute("role", "none");
      expect(separator).toHaveAttribute("aria-hidden", "true");
      expect(separator).not.toHaveAttribute("aria-orientation");
    },
  );

  it("is never focusable", async () => {
    render(
      <>
        <Separator />
        <Separator orientation="vertical" />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("forwards ref and props and merges className", () => {
    const ref = createRef<HTMLElement>();
    render(<Separator ref={ref} className="my-6 border-input" data-testid="separator" />);
    const separator = screen.getByTestId("separator");
    expect(ref.current).toBe(separator);
    expect(separator).toHaveClass("my-6", "border-input");
    expect(separator).not.toHaveClass("border-border");
  });

  it("has no axe violations in every form", async () => {
    const { container } = render(
      <div>
        <p>Above</p>
        <Separator />
        <div className="flex">
          <span>Left</span>
          <Separator orientation="vertical" />
          <span>Right</span>
          <Separator orientation="vertical" decorative />
          <span>End</span>
        </div>
        <Separator decorative />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
