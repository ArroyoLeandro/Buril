import { useEffect, useRef, useState } from "react";

import { Button } from "../../registry/ui/button";
import { Spinner } from "../../registry/ui/spinner";

const comments = ["Lovely contrast.", "Works with NVDA.", "Ship it."];

/** The three sizes, and a list that shows a spinner while it loads, then announces the result. */
export default function SpinnerDemo() {
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
        <Spinner size="sm" label="Loading files" />
        <Spinner label="Loading photos" />
        <Spinner size="lg" label="Loading videos" />
      </div>
      <div className="flex flex-col items-start gap-3">
        <Button size="sm" variant="outline" onClick={load}>
          Load comments
        </Button>
        <section
          aria-label="Comments"
          aria-busy={state === "loading" || undefined}
          className="min-h-8 text-sm"
        >
          {state === "loading" && <Spinner label="Loading comments" />}
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
          {state === "loaded" ? `${comments.length} comments loaded.` : ""}
        </p>
      </div>
    </div>
  );
}
