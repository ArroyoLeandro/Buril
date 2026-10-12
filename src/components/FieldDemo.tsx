import { useRef, useState, type SubmitEvent } from "react";

import { Button } from "../../registry/ui/button";
import { Field } from "../../registry/ui/field";
import { Input } from "../../registry/ui/input";

function validate(email: string) {
  if (email.trim() === "") return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+$/.test(email.trim())) {
    return "Enter an email address like name@example.com.";
  }
  return undefined;
}

/** A newsletter form: submitting it empty shows the error, announces it and focuses the field. */
export default function FieldDemo() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [confirmation, setConfirmation] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validate(email);
    setError(message);
    setConfirmation(message ? "" : `Subscribed ${email.trim()}.`);
    if (message) input.current?.focus();
  };

  return (
    // noValidate: the field shows its own error instead of the browser's bubble.
    <form noValidate onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <Field
        label="Email"
        description="We only use it to send the newsletter."
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
        Subscribe
      </Button>
      <p role="status" className="min-h-5 text-sm">
        {confirmation}
      </p>
    </form>
  );
}
