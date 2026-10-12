import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Avatar, initialsOf } from "./avatar";

describe("Avatar", () => {
  describe("with an image", () => {
    it("renders the image with its alt text as the name", () => {
      render(<Avatar src="/ada.png" alt="Ada Lovelace" />);
      const image = screen.getByRole("img", { name: "Ada Lovelace" });
      expect(image.tagName).toBe("IMG");
      expect(image).toHaveAttribute("src", "/ada.png");
    });

    it("falls back to initials when the image fails to load", () => {
      render(<Avatar src="/missing.png" alt="Ada Lovelace" />);
      fireEvent.error(screen.getByRole("img"));
      const fallback = screen.getByRole("img", { name: "Ada Lovelace" });
      expect(fallback.tagName).toBe("SPAN");
      expect(fallback).toHaveTextContent("AL");
      expect(document.querySelector("img")).toBeNull();
    });

    it("tries a new src again after an earlier one failed", () => {
      const { rerender } = render(<Avatar src="/missing.png" alt="Ada Lovelace" />);
      fireEvent.error(screen.getByRole("img"));
      rerender(<Avatar src="/ada.png" alt="Ada Lovelace" />);
      expect(screen.getByRole("img", { name: "Ada Lovelace" }).tagName).toBe("IMG");
    });
  });

  describe("while the image loads", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("keeps the image hidden over the initials, then shows it once it loads", () => {
      const { container } = render(<Avatar src="/ada.png" alt="Ada Lovelace" />);
      const image = screen.getByRole("img", { name: "Ada Lovelace" });
      expect(image).toHaveAttribute("data-loading");
      const initials = container.querySelector("img + span")!;
      expect(initials).toHaveTextContent("AL");
      expect(initials).toHaveAttribute("aria-hidden", "true");
      fireEvent.load(image);
      expect(image).not.toHaveAttribute("data-loading");
      // The initials stay hidden from assistive technology: the image is the only name.
      expect(screen.getAllByRole("img")).toEqual([image]);
    });

    it("shows an image that has already loaded at once", () => {
      vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
      render(<Avatar src="/ada.png" alt="Ada Lovelace" />);
      expect(screen.getByRole("img")).not.toHaveAttribute("data-loading");
    });

    it("hides a new src until it loads", () => {
      const { rerender } = render(<Avatar src="/ada.png" alt="Ada Lovelace" />);
      fireEvent.load(screen.getByRole("img"));
      rerender(<Avatar src="/ada-2.png" alt="Ada Lovelace" />);
      expect(screen.getByRole("img")).toHaveAttribute("data-loading");
    });
  });

  describe("fallback", () => {
    it("is one image named by alt, with the initials hidden from screen readers", () => {
      render(<Avatar alt="Grace Hopper" />);
      const fallback = screen.getByRole("img", { name: "Grace Hopper" });
      const initials = fallback.firstElementChild!;
      expect(initials).toHaveTextContent("GH");
      expect(initials).toHaveAttribute("aria-hidden", "true");
    });

    it("uses the fallback text when given", () => {
      render(<Avatar alt="Grace Hopper" fallback="GMH" />);
      expect(screen.getByRole("img", { name: "Grace Hopper" })).toHaveTextContent("GMH");
    });
  });

  describe("decorative, with an empty alt", () => {
    it("hides the image from assistive technology", () => {
      render(<Avatar src="/ada.png" alt="" />);
      expect(screen.queryByRole("img")).toBeNull();
      expect(document.querySelector("img")).toHaveAttribute("alt", "");
    });

    it("hides the fallback too, with no role", () => {
      const { container } = render(<Avatar alt="" fallback="AL" />);
      const root = container.firstElementChild!;
      expect(root).toHaveAttribute("aria-hidden", "true");
      expect(root).not.toHaveAttribute("role");
      expect(root).not.toHaveAttribute("aria-label");
      expect(screen.queryByRole("img")).toBeNull();
    });
  });

  it.each([
    ["sm", "size-8"],
    ["default", "size-10"],
    ["lg", "size-12"],
  ] as const)("has a %s size", (size, className) => {
    const { container } = render(<Avatar alt="Ada Lovelace" size={size} />);
    expect(container.firstElementChild).toHaveClass(className, "rounded-full");
  });

  it("forwards ref and props to the root and merges className", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar alt="Ada Lovelace" ref={ref} className="size-16" data-testid="avatar" />);
    expect(ref.current).toBe(screen.getByTestId("avatar"));
    expect(ref.current).toHaveClass("size-16", "rounded-full");
    expect(ref.current).not.toHaveClass("size-10");
  });

  describe("accessibility", () => {
    it("has no axe violations with an image, a fallback and a decorative avatar", async () => {
      const { container } = render(
        <>
          <Avatar src="/ada.png" alt="Ada Lovelace" />
          <Avatar alt="Grace Hopper" />
          <Avatar alt="" fallback="KJ" />
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations after a load error", async () => {
      const { container } = render(<Avatar src="/missing.png" alt="Ada Lovelace" />);
      fireEvent.error(screen.getByRole("img"));
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

describe("initialsOf", () => {
  it.each([
    ["Ada Lovelace", "AL"],
    ["Grace Brewster Murray Hopper", "GH"],
    ["  ada   lovelace  ", "AL"],
    ["Plato", "P"],
    ["Émile Zola", "ÉZ"],
    ["", ""],
  ])("turns %j into %j", (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});
