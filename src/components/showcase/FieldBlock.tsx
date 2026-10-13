import { useState } from "react";

import { Field } from "../../../registry/ui/field";
import { Input } from "../../../registry/ui/input";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";

interface Props {
  /** Language of the label and the error. */
  locale?: Locale;
}

const hasDomain = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

/**
 * A Field that starts with an error: the address has no domain. Field announces the error from
 * its polite live region, and the error clears as soon as the address has a domain.
 */
export default function FieldBlock({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [value, setValue] = useState("ada@studio");

  return (
    <div className="flex flex-1 flex-col justify-end pt-3">
      <Field
        label={t("Email")}
        error={hasDomain(value) ? undefined : t("Add the domain, like ada@studio.dev.")}
        errorPrefix={t("Error:")}
      >
        {(control) => (
          <Input
            type="email"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            {...control}
          />
        )}
      </Field>
    </div>
  );
}
