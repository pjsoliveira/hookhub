// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { events, hooks } from "@/lib/hooks/load";
import { HeroCentered } from "./HeroCentered";

afterEach(cleanup);

describe("HeroCentered", () => {
  it("has exactly one h1 reading HookHub", () => {
    render(<HeroCentered />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toBe("HookHub");
  });

  it("shows the stats computed from the catalog", () => {
    const covered = new Set(hooks.flatMap((hook) => hook.events)).size;
    const { container } = render(<HeroCentered />);
    const values = Array.from(container.querySelectorAll("dd")).map((dd) => dd.textContent);
    expect(values).toEqual([String(hooks.length), String(covered)]);
    expect(screen.getByText(`of ${events.length} events covered`)).toBeTruthy();
    expect(screen.getByText("hooks listed")).toBeTruthy();
  });
});
