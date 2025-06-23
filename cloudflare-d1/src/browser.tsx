import {
  createFromReadableStream,
  encodeReply,
  setServerCallback,
} from "@hiogawa/vite-rsc/browser";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import type { unstable_DecodeServerResponseFunction as DecodeServerResponseFunction } from "react-router";
import {
  unstable_createCallServer as createCallServer,
  unstable_getServerStream as getServerStream,
  unstable_RSCHydratedRouter as RSCHydratedRouter,
} from "react-router";

const decode: DecodeServerResponseFunction = (
  body: ReadableStream<Uint8Array>
) => createFromReadableStream(body);

// Create and set the callServer function to support post-hydration server actions.
setServerCallback(
  createCallServer({
    decode,
    encodeAction: (args) => encodeReply(args),
  })
);

// Get and decode the initial server payload
decode(getServerStream()).then((payload) => {
  startTransition(async () => {
    const formState =
      payload.type === "render" ? await payload.formState : undefined;

    hydrateRoot(
      document,
      <StrictMode>
        <RSCHydratedRouter decode={decode} payload={payload} />
      </StrictMode>,
      {
        // @ts-expect-error - no types for this yet
        formState,
      }
    );
  });
});
