"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import { createSupabaseClient, type PortfolioItem } from "@/lib/supabase";

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const inner = (
    <div
      className={`group flex flex-col gap-3 p-5 border border-stone-100 dark:border-stone-800/60 transition-all duration-200 ${
        item.link
          ? "hover:border-stone-300 dark:hover:border-stone-600 cursor-pointer"
          : ""
      }`}
    >
      {/* Date */}
      <time className="text-[9px] tracking-[0.25em] uppercase text-stone-300 dark:text-stone-600 transition-colors duration-300">
        {item.date}
      </time>

      {/* Title */}
      <h3
        className={`text-sm font-light tracking-wide text-stone-800 dark:text-stone-100 transition-colors duration-200 ${
          item.link ? "group-hover:text-stone-600 dark:group-hover:text-stone-300" : ""
        }`}
      >
        {item.title}
      </h3>

      {/* Description */}
      {item.description && (
        <p className="text-xs font-light text-stone-400 dark:text-stone-500 leading-relaxed transition-colors duration-300">
          {item.description}
        </p>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[8px] tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700/80 px-1.5 py-0.5 transition-colors duration-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (item.link) {
    return (
      <a href={item.link} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}

export default function ProjectsPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await createSupabaseClient()
        .from("portfolio_items")
        .select("*")
        .eq("type", "project")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      setItems((data as PortfolioItem[]) ?? []);
      setLoading(false);
    };
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 transition-colors duration-300">
      {/* Header */}
      <header className="px-8 pt-10 pb-6 flex items-center justify-between max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-[9px] tracking-[0.3em] uppercase text-stone-300 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors duration-200"
        >
          ← Home
        </Link>
        <ThemeToggle compact />
      </header>

      <main className="px-8 pb-20 max-w-4xl mx-auto">
        {/* Page title */}
        <div className="mb-14 animate-fade-up">
          <p className="text-[9px] tracking-[0.4em] uppercase text-stone-300 dark:text-stone-600 mb-3">
            Portfolio
          </p>
          <h1 className="text-3xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100 transition-colors duration-300">
            Projects
          </h1>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-8 mb-12 border-b border-stone-100 dark:border-stone-800/60 animate-fade-up-delay-1">
          <Link
            href="/projects"
            className="text-[9px] tracking-[0.25em] uppercase pb-3 border-b -mb-px text-stone-700 dark:text-stone-200 border-stone-400 dark:border-stone-500 transition-colors duration-200"
          >
            Projects
          </Link>
          <Link
            href="/papers"
            className="text-[9px] tracking-[0.25em] uppercase pb-3 border-b -mb-px text-stone-300 dark:text-stone-600 border-transparent hover:text-stone-500 dark:hover:text-stone-400 transition-colors duration-200"
          >
            Papers
          </Link>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-[9px] tracking-[0.4em] uppercase text-stone-200 dark:text-stone-700">
              Loading...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center animate-fade-up-delay-2">
            <p className="text-[9px] tracking-[0.4em] uppercase text-stone-200 dark:text-stone-700">
              No projects yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up-delay-2">
            {items.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
