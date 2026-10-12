import { useState } from "react";

import { Field } from "../../registry/ui/field";
import { Textarea } from "../../registry/ui/textarea";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

const limit = 200;

interface Props {
  /** Language of the label, the description and the error. */
  locale?: Locale;
}

/** A message box with a length limit. The error text stays the same while it applies, so the
 * live region does not announce on every keystroke. */
export default function TextareaDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [message, setMessage] = useState("");
  const error =
    message.length > limit
      ? t("Shorten the message to {limit} characters or fewer.", { limit })
      : undefined;

  return (
    <div className="flex max-w-md flex-col gap-2">
      <Field
        label={t("Message")}
        description={t("Up to {limit} characters.", { limit })}
        error={error}
        errorPrefix={t("Error:")}
      >
        {(control) => (
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            {...control}
          />
        )}
      </Field>
      <p className="text-sm text-muted-foreground">
        {message.length} / {limit}
      </p>
    </div>
  );
}
