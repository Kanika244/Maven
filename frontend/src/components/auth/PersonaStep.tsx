import { useState } from "react";
import { useFormContext } from "react-hook-form";

import type { RegisterFormData } from "../../schemas/registerSchema";
import { personaQuestions } from "../../data/personaQuestions";

import OptionCard from "../ui/OptionCard";

interface PersonaStepProps {
  currentQuestion: number;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
}

export default function PersonaStep({ currentQuestion, setCurrentQuestion }: PersonaStepProps) {
  const { watch, setValue } = useFormContext<RegisterFormData>();

  const answers = watch("personaAnswers") || [];

  const question = personaQuestions[currentQuestion];

  function selectAnswer(answerIndex: number) {
    const updated = [...answers];

    // Store the selected option index
    updated[currentQuestion] = answerIndex;

    setValue("personaAnswers", updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div>
        <p className="text-sm text-slate-500">
          Question {currentQuestion + 1} of {personaQuestions.length}
        </p>

        <div className="mt-3 h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-slate-900 transition-all duration-300"
            style={{
              width: `${
                ((currentQuestion + 1) / personaQuestions.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <OptionCard
            key={option.answer_id}
            label={option.answer}
            selected={answers[currentQuestion] === index}
            onClick={() => selectAnswer(index)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={answers[currentQuestion] === undefined}
          onClick={() => {
            if (currentQuestion < personaQuestions.length - 1) {
              setCurrentQuestion((prev) => prev + 1);
            }
          }}
          className="rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {currentQuestion === personaQuestions.length - 1
            ? "Finish"
            : "Next"}
        </button>
      </div>
    </div>
  );
}