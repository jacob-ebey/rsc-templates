import {
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@hiogawa/vite-rsc/rsc";
import type {
  unstable_DecodeCallServerFunction as DecodeCallServerFunction,
  unstable_DecodeFormActionFunction as DecodeFormActionFunction,
} from "react-router";
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";

import { routes } from "./routes/routes";

// Decode and load actions by ID to support post-hydration server actions.
const decodeCallServer: DecodeCallServerFunction = async (id, reply) => {
  const args = await decodeReply(reply);
  const action = await loadServerAction(id);
  return action.bind(null, ...args);
};

// Decode and load actions by form data to pre-hydration server actions.
const decodeFormAction: DecodeFormActionFunction = async (formData) => {
  return await decodeAction(formData);
};

function fetchServer(request: Request) {
  return matchRSCServerRequest({
    // Provide the React Server touchpoints.
    decodeCallServer,
    decodeFormAction,
    decodeFormState,
    // The incoming request.
    request,
    // The app routes.
    routes: routes(),
    // Encode the match with the React Server implementation.
    generateResponse(match) {
      return new Response(renderToReadableStream(match.payload), {
        status: match.statusCode,
        headers: match.headers,
      });
    },
  });
}

export default async function handler(request: Request) {
  // Import the prerender function from the client envrionment
  const ssr = await import.meta.viteRsc.loadModule<
    typeof import("./prerender")
  >("ssr", "index");

  return ssr.prerender(request, fetchServer);
}
