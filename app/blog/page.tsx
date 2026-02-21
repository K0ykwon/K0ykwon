"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

type Category = "all" | "projects" | "problem-solving" | "paper-review";

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "projects", label: "Projects" },
  { id: "problem-solving", label: "Problem Solving" },
  { id: "paper-review", label: "Paper Review" },
];

const posts: {
  slug: string;
  title: string;
  date: string;
  category: Exclude<Category, "all">;
  description: string;
}[] = [
  {
    slug: "transformer-attention",
    title: "Attention Is All You Need",
    date: "2024.03.10",
    category: "paper-review",
    description:
      "The transformer architecture that revolutionized NLP and beyond.",
  },
  {
    slug: "ddpm",
    title: "Denoising Diffusion Probabilistic Models",
    date: "2024.02.28",
    category: "paper-review",
    description:
      "Understanding score matching and the DDPM framework for generative modeling.",
  },
  {
    slug: "dqn-cartpole",
    title: "CartPole with Deep Q-Network",
    date: "2024.02.15",
    category: "problem-solving",
    description:
      "Solving OpenAI Gym's CartPole using DQN from scratch in PyTorch.",
  },
  {
    slug: "portfolio-site",
    title: "Building This Portfolio",
    date: "2024.01.20",
    category: "projects",
    description:
      "Designing a minimalist personal portfolio with Next.js and Tailwind CSS v4.",
  },
  {
    slug: "boj-dijkstra",
    title: "BOJ 1916 — Dijkstra's Algorithm",
    date: "2024.01.05",
    category: "problem-solving",
    description:
      "Shortest path with priority queue optimization on a weighted directed graph.",
  },
  {
    slug: "image-colorization",
    title: "Grayscale Image Colorization with CNN",
    date: "2023.12.10",
    category: "projects",
    description:
      "Automatic colorization using an encoder-decoder architecture trained on ImageNet.",
  },
];

const categoryLabel: Record<Exclude<Category, "all">, string> = {
  projects: "Projects",
  "problem-solving": "Problem Solving",
  "paper-review": "Paper Review",
};

function BlogContent() {
  const searchParams = useSearchParams();
  const paramCategory = searchParams.get("category") as Category | null;

  const [activeCategory, setActiveCategory] = useState<Category>("all");

  useEffect(() => {
    if (paramCategory && categories.some((c) => c.id === paramCategory)) {
      setActiveCategory(paramCategory);
    }
  }, [paramCategory]);

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

      {/* Category Filter */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-12 animate-fade-up-delay-1">
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
      {filtered.length > 0 ? (
        <ul className="divide-y divide-stone-100 dark:divide-stone-800/60 animate-fade-up-delay-2">
          {filtered.map((post) => (
            <li key={post.slug} className="py-8 group">
              <div className="flex items-center gap-3 mb-2.5">
                <time className="text-[9px] tracking-[0.2em] uppercase text-stone-300 dark:text-stone-600 transition-colors duration-300">
                  {post.date}
                </time>
                <span className="text-[8px] tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700/80 px-1.5 py-0.5 transition-colors duration-300">
                  {categoryLabel[post.category]}
                </span>
              </div>
              <a href={`/blog/${post.slug}`} className="block">
                <h2 className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors duration-200 mb-1.5">
                  {post.title}
                </h2>
                <p className="text-[11px] leading-relaxed tracking-wide text-stone-400 dark:text-stone-500 transition-colors duration-300">
                  {post.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-24 text-center animate-fade-up-delay-2">
          <p className="text-[9px] tracking-[0.4em] uppercase text-stone-300 dark:text-stone-700">
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
