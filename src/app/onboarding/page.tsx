"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Question {
  key: string;
  label: string;
  options: string[];
  multi?: boolean;
  condition?: (answers: Record<string, any>) => boolean;
}

const questions: Question[] = [
  { key: "gender", label: "What's your gender?", options: ["male", "female"] },
  { key: "age_range", label: "Your age range?", options: ["18-25", "26-35", "36-45", "46-55", "55+"] },
  { key: "activity_level", label: "How active are you?", options: ["low", "moderate", "high"] },
  { key: "chronotype", label: "Are you a morning or evening person?", options: ["early bird", "night owl", "somewhere in between"] },
  { key: "sleep_hours", label: "How many hours do you sleep?", options: ["less than 5", "5-6 hours", "6-7 hours", "7-8 hours", "8+ hours"] },
  { key: "work_schedule", label: "What's your work schedule?", options: ["9-5 office", "shift work", "remote/flexible", "student", "stay at home"] },
  { key: "living_situation", label: "Living situation?", options: ["alone", "with partner", "with family", "with roommates"] },
  { key: "weight_goal", label: "What's your weight goal?", options: ["lose weight", "maintain weight", "gain muscle", "not focused on weight"] },
  { key: "diet_type", label: "Diet preference?", options: ["no restriction", "vegetarian", "vegan", "keto", "halal", "pescatarian"] },
  { key: "allergies", label: "Any food allergies? (select all)", options: ["none", "dairy", "gluten", "nuts", "shellfish", "eggs", "soy"], multi: true },
  { key: "health_conditions", label: "Any health conditions? (select all)", options: ["none", "diabetes", "thyroid issues", "IBS/digestive", "high blood pressure", "cholesterol"], multi: true },
  { key: "has_pcos", label: "Do you have PCOS/PMOS?", options: ["no", "yes"], condition: (a) => a.gender === "female" },
  { key: "pcos_severity", label: "How would you rate your PCOS severity?", options: ["mild", "moderate", "severe"], condition: (a) => a.has_pcos === "yes" },
  { key: "pcos_insulin_resistant", label: "Do you have insulin resistance?", options: ["no", "yes", "not sure"], condition: (a) => a.has_pcos === "yes" },
  { key: "pcos_inflammation", label: "Do you experience chronic inflammation?", options: ["no", "yes", "not sure"], condition: (a) => a.has_pcos === "yes" },
  { key: "cooking_skill", label: "Your cooking skill level?", options: ["beginner", "intermediate", "advanced"] },
  { key: "prep_time_preference", label: "How much time for cooking per meal?", options: ["15 minutes", "30 minutes", "45 minutes", "1 hour+"] },
  { key: "kitchen_equipment", label: "What kitchen equipment do you have? (select all)", options: ["oven", "air fryer", "blender", "instant pot", "microwave only", "full kitchen"], multi: true },
  { key: "preferred_cuisines", label: "Preferred cuisines? (select all)", options: ["mediterranean", "asian", "indian", "mexican", "middle eastern", "american", "italian"], multi: true },
  { key: "protein_preferences", label: "Protein preferences? (select all)", options: ["chicken", "beef", "fish", "eggs", "tofu/tempeh", "legumes", "dairy"], multi: true },
  { key: "spice_preference", label: "Spice tolerance?", options: ["mild", "medium", "spicy", "extra spicy"] },
  { key: "meals_per_day", label: "How many meals per day?", options: ["2", "3", "4", "5"] },
  { key: "snacking_habits", label: "How do you snack?", options: ["rarely snack", "healthy snacks only", "snack frequently", "emotional snacker"] },
  { key: "emotional_eating", label: "Do you eat when stressed or emotional?", options: ["never", "sometimes", "often", "working on it"] },
  { key: "water_goal_ml", label: "Daily water goal?", options: ["1500", "2000", "2500", "3000", "3500"] },
  { key: "budget", label: "Weekly food budget?", options: ["tight", "moderate", "flexible"] },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const router = useRouter();
  const { saveProfile, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.onboarding_completed) {
      router.push("/dashboard");
      return;
    }
    const saved = localStorage.getItem("mornprep_onboarding");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnswers(parsed.answers || {});
      setStep(parsed.step || 0);
    }
  }, [user, loading, router]);

  const activeQuestions = questions.filter(
    (q) => !q.condition || q.condition(answers)
  );

  const current = activeQuestions[step];
  const isLast = step === activeQuestions.length - 1;
  const progress = ((step + 1) / activeQuestions.length) * 100;

  function saveProgress(newAnswers: Record<string, any>, newStep: number) {
    localStorage.setItem("mornprep_onboarding", JSON.stringify({ answers: newAnswers, step: newStep }));
  }

  function handleSelect(value: string) {
    if (current.multi) {
      setMultiSelect((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
      return;
    }

    const newAnswers = { ...answers, [current.key]: value };
    setAnswers(newAnswers);

    if (isLast) {
      finishOnboarding(newAnswers);
    } else {
      const nextStep = step + 1;
      setStep(nextStep);
      saveProgress(newAnswers, nextStep);
    }
  }

  function handleMultiNext() {
    const newAnswers = { ...answers, [current.key]: multiSelect };
    setAnswers(newAnswers);
    setMultiSelect([]);

    if (isLast) {
      finishOnboarding(newAnswers);
    } else {
      const nextStep = step + 1;
      setStep(nextStep);
      saveProgress(newAnswers, nextStep);
    }
  }

  async function finishOnboarding(data: Record<string, any>) {
    const profile = {
      gender: data.gender,
      age_range: data.age_range,
      activity_level: data.activity_level,
      chronotype: data.chronotype,
      sleep_hours: data.sleep_hours,
      work_schedule: data.work_schedule,
      living_situation: data.living_situation,
      weight_goal: data.weight_goal,
      diet_type: data.diet_type,
      allergies: data.allergies || [],
      health_conditions: data.health_conditions || [],
      has_pcos: data.has_pcos === "yes",
      pcos_severity: data.pcos_severity || null,
      pcos_insulin_resistant: data.pcos_insulin_resistant === "yes",
      pcos_inflammation: data.pcos_inflammation === "yes",
      cooking_skill: data.cooking_skill,
      prep_time_preference: data.prep_time_preference,
      kitchen_equipment: data.kitchen_equipment || [],
      preferred_cuisines: data.preferred_cuisines || [],
      protein_preferences: data.protein_preferences || [],
      spice_preference: data.spice_preference,
      meals_per_day: parseInt(data.meals_per_day) || 3,
      snacking_habits: data.snacking_habits,
      emotional_eating: data.emotional_eating,
      water_goal_ml: parseInt(data.water_goal_ml) || 2500,
      budget: data.budget,
      onboarding_completed: true,
    };

    await saveProfile(profile);
    localStorage.removeItem("mornprep_onboarding");
    router.push("/dashboard");
  }

  if (!current) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-emerald-50" />
      <div className="absolute top-10 -right-20 w-72 h-72 rounded-full blur-[80px] opacity-30 animate-blob"
        style={{ background: "var(--color-primary)" }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-[80px] opacity-20 animate-blob-delay"
        style={{ background: "var(--color-accent)" }} />

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        {/* Progress */}
        <div className="text-center mb-5">
          <p className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
            {step + 1} of {activeQuestions.length}
          </p>
          <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: "var(--border-glass)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: "var(--color-primary)" }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass" key={step}>
          <h2 className="text-lg font-semibold mb-5 text-center" style={{ color: "var(--text-primary)" }}>
            {current.label}
          </h2>

          <div className="space-y-2.5">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full py-3.5 px-4 rounded-xl text-left font-medium transition-all duration-200 active:scale-[0.97] ${
                  current.multi && multiSelect.includes(opt)
                    ? "shadow-md"
                    : "hover:translate-x-1"
                }`}
                style={{
                  background: current.multi && multiSelect.includes(opt)
                    ? `color-mix(in srgb, var(--color-primary) 12%, white)`
                    : "var(--bg-card-solid)",
                  border: current.multi && multiSelect.includes(opt)
                    ? "2px solid var(--color-primary)"
                    : "2px solid var(--border-glass)",
                  color: "var(--text-primary)",
                }}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>

          {current.multi && (
            <button
              onClick={handleMultiNext}
              className="btn-primary w-full mt-5"
              disabled={multiSelect.length === 0}
              style={{ opacity: multiSelect.length === 0 ? 0.5 : 1 }}
            >
              Continue ({multiSelect.length} selected)
            </button>
          )}

          {step > 0 && (
            <button
              onClick={() => { setStep(step - 1); setMultiSelect([]); }}
              className="btn-ghost w-full mt-3 text-sm"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
