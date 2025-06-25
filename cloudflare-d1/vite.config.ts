import { cloudflare } from "@cloudflare/vite-plugin";
import rsc, { __fix_cloudflare } from "@hiogawa/vite-rsc/plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  environments: {
    client: {
      optimizeDeps: {
        include: ["react-router", "react-router/internal/react-server-client"],
      },
    },
    ssr: {
      optimizeDeps: {
        include: ["react-router > cookie", "react-router > set-cookie-parser"],
        exclude: ["react-router"],
      },
    },
    rsc: {
      optimizeDeps: {
        include: ["react-router > cookie", "react-router > set-cookie-parser"],
        exclude: ["react-router"],
      },
    },
  },
  plugins: [
    tsconfigPaths(),
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
