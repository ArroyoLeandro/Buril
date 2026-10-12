import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

function Plan(props: Partial<Parameters<typeof Card>[0]>) {
  return (
    <Card data-testid="card" {...props}>
      <CardHeader>
        <CardTitle>Starter plan</CardTitle>
        <CardDescription>For a single project.</CardDescription>
      </CardHeader>
      <CardContent>Three seats and 10 GB of storage.</CardContent>
      <CardFooter>
        <button type="button">Choose Starter</button>
      </CardFooter>
    </Card>
  );
}

describe("Card", () => {
  it("is a plain container: no role, not focusable, not a landmark", () => {
    render(<Plan />);
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("DIV");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });

  it("titles itself with an h3 by default", () => {
    render(<Plan />);
    expect(screen.getByRole("heading", { level: 3, name: "Starter plan" })).toBeInTheDocument();
  });

  it.each([2, 4, 5, 6] as const)("can use an h%i to fit the page outline", (level) => {
    render(
      <Card>
        <CardTitle as={`h${level}`}>Starter plan</CardTitle>
      </Card>,
    );
    expect(screen.getByRole("heading", { level, name: "Starter plan" })).toBeInTheDocument();
  });

  it("renders the description as a paragraph and keeps content and footer in order", () => {
    render(<Plan />);
    expect(screen.getByText("For a single project.").tagName).toBe("P");
    const card = screen.getByTestId("card");
    expect(card).toHaveTextContent(
      "Starter planFor a single project.Three seats and 10 GB of storage.Choose Starter",
    );
  });

  describe("decor", () => {
    it("adds no decoration by default", () => {
      render(<Plan />);
      expect(screen.getByTestId("card").querySelector("[data-decor]")).toBeNull();
    });

    it("adds a hatched band hidden from assistive technology", () => {
      render(<Plan decor />);
      const band = screen.getByTestId("card").querySelector("[data-decor]");
      expect(band).toHaveAttribute("aria-hidden", "true");
      expect(band).toBeEmptyDOMElement();
      expect(screen.getByTestId("card").firstElementChild).toBe(band);
    });
  });

  // The accessible "whole card is a link" pattern: one real link, stretched over the card.
  describe("with a stretched link on the title", () => {
    function Article() {
      return (
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>
              <a href="/guides/forms" className="after:absolute after:inset-0">
                Accessible forms
              </a>
            </CardTitle>
            <CardDescription>Labels, errors and live regions.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    it("exposes one link named by the title, reached with one Tab", async () => {
      render(<Article />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAccessibleName("Accessible forms");
      await userEvent.tab();
      expect(links[0]).toHaveFocus();
    });

    it("is the positioning context for the stretched link", () => {
      render(<Article />);
      expect(screen.getByTestId("card")).toHaveClass("relative");
    });
  });

  it("forwards props and merges className on every part", () => {
    render(
      <Card className="max-w-sm" data-testid="card">
        <CardHeader className="gap-3" data-testid="header">
          <CardTitle className="text-xl">Title</CardTitle>
          <CardDescription className="italic">Description</CardDescription>
        </CardHeader>
        <CardContent className="pt-2" data-testid="content" />
        <CardFooter className="justify-end" data-testid="footer" />
      </Card>,
    );
    expect(screen.getByTestId("card")).toHaveClass("max-w-sm", "border");
    expect(screen.getByTestId("header")).toHaveClass("gap-3");
    expect(screen.getByTestId("header")).not.toHaveClass("gap-1.5");
    expect(screen.getByRole("heading")).toHaveClass("text-xl");
    expect(screen.getByRole("heading")).not.toHaveClass("text-lg");
    expect(screen.getByText("Description")).toHaveClass("italic", "text-muted-foreground");
    expect(screen.getByTestId("content")).toHaveClass("pt-2", "px-6");
    expect(screen.getByTestId("footer")).toHaveClass("justify-end", "flex");
  });

  describe("accessibility", () => {
    it("has no axe violations with decor and a footer action", async () => {
      const { container } = render(<Plan decor />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations with a stretched link", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle as="h2">
              <a href="/guides/forms" className="after:absolute after:inset-0">
                Accessible forms
              </a>
            </CardTitle>
          </CardHeader>
        </Card>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
