import { Button } from "../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../registry/ui/card";

/** A plan card with the decor band and a footer action, and an article card that is one link. */
export default function CardDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card decor>
        <CardHeader>
          <CardTitle>Starter plan</CardTitle>
          <CardDescription>For a single project.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm">
            <li>Three seats</li>
            <li>10 GB of storage</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button size="sm">Choose Starter</Button>
        </CardFooter>
      </Card>

      {/* The whole card is clickable through one real link, stretched from the title. */}
      <Card className="hover:bg-muted">
        <CardHeader>
          <CardTitle>
            <a
              href="/components/field"
              className="rounded-xs underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Accessible forms
            </a>
          </CardTitle>
          <CardDescription>Labels, help text and errors, wired by the Field.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">Read the guide</CardContent>
      </Card>
    </div>
  );
}
