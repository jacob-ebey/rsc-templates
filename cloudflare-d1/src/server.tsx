import {
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@hiogawa/vite-rsc/rsc";
import {
  type unstable_DecodeCallServerFunction,
  type unstable_DecodeFormActionFunction,
  unstable_matchRSCServerRequest,
} from "react-router/rsc";

import { routes } from "./routes/routes";
import { provideSession } from "./session";

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

export default {
  fetch(request) {
    return provideSession(request, () => {
      return unstable_matchRSCServerRequest({
        decodeCallServer,
        decodeFormAction,
        decodeFormState,
        request,
        routes: routes(),
        generateResponse(match) {
          return new Response(renderToReadableStream(match.payload), {
            status: match.statusCode,
            headers: match.headers,
          });
        },
      });
    });
  },
} satisfies ExportedHandler<ServerEnv>;
