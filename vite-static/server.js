import { parseArgs } from "node:util";

import { createRequestListener } from "@mjackson/node-fetch-server";
import compression from "compression";
import express from "express";

import build, { routes } from "./dist/rsc/index.js";

const args = parseArgs({
  options: {
    prerender: {
      type: "boolean",
    },
  },
});

if (args.values.prerender) {
  const routeTree = routes();
  let toProcess = [...routeTree];

  while (toProcess.length > 0) {
    const route = toProcess.shift();
    if (route.children) {
      toProcess.push(...route.children);
    }
    const mod = /** @type {{ getPrerenderPaths(): string[] }} */ (
      await route.lazy()
    );
    if (!mod.getPrerenderPaths) continue;
    const paths = mod.getPrerenderPaths();
    for (const path of paths) {
      const request = new Request(`http://localhost${path}`);
      const response = await build(request, true);
      if (response.status !== 200) {
        console.error(
          `Failed to prerender ${path} with status ${response.status}`
        );
      }
    }
  }
} else {
  const app = express();

  app.use(
    "/assets",
    compression(),
    express.static("dist/client/assets", {
      immutable: true,
      maxAge: "1y",
    })
  );
  app.use(compression(), express.static("dist/client"));

  app.get("/.well-known/appspecific/com.chrome.devtools.json", (_, res) => {
    res.status(404);
    res.end();
  });

  app.use(createRequestListener(build));

  const PORT = Number.parseInt(process.env.PORT || "3000");
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (http://localhost:${PORT})`);
  });
}
