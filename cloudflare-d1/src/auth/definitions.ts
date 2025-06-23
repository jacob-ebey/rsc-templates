import type { SubmissionResult } from "@conform-to/react";
import { z } from "zod/v4";

export const LoginFormSchema = z.object({
  redirectTo: z.string({}).optional(),
  email: z
    .string({ error: "Email is required." })
    .trim()
    .check(z.email({ message: "Please enter a valid email." })),
  password: z.string({ error: "Password is required." }).trim(),
});

export type LoginFormState = SubmissionResult | undefined;

export const SignupFormSchema = z.object({
  redirectTo: z.string().optional(),
  name: z
    .string({ error: "Name is required." })
    .trim()
    .min(2, { message: "Name must be at least 2 characters long." }),
  email: z
    .string({ error: "Email is required." })
    .trim()
    .check(z.email({ message: "Please enter a valid email." })),
  password: z
    .string({ error: "Password is required." })
    .trim()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    }),
});

export type SignupFormState = SubmissionResult | undefined;
