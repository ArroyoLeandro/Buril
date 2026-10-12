import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import SkeletonDemo from "./SkeletonDemo";

describe("SkeletonDemo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with the loaded profile and an empty status region", () => {
    render(<SkeletonDemo />);
    const profile = screen.getByRole("region", { name: "Profile" });
    expect(profile).not.toHaveAttribute("aria-busy");
    expect(profile).toHaveTextContent("Ada Lovelace");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("marks the profile busy behind hidden placeholders, then announces it loaded", () => {
    vi.useFakeTimers();
    render(<SkeletonDemo />);
    const profile = screen.getByRole("region", { name: "Profile" });
    fireEvent.click(screen.getByRole("button", { name: "Reload profile" }));

    expect(profile).toHaveAttribute("aria-busy", "true");
    expect(profile).not.toHaveTextContent("Ada Lovelace");
    const placeholders = profile.querySelectorAll("[data-slot=skeleton]");
    expect(placeholders.length).toBeGreaterThan(0);
    for (const placeholder of placeholders) {
      expect(placeholder).toHaveAttribute("aria-hidden", "true");
    }

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(profile).not.toHaveAttribute("aria-busy");
    expect(profile).toHaveTextContent("Ada Lovelace");
    expect(screen.getByRole("status")).toHaveTextContent("Profile loaded.");
  });

  it("clears its pending timer when it unmounts", () => {
    vi.useFakeTimers();
    const { unmount } = render(<SkeletonDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Reload profile" }));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("has no axe violations, loaded and loading", async () => {
    const { container } = render(<SkeletonDemo />);
    expect(await axe(container)).toHaveNoViolations();
    fireEvent.click(screen.getByRole("button", { name: "Reload profile" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
