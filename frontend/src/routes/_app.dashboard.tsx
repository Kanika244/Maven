import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "./_app.index";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MAVEN" }] }),
  component: Dashboard,
});
