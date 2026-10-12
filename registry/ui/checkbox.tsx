"use client";

import { useImperativeHandle, useLayoutEffect, useRef, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  /**
   * Shows a dash instead of the check and reports a "mixed" state, for an option that controls
   * a partly checked group. HTML has no attribute for it, so it sets the DOM property. A click
   * clears the property, as browsers do; the prop is applied again on the next render.
   */
  indeterminate?: boolean;
};

/**
 * A native checkbox drawn with CSS. It has no label of its own: wrap it in a `<label>` with its
 * text, or put it in a Field. `className`, `ref` and every other prop go to the `<input>`.
 */
function Checkbox({ className, indeterminate = false, ref, ...props }: CheckboxProps) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!, []);

  // A layout effect, so the property is set before the browser paints and the dash never shows a
  // frame late. No dependency list: after a click clears the DOM property, the next render
  // restores the prop.
  useLayoutEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  });

  return (
    <span className="relative inline-grid shrink-0 place-items-center align-middle">
      <input
        ref={input}
        type="checkbox"
        className={cn(
          // A 20px box; pair it with a label so the clickable target is at least 24px (rule 8).
          "peer col-start-1 row-start-1 size-5 shrink-0 cursor-pointer appearance-none rounded-sm border border-input bg-background",
          "checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary",
          // The fill fades in every motion mode; outline-color is left out so the focus ring
          // appears at once.
          "transition-[background-color,border-color] duration-(--buril-duration-base,180ms) ease-(--buril-ease-out,cubic-bezier(0.2,0,0,1))",
          // Visible focus (rule 4): outline stays visible in forced-colors mode, unlike a shadow ring.
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "aria-invalid:border-destructive",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Forced colors drop the custom fill, so the system draws the native checkbox instead.
          "forced-colors:appearance-auto",
          className,
        )}
        {...props}
      />
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "pointer-events-none invisible col-start-1 row-start-1 size-3.5 text-primary-foreground peer-checked:visible peer-indeterminate:invisible peer-disabled:opacity-50 forced-colors:hidden",
          // Drawn like a burin stroke: one dash as long as the path is offset by its whole length
          // and slides into place when checked. The path inherits both dash properties. Under
          // reduced motion there is no transition, so the check appears at once.
          "[stroke-dasharray:1] [stroke-dashoffset:1] peer-checked:[stroke-dashoffset:0]",
          "motion-safe:transition-[stroke-dashoffset] motion-safe:duration-(--buril-duration-base,180ms) motion-safe:ease-(--buril-ease-out,cubic-bezier(0.2,0,0,1))",
        )}
      >
        <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className={cn(
          "pointer-events-none invisible col-start-1 row-start-1 size-3.5 text-primary-foreground peer-indeterminate:visible peer-disabled:opacity-50 forced-colors:hidden",
          // The dash grows across from the middle. Scaling is movement, so under reduced motion
          // the dash is never scaled down and appears at once.
          "motion-safe:scale-x-0 motion-safe:transition-[scale] motion-safe:duration-(--buril-duration-base,180ms) motion-safe:ease-(--buril-ease-out,cubic-bezier(0.2,0,0,1)) motion-safe:peer-indeterminate:scale-x-100",
        )}
      >
        <path d="M6 12h12" />
      </svg>
    </span>
  );
}

export { Checkbox };
export type { CheckboxProps };
