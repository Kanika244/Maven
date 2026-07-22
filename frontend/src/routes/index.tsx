import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/auth/LoginPage";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Sign in — MAVEN" }] }),
  component: LoginPage,
});