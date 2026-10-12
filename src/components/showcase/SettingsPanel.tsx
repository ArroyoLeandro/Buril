import { useState } from "react";

import { Field } from "../../../registry/ui/field";
import { RadioGroup, RadioGroupItem } from "../../../registry/ui/radio-group";
import { Select } from "../../../registry/ui/select";
import { Switch } from "../../../registry/ui/switch";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";

// Each language's own name, as language pickers show them.
const languages = { en: "English", es: "Español", fr: "Français" } as const;
type Language = keyof typeof languages;

interface Props {
  /** Language of the labels and announcements, and the language selected first. */
  locale?: Locale;
}

/** Settings that apply as soon as they change: a Switch, a Radio Group and a Select. */
export default function SettingsPanel({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const digests = { daily: t("Daily"), weekly: t("Weekly"), never: t("Never") };
  const [notify, setNotify] = useState(true);
  const [digest, setDigest] = useState("weekly");
  const [language, setLanguage] = useState<Language>(locale);
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <label className="flex min-h-6 items-center justify-between gap-4 text-sm font-semibold">
        {t("Email notifications")}
        <Switch
          checked={notify}
          onChange={(event) => {
            setNotify(event.target.checked);
            setMessage(
              event.target.checked
                ? t("Email notifications turned on.")
                : t("Email notifications turned off."),
            );
          }}
          stateLabels={{ on: t("On"), off: t("Off") }}
        />
      </label>
      <RadioGroup
        legend={t("Digest")}
        name="digest"
        value={digest}
        onValueChange={(value) => {
          setDigest(value);
          setMessage(
            t("Digest set to {value}.", {
              value: digests[value as keyof typeof digests].toLowerCase(),
            }),
          );
        }}
        disabled={!notify}
      >
        {Object.entries(digests).map(([value, name]) => (
          <RadioGroupItem key={value} value={value}>
            {name}
          </RadioGroupItem>
        ))}
      </RadioGroup>
      <Field label={t("Language")}>
        {(control) => (
          <Select
            value={language}
            onChange={(event) => {
              const value = event.target.value as Language;
              setLanguage(value);
              setMessage(t("Language set to {value}.", { value: languages[value] }));
            }}
            {...control}
          >
            {Object.entries(languages).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <p role="status" className="min-h-5 text-sm">
        {message}
      </p>
    </div>
  );
}
