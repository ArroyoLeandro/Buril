import { useState } from "react";

import { Field } from "../../registry/ui/field";
import { Input } from "../../registry/ui/input";

/**
 * Inputs in Fields: a plain one, one that validates as you type, a read-only value people can
 * still focus and copy, and a disabled one that is skipped by the keyboard.
 */
export default function InputDemo() {
  const [username, setUsername] = useState("");
  const error = /\s/.test(username) ? "Usernames cannot contain spaces." : undefined;

  return (
    <div className="flex max-w-sm flex-col gap-6">
      <Field label="Full name">{(control) => <Input autoComplete="name" {...control} />}</Field>
      <Field label="Username" description="Letters, numbers and dashes." error={error}>
        {(control) => (
          <Input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            {...control}
          />
        )}
      </Field>
      <Field label="Account ID" description="Assigned when you sign up.">
        {(control) => <Input value="ACC-20491" readOnly {...control} />}
      </Field>
      <Field label="Promo code" description="Not available on the free plan.">
        {(control) => <Input disabled {...control} />}
      </Field>
    </div>
  );
}
