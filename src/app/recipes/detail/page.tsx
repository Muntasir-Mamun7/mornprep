"use client";

import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Recipe } from "@/lib/types";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

function RecipeDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("id");
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && recipeId) loadRecipe();
  }, [user, recipeId]);

  async function loadRecipe() {
    const { data } = await supabase.from("recipes").select("*").eq("id", recipeId).single();
    if (data) setRecipe(data);
  }

  async function deleteRecipe() {
    if (!recipe) return;
    await supabase.from("recipes").delete().eq("id", recipe.id);
    router.push("/recipes");
  }

  async function shareRecipe() {
    if (!recipe) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase.from("recipes").update({ is_shared: true, share_code: code }).eq("id", recipe.id);
    loadRecipe();
  }

  if (!user || !recipe) return null;

  return (
    <div className="page-container">
      <Header />

      <button onClick={() => router.push("/recipes")} className="btn-ghost text-sm mb-4">
        ← Back
      </button>

      {/* Hero image */}
      {recipe.image_url && (
        <div className="rounded-2xl overflow-hidden mb-4 shadow-lg">
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-48 object-cover" />
        </div>
      )}

      <div className="glass mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>{recipe.title}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {recipe.cook_time_mins} min · {recipe.servings} servings
            </p>
          </div>
          {recipe.share_code && (
            <div className="text-center">
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Share code</p>
              <p className="text-sm font-mono font-bold px-2 py-1 rounded-lg"
                style={{ background: "color-mix(in srgb, var(--color-accent) 10%, var(--bg-card))", color: "var(--color-accent)" }}>
                {recipe.share_code}
              </p>
            </div>
          )}
        </div>
        {recipe.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {recipe.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full"
                style={{ background: "color-mix(in srgb, var(--color-primary) 8%, var(--bg-card))", color: "var(--color-primary)" }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="glass mb-4">
        <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--color-accent)" }}>Ingredients</h2>
        <ul className="space-y-1.5">
          {recipe.ingredients.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "var(--color-accent)" }} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass mb-4">
        <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--color-primary)" }}>Cooking Steps</h2>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "color-mix(in srgb, var(--color-primary) 12%, var(--bg-card))", color: "var(--color-primary)" }}>
                {i + 1}
              </span>
              <p className="pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex gap-3">
        {!recipe.share_code && (
          <button onClick={shareRecipe} className="btn-secondary flex-1 text-sm">Share Recipe</button>
        )}
        <button onClick={deleteRecipe} className="flex-1 text-sm py-3 rounded-2xl font-medium transition-all active:scale-[0.97]"
          style={{ background: "rgba(239, 68, 68, 0.08)", color: "#dc2626", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
          Delete
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<div className="page-container"><p style={{ color: "var(--text-muted)" }}>Loading...</p></div>}>
      <RecipeDetail />
    </Suspense>
  );
}
