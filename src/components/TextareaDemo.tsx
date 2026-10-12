import { useState } from "react";

import { Field } from "../../registry/ui/field";
import { Textarea } from "../../registry/ui/textarea";

const limit = 200;

/** A message box with a length limit. The error text stays the same while it applies, so the
 * live region does not announce on every keystroke. */
export default function TextareaDemo() {
  const [message, setMessage] = useState("");
  const error =
    message.length > limit ? `Shorten the message to ${limit} characters or fewer.` : undefined;

  return (
    <div className="flex max-w-md flex-col gap-2">
      <Field label="Message" description={`Up to ${limit} characters.`} error={error}>
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
