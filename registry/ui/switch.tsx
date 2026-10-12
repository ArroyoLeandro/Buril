import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SwitchProps = Omit<ComponentProps<"input">, "type" | "role"> & {
  /**
   * Visible text for each state, shown after the switch, such as `{ on: "On", off: "Off" }`.
   * It is hidden from screen readers, which already announce the switch as on or off.
   */
  stateLabels?: { on: ReactNode; off: ReactNode };
};

/**
 * An on/off control for a setting that applies immediately (APG Switch). It is a native checkbox
 * with `role="switch"`, so Space, forms and the `checked` state work natively; the browser maps
 * `checked` to the switch state. It has no label of its own: wrap it in a `<label>` with its
 * text, or put it in a Field. `className`, `ref` and every other prop go to the `<input>`.
 */
function Switch({ className, stateLabels, ...props }: SwitchProps) {
  return (
    <span className="relative inline-flex shrink-0 items-center gap-2 align-middle">
      <input
        type="checkbox"
        role="switch"
        className={cn(
          // A 44 by 24px track: above the 24px target size (rule 8).
          "peer h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-background",
          "checked:border-primary checked:bg-primary",
          // Visible focus (rule 4): outline stays visible in forced-colors mode, unlike a shadow ring.
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "aria-invalid:border-destructive",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <span
        data-thumb
        aria-hidden="true"
        className={cn(
          // The thumb's position tells off from on, so the state is never color alone.
          "pointer-events-none absolute top-1/2 left-1 size-4 -translate-y-1/2 rounded-full bg-muted-foreground",
          "peer-checked:translate-x-5 peer-checked:bg-primary-foreground peer-disabled:opacity-50",
          // Slides only when the user has not asked for reduced motion (rule 10).
          "motion-safe:transition-transform",
          // Forced colors replace backgrounds, which would hide the thumb; keep a system color.
          "forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none",
        )}
      />
      {stateLabels && (
        <>
          <span aria-hidden="true" className="text-sm peer-checked:hidden">
            {stateLabels.off}
          </span>
          <span aria-hidden="true" className="hidden text-sm peer-checked:inline">
            {stateLabels.on}
          </span>
        </>
      )}
    </span>
  );
}

export { Switch };
export type { SwitchProps };
