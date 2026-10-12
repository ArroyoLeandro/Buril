import { useState } from "react";

import { Badge } from "../../registry/ui/badge";
import { Button } from "../../registry/ui/button";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the labels, messages and announcements. */
  locale?: Locale;
}

/** The four variants, and a status badge whose change is announced from a status region. */
export default function BadgeDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  // Undefined until the first change, so nothing is announced on load.
  const [shipped, setShipped] = useState<boolean>();
  const message =
    shipped === undefined
      ? ""
      : shipped
        ? t("Order 1042 marked as shipped.")
        : t("Order 1042 marked as processing.");

  return (
    <div className="flex flex-col gap-6">
      <p className="flex flex-wrap items-center gap-2">
        <Badge>{t("New")}</Badge>
        <Badge variant="secondary">{t("Draft")}</Badge>
        <Badge variant="outline">{t("Beta")}</Badge>
        <Badge variant="destructive">{t("Failed")}</Badge>
      </p>
      <div className="flex flex-col items-start gap-3">
        <p className="flex items-center gap-2 text-sm">
          {t("Order 1042")}
          <Badge variant={shipped ? "default" : "outline"}>
            {shipped ? t("Shipped") : t("Processing")}
          </Badge>
        </p>
        {/* Not disabled after use, so keyboard focus never drops to the page. */}
        <Button size="sm" variant="outline" onClick={() => setShipped((previous) => !previous)}>
          {shipped ? t("Mark order 1042 as processing") : t("Mark order 1042 as shipped")}
        </Button>
        {/* The badge itself is not a live region; this one exists before the change. */}
        <p role="status" className="min-h-5 text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}
