import { cn } from "@/lib/utils";
import { Button, IconButton } from "../../../registry/ui/button";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";
import { Icon } from "../icons/Icon";
import { fadeEnd } from "./fade";

interface Props {
  /** Language of the labels. */
  locale?: Locale;
}

/**
 * The Button and IconButton sizes side by side, 32, 40 and 48px tall. From xl up the row runs past
 * the cell: the buttons that fade out at its end are copies, inert and hidden.
 */
export default function ButtonsBlock({ locale = "en" }: Props) {
  const t = demoTranslator(locale);

  return (
    <div className="flex flex-1 items-center pt-3">
      <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
        <Button size="sm">{t("Archive")}</Button>
        <Button>{t("Save")}</Button>
        <Button size="lg">{t("Publish")}</Button>
        <IconButton variant="outline" size="icon-sm" aria-label={t("Add a row")}>
          <Icon name="plus" />
        </IconButton>
        <IconButton variant="outline" aria-label={t("Copy the link")}>
          <Icon name="copy" />
        </IconButton>
        <IconButton variant="outline" size="icon-lg" aria-label={t("Email the team")}>
          <Icon name="mail" />
        </IconButton>
        <span
          inert
          aria-hidden="true"
          className={cn("hidden shrink-0 items-center gap-2 xl:inline-flex", fadeEnd)}
        >
          <Button variant="outline" size="lg">
            {t("Export")}
          </Button>
          <Button variant="ghost" size="lg">
            {t("Share")}
          </Button>
        </span>
      </div>
    </div>
  );
}
