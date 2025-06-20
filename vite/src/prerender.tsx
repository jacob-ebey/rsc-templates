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
  callServer: (request: Request) => Promise<Response>
): Promise<Response> {
  return await unstable_routeRSCServerRequest({
    request,
    callServer,
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
}
