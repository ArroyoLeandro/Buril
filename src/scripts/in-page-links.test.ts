import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { initInPageLinks } from "./in-page-links";

/**
 * In-page links (the skip link, the "On this page" list, links to a heading) move keyboard focus
 * to their target, so the next Tab continues from there and screen readers read from the new
 * place. The browser still does the scrolling, smoothly unless the reader asks for less motion.
 */
beforeAll(() => initInPageLinks(document));

afterEach(() => {
  document.body.innerHTML = "";
  history.replaceState(null, "", "/");
});

function renderPage() {
  document.body.innerHTML = `
    <a href="#main" data-skip>Skip to content</a>
    <nav><a href="#usage">Usage</a><a href="#caf%C3%A9">Café</a><a href="#missing">Missing</a></nav>
    <a href="/docs#usage">Other page</a>
    <main id="main" tabindex="-1">
      <h2 id="usage">Usage</h2>
      <h2 id="café">Café</h2>
      <p>Text</p>
    </main>`;
}

const byId = (id: string) => document.getElementById(id)!;

describe("in-page links", () => {
  it("focuses a heading target, making it focusable only while it has focus", async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(document.querySelector<HTMLAnchorElement>('a[href="#usage"]')!);
    expect(byId("usage")).toHaveFocus();
    expect(byId("usage")).toHaveAttribute("tabindex", "-1");
    // It does not join the Tab order, and the attribute goes once focus moves on.
    await user.tab();
    expect(byId("usage")).not.toHaveAttribute("tabindex");
  });

  it("follows the link from the keyboard too", async () => {
    renderPage();
    const user = userEvent.setup();
    document.querySelector<HTMLAnchorElement>('a[href="#usage"]')!.focus();
    await user.keyboard("{Enter}");
    expect(byId("usage")).toHaveFocus();
  });

  it("keeps the skip link's target as it is: main already takes focus", async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(document.querySelector<HTMLAnchorElement>("[data-skip]")!);
    expect(byId("main")).toHaveFocus();
    await user.tab();
    expect(byId("main")).toHaveAttribute("tabindex", "-1");
  });

  it("decodes the fragment, so headings with accents work", async () => {
    renderPage();
    await userEvent.click(document.querySelector<HTMLAnchorElement>('a[href="#caf%C3%A9"]')!);
    expect(byId("café")).toHaveFocus();
  });

  it("leaves links to other pages and missing targets alone", async () => {
    renderPage();
    const user = userEvent.setup();
    const missing = document.querySelector<HTMLAnchorElement>('a[href="#missing"]')!;
    await user.click(missing);
    expect(missing).toHaveFocus();
    const other = document.querySelector<HTMLAnchorElement>('a[href="/docs#usage"]')!;
    other.addEventListener("click", (event) => event.preventDefault());
    await user.click(other);
    expect(byId("usage")).not.toHaveFocus();
  });

  it("does nothing for a modified click, which opens the link elsewhere", async () => {
    renderPage();
    const user = userEvent.setup();
    const link = document.querySelector<HTMLAnchorElement>('a[href="#usage"]')!;
    await user.keyboard("{Control>}");
    await user.click(link);
    await user.keyboard("{/Control}");
    expect(byId("usage")).not.toHaveFocus();
  });
});
