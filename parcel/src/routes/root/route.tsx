import { Link, NavLink, Outlet } from "react-router";

import "./styles.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">
        <header className="sticky inset-x-0 top-0 z-50 border-b">
          <div className="mx-auto max-w-screen-xl px-4 relative flex h-16 items-center justify-between gap-4 sm:gap-8">
            <div className="flex items-center gap-4">
              <Link to="/">React Router 🚀</Link>
              <nav>
                <ul className="gap-4 flex">
                  <li>
                    <NavLink
                      to="/"
                      className="text-sm font-medium hover:opacity-75 aria-[current]:opacity-75"
                    >
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/about"
                      className="text-sm font-medium hover:opacity-75 aria-[current]:opacity-75"
                    >
                      About
                    </NavLink>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
export default function Component() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8 lg:py-12">
      <article className="prose mx-auto">
        <h1>Something went wrong!</h1>
      </article>
    </main>
  );
}
