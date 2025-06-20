import * as fsp from "node:fs/promises";
import * as path from "node:path";

import { createFromReadableStream } from "@hiogawa/vite-rsc/ssr";
import * as React from "react";
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge";
import {
  unstable_routeRSCServerRequest,
  unstable_RSCStaticRouter,
} from "react-router";
import bootstrapScriptContent from "virtual:vite-rsc/bootstrap-script-content";

export async function prerender(
  request: Request,
  callServer: (request: Request) => Promise<Response>,
  saveToDisk?: boolean
): Promise<Response> {
  const response = await unstable_routeRSCServerRequest({
    request,
    callServer: async (request) => {
      const response = await callServer(request);
      if (saveToDisk) {
        const url = new URL(request.url);
        const outputPath = path.resolve(
          "dist/client",
          url.pathname === "/" ? "_root.rsc" : `${url.pathname.slice(1)}.rsc`
        );
        await fsp.mkdir(path.dirname(outputPath), { recursive: true });
        await fsp.writeFile(outputPath, await response.clone().text());
      }
      return response;
    },
    decode: createFromReadableStream,
    async renderHTML(getPayload) {
      return await renderHTMLToReadableStream(
        React.createElement(unstable_RSCStaticRouter, { getPayload }),
        {
          bootstrapScriptContent,
        }
      );
    },
  });

  if (saveToDisk) {
    const url = new URL(request.url);
    const outputPath = path.resolve(
      "dist/client",
      url.pathname.slice(1),
      "index.html"
    );
    await fsp.mkdir(path.dirname(outputPath), { recursive: true });
    await fsp.writeFile(outputPath, await response.clone().text());
  }

  return response;
}
