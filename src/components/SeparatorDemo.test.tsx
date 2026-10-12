import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import SeparatorDemo from "./SeparatorDemo";

describe("SeparatorDemo", () => {
  it("separates the two sections with one semantic separator", () => {
    render(<SeparatorDemo />);
    const separators = screen.getAllByRole("separator");
    expect(separators).toHaveLength(1);
    expect(separators[0]!.tagName).toBe("HR");
  });

  it("keeps the dividers between links out of the accessibility tree", () => {
    const { container } = render(<SeparatorDemo />);
    expect(container.querySelectorAll('[role="none"][aria-hidden="true"]')).toHaveLength(2);
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("has no axe violations", async () => {
    const { container } = render(<SeparatorDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("SeparatorDemo in Spanish", () => {
  it("names the navigation and its links in Spanish, linking Spanish pages", () => {
    render(<SeparatorDemo locale="es" />);
    expect(screen.getByRole("navigation", { name: "Proyecto" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Documentación" })).toHaveAttribute("href", "/es/docs");
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/es/");
  });
});
