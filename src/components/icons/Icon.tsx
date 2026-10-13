import { createElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { icons, type IconName, type IconShape } from "./icons";

function shapes(list: readonly IconShape[]): ReactNode[] {
  return list.map((shape, index) =>
    shape[0] === "g"
      ? createElement("g", { key: index, ...shape[1] }, shapes(shape[2]))
      : createElement(shape[0], { key: index, ...shape[1] }),
  );
}

interface IconProps {
  name: IconName;
  className?: string;
  /** Paints the shape, such as a pressed Like heart. */
  filled?: boolean;
}

/**
 * A site stroke icon (see `icons.ts`) inside a React island, always decorative. It matches
 * `Icon.astro` attribute for attribute.
 */
export function Icon({ name, className, filled = false }: IconProps) {
  return (
    <svg
      data-icon={name}
      className={cn("shrink-0", className)}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shapes(icons[name])}
    </svg>
  );
}
