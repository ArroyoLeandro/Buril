import { initTabs } from "./tabs";

/**
 * Docs-site install commands: APG tabs with automatic activation (arrow keys, Home and End move
 * focus and select) and a copy button per panel that reports its result in a status region.
 * The server renders the first tab selected, so the npm command shows without JavaScript.
 */
export function initInstallTabs(root: HTMLElement) {
  initTabs(root);
  const status = root.querySelector<HTMLElement>("[data-copy-status]");

  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
    button.addEventListener("click", async () => {
      const name = root
        .querySelector(`[aria-controls="${button.closest('[role="tabpanel"]')?.id}"]`)
        ?.textContent?.trim();
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? "");
        if (status) status.textContent = `Copied the ${name} command.`;
      } catch {
        if (status) status.textContent = "Could not copy. Select the command and copy it manually.";
      }
    });
  }
}
