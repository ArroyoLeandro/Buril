import { useState } from "react";

import { IconButton } from "../../registry/ui/button";

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

export default function IconButtonDemo() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="demo-icon-sizes" className="flex flex-col gap-3">
        <h3 id="demo-icon-sizes" className="text-sm font-semibold">
          Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((size) => (
            <IconButton key={size} size={size} aria-label={`Add item (${size})`}>
              <Icon path={icons.plus} />
            </IconButton>
          ))}
        </div>
      </section>

      <section aria-labelledby="demo-icon-variants" className="flex flex-col gap-3">
        <h3 id="demo-icon-variants" className="text-sm font-semibold">
          Variants
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton aria-label="Add item">
            <Icon path={icons.plus} />
          </IconButton>
          <IconButton variant="outline" aria-label="Close panel">
            <Icon path={icons.close} />
          </IconButton>
          <IconButton variant="ghost" aria-label="Close notice">
            <Icon path={icons.close} />
          </IconButton>
          <IconButton variant="destructive" aria-label="Delete item">
            <Icon path={icons.trash} />
          </IconButton>
        </div>
      </section>

      <section aria-labelledby="demo-icon-states" className="flex flex-col gap-3">
        <h3 id="demo-icon-states" className="text-sm font-semibold">
          Loading and disabled
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton
            variant="outline"
            aria-label="Refresh results"
            loading={loading}
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => setLoading(false), 1500);
            }}
          >
            <Icon path={icons.refresh} />
          </IconButton>
          <IconButton variant="outline" aria-label="Delete item" disabled>
            <Icon path={icons.trash} />
          </IconButton>
        </div>
        {/* Always rendered, so screen readers notice when its text changes. */}
        <p role="status" className="min-h-5 text-sm">
          {loading ? "Refreshing results…" : ""}
        </p>
      </section>
    </div>
  );
}
