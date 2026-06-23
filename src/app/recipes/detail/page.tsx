"use client";

import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Recipe } from "@/lib/types";
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
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .single();
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
    await supabase
      .from("recipes")
      .update({ is_shared: true, share_code: code })
      .eq("id", recipe.id);
    loadRecipe();
  }

  if (loading || !user || !recipe) return null;

  return (
    <div className="page-container">
      <button
        onClick={() => router.push("/recipes")}
        className="btn-ghost text-sm mb-4"
      >
        &larr; Back
      </button>

      <div className="card mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="font-display text-xl text-gray-800">{recipe.title}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {recipe.cook_time_mins} min · {recipe.servings} servings
            </p>
          </div>
          {recipe.share_code && (
            <div className="text-center">
              <p className="text-[10px] text-gray-400">Share code</p>
              <p className="text-sm font-mono font-bold text-sage-700 bg-sage-50 px-2 py-1 rounded">
                {recipe.share_code}
              </p>
            </div>
          )}
        </div>

        {recipe.tags.length > 0 && (
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-0.5 bg-brand-50 text-brand-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-sm text-sage-700 mb-2">Ingredients</h2>
        <ul className="space-y-1.5">
          {recipe.ingredients.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-2 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-sm text-brand-700 mb-2">Cooking Steps</h2>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <p className="pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex gap-3">
        {!recipe.share_code && (
          <button onClick={shareRecipe} className="btn-secondary flex-1 text-sm">
            Share Recipe
          </button>
        )}
        <button onClick={deleteRecipe} className="btn-ghost text-sm text-red-500 flex-1">
          Delete
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<div className="page-container"><p>Loading...</p></div>}>
      <RecipeDetail />
    </Suspense>
  );
}
