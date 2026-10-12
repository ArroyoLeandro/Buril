import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

const variants = ["default", "secondary", "outline", "destructive"] as const;

describe("Badge", () => {
  it("is a span whose text is its meaning", () => {
    render(<Badge>Beta</Badge>);
    const badge = screen.getByText("Beta");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).not.toHaveAttribute("role");
  });

  it("is never focusable or interactive", async () => {
    render(
      <>
        <Badge>Beta</Badge>
        <button type="button">After</button>
      </>,
    );
    expect(screen.getByText("Beta")).not.toHaveAttribute("tabindex");
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("is read inline with the text around it", () => {
    render(
      <h2>
        Field <Badge variant="secondary">New</Badge>
      </h2>,
    );
    expect(screen.getByRole("heading", { name: "Field New" })).toBeInTheDocument();
  });

  it.each(variants)("renders the %s variant", (variant) => {
    render(<Badge variant={variant}>Status</Badge>);
    expect(screen.getByText("Status")).toHaveClass("rounded-full", "border");
  });

  it("uses the default variant when none is given", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("bg-primary", "text-primary-foreground");
  });

  it("hides an icon from assistive technology when it repeats the text", () => {
    render(
      <Badge variant="destructive">
        <svg aria-hidden="true" />
        Failed
      </Badge>,
    );
    expect(screen.getByText("Failed").querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards props and merges className", () => {
    render(
      <Badge className="px-4" data-testid="badge" title="Released this week">
        New
      </Badge>,
    );
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("px-4");
    expect(badge).not.toHaveClass("px-2.5");
    expect(badge).toHaveAttribute("title", "Released this week");
  });

  it("has no axe violations in every variant", async () => {
    const { container } = render(
      <p>
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
