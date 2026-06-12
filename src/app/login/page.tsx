"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (isSignup) {
      const { data, error: signupErr } = await supabase
        .from("profiles")
        .insert({ name: name.toLowerCase(), pin })
        .select()
        .single();

      if (signupErr) {
        setError("Name already taken or error occurred");
        return;
      }
      if (data) {
        localStorage.setItem("mornprep_user", JSON.stringify(data));
        router.push("/onboarding");
        return;
      }
    }

    const success = await login(name, pin);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid name or PIN");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-brand-700 mb-2">
            MoRNPrep
          </h1>
          <p className="text-gray-500 text-sm">
            Your personal meal planning companion
          </p>
        </div>

        <div className="card">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                !isSignup
                  ? "bg-white shadow-sm text-brand-700"
                  : "text-gray-500"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                isSignup
                  ? "bg-white shadow-sm text-brand-700"
                  : "text-gray-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                PIN (4 digits)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="input-field"
                placeholder="1234"
                maxLength={4}
                inputMode="numeric"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full">
              {isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
