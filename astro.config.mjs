import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: process.env.SITE_URL,
  output: "server",
  adapter: cloudflare(),
  integrations: [react()]
});
