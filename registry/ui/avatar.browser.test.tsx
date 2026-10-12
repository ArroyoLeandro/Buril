import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { settle } from "../../test/browser";
import { Avatar } from "./avatar";

// A 2x2 opaque PNG, so the image loads without the network.
const picture =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR42mNk+M9QzwAEjDAGNzYAAG5qBf8ZQ+7HAAAAAElFTkSuQmCC";

describe("Avatar in a real browser", () => {
  it("fades the picture in over the initials and ends with the picture fully opaque", async () => {
    const screen = await render(<Avatar src={picture} alt="Ada Lovelace" />);
    const image = screen.getByRole("img", { name: "Ada Lovelace" }).element() as HTMLImageElement;
    await expect.poll(() => image.complete && image.naturalWidth > 0).toBe(true);
    await settle();
    const initials = image.nextElementSibling!;
    expect(image.hasAttribute("data-loading")).toBe(false);
    expect(getComputedStyle(image).opacity).toBe("1");
    expect(getComputedStyle(initials).opacity).toBe("0");
  });
});
