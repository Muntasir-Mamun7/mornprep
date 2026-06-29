"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Meal } from "@/lib/types";
import { formatDate, formatDisplay, getDaysLeftInWeek } from "@/lib/dates";
import { addDays, startOfWeek } from "date-fns";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function PlannerPage() {
  const { user, loading, refreshKey } = useAuth();
  const router = useRouter();
  const [weekMeals, setWeekMeals] = useState<Record<string, Meal[]>>({});
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [addingMeal, setAddingMeal] = useState("");
  const [addType, setAddType] = useState<Meal["meal_type"]>("lunch");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const loadWeek = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.auth.refreshSession();
      const start = startOfWeek(new Date(), { weekStartsOn: 6 });
      const dates = Array.from({ length: 7 }, (_, i) => formatDate(addDays(start, i)));

      const { data } = await supabase.from("meals").select("*")
        .eq("user_id", user.id).in("date", dates).order("created_at");

      if (data) {
        const grouped: Record<string, Meal[]> = {};
        dates.forEach((d) => (grouped[d] = []));
        data.forEach((m: Meal) => {
          if (!grouped[m.date]) grouped[m.date] = [];
          grouped[m.date].push(m);
        });
        setWeekMeals(grouped);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) loadWeek();
  }, [user, loadWeek, refreshKey]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && user) loadWeek();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user, loadWeek]);

  async function addPlannedMeal() {
    if (!user || !addingMeal.trim()) return;
    await supabase.from("meals").insert({
      user_id: user.id, name: addingMeal, meal_type: addType,
      date: selectedDate, status: "planned", is_in_fridge: false,
    });
    setAddingMeal("");
    loadWeek();
  }

  if (!user) return null;

  const start = startOfWeek(new Date(), { weekStartsOn: 6 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const daysLeft = getDaysLeftInWeek();
  const totalPlanned = Object.values(weekMeals).flat().filter((m) => m.status === "planned").length;
  const totalReady = Object.values(weekMeals).flat().filter((m) => m.status === "cooked" || m.is_in_fridge).length;

  return (
    <div className="page-container">
      <Header />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Week Planner</h2>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{daysLeft} days left</p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{totalReady} ready · {totalPlanned} to prep</p>
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
            <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
              className="flex-shrink-0 w-12 py-2.5 rounded-xl text-center transition-all duration-200 active:scale-95"
              style={{
                background: isSelected ? "var(--color-primary)" : isToday ? "color-mix(in srgb, var(--color-primary) 10%, var(--bg-card))" : "var(--bg-card)",
                border: `1.5px solid ${isSelected ? "var(--color-primary)" : "var(--border-glass)"}`,
                color: isSelected ? "white" : "var(--text-primary)",
                boxShadow: isSelected ? "0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent)" : "none",
              }}>
              <p className="text-[10px] font-medium" style={{ opacity: isSelected ? 1 : 0.7 }}>
                {day.toLocaleDateString("en", { weekday: "short" })}
              </p>
              <p className="text-lg font-bold">{day.getDate()}</p>
              {count > 0 && (
                <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5"
                  style={{ background: isSelected ? "white" : "var(--color-primary)" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day meals */}
      <div className="glass mb-4">
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
          {formatDisplay(new Date(selectedDate + "T12:00:00"))}
        </h3>

        {(weekMeals[selectedDate] || []).length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No meals planned</p>
        ) : (
          <ul className="space-y-2">
            {(weekMeals[selectedDate] || []).map((meal) => (
              <li key={meal.id} className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "var(--border-glass)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{meal.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{meal.meal_type}</p>
                </div>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{
                  background: meal.status === "eaten" ? "rgba(34, 197, 94, 0.1)"
                    : meal.status === "cooked" ? "rgba(59, 130, 246, 0.1)"
                    : "color-mix(in srgb, var(--text-muted) 10%, transparent)",
                  color: meal.status === "eaten" ? "#16a34a" : meal.status === "cooked" ? "#2563eb" : "var(--text-secondary)",
                }}>
                  {meal.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick add */}
      <div className="glass">
        <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>Add to Plan</h3>
        <div className="flex gap-2 mb-2.5 flex-wrap">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((t) => (
            <button key={t} onClick={() => setAddType(t)}
              className="text-xs px-2.5 py-1.5 rounded-xl transition-all"
              style={{
                background: addType === t ? "color-mix(in srgb, var(--color-primary) 12%, var(--bg-card))" : "var(--bg-card)",
                border: addType === t ? "1.5px solid var(--color-primary)" : "1.5px solid var(--border-glass)",
                color: addType === t ? "var(--color-primary)" : "var(--text-secondary)",
              }}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={addingMeal} onChange={(e) => setAddingMeal(e.target.value)}
            placeholder="Meal name..." className="input-field text-sm flex-1"
            onKeyDown={(e) => e.key === "Enter" && addPlannedMeal()} />
          <button onClick={addPlannedMeal} className="btn-primary text-sm px-4">Add</button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
