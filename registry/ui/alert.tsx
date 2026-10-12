import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  // The icon sits in its own column; the title and description share the second one.
  "relative grid w-full grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border bg-card px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "border-border text-card-foreground",
        // The icon and title take the destructive color (5.14:1 light, 6.02:1 dark on the
        // background); the description stays readable in the muted foreground.
        destructive: "border-destructive text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const iconProps = {
  "aria-hidden": true,
  focusable: false,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-4",
} as const;

function InfoIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

const roleOf = { off: undefined, polite: "status", assertive: "alert" } as const;

type AlertProps = ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    /**
     * Whether screen readers announce changes. `off` (default) is a static callout with no role.
     * `polite` makes it a `role="status"` region; `assertive` a `role="alert"` region, only for
     * important messages that appear or change while the user works. Render a live alert before
     * its content changes: a region inserted together with its text is often not announced.
     */
    live?: "off" | "polite" | "assertive";
    /**
     * The icon before the title. Each variant has a default; pass your own, or `null` for none.
     * It is hidden from assistive technology, so the title must say what kind of message it is.
     */
    icon?: ReactNode;
  };

/**
 * A callout with an icon, a title and a description. The icon and the title carry the meaning,
 * so color is never the only signal.
 */
function Alert({ className, variant, live = "off", icon, children, ...props }: AlertProps) {
  const shownIcon =
    icon === undefined ? variant === "destructive" ? <WarningIcon /> : <InfoIcon /> : icon;

  return (
    <div
      data-slot="alert"
      role={roleOf[live]}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {shownIcon !== null && shownIcon !== false && (
        <span
          data-slot="alert-icon"
          aria-hidden="true"
          className="col-start-1 row-span-2 row-start-1 mt-0.5 inline-flex [&_svg]:size-4"
        >
          {shownIcon}
        </span>
      )}
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 leading-snug font-semibold", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle, alertVariants };
export type { AlertProps };
