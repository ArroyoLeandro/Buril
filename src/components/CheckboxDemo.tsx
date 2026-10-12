import { useState } from "react";

import { Checkbox } from "../../registry/ui/checkbox";

const toppings = ["Cheese", "Mushrooms", "Olives"];

// Each label is a flex row at least 24px tall, so the whole row is the click target.
const row = "flex min-h-6 items-center gap-2";

/** A "select all" parent that turns mixed when only some toppings are checked. */
export default function CheckboxDemo() {
  const [selected, setSelected] = useState<string[]>(["Cheese"]);
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
        <legend className="mb-2 text-sm font-semibold">Toppings</legend>
        <label className={row}>
          <Checkbox
            checked={all}
            indeterminate={some}
            onChange={() => setSelected(all ? [] : toppings)}
          />
          All toppings
        </label>
        <div className="flex flex-col gap-2 pl-7">
          {toppings.map((topping) => (
            <label key={topping} className={row}>
              <Checkbox checked={selected.includes(topping)} onChange={() => toggle(topping)} />
              {topping}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={`${row} text-muted-foreground`}>
        <Checkbox disabled />
        Gift wrap (unavailable)
      </label>
    </div>
  );
}
