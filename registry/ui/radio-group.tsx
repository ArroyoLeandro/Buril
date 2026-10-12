"use client";

import { createContext, useContext, useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  name: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

type RadioGroupProps = Omit<ComponentProps<"fieldset">, "onChange" | "defaultValue"> & {
  /** Visible group label, rendered as the `<legend>`: it is the group's accessible name. */
  legend: ReactNode;
  /** Shared `name` of the radios, which forms submit. Generated when omitted. */
  name?: string;
  /** The checked value, for a controlled group. Update it from `onValueChange`. */
  value?: string;
  /** The value checked at first, for an uncontrolled group. */
  defaultValue?: string;
  /** Called with the value of the radio the user checks. */
  onValueChange?: (value: string) => void;
  /** Marks every radio `required`, so a form cannot submit without a choice. */
  required?: boolean;
};

/**
 * A `<fieldset>` of native radios. The browser provides the keyboard model: the group is one Tab
 * stop (the checked radio, or the first one), and the arrow keys move focus and the choice.
 * `disabled` disables every radio through the fieldset.
 */
function RadioGroup({
  legend,
  name,
  value,
  defaultValue,
  onValueChange,
  required,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const generatedName = useId();

  return (
    <RadioGroupContext
      value={{ name: name ?? generatedName, value, defaultValue, required, onValueChange }}
    >
      <fieldset className={cn("min-w-0", className)} {...props}>
        <legend className="mb-2 text-sm font-semibold">{legend}</legend>
        <div className="flex flex-col gap-2">{children}</div>
      </fieldset>
    </RadioGroupContext>
  );
}

type RadioGroupItemProps = Omit<
  ComponentProps<"input">,
  "type" | "name" | "value" | "checked" | "defaultChecked" | "children"
> & {
  /** The value the group reports and the form submits when this radio is checked. */
  value: string;
  /** The visible label. Clicking it checks the radio. */
  children: ReactNode;
};

/**
 * One radio and its label. `className` styles the label row; `ref` and the other props go to the
 * `<input>`.
 */
function RadioGroupItem({ value, className, children, onChange, ...props }: RadioGroupItemProps) {
  const group = useContext(RadioGroupContext);
  if (!group) throw new Error("RadioGroupItem must be used inside a RadioGroup.");
  const checkedProps =
    group.value === undefined
      ? { defaultChecked: group.defaultValue === value }
      : { checked: group.value === value };

  return (
    <label
      className={cn(
        // At least 24px tall (rule 8): the whole row, text included, is the click target.
        "flex min-h-6 cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className,
      )}
    >
      <input
        type="radio"
        name={group.name}
        value={value}
        required={group.required}
        {...checkedProps}
        onChange={(event) => {
          onChange?.(event);
          if (event.target.checked) group.onValueChange?.(value);
        }}
        className={cn(
          "size-5 shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-background",
          // Checked: a primary fill behind an inset ring in the background color leaves a dot.
          "checked:border-primary checked:bg-primary checked:inset-ring-4 checked:inset-ring-background",
          // Visible focus (rule 4): outline stays visible in forced-colors mode, unlike a shadow ring.
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed aria-invalid:border-destructive",
          // Forced colors drop the fill and the ring, so the system draws the native radio instead.
          "forced-colors:appearance-auto",
        )}
        {...props}
      />
      <span>{children}</span>
    </label>
  );
}

export { RadioGroup, RadioGroupItem };
export type { RadioGroupItemProps, RadioGroupProps };
