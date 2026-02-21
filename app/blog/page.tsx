"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import { createSupabaseClient, type Post } from "@/lib/supabase";

type Category = "all" | "projects" | "problem-solving" | "paper-review";

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "projects", label: "Projects" },
  { id: "problem-solving", label: "Problem Solving" },
  { id: "paper-review", label: "Paper Review" },
];

const categoryLabel: Record<Exclude<Category, "all">, string> = {
  projects: "Projects",
  "problem-solving": "Problem Solving",
  "paper-review": "Paper Review",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function getActivity(posts: Post[]) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const count = posts.filter((p) => p.created_at.startsWith(key)).length;
    return { key, label, count };
  });
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

  const activity = getActivity(posts);
  const maxCount = Math.max(...activity.map((d) => d.count), 1);

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
        <p className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 mb-5 transition-colors duration-300">
          Activity
        </p>
        <div className="flex items-end gap-[6px]">
          {activity.map(({ key, label, count }) => {
            const ratio = count / maxCount;
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <div className="relative w-[18px] h-8 flex items-end">
                  <div
                    className={`w-full rounded-[2px] transition-all duration-700 ${
                      count === 0
                        ? "bg-stone-100 dark:bg-stone-800/80"
                        : "bg-stone-400 dark:bg-stone-500"
                    }`}
                    style={{
                      height: count === 0 ? "2px" : `${Math.max(ratio * 32, 5)}px`,
                      opacity: count === 0 ? 1 : 0.4 + ratio * 0.6,
                    }}
                  />
                </div>
                <span className="text-[7px] tracking-wide text-stone-300 dark:text-stone-600 transition-colors duration-300">
                  {label}
                </span>
              </div>
            );
          })}
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
