import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core",
    globals: false,
    environment: "node",
    testTimeout: 10000,
    include: ["**/*.integration.test.ts"],
    exclude: ["**/node_modules/**"],
    globalSetup: ["./src/adapters/pg/test-utils/vitest.globalSetup.ts"],
  },
});
