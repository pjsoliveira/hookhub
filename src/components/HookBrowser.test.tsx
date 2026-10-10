// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Hook, HookEvent } from "@/lib/hooks/schema";
import { HookBrowser } from "./HookBrowser";

// next/navigation needs the Next runtime, so it is replaced with a tiny stand-in.
// `search` is what the "URL" currently holds; tests change it to simulate navigation.
let search = new URLSearchParams();
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => search,
}));

const events: HookEvent[] = [
  { name: "PreToolUse", group: "Tools", supportsMatcher: true, description: "Before a tool call runs" },
  { name: "Stop", group: "Turn end & alerts", supportsMatcher: false, description: "Claude finishes responding" },
  { name: "SessionStart", group: "Session", supportsMatcher: true, description: "Session begins" },
];

const make = (slug: string, hookEvents: string[]): Hook => ({
  slug,
  name: `Hook ${slug}`,
  description: `The ${slug} hook`,
  repo: `o/${slug}`,
  events: hookEvents,
  install: "plugin",
  addedAt: "2026-10-01",
  verifiedAt: "2026-10-01",
});

const hooks = [make("alpha", ["Stop"]), make("bravo", ["PreToolUse", "Stop"]), make("charlie", ["SessionStart"])];

const renderBrowser = () => render(<HookBrowser hooks={hooks} events={events} meta={{}} />);
const chip = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name}\\b`) });
const cardTitles = () => screen.queryAllByRole("heading", { level: 2 }).map((h) => h.textContent ?? "");

describe("HookBrowser", () => {
  let replaceState: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    search = new URLSearchParams();
    replaceState = vi.spyOn(window.history, "replaceState");
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts from the URL, so a shared link restores the view", () => {
    search = new URLSearchParams("event=Stop&q=alpha");
    renderBrowser();

    expect(chip("Stop").getAttribute("aria-pressed")).toBe("true");
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("alpha");
    expect(screen.getByText("1 of 3 hooks")).toBeTruthy();
  });

  it("keeps BOTH selections when two chips are clicked at the same instant", () => {
    renderBrowser();

    act(() => {
      fireEvent.click(chip("PreToolUse"));
      fireEvent.click(chip("Stop"));
    });

    expect(chip("PreToolUse").getAttribute("aria-pressed")).toBe("true");
    expect(chip("Stop").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("2 of 3 hooks")).toBeTruthy(); // alpha and bravo; charlie handles neither
  });

  it("matches hooks that handle ANY selected event", () => {
    renderBrowser();
    fireEvent.click(chip("SessionStart"));
    expect(cardTitles().some((t) => t.includes("charlie"))).toBe(true);
    expect(cardTitles()).toHaveLength(1);
    fireEvent.click(chip("PreToolUse"));
    expect(cardTitles()).toHaveLength(2);
  });

  it("writes the URL once, after a pause, without adding history entries", () => {
    renderBrowser();
    replaceState.mockClear();
    const box = screen.getByRole("searchbox");

    for (const text of ["f", "fo", "for", "form"]) {
      fireEvent.change(box, { target: { value: text } });
      act(() => vi.advanceTimersByTime(50));
    }
    expect(replaceState).not.toHaveBeenCalled(); // still typing

    act(() => vi.advanceTimersByTime(300));
    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/?q=form");
  });

  it("clears every filter and puts focus in the search box", () => {
    search = new URLSearchParams("event=Stop&q=alpha&sort=name");
    renderBrowser();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(document.activeElement).toBe(screen.getByRole("searchbox"));
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(chip("Stop").getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("3 of 3 hooks")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  it("adopts a URL change that comes from outside", () => {
    const { rerender } = renderBrowser();
    expect(screen.getByText("3 of 3 hooks")).toBeTruthy();

    search = new URLSearchParams("event=SessionStart"); // e.g. a link to /?event=SessionStart
    rerender(<HookBrowser hooks={hooks} events={events} meta={{}} />);

    expect(chip("SessionStart").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("1 of 3 hooks")).toBeTruthy();
  });

  it("does not fight its own URL writes", () => {
    const { rerender } = renderBrowser();
    fireEvent.click(chip("Stop"));
    act(() => vi.advanceTimersByTime(300));

    // Next feeds our own replaceState back in through useSearchParams.
    search = new URLSearchParams("event=Stop");
    rerender(<HookBrowser hooks={hooks} events={events} meta={{}} />);

    expect(chip("Stop").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("2 of 3 hooks")).toBeTruthy();
  });

  it("describes each event chip for screen readers, not only in a tooltip", () => {
    renderBrowser();
    expect(screen.getByRole("button", { name: /PreToolUse.*Before a tool call runs/ })).toBeTruthy();
  });

  it("only offers events that at least one hook handles", () => {
    render(<HookBrowser hooks={[make("alpha", ["Stop"])]} events={events} meta={{}} />);
    expect(screen.queryByRole("button", { name: /^SessionStart/ })).toBeNull();
    expect(chip("Stop")).toBeTruthy();
  });

  it("links every card title to the GitHub repository in a new tab, safely", () => {
    renderBrowser();
    // The title link (the other link with this name is "Details for Hook alpha").
    const link = screen.getByRole("link", { name: /^Hook alpha.*opens o\/alpha on GitHub/ }) as HTMLAnchorElement;
    expect(link.href).toBe("https://github.com/o/alpha");
    expect(link.target).toBe("_blank");
    expect(link.rel).toContain("noopener");
  });
});
