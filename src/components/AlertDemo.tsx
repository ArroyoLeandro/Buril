import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "../../registry/ui/alert";
import { Button } from "../../registry/ui/button";

/**
 * Two static callouts, and a message inserted into a polite region that is on the page from the
 * start, so screen readers announce it.
 */
export default function AlertDemo() {
  const [saves, setSaves] = useState(0);

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Alert>
        <AlertTitle>New version available</AlertTitle>
        <AlertDescription>Reload the page to get the latest components.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined. Update it to keep your plan.</AlertDescription>
      </Alert>
      <div className="flex flex-col items-start gap-3">
        <Button size="sm" variant="outline" onClick={() => setSaves((count) => count + 1)}>
          Save draft
        </Button>
        {/* Rendered empty from the start; the alert is inserted into it. */}
        <div role="status">
          {saves > 0 && (
            <Alert key={saves}>
              <AlertTitle>Draft saved</AlertTitle>
              <AlertDescription>Saved {saves === 1 ? "once" : `${saves} times`}.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
