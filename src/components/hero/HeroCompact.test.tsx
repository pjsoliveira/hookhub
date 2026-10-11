// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { events, hooks } from "@/lib/hooks/load";
import { HeroCompact } from "./HeroCompact";

afterEach(cleanup);

describe("HeroCompact", () => {
  it("renders exactly one h1 reading HookHub", () => {
    render(<HeroCompact />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toBe("HookHub");
  });

  it("shows the stats computed from the catalog", () => {
    render(<HeroCompact />);
    const covered = new Set(hooks.flatMap((hook) => hook.events)).size;

    const listed = screen.getByText("hooks listed");
    expect(listed.tagName).toBe("DT");
    expect(listed.parentElement?.querySelector("dd")?.textContent).toBe(String(hooks.length));

    const coveredLabel = screen.getByText(`of ${events.length} events covered`);
    expect(coveredLabel.tagName).toBe("DT");
    expect(coveredLabel.parentElement?.querySelector("dd")?.textContent).toBe(String(covered));
  });
});
