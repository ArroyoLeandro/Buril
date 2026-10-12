import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const sizes = { sm: "size-4", default: "size-6", lg: "size-8" } as const;

type SpinnerProps = Omit<ComponentProps<"span">, "children"> & {
  /** What is loading, read by screen readers and hidden on screen. Defaults to "Loading". */
  label?: string;
  /** `sm` (16px), `default` (24px) or `lg` (32px). The color follows the text color. */
  size?: keyof typeof sizes;
};

/**
 * A loading indicator. It is a `role="status"` element with a visually hidden label, so screen
 * readers can find it and name it; the drawing is hidden from them. It spins only when the user
 * allows motion; with reduced motion it shows three static dots instead.
 */
function Spinner({ label = "Loading", size = "default", className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      data-slot="spinner"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={cn("shrink-0 motion-safe:animate-spin", sizes[size])}
      >
        {/* A faint track and a solid arc: the arc's rotation shows progress. */}
        <g data-ring className="motion-reduce:hidden">
          <circle cx="12" cy="12" r="9" className="opacity-25" />
          <path d="M21 12a9 9 0 0 0-9-9" />
        </g>
        {/* A frozen arc looks broken; three dots read as "in progress" without motion. */}
        <g data-dots className="hidden motion-reduce:inline" fill="currentColor" stroke="none">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </g>
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
export type { SpinnerProps };
