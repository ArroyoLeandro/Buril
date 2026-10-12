import type { ComponentProps, Ref } from "react";

import { cn } from "@/lib/utils";

type SeparatorProps = Omit<ComponentProps<"div">, "ref" | "role" | "children"> & {
  /** `horizontal` (default) renders an `<hr>`; `vertical` a separator for a row. */
  orientation?: "horizontal" | "vertical";
  /**
   * For a line that only decorates, such as between links in a row: it is hidden from assistive
   * technology. Leave it off when the line separates sections of content.
   */
  decorative?: boolean;
  ref?: Ref<HTMLElement>;
};

/**
 * A line between groups of content. Drawn with a border, not a background, so it stays visible
 * in forced-colors mode. The `border` color is the only token meant for dividers; Buril measures
 * it well above 3:1, so a separator that conveys structure stays visible.
 */
function Separator({
  orientation = "horizontal",
  decorative = false,
  className,
  ref,
  ...props
}: SeparatorProps) {
  const classes = cn(
    "shrink-0 border-0 border-border",
    orientation === "horizontal" ? "w-full border-t" : "w-0 self-stretch border-l",
    className,
  );

  if (decorative) {
    // role="none" removes the separator semantics; aria-hidden also keeps the empty element out
    // of the accessibility tree. aria-hidden is a global ARIA attribute (axe accepts it here);
    // jsx-a11y's role table does not list globals for role="none".
    return (
      // eslint-disable-next-line jsx-a11y/role-supports-aria-props
      <div
        ref={ref as Ref<HTMLDivElement>}
        role="none"
        aria-hidden="true"
        data-slot="separator"
        className={classes}
        {...props}
      />
    );
  }

  if (orientation === "vertical") {
    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        role="separator"
        aria-orientation="vertical"
        data-slot="separator"
        className={classes}
        {...props}
      />
    );
  }

  // A native hr has the separator role and a horizontal orientation already.
  return (
    <hr
      ref={ref as Ref<HTMLHRElement>}
      data-slot="separator"
      className={classes}
      {...(props as ComponentProps<"hr">)}
    />
  );
}

export { Separator };
export type { SeparatorProps };
