import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { RegisterFormData } from "../../schemas/registerSchema";

import Input from "../ui/Input";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

export default function VerificationStep() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterFormData>();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Verification
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          We use this information to secure and verify your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label="Email Address"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            hasError={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Phone Number"
          htmlFor="phone"
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            placeholder="9876543210"
            hasError={!!errors.phone}
            {...register("phone")}
          />
        </FormField>

        <FormField
          label="PAN Number"
          htmlFor="pan"
          error={errors.pan?.message}
        >
          <Input
            id="pan"
            placeholder="ABCDE1234F"
            hasError={!!errors.pan}
            style={{ textTransform: "uppercase" }}
            {...register("pan")}
          />
        </FormField>

        <FormField
          label="Aadhaar Number"
          htmlFor="aadhaar"
          error={errors.aadhaar?.message}
        >
          <Input
            id="aadhaar"
            placeholder="123456789012"
            hasError={!!errors.aadhaar}
            {...register("aadhaar")}
          />
        </FormField>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
          >
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                hasError={!!errors.password}
                className="pr-12"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          <FormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                hasError={!!errors.confirmPassword}
                className="pr-12"
                {...register("confirmPassword")}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </FormField>
        </div>
      </div>
    </div>
  );
}