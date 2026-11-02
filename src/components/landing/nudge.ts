/**
 * The IconButton `nudge-x` gesture, reused on the site's forward arrows: a link with the `group`
 * class nudges its arrow once on hover and keyboard focus, and only when the reader allows motion.
 * The keyframes come from `registry/styles/icon-button.css`.
 */
export const nudgeArrow =
  "[--buril-nudge-x:3.75px] motion-safe:group-hover:animate-[buril-icon-nudge_calc(var(--buril-duration-gesture)*0.9)_var(--buril-ease-in-out)] motion-safe:group-focus-visible:animate-[buril-icon-nudge_calc(var(--buril-duration-gesture)*0.9)_var(--buril-ease-in-out)]";
