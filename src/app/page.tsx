"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (session && user?.gender) {
        router.push("/dashboard");
      } else if (session && !user?.gender) {
        router.push("/onboarding");
      } else {
        router.push("/login");
      }
    }
  }, [user, session, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50">
      <div className="text-center">
        <h1 className="font-display text-4xl text-brand-700">MoRNPrep</h1>
        <p className="text-gray-500 mt-2">Loading...</p>
      </div>
    </div>
  );
}
