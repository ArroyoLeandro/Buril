import { Link } from "../../registry/ui/link";
import { Separator } from "../../registry/ui/separator";
import { demoHref, demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the text and of the pages the links open. */
  locale?: Locale;
}

/** A semantic separator between two sections, and decorative dividers between links in a row. */
export default function SeparatorDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const href = demoHref(locale);

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <div>
        <p className="font-semibold">Buril UI</p>
        <p className="text-sm text-muted-foreground">
          {t("Accessible components you copy and own.")}
        </p>
      </div>
      <Separator />
      <nav aria-label={t("Project")} className="flex min-h-6 items-center gap-3 text-sm">
        <Link href={href("/docs")}>{t("Docs")}</Link>
        {/* The links are already separate items; the lines only decorate. */}
        <Separator orientation="vertical" decorative />
        <Link href={href("/docs/components")}>{t("Components")}</Link>
        <Separator orientation="vertical" decorative />
        <Link href={href("/")}>{t("Home")}</Link>
      </nav>
    </div>
  );
}
