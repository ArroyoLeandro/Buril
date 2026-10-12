import { initTabs } from "./tabs";

/**
 * Docs-site install commands: APG tabs with automatic activation (arrow keys, Home and End move
 * focus and select) and a copy button per panel that reports its result in a status region.
 * The server renders the first tab selected, so the npm command shows without JavaScript, and
 * passes the status messages in the page language as `data-copied` (with a `{name}` placeholder)
 * and `data-copy-failed`.
 */
export function initInstallTabs(root: HTMLElement) {
  initTabs(root);
  const status = root.querySelector<HTMLElement>("[data-copy-status]");
  const copied = root.dataset.copied ?? "Copied the {name} command.";
  const failed =
    root.dataset.copyFailed ?? "Could not copy. Select the command and copy it manually.";

  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
    button.addEventListener("click", async () => {
      const name = root
        .querySelector(`[aria-controls="${button.closest('[role="tabpanel"]')?.id}"]`)
        ?.textContent?.trim();
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? "");
        if (status) status.textContent = copied.replace("{name}", name ?? "");
      } catch {
        if (status) status.textContent = failed;
      }
    });
  }
}
