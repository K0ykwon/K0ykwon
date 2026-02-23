"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import { createSupabaseClient, type Post } from "@/lib/supabase";

type Category = "all" | "dev-log" | "problem-solving" | "paper-review" | "etc";

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "dev-log", label: "Dev Log" },
  { id: "problem-solving", label: "Problem Solving" },
  { id: "paper-review", label: "Paper Review" },
  { id: "etc", label: "Etc" },
];

const categoryLabel: Record<Exclude<Category, "all">, string> = {
  "dev-log": "Dev Log",
  "problem-solving": "Problem Solving",
  "paper-review": "Paper Review",
  etc: "Etc",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type GridCell = { dateStr: string; count: number; future: boolean };

function getActivityGrid(posts: Post[]): {
  weeks: GridCell[][];
  months: { label: string; weekIndex: number }[];
} {
  const counts: Record<string, number> = {};
  posts.forEach((p) => {
    const day = p.created_at.slice(0, 10);
    counts[day] = (counts[day] ?? 0) + 1;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay()); // back to Sunday

  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay())); // forward to Saturday

  const weeks: GridCell[][] = [];
  const months: { label: string; weekIndex: number }[] = [];
  const cur = new Date(start);
  let lastMonth = -1;

  while (cur <= end) {
    const week: GridCell[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = toDateStr(cur);
      week.push({ dateStr, count: counts[dateStr] ?? 0, future: dateStr > todayStr });
      cur.setDate(cur.getDate() + 1);
    }
    const m = parseInt(week[0].dateStr.slice(5, 7));
    if (m !== lastMonth) {
      months.push({
        label: new Date(
          parseInt(week[0].dateStr.slice(0, 4)),
          m - 1,
          1
        ).toLocaleDateString("en-US", { month: "short" }),
        weekIndex: weeks.length,
      });
      lastMonth = m;
    }
    weeks.push(week);
  }

  return { weeks, months };
}

function BlogContent() {
  const searchParams = useSearchParams();
  const paramCat = searchParams.get("category") as Category | null;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  useEffect(() => {
    if (paramCat && categories.some((c) => c.id === paramCat)) {
      setActiveCategory(paramCat);
    }
  }, [paramCat]);

  useEffect(() => {
    createSupabaseClient()
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as Post[]) ?? []);
        setLoading(false);
      });
  }, []);

  const { weeks, months } = getActivityGrid(posts);

  const recent = posts.slice(0, 3);
  const filtered = posts.filter(
    (p) => activeCategory === "all" || p.category === activeCategory
  );

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
      <div className="mb-12 animate-fade-up">
        <h1 className="text-3xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
          Blog
        </h1>
        <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 transition-colors duration-300">
          Projects · Study
        </p>
      </div>

      {/* Activity Graph */}
      <section className="mb-14 animate-fade-up-delay-1">
        <p className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 mb-4 transition-colors duration-300">
          Activity
        </p>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-[5px]" style={{ paddingTop: "17px" }}>
              {["", "M", "", "W", "", "F", ""].map((lbl, i) => (
                <div key={i} className="h-[10px] flex items-center justify-end">
                  <span className="text-[7px] text-stone-300 dark:text-stone-600 leading-none">
                    {lbl}
                  </span>
                </div>
              ))}
            </div>
            {/* Grid */}
            <div>
              {/* Month labels */}
              <div className="flex gap-[2px] mb-[3px] h-[14px]">
                {weeks.map((_, wi) => {
                  const m = months.find((x) => x.weekIndex === wi);
                  return (
                    <div key={wi} className="w-[10px] relative">
                      {m && (
                        <span className="absolute text-[7px] text-stone-300 dark:text-stone-600 whitespace-nowrap leading-none">
                          {m.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Cells */}
              <div className="flex flex-col gap-[2px]">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
                  <div key={dayIdx} className="flex gap-[2px]">
                    {weeks.map((week, wi) => {
                      const cell = week[dayIdx];
                      const level = cell.future
                        ? -1
                        : cell.count === 0
                        ? 0
                        : cell.count === 1
                        ? 1
                        : cell.count <= 3
                        ? 2
                        : 3;
                      return (
                        <div
                          key={wi}
                          title={
                            cell.future
                              ? ""
                              : cell.count > 0
                              ? `${cell.dateStr}: ${cell.count} post${cell.count !== 1 ? "s" : ""}`
                              : cell.dateStr
                          }
                          className={`w-[10px] h-[10px] rounded-[2px] transition-colors duration-300 ${
                            level === -1
                              ? "bg-transparent"
                              : level === 0
                              ? "bg-stone-100 dark:bg-stone-800"
                              : level === 1
                              ? "bg-stone-300 dark:bg-stone-600"
                              : level === 2
                              ? "bg-stone-500 dark:bg-stone-400"
                              : "bg-stone-700 dark:bg-stone-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      {!loading && recent.length > 0 && (
        <section className="mb-10 animate-fade-up-delay-2">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 transition-colors duration-300">
              Recent
            </p>
            <button
              onClick={() => setActiveCategory("all")}
              className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400 transition-colors duration-200 cursor-pointer"
            >
              All →
            </button>
          </div>
          <ul className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {recent.map((post) => (
              <li key={post.id} className="py-5 group">
                <div className="flex items-center gap-3 mb-2">
                  <time className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 transition-colors duration-300">
                    {fmtDate(post.created_at)}
                  </time>
                  <span className="text-[8px] tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700/80 px-1.5 py-0.5 transition-colors duration-300">
                    {categoryLabel[post.category]}
                  </span>
                </div>
                <Link href={`/blog/${post.slug}`} className="block">
                  <h2 className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors duration-200 mb-1">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="text-[11px] leading-relaxed tracking-wide text-stone-400 dark:text-stone-500 transition-colors duration-300">
                      {post.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-stone-100 dark:bg-stone-800/60 mb-10 animate-fade-up-delay-2 transition-colors duration-300" />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-10 animate-fade-up-delay-3">
        {categories.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`text-[9px] tracking-[0.25em] uppercase pb-px border-b transition-colors duration-200 cursor-pointer ${
              activeCategory === id
                ? "text-stone-700 dark:text-stone-200 border-stone-400 dark:border-stone-500"
                : "text-stone-300 dark:text-stone-600 border-transparent hover:text-stone-500 dark:hover:text-stone-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Post List */}
      {loading ? (
        <div className="py-16 text-center animate-fade-up-delay-3">
          <p className="text-[9px] tracking-[0.4em] uppercase text-stone-200 dark:text-stone-700 transition-colors duration-300">
            Loading
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <ul className="divide-y divide-stone-100 dark:divide-stone-800/60 animate-fade-up-delay-3">
          {filtered.map((post) => (
            <li key={post.id} className="py-8 group">
              <div className="flex items-center gap-3 mb-2.5">
                <time className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 transition-colors duration-300">
                  {fmtDate(post.created_at)}
                </time>
                <span className="text-[8px] tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700/80 px-1.5 py-0.5 transition-colors duration-300">
                  {categoryLabel[post.category]}
                </span>
              </div>
              <Link href={`/blog/${post.slug}`} className="block">
                <h2 className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors duration-200 mb-1.5">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="text-[11px] leading-relaxed tracking-wide text-stone-400 dark:text-stone-500 transition-colors duration-300">
                    {post.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-24 text-center animate-fade-up-delay-3">
          <p className="text-[9px] tracking-[0.4em] uppercase text-stone-300 dark:text-stone-700 transition-colors duration-300">
            No posts yet
          </p>
        </div>
      )}
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogContent />
    </Suspense>
  );
}
