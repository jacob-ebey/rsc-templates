"use client";

import { useSearchParams } from "react-router";

import { Tabs } from "@/components/ui/tabs";

export function AuthTabs({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();

  const defaultValue = searchParams.has("signup") ? "signup" : "login";

  return <Tabs defaultValue={defaultValue}>{children}</Tabs>;
}
