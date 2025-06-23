import { Link } from "react-router";

import { logout } from "@/auth/actions";
import { LoginForm, SignupForm } from "@/auth/forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDb } from "@/db/db";
import { getSession } from "@/session";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { AuthTabs } from "./client";

export default async function Home() {
  const db = getDb();
  const session = getSession();

  const userId = session.get("userId");

  const user = userId
    ? await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
      })
    : undefined;

  return (
    <main className="mx-auto px-4 py-8 lg:py-12 container grid gap-8 md:gap-12">
      <article className="prose max-w-none">
        <h1>Welcome {user?.name} to React Router RSC</h1>
        <p>
          This is a simple example of a React Router application using React
          Server Components (RSC) with Vite. It demonstrates how to set up a
          basic routing structure and render components server-side.
        </p>
      </article>

      {user ? (
        <form action={logout}>
          <Button type="submit">Logout</Button>
        </form>
      ) : (
        <AuthTabs>
          <TabsList>
            <TabsTrigger value="login">
              <Link to="?login" preventScrollReset replace>
                Login
              </Link>
            </TabsTrigger>
            <TabsTrigger value="signup">
              <Link to="?signup" preventScrollReset replace>
                Signup
              </Link>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Use your email and password to login.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Signup</CardTitle>
                <CardDescription>
                  Create an account to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <SignupForm />
              </CardContent>
            </Card>
          </TabsContent>
        </AuthTabs>
      )}
    </main>
  );
}
