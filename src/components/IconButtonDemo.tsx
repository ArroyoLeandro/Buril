import { useEffect, useRef, useState } from "react";

import { IconButton } from "../../registry/ui/button";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

const sizes = ["icon-sm", "icon", "icon-lg"] as const;

/**
 * Stroke icons drawn inline, so the demo needs no icon package. A `lid` path is wrapped in a
 * `data-lid` group, which the `wiggle` gesture lifts; `filled` paints the shape, for a pressed Like.
 */
function Icon({ path, lid, filled = false }: { path: string; lid?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {lid && (
        <g data-lid>
          <path d={lid} />
        </g>
      )}
      <path d={path} />
    </svg>
  );
}

const icons = {
  close: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  refresh: "M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  trashLid: "M4 7h16M9 7V4h6v3",
  trashCan: "M6 7l1 13h10l1-13M10 11v6M14 11v6",
  bell: "M12 3v1.5M18 16.5V11a6 6 0 0 0-12 0v5.5L4.5 18.5h15zM10 21a2.2 2.2 0 0 0 4 0",
  send: "M4 4l17 8-17 8 3-8zM7 12h6",
  arrowUp: "M12 19V5M6 11l6-6 6 6",
  heart:
    "M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z",
  external:
    "M18 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8a1.5 1.5 0 0 1 1.5-1.5H11M14.5 4H20v5.5M20 4l-8.5 8.5",
};

interface Props {
  /** Language of the button names and the announcement. */
  locale?: Locale;
}

export default function IconButtonDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // A pending timer must not outlive the demo, for example when the page navigates away.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="demo-icon-sizes" className="flex flex-col gap-3">
        <h3 id="demo-icon-sizes" className="text-sm font-semibold">
          {t("Sizes")}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((size) => (
            <IconButton key={size} size={size} aria-label={t("Add item ({size})", { size })}>
              <Icon path={icons.plus} />
            </IconButton>
          ))}
        </div>
      </section>

      <section aria-labelledby="demo-icon-variants" className="flex flex-col gap-3">
        <h3 id="demo-icon-variants" className="text-sm font-semibold">
          {t("Variants")}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton aria-label={t("Add item")}>
            <Icon path={icons.plus} />
          </IconButton>
          <IconButton variant="outline" aria-label={t("Close panel")}>
            <Icon path={icons.close} />
          </IconButton>
          <IconButton variant="ghost" aria-label={t("Close notice")}>
            <Icon path={icons.close} />
          </IconButton>
          <IconButton variant="destructive" aria-label={t("Delete item")}>
            <Icon path={icons.trash} />
          </IconButton>
        </div>
      </section>

      <section aria-labelledby="demo-icon-states" className="flex flex-col gap-3">
        <h3 id="demo-icon-states" className="text-sm font-semibold">
          {t("Loading and disabled")}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton
            variant="outline"
            aria-label={t("Refresh results")}
            loading={loading}
            onClick={() => {
              setLoading(true);
              window.clearTimeout(timer.current);
              timer.current = window.setTimeout(() => setLoading(false), 1500);
            }}
          >
            <Icon path={icons.refresh} />
          </IconButton>
          <IconButton variant="outline" aria-label={t("Delete item")} disabled>
            <Icon path={icons.trash} />
          </IconButton>
        </div>
        {/* Always rendered, so screen readers notice when its text changes. */}
        <p role="status" className="min-h-5 text-sm">
          {loading ? t("Refreshing results…") : ""}
        </p>
      </section>

      <section aria-labelledby="demo-icon-motion" className="flex flex-col gap-3">
        <h3 id="demo-icon-motion" className="text-sm font-semibold">
          {t("Motion")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "Hover over each button or reach it with Tab. Each gesture plays once, and only when reduced motion is off.",
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton variant="ghost" motion="rotate" aria-label={t("Close dialog")}>
            <Icon path={icons.close} />
          </IconButton>
          <IconButton variant="ghost" motion="wiggle" aria-label={t("Delete draft")}>
            <Icon lid={icons.trashLid} path={icons.trashCan} />
          </IconButton>
          <IconButton variant="ghost" motion="swing" aria-label={t("Notifications")}>
            <Icon path={icons.bell} />
          </IconButton>
          <IconButton variant="ghost" motion="spin" aria-label={t("Reload page")}>
            <Icon path={icons.refresh} />
          </IconButton>
          <IconButton variant="ghost" motion="nudge-x" aria-label={t("Send message")}>
            <Icon path={icons.send} />
          </IconButton>
          <IconButton variant="ghost" motion="nudge-up" aria-label={t("Back to top")}>
            <Icon path={icons.arrowUp} />
          </IconButton>
          <IconButton
            variant="ghost"
            motion="pop"
            aria-label={t("Like")}
            aria-pressed={liked}
            onClick={() => setLiked((value) => !value)}
          >
            <Icon path={icons.heart} filled={liked} />
          </IconButton>
          <IconButton variant="ghost" motion="nudge-diagonal" aria-label={t("Open in a new tab")}>
            <Icon path={icons.external} />
          </IconButton>
        </div>
      </section>
    </div>
  );
}
