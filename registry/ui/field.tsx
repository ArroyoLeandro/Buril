"use client";

import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

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
  /**
   * Marks the control `required` and shows "(required)" next to the label. If the rendered control
   * ends up neither `required` nor `aria-required`, the marker joins the label's accessible name so
   * the requirement is still announced, and development builds warn.
   */
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

const isDevelopment = typeof process !== "undefined" && process.env.NODE_ENV !== "production";

/** Whether the element reports a requirement, natively or through ARIA. */
const reportsRequired = (element: HTMLElement) =>
  (element as HTMLInputElement).required === true ||
  element.getAttribute("aria-required") === "true";

/**
 * The marker is hidden from screen readers because the control normally announces its own
 * required state. When a render prop drops the `required` prop, nothing would announce it. After
 * every commit this checks the rendered control and, if it does not report the requirement, lets
 * screen readers read the marker as part of the label.
 */
function useRequirementFallback(controlId: string) {
  const marker = useRef<HTMLSpanElement>(null);
  const warned = useRef(false);

  // No dependency list: the control is the consumer's markup and can change on any render.
  useEffect(() => {
    // The marker only renders when the field is required.
    if (!marker.current) return;
    // The root node, so it also works inside a shadow root.
    const root = marker.current.getRootNode();
    if (!(root instanceof Document || root instanceof ShadowRoot)) return;
    const control = root.getElementById(controlId);
    const lost = control !== null && !reportsRequired(control);
    // A direct DOM update: React renders aria-hidden="true" and never changes it, so it keeps
    // whatever this sets.
    if (lost) marker.current.removeAttribute("aria-hidden");
    else marker.current.setAttribute("aria-hidden", "true");
    if (lost && isDevelopment && !warned.current) {
      warned.current = true;
      console.warn(
        `Field: "required" is set, but the control with id "${controlId}" is not required. ` +
          "Spread every prop the render function receives onto the control, including " +
          '"required", or set "aria-required" on a custom control. Until then the label reads ' +
          '"(required)" to screen readers.',
      );
    }
  });

  return marker;
}

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
  const requiredMarker = useRequirementFallback(controlId);

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
                required state is already announced, so screen readers do not hear it twice,
                unless the control turned out not to be required. */}
            <span
              ref={requiredMarker}
              aria-hidden="true"
              className="font-normal text-muted-foreground"
            >
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
        {/* The content is inserted into the region, so it fades in from its starting style, and
            drops 2px into place only when the user allows motion. */}
        {invalid && (
          <span className="flex items-start gap-1.5 transition-[opacity,translate] duration-(--buril-duration-fast,200ms) ease-(--buril-ease-out,linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1)) starting:opacity-0 motion-safe:starting:-translate-y-0.5">
            <ErrorIcon />
            <span>
              <span className="sr-only">Error:</span> {error}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

export { Field };
export type { FieldControlProps, FieldProps };
