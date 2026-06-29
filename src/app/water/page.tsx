"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/dates";
import { getRandomQuote } from "@/lib/waterQuotes";
import { requestNotificationPermission, scheduleWaterReminder, updateLastWaterTime, registerServiceWorker } from "@/lib/notifications";
import Header from "@/components/Header";
import Toast, { useToast } from "@/components/Toast";
import BottomNav from "@/components/BottomNav";

export default function WaterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todayTotal, setTodayTotal] = useState(0);
  const [logs, setLogs] = useState<{ id: string; amount_ml: number; created_at: string }[]>([]);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const goal = user?.water_goal_ml || 2500;

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadWater();
      registerServiceWorker();
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        setNotifEnabled(true);
        scheduleWaterReminder();
      }
    }
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
    updateLastWaterTime();
    showToast(getRandomQuote());
    loadWater();
  }

  async function removeLog(id: string) {
    await supabase.from("water_logs").delete().eq("id", id);
    loadWater();
  }

  async function enableNotifications() {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotifEnabled(true);
      scheduleWaterReminder();
    }
  }

  if (!user) return null;

  const percentage = Math.min((todayTotal / goal) * 100, 100);
  const remaining = Math.max(goal - todayTotal, 0);

  return (
    <div className="page-container">
      <Header />

      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Water Tracker
      </h2>

      {/* Progress Circle */}
      <div className="glass mb-4 flex flex-col items-center py-8">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" stroke="var(--border-glass)" strokeWidth="8" fill="none" />
            <circle
              cx="60" cy="60" r="52"
              strokeWidth="8" fill="none" strokeLinecap="round"
              style={{ stroke: "var(--color-primary)", transition: "stroke-dasharray 0.6s ease" }}
              strokeDasharray={`${percentage * 3.27} 327`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {(todayTotal / 1000).toFixed(1)}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>/ {(goal / 1000).toFixed(1)}L</p>
          </div>
        </div>

        <p className="text-sm mt-4" style={{ color: "var(--text-secondary)" }}>
          {remaining > 0 ? `${remaining}ml remaining` : "🎉 Goal reached!"}
        </p>

        {percentage >= 100 && (
          <p className="text-xs mt-1 font-medium" style={{ color: "var(--color-accent)" }}>
            Amazing work! Keep it up.
          </p>
        )}
      </div>

      {/* Quick Add */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {[150, 250, 350, 500].map((ml) => (
          <button
            key={ml}
            onClick={() => addWater(ml)}
            className="glass-sm text-center py-4 active:scale-95 transition-all hover:shadow-lg cursor-pointer"
          >
            <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>{ml}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>ml</p>
          </button>
        ))}
      </div>

      {/* Notification toggle */}
      {!notifEnabled && (
        <button
          onClick={enableNotifications}
          className="glass-sm w-full mb-4 flex items-center gap-3 active:scale-[0.98] transition-all"
        >
          <span className="text-xl">🔔</span>
          <div className="text-left">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Enable reminders</p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Get notified if you haven't drank in 2 hours</p>
          </div>
        </button>
      )}

      {/* Log History */}
      {logs.length > 0 && (
        <div className="glass">
          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>Today&apos;s Log</h3>
          <ul className="space-y-1.5">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "var(--border-glass)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-primary)" }} />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{log.amount_ml}ml</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button
                    onClick={() => removeLog(log.id)}
                    className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
                  >
                    undo
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} onHide={hideToast} />
      <BottomNav />
    </div>
  );
}
