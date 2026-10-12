import { useRef, useState, type ComponentProps } from "react";

import { Button } from "../../../registry/ui/button";
import { Checkbox } from "../../../registry/ui/checkbox";
import { Field } from "../../../registry/ui/field";
import { Input } from "../../../registry/ui/input";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";

interface Props {
  /** How long the fake request takes, in milliseconds. */
  delay?: number;
  /** Language of the labels, errors and announcements. */
  locale?: Locale;
}

/** A sign-in form built from Field, Input, Checkbox and Button. Nothing is sent anywhere. */
export default function SignInPanel({ delay = 1200, locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit: ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();
    if (loading) return;
    const values = { email: email.current?.value.trim() ?? "", password: password.current?.value };
    const next = {
      email: /^\S+@\S+\.\S+$/.test(values.email)
        ? undefined
        : t("Enter an email address, like name@example.com."),
      password: values.password ? undefined : t("Enter your password."),
    };
    setErrors(next);
    if (next.email || next.password) {
      setMessage("");
      (next.email ? email : password).current?.focus();
      return;
    }
    setLoading(true);
    setMessage(t("Signing in…"));
    setTimeout(() => {
      setLoading(false);
      setMessage(
        t("Signed in as {email}. Nothing was sent: this form is a demo.", { email: values.email }),
      );
    }, delay);
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <Field label={t("Email")} error={errors.email} required>
        {(control) => <Input ref={email} type="email" autoComplete="email" {...control} />}
      </Field>
      <Field label={t("Password")} error={errors.password} required>
        {(control) => (
          <Input ref={password} type="password" autoComplete="current-password" {...control} />
        )}
      </Field>
      <label className="flex min-h-6 items-center gap-2 text-sm">
        <Checkbox name="remember" />
        {t("Keep me signed in")}
      </label>
      <Button type="submit" loading={loading} className="self-start">
        {t("Sign in")}
      </Button>
      <p role="status" className="min-h-5 text-sm">
        {message}
      </p>
    </form>
  );
}
