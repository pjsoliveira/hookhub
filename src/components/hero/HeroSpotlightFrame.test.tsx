// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSpotlightFrame } from "./HeroSpotlightFrame";

function mockMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: reduced && query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function setup() {
  const { container } = render(
    <HeroSpotlightFrame>
      <p>child content</p>
    </HeroSpotlightFrame>,
  );
  const frame = container.firstElementChild as HTMLElement;
  frame.getBoundingClientRect = () => ({ left: 10, top: 20, width: 400, height: 200 }) as DOMRect;
  return frame;
}

beforeEach(() => {
  // Run animation frames synchronously so the DOM write can be asserted right away.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("HeroSpotlightFrame", () => {
  it("renders its children", () => {
    mockMatchMedia(false);
    setup();
    expect(screen.getByText("child content")).toBeTruthy();
  });

  it("sets --x and --y relative to the container on pointer move", () => {
    mockMatchMedia(false);
    const frame = setup();
    fireEvent.pointerMove(frame, { clientX: 110, clientY: 70 });
    expect(frame.style.getPropertyValue("--x")).toBe("100px");
    expect(frame.style.getPropertyValue("--y")).toBe("50px");
  });

  it("clears the position when the pointer leaves", () => {
    mockMatchMedia(false);
    const frame = setup();
    fireEvent.pointerMove(frame, { clientX: 110, clientY: 70 });
    fireEvent.pointerLeave(frame);
    expect(frame.style.getPropertyValue("--x")).toBe("");
  });

  it("does not track the pointer with prefers-reduced-motion", () => {
    mockMatchMedia(true);
    const frame = setup();
    fireEvent.pointerMove(frame, { clientX: 110, clientY: 70 });
    expect(frame.style.getPropertyValue("--x")).toBe("");
    expect(frame.style.getPropertyValue("--y")).toBe("");
  });

  it("marks the spotlight layers aria-hidden", () => {
    mockMatchMedia(false);
    const frame = setup();
    const layers = frame.querySelectorAll('[aria-hidden="true"]');
    expect(layers).toHaveLength(2);
  });
});
