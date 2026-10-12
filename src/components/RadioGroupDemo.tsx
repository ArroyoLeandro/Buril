import { useState } from "react";

import { RadioGroup, RadioGroupItem } from "../../registry/ui/radio-group";

const options = [
  { value: "standard", name: "Standard", detail: "3 to 5 days" },
  { value: "express", name: "Express", detail: "next day" },
  { value: "pickup", name: "Pickup", detail: "from the shop" },
];

/** A controlled group: the summary below follows the choice, by mouse or keyboard. */
export default function RadioGroupDemo() {
  const [delivery, setDelivery] = useState("standard");
  const chosen = options.find((option) => option.value === delivery)!;

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup legend="Delivery" name="delivery" value={delivery} onValueChange={setDelivery}>
        {options.map(({ value, name, detail }) => (
          <RadioGroupItem key={value} value={value}>
            {name}, <span className="text-muted-foreground">{detail}</span>
          </RadioGroupItem>
        ))}
        <RadioGroupItem value="drone" disabled>
          Drone (unavailable)
        </RadioGroupItem>
      </RadioGroup>
      <p className="text-sm">
        Delivery: {chosen.name}, {chosen.detail}.
      </p>
    </div>
  );
}
