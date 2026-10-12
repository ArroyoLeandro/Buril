import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * A placeholder block shown while content loads. It is decoration only, so it is hidden from
 * assistive technology: mark the loading region with `aria-busy="true"` and announce completion
 * from a `role="status"` region instead. Size and shape it with `className`.
 */
function Skeleton({ className, ...props }: Omit<ComponentProps<"div">, "children">) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn(
        "rounded-md bg-muted motion-safe:animate-pulse",
        // Forced colors drop the fill, which would make the placeholder vanish; keep an outline.
        "forced-colors:border",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
