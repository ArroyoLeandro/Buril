import { Link } from "../../registry/ui/link";

export default function LinkDemo() {
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="demo-link-variants" className="flex flex-col gap-3">
        <h3 id="demo-link-variants" className="text-sm font-semibold">
          Variants
        </h3>
        <p>
          Read the <Link href="/components/button">Button docs</Link> first.
        </p>
        <p className="text-sm text-muted-foreground">
          Muted links suit secondary text, such as a{" "}
          <Link href="/" variant="muted">
            footer link
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="demo-link-external" className="flex flex-col gap-3">
        <h3 id="demo-link-external" className="text-sm font-semibold">
          Opens in a new tab
        </h3>
        <p>
          Buril follows the{" "}
          <Link href="https://www.w3.org/WAI/ARIA/apg/patterns/link/" external>
            APG link pattern
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
