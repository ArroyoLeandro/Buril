import { useState } from "react";

import { Switch } from "../../registry/ui/switch";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

const row = "flex min-h-6 items-center justify-between gap-4";

type Setting = "email" | "push";

interface Props {
  /** Language of the labels and announcements. */
  locale?: Locale;
}

/** Settings that apply as soon as they change, with a status message for each change. */
export default function SwitchDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const names = { email: t("Email notifications"), push: t("Push notifications") };
  const messages = {
    email: { on: t("Email notifications turned on."), off: t("Email notifications turned off.") },
    push: { on: t("Push notifications turned on."), off: t("Push notifications turned off.") },
  };
  const stateLabels = { on: t("On"), off: t("Off") };
  const [state, setState] = useState<{ settings: Record<Setting, boolean>; changed?: Setting }>({
    settings: { email: true, push: false },
  });
  const { settings, changed } = state;
  // Derived from the state, so it always matches what the switches show.
  const message = changed ? messages[changed][settings[changed] ? "on" : "off"] : "";

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
          stateLabels={stateLabels}
        />
      </label>
      <label className={row}>
        {names.push}
        <Switch checked={settings.push} onChange={() => toggle("push")} stateLabels={stateLabels} />
      </label>
      <label className={`${row} text-muted-foreground`}>
        {t("SMS notifications")}
        <Switch disabled />
      </label>
      <p role="status" className="min-h-5 text-sm">
        {message}
      </p>
    </div>
  );
}
