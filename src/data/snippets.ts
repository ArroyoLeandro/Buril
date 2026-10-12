import { noFlashScriptFor } from "../scripts/theme";

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

/** Motion: retuning the motion tokens after the theme. */
export const retuneMotionExample = `:root {
  /* Calmer: state changes and entries take longer. */
  --buril-duration-base: 520ms;
  --buril-duration-slow: 560ms;
  /* No spring: entries ease out without passing their target. */
  --buril-ease-out: cubic-bezier(0.2, 0, 0, 1);
}`;

/** Guides: Field strings in another language. */
export const fieldStringsExample = `<Field
  label="Correo electrónico"
  error={errors.email}
  required
  requiredLabel="(obligatorio)"
  errorPrefix="Error:"
>
  {(control) => <Input type="email" {...control} />}
</Field>`;

/** Guides: one element child instead of a render prop. */
export const fieldChildGuideExample = `<Field label="Message" description="Up to 500 characters.">
  <Textarea name="message" maxLength={500} />
</Field>`;

/** Dark mode guide: next-themes in a Next.js App Router layout. */
export const nextThemesLayoutExample = `import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // next-themes sets the class before React hydrates, so React must not warn about it.
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </body>
    </html>
  );
}`;

/** Dark mode guide: a theme picker built from Field and Select. */
export const themeSelectExample = `"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // The stored theme is only known in the browser, so render nothing on the server.
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Field label="Theme">
      <Select value={theme} onChange={(event) => setTheme(event.target.value)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </Select>
    </Field>
  );
}`;

/** Indents every line of `code` by `spaces`. */
const indent = (code: string, spaces: number) =>
  code
    .split("\n")
    .map((line) => " ".repeat(spaces) + line)
    .join("\n");

/** Dark mode guide: the no-flash script in Astro's <head>, for the choice stored as `theme`. */
export const astroHeadExample = `<head>
  <script is:inline>
${indent(noFlashScriptFor("theme"), 4)}
  </script>
</head>`;

/** Dark mode guide: an Astro theme picker that sets the classes and stores the choice. */
export const astroToggleExample = `<label for="theme">Theme</label>
<select id="theme">
  <option value="system">System</option>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>

<script>
  const select = document.querySelector<HTMLSelectElement>("#theme")!;
  select.value = localStorage.getItem("theme") ?? "system";
  select.addEventListener("change", () => {
    const choice = select.value;
    document.documentElement.classList.toggle("dark", choice === "dark");
    document.documentElement.classList.toggle("light", choice === "light");
    if (choice === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", choice);
  });
</script>`;

/** Dark mode guide: the same script in a Vite app's index.html. */
export const viteHeadExample = `<!doctype html>
<html lang="en">
  <head>
    <script>
${indent(noFlashScriptFor("theme"), 6)}
    </script>
    <!-- … -->
  </head>
</html>`;

/** Dark mode guide: next-themes around a Vite app. */
export const viteMainExample = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class">
      <App />
    </ThemeProvider>
  </StrictMode>,
);`;

/**
 * Theme guide: a neutral palette for the shadcn tokens, measured against WCAG AA in
 * `test/docs/guides.test.ts`.
 */
export const neutralPresetExample = `:root {
  --background: #ffffff;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #171717;
  --popover: #ffffff;
  --popover-foreground: #171717;
  --primary: #171717;
  --primary-foreground: #fafafa;
  --secondary: #f5f5f5;
  --secondary-foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #525252;
  --accent: #f5f5f5;
  --accent-foreground: #171717;
  --destructive: #dc2626;
  --border: #8a8a8a;
  --input: #8a8a8a;
  --ring: #525252;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #0a0a0a;
  --card-foreground: #fafafa;
  --popover: #0a0a0a;
  --popover-foreground: #fafafa;
  --primary: #e5e5e5;
  --primary-foreground: #171717;
  --secondary: #262626;
  --secondary-foreground: #fafafa;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --accent: #262626;
  --accent-foreground: #fafafa;
  --destructive: #f87171;
  --border: #737373;
  --input: #737373;
  --ring: #a3a3a3;
}`;

/** Theme guide: your own fonts. */
export const fontsExample = `@theme {
  --font-display: "Your Display Font", ui-monospace, monospace;
  --font-body: "Your Text Font", system-ui, sans-serif;
}`;

/** shadcn guide: Buril's Button next to shadcn's. */
export const sideBySideExample = `import { Button } from "@/components/ui/button";
import { Button as BurilButton } from "@/components/buril/button";

<Button>shadcn</Button>
<BurilButton>Buril</BurilButton>`;

/**
 * Component pages: the code samples in each page's Examples section, by slug. The English page
 * and its Spanish twin render the same samples.
 */
export const componentExamples = {
  alert: {
    insertExample: `{/* On the page from the start, empty. */}
