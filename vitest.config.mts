import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Component tests opt into a browser-like DOM with `// @vitest-environment jsdom` at the top of the file.
  test: { include: ["src/**/*.test.{ts,tsx}"] },
});
