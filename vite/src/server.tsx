import {
  decodeAction,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@hiogawa/vite-rsc/rsc";
import {
  type unstable_DecodeCallServerFunction,
  type unstable_DecodeFormActionFunction,
  unstable_matchRSCServerRequest,
} from "react-router/rsc";

import { routes } from "./routes";

const decodeCallServer: unstable_DecodeCallServerFunction = async (
  actionId,
  reply
) => {
  const args = await decodeReply(reply);
  const action = await loadServerAction(actionId);
  return action.bind(null, ...args);
};

const decodeFormAction: unstable_DecodeFormActionFunction = async (
  formData
) => {
  return await decodeAction(formData);
};

function callServer(request: Request) {
  return unstable_matchRSCServerRequest({
    decodeCallServer,
    decodeFormAction,
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

export default async function handler(request: Request) {
  const ssr = await import.meta.viteRsc.loadModule<
    typeof import("./prerender")
  >("ssr", "index");

  return ssr.prerender(request, callServer);
}