<div role="status">
  {saved && (
    <Alert>
      <AlertTitle>Draft saved</AlertTitle>
    </Alert>
  )}
</div>`,
    liveExample: `{/* Rendered before the upload starts; only its text changes. */}
<Alert live="polite">
  <AlertTitle>Upload</AlertTitle>
  <AlertDescription>{progressMessage}</AlertDescription>
</Alert>`,
    variantsExample: `<Alert>
  <AlertTitle>New version available</AlertTitle>
  <AlertDescription>Reload the page to get the latest components.</AlertDescription>
</Alert>
<Alert variant="destructive" icon={<CreditCardIcon />}>
  <AlertTitle>Payment failed</AlertTitle>
</Alert>
<Alert icon={null}>
  <AlertTitle>Maintenance tonight from 22:00</AlertTitle>
</Alert>`,
    assertiveExample: `{/* An error that appears: an empty region, on the page from the start. */}
<div role="alert">
  {expired && (
    <Alert variant="destructive">
      <AlertTitle>Your session expired. Sign in again to save.</AlertTitle>
    </Alert>
  )}
</div>

{/* An error already on screen whose text changes: the alert stays mounted. */}
<Alert variant="destructive" live="assertive">
  <AlertTitle>Connection lost</AlertTitle>
  <AlertDescription>{retryMessage}</AlertDescription>
</Alert>`,
  },
  avatar: {
    fallbackExample: `<Avatar alt="Grace Hopper" size="sm" />
<Avatar alt="Grace Hopper" fallback="GMH" size="lg" />`,
    decorativeExample: `<p className="flex items-center gap-2">
  <Avatar src={user.photo} alt="" />
  {user.name}
</p>`,
  },
  badge: {
    variantsExample: `<Badge>New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="outline">Beta</Badge>
<Badge variant="destructive">Failed</Badge>`,
    statusExample: `<p>
  Order 1042 <Badge>{shipped ? "Shipped" : "Processing"}</Badge>
</p>
{/* Rendered from the start, empty, so the change is announced. */}
<p role="status">{message}</p>`,
  },
  button: {
    variantsExample: `<Button>Publish</Button>
<Button variant="outline">Preview</Button>
<Button variant="destructive" size="sm">Delete</Button>
<a href="/docs" className={buttonVariants({ variant: "secondary" })}>
  Read the docs
</a>`,
    statusExample: `<Button type="submit" loading={saving}>
  Save changes
</Button>
<p role="status">{saving ? "Saving changes…" : message}</p>`,
  },
  card: {
    decorExample: `<Card decor>
  <CardHeader>
    <CardTitle as="h2">Starter plan</CardTitle>
    <CardDescription>For a single project.</CardDescription>
  </CardHeader>
  <CardContent>Three seats and 10 GB of storage.</CardContent>
  <CardFooter>
    <Button size="sm">Choose Starter</Button>
  </CardFooter>
</Card>`,
    linkExample: `<Card interactive>
  <CardHeader>
    <CardTitle>
      <a href="/guides/forms" className="after:absolute after:inset-0">
        Accessible forms
      </a>
    </CardTitle>
    <CardDescription>Labels, help text and errors.</CardDescription>
  </CardHeader>
</Card>`,
  },
  checkbox: {
    fieldExample: `<Field label="Terms" error={errors.terms}>
  <Checkbox name="terms" />
</Field>`,
    indeterminateExample: `<Checkbox
  checked={all}
  indeterminate={some && !all}
  onChange={() => setSelected(all ? [] : everything)}
/>`,
  },
  field: {
    renderPropExample: `<Field
  label="Email"
  description="We only use it to send the newsletter."
  error={errors.email}
  required
>
  {(control) => <input type="email" {...control} />}
</Field>`,
    childExample: `<Field label="Message" description="Up to 500 characters.">
  <textarea id="message" aria-describedby="message-policy" />
</Field>`,
  },
  "icon-button": {
    sizesExample: `<IconButton aria-label="Edit" size="icon-sm"><PencilIcon /></IconButton>
<IconButton aria-label="Edit"><PencilIcon /></IconButton>
<IconButton aria-label="Edit" size="icon-lg"><PencilIcon /></IconButton>`,
    motionExample: `<IconButton aria-label="Close dialog" motion="rotate"><XIcon /></IconButton>
<IconButton aria-label="Notifications" motion="swing"><BellIcon /></IconButton>

{/* wiggle lifts the part marked data-lid, then shakes the whole icon */}
<IconButton aria-label="Delete draft" motion="wiggle">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <g data-lid><path d="M4 7h16M9 7V4h6v3" /></g>
    <path d="M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </svg>
</IconButton>`,
    variantsExample: `<IconButton aria-label="Add item"><PlusIcon /></IconButton>
