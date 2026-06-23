"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Recipe } from "@/lib/types";
import BottomNav from "@/components/BottomNav";

export default function RecipesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    steps: "",
    cook_time_mins: 30,
    servings: 2,
    tags: "",
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadRecipes();
  }, [user]);

  async function loadRecipes() {
    if (!user) return;
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setRecipes(data);
  }

  async function createRecipe() {
    if (!user || !newRecipe.title.trim()) return;
    await supabase.from("recipes").insert({
      user_id: user.id,
      title: newRecipe.title,
      ingredients: newRecipe.ingredients.split("\n").filter(Boolean),
      steps: newRecipe.steps.split("\n").filter(Boolean),
      cook_time_mins: newRecipe.cook_time_mins,
      servings: newRecipe.servings,
      tags: newRecipe.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_shared: false,
    });
    setNewRecipe({ title: "", ingredients: "", steps: "", cook_time_mins: 30, servings: 2, tags: "" });
    setShowCreate(false);
    loadRecipes();
  }

  async function shareRecipe(id: string) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase
      .from("recipes")
      .update({ is_shared: true, share_code: code })
      .eq("id", id);
    loadRecipes();
  }

  async function importRecipe() {
    if (!user || !importCode.trim()) return;
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("share_code", importCode.toUpperCase())
      .eq("is_shared", true)
      .single();

    if (data) {
      await supabase.from("recipes").insert({
        user_id: user.id,
        title: data.title,
        ingredients: data.ingredients,
        steps: data.steps,
        cook_time_mins: data.cook_time_mins,
        servings: data.servings,
        tags: data.tags,
        is_shared: false,
      });
      setImportCode("");
      setShowImport(false);
      loadRecipes();
    }
  }

  if (loading || !user) return null;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-brand-700">Recipes</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(!showImport)}
            className="btn-secondary text-xs px-3 py-2"
          >
            Import
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary text-xs px-3 py-2"
          >
            + New
          </button>
        </div>
      </div>

      {showImport && (
        <div className="card mb-4">
          <h3 className="font-semibold text-sm mb-2">Import Recipe</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Enter share code"
              className="input-field text-sm flex-1"
            />
            <button onClick={importRecipe} className="btn-primary text-sm px-4">
              Go
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="card mb-4">
          <h3 className="font-semibold text-sm mb-3">Create Recipe</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newRecipe.title}
              onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
              placeholder="Recipe title"
              className="input-field text-sm"
            />
            <textarea
              value={newRecipe.ingredients}
              onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
              placeholder="Ingredients (one per line)"
              className="input-field text-sm h-24 resize-none"
            />
            <textarea
              value={newRecipe.steps}
              onChange={(e) => setNewRecipe({ ...newRecipe, steps: e.target.value })}
              placeholder="Steps (one per line)"
              className="input-field text-sm h-24 resize-none"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[11px] text-gray-500">Cook time (min)</label>
                <input
                  type="number"
                  value={newRecipe.cook_time_mins}
                  onChange={(e) => setNewRecipe({ ...newRecipe, cook_time_mins: +e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-gray-500">Servings</label>
                <input
                  type="number"
                  value={newRecipe.servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: +e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>
            <input
              type="text"
              value={newRecipe.tags}
              onChange={(e) => setNewRecipe({ ...newRecipe, tags: e.target.value })}
              placeholder="Tags (comma separated)"
              className="input-field text-sm"
            />
            <button onClick={createRecipe} className="btn-primary w-full text-sm">
              Save Recipe
            </button>
          </div>
        </div>
      )}

      {/* Recipe List */}
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="card cursor-pointer hover:shadow-md transition-all"
            onClick={() => router.push(`/recipes/detail?id=${recipe.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-sm">{recipe.title}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {recipe.cook_time_mins} min · {recipe.servings} servings
                </p>
                {recipe.tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {recipe.share_code ? (
                <span className="text-[10px] bg-sage-100 text-sage-700 px-2 py-1 rounded-md font-mono">
                  {recipe.share_code}
                </span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    shareRecipe(recipe.id);
                  }}
                  className="text-[10px] text-brand-500 hover:text-brand-700"
                >
                  Share
                </button>
              )}
            </div>
          </div>
        ))}
        {recipes.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No recipes yet. Create or import one!
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
