import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("is a status with a visually hidden Loading label by default", () => {
    render(<Spinner />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading");
    expect(screen.getByText("Loading")).toHaveClass("sr-only");
  });

  it("takes a label that says what is loading", () => {
    render(<Spinner label="Loading comments" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading comments");
  });

  it("hides its drawing from assistive technology", () => {
    render(<Spinner />);
    const svg = screen.getByRole("status").querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("is not focusable", async () => {
    render(
      <>
        <Spinner />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it.each([
    ["sm", "size-4"],
    ["default", "size-6"],
    ["lg", "size-8"],
  ] as const)("has a %s size", (size, className) => {
    render(<Spinner size={size} />);
    expect(screen.getByRole("status").querySelector("svg")).toHaveClass(className);
  });

  it("forwards ref and props to the status element and merges className", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} className="text-muted-foreground" data-testid="spinner" />);
    expect(ref.current).toBe(screen.getByRole("status"));
    expect(ref.current).toHaveClass("text-muted-foreground", "inline-flex");
    expect(ref.current).toHaveAttribute("data-testid", "spinner");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <Spinner />
        <Spinner size="lg" label="Loading photos" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
