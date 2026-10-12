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
    // A grid, so the track and the thumb share one cell: the thumb's percentages then resolve
    // against the track box, whatever size the consumer gives the track.
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
          "transition-[background-color,border-color] duration-(--buril-duration-base,180ms) ease-(--buril-ease-in-out,cubic-bezier(0.4,0,0.2,1))",
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
          // element is the rail, 4px inside the track; its ::before is the round dot, as tall as
          // the rail. The rail is a size container, so when on the dot moves by the rail's width
          // (100cqw) minus its own (100%) with translate, never left: it fits and travels fully
          // on any track size.
          "[container-type:size] pointer-events-none absolute inset-1 col-start-1 row-start-1 flex peer-disabled:opacity-50",
          "before:aspect-square before:h-full before:shrink-0 before:rounded-full before:bg-muted-foreground",
          "peer-checked:before:translate-x-[calc(100cqw-100%)] peer-checked:before:bg-primary-foreground",
          // Without container query units the translate is dropped; an auto margin moves the dot.
          "not-supports-[width:1cqw]:peer-checked:before:ml-auto",
          // The color fades in every motion mode; the dot slides only when the user allows motion.
          "before:transition-[background-color] before:duration-(--buril-duration-base,180ms) before:ease-(--buril-ease-in-out,cubic-bezier(0.4,0,0.2,1))",
          "motion-safe:before:transition-[background-color,translate] motion-safe:before:duration-(--buril-duration-base,180ms) motion-safe:before:ease-(--buril-ease-in-out,cubic-bezier(0.4,0,0.2,1))",
          // Forced colors replace backgrounds, which would hide the dot; keep a system color.
          "forced-colors:forced-color-adjust-none forced-colors:before:bg-[CanvasText]",
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
