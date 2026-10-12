import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    // Small text in a pill. It may wrap, so a long label never overflows a 320px width.
    "inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
    "[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
    // Forced colors drop the fill, so the border keeps the badge's shape visible.
    "forced-colors:border-current",
  ],
  {
    variants: {
      // Each variant sets exactly one border color, so every variant has the same box.
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        // text-white is the one non-token color, the Button's measured exception: white on the
        // light-mode red is 5.89:1, but on the dark-mode red it fails, so dark mode uses the
        // background color (6.02:1). No shadcn token is white in both modes.
        destructive: "border-transparent bg-destructive text-white dark:text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

/**
 * A short, non-interactive label. Its text carries the meaning, never its color alone. It is not
 * focusable: for something people can act on, use a Button or a Link.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
