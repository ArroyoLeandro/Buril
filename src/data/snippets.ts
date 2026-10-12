/**
 * Code samples shown on more than one page, such as an English page and its Spanish twin. Code
 * stays in English in every language, so each sample lives here once and never drifts.
 */

/** Theming: the three ways to set the color scheme on `<html>`. */
export const darkModeExample = `<html class="dark">  <!-- always dark -->
<html class="light"> <!-- always light -->
<html>               <!-- follows the system -->`;

/** Theming: replacing the red in all three blocks the theme writes. */
export const overrideRedExample = `:root {
  --decor: #1d4ed8;
  --ring: #1d4ed8;
}

.dark {
  --decor: #60a5fa;
  --ring: #60a5fa;
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --decor: #60a5fa;
    --ring: #60a5fa;
  }
}`;
