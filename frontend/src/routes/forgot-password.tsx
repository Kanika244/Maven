import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — MAVEN" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a secure link to set a new password."
    >
      {sent ? (
        <div className="rounded-xl border border-primary/25 bg-primary/10 p-5 text-sm">
          <MailCheck className="mb-2 h-6 w-6 text-primary" />
          <p className="font-medium">Check your inbox</p>
          <p className="mt-1 text-muted-foreground">
            If an account exists for that email, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.in" />
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}