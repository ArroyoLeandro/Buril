import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import SpinnerDemo from "./SpinnerDemo";

describe("SpinnerDemo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the three sizes, each named by what it loads", () => {
    render(<SpinnerDemo />);
    for (const name of ["Loading files", "Loading photos", "Loading videos"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("shows a spinner while comments load, then the comments and a status message", () => {
    vi.useFakeTimers();
    render(<SpinnerDemo />);
    const message = screen.getByTestId("comments-status");
    expect(message).toHaveAttribute("role", "status");
    expect(message).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole("button", { name: "Load comments" }));
    const region = screen.getByRole("region", { name: "Comments" });
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(within(region).getByRole("status")).toHaveTextContent("Loading comments");

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(region).not.toHaveAttribute("aria-busy");
    expect(within(region).queryByRole("status")).toBeNull();
    expect(within(region).getAllByRole("listitem")).toHaveLength(3);
    expect(message).toHaveTextContent("3 comments loaded.");
  });

  it("clears its pending timer when it unmounts", () => {
    vi.useFakeTimers();
    const { unmount } = render(<SpinnerDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Load comments" }));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("has no axe violations", async () => {
    const { container } = render(<SpinnerDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
