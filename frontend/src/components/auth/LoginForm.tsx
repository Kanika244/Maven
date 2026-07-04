import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormData } from "../../schemas/authSchema";

import Input from "../ui/Input";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);

      // simulate API call for now
      console.log("LOGIN DATA:", data);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      alert("Login successful (mock)");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {/* Header */}
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">
          Welcome Back
        </h2>

        <p className="text-sm text-slate-500">
          Sign in to access your MAVEN dashboard
        </p>
      </div>

      {/* Email */}
      <FormField
        label="Email Address"
        htmlFor="email"
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          placeholder="name@company.com"
          hasError={!!errors.email}
          {...register("email")}
        />
      </FormField>

      {/* Password */}
      <FormField
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          hasError={!!errors.password}
          {...register("password")}
        />
      </FormField>

      {/* Submit Button */}
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login to MAVEN"}
      </Button>

      {/* Footer */}
      <div className="text-center text-sm text-slate-500">
        <p>
          New here?{" "}
          <a
            href="/register"
            className="font-medium text-slate-900 hover:underline"
          >
            Create account
          </a>
        </p>
      </div>
    </form>
  );
}