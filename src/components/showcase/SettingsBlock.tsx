import { useId, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { Checkbox } from "../../../registry/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../registry/ui/radio-group";
import { Separator } from "../../../registry/ui/separator";
import { Switch } from "../../../registry/ui/switch";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";
import { fadeBottom } from "./fade";

interface Props {
  /** Language of the labels. */
  locale?: Locale;
}

/** A setting: its label and description on the left, the control on the right or before it. */
function Option({
  id,
  label,
  description,
  control,
  before = false,
}: {
  id: string;
  label: ReactNode;
  description: ReactNode;
  control: ReactNode;
  before?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-3", !before && "justify-between gap-4")}>
      {before && control}
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-semibold">
          {label}
        </label>
        <p id={`${id}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {!before && control}
    </div>
  );
}

/**
 * The settings stage: a notifications Card in front, a plan picker receding behind it. The
 * Switches and the Checkbox are native inputs, so they work as static HTML. Everything that fades,
 * the plan card and the rows at the bottom, is a copy: inert and hidden.
 */
export default function SettingsBlock({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const id = useId();
  const plans = [
    { value: "hobby", name: t("Hobby"), price: "$0" },
    { value: "pro", name: t("Pro"), price: "$12" },
    { value: "team", name: t("Team"), price: "$40" },
  ];

  return (
    <div
      data-fade
      style={{ "--fade": "72px" } as CSSProperties}
      className={cn("relative -mx-5 mt-4 -mb-5 min-h-0 flex-1", fadeBottom)}
    >
      <div
        inert
        aria-hidden="true"
        className="absolute end-6 top-0 hidden w-[min(320px,50%)] [mask-image:linear-gradient(to_left,#000_40%,transparent)] opacity-55 sm:block rtl:[mask-image:linear-gradient(to_right,#000_40%,transparent)]"
      >
        <Card className="py-4">
          <CardContent className="px-4">
            <RadioGroup legend={t("Plan")} name={`${id}-plan`} defaultValue="pro">
              {plans.map((plan) => (
                <RadioGroupItem
                  key={plan.value}
                  value={plan.value}
                  className="rounded-md border border-input p-3 text-sm font-semibold has-checked:border-primary has-checked:bg-accent [&>span]:flex [&>span]:flex-1 [&>span]:justify-between"
                >
                  {plan.name}
                  <span className="font-normal">
                    {plan.price}
                    {plan.value !== "hobby" && (
                      <small className="text-muted-foreground">{t("/mo")}</small>
                    )}
                  </span>
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
      <Card
        decor
        className="relative z-10 mx-auto w-[min(100%-2.5rem,400px)] sm:ms-6 sm:me-0 sm:mt-10"
      >
        <CardHeader>
          <CardTitle as="h4">{t("Notifications")}</CardTitle>
          <CardDescription>{t("Choose what reaches you.")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Option
            id={`${id}-comments`}
            label={t("Comments")}
            description={t("Replies and mentions.")}
            control={
              <Switch
                id={`${id}-comments`}
                aria-describedby={`${id}-comments-description`}
                defaultChecked
              />
            }
          />
          <Option
            id={`${id}-reviews`}
            label={t("Review requests")}
            description={t("When someone asks for your review.")}
            control={<Switch id={`${id}-reviews`} aria-describedby={`${id}-reviews-description`} />}
          />
          <Separator />
          <Option
            before
            id={`${id}-digest`}
            label={t("Daily digest")}
            description={t("One email at 9:00.")}
            control={
              <Checkbox
                id={`${id}-digest`}
                aria-describedby={`${id}-digest-description`}
                defaultChecked
              />
            }
          />
        </CardContent>
        <CardContent
          inert
          aria-hidden="true"
          className="flex flex-col items-start gap-4 [mask-image:linear-gradient(to_bottom,#000,transparent_85%)]"
        >
          <div className="flex items-start gap-3">
            <Checkbox />
            <div className="text-sm">
              <p className="font-semibold">{t("Push")}</p>
              <p className="text-muted-foreground">{t("On your phone.")}</p>
            </div>
          </div>
          <Button size="sm">{t("Save")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
