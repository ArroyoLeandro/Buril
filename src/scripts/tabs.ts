/**
 * Docs-site tabs (APG Tabs with automatic activation): click, the arrow keys, Home and End move
 * focus and select, and only the selected tab is in the Tab order. The server renders the first
 * tab selected. Only the root's own tab list is wired, so tabs nested in a panel stay independent.
 */
export function initTabs(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>(':scope > [role="tablist"]');
  if (!list) return;
  const tabs = [...list.querySelectorAll<HTMLElement>(':scope > [role="tab"]')];

  const select = (selected: HTMLElement) => {
    for (const tab of tabs) {
      const isSelected = tab === selected;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "");
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
}
