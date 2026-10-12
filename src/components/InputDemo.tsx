import { useState } from "react";

import { Field } from "../../registry/ui/field";
import { Input } from "../../registry/ui/input";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the labels, descriptions and the error. */
  locale?: Locale;
}

/**
 * Inputs in Fields: a plain one, one that validates as you type, a read-only value people can
 * still focus and copy, and a disabled one that is skipped by the keyboard.
 */
export default function InputDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [username, setUsername] = useState("");
  const error = /\s/.test(username) ? t("Usernames cannot contain spaces.") : undefined;

  return (
    <div className="flex max-w-sm flex-col gap-6">
      <Field label={t("Full name")}>
        {(control) => <Input autoComplete="name" {...control} />}
      </Field>
      <Field
        label={t("Username")}
        description={t("Letters, numbers and dashes.")}
        error={error}
        errorPrefix={t("Error:")}
      >
        {(control) => (
          <Input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            {...control}
          />
        )}
      </Field>
      <Field label={t("Account ID")} description={t("Assigned when you sign up.")}>
        {(control) => <Input value="ACC-20491" readOnly {...control} />}
      </Field>
      <Field label={t("Promo code")} description={t("Not available on the free plan.")}>
        {(control) => <Input disabled {...control} />}
      </Field>
    </div>
  );
}
