import { useState } from "react";

import { Button, IconButton } from "../../registry/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../registry/ui/card";
import { Checkbox } from "../../registry/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../registry/ui/radio-group";
import { Spinner } from "../../registry/ui/spinner";
import { Switch } from "../../registry/ui/switch";
import { demoHref, demoTranslator } from "../i18n/demos";
import { Icon } from "./icons/Icon";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the labels. */
  locale?: Locale;
}

/**
 * Every kind of Buril motion in one place, with a switch that simulates reduced motion for this
 * stage only. The docs site's `motion-safe:` and `motion-reduce:` variants also treat anything
 * inside `[data-reduced-motion]` as reduced, so the components behave exactly as they would with
 * the system setting on.
 */
export default function MotionDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const href = demoHref(locale);
  const [reduced, setReduced] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-3 font-semibold">
          <Switch checked={reduced} onChange={(event) => setReduced(event.target.checked)} />
          {t("Simulate reduced motion")}
        </label>
        <p className="text-sm text-muted-foreground">
          {t(
            "It applies to this demo only. If your system already asks for reduced motion, the demo stays still either way.",
          )}
        </p>
      </div>

      <div
        data-motion-stage
        data-reduced-motion={reduced ? "" : undefined}
        className="flex flex-col gap-6 border-t border-border pt-6"
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <label className="flex items-center gap-2">
            <Switch defaultChecked />
            {t("Email notifications")}
          </label>
          <label className="flex min-h-6 items-center gap-2">
            <Checkbox />
            {t("Accept the terms")}
          </label>
          <Spinner label={t("Loading files")} />
        </div>

        <RadioGroup legend={t("Delivery")} defaultValue="standard">
          <RadioGroupItem value="standard">{t("Standard")}</RadioGroupItem>
          <RadioGroupItem value="express">{t("Express")}</RadioGroupItem>
        </RadioGroup>

        <div className="flex flex-wrap items-center gap-3">
          <Button>{t("Save changes")}</Button>
          <IconButton variant="ghost" motion="rotate" aria-label={t("Close dialog")}>
            <Icon name="close" />
          </IconButton>
          <IconButton variant="ghost" motion="swing" aria-label={t("Notifications")}>
            <Icon name="bell" />
          </IconButton>
          <IconButton
            variant="ghost"
            motion="pop"
            aria-label={t("Like")}
            aria-pressed={liked}
            onClick={() => setLiked((value) => !value)}
          >
            <Icon name="heart" filled={liked} />
          </IconButton>
        </div>

        <Card interactive className="max-w-sm">
          <CardHeader>
            <CardTitle>
              <a
                href={href("/docs/components/field")}
                className="rounded-xs underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("Accessible forms")}
              </a>
            </CardTitle>
            <CardDescription>
              {t("Labels, help text and errors, wired by the Field.")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
