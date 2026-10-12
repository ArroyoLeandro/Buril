import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SelectProps = ComponentProps<"select">;

/**
 * A native `<select>` with the Input's look and its own chevron. The platform still draws the
 * picker, so keyboard, touch and screen reader behavior stay native. It fills the width of its
 * container. `className`, `ref` and every other prop go to the `<select>`.
 */
function Select({ className, multiple, size, ...props }: SelectProps) {
  // A multiple or sized select is a list box with no picker to open, so it gets no chevron.
  const listbox = multiple || (size !== undefined && size > 1);

  return (
    <span className="relative block w-full">
      <select
        multiple={multiple}
        size={size}
        className={cn(
          // The same field look as the Input: at least 40px tall, with a 16px font.
          "peer min-h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground",
          // The border and colors fade; outline-color is left out so the focus ring appears at once.
          "transition-[color,background-color,border-color] duration-(--buril-duration-fast,120ms) ease-(--buril-ease-out,cubic-bezier(0.2,0,0,1))",
          // Visible focus (rule 4): outline stays visible in forced-colors mode, unlike a shadow ring.
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "aria-invalid:border-destructive",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // The native arrow gives way to the chevron, and comes back in forced-colors mode.
          !listbox && "cursor-pointer appearance-none pr-10 forced-colors:appearance-auto",
          className,
        )}
        {...props}
      />
      {!listbox && (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-foreground peer-disabled:opacity-50 forced-colors:hidden"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      )}
    </span>
  );
}

export { Select };
export type { SelectProps };
