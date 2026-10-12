import { SkipLink } from "../../registry/ui/skip-link";

const tools = ["Bold", "Italic", "Underline", "Link", "Quote"];

/**
 * A boxed version of a page: the skip link jumps past a toolbar of repeated controls. Here it
 * shows inside the box instead of at the top left of the window, so it does not cover the
 * site's own skip link.
 */
export default function SkipLinkDemo() {
  return (
    <div className="relative flex flex-col gap-4">
      <SkipLink
        href="#skip-link-demo-content"
        className="focus-visible:absolute focus-visible:top-0 focus-visible:left-0"
      >
        Skip to the demo content
      </SkipLink>
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <button
            key={tool}
            type="button"
            className="min-h-8 rounded-full border border-border px-3 text-sm"
          >
            {tool}
          </button>
        ))}
      </div>
      <section
        id="skip-link-demo-content"
        tabIndex={-1}
        aria-label="Demo content"
        className="border border-border p-4"
      >
        <p className="text-sm">
          Tab into this box and the skip link appears first. Press Enter and focus lands here, past
          the toolbar.
        </p>
      </section>
    </div>
  );
}
