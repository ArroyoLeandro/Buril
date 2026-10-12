import { useEffect, useRef, useState } from "react";

import { IconButton } from "../../registry/ui/button";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

const sizes = ["icon-sm", "icon", "icon-lg"] as const;

/** Stroke icons drawn inline, so the demo needs no icon package. */
function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const icons = {
  close: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  refresh: "M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
};

interface Props {
  /** Language of the button names and the announcement. */
  locale?: Locale;
}

export default function IconButtonDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [loading, setLoading] = useState(false);
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
    </div>
  );
}
