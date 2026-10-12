import { useState } from "react";

import { Button } from "../../../registry/ui/button";

interface Props {
  /** How long the fake publish takes, in milliseconds. */
  delay?: number;
}

/** Button variants side by side, and a loading button that reports its result. */
export default function ButtonsPanel({ delay = 1200 }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const publish = () => {
    setLoading(true);
    setMessage("Publishing…");
    setTimeout(() => {
      setLoading(false);
      setMessage("Published.");
    }, delay);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button loading={loading} onClick={publish}>
          Publish
        </Button>
        <Button variant="secondary">Save draft</Button>
        <Button variant="outline">Preview</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </div>
      <p role="status" className="min-h-5 text-sm">
        {message}
      </p>
    </div>
  );
}
