"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import * as bcrypt from "bcrypt-ts";
import { redirect } from "react-router";

import { getDb } from "@/db/db";
import * as schema from "@/db/schema";
import { destroySession, getSession } from "@/lib/session";

import type { LoginFormState, SignupFormState } from "./definitions";
import { LoginFormSchema, SignupFormSchema } from "./definitions";

export async function logout() {
  destroySession();
}

export async function login(
  _: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const submission = parseWithZod(formData, { schema: LoginFormSchema });

  if (submission.status !== "success") {
    return submission.reply({ hideFields: ["password"] });
  }

  const { redirectTo, email, password } = submission.value;

  const db = getDb();

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  const passwordMatches =
    !!user && (await bcrypt.compare(password, user.hashedPassword));

  if (!user || !passwordMatches) {
    return submission.reply({
      formErrors: ["Invalid email or password"],
      hideFields: ["password"],
    });
  }

  destroySession();
  const session = getSession();
  session.set("userId", user.id);

  redirect(redirectTo || "/");
  return submission.reply();
}

export async function signup(
  _: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const submission = parseWithZod(formData, { schema: SignupFormSchema });

  if (submission.status !== "success") {
    return submission.reply({ hideFields: ["password"] });
  }

  const { redirectTo, name, email, password } = submission.value;
  const hashedPassword = await bcrypt.hash(password, 10);

  const db = getDb();

  const [inserted] = await db
    .insert(schema.users)
    .values({ name, email, hashedPassword })
    .returning()
    .catch((reason) => {
      console.error(reason);
      return [undefined];
    });

  if (!inserted) {
    return submission.reply({
      formErrors: ["An error occurred while creating your account."],
    });
  }

  destroySession();
  const session = getSession();
  session.set("userId", inserted.id);

  redirect(redirectTo || "/");
  return submission.reply();
}
