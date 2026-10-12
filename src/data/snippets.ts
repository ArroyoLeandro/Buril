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
  },
  input: {
    usageExample: `import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<Field label="Email" error={errors.email} required>
  {(control) => <Input type="email" autoComplete="email" {...control} />}
</Field>`,
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
  },
  textarea: {
    example: `import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

<Field label="Message" description="Up to 200 characters.">
  {(control) => <Textarea maxLength={200} {...control} />}
</Field>`,
  },
} as const;
