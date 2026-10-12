/**
 * Docs-site install commands: APG tabs with automatic activation (arrow keys, Home and End move
 * focus and select) and a copy button per panel that reports its result in a status region.
 * The server renders the first tab selected, so the npm command shows without JavaScript.
 */
export function initInstallTabs(root: HTMLElement) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const status = root.querySelector<HTMLElement>("[data-copy-status]");

  const select = (selected: HTMLButtonElement) => {
    for (const tab of tabs) {
      const isSelected = tab === selected;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      const panel = root.querySelector<HTMLElement>(`#${tab.getAttribute("aria-controls")}`);
      if (panel) panel.hidden = !isSelected;
    }
  };

  const keys: Record<string, (index: number) => number> = {
    ArrowRight: (index) => (index + 1) % tabs.length,
    ArrowLeft: (index) => (index - 1 + tabs.length) % tabs.length,
    Home: () => 0,
    End: () => tabs.length - 1,
  };

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const next = keys[event.key];
      if (!next) return;
      event.preventDefault();
      const target = tabs[next(index)]!;
      target.focus();
      select(target);
    });
  }

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
