import { cloneElement, useId, type ComponentProps, type ReactElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The props Field gives its control. Spread them onto the native element. */
interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: true;
}

/** Props Field reads from, and merges into, an element child. */
interface FieldChildProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
  required?: boolean;
}

type FieldProps = Omit<ComponentProps<"div">, "children"> & {
  /** Visible label, rendered as a `<label>` for the control. */
  label: ReactNode;
  /** Help text below the label, linked to the control with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Error message below the control. While it is set, the control gets `aria-invalid="true"` and
   * is described by the message, which shows with an icon so color is never the only signal.
   */
  error?: ReactNode;
  /** Marks the control `required` and shows "(required)" next to the label. */
  required?: boolean;
  /**
   * The one control this field labels. Either a function that receives the control props to
   * spread onto your element (`{(control) => <input {...control} />}`), or a single element,
   * which receives the same props: its own `id` is kept and its `aria-describedby` is merged.
   */
  children: ((control: FieldControlProps) => ReactNode) | ReactElement<FieldChildProps>;
};

const hasContent = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

function ErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 size-4 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16h.01" />
    </svg>
  );
}

/**
 * A label, an optional description and an optional error, wired to one control by id. It knows
 * nothing about the control, so it works with any native input, select or textarea, styled or not.
 */
function Field({
  label,
  description,
  error,
  required = false,
  className,
  children,
  ...props
}: FieldProps) {
  const baseId = useId();
  const child = typeof children === "function" ? undefined : children;
  const controlId = child?.props.id ?? `${baseId}-control`;
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;
  const hasDescription = hasContent(description);
  const invalid = hasContent(error);

  const describedBy =
    [
      hasDescription ? descriptionId : undefined,
      invalid ? errorId : undefined,
      child?.props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const control: FieldControlProps = {
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": invalid ? true : undefined,
    required: required ? true : undefined,
  };

  let rendered: ReactNode;
  if (typeof children === "function") {
    rendered = children(control);
  } else {
    // Only set what the field decides, so the child's own aria-invalid or required survive when
    // the field has no error or is not required.
    const overrides = Object.fromEntries(
      Object.entries(control).filter(([, value]) => value !== undefined),
    ) as Partial<FieldControlProps>;
    rendered = cloneElement(children, overrides);
  }

  return (
    <div className={cn("relative flex flex-col gap-2", className)} {...props}>
      <label htmlFor={controlId} className="text-sm font-semibold">
        {label}
        {required && (
          <>
            {" "}
            {/* Visible text, not color. Hidden from the name because the control's native
                required state is already announced, so screen readers do not hear it twice. */}
            <span aria-hidden="true" className="font-normal text-muted-foreground">
              (required)
            </span>
          </>
        )}
      </label>
      {hasDescription && (
        <div id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </div>
      )}
      {rendered}
      {/*
        The error region is always rendered and polite. Screen readers only announce changes to a
        live region that already exists, so inserting a fresh role="status" element together with
        its text is often missed. While empty, it is clipped out of the layout (not display: none),
        so it stays in the accessibility tree and takes no space.
      */}
      <div
        id={errorId}
        aria-live="polite"
        className="flex items-start gap-1.5 text-sm text-destructive empty:sr-only"
      >
        {invalid && (
          <>
            <ErrorIcon />
            <span>
              <span className="sr-only">Error:</span> {error}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export { Field };
export type { FieldControlProps, FieldProps };
