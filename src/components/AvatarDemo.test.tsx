import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import AvatarDemo from "./AvatarDemo";

describe("AvatarDemo", () => {
  it("names every meaningful avatar, whether image or initials", () => {
    render(<AvatarDemo />);
    for (const name of ["Ada Lovelace", "Grace Hopper", "Katherine Johnson"]) {
      expect(screen.getByRole("img", { name })).toBeInTheDocument();
    }
  });

  it("falls back to initials when an image fails to load", () => {
    render(<AvatarDemo />);
    fireEvent.error(screen.getByRole("img", { name: "Katherine Johnson" }));
    const fallback = screen.getByRole("img", { name: "Katherine Johnson" });
    expect(fallback.tagName).toBe("SPAN");
    expect(fallback).toHaveTextContent("KJ");
  });

  it("hides the decorative avatar next to a visible name", () => {
    render(<AvatarDemo />);
    expect(screen.getByText("Dorothy Vaughan")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Dorothy/ })).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(<AvatarDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
