"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const MOON_SIZE = 144;
const SUN_SIZE = 170;
const SUN_DOWN = 15; // 태양 오프셋(px)

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="cursor-pointer focus:outline-none group"
    >
      {/* 클립 경계 고정 — overflow-hidden은 여기서만 */}
      <div
        className="relative overflow-hidden"
        style={{ height: MOON_SIZE * 0.66, width: SUN_SIZE }}
      >
        {/* Sun — 호버 레이어(group-hover) + 토글 애니메이션 중첩 */}
        <div className="absolute top-0 left-0 transition-transform duration-200 group-hover:translate-y-2">
          <div
            className="transition-transform duration-500 ease-in-out"
            style={{
              transform: isDark
                ? `translateY(${SUN_SIZE + SUN_DOWN}px)`
                : `translateY(${SUN_DOWN}px)`,
            }}
          >
            <Sun size={SUN_SIZE} strokeWidth={0.6} className="text-stone-900 dark:text-stone-100" />
          </div>
        </div>

        {/* Moon — 호버 레이어(group-hover) + 토글 애니메이션 중첩 */}
        <div
          className="absolute top-0 transition-transform duration-200 group-hover:translate-y-2"
          style={{ left: (SUN_SIZE - MOON_SIZE) / 2 }}
        >
          <div
            className="transition-transform duration-500 ease-in-out"
            style={{
              transform: isDark ? "translateY(0)" : `translateY(${MOON_SIZE}px)`,
            }}
          >
            <Moon size={MOON_SIZE} strokeWidth={0.7} className="text-slate-400 dark:text-slate-300" />
          </div>
        </div>
      </div>
    </button>
  );
}
