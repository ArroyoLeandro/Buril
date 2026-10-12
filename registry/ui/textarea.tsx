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
