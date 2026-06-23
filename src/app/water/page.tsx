"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/dates";
import BottomNav from "@/components/BottomNav";

export default function WaterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todayTotal, setTodayTotal] = useState(0);
  const [logs, setLogs] = useState<{ id: string; amount_ml: number; created_at: string }[]>([]);
  const goal = 2500;

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadWater();
  }, [user]);

  async function loadWater() {
    if (!user) return;
    const today = formatDate(new Date());
    const { data } = await supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at", { ascending: false });

    if (data) {
      setLogs(data);
      setTodayTotal(data.reduce((sum: number, l: any) => sum + l.amount_ml, 0));
    }
  }

  async function addWater(amount: number) {
    if (!user) return;
    const today = formatDate(new Date());
    await supabase.from("water_logs").insert({
      user_id: user.id,
      date: today,
      amount_ml: amount,
    });
    loadWater();
  }

  async function removeLog(id: string) {
    await supabase.from("water_logs").delete().eq("id", id);
    loadWater();
  }

  if (loading || !user) return null;

  const percentage = Math.min((todayTotal / goal) * 100, 100);
  const remaining = Math.max(goal - todayTotal, 0);

  return (
    <div className="page-container">
      <h1 className="font-display text-2xl text-brand-700 mb-6">Water Tracker</h1>

      {/* Progress Circle */}
      <div className="card mb-4 flex flex-col items-center py-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              stroke="#e5e7eb" strokeWidth="10" fill="none"
            />
            <circle
              cx="60" cy="60" r="52"
              stroke="#3b82f6" strokeWidth="10" fill="none"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 3.27} 327`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-gray-800">
              {(todayTotal / 1000).toFixed(1)}
            </p>
            <p className="text-xs text-gray-400">/ {goal / 1000}L</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          {remaining > 0
            ? `${remaining}ml remaining`
            : "Goal reached!"}
        </p>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[150, 250, 350, 500].map((ml) => (
          <button
            key={ml}
            onClick={() => addWater(ml)}
            className="card !p-3 text-center hover:bg-blue-50 active:bg-blue-100 transition-all"
          >
            <p className="text-lg font-bold text-blue-600">{ml}</p>
            <p className="text-[10px] text-gray-400">ml</p>
          </button>
        ))}
      </div>

      {/* Log History */}
      {logs.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-sm mb-2">Today&apos;s Log</h3>
          <ul className="space-y-1.5">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm">{log.amount_ml}ml</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => removeLog(log.id)}
                    className="text-[10px] text-red-400 hover:text-red-600"
                  >
                    undo
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
