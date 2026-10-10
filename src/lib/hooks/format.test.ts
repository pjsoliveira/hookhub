import { describe, expect, it } from "vitest";
import { licenseLabel, repoUrl } from "./format";

describe("repoUrl", () => {
  it("always points at github.com", () => {
    expect(repoUrl("owner/name")).toBe("https://github.com/owner/name");
    expect(repoUrl("a/b").startsWith("https://github.com/")).toBe(true);
  });
});

describe("licenseLabel", () => {
  it("says 'No license' only when GitHub found no license file", () => {
    expect(licenseLabel(null)).toBe("No license");
  });

  it("does not call a custom license 'No license'", () => {
    expect(licenseLabel("NOASSERTION")).toBe("Custom license");
  });

  it("shows a recognized SPDX id as is", () => {
    expect(licenseLabel("MIT")).toBe("MIT");
    expect(licenseLabel("Apache-2.0")).toBe("Apache-2.0");
  });
});
