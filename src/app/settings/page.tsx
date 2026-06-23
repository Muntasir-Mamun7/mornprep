"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

const colorPresets = [
  { name: "Amber", primary: "#d4802a", accent: "#567a5b" },
  { name: "Rose", primary: "#e11d48", accent: "#6366f1" },
  { name: "Ocean", primary: "#0ea5e9", accent: "#14b8a6" },
  { name: "Violet", primary: "#8b5cf6", accent: "#ec4899" },
  { name: "Forest", primary: "#16a34a", accent: "#ca8a04" },
  { name: "Slate", primary: "#475569", accent: "#0ea5e9" },
];

export default function SettingsPage() {
  const { user, logout, saveProfile } = useAuth();
  const { primaryColor, accentColor, mode, setPrimaryColor, setAccentColor, setMode } = useTheme();
  const router = useRouter();
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(user?.display_name || "");
  const [waterGoal, setWaterGoal] = useState(user?.water_goal_ml || 2500);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  async function saveName() {
    await saveProfile({ display_name: name });
    setEditName(false);
  }

  async function saveWaterGoal(val: number) {
    setWaterGoal(val);
    await saveProfile({ water_goal_ml: val });
  }

  if (!user) return null;

  return (
    <div className="page-container">
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--color-primary)" }}>Settings</h1>

      {/* Profile */}
      <div className="glass mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
          Profile
        </h3>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Display Name</p>
            {editName ? (
              <div className="flex gap-2 mt-1">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field text-sm py-1.5 px-3" />
                <button onClick={saveName} className="btn-primary text-xs px-3 py-1.5">Save</button>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{user.display_name || user.name}</p>
            )}
          </div>
          {!editName && (
            <button onClick={() => setEditName(true)} className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
              Edit
            </button>
          )}
        </div>

        <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: "var(--border-glass)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: "var(--border-glass)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Gender</p>
            <p className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>{user.gender}</p>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="glass mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
          Theme
        </h3>

        {/* Mode toggle */}
        <div className="flex items-center justify-between py-2 mb-3">
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Dark Mode</p>
          <button
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            className="relative w-12 h-7 rounded-full transition-all duration-300"
            style={{ background: mode === "dark" ? "var(--color-primary)" : "var(--border-glass)" }}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ${
              mode === "dark" ? "left-[22px]" : "left-0.5"
            }`} />
          </button>
        </div>

        {/* Color presets */}
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Color Theme</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => { setPrimaryColor(preset.primary); setAccentColor(preset.accent); }}
              className="py-3 px-3 rounded-xl text-center transition-all active:scale-95"
              style={{
                background: primaryColor === preset.primary ? `color-mix(in srgb, ${preset.primary} 12%, var(--bg-card))` : "var(--bg-card)",
                border: primaryColor === preset.primary ? `2px solid ${preset.primary}` : "2px solid var(--border-glass)",
              }}
            >
              <div className="flex gap-1 justify-center mb-1">
                <div className="w-4 h-4 rounded-full" style={{ background: preset.primary }} />
                <div className="w-4 h-4 rounded-full" style={{ background: preset.accent }} />
              </div>
              <p className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>{preset.name}</p>
            </button>
          ))}
        </div>

        {/* Custom color input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>Primary</label>
            <div className="flex gap-2 items-center mt-1">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0" />
              <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{primaryColor}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-[11px]" style={{ color: "var(--text-muted)" }}>Accent</label>
            <div className="flex gap-2 items-center mt-1">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0" />
              <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
          Preferences
        </h3>

        <div className="py-2">
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Daily Water Goal</p>
          <div className="flex gap-2">
            {[1500, 2000, 2500, 3000, 3500].map((ml) => (
              <button key={ml} onClick={() => saveWaterGoal(ml)}
                className="text-xs px-2.5 py-1.5 rounded-lg transition-all flex-1"
                style={{
                  background: waterGoal === ml ? "color-mix(in srgb, var(--color-primary) 12%, var(--bg-card))" : "var(--bg-card)",
                  border: waterGoal === ml ? "1.5px solid var(--color-primary)" : "1.5px solid var(--border-glass)",
                  color: waterGoal === ml ? "var(--color-primary)" : "var(--text-secondary)",
                }}
              >
                {ml / 1000}L
              </button>
            ))}
          </div>
        </div>

        <div className="py-2 border-t mt-2" style={{ borderColor: "var(--border-glass)" }}>
          <button onClick={() => router.push("/onboarding")} className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            Re-do Onboarding Questions →
          </button>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full py-3.5 rounded-2xl text-sm font-medium text-red-500 transition-all active:scale-[0.97]"
        style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
        Log Out
      </button>

      <BottomNav />
    </div>
  );
}
