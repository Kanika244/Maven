interface OptionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionCard({
  label,
  selected,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        rounded-2xl
        border
        p-5
        text-left
        transition-all
        duration-200

        ${
          selected
            ? "border-slate-900 bg-slate-900 text-white shadow-lg"
            : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-md"
        }
      `}
    >
      <p className="font-medium">
        {label}
      </p>
    </button>
  );
}