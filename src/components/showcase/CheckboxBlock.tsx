import { useId } from "react";

import { Checkbox } from "../../../registry/ui/checkbox";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";

interface Props {
  /** Language of the label. */
  locale?: Locale;
}

/** One Checkbox with a label and a description. It is a native input, so it works as static HTML. */
export default function CheckboxBlock({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const id = useId();

  return (
    <div className="flex flex-1 items-center pt-3">
      <div className="flex items-start gap-3">
        <Checkbox id={id} aria-describedby={`${id}-description`} defaultChecked />
        <div className="min-w-0">
          <label htmlFor={id} className="cursor-pointer text-sm font-semibold">
            {t("Email me the changelog")}
          </label>
          <p id={`${id}-description`} className="text-sm text-muted-foreground">
            {t("Once a month.")}
          </p>
        </div>
      </div>
    </div>
  );
}
