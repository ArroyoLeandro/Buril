# Buril UI — Component Catalog and Accessibility Rules

Copy-paste component library. React first, Angular in a later stage. Styled with Tailwind, built from scratch, accessible by default.

## Component catalog

Phases:

- **Phase 1** — Foundations. Without these there is no library.
- **Phase 2** — What makes the library genuinely useful.
- **Phase 3** — Hard components. The ones that stand out in a portfolio.

The APG column links each component to its pattern in the [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/). That pattern is the behavior spec for the component.

| Category | Component | Phase | APG pattern |
|---|---|---|---|
| **Actions** | Button (variants, sizes, loading) | 1 | Button |
| | Icon Button | 1 | Button |
| | Link | 1 | Link |
| **Forms** | Field (label + help + error) | 1 | — |
| | Input / Textarea | 1 | — (native HTML) |
| | Checkbox | 1 | Checkbox |
| | Radio Group | 1 | Radio Group |
| | Switch | 1 | Switch |
| | Select (styled native) | 1 | — (native HTML) |
| | Slider | 2 | Slider |
| **Content** | Card | 1 | — |
| | Badge | 1 | — |
| | Avatar | 1 | — |
| | Separator | 1 | — |
| | Table | 2 | Table |
| | Accordion | 2 | Accordion |
| **Feedback** | Alert / Callout | 1 | Alert |
| | Spinner / Skeleton | 1 | — |
| | Progress | 2 | Meter / Progressbar |
| | Toast | 2 | Alert (live region) |
| **Overlays** | Dialog / Modal | 2 | Dialog (Modal) |
| | Alert Dialog | 2 | Alert Dialog |
| | Drawer / Sheet | 2 | Dialog (Modal) |
| | Popover | 2 | Disclosure + Popover API |
| | Tooltip | 2 | Tooltip |
| | Dropdown Menu | 2 | Menu Button |
| **Navigation** | Tabs | 2 | Tabs |
| | Breadcrumb | 2 | Breadcrumb |
| | Pagination | 2 | — (nav + links) |
| | Skip Link | 1 | — |
| **Advanced** | Combobox / Autocomplete | 3 | Combobox |
| | Command Palette | 3 | Combobox + Listbox |
| | Date Picker | 3 | Dialog + Grid |
| | Carousel | 3 | Carousel |

## Mandatory accessibility rules

Target: **WCAG 2.2 level AA**.

1. **Semantic HTML first.** A button is a `<button>`. A link is an `<a href>`. Never use a `<div onClick>`. This is the first rule of ARIA: when a native element exists, use it. Native `<dialog>` and the `popover` attribute are available and preferred.
2. **Everything works with the keyboard.**
   - Tab order is logical.
   - `Escape` closes every overlay.
   - Composite widgets (tabs, menu, radio group, listbox) take a single Tab stop. Arrow keys move focus inside them (roving `tabindex`).
3. **Focus management.**
   - A modal traps focus and sets initial focus.
   - When it closes, focus returns to the element that opened it.
   - Focus is never hidden behind sticky UI (WCAG 2.4.11).
4. **Focus is always visible.**
   - Use `:focus-visible` with an indicator of at least 3:1 contrast.
   - Never use `outline: none` without a replacement.
5. **Every control has an accessible name.**
   - Each input has a `<label>`.
   - Icon buttons use `aria-label`.
   - Help and error text connect to their field through `aria-describedby`.
   - Invalid fields use `aria-invalid`.
6. **State is exposed through ARIA.** Use `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed` and `aria-controls`. Visual state and announced state must always match.
7. **Contrast.**
   - Text needs at least 4.5:1.
   - Borders, icons and focus indicators need at least 3:1.
   - Color is never the only signal. Errors also get an icon or text.
8. **Minimum target size is 24×24px** (WCAG 2.5.8).
9. **Dynamic announcements.** Toasts and status messages use `role="status"` or `aria-live="polite"`. Use `assertive` only for critical errors.
10. **Respect user preferences.**
    - Honor `prefers-reduced-motion`, per component. Anything that moves, resizes or rotates sits behind `motion-safe:`; color and opacity fades may run in every mode. Use `motion-reduce:` only for a different effect, such as the Spinner's static dots.
    - Never transition a focus indicator: it appears at once, at full contrast. List the transition properties explicitly instead of `transition`, `transition-all` or `transition-colors`, which include `outline-color`.
    - Buril ships no global reduced-motion rule. An app that wants one for its own code can paste this; it also stops the color fades:

      ```css
      @media (prefers-reduced-motion: reduce) {
        *,
        ::before,
        ::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
      ```

    - Support `forced-colors` (Windows high contrast mode).
    - Support 200% zoom and a 320px reflow width.
11. **Tooltips never contain interactive content.** If it needs a button or a link, it is a popover. The APG Tooltip pattern is still marked as work in progress. Treat it as guidance, not a closed spec.

## Definition of done per component

- [ ] Follows its APG pattern checklist (keyboard, roles, states).
- [ ] Automated tests with Testing Library + `axe`.
- [ ] Anything that depends on layout or rendering (positions, sizes, colors in both themes, focus, transitions, overlays) has a real-browser test (`*.browser.test.tsx`, `pnpm test:browser`). jsdom does not lay out or paint.
- [ ] Manual screen reader pass with NVDA (Phase 2 and 3 components).
- [ ] Uses semantic tokens only (no hardcoded colors), so future visual styles stay cheap.
  - **Known exceptions:**
    - The destructive Button uses `text-white` in light mode and `dark:text-background` in dark mode. White on the dark-mode red fails contrast, and no shadcn token is white in both modes.
    - The interactive Card's hover shadow is black at 35% opacity. A shadow only darkens, no shadcn token is a shadow color, and the lift or the link's focus ring carries the state, never the shadow alone.
  - Any new exception needs the same kind of measured reason, written next to the class.
- [ ] Copyable snippet is read from the real source file at build time, never duplicated by hand.

## Visual style notes

The first style is engraved print meeting a terminal:

- Engraving-style illustration with a single vermilion ink color on raw paper.
- Pixel monospace display font for headings.
- Neutral sans-serif for body text.
- Thin visible grid lines and pill-shaped buttons.

Constraints:

- **Check the accent contrast.** White text on bright orange-red is usually around 3.5:1, which fails AA for normal text. Darken the accent or use dark text. Measure the exact color before locking tokens.
- **The pixel font is for headings only.** Never use it for body text, labels or inputs.
- **Where component identity comes from:** the single accent color, visible grid lines and optional CSS hatching textures (`repeating-linear-gradient`).
