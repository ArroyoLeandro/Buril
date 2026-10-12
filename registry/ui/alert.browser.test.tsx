import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { settle } from "../../test/browser";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert in a real browser", () => {
  it.each(["default", "destructive"] as const)(
    "fades the %s alert in and ends fully opaque",
    async (variant) => {
      const screen = await render(
        <Alert variant={variant}>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>Your changes are saved.</AlertDescription>
        </Alert>,
      );
      const alert = screen.getByText("Saved").element().parentElement!;
      expect(alert.getAnimations().length).toBeGreaterThan(0);
      await settle();
      expect(getComputedStyle(alert).opacity).toBe("1");
    },
  );
});
