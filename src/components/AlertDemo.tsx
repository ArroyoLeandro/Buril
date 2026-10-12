import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "../../registry/ui/alert";
import { Button } from "../../registry/ui/button";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the labels, messages and announcements. */
  locale?: Locale;
}

/**
 * Two static callouts, and a message inserted into a polite region that is on the page from the
 * start, so screen readers announce it.
 */
export default function AlertDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [saves, setSaves] = useState(0);

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Alert>
        <AlertTitle>{t("New version available")}</AlertTitle>
        <AlertDescription>{t("Reload the page to get the latest components.")}</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>{t("Payment failed")}</AlertTitle>
        <AlertDescription>
          {t("Your card was declined. Update it to keep your plan.")}
        </AlertDescription>
      </Alert>
      <div className="flex flex-col items-start gap-3">
        <Button size="sm" variant="outline" onClick={() => setSaves((count) => count + 1)}>
          {t("Save draft")}
        </Button>
        {/* Rendered empty from the start; the alert is inserted into it. */}
        <div role="status">
          {saves > 0 && (
            <Alert key={saves}>
              <AlertTitle>{t("Draft saved")}</AlertTitle>
              <AlertDescription>
                {saves === 1 ? t("Saved once.") : t("Saved {count} times.", { count: saves })}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
