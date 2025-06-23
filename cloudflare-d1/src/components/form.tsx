"use client";

import {
  FormProvider,
  getFormProps,
  getInputProps,
  useField,
  useForm,
  useFormMetadata,
  type FormMetadata,
  type SubmissionResult,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { createContext, use, useTransition } from "react";
import { useFormStatus as useReactFormStatus } from "react-dom";
import { ZodType } from "zod/v4";

import { Input as BaseInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FormContext = createContext<{ pending: boolean } | null>(null);

export function useFormState() {
  const reactStatus = useReactFormStatus();
  const ctx = use(FormContext);

  return {
    pending: ctx?.pending ?? reactStatus.pending,
  };
}

export function ZodForm({
  action,
  lastResult,
  schema,
  onSubmit,
  ...props
}: React.ComponentProps<"form"> & {
  lastResult: SubmissionResult | undefined;
  schema: ZodType;
}) {
  const [pending, startTransition] = useTransition();

  const [form] = useForm({
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    lastResult,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit(event) {
      onSubmit?.(event);
      if (event.defaultPrevented || typeof action !== "function") return;
      event.preventDefault();
      startTransition(() =>
        action(
          new FormData(
            event.currentTarget,
            (event.nativeEvent as SubmitEvent).submitter
          )
        )
      );
    },
  });

  return (
    <FormContext.Provider value={{ pending }}>
      <Form {...props} action={action} form={form} />
    </FormContext.Provider>
  );
}

export function Form({
  form,
  ...props
}: React.ComponentProps<"form"> & { form: FormMetadata }) {
  return (
    <FormProvider context={form.context}>
      <form {...getFormProps(form, { ariaAttributes: true })} {...props} />
    </FormProvider>
  );
}

export function FormErrors() {
  const form = useFormMetadata();
  return form.errors?.length ? (
    <ul id={form.errorId} className="grid gap-3">
      {form.errors.map((error) => (
        <li key={error} className="text-destructive text-sm">
          {error}
        </li>
      ))}
    </ul>
  ) : null;
}

export function Input({
  label,
  name,
  type,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  label: React.ReactNode;
  name: string;
  type: NonNullable<
    Exclude<Parameters<typeof getInputProps>[1]["type"], "checkbox" | "radio">
  >;
}) {
  const [field] = useField<string>(name, { formId: props.form });

  return (
    <div className="grid gap-3">
      <Label htmlFor={field.id}>{label}</Label>
      <BaseInput
        {...props}
        {...getInputProps(field, {
          type,
          ariaAttributes: true,
        })}
      />
      {field.errors?.length ? (
        <ul id={field.errorId} className="grid gap-3">
          {field.errors.map((error) => (
            <li key={error} className="text-destructive text-sm">
              {error}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
