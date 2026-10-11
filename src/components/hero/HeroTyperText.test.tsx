// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroTyperText } from "./HeroTyperText";

const names = ["PreToolUse", "Stop", "SessionStart"];

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const visible = (container: HTMLElement) => container.querySelector('[aria-hidden="true"]')!.textContent;

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("HeroTyperText", () => {
  it("renders the first name immediately plus a static sr-only sentence", () => {
    mockMatchMedia(false);
    const { container } = render(<HeroTyperText names={names} />);
    expect(visible(container)).toContain("Hooks for PreToolUse");
    const sr = container.querySelector(".sr-only");
    expect(sr?.textContent).toContain("PreToolUse");
    expect(sr?.textContent).toContain("SessionStart");
  });

  it("changes the visible text over time when motion is allowed", () => {
    mockMatchMedia(false);
    const { container } = render(<HeroTyperText names={names} />);
    const before = visible(container);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(visible(container)).not.toBe(before);
    expect(container.querySelector(".sr-only")?.textContent).toContain("PreToolUse");
  });

  it("does not animate when reduced motion is requested", () => {
    mockMatchMedia(true);
    const { container } = render(<HeroTyperText names={names} />);
    const before = visible(container);
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(visible(container)).toBe(before);
    expect(before).toContain("PreToolUse");
  });

  it("clears its timers on unmount", () => {
    mockMatchMedia(false);
    const { unmount } = render(<HeroTyperText names={names} />);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
