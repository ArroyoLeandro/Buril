import { useRef, useState, type SubmitEvent } from "react";

import { Button } from "../../registry/ui/button";
import { Field } from "../../registry/ui/field";
import { Select } from "../../registry/ui/select";

const sizes = [
  { value: "s", name: "Small" },
  { value: "m", name: "Medium" },
  { value: "l", name: "Large" },
];

/** A product form: submitting without a size shows the error and focuses the select. */
export default function SelectDemo() {
  const [size, setSize] = useState("");
  const [error, setError] = useState<string>();
  const [confirmation, setConfirmation] = useState("");
  const select = useRef<HTMLSelectElement>(null);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const chosen = sizes.find((option) => option.value === size);
    setError(chosen ? undefined : "Choose a size.");
    setConfirmation(chosen ? `Added size ${chosen.name} to the cart.` : "");
    if (!chosen) select.current?.focus();
  };

  return (
    // noValidate: the field shows its own error instead of the browser's bubble.
    <form noValidate onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-6">
      <Field label="Size" description="See the size chart for measurements." error={error} required>
        {(control) => (
          <Select
            ref={select}
            value={size}
            onChange={(event) => setSize(event.target.value)}
            {...control}
          >
            <option value="">Choose a size</option>
            {sizes.map(({ value, name }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Color" description="Only one color is in stock.">
        {(control) => (
          <Select disabled defaultValue="ink" {...control}>
            <option value="ink">Ink</option>
          </Select>
        )}
      </Field>
      <Button type="submit" className="self-start">
        Add to cart
      </Button>
      <p role="status" className="min-h-5 text-sm">
        {confirmation}
      </p>
    </form>
  );
}
