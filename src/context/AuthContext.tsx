"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (name: string, pin: string) => Promise<boolean>;
  logout: () => void;
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("mornprep_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  async function login(name: string, pin: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("name", name.toLowerCase())
      .eq("pin", pin)
      .single();

    if (error || !data) return false;

    setUser(data);
    localStorage.setItem("mornprep_user", JSON.stringify(data));
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("mornprep_user");
  }

  async function saveProfile(profile: Partial<UserProfile>) {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id)
      .select()
      .single();

    if (data) {
      setUser(data);
      localStorage.setItem("mornprep_user", JSON.stringify(data));
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
