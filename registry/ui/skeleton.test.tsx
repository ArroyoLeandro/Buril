import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("is an empty div hidden from assistive technology", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstElementChild!;
    expect(skeleton.tagName).toBe("DIV");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toBeEmptyDOMElement();
    expect(skeleton).not.toHaveAttribute("role");
  });

  it("is not focusable", async () => {
    render(
      <>
        <Skeleton />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("forwards ref and props and merges className, which sets its shape", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} className="h-4 w-32 rounded-full" data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(ref.current).toBe(skeleton);
    expect(skeleton).toHaveClass("h-4", "w-32", "rounded-full", "bg-muted");
    expect(skeleton).not.toHaveClass("rounded-md");
  });

  it("has no axe violations inside a busy region", async () => {
    const { container } = render(
      <section aria-label="Profile" aria-busy="true">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </section>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
