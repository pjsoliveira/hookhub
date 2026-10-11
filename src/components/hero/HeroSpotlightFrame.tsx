"use client";

// Client-only part of HeroSpotlight: a soft light and a dotted grid that follow the pointer, set via CSS variables.
import { useEffect, useRef } from "react";

export function HeroSpotlightFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const point = useRef({ x: 0, y: 0 });

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || event.pointerType === "touch") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    point.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (frame.current !== null) return;
    // One DOM write per frame, straight to the element: no React state, no re-render.
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      el.style.setProperty("--x", `${point.current.x}px`);
      el.style.setProperty("--y", `${point.current.y}px`);
    });
  }

  function onPointerLeave() {
    // Go back to the static glow (the CSS fallbacks) when the pointer leaves.
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    ref.current?.style.removeProperty("--x");
    ref.current?.style.removeProperty("--y");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_320px_at_var(--x,75%)_var(--y,25%),rgba(14,165,233,0.2),transparent_70%)] dark:bg-[radial-gradient(circle_320px_at_var(--x,75%)_var(--y,25%),rgba(56,189,248,0.16),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(2,132,199,0.45)_1px,transparent_1.5px)] bg-size-[22px_22px] mask-[radial-gradient(circle_220px_at_var(--x,75%)_var(--y,25%),black,transparent)] dark:bg-[radial-gradient(circle,rgba(125,211,252,0.4)_1px,transparent_1.5px)]"
      />
      {children}
    </div>
  );
}
