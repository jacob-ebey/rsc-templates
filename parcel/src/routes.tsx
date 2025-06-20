"use server-entry";

import type { unstable_ServerRouteObject as ServerRouteObject } from "react-router/rsc";

import "./browser";

export function routes() {
  return [
    {
      id: "root",
      path: "",
      lazy: () => import("./routes/root/route"),
      children: [
        {
          id: "home",
          index: true,
          lazy: () => import("./routes/home/route"),
        },
        {
          id: "about",
          path: "about",
          lazy: () => import("./routes/about/route"),
        },
      ],
    },
  ] satisfies ServerRouteObject[];
}
