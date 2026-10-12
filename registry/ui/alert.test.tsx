import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle, type AlertProps } from "./alert";

function Trial(props: Partial<AlertProps> & { message?: string }) {
  const { message = "Your trial ends in 3 days.", ...rest } = props;
  return (
    <Alert data-testid="alert" {...rest}>
      <AlertTitle>Trial ending</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

describe("Alert", () => {
  describe("live", () => {
    // role="alert" on content that is there from the start interrupts users for nothing.
    it("is static by default: no role and no live region", () => {
      render(<Trial />);
      const alert = screen.getByTestId("alert");
      expect(alert).not.toHaveAttribute("role");
      expect(alert).not.toHaveAttribute("aria-live");
      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("stays static with live off", () => {
      render(<Trial live="off" />);
      expect(screen.getByTestId("alert")).not.toHaveAttribute("role");
    });

    it("is a polite status region with live polite", () => {
      render(<Trial live="polite" />);
      expect(screen.getByRole("status")).toBe(screen.getByTestId("alert"));
    });

    it("is an assertive alert region with live assertive", () => {
      render(<Trial live="assertive" variant="destructive" />);
      expect(screen.getByRole("alert")).toBe(screen.getByTestId("alert"));
    });

    // A live region must exist before its content changes, or screen readers can miss it.
    it("keeps the same live region when its message changes", () => {
      const { rerender } = render(<Trial live="polite" message="Saving…" />);
      const region = screen.getByRole("status");
      rerender(<Trial live="polite" message="Saved." />);
      expect(screen.getByRole("status")).toBe(region);
      expect(region).toHaveTextContent("Trial endingSaved.");
    });
  });

  describe("icon", () => {
    it("shows a default icon, hidden from assistive technology", () => {
      render(<Trial />);
      const icon = screen.getByTestId("alert").querySelector("[data-slot=alert-icon]")!;
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon.querySelector("svg")).not.toBeNull();
    });

    it("uses a different default icon for the destructive variant", () => {
      const { container } = render(
        <>
          <Trial />
          <Trial variant="destructive" />
        </>,
      );
      const [info, warning] = container.querySelectorAll("[data-slot=alert-icon]");
      expect(info!.innerHTML).not.toBe(warning!.innerHTML);
    });

    it("renders a custom icon in the same hidden slot", () => {
      render(<Trial icon={<svg data-testid="custom" />} />);
      expect(screen.getByTestId("custom").closest("[data-slot=alert-icon]")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("can drop the icon with null", () => {
      render(<Trial icon={null} />);
      expect(screen.getByTestId("alert").querySelector("[data-slot=alert-icon]")).toBeNull();
    });
  });

  // Color is never the only signal: the title and the icon say what kind of message it is.
  it("reads the title before the description", () => {
    render(<Trial />);
    expect(screen.getByTestId("alert")).toHaveTextContent("Trial endingYour trial ends in 3 days.");
  });

  it("forwards ref and props and merges className on every part", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Alert ref={ref} className="max-w-md" data-testid="alert">
        <AlertTitle className="text-base">Title</AlertTitle>
        <AlertDescription className="italic">Description</AlertDescription>
      </Alert>,
    );
    expect(ref.current).toBe(screen.getByTestId("alert"));
    expect(ref.current).toHaveClass("max-w-md", "border");
    expect(screen.getByText("Title")).toHaveClass("text-base", "font-semibold");
    expect(screen.getByText("Description")).toHaveClass("italic");
  });

  describe("accessibility", () => {
    it.each([
      ["default", "off"],
      ["destructive", "off"],
      ["default", "polite"],
      ["destructive", "assertive"],
    ] as const)("has no axe violations as %s with live %s", async (variant, live) => {
      const { container } = render(<Trial variant={variant} live={live} />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
