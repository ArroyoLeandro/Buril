import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Long labels wrap instead of overflowing at a 320px width; sizes set a minimum height.
    "inline-flex items-center justify-center gap-2 rounded-full border text-center font-semibold",
    // Colors fade with the motion tokens (literal fallbacks, so no theme is needed). The listed
    // properties leave out outline-color: the focus ring appears at once (rule 10).
    "transition-[color,background-color,border-color,text-decoration-color] duration-(--buril-duration-fast,120ms) ease-(--buril-ease-out,cubic-bezier(0.2,0,0,1))",
    // Visible focus (rule 4): outline stays visible in forced-colors mode, unlike a shadow ring.
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    // Borders stay visible when forced-colors replaces the palette.
    "forced-colors:border-current",
    "disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress",
  ],
  {
    variants: {
      // Each variant sets exactly one border color. A raw <a> styled with buttonVariants() gets
      // no cn() merge, so two border colors would leave the winner to Tailwind's rule order.
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "border-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent text-primary underline underline-offset-4 hover:no-underline forced-colors:border-transparent",
        // text-white is the one non-token color: white on the dark-mode red fails contrast, and
        // no shadcn token is white in both modes.
        destructive:
          "border-transparent bg-destructive text-white hover:bg-destructive/90 dark:text-background",
      },
      size: {
        sm: "min-h-8 px-4 py-1 text-sm",
        default: "min-h-10 px-6 py-2 text-sm",
        lg: "min-h-12 px-8 py-2 text-base",
        // Fixed squares for a single icon (32/40/48px, all above the 24px target). They never
        // shrink in a flex row, and an icon without its own size-* class scales with the button.
        "icon-sm": "size-8 shrink-0 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-10 shrink-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-lg": "size-12 shrink-0 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /**
   * Shows a spinner and blocks activation. The button stays focusable (no `disabled`) and keeps
   * its accessible name, so keyboard and screen reader users keep their place. It sets
   * `aria-busy` and `aria-disabled`, but screen readers generally do not announce `aria-busy` on
   * a button: announce progress from a `role="status"` region outside the button.
   */
  loading?: boolean;
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      className="size-4 shrink-0 motion-safe:animate-spin"
    >
      <circle cx="12" cy="12" r="10" className="opacity-25" />
      <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round" />
    </svg>
  );
}

function Button({
  className,
  variant,
  size,
  loading = false,
  type = "button",
  onClick,
  children,
  ...props
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={handleClick}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type IconButtonProps = Omit<ButtonProps, "size" | "aria-label" | "children"> & {
  /**
   * Required: an icon has no text, so this is the button's only accessible name (rule 5).
   * Describe the action ("Close dialog"), not the icon ("Cross").
   */
  "aria-label": string;
  size?: "icon-sm" | "icon" | "icon-lg";
  /** The icon. It is hidden from assistive technology, so it never adds to the name. */
  children: ReactNode;
};

/**
 * A square button that shows only an icon. While loading, the spinner replaces the icon so the
 * square keeps its size.
 */
function IconButton({ size = "icon", loading = false, children, ...props }: IconButtonProps) {
  return (
    <Button size={size} loading={loading} {...props}>
      {!loading && (
        <span aria-hidden="true" className="inline-flex">
          {children}
        </span>
      )}
    </Button>
  );
}

export { Button, IconButton, buttonVariants };
export type { ButtonProps, IconButtonProps };
