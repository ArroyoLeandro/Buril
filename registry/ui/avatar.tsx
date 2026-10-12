"use client";

import { useState, type ComponentProps } from "react";
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
        <img
          src={src}
          alt={alt}
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
        />
      ) : (
        // The name comes from the root's aria-label; the letters would only be spelled out.
        <span aria-hidden="true">{fallback ?? initialsOf(alt)}</span>
      )}
    </span>
  );
}

export { Avatar, avatarVariants, initialsOf };
export type { AvatarProps };
