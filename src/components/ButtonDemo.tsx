import { useState } from "react";

import { Button, buttonVariants } from "../../registry/ui/button";

const variants = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const;
const sizes = ["sm", "default", "lg"] as const;

export default function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggleLoading = () => {
    setMessage(loading ? "Changes saved." : "Saving changes…");
    setLoading(!loading);
  };

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="demo-variants" className="flex flex-col gap-3">
        <h3 id="demo-variants" className="text-sm font-semibold">
          Variants
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </section>

      <section aria-labelledby="demo-sizes" className="flex flex-col gap-3">
        <h3 id="demo-sizes" className="text-sm font-semibold">
          Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((size) => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
        </div>
      </section>

      <section aria-labelledby="demo-loading" className="flex flex-col gap-3">
        <h3 id="demo-loading" className="text-sm font-semibold">
          Loading
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button loading={loading}>Save changes</Button>
          <Button variant="outline" onClick={toggleLoading}>
            {loading ? "Stop loading" : "Start loading"}
          </Button>
        </div>
        {/* Always rendered, so screen readers notice when its text changes. */}
        <p role="status" className="min-h-5 text-sm">
          {message}
        </p>
        <p className="text-sm text-muted-foreground">
          The loading button stays focusable and keeps its name. The status message above announces
          progress, because screen readers generally do not announce <code>aria-busy</code> on a
          button.
        </p>
      </section>

      <section aria-labelledby="demo-disabled" className="flex flex-col gap-3">
        <h3 id="demo-disabled" className="text-sm font-semibold">
          Disabled
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <section aria-labelledby="demo-link" className="flex flex-col gap-3">
        <h3 id="demo-link" className="text-sm font-semibold">
          As a link
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/" className={buttonVariants({ variant: "secondary" })}>
            Back home
          </a>
        </div>
      </section>
    </div>
  );
}
