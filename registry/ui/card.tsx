import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type CardProps = ComponentProps<"div"> & {
  /**
   * Adds an engraved, hatched band across the top. It is decoration only: hidden from assistive
   * technology and removed in forced-colors mode.
   */
  decor?: boolean;
  /**
   * For a card that is one link, stretched from its title: it lifts and shows a shadow on hover
   * and while that link has keyboard focus. It adds no role and no focus stop; the link stays the
   * one control. Static cards never move.
   */
  interactive?: boolean;
};

/**
 * A bordered container for related content. It is not interactive and has no role: to make the
 * whole card a link, put a real link in the title, stretch it over the card and pass
 * `interactive` (see the docs).
 */
function Card({ className, decor = false, interactive = false, children, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-interactive={interactive || undefined}
      className={cn(
        // `relative` makes the card the containing block of a stretched link in its title.
        "relative flex flex-col gap-4 rounded-lg border border-border bg-card py-6 text-card-foreground",
        interactive && [
          // The lift moves the card, so it only runs when the user allows motion. Keyboard focus
          // on the link inside gets the same state as hover.
          "motion-safe:transition-[translate] motion-safe:duration-(--buril-duration-base,420ms) motion-safe:ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))",
          "motion-safe:hover:-translate-y-[4.5px] motion-safe:has-focus-visible:-translate-y-[4.5px]",
          // The shadow is an overlay that fades in, so box-shadow itself never animates. It lets
          // clicks through to the stretched link. Black is a measured exception to the tokens: a
          // shadow only darkens, no shadcn token is a shadow color, and the lift or the link's
          // focus ring carries the state, never the shadow alone.
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:shadow-[0_14px_28px_-14px_rgb(0_0_0/0.35)]",
          "after:transition-[opacity] after:duration-(--buril-duration-fast,200ms) after:ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1)) hover:after:opacity-100 has-focus-visible:after:opacity-100",
        ],
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
