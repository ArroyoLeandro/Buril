import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Link, linkVariants } from "./link";

describe("Link", () => {
  it("renders a native anchor with its href", () => {
    render(<Link href="/docs">Docs</Link>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
  });

  it("requires href at the type level, so it is never a click-only link", () => {
    render(
      // @ts-expect-error: an anchor without href is not a link (rule 1).
      <Link>Docs</Link>,
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("applies the default variant: foreground text, underline and ring focus", () => {
    render(<Link href="/docs">Docs</Link>);
    expect(screen.getByRole("link")).toHaveClass(
      "text-foreground",
      "underline",
      "focus-visible:outline-2",
      "focus-visible:outline-offset-2",
      "focus-visible:outline-ring",
    );
  });

  it("applies the muted variant and keeps the underline", () => {
    render(
      <Link href="/docs" variant="muted">
        Docs
      </Link>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("text-muted-foreground", "underline");
    expect(link).not.toHaveClass("text-foreground");
  });

  it("leaves rel, target and the hint off a same-tab link", () => {
    render(<Link href="/docs">Docs</Link>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).not.toHaveAttribute("rel");
    expect(link).not.toHaveAttribute("target");
    expect(link.querySelector("svg")).toBeNull();
  });

  describe("opening in a new tab", () => {
    it("external opens a new tab with a safe rel and says so in its name", () => {
      render(
        <Link href="https://example.com" external>
          Example
        </Link>,
      );
      const link = screen.getByRole("link", { name: "Example (opens in a new tab)" });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it('treats target="_blank" the same way', () => {
      render(
        <Link href="https://example.com" target="_blank">
          Example
        </Link>,
      );
      const link = screen.getByRole("link", { name: "Example (opens in a new tab)" });
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("keeps the hint visually hidden and the icon out of the accessibility tree", () => {
      render(
        <Link href="https://example.com" external>
          Example
        </Link>,
      );
      const link = screen.getByRole("link");
      const hint = [...link.querySelectorAll("span")].find((span) =>
        span.textContent?.includes("opens in a new tab"),
      );
      expect(hint).toHaveClass("sr-only");
      expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    it("adds noopener and noreferrer to a rel it is given, without duplicates", () => {
      render(
        <Link href="https://example.com" external rel="author noopener">
          Example
        </Link>,
      );
      expect(screen.getByRole("link")).toHaveAttribute("rel", "author noopener noreferrer");
    });
  });

  it("forwards ref to the anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link href="/docs" ref={ref}>
        Docs
      </Link>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("forwards props and merges className", () => {
    render(
      <Link href="/docs" className="text-sm" data-testid="docs">
        Docs
      </Link>,
    );
    expect(screen.getByTestId("docs")).toHaveClass("text-sm", "underline");
  });

  describe("accessibility", () => {
    it.each(["default", "muted"] as const)(
      "has no axe violations for the %s variant",
      async (variant) => {
        const { container } = render(
          <p>
            Read the{" "}
            <Link href="/docs" variant={variant}>
              docs
            </Link>
            .
          </p>,
        );
        expect(await axe(container)).toHaveNoViolations();
      },
    );

    it("has no axe violations when it opens a new tab", async () => {
      const { container } = render(
        <Link href="https://example.com" external>
          Example
        </Link>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

describe("linkVariants", () => {
  it("styles another link-like element with the same classes", () => {
    expect(linkVariants({ variant: "muted" })).toContain("text-muted-foreground");
  });
});
