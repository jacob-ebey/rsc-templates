import { createRequestListener } from "@mjackson/node-fetch-server";
import compression from "compression";
import express from "express";
import {
  decodeAction,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
  // @ts-expect-error - no types for this yet
} from "react-server-dom-parcel/server.edge";
import {
  type unstable_DecodeCallServerFunction,
  type unstable_DecodeFormActionFunction,
  unstable_matchRSCServerRequest,
} from "react-router/rsc";

import { prerender } from "./prerender" with { env: "react-client" };
import { routes } from "./routes/routes";

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

const app = express();

app.use(
  "/client",
  compression(),
  express.static("dist/client", {
    immutable: true,
    maxAge: "1y",
  })
);

app.use(compression(), express.static("public"));

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_, res) => {
  res.status(404);
  res.end();
});

app.use(
  createRequestListener((request) =>
    prerender(
      request,
      callServer,
      (routes as unknown as { bootstrapScript?: string }).bootstrapScript
    )
  )
);

const PORT = Number.parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (http://localhost:${PORT})`);
});
