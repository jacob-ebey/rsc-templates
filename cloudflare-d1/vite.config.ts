import { cloudflare } from "@cloudflare/vite-plugin";
import rsc, { __fix_cloudflare } from "@hiogawa/vite-rsc/plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    rsc({
      entries: {
        client: "src/browser.tsx",
      },
      serverHandler: false,
      loadModuleDevProxy: true,
    }),
    devtoolsJson(),
    __fix_cloudflare(),
    cloudflare({
      configPath: "./wrangler.prerender.jsonc",
      viteEnvironment: { name: "ssr" },
      persistState: true,
      auxiliaryWorkers: [
        {
          configPath: "./wrangler.server.jsonc",
          viteEnvironment: { name: "rsc" },
        },
      ],
    }),
  ],
});
