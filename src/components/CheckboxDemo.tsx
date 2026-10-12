import { useState } from "react";

import { Checkbox } from "../../registry/ui/checkbox";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

const toppings = ["cheese", "mushrooms", "olives"];

// Each label is a flex row at least 24px tall, so the whole row is the click target.
const row = "flex min-h-6 items-center gap-2";

interface Props {
  /** Language of the labels. */
  locale?: Locale;
}

/** A "select all" parent that turns mixed when only some toppings are checked. */
export default function CheckboxDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const names: Record<string, string> = {
    cheese: t("Cheese"),
    mushrooms: t("Mushrooms"),
    olives: t("Olives"),
  };
  const [selected, setSelected] = useState<string[]>(["cheese"]);
  const all = selected.length === toppings.length;
  const some = selected.length > 0 && !all;

  const toggle = (topping: string) =>
    setSelected((current) =>
      current.includes(topping)
        ? current.filter((item) => item !== topping)
        : toppings.filter((item) => item === topping || current.includes(item)),
    );

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">{t("Toppings")}</legend>
        <label className={row}>
          <Checkbox
            checked={all}
            indeterminate={some}
            onChange={() => setSelected(all ? [] : toppings)}
          />
          {t("All toppings")}
        </label>
        <div className="flex flex-col gap-2 pl-7">
          {toppings.map((topping) => (
            <label key={topping} className={row}>
              <Checkbox checked={selected.includes(topping)} onChange={() => toggle(topping)} />
              {names[topping]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={`${row} text-muted-foreground`}>
        <Checkbox disabled />
        {t("Gift wrap (unavailable)")}
      </label>
    </div>
  );
}
