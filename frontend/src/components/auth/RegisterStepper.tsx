interface RegisterStepperProps {
  currentStep: number;
}

const steps = [
  "Basic",
  "Verification",
  "Persona",
  "Review",
];

export default function RegisterStepper({
  currentStep,
}: RegisterStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const active = index <= currentStep;

          return (
            <div
              key={step}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full
                    text-sm font-semibold transition-all

                    ${
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-500"
                    }
                  `}
                >
                  {index + 1}
                </div>

                <span
                  className={`mt-2 text-sm ${
                    active
                      ? "font-medium text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-3 h-[2px] flex-1 ${
                    index < currentStep
                      ? "bg-slate-900"
                      : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}