import {
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@hiogawa/vite-rsc/rsc";
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";

import { provideSession } from "./lib/session";
import { routes } from "./routes/routes";

export default {
  fetch(request: Request) {
    return provideSession(request, () =>
      matchRSCServerRequest({
        // Provide the React Server touchpoints.
        decodeAction,
        decodeFormState,
        decodeReply,
        loadServerAction,
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
      })
    );
  },
};
