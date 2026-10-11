// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { events, hooks } from "@/lib/hooks/load";
import { HeroExplorer } from "./HeroExplorer";

afterEach(cleanup);

describe("HeroExplorer", () => {
  it("renders exactly one h1 reading HookHub", () => {
    render(<HeroExplorer />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("HookHub");
  });

  it("shows the stats computed from the catalog", () => {
    const { container } = render(<HeroExplorer />);
    const covered = new Set(hooks.flatMap((hook) => hook.events)).size;
    const values = Array.from(container.querySelectorAll("dd")).map((dd) => dd.textContent);
    expect(values).toEqual([String(hooks.length), String(covered)]);
    expect(screen.getByText("hooks listed")).toBeTruthy();
    expect(screen.getByText(`of ${events.length} events covered`)).toBeTruthy();
  });

  it("lists the first 5 used events as tabs, first selected with its real count", () => {
    render(<HeroExplorer />);
    const used = new Set(hooks.flatMap((hook) => hook.events));
    const expected = events.filter((e) => used.has(e.name)).slice(0, 5);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(expected.map((e) => e.name));
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    const count = hooks.filter((h) => h.events.includes(expected[0].name)).length;
    expect(screen.getByRole("tabpanel").textContent).toContain(expected[0].description);
    expect(screen.getByRole("tabpanel").textContent).toContain(`${count} ${count === 1 ? "hook reacts" : "hooks react"} to ${expected[0].name}`);
  });
});
