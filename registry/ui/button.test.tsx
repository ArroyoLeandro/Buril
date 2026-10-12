import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { Button, buttonVariants } from "./button";

const variants = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const;

describe("Button", () => {
  it("renders a native button with type=button by default", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("lets the type be overridden", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
  });

  it("applies the default variant and size", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-primary", "text-primary-foreground", "min-h-10", "rounded-full");
  });

  it.each([
    ["secondary", "bg-secondary"],
    ["outline", "border-border"],
    ["ghost", "hover:bg-accent"],
    ["link", "underline"],
    ["destructive", "bg-destructive"],
  ] as const)("applies the %s variant", (variant, expected) => {
    render(<Button variant={variant}>Label</Button>);
    expect(screen.getByRole("button")).toHaveClass(expected);
  });

  it("uses text-white on destructive in light and background text in dark", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-white", "dark:text-background");
  });

  it.each([
    ["sm", "min-h-8"],
    ["default", "min-h-10"],
    ["lg", "min-h-12"],
  ] as const)("applies the %s size", (size, expected) => {
    render(<Button size={size}>Label</Button>);
    expect(screen.getByRole("button")).toHaveClass(expected);
  });

  it("shows a visible focus indicator with the ring token and an offset", () => {
    render(<Button>Focus</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "focus-visible:outline-2",
      "focus-visible:outline-offset-2",
      "focus-visible:outline-ring",
    );
  });

  it("keeps borders visible in forced-colors mode", () => {
    render(<Button>Contrast</Button>);
    expect(screen.getByRole("button")).toHaveClass("border", "forced-colors:border-current");
  });

  it("uses the native disabled attribute and does not fire onClick", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Off
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Off" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when enabled", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe("loading", () => {
    it("exposes aria-busy and aria-disabled without the disabled attribute", () => {
      render(<Button loading>Save</Button>);
      const button = screen.getByRole("button", { name: "Save" });
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toBeDisabled();
    });

    it("does not set busy state when idle", () => {
      render(<Button>Save</Button>);
      const button = screen.getByRole("button");
      expect(button).not.toHaveAttribute("aria-busy");
      expect(button).not.toHaveAttribute("aria-disabled");
    });

    it("blocks onClick", async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("blocks form submission", async () => {
      const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit" loading>
            Save
          </Button>
        </form>,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    // Contract: loading blocks every activation path, including implicit submission, because
    // the browser dispatches a click on the form's default submit button when Enter is pressed
    // in a text field, and that click reaches our handler.
    it("blocks implicit submission when Enter is pressed in a form input", async () => {
      const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <label>
            Name
            <input type="text" />
          </label>
          <Button type="submit" loading>
            Save
          </Button>
        </form>,
      );
      await userEvent.type(screen.getByLabelText("Name"), "Ada{Enter}");
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submits implicitly again once loading ends", async () => {
      const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
      const form = (loading: boolean) => (
        <form onSubmit={onSubmit}>
          <label>
            Name
            <input type="text" />
          </label>
          <Button type="submit" loading={loading}>
            Save
          </Button>
        </form>
      );
      const { rerender } = render(form(true));
      await userEvent.type(screen.getByLabelText("Name"), "Ada{Enter}");
      expect(onSubmit).not.toHaveBeenCalled();

      rerender(form(false));
      await userEvent.type(screen.getByLabelText("Name"), "{Enter}");
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("blocks activation from the keyboard while loading", async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      );
      await userEvent.tab();
      expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard(" ");
      expect(onClick).not.toHaveBeenCalled();
    });

    it("stays focusable", async () => {
      render(<Button loading>Save</Button>);
      await userEvent.tab();
      expect(screen.getByRole("button")).toHaveFocus();
    });

    it("renders a hidden spinner that respects reduced motion and keeps the name", () => {
      render(<Button loading>Save</Button>);
      const spinner = screen.getByRole("button").querySelector("svg");
      expect(spinner).toHaveAttribute("aria-hidden", "true");
      expect(spinner).toHaveClass("motion-safe:animate-spin");
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("renders no spinner when idle", () => {
      render(<Button>Save</Button>);
      expect(screen.getByRole("button").querySelector("svg")).toBeNull();
    });
  });

  it("forwards ref to the button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("forwards props and merges className", () => {
    render(
      <Button aria-label="Close dialog" data-testid="close" className="px-2">
        X
      </Button>,
    );
    const button = screen.getByTestId("close");
    expect(button).toHaveAccessibleName("Close dialog");
    expect(button).toHaveClass("px-2");
    expect(button).not.toHaveClass("px-6");
  });

  describe("accessibility", () => {
    it.each(variants)("has no axe violations for the %s variant", async (variant) => {
      const { container } = render(<Button variant={variant}>Label</Button>);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations while loading or disabled", async () => {
      const { container } = render(
        <>
          <Button loading>Saving</Button>
          <Button disabled>Off</Button>
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

describe("buttonVariants", () => {
  it("styles a real anchor so links stay links", () => {
    render(
      <a href="/docs" className={buttonVariants({ variant: "outline", size: "lg" })}>
        Docs
      </a>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("border-border", "min-h-12", "rounded-full");
    // The cascade outcome (a visible border, no transparent override) is covered by
    // button.styles.test.ts, which compiles these classes with Tailwind.
    expect(link).not.toHaveClass("border-transparent");
  });
});
