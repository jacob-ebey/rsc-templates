import { createFromReadableStream } from "@hiogawa/vite-rsc/ssr";
import * as React from "react";
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge";
import {
  unstable_routeRSCServerRequest,
  unstable_RSCStaticRouter,
} from "react-router";
import bootstrapScriptContent from "virtual:vite-rsc/bootstrap-script-content";

interface PrerenderEnv {
  SERVER: Fetcher;
}

export default {
  fetch(request, env) {
    return unstable_routeRSCServerRequest({
      request,
      callServer: (request) => env.SERVER.fetch(request),
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
  },
} satisfies ExportedHandler<PrerenderEnv>;
