import {
  createFromReadableStream,
  encodeReply,
  setServerCallback,
} from "@hiogawa/vite-rsc/browser";
import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import type { unstable_DecodeServerResponseFunction as DecodeServerResponseFunction } from "react-router";
import {
  unstable_RSCHydratedRouter as RSCHydratedRouter,
  unstable_createCallServer as createCallServer,
  unstable_getServerStream as getServerStream,
} from "react-router";

const decode: DecodeServerResponseFunction = (
  body: ReadableStream<Uint8Array>
) => createFromReadableStream(body);

setServerCallback(
  createCallServer({
    decode,
    encodeAction: (args) => encodeReply(args),
  })
);

decode(getServerStream()).then((payload) => {
  React.startTransition(() => {
    hydrateRoot(
      document,
      <React.StrictMode>
        <RSCHydratedRouter
          decode={decode}
          payload={payload}
          routeDiscovery="lazy"
        />
      </React.StrictMode>
    );
  });
});

if (import.meta.env.DEV) {
  const ogError = console.error.bind(console);
  console.error = (...args) => {
    if (args[1] === Symbol.for("react-router.redirect")) {
      return;
    }
    ogError(...args);
  };
}
