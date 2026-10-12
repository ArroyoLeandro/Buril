import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type CardProps = ComponentProps<"div"> & {
  /**
   * Adds an engraved, hatched band across the top. It is decoration only: hidden from assistive
   * technology and removed in forced-colors mode.
   */
  decor?: boolean;
};

/**
 * A bordered container for related content. It is not interactive and has no role: to make the
 * whole card a link, put a real link in the title and stretch it over the card (see the docs).
 */
function Card({ className, decor = false, children, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        // `relative` makes the card the containing block of a stretched link in its title.
        "relative flex flex-col gap-4 rounded-lg border border-border bg-card py-6 text-card-foreground",
        className,
      )}
      {...props}
    >
      {decor && (
        <div
          data-decor
          aria-hidden="true"
          className={cn(
            // Pulled into the top padding, flush with the border. `--decor` is a Buril extra, so
            // it falls back to the primary color with a plain shadcn theme.
            "-mt-6 h-3 shrink-0 rounded-t-[inherit] border-b border-border",
            "bg-[image:repeating-linear-gradient(135deg,var(--decor,var(--primary))_0_1px,transparent_1px_6px)]",
            "forced-colors:hidden",
          )}
        />
      )}
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6", className)}
      {...props}
    />
  );
}

type CardTitleProps = ComponentProps<"h3"> & {
  /** Heading level. Pick the one that fits the page outline; the look stays the same. */
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
};

function CardTitle({ as: Heading = "h3", className, ...props }: CardTitleProps) {
  return (
    <Heading
      data-slot="card-title"
      className={cn("text-lg leading-snug font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex flex-wrap items-center gap-2 px-6", className)}
      {...props}
    />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
export type { CardProps, CardTitleProps };
