"use client";

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";

// 원과 선 간격을 직접 제어하는 커스텀 태양 SVG
function SunIcon({ size, strokeWidth = 1, className }: { size: number; strokeWidth?: number; className?: string }) {
  const cx = 12, cy = 12;
  const circleR = 4;   // 원 반지름
  const rayInner = 7.0;  // 선 시작 (간격 = 1.6)
  const rayOuter = 9.0;  // 선 끝
  const count = 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={className}
    >
      <circle cx={cx} cy={cy} r={circleR} />
      {Array.from({ length: count }).map((_, i) => {
        const a = (i * Math.PI * 2) / count - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx + rayInner * Math.cos(a)}
            y1={cy + rayInner * Math.sin(a)}
            x2={cx + rayOuter * Math.cos(a)}
            y2={cy + rayOuter * Math.sin(a)}
          />
        );
      })}
    </svg>
  );
}

const MOON_SIZE = 144;
const SUN_SIZE = 170;
const SUN_DOWN = 5; // 태양 오프셋(px)

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setIsHovered(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setIsHovered(false); }}
      onPointerDown={(e) => { if (e.pointerType === "touch") setIsHovered(true); }}
      onPointerUp={(e) => { if (e.pointerType === "touch") setIsHovered(false); }}
      onPointerCancel={(e) => { if (e.pointerType === "touch") setIsHovered(false); }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="cursor-pointer focus:outline-none"
    >
      {/* 클립 경계 고정 — overflow-hidden은 여기서만 */}
      <div
        className="relative overflow-hidden"
        style={{ height: MOON_SIZE * 0.66, width: SUN_SIZE }}
      >
        {/* Sun — JS hover state + 토글 애니메이션 중첩 */}
        <div
          className="absolute top-0 left-0 transition-transform duration-400"
          style={{ transform: isHovered ? "translateY(0.5rem)" : "translateY(0)" }}
        >
          <div
            className="transition-transform duration-500 ease-in-out"
            style={{
              transform: isDark
                ? `translateY(${SUN_SIZE + SUN_DOWN}px)`
                : `translateY(${SUN_DOWN}px)`,
            }}
          >
            <SunIcon
              size={SUN_SIZE}
              strokeWidth={0.6}
              className={`transition-colors duration-200 ${
                isHovered ? "text-stone-400" : "text-stone-200 dark:text-stone-500"
              }`}
            />
          </div>
        </div>

        {/* Moon — JS hover state + 토글 애니메이션 중첩 */}
        <div
          className="absolute top-0 transition-transform duration-400"
          style={{
            left: (SUN_SIZE - MOON_SIZE) / 2,
            transform: isHovered ? "translateY(0.5rem)" : "translateY(0)",
          }}
        >
          <div
            className="transition-transform duration-500 ease-in-out"
            style={{
              transform: isDark ? "translateY(0)" : `translateY(${MOON_SIZE}px)`,
            }}
          >
            <Moon
              size={MOON_SIZE}
              strokeWidth={0.7}
              className={`transition-colors duration-200 ${
                isHovered ? "text-neutral-500" : "text-neutral-600 dark:text-neutral-800"
              }`}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
