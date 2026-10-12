import { useRef, useState, type SubmitEvent } from "react";

import { Button } from "../../registry/ui/button";
import { Field } from "../../registry/ui/field";
import { Input } from "../../registry/ui/input";
import { Textarea } from "../../registry/ui/textarea";

interface Errors {
  name?: string;
  email?: string;
}

/**
 * The Forms guide's example, shown on the page from this file and type-checked with the site: a
 * sign-up form that validates on submit, shows each error under its field and focuses the first
 * field to fix.
 */
export function SignupForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const next: Errors = {
      name: name ? undefined : "Enter your name.",
      email: /^[^\s@]+@[^\s@]+$/.test(email)
        ? undefined
        : "Enter an email address like name@example.com.",
    };
    setErrors(next);
    // Send focus to the first field that needs fixing, so its error is read with it.
    if (next.name) nameInput.current?.focus();
    else if (next.email) emailInput.current?.focus();
    setStatus(next.name || next.email ? "" : `Thanks, ${name}. Check your inbox.`);
  };

  return (
    // noValidate: each Field shows its own error instead of the browser's bubble.
    <form noValidate onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <Field label="Name" error={errors.name} required>
        {(control) => <Input ref={nameInput} name="name" autoComplete="name" {...control} />}
      </Field>
      <Field label="Email" description="We never share it." error={errors.email} required>
        {(control) => (
          <Input ref={emailInput} name="email" type="email" autoComplete="email" {...control} />
        )}
      </Field>
      <Field label="How did you hear about us?" description="Optional.">
        <Textarea name="source" rows={3} />
      </Field>
      <Button type="submit" className="self-start">
        Sign up
      </Button>
      {/* On the page from the start, so screen readers announce the confirmation. */}
      <p role="status">{status}</p>
    </form>
  );
}
