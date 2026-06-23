"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const baseTabs = [
  { href: "/dashboard", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/meals", label: "Meals", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/planner", label: "Plan", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/recipes", label: "Recipes", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/water", label: "Water", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
];

const periodTab = { href: "/period", label: "Cycle", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" };

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = user?.gender === "female"
    ? [...baseTabs.slice(0, 4), periodTab, baseTabs[4]]
    : baseTabs;

  // Limit to 5 tabs max for clean layout
  const displayTabs = tabs.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ backdropFilter: "blur(20px) saturate(1.3)" }}>
      <div style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border-glass)" }}>
        <div className="max-w-lg mx-auto flex justify-around py-2.5">
          {displayTabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200"
                style={{ color: active ? "var(--color-primary)" : "var(--text-muted)" }}
              >
                <svg
                  className="w-5.5 h-5.5"
                  style={{ width: "22px", height: "22px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={active ? 2.2 : 1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
                {active && (
                  <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "var(--color-primary)" }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
