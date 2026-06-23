"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Meal } from "@/lib/types";
import { getFoodGuidance } from "@/lib/guidance";
import BottomNav from "@/components/BottomNav";

export default function MealsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: "",
    meal_type: "lunch" as Meal["meal_type"],
    status: "planned" as Meal["status"],
    is_in_fridge: false,
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadMeals();
  }, [user]);

  async function loadMeals() {
    if (!user) return;
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);
    if (data) setMeals(data);
  }

  async function addMeal() {
    if (!user || !newMeal.name.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    const guidance = getFoodGuidance(newMeal.name, user);

    const { error } = await supabase.from("meals").insert({
      user_id: user.id,
      name: newMeal.name,
      meal_type: newMeal.meal_type,
      date: today,
      status: newMeal.status,
      is_in_fridge: newMeal.is_in_fridge,
      guidance_rating: guidance.rating,
      guidance_note: guidance.message,
    });

    if (!error) {
      setNewMeal({ name: "", meal_type: "lunch", status: "planned", is_in_fridge: false });
      setShowAdd(false);
      loadMeals();
    }
  }

  async function updateStatus(id: string, status: Meal["status"]) {
    await supabase.from("meals").update({ status }).eq("id", id);
    loadMeals();
  }

  async function deleteMeal(id: string) {
    await supabase.from("meals").delete().eq("id", id);
    loadMeals();
  }

  if (loading || !user) return null;

  const fridgeMeals = meals.filter((m) => m.is_in_fridge && m.status !== "eaten");
  const otherMeals = meals.filter((m) => !m.is_in_fridge || m.status === "eaten");

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-brand-700">My Meals</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm px-4 py-2">
          + Add
        </button>
      </div>

      {showAdd && (
        <div className="card mb-4">
          <input
            type="text"
            value={newMeal.name}
            onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
            placeholder="Meal name..."
            className="input-field text-sm mb-3"
          />
          <div className="flex gap-2 mb-3 flex-wrap">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNewMeal({ ...newMeal, meal_type: t })}
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  newMeal.meal_type === t
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3 flex-wrap">
            {(["planned", "cooked", "eaten"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setNewMeal({ ...newMeal, status: s })}
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  newMeal.status === s
                    ? "border-sage-400 bg-sage-50 text-sage-700"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm mb-3">
            <input
              type="checkbox"
              checked={newMeal.is_in_fridge}
              onChange={(e) => setNewMeal({ ...newMeal, is_in_fridge: e.target.checked })}
              className="rounded border-gray-300"
            />
            In fridge
          </label>
          <button onClick={addMeal} className="btn-primary w-full text-sm">
            Save Meal
          </button>
        </div>
      )}

      {fridgeMeals.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-sage-700 mb-2">
            In Fridge ({fridgeMeals.length})
          </h3>
          <div className="space-y-2">
            {fridgeMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onUpdate={updateStatus}
                onDelete={deleteMeal}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">All Meals</h3>
        <div className="space-y-2">
          {otherMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onUpdate={updateStatus}
              onDelete={deleteMeal}
            />
          ))}
        </div>
        {meals.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No meals yet. Tap + Add to start tracking.
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function MealCard({
  meal,
  onUpdate,
  onDelete,
}: {
  meal: Meal;
  onUpdate: (id: string, status: Meal["status"]) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card !p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{meal.name}</p>
            {meal.guidance_rating && (
              <span className={`badge-${meal.guidance_rating} !text-[9px] !px-1.5 !py-0.5`}>
                {meal.guidance_rating}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {meal.meal_type} · {meal.date}
          </p>
          {meal.guidance_note && (
            <p className="text-[11px] text-gray-500 mt-1">{meal.guidance_note}</p>
          )}
        </div>
        <div className="flex gap-1">
          {meal.status === "planned" && (
            <button
              onClick={() => onUpdate(meal.id, "cooked")}
              className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-md"
            >
              Cooked
            </button>
          )}
          {meal.status === "cooked" && (
            <button
              onClick={() => onUpdate(meal.id, "eaten")}
              className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded-md"
            >
              Eaten
            </button>
          )}
          <button
            onClick={() => onDelete(meal.id)}
            className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-md"
          >
            X
          </button>
        </div>
      </div>
    </div>
  );
}
