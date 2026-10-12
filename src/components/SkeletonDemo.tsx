import { useEffect, useRef, useState } from "react";

import { Avatar } from "../../registry/ui/avatar";
import { Button } from "../../registry/ui/button";
import { Skeleton } from "../../registry/ui/skeleton";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the labels and the announcement. */
  locale?: Locale;
}

/**
 * A profile that shows placeholders while it reloads. The region is `aria-busy` meanwhile, and a
 * status region already on the page announces when it is ready.
 */
export default function SkeletonDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reload = () => {
    setLoading(true);
    setMessage("");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setLoading(false);
      setMessage(t("Profile loaded."));
    }, 1500);
  };

  return (
    <div className="flex max-w-sm flex-col items-start gap-4">
      <section
        aria-label={t("Profile")}
        aria-busy={loading || undefined}
        className="flex min-h-12 items-center gap-3"
      >
        {loading ? (
          <>
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
          </>
        ) : (
          <>
            {/* The name is right next to it, so the avatar is decorative. */}
            <Avatar alt="" fallback="AL" size="lg" />
            <div>
              <p className="font-semibold">Ada Lovelace</p>
              <p className="text-sm text-muted-foreground">{t("Writes the first programs.")}</p>
            </div>
          </>
        )}
      </section>
      <Button size="sm" variant="outline" onClick={reload}>
        {t("Reload profile")}
      </Button>
      <p role="status" className="min-h-5 text-sm">
        {message}
      </p>
    </div>
  );
}
