import { useState } from "react";

import { Switch } from "../../registry/ui/switch";

const row = "flex min-h-6 items-center justify-between gap-4";

/** Settings that apply as soon as they change, with a status message for each change. */
export default function SwitchDemo() {
  const [settings, setSettings] = useState({ email: true, push: false });
  const [message, setMessage] = useState("");

  const toggle = (key: keyof typeof settings, name: string) => {
    const on = !settings[key];
    setSettings({ ...settings, [key]: on });
    setMessage(`${name} turned ${on ? "on" : "off"}.`);
  };

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <label className={row}>
        Email notifications
        <Switch
          checked={settings.email}
          onChange={() => toggle("email", "Email notifications")}
          stateLabels={{ on: "On", off: "Off" }}
        />
      </label>
      <label className={row}>
        Push notifications
        <Switch
          checked={settings.push}
          onChange={() => toggle("push", "Push notifications")}
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
