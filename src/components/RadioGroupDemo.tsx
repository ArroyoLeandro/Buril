import { useState } from "react";

import { RadioGroup, RadioGroupItem } from "../../registry/ui/radio-group";
import { demoTranslator } from "../i18n/demos";
import type { Locale } from "../i18n/ui";

interface Props {
  /** Language of the legend, the options and the summary. */
  locale?: Locale;
}

/** A controlled group: the summary below follows the choice, by mouse or keyboard. */
export default function RadioGroupDemo({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const options = [
    { value: "standard", name: t("Standard"), detail: t("3 to 5 days") },
    { value: "express", name: t("Express"), detail: t("next day") },
    { value: "pickup", name: t("Pickup"), detail: t("from the shop") },
  ];
  const [delivery, setDelivery] = useState("standard");
  const chosen = options.find((option) => option.value === delivery)!;

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        legend={t("Delivery")}
        name="delivery"
        value={delivery}
        onValueChange={setDelivery}
      >
        {options.map(({ value, name, detail }) => (
          <RadioGroupItem key={value} value={value}>
            {name}, <span className="text-muted-foreground">{detail}</span>
          </RadioGroupItem>
        ))}
        <RadioGroupItem value="drone" disabled>
          {t("Drone (unavailable)")}
        </RadioGroupItem>
      </RadioGroup>
      <p className="text-sm">
        {t("Delivery: {name}, {detail}.", { name: chosen.name, detail: chosen.detail })}
      </p>
    </div>
  );
}
