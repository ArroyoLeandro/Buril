/**
 * In-page links (the skip link, the "On this page" list, links to a heading) move keyboard focus
 * to their target, so the next Tab continues from there and screen readers read from the new
 * place. The browser still scrolls, smoothly unless the reader asks for less motion (global.css),
 * and the sticky header's `scroll-padding-top` still applies: focus is moved without scrolling.
 *
 * A target that cannot take focus, such as a heading, gets `tabindex="-1"` while it has focus, so
 * it never joins the Tab order. One listener on the document covers every link on the page.
 */
export function initInPageLinks(root: Document) {
  root.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;
    const { location } = root.defaultView ?? window;
    if (!link.hash || link.pathname !== location.pathname || link.origin !== location.origin)
      return;

    let id: string;
    try {
      id = decodeURIComponent(link.hash.slice(1));
    } catch {
      return;
    }
    const target = root.getElementById(id);
    if (!target) return;
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
    target.focus({ preventScroll: true });
  });
}
