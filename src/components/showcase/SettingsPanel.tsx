import { useState } from "react";

import { Field } from "../../../registry/ui/field";
import { RadioGroup, RadioGroupItem } from "../../../registry/ui/radio-group";
import { Select } from "../../../registry/ui/select";
import { Switch } from "../../../registry/ui/switch";

const languages = { en: "English", es: "Español", fr: "Français" } as const;
type Language = keyof typeof languages;

/** Settings that apply as soon as they change: a Switch, a Radio Group and a Select. */
export default function SettingsPanel() {
  const [notify, setNotify] = useState(true);
  const [digest, setDigest] = useState("weekly");
  const [language, setLanguage] = useState<Language>("en");
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <label className="flex min-h-6 items-center justify-between gap-4 text-sm font-semibold">
        Email notifications
        <Switch
          checked={notify}
          onChange={(event) => {
            setNotify(event.target.checked);
            setMessage(`Email notifications turned ${event.target.checked ? "on" : "off"}.`);
          }}
          stateLabels={{ on: "On", off: "Off" }}
        />
      </label>
      <RadioGroup
        legend="Digest"
        name="digest"
        value={digest}
        onValueChange={(value) => {
          setDigest(value);
          setMessage(`Digest set to ${value}.`);
        }}
        disabled={!notify}
      >
        <RadioGroupItem value="daily">Daily</RadioGroupItem>
        <RadioGroupItem value="weekly">Weekly</RadioGroupItem>
        <RadioGroupItem value="never">Never</RadioGroupItem>
      </RadioGroup>
      <Field label="Language">
        {(control) => (
          <Select
            value={language}
            onChange={(event) => {
              const value = event.target.value as Language;
              setLanguage(value);
              setMessage(`Language set to ${languages[value]}.`);
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
