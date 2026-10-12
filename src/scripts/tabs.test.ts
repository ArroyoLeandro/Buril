import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { initTabs } from "./tabs";

const tabMarkup = (prefix: string, names: string[], panels: string[]) => `
  <div role="tablist" aria-label="${prefix}">
    ${names
      .map(
        (name, i) => `<button type="button" role="tab" id="${prefix}-tab-${i}"
          aria-selected="${i === 0}" aria-controls="${prefix}-panel-${i}" tabindex="${i === 0 ? 0 : -1}"
        >${name}</button>`,
      )
      .join("")}
  </div>
  ${panels
    .map(
      (
        content,
        i,
      ) => `<div role="tabpanel" id="${prefix}-panel-${i}" aria-labelledby="${prefix}-tab-${i}"
        ${i === 0 ? "" : "hidden"}>${content}</div>`,
    )
    .join("")}`;

/** Outer Preview/Code-style tabs whose first panel holds its own, independent tab list. */
function renderNested() {
  document.body.innerHTML = `
    <div data-tabs id="outer">
      ${tabMarkup(
        "Installation",
        ["CLI", "Manual"],
        [
          `<div data-tabs id="inner">${tabMarkup("Package manager", ["npm", "pnpm"], ["npx", "pnpm dlx"])}</div>`,
          "Copy the source",
        ],
      )}
    </div>`;
  initTabs(document.getElementById("outer")!);
  initTabs(document.getElementById("inner")!);
}

const outer = () => screen.getByRole("tablist", { name: "Installation" });
const inner = () => screen.getByRole("tablist", { name: "Package manager" });

afterEach(() => {
  document.body.innerHTML = "";
});

describe("tabs", () => {
  it("selects a tab on click and shows only its panel", async () => {
    renderNested();
    const user = userEvent.setup();
    await user.click(within(outer()).getByRole("tab", { name: "Manual" }));
    expect(within(outer()).getByRole("tab", { name: "Manual" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(outer()).getByRole("tab", { name: "CLI" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByText("Copy the source")).toBeVisible();
    expect(document.getElementById("Installation-panel-0")).not.toBeVisible();
  });

  it("moves focus and selection with the arrow keys, Home and End, with one Tab stop", async () => {
    renderNested();
    const user = userEvent.setup();
    const [cli, manual] = within(outer()).getAllByRole("tab");
    cli!.focus();
    await user.keyboard("{ArrowRight}");
    expect(manual).toHaveFocus();
    expect(manual).toHaveAttribute("aria-selected", "true");
    expect(manual).toHaveAttribute("tabindex", "0");
    expect(cli).toHaveAttribute("tabindex", "-1");
    await user.keyboard("{ArrowRight}");
    expect(cli).toHaveFocus();
    await user.keyboard("{End}");
    expect(manual).toHaveFocus();
    await user.keyboard("{Home}");
    expect(cli).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(manual).toHaveFocus();
  });

  it("leaves a nested tab list alone", async () => {
    renderNested();
    const user = userEvent.setup();
    await user.click(within(inner()).getByRole("tab", { name: "pnpm" }));
    // The inner click must not change the outer selection, and the outer panel stays open.
    expect(within(outer()).getByRole("tab", { name: "CLI" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("pnpm dlx")).toBeVisible();

    await user.click(within(outer()).getByRole("tab", { name: "Manual" }));
    expect(document.getElementById("Package manager-tab-1")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
