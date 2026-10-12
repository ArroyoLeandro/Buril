import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ButtonDemo from "./ButtonDemo";

describe("ButtonDemo loading example", () => {
  it("announces progress through a status region that exists before the message", async () => {
    render(<ButtonDemo />);
    // The region is in the DOM from the start, so screen readers pick up later changes.
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");

    await userEvent.click(screen.getByRole("button", { name: "Start loading" }));
    expect(screen.getByRole("button", { name: "Save changes" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(status).toHaveTextContent("Saving changes…");

    await userEvent.click(screen.getByRole("button", { name: "Stop loading" }));
    expect(status).toHaveTextContent("Changes saved.");
  });

  it("keeps the live region outside the button", async () => {
    render(<ButtonDemo />);
    await userEvent.click(screen.getByRole("button", { name: "Start loading" }));
    const save = screen.getByRole("button", { name: "Save changes" });
    expect(within(save).queryByRole("status")).toBeNull();
    expect(save.querySelector("[aria-live]")).toBeNull();
  });
});
