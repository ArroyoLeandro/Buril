import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type InputProps = ComponentProps<"input">;

/**
 * A native text input. Pair it with a visible label, for example inside a Field, which also wires
 * the description, the error and `aria-invalid`.
 */
function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        // At least 40px tall, like the default Button. A 16px font stops mobile browsers zooming in.
        "min-h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground",
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

export { Input };
export type { InputProps };
