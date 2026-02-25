import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap — Youngkwon Ko",
  description: "A complete overview of all pages on this site.",
};

const sections = [
  {
    label: "Home",
    href: "/",
    sub: [],
  },
  {
    label: "About",
    href: "/about",
    sub: [
      { label: "Story", href: "/about" },
      { label: "Stack", href: "/about#stack" },
      { label: "Contact", href: "/about#contact" },
    ],
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
  },
  {
    label: "Portfolio",
    href: "/#portfolio",
    sub: [
      { label: "Work", href: "/#work" },
      { label: "Research", href: "/#research" },
    ],
  },
];

const delays = [
  "animate-fade-up",
  "animate-fade-up-delay-1",
  "animate-fade-up-delay-2",
  "animate-fade-up-delay-3",
  "animate-fade-up-delay-4",
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen px-8 py-14 max-w-xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-16 animate-fade-up">
        <Link
          href="/"
          className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors duration-200"
        >
          ← Home
        </Link>
        <ThemeToggle compact />
      </header>

      {/* Title */}
      <div className="mb-14 animate-fade-up">
        <h1 className="text-3xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
          Sitemap
        </h1>
        <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 transition-colors duration-300">
          All Pages
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-10">
        {sections.map(({ label, href, sub }, i) => (
          <div key={label} className={delays[i + 1] ?? delays[delays.length - 1]}>
            {/* Section title */}
            <Link
              href={href}
              className="inline-block text-xs tracking-[0.25em] uppercase text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-200 border-b border-stone-200 dark:border-stone-700 pb-px mb-4"
            >
              {label}
            </Link>

            {/* Sub links */}
            {sub.length > 0 && (
              <div className="pl-5 border-l border-stone-100 dark:border-stone-800/80 flex flex-col gap-3 transition-colors duration-300">
                {sub.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[11px] tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
