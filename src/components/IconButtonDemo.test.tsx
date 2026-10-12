import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import IconButtonDemo from "./IconButtonDemo";

describe("IconButtonDemo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("names every button by its action", () => {
    render(<IconButtonDemo />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-label");
      expect(button.getAttribute("aria-label")).not.toBe("");
    }
  });

  it("shows loading on Refresh, announces it, then settles", () => {
    vi.useFakeTimers();
    render(<IconButtonDemo />);
    const refresh = screen.getByRole("button", { name: "Refresh results" });
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");

    fireEvent.click(refresh);
    expect(refresh).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Refreshing results…");

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(refresh).not.toHaveAttribute("aria-busy");
    expect(status).toHaveTextContent("");
  });

  it("clears its pending timer when it unmounts", () => {
    vi.useFakeTimers();
    const { unmount } = render(<IconButtonDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Refresh results" }));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("has no axe violations", async () => {
    const { container } = render(<IconButtonDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
