import { Link } from "../../registry/ui/link";
import { Separator } from "../../registry/ui/separator";

/** A semantic separator between two sections, and decorative dividers between links in a row. */
export default function SeparatorDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <div>
        <p className="font-semibold">Buril UI</p>
        <p className="text-sm text-muted-foreground">Accessible components you copy and own.</p>
      </div>
      <Separator />
      <nav aria-label="Project" className="flex min-h-6 items-center gap-3 text-sm">
        <Link href="/components/button">Docs</Link>
        {/* The links are already separate items; the lines only decorate. */}
        <Separator orientation="vertical" decorative />
        <Link href="/components/link">Components</Link>
        <Separator orientation="vertical" decorative />
        <Link href="/">Home</Link>
      </nav>
    </div>
  );
}
