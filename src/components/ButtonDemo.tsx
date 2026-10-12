import { useState } from "react";

import { Button, buttonVariants } from "../../registry/ui/button";
import { demoHref, demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

const variants = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const;
const sizes = ["sm", "default", "lg"] as const;

interface Props {
  /** Language of the labels, messages and announcements. */
  locale?: Locale;
}

export default function ButtonDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const href = demoHref(locale);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggleLoading = () => {
    setMessage(loading ? t("Changes saved.") : t("Saving changes…"));
    setLoading(!loading);
  };

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="demo-variants" className="flex flex-col gap-3">
        <h3 id="demo-variants" className="text-sm font-semibold">
          {t("Variants")}
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
          {t("Sizes")}
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
          {t("Loading")}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button loading={loading}>{t("Save changes")}</Button>
          <Button variant="outline" onClick={toggleLoading}>
            {loading ? t("Stop loading") : t("Start loading")}
          </Button>
        </div>
        {/* Always rendered, so screen readers notice when its text changes. */}
        <p role="status" className="min-h-5 text-sm">
          {message}
        </p>
        <p className="text-sm text-muted-foreground">
          {t(
            "The loading button stays focusable and keeps its name. The status message above announces progress, because screen readers generally do not announce",
          )}{" "}
          <code>aria-busy</code> {t("on a button.")}
        </p>
      </section>

      <section aria-labelledby="demo-disabled" className="flex flex-col gap-3">
        <h3 id="demo-disabled" className="text-sm font-semibold">
          {t("Disabled")}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>{t("Disabled")}</Button>
          <Button variant="outline" disabled>
            {t("Disabled")}
          </Button>
        </div>
      </section>

      <section aria-labelledby="demo-link" className="flex flex-col gap-3">
        <h3 id="demo-link" className="text-sm font-semibold">
          {t("As a link")}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <a href={href("/")} className={buttonVariants({ variant: "secondary" })}>
            {t("Back home")}
          </a>
        </div>
      </section>
    </div>
  );
}
