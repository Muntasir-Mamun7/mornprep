"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    if (!loading) {
      if (session && user?.onboarding_completed) {
        setMessage("Almost there...");
        setTimeout(() => router.push("/dashboard"), 400);
      } else if (session && !user?.onboarding_completed) {
        setMessage("Setting things up...");
        setTimeout(() => router.push("/onboarding"), 400);
      } else {
        router.push("/login");
      }
    }
  }, [user, session, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-emerald-50" />
      <div className="absolute top-20 -left-20 w-72 h-72 rounded-full blur-[100px] opacity-30 animate-blob"
        style={{ background: "var(--color-primary)" }} />
      <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full blur-[100px] opacity-20 animate-blob-delay"
        style={{ background: "var(--color-accent)" }} />

      <div className="relative z-10 text-center animate-fade-in">
        <h1 className="font-display text-4xl mb-3" style={{ color: "var(--color-primary)" }}>MoRNPrep</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{message}</p>
        <div className="mt-4 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
        </div>
      </div>
    </div>
  );
}
