import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { initDocsNav } from "./docs-nav";

/** Same markup as DocsLayout renders on the server: the button starts hidden. */
function renderNav() {
  document.body.innerHTML = `
    <button type="button" data-docs-nav-toggle aria-expanded="false" aria-controls="docs-sidebar" hidden>
      Menu
    </button>
    <nav id="docs-sidebar" aria-label="Docs">
      <ul><li><a href="/docs">Introduction</a></li><li><a href="/docs/theming">Theming</a></li></ul>
    </nav>
    <main><a href="#x">Content</a></main>`;
  const toggle = document.querySelector<HTMLButtonElement>("[data-docs-nav-toggle]")!;
  initDocsNav(toggle);
  return { toggle, nav: document.getElementById("docs-sidebar")! };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("docs nav disclosure", () => {
  it("shows the button and collapses the sidebar once the script runs", () => {
    const { toggle, nav } = renderNav();
    expect(toggle).not.toHaveAttribute("hidden");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(nav).toHaveAttribute("data-collapsed");
  });

  it("opens and closes on click, keeping aria-expanded in sync", async () => {
    const { nav } = renderNav();
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Menu" });

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(nav).not.toHaveAttribute("data-collapsed");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(nav).toHaveAttribute("data-collapsed");
  });

  it("puts the first link next in the Tab order after opening", async () => {
    renderNav();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.tab();
    expect(screen.getByRole("link", { name: "Introduction" })).toHaveFocus();
  });

  it("closes on Escape from inside the menu and returns focus to the button", async () => {
    renderNav();
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Menu" });
    await user.click(button);
    screen.getByRole("link", { name: "Theming" }).focus();

    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("closes on Escape from the button itself", async () => {
    renderNav();
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Menu" });
    await user.click(button);
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("ignores Escape while closed", async () => {
    const { nav } = renderNav();
    const user = userEvent.setup();
    screen.getByRole("link", { name: "Introduction" }).focus();
    await user.keyboard("{Escape}");
    expect(nav).toHaveAttribute("data-collapsed");
    expect(screen.getByRole("link", { name: "Introduction" })).toHaveFocus();
  });
});
