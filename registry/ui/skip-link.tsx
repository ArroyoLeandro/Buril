import type { ComponentProps, MouseEvent } from "react";

import { cn } from "@/lib/utils";

type SkipLinkProps = Omit<ComponentProps<"a">, "href"> & {
  /**
   * The in-page target, `"#main"` by default. Give that element `tabindex="-1"` so it can take
   * focus: the next Tab then continues from the target instead of the top of the page.
   */
  href?: `#${string}`;
};

/**
 * The element id a fragment points to. A percent-encoded fragment is decoded, as browsers do; one
 * that is not valid percent-encoding (a lone "%") would make decodeURIComponent throw, so it is
 * used as written.
 */
function fragmentId(href: string) {
  const raw = href.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * A link that lets keyboard users jump past repeated content, such as the header. Place it first
 * in `<body>`. It is visually hidden until it has keyboard focus, then appears at the top left
 * above any sticky header (WCAG 2.4.11).
 */
function SkipLink({
  href = "#main",
  className,
  onClick,
  children = "Skip to content",
  ...props
}: SkipLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // Browsers move focus to a focusable fragment target; focusing it here also covers those
    // that only scroll. The default navigation still runs, so the URL and scroll stay native.
    document.getElementById(fragmentId(href))?.focus();
  };

  return (
    <a
      href={href}
      className={cn(
        // Clipped, not display: none, so screen readers still reach it.
        "sr-only rounded-full border border-border bg-background font-semibold text-foreground",
        // On keyboard focus: fixed at the top left, above sticky UI. Padding comes after
        // not-sr-only, which resets it to 0.
        "focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2",
        // Visible focus (rule 4): outline stays visible in forced-colors mode, unlike a shadow ring.
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}

export { SkipLink };
export type { SkipLinkProps };
