// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { events, hooks } from "@/lib/hooks/load";
import { HeroMesh } from "./HeroMesh";

afterEach(cleanup);

describe("HeroMesh", () => {
  it("renders exactly one h1 reading HookHub", () => {
    render(<HeroMesh />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("HookHub");
  });

  it("shows the stats computed from the catalog", () => {
    const { container } = render(<HeroMesh />);
    const covered = new Set(hooks.flatMap((hook) => hook.events)).size;
    const values = Array.from(container.querySelectorAll("dd")).map((dd) => dd.textContent);
    expect(values).toEqual([String(hooks.length), String(covered)]);
    expect(screen.getByText("hooks listed")).toBeTruthy();
    expect(screen.getByText(`of ${events.length} events covered`)).toBeTruthy();
  });

  it("adds no links or buttons", () => {
    const { container } = render(<HeroMesh />);
    expect(container.querySelectorAll("a, button")).toHaveLength(0);
  });
});
