import { useRef, useState, type SubmitEvent } from "react";

import { Button } from "../../registry/ui/button";
import { Field } from "../../registry/ui/field";
import { Input } from "../../registry/ui/input";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the labels, messages and announcements. */
  locale?: Locale;
}

/** A newsletter form: submitting it empty shows the error, announces it and focuses the field. */
export default function FieldDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [confirmation, setConfirmation] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const validate = (value: string) => {
    if (value.trim() === "") return t("Enter your email address.");
    if (!/^[^\s@]+@[^\s@]+$/.test(value.trim())) {
      return t("Enter an email address like name@example.com.");
    }
    return undefined;
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validate(email);
    setError(message);
    setConfirmation(message ? "" : t("Subscribed {email}.", { email: email.trim() }));
    if (message) input.current?.focus();
  };

  return (
    // noValidate: the field shows its own error instead of the browser's bubble.
    <form noValidate onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <Field
        label={t("Email")}
        description={t("We only use it to send the newsletter.")}
        error={error}
        required
      >
        {(control) => (
          <Input
            ref={input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            {...control}
          />
        )}
      </Field>
      <Button type="submit" className="self-start">
        {t("Subscribe")}
      </Button>
      <p role="status" className="min-h-5 text-sm">
        {confirmation}
      </p>
    </form>
  );
}
