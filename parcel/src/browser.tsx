"use client-entry";

import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import {
  unstable_createCallServer,
  unstable_getServerStream,
  unstable_RSCHydratedRouter,
} from "react-router";
import {
  createFromReadableStream,
  encodeReply,
  setServerCallback,
  // @ts-expect-error - no types for this yet
} from "react-server-dom-parcel/client";

const callServer = unstable_createCallServer({
  decode: (body) => createFromReadableStream(body, { callServer }),
  encodeAction: (args) => encodeReply(args),
});

setServerCallback(callServer);

createFromReadableStream(unstable_getServerStream()).then((payload: any) => {
  React.startTransition(async () => {
    hydrateRoot(
      document,
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(unstable_RSCHydratedRouter, {
          decode: (body) => createFromReadableStream(body),
          payload,
        })
      )
    );
  });
});

if (process.env.NODE_ENV !== "production") {
  const ogError = console.error.bind(console);
  console.error = (...args) => {
    if (args[1] === Symbol.for("react-router.redirect")) {
      return;
    }
    ogError(...args);
  };
}
