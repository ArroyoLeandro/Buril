import { useRef, useState, type SubmitEvent } from "react";

import { Button } from "../../registry/ui/button";
import { Field } from "../../registry/ui/field";
import { Select } from "../../registry/ui/select";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the labels, options, messages and announcements. */
  locale?: Locale;
}

/** A product form: submitting without a size shows the error and focuses the select. */
export default function SelectDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const sizes = [
    { value: "s", name: t("Small") },
    { value: "m", name: t("Medium") },
    { value: "l", name: t("Large") },
  ];
  const [size, setSize] = useState("");
  const [error, setError] = useState<string>();
  const [confirmation, setConfirmation] = useState("");
  const select = useRef<HTMLSelectElement>(null);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const chosen = sizes.find((option) => option.value === size);
    setError(chosen ? undefined : t("Choose a size."));
    setConfirmation(chosen ? t("Added size {size} to the cart.", { size: chosen.name }) : "");
    if (!chosen) select.current?.focus();
  };

  return (
    // noValidate: the field shows its own error instead of the browser's bubble.
    <form noValidate onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-6">
      <Field
        label={t("Size")}
        description={t("See the size chart for measurements.")}
        error={error}
        required
        requiredLabel={t("(required)")}
        errorPrefix={t("Error:")}
      >
        {(control) => (
          <Select
            ref={select}
            value={size}
            onChange={(event) => setSize(event.target.value)}
            {...control}
          >
            <option value="">{t("Choose a size")}</option>
            {sizes.map(({ value, name }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label={t("Color")} description={t("Only one color is in stock.")}>
        {(control) => (
          <Select disabled defaultValue="ink" {...control}>
            <option value="ink">{t("Ink")}</option>
          </Select>
        )}
      </Field>
      <Button type="submit" className="self-start">
        {t("Add to cart")}
      </Button>
      <p role="status" className="min-h-5 text-sm">
        {confirmation}
      </p>
    </form>
  );
}
