import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full
          rounded-xl
          border
          px-4
          py-3
          text-sm
          bg-white
          transition-all
          outline-none

          ${
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          }

          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;