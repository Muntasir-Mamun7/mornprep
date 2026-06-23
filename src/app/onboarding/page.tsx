"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const questions = [
  {
    key: "gender",
    label: "What's your gender?",
    options: ["male", "female"],
  },
  {
    key: "age_range",
    label: "Your age range?",
    options: ["18-25", "26-35", "36-45", "46-55", "55+"],
  },
  {
    key: "activity_level",
    label: "How active are you?",
    options: ["low", "moderate", "high"],
  },
  {
    key: "diet_type",
    label: "Diet preference?",
    options: ["no restriction", "vegetarian", "vegan", "keto", "halal"],
  },
  {
    key: "allergies",
    label: "Any food allergies? (select all)",
    options: ["none", "dairy", "gluten", "nuts", "shellfish", "eggs", "soy"],
    multi: true,
  },
  {
    key: "cooking_skill",
    label: "Cooking skill level?",
    options: ["beginner", "intermediate", "advanced"],
  },
  {
    key: "meals_per_day",
    label: "How many meals per day?",
    options: ["2", "3", "4", "5"],
  },
  {
    key: "spice_preference",
    label: "Spice tolerance?",
    options: ["mild", "medium", "spicy", "extra spicy"],
  },
  {
    key: "budget",
    label: "Weekly food budget?",
    options: ["tight", "moderate", "flexible"],
  },
  {
    key: "has_pcos",
    label: "Do you have PCOS/PMOS?",
    options: ["no", "yes"],
    condition: (answers: Record<string, any>) => answers.gender === "female",
  },
];

const pcosQuestions = [
  {
    key: "pcos_severity",
    label: "How would you rate your PCOS severity?",
    options: ["mild", "moderate", "severe"],
  },
  {
    key: "pcos_insulin_resistant",
    label: "Do you have insulin resistance?",
    options: ["no", "yes", "not sure"],
  },
  {
    key: "pcos_inflammation",
    label: "Do you experience chronic inflammation?",
    options: ["no", "yes", "not sure"],
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const router = useRouter();
  const { saveProfile } = useAuth();

  const allQuestions = [
    ...questions.filter(
      (q) => !q.condition || q.condition(answers)
    ),
    ...(answers.has_pcos === "yes" ? pcosQuestions : []),
  ];

  const current = allQuestions[step];
  const isLast = step === allQuestions.length - 1;

  function handleSelect(value: string) {
    if (current.multi) {
      setMultiSelect((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
      return;
    }

    const newAnswers = { ...answers, [current.key]: value };
    setAnswers(newAnswers);

    if (isLast) {
      saveProfileData(newAnswers);
    } else {
      setStep(step + 1);
    }
  }

  function handleMultiNext() {
    const newAnswers = { ...answers, [current.key]: multiSelect };
    setAnswers(newAnswers);
    setMultiSelect([]);

    if (isLast) {
      saveProfileData(newAnswers);
    } else {
      setStep(step + 1);
    }
  }

  async function saveProfileData(data: Record<string, any>) {
    const profile = {
      gender: data.gender,
      age_range: data.age_range,
      activity_level: data.activity_level,
      diet_type: data.diet_type,
      allergies: data.allergies || [],
      cooking_skill: data.cooking_skill,
      meals_per_day: parseInt(data.meals_per_day) || 3,
      spice_preference: data.spice_preference,
      budget: data.budget,
      has_pcos: data.has_pcos === "yes",
      pcos_severity: data.pcos_severity || null,
      pcos_insulin_resistant: data.pcos_insulin_resistant === "yes",
      pcos_inflammation: data.pcos_inflammation === "yes",
    };

    await saveProfile(profile);
    router.push("/dashboard");
  }

  if (!current) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-sm text-brand-500 font-medium">
            {step + 1} / {allQuestions.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / allQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            {current.label}
          </h2>

          <div className="space-y-2">
            {current.options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full py-3 px-4 rounded-xl text-left font-medium transition-all ${
                  current.multi && multiSelect.includes(opt)
                    ? "bg-brand-100 border-2 border-brand-400 text-brand-700"
                    : "bg-gray-50 border-2 border-transparent hover:bg-brand-50 hover:border-brand-200 text-gray-700"
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>

          {current.multi && (
            <button
              onClick={handleMultiNext}
              className="btn-primary w-full mt-4"
              disabled={multiSelect.length === 0}
            >
              Continue
            </button>
          )}

          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-ghost w-full mt-3"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
