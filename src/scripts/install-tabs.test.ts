import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { initInstallTabs } from "./install-tabs";

const managers = [
  ["npm", "npx shadcn@latest add @buril/button"],
  ["pnpm", "pnpm dlx shadcn@latest add @buril/button"],
  ["yarn", "yarn dlx shadcn@latest add @buril/button"],
  ["bun", "bunx --bun shadcn@latest add @buril/button"],
] as const;

/** Same markup as InstallCommand.astro renders on the server. */
function renderTabs(messages = "") {
  document.body.innerHTML = `
    <div data-install-tabs ${messages}>
      <div role="tablist" aria-label="Package manager">
        ${managers
          .map(
            ([name], i) => `<button type="button" role="tab" id="t-${name}"
              aria-selected="${i === 0}" aria-controls="p-${name}" tabindex="${i === 0 ? 0 : -1}"
            >${name}</button>`,
          )
          .join("")}
      </div>
      ${managers
        .map(
          ([name, command], i) => `<div role="tabpanel" id="p-${name}" aria-labelledby="t-${name}"
            ${i === 0 ? "" : "hidden"}>
            <pre><code>${command}</code></pre>
            <button type="button" data-copy="${command}" aria-label="Copy ${name} command">Copy</button>
          </div>`,
        )
        .join("")}
      <p role="status" data-copy-status></p>
    </div>`;
  initInstallTabs(document.querySelector<HTMLElement>("[data-install-tabs]")!);
}

const tab = (name: string) => screen.getByRole("tab", { name });
const visiblePanels = () => screen.getAllByRole("tabpanel").map((panel) => panel.id);

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("install tabs", () => {
  it("selects a tab on click and shows only its panel", async () => {
    renderTabs();
    const user = userEvent.setup();
    await user.click(tab("pnpm"));
    expect(tab("pnpm")).toHaveAttribute("aria-selected", "true");
    expect(tab("npm")).toHaveAttribute("aria-selected", "false");
    expect(visiblePanels()).toEqual(["p-pnpm"]);
  });

  it("uses one tab stop with roving tabindex", async () => {
    renderTabs();
    const user = userEvent.setup();
    await user.click(tab("yarn"));
    const stops = screen.getAllByRole("tab").filter((t) => t.getAttribute("tabindex") === "0");
    expect(stops).toEqual([tab("yarn")]);
  });

  it("moves and selects with arrow keys, wrapping, plus Home and End", async () => {
    renderTabs();
    const user = userEvent.setup();
    tab("npm").focus();
    await user.keyboard("{ArrowRight}");
    expect(tab("pnpm")).toHaveFocus();
    expect(tab("pnpm")).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(tab("bun")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(tab("npm")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(tab("bun")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(tab("npm")).toHaveFocus();
    expect(visiblePanels()).toEqual(["p-npm"]);
  });

  it("copies the command and reports success in the status region", async () => {
    renderTabs();
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    await user.click(tab("bun"));
    const panel = screen.getByRole("tabpanel");
    await user.click(within(panel).getByRole("button", { name: "Copy bun command" }));
    expect(writeText).toHaveBeenCalledWith("bunx --bun shadcn@latest add @buril/button");
    expect(screen.getByRole("status")).toHaveTextContent("Copied the bun command.");
  });

  it("marks the button as copied for two seconds, so its icon turns into a check", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderTabs();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
      const button = screen.getByRole("button", { name: "Copy npm command" });
      await user.click(button);
      expect(button).toHaveAttribute("data-copy-done");
      vi.advanceTimersByTime(2000);
      expect(button).not.toHaveAttribute("data-copy-done");
    } finally {
      vi.useRealTimers();
    }
  });

  it("never marks a failed copy as copied", async () => {
    renderTabs();
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    const button = screen.getByRole("button", { name: "Copy npm command" });
    await user.click(button);
    expect(button).not.toHaveAttribute("data-copy-done");
  });

  it("reports a failed copy instead of failing silently", async () => {
    renderTabs();
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    await user.click(screen.getByRole("button", { name: "Copy npm command" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Could not copy/);
  });

  it("reports in the page language when the server passes the messages", async () => {
    renderTabs(
      'data-copied="Se copió el comando de {name}." data-copy-failed="No se pudo copiar."',
    );
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    await user.click(screen.getByRole("button", { name: "Copy npm command" }));
    expect(screen.getByRole("status")).toHaveTextContent("Se copió el comando de npm.");
    writeText.mockRejectedValue(new Error("denied"));
    await user.click(screen.getByRole("button", { name: "Copy npm command" }));
    expect(screen.getByRole("status")).toHaveTextContent("No se pudo copiar.");
  });
});
