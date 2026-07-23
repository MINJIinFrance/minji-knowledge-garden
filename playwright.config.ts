import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "pnpm dev --host 127.0.0.1",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI
  }
});
