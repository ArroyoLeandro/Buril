import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type TextareaProps = ComponentProps<"textarea">;

/**
 * A native multi-line text field with the same look as the Input. Pair it with a visible label,
 * for example inside a Field, which also wires the description, the error and `aria-invalid`.
 */
function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        // About three lines tall to start; it resizes vertically so the width keeps the layout.
        "min-h-20 w-full min-w-0 resize-y rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground",
        // The border and colors fade; outline-color is left out so the focus ring appears at once.
        "transition-[color,background-color,border-color] duration-(--buril-duration-fast,200ms) ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1))",
        // Visible focus (rule 4): outline stays visible in forced-colors mode, unlike a shadow ring.
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        // The red border only reinforces the error; the Field's error text says what is wrong.
        "aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
export type { TextareaProps };
