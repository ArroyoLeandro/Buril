import { SkipLink } from "../../registry/ui/skip-link";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the link, the toolbar and the target. */
  locale?: Locale;
}

/**
 * A boxed version of a page: the skip link jumps past a toolbar of repeated controls. Here it
 * shows inside the box instead of at the top left of the window, so it does not cover the
 * site's own skip link.
 */
export default function SkipLinkDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const tools = [t("Bold"), t("Italic"), t("Underline"), t("Link"), t("Quote")];

  return (
    <div className="relative flex flex-col gap-4">
      <SkipLink
        href="#skip-link-demo-content"
        className="focus-visible:absolute focus-visible:top-0 focus-visible:left-0"
      >
        {t("Skip to the demo content")}
      </SkipLink>
      <div role="toolbar" aria-label={t("Formatting")} className="flex flex-wrap gap-2">
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
        aria-label={t("Demo content")}
        className="border border-border p-4"
      >
        <p className="text-sm">
          {t(
            "Tab into this box and the skip link appears first. Press Enter and focus lands here, past the toolbar.",
          )}
        </p>
      </section>
    </div>
  );
}
