import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import RegisterStepper from "../../components/auth/RegisterStepper";
import BasicInfoStep from "../../components/auth/BasicInfoStep";
import VerificationStep from "../../components/auth/VerificationStep";
import PersonaStep from "../../components/auth/PersonaStep";
import ReviewStep from "../../components/auth/ReviewStep";
import Logo from "../../components/common/Logo";

import {
  registerSchema,
  type RegisterFormData,
} from "../../schemas/registerSchema";

import { personaQuestions } from "../../data/personaQuestions";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [currentPersonaQuestion, setCurrentPersonaQuestion] = useState(0);

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      // Step 1
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      occupation: "",
      annualIncome: "",
      city: "",
      state: "",

      // Step 2
      email: "",
      phone: "",
      pan: "",
      aadhaar: "",
      password: "",
      confirmPassword: "",

      // Step 3
      personaAnswers: [],
    },
  });

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCreateAccount = () => {
    // Later:
    // await registerUser(methods.getValues());

    navigate("/register/success");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep />;

      case 1:
        return <VerificationStep />;

      case 2:
        return (
          <PersonaStep
            currentQuestion={currentPersonaQuestion}
            setCurrentQuestion={setCurrentPersonaQuestion}
          />
        );

      case 3:
        return <ReviewStep />;

      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-10 flex flex-col items-center">
            <Logo />

            <h1 className="mt-8 text-3xl font-semibold text-slate-900">
              Create your MAVEN account
            </h1>

            <p className="mt-2 text-center text-slate-500">
              Complete your profile in a few simple steps.
            </p>
          </div>

          {/* Stepper */}
          <RegisterStepper currentStep={currentStep} />

          {/* Current Step */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="rounded-xl border border-slate-300 px-6 py-3 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={
                currentStep === 3
                  ? handleCreateAccount
                  : nextStep
              }
              disabled={
                currentStep === 2 &&
                currentPersonaQuestion < personaQuestions.length - 1
              }
              className="rounded-xl bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {currentStep === 3 ? "Create Account" : "Continue"}
            </button>
          </div>
        </div>
      </main>
    </FormProvider>
  );
}