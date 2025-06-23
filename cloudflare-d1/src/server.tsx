import {
  decodeAction,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@hiogawa/vite-rsc/rsc";
import {
  unstable_matchRSCServerRequest as matchRSCServerRequest,
  type unstable_DecodeCallServerFunction as DecodeCallServerFunction,
  type unstable_DecodeFormActionFunction as DecodeFormActionFunction,
} from "react-router/rsc";

import { routes } from "./routes/routes";

// Decode and load actions by ID to support post-hydration server actions.
const decodeCallServer: DecodeCallServerFunction = async (actionId, reply) => {
  const args = await decodeReply(reply);
  const action = await loadServerAction(actionId);
  return action.bind(null, ...args);
};

// Decode and load actions by form data to pre-hydration server actions.
const decodeFormAction: DecodeFormActionFunction = async (formData) => {
  return await decodeAction(formData);
};

export default {
  fetch(request: Request) {
    return matchRSCServerRequest({
      // Provide the React Server touchpoints.
      decodeCallServer,
      decodeFormAction,
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
  },
};
