"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let err: string | null;
    if (isSignup) {
      if (!displayName.trim()) {
        setError("Please enter your name");
        setLoading(false);
        return;
      }
      err = await signUpWithEmail(email, password, displayName.trim());
      if (!err) {
        router.push("/onboarding");
        return;
      }
    } else {
      err = await signInWithEmail(email, password);
      if (!err) {
        router.push("/dashboard");
        return;
      }
    }

    if (err) setError(err);
    setLoading(false);
  }

  async function handleGoogle() {
    await signInWithGoogle();
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-emerald-50" />
      <div className="absolute top-20 -left-20 w-80 h-80 rounded-full blur-[100px] animate-blob opacity-40"
        style={{ background: "var(--color-primary)" }} />
      <div className="absolute top-40 -right-20 w-96 h-96 rounded-full blur-[100px] animate-blob-delay opacity-30"
        style={{ background: "var(--color-accent)" }} />
      <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-blob-delay-2 opacity-20"
        style={{ background: "var(--color-primary)" }} />

      {/* Floating elements */}
      <div className="absolute top-16 right-12 text-4xl animate-float opacity-50">🥗</div>
      <div className="absolute bottom-40 left-8 text-3xl animate-float-slow opacity-40">🍳</div>
      <div className="absolute top-1/3 left-10 text-2xl animate-float opacity-30">🥑</div>
      <div className="absolute bottom-56 right-14 text-3xl animate-float-slow opacity-40">🍲</div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl drop-shadow-sm" style={{ color: "var(--color-primary)" }}>
            MoRNPrep
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-light tracking-wide">
            Smart meal planning & guidance
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass">
          {/* Google Button */}
          <button onClick={handleGoogle} className="btn-google mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200/60" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200/60" />
          </div>

          {/* Toggle */}
          <div className="flex mb-5 rounded-xl p-1" style={{ background: "var(--bg-card)" }}>
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isSignup ? "bg-white shadow-sm" : "text-gray-400"
              }`}
              style={!isSignup ? { color: "var(--color-primary)" } : {}}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                isSignup ? "bg-white shadow-sm" : "text-gray-400"
              }`}
              style={isSignup ? { color: "var(--color-primary)" } : {}}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignup && (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-glass"
                placeholder="Your name"
                required={isSignup}
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass"
              placeholder="Email address"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass"
              placeholder="Password (min 6 characters)"
              minLength={6}
              required
            />

            {error && (
              <div className="rounded-xl px-4 py-2.5" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                <p className="text-red-500 text-xs text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Setting up...
                </span>
              ) : (
                isSignup ? "Create Account" : "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-light">
          Plan smarter. Eat better. Live well.
        </p>
      </div>
    </div>
  );
}
