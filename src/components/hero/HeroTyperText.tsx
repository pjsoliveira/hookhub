"use client";
// Client child of HeroTyper: types "Hooks for <event>" through the given names; static when reduced motion is on.
import { useEffect, useState } from "react";

const TYPE_MS = 70;
const DELETE_MS = 35;
const HOLD_MS = 1600;
const GAP_MS = 350;

export function HeroTyperText({ names }: { names: string[] }) {
  // First render (server, no-JS, hydration) is the complete first name: no shift, no mismatch.
  const [shown, setShown] = useState(names[0] ?? "");

  useEffect(() => {
    if (names.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    let index = 0;
    let length = names[0].length;
    let deleting = true;

    // Hold the finished name, then delete it, move to the next name and type it out.
    const step = () => {
      let delay: number;
      if (deleting) {
        length -= 1;
        delay = length <= 0 ? GAP_MS : DELETE_MS;
        if (length <= 0) {
          deleting = false;
          index = (index + 1) % names.length;
        }
      } else {
        length += 1;
        const next = names[index];
        delay = length >= next.length ? HOLD_MS : TYPE_MS;
        if (length >= next.length) deleting = true;
      }
      setShown(names[index].slice(0, Math.max(length, 0)));
      timer = setTimeout(step, delay);
    };

    timer = setTimeout(step, HOLD_MS);
    return () => clearTimeout(timer);
  }, [names]);

  const longest = names.reduce((max, name) => Math.max(max, name.length), 0);
  const sentence = names.length ? `Hooks for events such as ${names.join(", ")}` : "Hooks for every Claude Code event";

  return (
    <p className="min-h-8 text-xl font-medium text-zinc-800 sm:min-h-9 sm:text-2xl dark:text-zinc-100">
      <span className="sr-only">{sentence}</span>
      <span aria-hidden="true">
        Hooks for{" "}
        <span
          className="inline-block font-mono text-sky-700 dark:text-sky-300"
          style={{ minWidth: `${longest}ch` }}
        >
          {shown}
          <span className="ml-px inline-block h-[1em] w-0.5 translate-y-[0.15em] bg-current motion-safe:animate-pulse" />
        </span>
      </span>
    </p>
  );
}
