import { env } from "cloudflare:workers";
import { AsyncLocalStorage } from "node:async_hooks";

import type { Session } from "react-router/rsc";
import { createCookieSessionStorage } from "react-router/rsc";

type SessionData = {
  userId?: string;
};

type SessionContext = {
  emptySession: Session<SessionData, SessionData>;
  session: Session<SessionData, SessionData>;
};

const SESSION = new AsyncLocalStorage<SessionContext>();

const sessionStorage = createCookieSessionStorage({
  cookie: {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [env.SESSION_SECRET],
  },
});

const POISON_AFTER_RESPONSE_GENERATED = new Set(["flash", "set", "unset"]);

function proxySession<S extends Session>(
  session: S
): { responseGenerated(): void; session: S } {
  let responseGenerated = false;
  return {
    responseGenerated() {
      responseGenerated = true;
    },
    session: new Proxy(session, {
      get(target, prop, receiver) {
        if (
          responseGenerated &&
          typeof prop === "string" &&
          POISON_AFTER_RESPONSE_GENERATED.has(prop)
        ) {
          throw new Error(
            `Cannot mutate session after response is generated: getSession().${prop}`
          );
        }
        return Reflect.get(target, prop, receiver);
      },
    }),
  };
}

export async function provideSession(
  request: Request,
  cb: () => Promise<Response>
): Promise<Response> {
  const [_session, _emptySession] = await Promise.all([
    sessionStorage.getSession(request.headers.get("Cookie")),
    sessionStorage.getSession(),
  ]);

  const sessionProxy = proxySession(_session);
  const emptySessionProxy = proxySession(_emptySession);

  const ctx: SessionContext = {
    emptySession: emptySessionProxy.session,
    session: sessionProxy.session,
  };

  const response = await SESSION.run(ctx, cb);

  sessionProxy.responseGenerated();
  emptySessionProxy.responseGenerated();

  const headers = new Headers(response.headers);
  headers.append("Set-Cookie", await sessionStorage.commitSession(ctx.session));

  return new Response(response.body, {
    cf: response.cf,
    headers,
    status: response.status,
    statusText: response.statusText,
    webSocket: response.webSocket,
  });
}

export function getSession(): Session<SessionData, SessionData> {
  const ctx = SESSION.getStore();
  if (!ctx) {
    throw new Error("No session context");
  }
  return ctx.session;
}

export function destroySession() {
  const ctx = SESSION.getStore();
  if (!ctx) {
    throw new Error("No session context");
  }

  ctx.session = ctx.emptySession;
}
