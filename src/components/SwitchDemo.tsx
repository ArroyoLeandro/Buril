import { useState } from "react";

import { Switch } from "../../registry/ui/switch";

const row = "flex min-h-6 items-center justify-between gap-4";

const names = { email: "Email notifications", push: "Push notifications" };
type Setting = keyof typeof names;

/** Settings that apply as soon as they change, with a status message for each change. */
export default function SwitchDemo() {
  const [state, setState] = useState<{ settings: Record<Setting, boolean>; changed?: Setting }>({
    settings: { email: true, push: false },
  });
  const { settings, changed } = state;
  // Derived from the state, so it always matches what the switches show.
  const message = changed ? `${names[changed]} turned ${settings[changed] ? "on" : "off"}.` : "";

  // A functional update starts from the latest state, never from a stale render's copy.
  const toggle = (key: Setting) =>
    setState((previous) => ({
      settings: { ...previous.settings, [key]: !previous.settings[key] },
      changed: key,
    }));

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <label className={row}>
        {names.email}
        <Switch
          checked={settings.email}
          onChange={() => toggle("email")}
          stateLabels={{ on: "On", off: "Off" }}
        />
      </label>
      <label className={row}>
        {names.push}
        <Switch
          checked={settings.push}
          onChange={() => toggle("push")}
          stateLabels={{ on: "On", off: "Off" }}
        />
      </label>
      <label className={`${row} text-muted-foreground`}>
        SMS notifications
        <Switch disabled />
      </label>
      <p role="status" className="min-h-5 text-sm">
        {message}
      </p>
    </div>
  );
}
