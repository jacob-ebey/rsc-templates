import { Outlet } from "react-router";

import "./styles.css";

import { Layout as ClientLayout } from "./client";

export { ErrorBoundary } from "./client";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientLayout>{children}</ClientLayout>
    </>
  );
}

export default function Component() {
  return <Outlet />;
}
