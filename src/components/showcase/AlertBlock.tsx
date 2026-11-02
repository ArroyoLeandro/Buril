import { Alert, AlertDescription, AlertTitle } from "../../../registry/ui/alert";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";
import { Icon } from "../icons/Icon";

interface Props {
  /** Language of the messages. */
  locale?: Locale;
}

/**
 * A stack of Alerts: the destructive one in front is real, a static callout with no live role.
 * The two behind it are depth only, so they are inert and hidden from assistive technology.
 */
export default function AlertBlock({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const behind = "absolute inset-x-0 h-full origin-top";

  return (
    <div className="flex flex-1 items-center pt-3">
      <div className="relative mb-9 w-full max-w-[420px]">
        <Alert variant="destructive" className="relative z-30">
          <AlertTitle>{t("Payment failed")}</AlertTitle>
          <AlertDescription>{t("The card ending in 4242 was declined.")}</AlertDescription>
        </Alert>
        <Alert inert aria-hidden="true" className={`${behind} top-[18px] z-20 scale-94 opacity-60`}>
          <AlertTitle>{t("Deploy finished")}</AlertTitle>
          <AlertDescription>{t("buril-docs is live.")}</AlertDescription>
        </Alert>
        <Alert
          inert
          aria-hidden="true"
          icon={<Icon name="bell" />}
          className={`${behind} top-9 z-10 scale-88 opacity-20`}
        >
          <AlertTitle>{t("Review requested")}</AlertTitle>
          <AlertDescription>{t("Grace is waiting on you.")}</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
