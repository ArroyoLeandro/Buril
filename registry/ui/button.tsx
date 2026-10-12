import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Long labels wrap instead of overflowing at a 320px width; sizes set a minimum height. While
    // loading, the spinner keeps a wider gap, so the moving ring does not crowd the label.
    "inline-flex items-center justify-center gap-2 rounded-full border text-center font-semibold aria-busy:gap-3",
    // Colors fade with the motion tokens (literal fallbacks, so no theme is needed). The listed
    // properties leave out outline-color: the focus ring appears at once (rule 10).
    "transition-[color,background-color,border-color,text-decoration-color] duration-(--buril-duration-fast,200ms) ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))",
    // The letterpress: a press nudges the button 1px down at the instant duration. It moves, so
    // it only runs when the user allows motion; a loading (aria-disabled) button does not press.
    "motion-safe:transition-[color,background-color,border-color,text-decoration-color,translate] motion-safe:duration-[var(--buril-duration-fast,200ms),var(--buril-duration-fast,200ms),var(--buril-duration-fast,200ms),var(--buril-duration-fast,200ms),var(--buril-duration-instant,100ms)] motion-safe:ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1)) motion-safe:active:not-aria-disabled:translate-y-px",
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

/**
 * The icon gestures. The button names its group, so the icon reacts to the button's hover and
 * keyboard focus. Everything here moves, so it only runs when the user allows motion; the focus
 * ring and the colors are untouched. Gestures play once each time hover or focus arrives and
 * never loop. Their keyframes (`buril-icon-*`) come with this registry item, in your CSS; the
 * durations and easings come from the motion tokens, with literal fallbacks.
 */
const gestureTrigger =
  "motion-safe:group-hover/icon-button:animate-(--buril-icon-gesture) motion-safe:group-focus-visible/icon-button:animate-(--buril-icon-gesture)";
const nudge = `[--buril-icon-gesture:buril-icon-nudge_calc(var(--buril-duration-gesture,720ms)*0.9)_var(--buril-ease-in-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))] ${gestureTrigger}`;

const iconMotion = {
  // Close: the cross turns a quarter while hovered or focused, and turns back after.
  rotate: [
    "motion-safe:transition-[rotate] motion-safe:duration-(--buril-duration-base,420ms) motion-safe:ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))",
    "motion-safe:group-hover/icon-button:rotate-90 motion-safe:group-focus-visible/icon-button:rotate-90",
  ],
  // Refresh: one full turn.
  spin: [
    "[--buril-icon-gesture:buril-icon-spin_calc(var(--buril-duration-slower,560ms)*1.5)_var(--buril-ease-in-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))]",
    gestureTrigger,
  ],
  // Trash: a lid marked with `data-lid` lifts and tilts, then the can shakes once on its base.
  wiggle: [
    "origin-[50%_87.5%] [--buril-icon-gesture:buril-icon-shake_var(--buril-duration-gesture,720ms)_ease-in-out_var(--buril-duration-fast,200ms)]",
    gestureTrigger,
    // The lid pivots on its left end, in the 24-unit grid of the icon's viewBox.
    "[&_[data-lid]]:origin-[4px_7px] [&_[data-lid]]:[transform-box:view-box]",
    "motion-safe:[&_[data-lid]]:transition-[translate,rotate] motion-safe:[&_[data-lid]]:duration-(--buril-duration-base,420ms) motion-safe:[&_[data-lid]]:ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))",
    "motion-safe:group-hover/icon-button:[&_[data-lid]]:-translate-y-[3px] motion-safe:group-hover/icon-button:[&_[data-lid]]:-rotate-[19.6deg]",
    "motion-safe:group-focus-visible/icon-button:[&_[data-lid]]:-translate-y-[3px] motion-safe:group-focus-visible/icon-button:[&_[data-lid]]:-rotate-[19.6deg]",
  ],
  // Bell: a decaying swing from the top.
  swing: [
    "origin-[50%_12.5%] [--buril-icon-gesture:buril-icon-swing_calc(var(--buril-duration-gesture,720ms)*1.3)_ease-in-out]",
    gestureTrigger,
  ],
  // Arrows, send and external links: out and back. Forward follows the reading direction.
  "nudge-x": ["[--buril-nudge-x:3.75px] rtl:[--buril-nudge-x:-3.75px]", nudge],
  "nudge-up": ["[--buril-nudge-y:-3.75px]", nudge],
  "nudge-diagonal": [
    "[--buril-nudge-x:3.75px] rtl:[--buril-nudge-x:-3.75px] [--buril-nudge-y:-3.75px]",
    nudge,
  ],
  // Like: grows, dips and settles; a press plays it again on top of the hover one.
  pop: [
    "[--buril-icon-gesture:buril-icon-pop_calc(var(--buril-duration-slow,460ms)*1.4)_var(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))]",
    gestureTrigger,
    "motion-safe:group-active/icon-button:animate-[var(--buril-icon-gesture),buril-icon-press_calc(var(--buril-duration-slow,460ms)*1.4)_var(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))]",
  ],
};

type IconButtonMotion = keyof typeof iconMotion;

type IconButtonProps = Omit<ButtonProps, "size" | "aria-label" | "children"> & {
  /**
   * Required: an icon has no text, so this is the button's only accessible name (rule 5).
   * Describe the action ("Close dialog"), not the icon ("Cross").
   */
  "aria-label": string;
  size?: "icon-sm" | "icon" | "icon-lg";
  /** The icon. It is hidden from assistive technology, so it never adds to the name. */
  children: ReactNode;
  /**
   * A one-shot gesture the icon plays on hover and keyboard focus: `rotate` (close), `spin`
   * (refresh), `wiggle` (delete; mark the lid with `data-lid` to lift it), `swing` (bell),
   * `nudge-x`, `nudge-up` and `nudge-diagonal` (arrows, send, external links) or `pop` (like,
   * also on press). It only runs when the user allows motion.
   */
  motion?: IconButtonMotion;
};

/**
 * A square button that shows only an icon. While loading, the spinner replaces the icon so the
 * square keeps its size.
 */
function IconButton({
  size = "icon",
  loading = false,
  motion,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button
      size={size}
      loading={loading}
      className={cn(motion && "group/icon-button", className)}
      {...props}
    >
      {!loading && (
        <span
          aria-hidden="true"
          data-motion={motion}
          className={cn("inline-flex", motion && iconMotion[motion])}
        >
          {children}
        </span>
      )}
    </Button>
  );
}

export { Button, IconButton, buttonVariants };
export type { ButtonProps, IconButtonMotion, IconButtonProps };
