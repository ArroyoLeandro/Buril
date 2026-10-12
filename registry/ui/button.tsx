import type { ComponentProps, MouseEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Long labels wrap instead of overflowing at a 320px width; sizes set a minimum height.
    "inline-flex items-center justify-center gap-2 rounded-full border text-center font-semibold transition-colors",
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

export { Button, buttonVariants };
export type { ButtonProps };
