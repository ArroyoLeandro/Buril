import { useId, type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const linkVariants = cva(
  [
    // Color alone never marks a link (WCAG 1.4.1), so the underline stays in every state.
    "rounded-xs underline underline-offset-4 transition-colors hover:decoration-2",
    // Visible focus (rule 4): outline stays visible in forced-colors mode, unlike a shadow ring.
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  ],
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type LinkProps = Omit<ComponentProps<"a">, "href"> &
  VariantProps<typeof linkVariants> & {
    /** Required: an anchor without href is not a link and is skipped by the keyboard (rule 1). */
    href: string;
    /**
     * Opens the link in a new tab. It sets `target="_blank"` and `rel="noopener noreferrer"`, and
     * tells every user: screen readers hear "(opens in a new tab)" and sighted users see an icon.
     * Passing `target="_blank"` yourself does the same. With `aria-label` or `aria-labelledby`, the
     * hint is added to that name too.
     */
    external?: boolean;
  };

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block size-[0.85em] shrink-0 align-baseline"
    >
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

/** Add the tokens that stop the new page from reaching `window.opener` or the referrer. */
function newTabRel(rel: string | undefined) {
  const tokens = new Set(rel?.split(/\s+/).filter(Boolean));
  tokens.add("noopener");
  tokens.add("noreferrer");
  return [...tokens].join(" ");
}

const newTabHint = "(opens in a new tab)";

function Link({
  className,
  variant,
  external = false,
  target,
  rel,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: LinkProps) {
  const newTab = external || target === "_blank";
  const hintId = useId();

  return (
    <a
      target={newTab ? "_blank" : target}
      rel={newTab ? newTabRel(rel) : rel}
      className={cn(linkVariants({ variant }), className)}
      // aria-label and aria-labelledby replace the link text as its name, which would drop the
      // hidden hint, so the hint is added to whichever of them names the link.
      aria-label={newTab && ariaLabel ? `${ariaLabel} ${newTabHint}` : ariaLabel}
      aria-labelledby={newTab && ariaLabelledBy ? `${ariaLabelledBy} ${hintId}` : ariaLabelledBy}
      {...props}
    >
      {children}
      {/* The space sits outside the hidden span, so every name computation keeps it. */}
      {newTab && (
        <>
          {" "}
          <span id={hintId} className="sr-only">
            {newTabHint}
          </span>
          <ExternalIcon />
        </>
      )}
    </a>
  );
}

export { Link, linkVariants };
export type { LinkProps };
