import { Link } from "../../registry/ui/link";
import { demoHref, demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the text and of the pages the links open. */
  locale?: Locale;
}

export default function LinkDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const href = demoHref(locale);

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="demo-link-variants" className="flex flex-col gap-3">
        <h3 id="demo-link-variants" className="text-sm font-semibold">
          {t("Variants")}
        </h3>
        <p>
          {t("Start with the")}{" "}
          <Link href={href("/docs/components/button")}>{t("Button docs")}</Link>.
        </p>
        <p className="text-sm text-muted-foreground">
          {t("Muted links suit secondary text, such as a")}{" "}
          <Link href={href("/")} variant="muted">
            {t("footer link")}
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="demo-link-external" className="flex flex-col gap-3">
        <h3 id="demo-link-external" className="text-sm font-semibold">
          {t("Opens in a new tab")}
        </h3>
        <p>
          {t("Buril follows the")}{" "}
          <Link
            href="https://www.w3.org/WAI/ARIA/apg/patterns/link/"
            external
            newTabLabel={t("(opens in a new tab)")}
          >
            {t("APG link pattern")}
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
