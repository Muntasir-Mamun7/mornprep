"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Recipe } from "@/lib/types";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function RecipesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: "", ingredients: "", steps: "",
    cook_time_mins: 30, servings: 2, tags: "", image_url: "",
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
      image_url: newRecipe.image_url || null,
      is_shared: false,
    });
    setNewRecipe({ title: "", ingredients: "", steps: "", cook_time_mins: 30, servings: 2, tags: "", image_url: "" });
    setShowCreate(false);
    loadRecipes();
  }

  async function shareRecipe(id: string) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase.from("recipes").update({ is_shared: true, share_code: code }).eq("id", id);
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
        image_url: data.image_url,
        is_shared: false,
      });
      setImportCode("");
      setShowImport(false);
      loadRecipes();
    }
  }

  if (!user) return null;

  return (
    <div className="page-container">
      <Header />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Recipes</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(!showImport)} className="btn-secondary text-xs px-3 py-2">
            Import
          </button>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-xs px-3 py-2">
            + New
          </button>
        </div>
      </div>

      {showImport && (
        <div className="glass mb-4 animate-slide-up">
          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>Import Recipe</h3>
          <div className="flex gap-2">
            <input type="text" value={importCode} onChange={(e) => setImportCode(e.target.value)}
              placeholder="Enter share code" className="input-field text-sm flex-1" />
            <button onClick={importRecipe} className="btn-primary text-sm px-4">Go</button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="glass mb-4 animate-slide-up">
          <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Create Recipe</h3>
          <div className="space-y-3">
            <input type="text" value={newRecipe.title}
              onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
              placeholder="Recipe title" className="input-field text-sm" />
            <input type="url" value={newRecipe.image_url}
              onChange={(e) => setNewRecipe({ ...newRecipe, image_url: e.target.value })}
              placeholder="Image URL (optional)" className="input-field text-sm" />
            <textarea value={newRecipe.ingredients}
              onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
              placeholder="Ingredients (one per line)" className="input-field text-sm h-24 resize-none" />
            <textarea value={newRecipe.steps}
              onChange={(e) => setNewRecipe({ ...newRecipe, steps: e.target.value })}
              placeholder="Steps (one per line)" className="input-field text-sm h-24 resize-none" />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>Cook time (min)</label>
                <input type="number" value={newRecipe.cook_time_mins}
                  onChange={(e) => setNewRecipe({ ...newRecipe, cook_time_mins: +e.target.value })}
                  className="input-field text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>Servings</label>
                <input type="number" value={newRecipe.servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: +e.target.value })}
                  className="input-field text-sm" />
              </div>
            </div>
            <input type="text" value={newRecipe.tags}
              onChange={(e) => setNewRecipe({ ...newRecipe, tags: e.target.value })}
              placeholder="Tags (comma separated)" className="input-field text-sm" />
            <button onClick={createRecipe} className="btn-primary w-full text-sm">Save Recipe</button>
          </div>
        </div>
      )}

      {/* Recipe List */}
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <div key={recipe.id}
            className="glass-sm cursor-pointer active:scale-[0.98] transition-all"
            onClick={() => router.push(`/recipes/detail?id=${recipe.id}`)}
          >
            <div className="flex gap-3">
              {recipe.image_url && (
                <img src={recipe.image_url} alt={recipe.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{recipe.title}</h3>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {recipe.cook_time_mins} min · {recipe.servings} servings
                    </p>
                  </div>
                  {recipe.share_code ? (
                    <span className="text-[10px] px-2 py-1 rounded-lg font-mono"
                      style={{ background: "color-mix(in srgb, var(--color-accent) 10%, var(--bg-card))", color: "var(--color-accent)" }}>
                      {recipe.share_code}
                    </span>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); shareRecipe(recipe.id); }}
                      className="text-[11px] font-medium" style={{ color: "var(--color-primary)" }}>
                      Share
                    </button>
                  )}
                </div>
                {recipe.tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: "color-mix(in srgb, var(--color-primary) 8%, var(--bg-card))", color: "var(--color-primary)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {recipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">📖</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No recipes yet. Create or import one!</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
