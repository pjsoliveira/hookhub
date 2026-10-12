// @vitest-environment jsdom
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { events, hooks } from "@/lib/hooks/load";
import { HeroOrbit } from "./HeroOrbit";

afterEach(cleanup);

describe("HeroOrbit", () => {
  const usedEvents = [...new Set(hooks.flatMap((hook) => hook.events))];

  it("has exactly one h1 reading HookHub", () => {
    const { container } = render(<HeroOrbit />);
    const headings = container.querySelectorAll("h1");
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("HookHub");
  });

  it("shows stats counted from the catalog, label before value", () => {
    const { container } = render(<HeroOrbit />);
    const values = [...container.querySelectorAll("dd")].map((dd) => dd.textContent);
    expect(values).toEqual([String(hooks.length), String(usedEvents.length)]);
    const dl = container.querySelector("dl")!;
    expect(dl.querySelector("dt")!.compareDocumentPosition(dl.querySelector("dd")!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(within(dl).getByText(`of ${events.length} events covered`)).toBeTruthy();
  });

  it("lists at most 6 real events as plain text", () => {
    const { container } = render(<HeroOrbit />);
    const list = within(container).getByRole("list", { name: /events hooks react to/i });
    const names = within(list)
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    expect(names.length).toBeLessThanOrEqual(6);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(usedEvents).toContain(name);
  });

  it("adds no links or buttons, and hides the decorative drawing from screen readers", () => {
    const { container } = render(<HeroOrbit />);
    expect(container.querySelectorAll("a, button")).toHaveLength(0);
    for (const svg of container.querySelectorAll("svg")) {
      expect(svg.getAttribute("aria-hidden") === "true" || svg.closest("[aria-hidden='true']") !== null).toBe(true);
    }
  });

  it("only animates when motion is allowed", () => {
    const { container } = render(<HeroOrbit />);
    const animated = [...container.querySelectorAll("[class*='animate-']")].flatMap((el) =>
      [...el.classList].filter((name) => name.includes("animate-")),
    );
    expect(animated.length).toBeGreaterThan(0);
    for (const name of animated) expect(name.startsWith("motion-safe:")).toBe(true);
  });
});
