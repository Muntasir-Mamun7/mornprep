"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Meal } from "@/lib/types";
import { getFoodGuidance } from "@/lib/guidance";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function MealsPage() {
  const { user, loading, refreshKey } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: "", meal_type: "lunch" as Meal["meal_type"],
    status: "planned" as Meal["status"], is_in_fridge: false,
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const loadMeals = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.auth.refreshSession();
      const { data } = await supabase.from("meals").select("*")
        .eq("user_id", user.id).order("date", { ascending: false }).limit(30);
      if (data) setMeals(data);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) loadMeals();
  }, [user, loadMeals, refreshKey]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && user) loadMeals();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user, loadMeals]);

  async function addMeal() {
    if (!user || !newMeal.name.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    const guidance = getFoodGuidance(newMeal.name, user);
    await supabase.from("meals").insert({
      user_id: user.id, name: newMeal.name, meal_type: newMeal.meal_type,
      date: today, status: newMeal.status, is_in_fridge: newMeal.is_in_fridge,
      guidance_rating: guidance.rating, guidance_note: guidance.message,
    });
    setNewMeal({ name: "", meal_type: "lunch", status: "planned", is_in_fridge: false });
    setShowAdd(false);
    loadMeals();
  }

  async function updateStatus(id: string, status: Meal["status"]) {
    await supabase.from("meals").update({ status }).eq("id", id);
    loadMeals();
  }

  async function deleteMeal(id: string) {
    await supabase.from("meals").delete().eq("id", id);
    loadMeals();
  }

  if (!user) return null;

  const fridgeMeals = meals.filter((m) => m.is_in_fridge && m.status !== "eaten");
  const otherMeals = meals.filter((m) => !m.is_in_fridge || m.status === "eaten");

  return (
    <div className="page-container">
      <Header />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>My Meals</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm px-4 py-2">
          + Add
        </button>
      </div>

      {showAdd && (
        <div className="glass mb-4 animate-slide-up">
          <input type="text" value={newMeal.name}
            onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
            placeholder="Meal name..." className="input-field text-sm mb-3" />

          <div className="flex gap-2 mb-3 flex-wrap">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((t) => (
              <button key={t} onClick={() => setNewMeal({ ...newMeal, meal_type: t })}
                className="text-xs px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: newMeal.meal_type === t ? "color-mix(in srgb, var(--color-primary) 12%, var(--bg-card))" : "var(--bg-card)",
                  border: newMeal.meal_type === t ? "1.5px solid var(--color-primary)" : "1.5px solid var(--border-glass)",
                  color: newMeal.meal_type === t ? "var(--color-primary)" : "var(--text-secondary)",
                }}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            {(["planned", "cooked", "eaten"] as const).map((s) => (
              <button key={s} onClick={() => setNewMeal({ ...newMeal, status: s })}
                className="text-xs px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: newMeal.status === s ? "color-mix(in srgb, var(--color-accent) 12%, var(--bg-card))" : "var(--bg-card)",
                  border: newMeal.status === s ? "1.5px solid var(--color-accent)" : "1.5px solid var(--border-glass)",
                  color: newMeal.status === s ? "var(--color-accent)" : "var(--text-secondary)",
                }}>
                {s}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
            <input type="checkbox" checked={newMeal.is_in_fridge}
              onChange={(e) => setNewMeal({ ...newMeal, is_in_fridge: e.target.checked })}
              className="rounded" />
            In fridge
          </label>

          <button onClick={addMeal} className="btn-primary w-full text-sm">Save Meal</button>
        </div>
      )}

      {fridgeMeals.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-accent)" }}>
            🧊 In Fridge ({fridgeMeals.length})
          </h3>
          <div className="space-y-2">
            {fridgeMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onUpdate={updateStatus} onDelete={deleteMeal} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>All Meals</h3>
        <div className="space-y-2">
          {otherMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onUpdate={updateStatus} onDelete={deleteMeal} />
          ))}
        </div>
        {meals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No meals yet. Tap + Add to start tracking.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function MealCard({ meal, onUpdate, onDelete }: {
  meal: Meal; onUpdate: (id: string, status: Meal["status"]) => void; onDelete: (id: string) => void;
}) {
  return (
    <div className="glass-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{meal.name}</p>
            {meal.guidance_rating && <span className={`badge-${meal.guidance_rating} !text-[9px]`}>{meal.guidance_rating}</span>}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{meal.meal_type} · {meal.date}</p>
          {meal.guidance_note && (
            <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>{meal.guidance_note}</p>
          )}
        </div>
        <div className="flex gap-1.5">
          {meal.status === "planned" && (
            <button onClick={() => onUpdate(meal.id, "cooked")}
              className="text-[10px] px-2.5 py-1 rounded-lg font-medium"
              style={{ background: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}>
              Cooked
            </button>
          )}
          {meal.status === "cooked" && (
            <button onClick={() => onUpdate(meal.id, "eaten")}
              className="text-[10
