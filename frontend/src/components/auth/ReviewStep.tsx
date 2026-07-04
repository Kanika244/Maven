import { useFormContext } from "react-hook-form";

import type { RegisterFormData } from "../../schemas/registerSchema";

import { personaQuestions } from "../../data/personaQuestions";

export default function ReviewStep() {
  const { watch } = useFormContext<RegisterFormData>();

  const data = watch();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Review Your Information
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please verify your details before creating your account.
        </p>
      </div>

      {/* Personal Information */}
      <section className="rounded-xl border border-slate-200 p-6">
        <h3 className="mb-5 text-lg font-semibold text-slate-900">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoItem label="First Name" value={data.firstName} />
          <InfoItem label="Last Name" value={data.lastName} />
          <InfoItem label="Date of Birth" value={data.dob} />
          <InfoItem label="Gender" value={data.gender} />
          <InfoItem label="Occupation" value={data.occupation} />
          <InfoItem label="Annual Income" value={data.annualIncome} />
          <InfoItem label="City" value={data.city} />
          <InfoItem label="State" value={data.state} />
        </div>
      </section>

      {/* Verification */}
      <section className="rounded-xl border border-slate-200 p-6">
        <h3 className="mb-5 text-lg font-semibold text-slate-900">
          Verification
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoItem label="Email" value={data.email} />
          <InfoItem label="Phone" value={data.phone} />
          <InfoItem label="PAN" value={data.pan} />

          <InfoItem
            label="Aadhaar"
            value={
              data.aadhaar
                ? `********${data.aadhaar.slice(-4)}`
                : "-"
            }
          />
        </div>
      </section>

      {/* Persona */}
      <section className="rounded-xl border border-slate-200 p-6">
        <h3 className="mb-5 text-lg font-semibold text-slate-900">
          Investment Persona
        </h3>

        <div className="space-y-5">
          {personaQuestions.map((question, index) => {
            const answerIndex = data.personaAnswers?.[index];

            const selected =
              answerIndex !== undefined
                ? question.options[answerIndex]
                : undefined;

            return (
              <div
                key={question.question_id}
                className="border-b border-slate-100 pb-4 last:border-none"
              >
                <p className="font-medium text-slate-900">
                  {question.question}
                </p>

                <p className="mt-2 text-slate-600">
                  {selected?.answer ?? "-"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Message */}
      <div className="rounded-xl bg-slate-100 p-5">
        <p className="text-sm text-slate-600">
          By clicking <strong>Create Account</strong>, you confirm that
          all the information provided is accurate and agree to the Terms
          & Conditions and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value?: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}