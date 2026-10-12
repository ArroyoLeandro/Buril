import { useState } from "react";

import { Button } from "../../../registry/ui/button";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";

interface Props {
  /** How long the fake publish takes, in milliseconds. */
  delay?: number;
  /** Language of the labels and announcements. */
  locale?: Locale;
}

/** Button variants side by side, and a loading button that reports its result. */
export default function ButtonsPanel({ delay = 1200, locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const publish = () => {
    setLoading(true);
    setMessage(t("Publishing…"));
    setTimeout(() => {
      setLoading(false);
      setMessage(t("Published."));
    }, delay);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button loading={loading} onClick={publish}>
          {t("Publish")}
        </Button>
        <Button variant="secondary">{t("Save draft")}</Button>
        <Button variant="outline">{t("Preview")}</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm">
          {t("Cancel")}
        </Button>
        <Button variant="destructive" size="sm">
          {t("Delete")}
        </Button>
      </div>
      <p role="status" className="min-h-5 text-sm">
        {message}
      </p>
    </div>
  );
}
