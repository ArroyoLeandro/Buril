import { useEffect, useRef, useState } from "react";

import { Button } from "../../registry/ui/button";
import { Spinner } from "../../registry/ui/spinner";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the labels, the comments and the announcement. */
  locale?: Locale;
}

/** The three sizes, and a list that shows a spinner while it loads, then announces the result. */
export default function SpinnerDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const comments = [t("Lovely contrast."), t("Clear focus ring."), t("Ship it.")];
  const [state, setState] = useState<"idle" | "loading" | "loaded">("idle");
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const load = () => {
    setState("loading");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("loaded"), 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Spinner size="sm" label={t("Loading files")} />
        <Spinner label={t("Loading photos")} />
        <Spinner size="lg" label={t("Loading videos")} />
      </div>
      <div className="flex flex-col items-start gap-3">
        <Button size="sm" variant="outline" onClick={load}>
          {t("Load comments")}
        </Button>
        <section
          aria-label={t("Comments")}
          aria-busy={state === "loading" || undefined}
          className="min-h-8 text-sm"
        >
          {state === "loading" && <Spinner label={t("Loading comments")} />}
          {state === "loaded" && (
            <ul className="list-disc pl-5">
              {comments.map((comment) => (
                <li key={comment}>{comment}</li>
              ))}
            </ul>
          )}
        </section>
        {/* On the page from the start, so the result is announced when it arrives. */}
        <p role="status" data-testid="comments-status" className="min-h-5 text-sm">
          {state === "loaded" ? t("{count} comments loaded.", { count: comments.length }) : ""}
        </p>
      </div>
    </div>
  );
}
