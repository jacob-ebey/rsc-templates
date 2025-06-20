import * as React from "react";
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge";
import {
  unstable_routeRSCServerRequest,
  unstable_RSCStaticRouter,
} from "react-router";
// @ts-expect-error - no types for this yet
import { createFromReadableStream } from "react-server-dom-parcel/client.edge";

export async function prerender(
  request: Request,
  callServer: (request: Request) => Promise<Response>,
  bootstrapScriptContent: string | undefined
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
