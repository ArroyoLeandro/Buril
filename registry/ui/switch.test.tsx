import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";

import { Field } from "./field";
import { Switch } from "./switch";

function WiFi(props: Parameters<typeof Switch>[0]) {
  return (
    <label className="flex items-center gap-2">
      <Switch {...props} /> Wi-Fi
    </label>
  );
}

describe("Switch", () => {
  it("is a native checkbox with the switch role, named by its label", () => {
    render(<WiFi />);
    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(control.tagName).toBe("INPUT");
    expect(control).toHaveAttribute("type", "checkbox");
  });

  it("reports its state from the native checked property, without an aria-checked attribute", () => {
    render(<WiFi defaultChecked />);
    const control = screen.getByRole("switch", { name: "Wi-Fi", checked: true });
    expect(control).toBeChecked();
    // ARIA in HTML: authors should not set aria-checked on a checkbox input; checked maps to it.
    expect(control).not.toHaveAttribute("aria-checked");
  });

  it("turns on and off with a click on its label", async () => {
    render(<WiFi />);
    const control = screen.getByRole("switch");
    await userEvent.click(screen.getByText("Wi-Fi"));
    expect(control).toBeChecked();
    await userEvent.click(screen.getByText("Wi-Fi"));
    expect(control).not.toBeChecked();
  });

  it("toggles with Space", async () => {
    const onChange = vi.fn();
    render(<WiFi onChange={onChange} />);
    await userEvent.tab();
    expect(screen.getByRole("switch")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("switch", { checked: true })).toBeInTheDocument();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("switch", { checked: false })).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("works controlled", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<WiFi checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("switch")).not.toBeChecked();
    rerender(<WiFi checked onChange={onChange} />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("can be disabled", async () => {
    render(<WiFi disabled />);
    const control = screen.getByRole("switch");
    expect(control).toBeDisabled();
    await userEvent.click(control);
    expect(control).not.toBeChecked();
  });

  it("keeps the thumb in the track when the track is resized", () => {
    const { container } = render(<WiFi className="h-8 w-14" />);
    const thumb = container.querySelector("[data-thumb]")!;
    // No fixed size or travel: the thumb is sized and moved from the track box.
    expect(thumb.className).not.toMatch(/\bsize-\d|\btranslate-x-\d/);
    expect(screen.getByRole("switch")).toHaveClass("h-8", "w-14");
  });

  it("hides the thumb from assistive technology", () => {
    const { container } = render(<WiFi />);
    const thumb = container.querySelector("[data-thumb]");
    expect(thumb).toHaveAttribute("aria-hidden", "true");
  });

  describe("state labels", () => {
    it("renders the on and off text without adding it to the name", () => {
      render(<WiFi stateLabels={{ on: "On", off: "Off" }} />);
      expect(screen.getByRole("switch", { name: "Wi-Fi" })).toBeInTheDocument();
      expect(screen.getByText("On")).toHaveAttribute("aria-hidden", "true");
      expect(screen.getByText("Off")).toHaveAttribute("aria-hidden", "true");
    });

    it("renders no state text by default", () => {
      render(<WiFi />);
      expect(screen.queryByText("On")).toBeNull();
      expect(screen.queryByText("Off")).toBeNull();
    });
  });

  it("forwards ref and merges className onto the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<WiFi ref={ref} className="border-border" />);
    expect(ref.current).toBe(screen.getByRole("switch"));
    expect(ref.current).toHaveClass("border-border", "appearance-none");
    expect(ref.current).not.toHaveClass("border-input");
  });

  it("is labelled and described by a Field", () => {
    render(
      <Field label="Dark mode" description="Follows the system when off.">
        <Switch />
      </Field>,
    );
    expect(screen.getByRole("switch", { name: "Dark mode" })).toHaveAccessibleDescription(
      "Follows the system when off.",
    );
  });

  describe("invalid", () => {
    it("reports aria-invalid on the switch itself", () => {
      render(<WiFi aria-invalid="true" />);
      const control = screen.getByRole("switch", { name: "Wi-Fi" });
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(control).toBeInvalid();
    });

    it("is marked invalid and described by a Field error", () => {
      render(
        <Field label="Terms of service" error="Accept the terms to continue.">
          <Switch />
        </Field>,
      );
      const control = screen.getByRole("switch", { name: "Terms of service" });
      expect(control).toBeInvalid();
      expect(control).toHaveAccessibleDescription("Error: Accept the terms to continue.");
    });

    it("has no axe violations", async () => {
      const { container } = render(<WiFi aria-invalid="true" />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("accessibility", () => {
    it("has no axe violations, off and on", async () => {
      const { container } = render(
        <>
          <WiFi stateLabels={{ on: "On", off: "Off" }} />
          <label>
            <Switch defaultChecked /> Bluetooth
          </label>
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
