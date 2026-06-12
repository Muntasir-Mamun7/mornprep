"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Meal } from "@/lib/types";
import { formatDate, formatDisplay, getDaysLeftInWeek } from "@/lib/dates";
import { addDays, startOfWeek } from "date-fns";
import BottomNav from "@/components/BottomNav";

export default function PlannerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [weekMeals, setWeekMeals] = useState<Record<string, Meal[]>>({});
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [addingMeal, setAddingMeal] = useState("");
  const [addType, setAddType] = useState<Meal["meal_type"]>("lunch");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadWeek();
  }, [user]);

  async function loadWeek() {
    if (!user) return;
    const start = startOfWeek(new Date(), { weekStartsOn: 6 });
    const dates = Array.from({ length: 7 }, (_, i) =>
      formatDate(addDays(start, i))
    );

    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .in("date", dates)
      .order("created_at");

    if (data) {
      const grouped: Record<string, Meal[]> = {};
      dates.forEach((d) => (grouped[d] = []));
      data.forEach((m: Meal) => {
        if (!grouped[m.date]) grouped[m.date] = [];
        grouped[m.date].push(m);
      });
      setWeekMeals(grouped);
    }
  }

  async function addPlannedMeal() {
    if (!user || !addingMeal.trim()) return;
    await supabase.from("meals").insert({
      user_id: user.id,
      name: addingMeal,
      meal_type: addType,
      date: selectedDate,
      status: "planned",
      is_in_fridge: false,
    });
    setAddingMeal("");
    loadWeek();
  }

  if (loading || !user) return null;

  const start = startOfWeek(new Date(), { weekStartsOn: 6 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const daysLeft = getDaysLeftInWeek();

  const totalPlanned = Object.values(weekMeals).flat().filter(m => m.status === "planned").length;
  const totalReady = Object.values(weekMeals).flat().filter(m => m.status === "cooked" || m.is_in_fridge).length;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl text-brand-700">Week Planner</h1>
        <div className="text-right">
          <p className="text-xs text-gray-500">{daysLeft} days left</p>
          <p className="text-[11px] text-gray-400">
            {totalReady} ready · {totalPlanned} to prep
          </p>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
        {weekDays.map((day) => {
          const dateStr = formatDate(day);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === formatDate(new Date());
          const count = (weekMeals[dateStr] || []).length;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex-shrink-0 w-12 py-2 rounded-xl text-center transition-all ${
                isSelected
                  ? "bg-brand-500 text-white shadow-md"
                  : isToday
                  ? "bg-brand-100 text-brand-700"
                  : "bg-white text-gray-600"
              }`}
            >
              <p className="text-[10px] font-medium">
                {day.toLocaleDateString("en", { weekday: "short" })}
              </p>
              <p className="text-lg font-bold">{day.getDate()}</p>
              {count > 0 && (
                <div
                  className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${
                    isSelected ? "bg-white" : "bg-brand-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day meals */}
      <div className="card mb-4">
        <h3 className="font-semibold text-sm mb-3">
          {formatDisplay(new Date(selectedDate + "T12:00:00"))}
        </h3>

        {(weekMeals[selectedDate] || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">
            No meals planned
          </p>
        ) : (
          <ul className="space-y-2">
            {(weekMeals[selectedDate] || []).map((meal) => (
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

      {/* Quick add */}
      <div className="card">
        <h3 className="font-semibold text-sm mb-2">Add to Plan</h3>
        <div className="flex gap-2 mb-2 flex-wrap">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setAddType(t)}
              className={`text-xs px-2.5 py-1 rounded-lg border ${
                addType === t
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={addingMeal}
            onChange={(e) => setAddingMeal(e.target.value)}
            placeholder="Meal name..."
            className="input-field text-sm flex-1"
            onKeyDown={(e) => e.key === "Enter" && addPlannedMeal()}
          />
          <button onClick={addPlannedMeal} className="btn-primary text-sm px-4">
            Add
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
