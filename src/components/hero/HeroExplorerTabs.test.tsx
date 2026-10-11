// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HeroExplorerTabs } from "./HeroExplorerTabs";

afterEach(cleanup);

const items = [
  { name: "PreToolUse", description: "Before a tool call runs", hookCount: 3 },
  { name: "Stop", description: "Claude finishes responding", hookCount: 1 },
  { name: "SessionStart", description: "Session begins", hookCount: 2 },
];

const tabs = () => screen.getAllByRole("tab");
const selectedName = () => tabs().find((t) => t.getAttribute("aria-selected") === "true")?.textContent;

describe("HeroExplorerTabs", () => {
  it("selects the first tab on render and shows its description and count", () => {
    render(<HeroExplorerTabs items={items} />);
    expect(selectedName()).toBe("PreToolUse");
    const panel = screen.getByRole("tabpanel");
    expect(panel.textContent).toContain("Before a tool call runs");
    expect(panel.textContent).toContain("3 hooks react to PreToolUse");
    expect(panel.getAttribute("aria-labelledby")).toBe(tabs()[0].id);
  });

  it("clicking another tab selects it and shows its description and count", () => {
    render(<HeroExplorerTabs items={items} />);
    fireEvent.click(tabs()[1]);
    expect(selectedName()).toBe("Stop");
    const panel = screen.getByRole("tabpanel");
    expect(panel.textContent).toContain("Claude finishes responding");
    expect(panel.textContent).toContain("1 hook reacts to Stop");
  });

  it("moves selection and focus with arrow keys, Home and End", () => {
    render(<HeroExplorerTabs items={items} />);
    fireEvent.keyDown(tabs()[0], { key: "ArrowRight" });
    expect(selectedName()).toBe("Stop");
    expect(document.activeElement).toBe(tabs()[1]);
    fireEvent.keyDown(tabs()[1], { key: "End" });
    expect(selectedName()).toBe("SessionStart");
    expect(document.activeElement).toBe(tabs()[2]);
    fireEvent.keyDown(tabs()[2], { key: "ArrowRight" });
    expect(selectedName()).toBe("PreToolUse");
    fireEvent.keyDown(tabs()[0], { key: "ArrowLeft" });
    expect(selectedName()).toBe("SessionStart");
    fireEvent.keyDown(tabs()[2], { key: "Home" });
    expect(selectedName()).toBe("PreToolUse");
    expect(document.activeElement).toBe(tabs()[0]);
  });

  it("keeps exactly one tab in the tab order", () => {
    render(<HeroExplorerTabs items={items} />);
    const zero = () => tabs().filter((t) => t.tabIndex === 0);
    expect(zero()).toHaveLength(1);
    fireEvent.keyDown(tabs()[0], { key: "ArrowRight" });
    expect(zero()).toHaveLength(1);
    expect(zero()[0].textContent).toBe("Stop");
  });
});