<IconButton aria-label="Add item" variant="secondary"><PlusIcon /></IconButton>
<IconButton aria-label="Close panel" variant="outline"><XIcon /></IconButton>
<IconButton aria-label="Close notice" variant="ghost"><XIcon /></IconButton>
<IconButton aria-label="Open the guide" variant="link"><BookIcon /></IconButton>
<IconButton aria-label="Delete item" variant="destructive"><TrashIcon /></IconButton>

<IconButton
  aria-label="Like"
  aria-pressed={liked}
  variant="ghost"
  onClick={() => setLiked(!liked)}
>
  <HeartIcon />
</IconButton>`,
  },
  input: {
    usageExample: `import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<Field label="Email" error={errors.email} required>
  {(control) => <Input type="email" autoComplete="email" {...control} />}
</Field>`,
    standaloneExample: `<label htmlFor="promo">Promo code</label>
<Input id="promo" aria-invalid={expired || undefined} aria-describedby="promo-error" />
<p id="promo-error">{expired ? "This code has expired." : ""}</p>`,
  },
  link: {
    externalExample: `<Link href="https://example.com/changelog" external>
  Changelog
</Link>`,
    mutedExample: `<Link href="/privacy" variant="muted">
  Privacy policy
</Link>`,
  },
  "radio-group": {
    example: `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

<RadioGroup
  legend="Delivery"
  name="delivery"
  value={delivery}
  onValueChange={setDelivery}
>
  <RadioGroupItem value="standard">Standard</RadioGroupItem>
  <RadioGroupItem value="express">Express</RadioGroupItem>
  <RadioGroupItem value="drone" disabled>
    Drone (unavailable)
  </RadioGroupItem>
</RadioGroup>`,
    requiredExample: `<RadioGroup legend="Plan" name="plan" required>
  <RadioGroupItem value="free">Free</RadioGroupItem>
  <RadioGroupItem value="pro">Pro</RadioGroupItem>
</RadioGroup>

<RadioGroup legend="Plan" defaultValue="free" disabled>
  <RadioGroupItem value="free">Free</RadioGroupItem>
  <RadioGroupItem value="pro">Pro</RadioGroupItem>
</RadioGroup>`,
  },
  select: {
    example: `import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

<Field label="Size" error={errors.size} required>
  {(control) => (
    <Select name="size" defaultValue="" {...control}>
      <option value="">Choose a size</option>
      <option value="s">Small</option>
      <option value="m">Medium</option>
    </Select>
  )}
</Field>`,
    listboxExample: `<Field label="Toppings" description="Hold Ctrl, or Cmd on a Mac, to choose several.">
  <Select name="toppings" multiple>
    <option value="cheese">Cheese</option>
    <option value="mushrooms">Mushrooms</option>
    <option value="olives">Olives</option>
  </Select>
</Field>`,
  },
  separator: {
    verticalExample: `<nav className="flex items-center gap-3">
  <a href="/docs">Docs</a>
  <Separator orientation="vertical" decorative />
  <a href="/blog">Blog</a>
</nav>`,
  },
  skeleton: {
    regionExample: `<section aria-label="Profile" aria-busy={loading || undefined}>
  {loading ? (
    <>
      <Skeleton className="size-12 rounded-full" />
      <Skeleton className="h-4 w-36" />
    </>
  ) : (
    <Profile />
  )}
</section>
{/* On the page from the start, empty. */}
<p role="status">{loaded ? "Profile loaded." : ""}</p>`,
  },
  "skip-link": {
    example: `import { SkipLink } from "@/components/ui/skip-link";

<body>
  <SkipLink />
  <header>…</header>
  <main id="main" tabIndex={-1}>…</main>
</body>`,
  },
  spinner: {
    sizeExample: `<Spinner />
<Spinner size="lg" label="Loading comments" />`,
    resultExample: `<section aria-label="Comments" aria-busy={loading || undefined}>
  {loading ? <Spinner label="Loading comments" /> : <CommentList />}
</section>
{/* On the page from the start, empty. */}
<p role="status">{loaded ? "3 comments loaded." : ""}</p>`,
  },
  switch: {
    example: `import { Switch } from "@/components/ui/switch";

<label className="flex items-center gap-2">
  <Switch
    checked={wifi}
    onChange={(event) => setWifi(event.target.checked)}
    stateLabels={{ on: "On", off: "Off" }}
  />
  Wi-Fi
</label>`,
    sizesExample: `<Switch className="w-9" />
<Switch />
<Switch className="h-8 w-14" />
<Switch className="h-10 w-16" />`,
  },
  textarea: {
    example: `import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

<Field label="Message" description="Up to 200 characters.">
  {(control) => <Textarea maxLength={200} {...control} />}
</Field>`,
    statesExample: `<Textarea rows={6} />
<Textarea aria-invalid aria-describedby="message-error" />
<Textarea readOnly defaultValue="Sent on 12 October." />
<Textarea disabled />`,
  },
} as const;
