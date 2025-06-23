import { createFromReadableStream } from "@hiogawa/vite-rsc/ssr";
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge";
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from "react-router";
import bootstrapScriptContent from "virtual:vite-rsc/bootstrap-script-content";

type Env = {
  SERVER: { fetch: (request: Request) => Promise<Response> };
};

export default {
  fetch(request: Request, env: Env) {
    return routeRSCServerRequest({
      // The incoming request.
      request,
      // How to call the React Server.
      callServer: (request) => env.SERVER.fetch(request),
      // Provide the React Server touchpoints.
      decode: createFromReadableStream,
      // Render the router to HTML.
      async renderHTML(getPayload) {
        const payload = await getPayload();
        const formState =
          payload.type === "render" ? await payload.formState : undefined;

        return await renderHTMLToReadableStream(
          <RSCStaticRouter getPayload={getPayload} />,
          {
            bootstrapScriptContent,
            // @ts-expect-error - no types for this yet
            formState,
          }
        );
      },
    });
  },
};
