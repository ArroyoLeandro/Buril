import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import TeamBlock from "./TeamBlock";

describe("TeamBlock", () => {
  it("names the avatar stack and every avatar in it", () => {
    render(<TeamBlock />);
    const stack = screen.getByRole("group", { name: "Team members" });
    const avatars = within(stack).getAllByRole("img");
    expect(avatars.map((avatar) => avatar.getAttribute("aria-label"))).toEqual([
      "Ada Lovelace",
      "Grace Hopper",
      "Katherine Johnson",
      "8 more members",
    ]);
    expect(avatars.at(-1)).toHaveTextContent("+8");
  });

  it("lists three members with their email and a role Badge", () => {
    render(<TeamBlock />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "ALAda Lovelaceada@studio.devOwner",
      "GHGrace Hoppergrace@studio.devEditor",
      "KJKatherine Johnsonkatherine@studio.devViewer",
    ]);
    for (const item of items) {
      expect(item.querySelector("[data-slot=badge]")).not.toBeNull();
      // The name is next to it, so the small avatar is decoration.
      expect(within(item).queryByRole("img")).toBeNull();
    }
  });

  it("fades out more rows that are inert and hidden from assistive technology", () => {
    const { container } = render(<TeamBlock />);
    const rows = container.querySelectorAll("li");
    const faded = [...rows].filter((row) => row.hasAttribute("inert"));
    expect(faded.length).toBeGreaterThanOrEqual(3);
    for (const row of faded) expect(row).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("[data-fade]")).not.toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(<TeamBlock />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("speaks Spanish on Spanish pages", () => {
    render(<TeamBlock locale="es" />);
    const stack = screen.getByRole("group", { name: "Miembros del equipo" });
    expect(within(stack).getByRole("img", { name: "8 miembros más" })).toBeInTheDocument();
    const roles = within(screen.getByRole("list"))
      .getAllByRole("listitem")
      .map((item) => item.querySelector("[data-slot=badge]")!.textContent);
    expect(roles).toEqual(["Propietario", "Editor", "Lector"]);
  });
});
