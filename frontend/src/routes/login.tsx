import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — MAVEN" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your MAVEN investor workspace.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.in" defaultValue="aarav.sharma@example.in" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} defaultValue="password" />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox defaultChecked /> Keep me signed in
        </label>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={() => navigate({ to: "/" })}>
          Continue with Google
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to MAVEN?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}