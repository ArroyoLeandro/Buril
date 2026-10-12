"use client";

import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold text-muted-foreground select-none",
    // Forced colors drop the fill; a border keeps the circle's edge.
    "forced-colors:border forced-colors:border-current",
  ],
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        default: "size-10 text-sm",
        lg: "size-12 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

/** The first letters of the first and last words, such as "AL" for "Ada Lovelace". */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  // Array.from splits by code point, so a letter outside the BMP is not cut in half.
  return [first, last].map((word) => (word ? Array.from(word)[0]!.toUpperCase() : "")).join("");
}

type AvatarProps = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof avatarVariants> & {
    /** Image URL. Without it, or when it fails to load, the avatar shows initials. */
    src?: string;
    /**
     * Required. Who the avatar shows, such as the person's name; it names the image and the
     * initials fallback. Pass `alt=""` when the name is already next to the avatar: it is then
     * hidden from assistive technology.
     */
    alt: string;
    /** Text for the fallback. Defaults to initials taken from `alt`. */
    fallback?: string;
  };

/**
 * A round picture of a person. With no `src`, or when the image fails to load, it shows initials
 * in an element with `role="img"` named by `alt`, so screen readers hear the name, not letters.
 * `ref`, `className` and other props go to the root `<span>`.
 */
function Avatar({ src, alt, fallback, size, className, ...props }: AvatarProps) {
  // Remember which src failed, so a new src gets a fresh try without an effect.
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = src !== undefined && src !== failedSrc;
  const decorative = alt === "";
  const image = useRef<HTMLImageElement>(null);

  // An image still loading is marked before the first paint, so it waits hidden over the initials
  // and fades in once it loads. An image already complete (cached, or loaded before hydration)
  // shows at once, and without JavaScript nothing marks it, so it is never hidden. A direct DOM
  // update: React never renders this attribute, so it keeps what this sets.
  useLayoutEffect(() => {
    if (image.current && !image.current.complete) image.current.setAttribute("data-loading", "");
  }, [src]);

  const initials = fallback ?? initialsOf(alt);

  const fallbackProps = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": alt };

  return (
    <span
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...(showImage ? {} : fallbackProps)}
      {...props}
    >
      {showImage ? (
        <>
          <img
            ref={image}
            src={src}
            alt={alt}
            onLoad={(event) => event.currentTarget.removeAttribute("data-loading")}
            onError={() => setFailedSrc(src)}
            className="peer absolute inset-0 size-full object-cover transition-[opacity] duration-(--buril-duration-fast,200ms) ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1)) data-loading:opacity-0"
          />
          {/* Under the image while it loads, then faded out, so a transparent picture does not
              show letters through it. The image's alt is the name. */}
          <span
            aria-hidden="true"
            className="opacity-0 transition-[opacity] duration-(--buril-duration-fast,200ms) ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1)) peer-data-loading:opacity-100"
          >
            {initials}
          </span>
        </>
      ) : (
        // The name comes from the root's aria-label; the letters would only be spelled out.
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}

export { Avatar, avatarVariants, initialsOf };
export type { AvatarProps };
