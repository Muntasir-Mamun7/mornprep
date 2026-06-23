"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PeriodLog } from "@/lib/types";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays } from "date-fns";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function PeriodPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<PeriodLog[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [prediction, setPrediction] = useState<Date | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user && user.gender !== "female") router.push("/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadLogs();
  }, [user]);

  useEffect(() => {
    predictNext();
  }, [logs]);

  async function loadLogs() {
    if (!user) return;
    const { data } = await supabase
      .from("period_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(90);
    if (data) setLogs(data);
  }

  function predictNext() {
    const starts = logs.filter((l) => l.log_type === "period_start").map((l) => new Date(l.date));
    if (starts.length < 2) return;

    const cycles: number[] = [];
    for (let i = 0; i < starts.length - 1; i++) {
      cycles.push(differenceInDays(starts[i], starts[i + 1]));
    }
    const avgCycle = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
    const lastStart = starts[0];
    setPrediction(addDays(lastStart, avgCycle));
  }

  function getDayStatus(date: Date): string {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayLogs = logs.filter((l) => l.date === dateStr);

    if (dayLogs.some((l) => l.log_type === "period_start" || l.log_type === "period_end")) return "period";
    if (dayLogs.some((l) => l.flow_intensity)) return "flow";
    if (dayLogs.some((l) => l.symptoms.length > 0)) return "symptom";
    if (prediction && isSameDay(date, prediction)) return "predicted";
    return "";
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();

  if (loading || !user || user.gender !== "female") return null;

  return (
    <div className="page-container">
      <Header />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Period Tracker
        </h2>
        <button
          onClick={() => { setSelectedDate(new Date()); setShowLog(true); }}
          className="btn-primary text-sm px-4 py-2"
        >
          + Log Today
        </button>
      </div>

      {/* Prediction */}
      {prediction && (
        <div className="glass-sm mb-4" style={{ background: "color-mix(in srgb, #ec4899 8%, var(--bg-card))" }}>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Next period predicted:
            <span className="ml-2 font-bold text-pink-600">
              {format(prediction, "MMM d, yyyy")}
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {differenceInDays(prediction, new Date())} days from now
          </p>
        </div>
      )}

      {/* Calendar */}
      <div className="glass mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(addDays(monthStart, -15))}
            className="btn-ghost text-sm"
          >
            ←
          </button>
          <h3 className="font-semibold text-sm">{format(currentMonth, "MMMM yyyy")}</h3>
          <button
            onClick={() => setCurrentMonth(addDays(monthEnd, 15))}
            className="btn-ghost text-sm"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-[10px] font-medium py-1" style={{ color: "var(--text-muted)" }}>
              {d}
            </div>
          ))}

          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((day) => {
            const status = getDayStatus(day);
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={day.toISOString()}
                onClick={() => { setSelectedDate(day); setShowLog(true); }}
                className={`relative w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isToday ? "ring-2 ring-offset-1" : ""
                }`}
                style={{
                  background: status === "period" || status === "flow"
                    ? "linear-gradient(135deg, #ec4899, #f472b6)"
                    : status === "symptom"
                    ? "rgba(234, 179, 8, 0.2)"
                    : status === "predicted"
                    ? "rgba(236, 72, 153, 0.15)"
                    : "transparent",
                  color: status === "period" || status === "flow" ? "white" : "var(--text-primary)",
                  ringColor: isToday ? "var(--color-primary)" : undefined,
                }}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-3 border-t" style={{ borderColor: "var(--border-glass)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-400" />
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-200" />
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Symptoms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "rgba(236, 72, 153, 0.15)" }} />
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Predicted</span>
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="glass">
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Recent Logs</h3>
        {logs.slice(0, 5).length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
            No logs yet. Tap + Log Today to start tracking.
          </p>
        ) : (
          <ul className="space-y-2">
            {logs.slice(0, 5).map((log) => (
              <li key={log.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border-glass)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {log.log_type.replace("_", " ")}
                    {log.flow_intensity && ` (${log.flow_intensity})`}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {log.symptoms.length > 0 && log.symptoms.join(", ")}
                    {log.mood && ` · Mood: ${log.mood}`}
                  </p>
                </div>
                <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  {format(new Date(log.date), "MMM d")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Log Modal */}
      {showLog && (
        <PeriodLogModal
          date={selectedDate}
          userId={user.id}
          onClose={() => { setShowLog(false); loadLogs(); }}
        />
      )}

      <BottomNav />
    </div>
  );
}

function PeriodLogModal({ date, userId, onClose }: { date: Date; userId: string; onClose: () => void }) {
  const [logType, setLogType] = useState<string>("daily");
  const [flow, setFlow] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const symptomOptions = ["cramps", "headache", "bloating", "fatigue", "mood swings", "back pain", "acne", "breast tenderness"];
  const moodOptions = ["happy", "sad", "irritable", "anxious", "calm", "neutral"];

  async function save() {
    setSaving(true);
    await supabase.from("period_logs").insert({
      user_id: userId,
      date: format(date, "yyyy-MM-dd"),
      log_type: logType,
      flow_intensity: flow || null,
      symptoms,
      mood: mood || null,
      notes: notes || null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto"
        style={{ background: "var(--bg-card-solid)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
          Log for {format(date, "MMM d, yyyy")}
        </h3>

        {/* Type */}
        <p className="text-xs font-medium mt-4 mb-2" style={{ color: "var(--text-secondary)" }}>What to log?</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {["period_start", "period_end", "daily"].map((t) => (
            <button
              key={t}
              onClick={() => setLogType(t)}
              className="text-xs px-3 py-2 rounded-xl transition-all"
              style={{
                background: logType === t ? "color-mix(in srgb, var(--color-primary) 15%, white)" : "var(--bg-card)",
                border: logType === t ? "1.5px solid var(--color-primary)" : "1.5px solid var(--border-glass)",
                color: logType === t ? "var(--color-primary)" : "var(--text-secondary)",
              }}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Flow */}
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Flow intensity</p>
        <div className="flex gap-2 mb-4">
          {["light", "medium", "heavy"].map((f) => (
            <button
              key={f}
              onClick={() => setFlow(f === flow ? "" : f)}
              className="text-xs px-3 py-2 rounded-xl flex-1 transition-all"
              style={{
                background: flow === f ? "linear-gradient(135deg, #ec4899, #f472b6)" : "var(--bg-card)",
                border: `1.5px solid ${flow === f ? "transparent" : "var(--border-glass)"}`,
                color: flow === f ? "white" : "var(--text-secondary)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Symptoms */}
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Symptoms</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {symptomOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
              className="text-[11px] px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                background: symptoms.includes(s) ? "color-mix(in srgb, var(--color-accent) 15%, white)" : "var(--bg-card)",
                border: `1px solid ${symptoms.includes(s) ? "var(--color-accent)" : "var(--border-glass)"}`,
                color: symptoms.includes(s) ? "var(--color-accent)" : "var(--text-muted)",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mood */}
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Mood</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {moodOptions.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m === mood ? "" : m)}
              className="text-[11px] px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                background: mood === m ? "color-mix(in srgb, var(--color-primary) 12%, white)" : "var(--bg-card)",
                border: `1px solid ${mood === m ? "var(--color-primary)" : "var(--border-glass)"}`,
                color: mood === m ? "var(--color-primary)" : "var(--text-muted)",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes..."
          className="input-field text-sm h-20 resize-none mb-4"
        />

        <button onClick={save} disabled={saving} className="btn-primary w-full">
          {saving ? "Saving..." : "Save Log"}
        </button>
      </div>
    </div>
  );
}
