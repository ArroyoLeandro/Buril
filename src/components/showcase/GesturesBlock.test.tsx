import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import GesturesBlock from "./GesturesBlock";

describe("GesturesBlock", () => {
  it("shows six IconButtons, each with its own gesture and an action name", async () => {
    const { container } = render(<GesturesBlock />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Close dialog",
      "Delete draft",
      "Notifications",
      "Reload page",
      "Send message",
      "Like",
    ]);
    expect(
      buttons.map((button) => button.querySelector("[data-motion]")!.getAttribute("data-motion")),
    ).toEqual(["rotate", "wiggle", "swing", "spin", "nudge-x", "pop"]);
    // The trash marks its lid, so wiggle lifts it.
    expect(buttons[1]!.querySelector("[data-lid]")).not.toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("toggles Like and fills the heart while pressed", async () => {
    render(<GesturesBlock />);
    const like = screen.getByRole("button", { name: "Like" });
    expect(like).toHaveAttribute("aria-pressed", "false");
    await userEvent.setup().click(like);
    expect(like).toHaveAttribute("aria-pressed", "true");
    expect(like.querySelector("svg")).toHaveAttribute("fill", "currentColor");
  });

  it("speaks Spanish on Spanish pages", () => {
    render(<GesturesBlock locale="es" />);
    expect(screen.getByRole("button", { name: "Cerrar diálogo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Me gusta" })).toBeInTheDocument();
  });
});
