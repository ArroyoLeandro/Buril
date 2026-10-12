/**
 * Docs-site mobile menu: a disclosure button that shows and hides the sidebar on small screens.
 * The server renders the button hidden and the sidebar open, so without JavaScript the links
 * stay reachable. Once this runs, the sidebar collapses (`data-collapsed`, which only hides it
 * below the `lg` breakpoint) and the button appears. Escape closes the menu and returns focus to
 * the button, so keyboard users never lose their place.
 */
export function initDocsNav(toggle: HTMLButtonElement) {
  const nav = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
  if (!nav) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.toggleAttribute("data-collapsed", !open);
  };
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !isOpen()) return;
    event.preventDefault();
    setOpen(false);
    toggle.focus();
  };

  setOpen(false);
  toggle.hidden = false;
  toggle.addEventListener("click", () => setOpen(!isOpen()));
  toggle.addEventListener("keydown", closeOnEscape);
  nav.addEventListener("keydown", closeOnEscape);
}
