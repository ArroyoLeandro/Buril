import { useState } from "react";

import { Badge } from "../../registry/ui/badge";
import { Button } from "../../registry/ui/button";

/** The four variants, and a status badge whose change is announced from a status region. */
export default function BadgeDemo() {
  // Undefined until the first change, so nothing is announced on load.
  const [shipped, setShipped] = useState<boolean>();
  const message =
    shipped === undefined ? "" : `Order 1042 marked as ${shipped ? "shipped" : "processing"}.`;

  return (
    <div className="flex flex-col gap-6">
      <p className="flex flex-wrap items-center gap-2">
        <Badge>New</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="outline">Beta</Badge>
        <Badge variant="destructive">Failed</Badge>
      </p>
      <div className="flex flex-col items-start gap-3">
        <p className="flex items-center gap-2 text-sm">
          Order 1042
          <Badge variant={shipped ? "default" : "outline"}>
            {shipped ? "Shipped" : "Processing"}
          </Badge>
        </p>
        {/* Not disabled after use, so keyboard focus never drops to the page. */}
        <Button size="sm" variant="outline" onClick={() => setShipped((previous) => !previous)}>
          Mark order 1042 as {shipped ? "processing" : "shipped"}
        </Button>
        {/* The badge itself is not a live region; this one exists before the change. */}
        <p role="status" className="min-h-5 text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}
