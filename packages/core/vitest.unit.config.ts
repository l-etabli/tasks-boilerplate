import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core",
    globals: false,
    environment: "node",
    exclude: ["**/*.integration.test.ts", "**/node_modules/**"],
  },
});
