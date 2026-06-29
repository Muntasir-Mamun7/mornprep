"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getDaysLeftInWeek, formatDisplay } from "@/lib/dates";
import { getDietTips, getFoodGuidance } from "@/lib/guidance";
import { Meal } from "@/lib/types";
import Header from "@/components/Header";
import { DashboardSkeleton } from "@/components/Skeleton";
import BottomNav from "@/components/BottomNav";

export default function DashboardPage() {
  const { user, loading, refreshKey } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [todayFood, setTodayFood] = useState("");
  const [guidance, setGuidance] = useState<{ rating: string; message: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const loadTodayMeals = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today);
    if (data) setMeals(data);
    setDataLoading(false);
  }, [user]);

  // Load on mount and reload whenever session refreshes
  useEffect(() => {
    if (user) loadTodayMeals();
  }, [user, loadTodayMeals, refreshKey]);

  // Reload data when app comes back from background
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && user) {
        supabase.auth.refreshSession().then(() => loadTodayMeals());
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user, loadTodayMeals]);

  function checkFood() {
    if (!todayFood.trim() || !user) return;
    const result = getFoodGuidance(todayFood, user);
    setGuidance(result);
  }

  if (!user) return null;

  const daysLeft = getDaysLeftInWeek();
  const readyMeals = meals.filter((m) => m.status === "cooked" || m.is_in_fridge).length;
  const plannedMeals = meals.filter((m) => m.status === "planned").length;
  const lastMeal = meals.length > 0 ? meals[meals.length - 1] : null;
  const dietTips = getDietTips(user, lastMeal?.meal_type as any, lastMeal?.name);

  return (
    <div className="page-container">
      <Header />

      {dataLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="animate-fade-in space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-sm text-center py-4">
              <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{readyMeals}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Ready</p>
            </div>
            <div className="glass-sm text-center py-4">
              <p className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>{plannedMeals}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Planned</p>
            </div>
            <div className="glass-sm text-center py-4">
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{daysLeft}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Days Left</p>
            </div>
          </div>

          {/* Food Check */}
          <div className="glass">
            <h3 className="font-semibold text-sm mb-2.5" style={{ color: "var(--text-primary)" }}>
              What did you eat?
            </h3>
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
              <div className="mt-3 p-3 rounded-xl animate-scale-in" style={{
                background: guidance.rating === "good" ? "rgba(34, 197, 94, 0.06)"
                  : guidance.rating === "bad" ? "rgba(239, 68, 68, 0.06)"
                  : "rgba(234, 179, 8, 0.06)",
              }}>
                <span className={`badge-${guidance.rating}`}>
                  {guidance.rating.toUpperCase()}
                </span>
                <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                  {guidance.message}
                </p>
              </div>
            )}
          </div>

          {/* Diet Tips */}
          <div className="glass">
            <h3 className="font-semibold text-sm mb-2.5" style={{ color: "var(--text-primary)" }}>
              Diet Tips {user.has_pcos && "(PCOS Plan)"}
            </h3>
            <ul className="space-y-2">
              {dietTips.slice(0, 4).map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: "var(--color-primary)" }} />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Today's Meals */}
          <div className="glass">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Today&apos;s Meals</h3>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {formatDisplay(new Date())}
              </span>
            </div>
            {meals.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                No meals logged yet today.
              </p>
            ) : (
              <ul className="space-y-2">
                {meals.map((meal) => (
                  <li key={meal.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border-glass)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{meal.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{meal.meal_type}</p>
                    </div>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{
                      background: meal.status === "eaten" ? "rgba(34, 197, 94, 0.1)"
                        : meal.status === "cooked" ? "rgba(59, 130, 246, 0.1)"
                        : "color-mix(in srgb, var(--text-muted) 10%, transparent)",
                      color: meal.status === "eaten" ? "#16a34a"
                        : meal.status === "cooked" ? "#2563eb"
                        : "var(--text-secondary)",
                    }}>
                      {meal.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
