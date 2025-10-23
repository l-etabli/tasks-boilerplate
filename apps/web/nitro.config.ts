import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  plugins: ["./server/plugins/otel"],
});
