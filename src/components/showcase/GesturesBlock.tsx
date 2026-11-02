import { useState } from "react";

import { IconButton, type IconButtonMotion } from "../../../registry/ui/button";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";
import { Icon } from "../icons/Icon";
import type { IconName } from "../icons/icons";

interface Props {
  /** Language of the button names. */
  locale?: Locale;
}

/**
 * Six IconButtons, one per gesture. Each icon plays once on hover or keyboard focus, and stays
 * still when the reader asks for reduced motion. Like is a toggle, so this block hydrates.
 */
export default function GesturesBlock({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [liked, setLiked] = useState(false);
  const gestures: [IconName, IconButtonMotion, string][] = [
    ["close", "rotate", t("Close dialog")],
    ["trash", "wiggle", t("Delete draft")],
    ["bell", "swing", t("Notifications")],
    ["refresh", "spin", t("Reload page")],
    ["send", "nudge-x", t("Send message")],
  ];

  return (
    <div className="flex flex-1 items-center justify-center pt-3">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 max-sm:grid max-sm:grid-cols-[repeat(3,3rem)] lg:grid lg:grid-cols-[repeat(3,3rem)]">
        {gestures.map(([icon, motion, label]) => (
          <IconButton
            key={icon}
            variant="outline"
            size="icon-lg"
            motion={motion}
            aria-label={label}
          >
            <Icon name={icon} />
          </IconButton>
        ))}
        <IconButton
          variant="outline"
          size="icon-lg"
          motion="pop"
          aria-label={t("Like")}
          aria-pressed={liked}
          onClick={() => setLiked(!liked)}
        >
          <Icon name="heart" filled={liked} />
        </IconButton>
      </div>
    </div>
  );
}
