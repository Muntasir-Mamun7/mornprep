"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  authUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<string | null>;
  logout: () => Promise<void>;
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function getCachedProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem("mornprep-profile");
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
}

function setCachedProfile(profile: UserProfile | null) {
  if (typeof window === "undefined") return;
  if (profile) {
    localStorage.setItem("mornprep-profile", JSON.stringify(profile));
  } else {
    localStorage.removeItem("mornprep-profile");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(getCachedProfile);
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => clearTimeout(timeout));
      } else {
        setCachedProfile(null);
        setUser(null);
        setLoading(false);
        clearTimeout(timeout);
      }
    }).catch(() => {
      setLoading(false);
      clearTimeout(timeout);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setAuthUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setCachedProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        setUser(data);
        setCachedProfile(data);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  async function signInWithEmail(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }

  async function signUpWithEmail(email: string, password: string, displayName: string): Promise<string | null> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: displayName } },
    });

    if (error) return error.message;

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name: email.split("@")[0],
        email: email,
        display_name: displayName,
      });
    }

    return null;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAuthUser(null);
    setCachedProfile(null);
  }

  async function saveProfile(profile: Partial<UserProfile>) {
    if (!authUser) return;
    const { data } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", authUser.id)
      .select()
      .single();

    if (data) {
      setUser(data);
      setCachedProfile(data);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, authUser, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, saveProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
