"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getDaysLeftInWeek, formatDisplay } from "@/lib/dates";
import { getDietPlan, getFoodGuidance } from "@/lib/guidance";
import { Meal } from "@/lib/types";
import BottomNav from "@/components/BottomNav";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [todayFood, setTodayFood] = useState("");
  const [guidance, setGuidance] = useState<{
    rating: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadTodayMeals();
  }, [user]);

  async function loadTodayMeals() {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today);
    if (data) setMeals(data);
  }

  function checkFood() {
    if (!todayFood.trim() || !user) return;
    const result = getFoodGuidance(todayFood, user);
    setGuidance(result);
  }

  if (loading || !user) return null;

  const daysLeft = getDaysLeftInWeek();
  const readyMeals = meals.filter(
    (m) => m.status === "cooked" || m.is_in_fridge
  ).length;
  const plannedMeals = meals.filter((m) => m.status === "planned").length;
  const dietTips = getDietPlan(user);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-brand-700">MoRNPrep</h1>
          <p className="text-sm text-gray-500">
            Hi, {user.name}
          </p>
        </div>
        <button onClick={() => router.push("/login")} className="btn-ghost text-xs">
          Logout
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-brand-600">{readyMeals}</p>
          <p className="text-[11px] text-gray-500">Ready / Fridge</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-sage-600">{plannedMeals}</p>
          <p className="text-[11px] text-gray-500">Planned Today</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-700">{daysLeft}</p>
          <p className="text-[11px] text-gray-500">Days Left</p>
        </div>
      </div>

      {/* Food Check */}
      <div className="card mb-4">
        <h3 className="font-semibold text-sm mb-2">What did you eat today?</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={todayFood}
            onChange={(e) => setTodayFood(e.target.value)}
            placeholder="e.g. grilled chicken salad"
            className="input-field flex-1 text-sm"
            onKeyDown={(e) => e.key === "Enter" && checkFood()}
          />
          <button onClick={checkFood} className="btn-primary text-sm px-4">
            Check
          </button>
        </div>
        {guidance && (
          <div className={`mt-3 p-3 rounded-lg ${
            guidance.rating === "good"
              ? "bg-green-50"
              : guidance.rating === "bad"
              ? "bg-red-50"
              : "bg-yellow-50"
          }`}>
            <span className={`badge-${guidance.rating} mb-1`}>
              {guidance.rating.toUpperCase()}
            </span>
            <p className="text-sm mt-1 text-gray-700">{guidance.message}</p>
          </div>
        )}
      </div>

      {/* Diet Tips */}
      {dietTips.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-semibold text-sm mb-2">
            Your Diet Tips {user.has_pcos && "(PCOS Plan)"}
          </h3>
          <ul className="space-y-1.5">
            {dietTips.slice(0, 4).map((tip, i) => (
              <li key={i} className="text-xs text-gray-600 flex gap-2">
                <span className="text-brand-400">-</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Today&apos;s Meals</h3>
          <span className="text-xs text-gray-400">
            {formatDisplay(new Date())}
          </span>
        </div>
        {meals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No meals logged yet. Go to Meals to add some.
          </p>
        ) : (
          <ul className="space-y-2">
            {meals.map((meal) => (
              <li
                key={meal.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{meal.name}</p>
                  <p className="text-[11px] text-gray-400">{meal.meal_type}</p>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    meal.status === "eaten"
                      ? "bg-green-100 text-green-700"
                      : meal.status === "cooked"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {meal.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
