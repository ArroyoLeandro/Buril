import { createRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";

import { SkipLink } from "./skip-link";

/** A page shaped like the docs layout: skip link first, a header link, then the target. */
function Page({ onClick }: { onClick?: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <>
      <SkipLink onClick={onClick} />
      <header>
        <nav aria-label="Main">
          <a href="/">Home</a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <h1>Title</h1>
        <a href="/more">More</a>
      </main>
    </>
  );
}

describe("SkipLink", () => {
  it('links to "#main" with "Skip to content" by default', () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "#main");
  });

  it("takes another target and label", () => {
    render(<SkipLink href="#results">Skip to results</SkipLink>);
    expect(screen.getByRole("link", { name: "Skip to results" })).toHaveAttribute(
      "href",
      "#results",
    );
  });

  it("only accepts an in-page target at the type level", () => {
    render(
      // @ts-expect-error: a skip link jumps within the page, so its href starts with "#".
      <SkipLink href="/main" />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/main");
  });

  it("is the first focusable element when placed first", async () => {
    render(<Page />);
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus();
  });

  it("moves focus to the target when activated with the keyboard", async () => {
    render(<Page />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("main")).toHaveFocus();
    // The next Tab continues inside the main content, past the header.
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "More" })).toHaveFocus();
  });

  it("moves focus to the target when clicked", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("link", { name: "Skip to content" }));
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("calls onClick and leaves focus alone when the handler prevents the default", async () => {
    const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    render(<Page onClick={onClick} />);
    const link = screen.getByRole("link", { name: "Skip to content" });
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("main")).not.toHaveFocus();
  });

  it("does nothing when the target is missing", async () => {
    render(<SkipLink href="#nowhere" />);
    const link = screen.getByRole("link");
    await userEvent.click(link);
    expect(link).toHaveFocus();
  });

  it("decodes a percent-encoded target", async () => {
    render(
      <>
        <SkipLink href="#caf%C3%A9" />
        <section id="café" tabIndex={-1} aria-label="Café" />
      </>,
    );
    await userEvent.click(screen.getByRole("link"));
    expect(screen.getByRole("region", { name: "Café" })).toHaveFocus();
  });

  it("falls back to the raw target when it is not valid percent-encoding", async () => {
    // decodeURIComponent throws on a lone "%", which must not break the click.
    render(
      <>
        <SkipLink href="#100%" />
        <section id="100%" tabIndex={-1} aria-label="Full" />
      </>,
    );
    await userEvent.click(screen.getByRole("link"));
    expect(screen.getByRole("region", { name: "Full" })).toHaveFocus();
  });

  it("is visually hidden until it has keyboard focus", () => {
    render(<SkipLink />);
    expect(screen.getByRole("link")).toHaveClass("sr-only", "focus-visible:not-sr-only");
  });

  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<SkipLink ref={ref} className="focus-visible:top-8" />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current).toHaveClass("focus-visible:top-8");
    expect(ref.current).not.toHaveClass("focus-visible:top-4");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Page />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
