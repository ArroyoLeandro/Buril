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
    // A grid, so the track and the thumb share one cell: the thumb's inset then resolves against
    // the track box, whatever size the consumer gives the track.
    <span className="relative inline-grid shrink-0 grid-flow-col items-center gap-2 align-middle">
      <input
        type="checkbox"
        role="switch"
        className={cn(
          // A 44 by 24px track: above the 24px target size (rule 8).
          "peer col-start-1 row-start-1 h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-background",
          "checked:border-primary checked:bg-primary",
          // The track colors fade in every motion mode; outline-color is left out so the focus
          // ring appears at once.
          "transition-[background-color,border-color] duration-(--buril-duration-base,420ms) ease-(--buril-ease-in-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))",
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
          // The thumb's position tells off from on, so the state is never color alone. This
          // element is the rail the dot travels along, 4px inside the track. It names both grid
          // lines: an absolute grid child with an auto end line reaches the container's far edge,
          // over the state text.
          "pointer-events-none absolute inset-1 col-start-1 col-end-2 row-start-1 row-end-2 flex peer-disabled:opacity-50",
          // The ::after is an empty square as tall as the rail at its end, so the dot's carrier
          // gets the rest of the rail: its width is exactly how far the dot travels.
          "after:aspect-square after:h-full after:shrink-0",
          // The dot is painted in the rail's text color, which fades in every motion mode.
          "text-muted-foreground peer-checked:text-primary-foreground",
          "transition-[color] duration-(--buril-duration-base,420ms) ease-(--buril-ease-in-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))",
          // When on, the carrier moves by its own width, so the dot ends at the far side.
          "peer-checked:[--buril-switch-travel:100%]",
          // Forced colors replace backgrounds and text colors, which would hide the dot; keep a
          // system color.
          "forced-colors:text-[CanvasText] forced-colors:forced-color-adjust-none",
        )}
      >
        <span
          className={cn(
            // The carrier: the dot is its ::before, round and as tall as the rail. On a short
            // track the dot is wider than the carrier; min-w-0 keeps the carrier from growing to
            // fit it. It moves with translate, never left, and slides only when the user allows
            // motion.
            "h-full min-w-0 flex-1 translate-x-(--buril-switch-travel,0%)",
            "motion-safe:transition-[translate] motion-safe:duration-(--buril-duration-base,420ms) motion-safe:ease-(--buril-ease-in-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))",
            "before:block before:aspect-square before:h-full before:rounded-full before:bg-current",
          )}
        />
      </span>
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
