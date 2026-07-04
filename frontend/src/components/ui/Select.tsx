import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: {
    value: string;
    label: string;
  }[];
}

export default function Select({
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <select
      className={`
        w-full
        rounded-xl
        border
        border-slate-300
        bg-white
        px-4
        py-3
        text-sm
        outline-none
        transition-all
        duration-200
        focus:border-slate-900
        focus:ring-2
        focus:ring-slate-200
        ${className}
      `}
      {...props}
    >
      <option value="">Select an option</option>

      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}