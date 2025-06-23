"use client";

import { useActionState } from "react";
import { useSearchParams } from "react-router";

import { FormErrors, Input, ZodForm } from "@/components/form";
import { Button } from "@/components/ui/button";

import { login, signup } from "./actions";
import { LoginFormSchema, SignupFormSchema } from "./definitions";

export function LoginForm() {
  const [lastResult, action, pending] = useActionState(login, undefined);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || undefined;

  return (
    <ZodForm
      action={action}
      schema={LoginFormSchema}
      lastResult={lastResult}
      onSubmit={(event) => {
        if (pending) event.preventDefault();
      }}
      className="grid gap-6"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="your@email.com"
        autoComplete="current-email"
      />

      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="**********"
        autoComplete="current-password"
      />

      <FormErrors />

      <Button type="submit" disabled={pending}>
        Log In
      </Button>
    </ZodForm>
  );
}

export function SignupForm() {
  const [lastResult, action, pending] = useActionState(signup, undefined);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || undefined;

  return (
    <ZodForm
      action={action}
      schema={SignupFormSchema}
      lastResult={lastResult}
      onSubmit={(event) => {
        if (pending) event.preventDefault();
      }}
      className="grid gap-6"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <Input
        name="name"
        type="text"
        label="Name"
        placeholder="Name"
        autoComplete="name"
      />

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="Email"
        autoComplete="email"
      />

      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="Password"
        autoComplete="new-password"
      />

      <FormErrors />

      <Button type="submit" disabled={pending}>
        Sign Up
      </Button>
    </ZodForm>
  );
}
