"use client";

import { useState, useEffect, useRef } from "react";

const navItems = [
  {
    label: "About",
    href: "/about",
    sub: [
      { label: "Story", href: "/about" },
      { label: "Stack", href: "/about#stack" },
      { label: "Contact", href: "/about#contact" },
    ],
    delay: "animate-fade-up-delay-3",
  },
  {
    label: "Blog",
    href: "/blog",
    sub: [
      { label: "All Posts", href: "/blog" },
      { label: "Dev Log", href: "/blog?category=dev-log" },
      { label: "Problem Solving", href: "/blog?category=problem-solving" },
      { label: "Paper Review", href: "/blog?category=paper-review" },
      { label: "Etc", href: "/blog?category=etc" },
    ],
    delay: "animate-fade-up-delay-4",
  },
  {
    label: "Portfolio",
    href: "#portfolio",
    sub: [
      { label: "Work", href: "#work" },
      { label: "Research", href: "#research" },
    ],
    delay: "animate-fade-up-delay-5",
  },
];

export default function NavMenu() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // 외부 클릭/탭 시 드롭다운 닫기
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveItem(null);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <nav ref={navRef} className="flex items-center gap-10">
      {navItems.map(({ label, href, sub, delay }) => {
        const isActive = activeItem === label;

        return (
          <div
            key={label}
            className={`relative ${delay}`}
            // PC: 마우스 호버로 드롭다운 열기/닫기
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setActiveItem(label);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setActiveItem(null);
            }}
          >
            {/* 네비게이션 링크 — 모바일/PC 모두 클릭 시 바로 이동 */}
            <a
              href={href}
              onClick={() => setActiveItem(null)}
              className={`block min-w-[6rem] text-center pb-px text-xs tracking-[0.2em] uppercase transition-colors duration-200 border-b ${
                isActive
                  ? "text-stone-700 dark:text-stone-200 border-stone-400 dark:border-stone-500"
                  : "text-stone-400 border-transparent"
              }`}
            >
              {label}
            </a>

            {/* 드롭다운 서브메뉴 (PC hover) */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 z-10 flex flex-col items-center gap-3 transition-all duration-300 ${
                isActive
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              {sub.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[9px] tracking-[0.2em] uppercase text-stone-400 whitespace-nowrap transition-colors duration-200 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
