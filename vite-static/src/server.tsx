import {
  decodeAction,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@hiogawa/vite-rsc/rsc";
import { unstable_matchRSCServerRequest } from "react-router";

import { routes } from "./routes/routes";

export { routes };

function fetchServer(request: Request) {
  return unstable_matchRSCServerRequest({
    decodeAction,
    decodeReply,
    loadServerAction,
    request,
    routes: routes(),
    generateResponse(match) {
      return new Response(renderToReadableStream(match.payload), {
        status: match.statusCode,
        headers: match.headers,
      });
    },
  });
}

export default async function handler(request: Request, saveToDisk?: boolean) {
  const ssr = await import.meta.viteRsc.loadSsrModule<
    typeof import("./prerender")
  >("index");

  return ssr.prerender(request, fetchServer, saveToDisk === true);
}
